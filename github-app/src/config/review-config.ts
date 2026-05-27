/**
 * Repository configuration management
 * Handles loading and parsing .sahjony-review.yml files
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';
import type { RepositoryConfig } from '../models/types.js';

const ConfigSchema = z.object({
  enabled: z.boolean().default(true),
  review: z.object({
    min_severity: z.enum(['error', 'warning', 'info']).default('warning'),
    auto_assign: z.boolean().default(true),
    request_changes_on_critical: z.boolean().default(true),
  }).default({}),
  ignore: z.array(z.string()).default([]),
  reviewers: z.object({
    users: z.array(z.string()).default([]),
    teams: z.array(z.string()).default([]),
  }).default({}),
  ai: z.object({
    provider: z.enum(['anthropic', 'openai', 'google']).default('anthropic'),
    model: z.string().default('claude-3-5-sonnet-20241022'),
  }).default({}),
});

export class ConfigManager {
  private cache: Map<string, RepositoryConfig> = new Map();
  private configFiles: Map<string, string> = new Map();

  /**
   * Load configuration from .sahjony-review.yml file
   */
  async loadConfig(repoPath: string): Promise<RepositoryConfig> {
    const cached = this.cache.get(repoPath);
    if (cached) {
      return cached;
    }

    try {
      const configPath = path.join(repoPath, '.sahjony-review.yml');
      const content = fs.readFileSync(configPath, 'utf8');
      const rawConfig = yaml.load(content) as Record<string, unknown>;
      
      const config = ConfigSchema.parse(rawConfig);
      this.cache.set(repoPath, config);
      return config;
    } catch (error) {
      // Return default config if file doesn't exist or is invalid
      const defaultConfig = this.getDefaultConfig();
      return defaultConfig;
    }
  }

  /**
   * Load configuration from raw YAML content
   */
  loadConfigFromContent(content: string): RepositoryConfig {
    try {
      const rawConfig = yaml.load(content) as Record<string, unknown>;
      return ConfigSchema.parse(rawConfig);
    } catch (error) {
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): RepositoryConfig {
    return {
      enabled: true,
      review: {
        min_severity: 'warning',
        auto_assign: true,
        request_changes_on_critical: true,
      },
      ignore: [
        '*.test.ts',
        '*.spec.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '*.min.js',
      ],
      reviewers: {
        users: [],
        teams: [],
      },
      ai: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
      },
    };
  }

  /**
   * Check if a file should be ignored based on patterns
   */
  shouldIgnoreFile(filename: string, patterns: string[]): boolean {
    for (const pattern of patterns) {
      if (this.matchIgnorePattern(filename, pattern)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Match file against ignore pattern
   */
  private matchIgnorePattern(filename: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\//g, '\\/')
      .replace(/\\*\\*/g, '.*')
      .replace(/\//g, '\\/')
      .replace(/\b/g, '(?:^|/)')
      .replace(/\//g, '(?:/|$)')
      .replace(/\b/g, '(?:^|/|$)');
    
    try {
      const regex = new RegExp('^' + regexPattern + '$');
      return regex.test(filename);
    } catch {
      return false;
    }
  }

  /**
   * Clear cached configuration for a repository
   */
  clearCache(repoPath: string): void {
    this.cache.delete(repoPath);
  }

  /**
   * Clear all cached configurations
   */
  clearAllCache(): void {
    this.cache.clear();
  }
}

export const configManager = new ConfigManager();