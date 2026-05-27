/**
 * Type definitions for GitHub webhook payloads and SAHJONY review models
 */

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  description: string;
  private: boolean;
  html_url: string;
  default_branch: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  user: GitHubUser;
  base: {
    ref: string;
    sha: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  merged: boolean;
  mergeable: boolean | null;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface GitHubFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch: string | null;
  contents_url: string;
  raw_url: string;
  blob_url: string;
}

export interface PullRequestPayload {
  action: 'opened' | 'closed' | 'synchronize' | 'reopened' | 'edited' | 'ready_for_review' | 'locked';
  number: number;
  pull_request: GitHubPullRequest;
  repository: GitHubRepository;
  installation?: {
    id: number;
    node_id: string;
  };
}

export interface ReviewCommentPayload {
  action: 'created' | 'edited' | 'deleted';
  comment: {
    id: number;
    body: string;
    user: GitHubUser;
    commit_id: string;
    path: string;
    line: number | null;
    start_line: number | null;
    diff_hunk: string;
  };
  pull_request: GitHubPullRequest;
  repository: GitHubRepository;
  installation?: {
    id: number;
    node_id: string;
  };
}

export interface ReviewSeverity {
  level: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  file?: string;
  rule?: string;
}

export interface ReviewComment {
  path: string;
  line: number;
  body: string;
  start_line?: number;
}

export interface CodeReviewResult {
  pr_number: number;
  repository: string;
  review_type: 'inline' | 'summary' | 'approval' | 'request_changes';
  comments: ReviewComment[];
  summary: string;
  severity_counts: {
    errors: number;
    warnings: number;
    info: number;
  };
  can_auto_approve: boolean;
  should_request_changes: boolean;
}

export interface RepositoryConfig {
  enabled: boolean;
  review: {
    min_severity: 'error' | 'warning' | 'info';
    auto_assign: boolean;
    request_changes_on_critical: boolean;
  };
  ignore: string[];
  reviewers: {
    users: string[];
    teams: string[];
  };
  ai: {
    provider: 'anthropic' | 'openai' | 'google';
    model: string;
  };
}

export interface GitHubAppConfig {
  app_id: number;
  webhook_secret: string;
  private_key_path: string;
  installation_id?: number;
}

export interface ReviewRequest {
  files: GitHubFile[];
  context: {
    owner: string;
    repo: string;
    prNumber: number;
    prTitle: string;
    prBody: string;
    baseBranch: string;
    headBranch: string;
  };
  config: RepositoryConfig;
}

export interface InstallationToken {
  token: string;
  expires_at: string;
  permissions: {
    contents: 'read' | 'write';
    pull_requests: 'read' | 'write';
    metadata: 'read' | 'write';
  };
}