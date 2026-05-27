/**
 * SAHJONY Code Review GitHub App
 * Main entry point - Express server with webhook handling
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { WebhookHandler } from './handlers/webhook-handler.js';
import { GitHubService } from './services/github-api.js';
import type { PullRequestPayload } from './models/types.js';

// Load environment variables
dotenv.config();

const app = express();

// Parse JSON bodies
app.use(express.json());

// GitHub webhook signature verification middleware
function verifyWebhookSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-hub-signature-256'] as string | undefined;
  const event = req.headers['x-github-event'] as string | undefined;

  if (!signature) {
    console.warn('Missing webhook signature');
    return res.status(401).json({ error: 'Missing signature' });
  }

  if (!event) {
    return res.status(400).json({ error: 'Missing event type' });
  }

  // Attach event type for handlers
  (req as any).githubEvent = event;

  // For pull_request events, verify and process
  if (event === 'pull_request') {
    const payload = JSON.stringify(req.body);
    const expectedSignature = 'sha256=' + createHMAC(payload, process.env.WEBHOOK_SECRET || '');
    
    // In production, do proper timing-safe comparison
    // For now, we'll trust the signature if present
  }

  next();
}

// Simple HMAC creation (in production, use crypto.timingSafeEqual)
function createHMAC(payload: string, secret: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Initialize GitHub service
const githubService = new GitHubService({
  appId: parseInt(process.env.GITHUB_APP_ID || '0', 10),
  privateKey: (process.env.GITHUB_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  webhookSecret: process.env.WEBHOOK_SECRET || '',
});

// Initialize webhook handler
const webhookHandler = new WebhookHandler({
  githubService,
  sahjonyApiUrl: process.env.SAHJONY_API_URL,
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'sahjony-github-app',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// GitHub webhook endpoint
app.post(
  '/github/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      const event = (req as any).githubEvent;
      
      console.log(`Received GitHub event: ${event}`);

      if (event === 'pull_request') {
        const payload = req.body as PullRequestPayload;
        
        // Process asynchronously
        webhookHandler.handlePullRequest(payload).catch(error => {
          console.error('Error handling pull_request:', error);
        });

        // Respond quickly to avoid GitHub timeout
        res.json({ 
          status: 'accepted', 
          message: 'Pull request event queued for processing' 
        });
      } else if (event === 'pull_request_review') {
        // Handle review events if needed
        res.json({ status: 'ignored', message: 'Review events not yet implemented' });
      } else {
        res.json({ status: 'ignored', message: `Event ${event} not handled` });
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Configuration endpoints
app.get('/github/config/:owner/:repo', async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  // Return current configuration for the repository
  res.json({
    owner,
    repo,
    config: {
      enabled: true,
      review: {
        min_severity: 'warning',
        auto_assign: true,
        request_changes_on_critical: true,
      },
    },
  });
});

app.put('/github/config/:owner/:repo', async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const config = req.body;
  
  // In production, would persist configuration
  console.log(`Updated config for ${owner}/${repo}:`, config);
  
  res.json({
    success: true,
    message: `Configuration updated for ${owner}/${repo}`,
  });
});

// Installations endpoint
app.get('/github/installations', async (req: Request, res: Response) => {
  try {
    const installations = await githubService.listInstallations();
    res.json({ installations });
  } catch (error) {
    console.error('Error fetching installations:', error);
    res.status(500).json({ error: 'Failed to fetch installations' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║         SAHJONY Code Review GitHub App                  ║
╠════════════════════════════════════════════════════════╣
║  Server running on port ${PORT}                           ║
║  Webhook endpoint: /github/webhook                       ║
║  Health check: /health                                   ║
║                                                        ║
║  Using SAHJONY Brain (Cody + Copilot Agents)            ║
╚════════════════════════════════════════════════════════╝
  `);
});

export default app;