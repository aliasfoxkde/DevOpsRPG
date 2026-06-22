# Validation Criteria - DevOpsQuest

**Last Updated**: 2026-06-22
**Status**: Ready for validation

---

## Pre-Deployment Validation Checklist

### Functional Requirements

- [ ] User can sign in with Google OAuth
- [ ] User can sign in with GitHub OAuth
- [ ] User can view technology catalog
- [ ] User can navigate to W3Schools topics via iframe
- [ ] User can mark topics as complete
- [ ] XP is awarded on topic completion
- [ ] Level increases based on XP thresholds
- [ ] Achievements unlock correctly
- [ ] Daily streak tracks correctly
- [ ] Dark/Light/System theme modes work
- [ ] Theme persists across sessions
- [ ] PWA installs correctly
- [ ] Offline mode shows cached content

### Performance Requirements

- [ ] Lighthouse PWA score ≥ 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 200KB gzipped

### Security Requirements

- [ ] No credentials in client-side code
- [ ] OAuth tokens stored securely (KV)
- [ ] CSRF protection on API routes
- [ ] Input sanitization on all forms

### Accessibility Requirements

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast ≥ 4.5:1

---

## Test Coverage Requirements

| Type | Target | Minimum |
|------|--------|---------|
| Unit | 85% | 80% |
| Integration | 70% | 60% |
| E2E | Critical paths 100% | Critical paths 90% |
| Overall | 80% | 75% |

---

## Visual Checkpoints

### Homepage (Logged Out)
- Logo and tagline visible
- Google/GitHub login buttons displayed
- Theme switcher visible
- PWA install prompt (if eligible)

### Dashboard (Logged In)
- User avatar and name displayed
- XP and level prominently shown
- Current streak displayed with fire animation
- Recent achievements shown
- Quick links to continue learning

### Learning Page
- Technology list organized by category
- Progress indicators per technology
- W3Schools iframe renders correctly
- Mark Complete button functional
- Next/Previous topic navigation works

### Gamification Elements
- XP pop animation on earn
- Achievement unlock animation
- Level-up celebration
- Streak fire animation

---

## Smoke Test Commands

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Lighthouse
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```
