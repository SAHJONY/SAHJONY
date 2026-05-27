/**
 * SAHJONY Code Review Agent
 * Uses Cody/Copilot-style analysis for automated code review
 */

import type { 
  GitHubFile, 
  CodeReviewResult, 
  ReviewComment,
  ReviewSeverity,
  RepositoryConfig 
} from '../models/types.js';

interface ReviewContext {
  owner: string;
  repo: string;
  prNumber: number;
  prTitle: string;
  prBody: string;
  baseBranch: string;
  headBranch: string;
  changedFiles: GitHubFile[];
  config: RepositoryConfig;
}

interface AnalysisPattern {
  pattern: RegExp;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule: string;
}

/**
 * Cody-style code analysis patterns
 */
const CODE_ANALYSIS_PATTERNS: AnalysisPattern[] = [
  {
    pattern: /console\/(log|debug|info)/gi,
    severity: 'warning',
    message: 'Console statement found. Remove debugging code before merging.',
    rule: 'no-console',
  },
  {
    pattern: /TODO|FIXME|HACK|XXX|BUG/gi,
    severity: 'info',
    message: 'TODO/FIXME comment found. Consider addressing before merging.',
    rule: 'no-unresolved-todos',
  },
  {
    pattern: /\bvar\b/gi,
    severity: 'info',
    message: 'Use of "var" keyword. Prefer "const" or "let" for better scoping.',
    rule: 'prefer-const-let',
  },
  {
    pattern: /==(?!=)|!=(?!=)/gi,
    severity: 'warning',
    message: 'Loose equality comparison. Use === or !== for type safety.',
    rule: 'eqeqeq',
  },
  {
    pattern: /new Array\//gi,
    severity: 'info',
    message: 'Consider using array literal syntax for clarity.',
    rule: 'prefer-literal',
  },
  {
    pattern: /new Object\//gi,
    severity: 'info',
    message: 'Consider using object literal syntax for clarity.',
    rule: 'prefer-literal',
  },
  {
    pattern: /\beval\//gi,
    severity: 'error',
    message: 'Use of eval() is a security risk. Avoid if possible.',
    rule: 'no-eval',
  },
  {
    pattern: /innerHTML\//gi,
    severity: 'warning',
    message: 'Direct innerHTML assignment can lead to XSS vulnerabilities. Use textContent or sanitize.',
    rule: 'no-innerhtml',
  },
  {
    pattern: /document\/(write|writeln)/gi,
    severity: 'error',
    message: 'document.write() can lead to security issues and is deprecated.',
    rule: 'no-document-write',
  },
  {
    pattern: /password|secret|api[_-]?key|token/gi,
    severity: 'error',
    message: 'Potential hardcoded credential detected. Use environment variables instead.',
    rule: 'no-hardcoded-credentials',
  },
];

/**
 * Security vulnerability patterns (high severity)
 */
const SECURITY_PATTERNS: AnalysisPattern[] = [
  {
    pattern: /child_process\/(exec|spawn|sync)/gi,
    severity: 'error',
    message: 'Shell command injection risk. Sanitize all user inputs if command execution is needed.',
    rule: 'shell-injection',
  },
  {
    pattern: /exec\//gi,
    severity: 'error',
    message: 'Command execution found. Ensure inputs are properly sanitized.',
    rule: 'command-injection',
  },
  {
    pattern: /spawn\//gi,
    severity: 'error',
    message: 'Process spawning found. Ensure inputs are properly sanitized.',
    rule: 'spawn-injection',
  },
  {
    pattern: /dangerouslySetInnerHTML/gi,
    severity: 'error',
    message: 'Dangerously set innerHTML detected. Ensure content is sanitized.',
    rule: 'react-dangerously-set-innerhtml',
  },
  {
    pattern: /parseInt\//gi,
    severity: 'info',
    message: 'Type coercion detected. Ensure radix parameter is provided for parseInt.',
    rule: 'radix-parsing',
  },
  {
    pattern: /localhost|127\\.0\\.0\\.1/gi,
    severity: 'info',
    message: 'Localhost reference found. Ensure production URLs are properly configured.',
    rule: 'no-localhost-production',
  },
];

