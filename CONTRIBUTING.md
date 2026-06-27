# Contributing to DevOpsQuest

Thank you for your interest in contributing to DevOpsQuest! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/aliasfoxkde/DevOpsQuest.git
cd DevOpsRPG

# Install dependencies
npm ci

# Start development server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Branch Structure

```
main (production)
  └── stable (integration branch)
       ├── feature/description
       ├── fix/description
       ├── docs/description
       └── refactor/description
```

---

## Development Workflow

### 1. Create a Branch

```bash
# Start from stable (or main)
git checkout stable
git pull

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following our [Coding Standards](#coding-standards)
- Add/update tests as needed
- Run `npm run test` to ensure all tests pass
- Run `npm run lint` to check for linting errors

### 3. Commit Changes

Follow our [Commit Message Guidelines](#commit-messages):

```bash
git add .
git commit -m "feat(scope): description of changes"
```

### 4. Push and Create PR

```bash
# Push your branch
git push -u origin feature/your-feature-name

# Create Pull Request via GitHub
# - Fill in the PR template
# - Ensure CI passes
# - Request review
```

### 5. After Approval

- Squash and merge to `stable`
- Delete the feature branch
- Deploy to production

---

## Coding Standards

### TypeScript

- Use strict TypeScript (`strict: true`)
- Avoid `any` type - use proper typing
- Use interfaces for object shapes
- Use type guards for runtime checks

### React Components

- Use functional components with hooks
- Use named exports for components
- Co-locate tests with components (`Component.test.tsx`)
- Use `React.memo` for frequently re-rendering components

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts`
- Utilities: `camelCase.ts`
- Tests: `*.test.ts` or `*.test.tsx`

### CSS/Tailwind

- Use Tailwind utility classes
- Avoid inline styles unless dynamic
- Use `clsx` for conditional classes
- Follow color palette (slate for neutral, amber for primary)

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance |

### Examples

```bash
git commit -m "feat(quiz): add 'n' key for quick progression"
git commit -m "fix(battle): prevent quest re-completion on refresh"
git commit -m "docs(readme): update deployment instructions"
git commit -m "refactor(context): split GameContext into smaller contexts"
git commit -m "test(hooks): add tests for useKeyboardShortcuts"
```

---

## Pull Request Process

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Checklist
- [ ] Code follows project standards
- [ ] Tests pass locally
- [ ] Documentation updated (if needed)
```

### Requirements

- [ ] Code follows project conventions
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Tests pass locally (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] PR description is clear
- [ ] Reviewer approved

---

## Testing

### Test Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Writing Tests

- Unit tests for utility functions
- Component tests with React Testing Library
- Test user interactions, not implementation details
- Aim for meaningful assertions

### Test File Location

```
src/
├── components/
│   └── ui/
│       └── Component.test.tsx    # Co-located with component
├── hooks/
│   └── useHook.test.ts          # Co-located with hook
├── utils/
│   └── util.test.ts             # Co-located with util
└── pages/
    └── Page.test.tsx            # Co-located with page
```

---

## Deployment

### Manual Deployment

```bash
# Build
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

### Automatic Deployment

GitHub Actions handles deployment automatically:

- **Pull Requests**: Preview deployment to `*.devopsquest.pages.dev`
- **Main branch**: Production deployment

### Deployment Checklist

- [ ] All tests pass
- [ ] Build succeeds
- [ ] No console errors
- [ ] No hardcoded secrets

---

## 📞 Getting Help

- Open an issue for bugs
- Start a discussion for questions
- Join the community Discord (if available)

---

## 📝 License

By contributing, you agree that your contributions will be licensed under the same license as the project.
