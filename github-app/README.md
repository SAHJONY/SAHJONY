# SAHJONY Code Review GitHub App

A powerful GitHub App that uses SAHJONY's Cody/Copilot agents for automated code review on pull requests.

## Features

- 🤖 **AI-Powered Reviews**: Uses SAHJONY's multi-agent brain (Cody + Copilot agents) for intelligent code analysis
- 🔍 **Comprehensive Analysis**: Detects bugs, security issues, performance problems, and best practice violations
- 💬 **Inline Comments**: Posts review comments directly on code lines
- ✅ **Approval/Request Changes**: Can approve PRs or request changes based on severity
- ⚡ **Real-time Processing**: Handles PR events as they happen with async processing
- 🎛️ **Configurable**: Per-repository configuration for review behavior

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Webhook                          │
│                   pull_request event                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   GitHub App Server                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Webhook    │  │   GitHub    │  │   SAHJONY Brain     │ │
│  │  Handler    │──│   API       │──│   (Cody/Copilot)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │                                     │             │
│         └─────────────────────────────────────┘             │
│                    POST Review Comment                       │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### Option 1: Manual Setup

1. Go to GitHub Settings > Developer settings > GitHub Apps
2. Click "New GitHub App"
3. Fill in the details:
   - **Name**: SAHJONY Code Review
   - **Homepage URL**: https://sahjony.ai
   - **Webhook URL**: Your server URL (e.g., `https://api.sahjony.ai/github/webhook`)
   - **Webhook Secret**: Generate a secure random string
4. Set permissions:
   - **Pull requests**: Read & Write
   - **Contents**: Read
   - **Metadata**: Read
5. Subscribe to events:
   - `pull_request`
   - `pull_request_review`
6. Create and install the app on your repositories

### Option 2: Using the Manifest

Use the `app-manifest.json` file to create the app programmatically.

## Configuration

Create a `.sahjony-review.yml` file in the repository root:

```yaml
# Enable/disable code review
enabled: true

# Review behavior
review:
  # Minimum severity to comment on
  min_severity: "warning"  # error, warning, info
  
  # Auto-assign reviewers based on expertise
  auto_assign: true
  
  # Request changes on critical issues
  request_changes_on_critical: true

# File patterns to ignore
ignore:
  - "*.test.ts"
  - "*.spec.ts"
  - "**/node_modules/**"
  - "**/dist/**"

# Reviewers to tag
reviewers:
  # Add specific users as reviewers
  users: []
  # Add teams as reviewers
  teams: []

# AI model settings
ai:
  provider: "anthropic"  # anthropic, openai, google
  model: "claude-3-5-sonnet-20241022"
```

## Development

### Prerequisites

- Node.js 18+
- ngrok (for local webhook testing)
- GitHub account with organization/admin permissions

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials:
# - WEBHOOK_SECRET
# - GitHub App credentials
# - SAHJONY API URL

# Run in development mode
npm run dev

# Expose local server to internet
ngrok http 3000
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Simulate webhook locally
npm run test:webhook
```

## API Endpoints

### Webhook Handler

`POST /github/webhook` - Receives GitHub webhook events

### Configuration

`GET /github/config/:owner/:repo` - Get repository configuration

`PUT /github/config/:owner/:repo` - Update repository configuration

### Health Check

`GET /health` - Server health status

## License

MIT