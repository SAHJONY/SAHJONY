/**
 * GitHub API service
 * Handles authentication, API requests, and webhook verification
 */

import { Octokit } from '@octokit/rest';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { 
  GitHubRepository, 
  GitHubFile, 
  InstallationToken,
  PullRequestPayload 
} from '../models/types.js';

export class GitHubService {
  private appId: number;
  private privateKey: string;
  private webhookSecret: string;

  constructor(config: {
    appId: number;
    privateKey: string;
    webhookSecret: string;
  }) {
    this.appId = config.appId;
    this.privateKey = config.privateKey;
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    const receivedSignature = signature.replace('sha256=', '');
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  }

  /**
   * Generate installation access token
   */
  async getInstallationToken(installationId: number): Promise<string> {
    const jwt = this.generateJWT();
    
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get installation token: ${response.statusText}`);
    }

    const data = await response.json() as InstallationToken;
    return data.token;
  }

  /**
   * Generate JWT for GitHub App authentication
   */
  private generateJWT(): string {
    const header = Buffer.from(JSON.stringify({
      alg: 'RS256',
      typ: 'JWT',
    })).toString('base64url');

    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({
      iat: now,
      exp: now + 600, // 10 minutes
      iss: this.appId,
    })).toString('base64url');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${header}.${payload}`);
    const privateKeyContents = this.privateKey.replace(/\\n/g, '\n');
    const signature = sign.sign(privateKeyContents, 'base64url');

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Create Octokit instance for an installation
   */
  async createInstallationClient(installationId: number): Promise<Octokit> {
    const token = await this.getInstallationToken(installationId);
    
    return new Octokit({
      auth: token,
      userAgent: 'sahjony-code-review v1.0',
    });
  }

  /**
   * Get changed files for a pull request
   */
  async getPullRequestFiles(
    owner: string,
    repo: string,
    prNumber: number,
    installationId: number
  ): Promise<GitHubFile[]> {
    const client = await this.createInstallationClient(installationId);
    
    const response = await client.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    return response.data.map(file => ({
      filename: file.filename,
      status: file.status as GitHubFile['status'],
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch ?? null,
      contents_url: file.contents_url,
      raw_url: file.raw_url,
      blob_url: file.blob_url,
    }));
  }

  /**
   * Get pull request details
   */
  async getPullRequest(
    owner: string,
    repo: string,
    prNumber: number,
    installationId: number
  ): Promise<any> {
    const client = await this.createInstallationClient(installationId);
    
    const response = await client.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    return response.data;
  }

  /**
   * Post a review comment on a pull request
   */
  async postReviewComment(
    owner: string,
    repo: string,
    prNumber: number,
    commitId: string,
    body: string,
    event: 'COMMENT' | 'APPROVE' | 'REQUEST_CHANGES',
    installationId: number
  ): Promise<any> {
    const client = await this.createInstallationClient(installationId);
    
    const response = await client.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      commit_id: commitId,
      body,
      event,
    });

    return response.data;
  }

  /**
   * Post inline comments on specific lines
   */
  async postInlineComments(
    owner: string,
    repo: string,
    prNumber: number,
    commitId: string,
    body: string,
    comments: Array<{
      path: string;
      line: number;
      body: string;
      start_line?: number;
    }>,
    installationId: number
  ): Promise<any> {
    const client = await this.createInstallationClient(installationId);
    
    const response = await client.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      commit_id: commitId,
      body,
      event: 'COMMENT',
      comments: comments.map(c => ({
        path: c.path,
        line: c.line,
        body: c.body,
        start_line: c.start_line,
        side: 'RIGHT' as const,
      })),
    });

    return response.data;
  }

  /**
   * Get file content from a repository
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref: string,
    installationId: number
  ): Promise<string | null> {
    const client = await this.createInstallationClient(installationId);
    
    try {
      const response = await client.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if (Array.isArray(response.data)) {
        return null;
      }

      const content = (response.data as any).content;
      if (!content) return null;
      
      return Buffer.from(content, 'base64').toString('utf8');
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List installations for the app
   */
  async listInstallations(): Promise<Array<{ id: number; account: any }>> {
    const jwt = this.generateJWT();
    
    const response = await fetch('https://api.github.com/app/installations', {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list installations: ${response.statusText}`);
    }

    const data = await response.json() as Array<{ id: number; account: any }>;
    return data;
  }
}