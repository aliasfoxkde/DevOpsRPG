# Development Guide - DevOpsQuest

**Last Updated**: 2026-06-22

---

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd DevOpsRPG
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` (Vite default port).

### 3. Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| ViteJS | Build tool and dev server |
| React 19 | UI framework |
| Tailwind CSS v4 | Styling (via @tailwindcss/vite) |
| React Router v7 | Client-side routing |
| Vitest | Unit testing |
| Playwright | E2E testing |
| Cloudflare Pages | Deployment |

---

## Key Patterns

### Components
- Located in `src/components/`
- Use functional components with hooks
- Co-locate tests with components

### Pages
- Located in `src/pages/`
- Use React Router for navigation
- Load data in component or via hooks

### Static Data
- Pre-scraped content in `src/data/`
- Technologies and topics stored as JSON
- Imported directly, no API calls

### State Management
- React Context for global state (theme, auth, progress)
- localStorage for persistence
- Custom hooks for data access

---

## Adding New Technologies

1. Add technology to `src/data/technologies.ts`
2. Create topic content JSON in `src/data/w3schools/`
3. Update routing in `src/pages/`

---

## Testing Strategy

- **Unit Tests**: Vitest for components and hooks
- **E2E Tests**: Playwright for user flows
- **Coverage Target**: 80%

---

## Code Style

- ESLint for linting
- Prettier for formatting (if configured)
- TypeScript strict mode
