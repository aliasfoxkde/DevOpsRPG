# Deployment Guide - DevOpsQuest

**Last Updated**: 2026-06-22

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Lint code
npm run lint
```

---

## Cloudflare Pages Deployment

### Prerequisites
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account configured

### Deploy

```bash
# Build and deploy to Cloudflare Pages
npm run deploy
```

This runs:
1. `npm run build:cloudflare` - builds the ViteJS app
2. `npx wrangler pages deploy dist` - deploys to Cloudflare

---

## Environment Variables

Create `.dev.vars` for local development:

```bash
# Cloudflare credentials
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# OAuth (if using auth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

---

## Project Structure

```
devopsquest/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── data/           # Static JSON data
│   ├── hooks/          # Custom React hooks
│   └── contexts/       # React contexts
├── public/             # Static assets
├── scripts/            # Build scripts
├── docs/               # Documentation
└── tests/             # Test files
```