/**
 * Performance anti-patterns
 */
const PERFORMANCE_PATTERNS: AnalysisPattern[] = [
  {
    pattern: /JSON\/(parse|stringify)/gi,
    severity: 'info',
    message: 'JSON operations found. Consider if the data size could cause performance issues.',
    rule: 'json-performance',
  },
];

/**
 * TypeScript-specific patterns
 */
const TYPESCRIPT_PATTERNS: AnalysisPattern[] = [
  {
    pattern: /:\u005C?s*any/gi,
    severity: 'info',
    message: 'Use of "any" type detected. Consider using a more specific type for better type safety.',
    rule: 'no-any-type',
  },
  {
    pattern: /@ts-ignore|@ts-expect-error/gi,
    severity: 'info',
    message: 'TypeScript suppress comment found. Address the underlying type issue if possible.',
    rule: 'no-typescript-suppressions',
  },
  {
    pattern: /\bas\u005C?s+any/gi,
    severity: 'info',
    message: 'Type assertion to "any" found. This bypasses type checking.',
    rule: 'no-as-any',
  },
];

/**
 * Python-specific patterns
 */
const PYTHON_PATTERNS: AnalysisPattern[] = [
  {
    pattern: /print\(/gi,
    severity: 'info',
    message: 'Print statement found. Consider using logging module for production code.',
    rule: 'no-print-statement',
  },
  {
    pattern: /except\s*:/gi,
    severity: 'warning',
    message: 'Bare except clause found. Catch specific exceptions instead.',
    rule: 'bare-except',
  },
  {
    pattern: /os\.(system|popen)/gi,
    severity: 'error',
    message: 'Shell command execution detected. Ensure inputs are sanitized.',
    rule: 'no-shell-execution',
  },
];

/**
 * Java/Kotlin-specific patterns
 */
const JAVA_PATTERNS: AnalysisPattern[] = [
  {
    pattern: /System\u005C.(out|err)\u005C.(print|println)/gi,
    severity: 'info',
    message: 'System.out found. Consider using a logging framework.',
    rule: 'no-system-out',
  },
  {
    pattern: /catch\u005C?s\u005C*\u005C?s*Exception/gi,
    severity: 'warning',
    message: 'Catching generic Exception. Catch specific exception types instead.',
    rule: 'catch-generic-exception',
  },
];

/**
 * Main Code Review Agent
 */
export class SahjonyReviewAgent {
  private context: ReviewContext;

  constructor(context: ReviewContext) {
    this.context = context;
  }

  /**
   * Perform comprehensive code review on all changed files
   */
  async performReview(): Promise<CodeReviewResult> {
    const comments: ReviewComment[] = [];
    const severityCounts = { errors: 0, warnings: 0, info: 0 };
    
    // Analyze each changed file
    for (const file of this.context.changedFiles) {
      // Skip ignored files
      if (this.context.config.ignore.some(pattern => this.matchesPattern(file.filename, pattern))) {
        continue;
      }

      // Skip binary files
      if (!file.patch) continue;

      // Analyze file and add comments
      const fileComments = this.analyzeFile(file);
      comments.push(...fileComments);

      // Update severity counts
      for (const comment of fileComments) {
        const severity = this.categorizeSeverity(comment.body);
        if (severity === 'error') severityCounts.errors++;
        else if (severity === 'warning') severityCounts.warnings++;
        else severityCounts.info++;
      }
    }

    // Generate summary
    const summary = this.generateSummary(severityCounts, comments.length);

    // Determine if we should auto-approve or request changes
    const canAutoApprove = severityCounts.errors === 0 && severityCounts.warnings < 3;
    const shouldRequestChanges = severityCounts.errors > 0 && this.context.config.review.request_changes_on_critical;

    return {
      pr_number: this.context.prNumber,
      repository: `${this.context.owner}/${this.context.repo}`,
      review_type: shouldRequestChanges ? 'request_changes' : (canAutoApprove ? 'approval' : 'inline'),
      comments,
      summary,
      severity_counts: severityCounts,
      can_auto_approve: canAutoApprove,
      should_request_changes: shouldRequestChanges,
    };
  }

  /**
   * Analyze a single file for issues
   */
  private analyzeFile(file: GitHubFile): ReviewComment[] {
    const comments: ReviewComment[] = [];
    const patch = file.patch || '';
    const lines = patch.split('\n');

    // Select patterns based on file type
    const patterns = this.getPatternsForFile(file.filename);

    for (const lineData of lines) {
      // Skip diff headers
      if (lineData.startsWith('@@') || lineData.startsWith('diff ') || lineData.startsWith('index ')) {
        continue;
      }

      // Extract line content (handle unified diff format)
      const lineContent = lineData.startsWith('+') || lineData.startsWith('-') 
        ? lineData.substring(1) 
        : lineData;
      
      const lineNumber = this.extractLineNumber(lineData);
      const isAdded = lineData.startsWith('+');
      const isRemoved = lineData.startsWith('-');

      // Skip context lines and removed lines for most checks
      if (!isAdded) continue;

      // Check against patterns
      for (const patternSet of patterns) {
        for (const pattern of patternSet) {
          if (pattern.pattern.test(lineContent)) {
            comments.push({
              path: file.filename,
              line: lineNumber,
              body: this.formatComment(pattern.message, pattern.rule, pattern.severity),
            });
          }
        }
      }
    }

    // Check for sensitive data exposure
    comments.push(...this.checkForSensitiveData(file, patch));

    // Check for code complexity (basic)
    comments.push(...this.checkComplexity(file, patch));

    return comments;
  }

  /**
   * Get appropriate patterns based on file type
   */
  private getPatternsForFile(filename: string): AnalysisPattern[][] {
    const patterns: AnalysisPattern[][] = [CODE_ANALYSIS_PATTERNS];

    if (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.js') || filename.endsWith('.jsx')) {
      patterns.push(TYPESCRIPT_PATTERNS);
    }

    if (filename.endsWith('.py')) {
      patterns.push(PYTHON_PATTERNS);
    }

    if (filename.endsWith('.java') || filename.endsWith('.kt')) {
      patterns.push(JAVA_PATTERNS);
    }

    // Add security patterns for all file types
    patterns.push(SECURITY_PATTERNS);
    patterns.push(PERFORMANCE_PATTERNS);

    return patterns;
  }

  /**
   * Check for sensitive data exposure
   */
  private checkForSensitiveData(file: GitHubFile, patch: string): ReviewComment[] {
    const comments: ReviewComment[] = [];
    const sensitivePatterns: { pattern: RegExp; msg: string }[] = [
      { pattern: /password\u005C?s*\u005C=\u005C?s*['"][^'"]+['"]/gi, msg: 'Hardcoded password detected' },
      { pattern: /api[_-]?key\u005C?s*\u005C=\u005C?s*['"][A-Za-z0-9]{20,}['"]/gi, msg: 'Potential API key detected' },
      { pattern: /secret\u005C?s*\u005C=\u005C?s*['"][^'"]+['"]/gi, msg: 'Hardcoded secret detected' },
      { pattern: /token\u005C?s*\u005C=\u005C?s*['"][A-Za-z0-9_-]{20,}['"]/gi, msg: 'Potential token detected' },
      { pattern: /aws[_-]?access[_-]?key/gi, msg: 'AWS access key reference detected' },
      { pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/gi, msg: 'Private key in code detected' },
    ];

    const lines = patch.split('\n');
    for (const lineData of lines) {
      if (!lineData.startsWith('+')) continue;
      const lineContent = lineData.substring(1);
      const lineNumber = this.extractLineNumber(lineData);

      for (const { pattern, msg } of sensitivePatterns) {
        if (pattern.test(lineContent)) {
          comments.push({
            path: file.filename,
            line: lineNumber,
            body: this.formatComment(`🚨 ${msg}. Use environment variables or secrets management.`, 'secrets-detection', 'error'),
          });
        }
      }
    }

    return comments;
  }

  /**
   * Basic complexity check
   */
  private checkComplexity(file: GitHubFile, patch: string): ReviewComment[] {
    const comments: ReviewComment[] = [];
    
    // Check for very long lines (> 200 characters)
    const lines = patch.split('\n');
    for (const lineData of lines) {
      if (!lineData.startsWith('+')) continue;
      const lineContent = lineData.substring(1);
      const lineNumber = this.extractLineNumber(lineData);
      
      if (lineContent.length > 200) {
        comments.push({
          path: file.filename,
          line: lineNumber,
          body: this.formatComment(`Line exceeds 200 characters (${lineContent.length} chars). Consider breaking this line.`, 'max-line-length', 'info'),
        });
      }
    }

    return comments;
  }

  /**
   * Extract line number from unified diff format
   */
  private extractLineNumber(lineData: string): number {
    // Parse @@ -start,count +start,count @@ format to extract line number
    const match = lineData.match(/@@\u005C?s*-\u005C?d+\u005C?,\u005C?d+\u005C?s+\u005C?(\u005C?d+\u005C?)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    // Fallback: return 0 for now
    return 0;
  }

  /**
   * Check if filename matches ignore pattern
   */
  private matchesPattern(filename: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\//g, '\\/')
      .replace(/__/g, '.*')
      .replace(/_/g, '[^/]')
      .replace(/\u005C*/g, '.*')
      .replace(/\u005C?/g, '.');
    
    try {
      return new RegExp(regexPattern).test(filename);
    } catch {
      return false;
    }
  }

  /**
   * Categorize severity based on comment content
   */
  private categorizeSeverity(commentBody: string): 'error' | 'warning' | 'info' {
    if (commentBody.includes('🚨') || commentBody.includes('error')) return 'error';
    if (commentBody.includes('⚠️') || commentBody.includes('warning')) return 'warning';
    return 'info';
  }

  /**
   * Format review comment
   */
  private formatComment(message: string, rule: string, severity: ReviewSeverity['level']): string {
    const emoji = severity === 'error' ? '🚨' : severity === 'warning' ? '⚠️' : '💡';
    return `${emoji} **SAHJONY Code Review**\n\n${message}\n\n---\n*Rule: ${rule} | Powered by SAHJONY Cody Agent*`;
  }

  /**
   * Generate review summary
   */
  private generateSummary(severityCounts: { errors: number; warnings: number; info: number }, totalComments: number): string {
    const parts: string[] = [];

    if (severityCounts.errors > 0) {
      parts.push(`🚨 **${severityCounts.errors} critical issue(s)** found`);
    }
    if (severityCounts.warnings > 0) {
      parts.push(`⚠️ **${severityCounts.warnings} warning(s)** found`);
    }
    if (severityCounts.info > 0) {
      parts.push(`💡 **${severityCounts.info} suggestion(s)** for improvement`);
    }

    const summaryText = parts.length > 0 
      ? parts.join(', ') 
      : '✅ **No issues found** - code looks clean!';

    return `## 🤖 SAHJONY Code Review Summary\n\n${summaryText}\n\n**Files reviewed:** ${this.context.changedFiles.length}\n**Total comments:** ${totalComments}\n\n---\n*Reviewed by SAHJONY Cody Agent | Powered by Freebuff Multi-Agent Brain*`;
  }

  /**
   * Get Cody-style context analysis
   */
  async getCodyContext(): Promise<string> {
    return `
PR #${this.context.prNumber}: ${this.context.prTitle}

Base: ${this.context.baseBranch} <- Head: ${this.context.headBranch}

Changed Files (${this.context.changedFiles.length}):
${this.context.changedFiles.map(f => `- ${f.filename} (${f.additions}++, ${f.deletions}--)`).join('\n')}

Description:
${this.context.prBody || 'No description provided'}
    `.trim();
  }
}

/**
 * Factory function to create review agent
 */
export function createReviewAgent(context: ReviewContext): SahjonyReviewAgent {
  return new SahjonyReviewAgent(context);
}