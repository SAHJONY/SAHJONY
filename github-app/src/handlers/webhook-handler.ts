/**
 * Webhook handler for GitHub events
 * Processes pull_request events and triggers code review
 */

import type { PullRequestPayload, GitHubFile } from '../models/types.js';
import { GitHubService } from '../services/github-api.js';
import { configManager } from '../config/review-config.js';
import { SahjonyReviewAgent, createReviewAgent } from '../agents/sahjony-review-agent.js';

export interface WebhookHandlerConfig {
  githubService: GitHubService;
  sahjonyApiUrl?: string;
}

export class WebhookHandler {
  private githubService: GitHubService;
  private sahjonyApiUrl?: string;

  constructor(config: WebhookHandlerConfig) {
    this.githubService = config.githubService;
    this.sahjonyApiUrl = config.sahjonyApiUrl;
  }

  /**
   * Handle pull request event
   */
  async handlePullRequest(payload: PullRequestPayload): Promise<void> {
    const { action, pull_request, repository, installation } = payload;

    // Only process certain actions
    const allowedActions = ['opened', 'synchronize', 'reopened', 'ready_for_review'];
    if (!allowedActions.includes(action)) {
      console.log(`Skipping PR #${pull_request.number} - action "${action}" not in allowed list`);
      return;
    }

    // Skip if PR is closed/merged
    if (pull_request.state === 'closed') {
      console.log(`Skipping PR #${pull_request.number} - already closed`);
      return;
    }

    if (!installation) {
      console.error('No installation context found');
      return;
    }

    console.log(`Processing PR #${pull_request.number}: "${pull_request.title}"`);

    try {
      // Load repository configuration
      const config = await configManager.loadConfig(repository.full_name);

      if (!config.enabled) {
        console.log(`Code review disabled for ${repository.full_name}`);
        return;
      }

      // Get changed files
      const changedFiles = await this.githubService.getPullRequestFiles(
        repository.owner.login,
        repository.name,
        pull_request.number,
        installation.id
      );

      if (changedFiles.length === 0) {
        console.log('No files changed in this PR');
        return;
      }

      // Create review context
      const reviewContext = {
        owner: repository.owner.login,
        repo: repository.name,
        prNumber: pull_request.number,
        prTitle: pull_request.title,
        prBody: pull_request.body || '',
        baseBranch: pull_request.base.ref,
        headBranch: pull_request.head.ref,
        changedFiles,
        config,
      };

      // Create and run review agent
      const agent = createReviewAgent(reviewContext);
      const result = await agent.performReview();

      // Post review to GitHub
      await this.postReview(result, pull_request, repository, installation.id);

      console.log(`Review completed for PR #${pull_request.number}: ${result.severity_counts.errors} errors, ${result.severity_counts.warnings} warnings, ${result.severity_counts.info} suggestions`);

    } catch (error) {
      console.error(`Error processing PR #${pull_request.number}:`, error);
      // In production, would want to retry or queue for later processing
      throw error;
    }
  }

  /**
   * Post review comment to GitHub
   */
  private async postReview(
    result: Awaited<ReturnType<SahjonyReviewAgent['performReview']>>,
    pullRequest: PullRequestPayload['pull_request'],
    repository: PullRequestPayload['repository'],
    installationId: number
  ): Promise<void> {
    const { review_type, summary, comments, severity_counts, can_auto_approve, should_request_changes } = result;

    // Determine review event
    let event: 'COMMENT' | 'APPROVE' | 'REQUEST_CHANGES';
    if (should_request_changes) {
      event = 'REQUEST_CHANGES';
    } else if (can_auto_approve && review_type === 'approval') {
      event = 'APPROVE';
    } else {
      event = 'COMMENT';
    }

    // Build review body
    const body = this.buildReviewBody(summary, severity_counts, comments.length);

    // Post as general review comment (without inline comments for simplicity)
    // In a full implementation, you'd parse the patch and add inline comments
    await this.githubService.postReviewComment(
      repository.owner.login,
      repository.name,
      pullRequest.number,
      pullRequest.head.sha,
      body,
      event,
      installationId
    );

    // If there are inline comments, post them separately
    if (comments.length > 0) {
      const inlineComments = this.prepareInlineComments(comments);
      
      if (inlineComments.length > 0) {
        await this.githubService.postInlineComments(
          repository.owner.login,
          repository.name,
          pullRequest.number,
          pullRequest.head.sha,
          '## 📝 Inline Comments\n\nSee individual comments below.',
          inlineComments.slice(0, 50), // GitHub limits review comments
          installationId
        );
      }
    }
  }

  /**
   * Build review body text
   */
  private buildReviewBody(
    summary: string,
    severityCounts: { errors: number; warnings: number; info: number },
    totalComments: number
  ): string {
    const parts: string[] = [];

    if (severityCounts.errors > 0) {
      parts.push(`- 🚨 ${severityCounts.errors} critical issue(s)`);
    }
    if (severityCounts.warnings > 0) {
      parts.push(`- ⚠️ ${severityCounts.warnings} warning(s)`);
    }
    if (severityCounts.info > 0) {
      parts.push(`- 💡 ${severityCounts.info} suggestion(s)`);
    }

    const statsSection = parts.length > 0
      ? `### 📊 Review Statistics\n\n${parts.join('\n')}\n\n---\n`
      : '';

    return `${summary}\n\n${statsSection}### 📋 Details\n\n- Total inline comments: ${totalComments}\n- Review type: Automated (SAHJONY Cody/Copilot Agent)\n\n---\n*This review was automatically generated by [SAHJONY](https://sahjony.ai) Code Review Bot*`;
  }

  /**
   * Prepare inline comments for posting
   */
  private prepareInlineComments(comments: Array<{ path: string; line: number; body: string }>): Array<{
    path: string;
    line: number;
    body: string;
  }> {
    return comments
      .filter(c => c.line > 0) // Filter out comments without line numbers
      .map(c => ({
        path: c.path,
        line: c.line,
        body: c.body,
      }));
  }
}

/**
 * Verify webhook signature and parse payload
 */
export function verifyAndParsePayload(
  payload: string,
  signature: string | null,
  secret: string
): { valid: boolean; payload?: PullRequestPayload; error?: string } {
  if (!signature) {
    return { valid: false, error: 'Missing signature' };
  }

  // In a real implementation, verify HMAC signature here
  // For now, assume valid if signature is present
  
  try {
    const data = JSON.parse(payload) as PullRequestPayload;
    return { valid: true, payload: data };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON payload' };
  }
}