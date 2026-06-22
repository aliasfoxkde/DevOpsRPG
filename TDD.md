# Test-Driven Development Plan - DevOpsQuest

**Last Updated**: 2026-06-22
**Coverage Target**: 80%

---

## Testing Philosophy

1. **Test behavior, not implementation** - Focus on user-facing functionality
2. **Unit tests for utilities** - Pure functions, hooks, calculations
3. **Integration tests for components** - React component behavior
4. **E2E tests for critical paths** - Auth, learning flow, gamification

---

## Test Coverage Goals

| Category | Target | Priority |
|----------|--------|----------|
| Utility functions | 90% | High |
| React hooks | 85% | High |
| Components | 70% | Medium |
| E2E flows | 100% | Critical |

---

## Testing Tools

- **Vitest** - Unit and integration tests
- **React Testing Library** - Component testing
- **Playwright** - E2E browser tests
- **msw** - API mocking

---

## Test Files Structure

```
tests/
├── setup.ts           # Test configuration
├── unit/
│   ├── lib/           # Utility function tests
│   ├── hooks/         # Hook tests
│   └── data/          # Data model tests
├── integration/
│   └── components/     # Component tests
└── e2e/
    ├── auth.spec.ts
    ├── learn.spec.ts
    └── gamification.spec.ts
```

---

## Critical Test Scenarios

### Authentication
- [ ] Google OAuth flow
- [ ] GitHub OAuth flow
- [ ] Session persistence
- [ ] Logout functionality

### Learning Flow
- [ ] Technology catalog displays
- [ ] Topic navigation
- [ ] Progress marking
- [ ] W3Schools iframe loads

### Gamification
- [ ] XP calculation accuracy
- [ ] Level progression
- [ ] Achievement unlock
- [ ] Streak calculation
- [ ] Daily bonus application

### Theme System
- [ ] Dark mode toggle
- [ ] Light mode toggle
- [ ] System preference detection
- [ ] Theme persistence

### PWA
- [ ] Service worker registration
- [ ] Offline functionality
- [ ] Install prompt display
- [ ] Cache management

---

## CI/CD Integration

Tests run on every push:
1. Lint check
2. Type check
3. Unit tests
4. Integration tests
5. E2E tests (chromium only on CI)

---

## Coverage Reporting

Coverage reports generated on every test run:
- `coverage/index.html` - HTML report
- `coverage/coverage.json` - JSON for tooling
- `coverage/text-summary` - Terminal output
