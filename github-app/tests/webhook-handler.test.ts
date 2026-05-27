import { WebhookHandler } from '../src/handlers/webhook-handler';
import { GitHubAPI } from '../src/services/github-api';
import { ReviewConfig } from '../src/config/review-config';
import { GitHubWebhookEvent, PullRequestPayload, ReviewComment } from '../src/models/types';

// Mock dependencies
jest.mock('../src/services/github-api');
jest.mock('../src/config/review-config');

describe('WebhookHandler', () => {
  let handler: WebhookHandler;
  let mockGitHubAPI: jest.Mocked<GitHubAPI>;
  let mockConfig: jest.Mocked<typeof ReviewConfig>;

  beforeEach(() => {
    mockGitHubAPI = {
      getPullRequestFiles: jest.fn(),
      postReviewComment: jest.fn(),
      createReview: jest.fn(),
      getFileContent: jest.fn(),
    } as any;

    mockConfig = {
      default: {
        maxFilesPerReview: 50,
        maxCommentsPerFile: 20,
        commentStyle: 'block',
        autoMergeSuggestion: false,
        reviewSummary: true,
        fileFilters: {
          includeExtensions: ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs'],
          excludePaths: ['node_modules', '.git', 'dist', 'build', '__pycache__'],
          excludeFileNames: ['package-lock.json', 'yarn.lock', 'Cargo.lock'],
        },
        reviewPriorities: {
          security: true,
          performance: true,
          bestPractices: true,
          codeStyle: false,
          documentation: false,
        },
        responseConfig: {
          tone: 'professional',
          includeCodeExamples: true,
          maxSuggestionsPerComment: 3,
        },
      },
    } as any;

    handler = new WebhookHandler(mockGitHubAPI, mockConfig.default);
  });

  describe('handlePullRequest', () => {
    it('should process opened PR events', async () => {
      const payload: PullRequestPayload = {
        action: 'opened',
        pull_request: {
          number: 123,
          title: 'Add new feature',
          body: 'This PR adds a new feature',
          user: { login: 'testuser' },
          base: { ref: 'main', repo: { full_name: 'owner/repo' } },
          head: { ref: 'feature-branch', repo: { full_name: 'owner/repo' } },
        },
        repository: {
          full_name: 'owner/repo',
          owner: { login: 'owner' },
        },
      };

      mockGitHubAPI.getPullRequestFiles.mockResolvedValue([
        { filename: 'src/index.ts', status: 'added', changes: 50 },
      ]);

      const result = await handler.handlePullRequest(payload);

      expect(result.processed).toBe(true);
      expect(result.prNumber).toBe(123);
    });

    it('should skip closed PRs', async () => {
      const payload: PullRequestPayload = {
        action: 'closed',
        pull_request: {
          number: 123,
          title: 'Closed PR',
          user: { login: 'testuser' },
          base: { ref: 'main', repo: { full_name: 'owner/repo' } },
          head: { ref: 'feature-branch', repo: { full_name: 'owner/repo' } },
        },
        repository: {
          full_name: 'owner/repo',
          owner: { login: 'owner' },
        },
      };

      const result = await handler.handlePullRequest(payload);

      expect(result.processed).toBe(false);
      expect(result.skipped).toBe(true);
    });

    it('should filter files based on config', async () => {
      const payload: PullRequestPayload = {
        action: 'synchronize',
        pull_request: {
          number: 124,
          title: 'Update dependencies',
          user: { login: 'testuser' },
          base: { ref: 'main', repo: { full_name: 'owner/repo' } },
          head: { ref: 'dep-update', repo: { full_name: 'owner/repo' } },
        },
        repository: {
          full_name: 'owner/repo',
          owner: { login: 'owner' },
        },
      };

      mockGitHubAPI.getPullRequestFiles.mockResolvedValue([
        { filename: 'package.json', status: 'modified', changes: 5 },
        { filename: 'node_modules/some-package/index.js', status: 'modified', changes: 100 },
      ]);

      const result = await handler.handlePullRequest(payload);

      // Should filter out node_modules files
      expect(result.filteredFiles).toBe(1);
    });
  });

  describe('handleReviewComment', () => {
    it('should process review comment events', async () => {
      const event: GitHubWebhookEvent = {
        action: 'created',
        comment: {
          id: 1,
          body: 'Please review this code',
          user: { login: 'reviewer' },
          pull_request_url: 'https://api.github.com/repos/owner/repo/pulls/123',
        },
        repository: {
          full_name: 'owner/repo',
          owner: { login: 'owner' },
        },
      } as any;

      const result = await handler.handleReviewComment(event);

      expect(result.processed).toBe(true);
    });
  });

  describe('analyzeCode', () => {
    it('should analyze code and return review comments', async () => {
      const code = `function add(a: number, b: number): number {
  return a + b;
}`;

      const comments = await handler.analyzeCode(code, 'test.ts');

      expect(comments).toBeInstanceOf(Array);
      expect(comments.length).toBeGreaterThan(0);
      expect(comments[0]).toHaveProperty('line');
      expect(comments[0]).toHaveProperty('content');
      expect(comments[0]).toHaveProperty('severity');
    });
  });
});

describe('ReviewConfig', () => {
  it('should validate extension filters', () => {
    const config = ReviewConfig.default;
    expect(config.fileFilters.includeExtensions).toContain('.ts');
  });

  it('should have all review priorities defined', () => {
    const config = ReviewConfig.default;
    expect(config.reviewPriorities).toHaveProperty('security');
    expect(config.reviewPriorities).toHaveProperty('performance');
    expect(config.reviewPriorities).toHaveProperty('bestPractices');
  });
});