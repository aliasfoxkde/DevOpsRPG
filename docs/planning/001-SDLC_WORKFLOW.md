# DevOpsRPG - SDLC & Workflow Documentation

**Last Updated**: 2026-06-27

---

## 🔄 Development Lifecycle

### 1. Branches

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production code | Requires PR + review |
| `stable` | Integration branch | PR from feature branches |

### 2. Feature Branch Workflow

```bash
# Start from stable (or main if no stable)
git checkout stable
git pull

# Create feature branch
git checkout -b feature/description

# Work... commit... work...
git add .
git commit -m "feat: description"

# Push
git push -u origin feature/description

# Create PR → Merge to stable → PR to main
```

### 3. Commit Conventions

Based on Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**
```bash
git commit -m "feat(quiz): add 'n' key for quick progression"
git commit -m "fix(leaderboard): correct XP calculation"
git commit -m "docs(readme): update deployment instructions"
git commit -m "refactor(game): split large context into smaller pieces"
```

---

## 🪝 Pre-Commit Hooks

The project uses pre-commit hooks defined in `.git/hooks/`.

### Current Hooks
- **No explicit pre-commit hook file** - needs to be added
- Git operations are manually reviewed

### Recommended Hooks (TODO)
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for versioned files (anti-pattern)
if git diff --cached --name-only | grep -E "(_v[0-9]|_new|_backup|_old)" | grep -v ".md"; then
    echo "Error: Versioned filenames detected"
    exit 1
fi

# Run TypeScript check
npx tsc --noEmit || exit 1

# Run linting
npx eslint src/ || exit 1

# Run tests
npx vitest run || exit 1
```

---

## ⚙️ CI/CD Pipeline

### Current Pipeline (Cloudflare Pages)
```yaml
# Manual deploy via wrangler
npx wrangler pages deploy dist --project-name=devopsquest
```

### Recommended GitHub Actions (TODO)
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## 🚀 Deployment Process

### Manual Deployment

```bash
# 1. Ensure on main with clean working tree
git checkout main
git pull

# 2. Build
npm run build

# 3. Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=devopsquest

# 4. Note the deployment URL
```

### Cloudflare Pages Setup
1. Go to https://pages.cloudflare.com
2. Create project → Connect to GitHub
3. Set build command: `npm run build:cloudflare`
4. Set output directory: `dist`
5. Configure environment variables if needed

### Preview Deployments
Each PR can have a preview deployment via Cloudflare Pages:
- Navigate to PR in GitHub
- Cloudflare Pages bot will create preview URL
- Review before merging

---

## 📋 Merge & Release Process

### 1. Feature Complete
```bash
git checkout feature/my-feature
git push origin feature/my-feature
```

### 2. Create Pull Request
- Title: Clear description of changes
- Body: What, Why, How
- Reviewers: Assign reviewers
- Checks: Ensure CI passes

### 3. Review & Merge
- Reviewer approves
- Squash and merge to `stable` (or `main` for hotfixes)
- Delete feature branch

### 4. Deploy
```bash
git checkout main
git pull
npm run build
npx wrangler pages deploy dist --project-name=devopsquest
```

---

## 🧪 Testing Strategy

### Unit Tests
- **Framework**: Vitest
- **Location**: `*.test.ts` / `*.test.tsx` files
- **Coverage Target**: Critical utilities, hooks, data functions

### Component Tests
- **Framework**: React Testing Library
- **Location**: Co-located with components
- **Focus**: User interactions, accessibility

### E2E Tests (TODO)
- **Framework**: Playwright
- **Location**: `tests/e2e/`
- **Scenarios**: Critical user flows

### Test Commands
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## 🔒 Security Practices

### Pre-commit
- No committed secrets (API keys, passwords)
- Use ` secrets ` management (GitHub Actions)

### Code Review
- No direct pushes to `main`
- All changes via PR
- At least one reviewer for sensitive changes

### Dependencies
```bash
# Audit for vulnerabilities
npm audit

# Update dependencies safely
npm update
npx npm-check-updates
```

---

## 📊 Monitoring & Feedback

### Deployment URLs
- Production: https://devopsquest.pages.dev (when set up)
- Preview: https://*.devopsquest.pages.dev (per commit)

### Debugging Production
1. Check Cloudflare Pages dashboard for logs
2. Enable `devtools` in Wrangler for edge functions
3. Use `wrangler tail` for real-time logs

---

## 🔄 Rollback Process

### Quick Rollback
```bash
# List recent deployments
npx wrangler pages deployment list --project-name=devopsquest

# Rollback to specific deployment
npx wrangler pages rollback <deployment-id> --project-name=devopsquest
```

### Git Rollback
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to previous commit (careful!)
git reset --hard HEAD~1
git push --force origin main
```

---

## 📝 Checklist Before Merging

- [ ] Code follows project conventions
- [ ] TypeScript compiles without errors
- [ ] Tests pass locally
- [ ] No console.log or debug statements
- [ ] No hardcoded secrets
- [ ] PR description is clear
- [ ] Reviewer approved
- [ ] Documentation updated if needed
