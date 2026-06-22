# Architectural Decisions - DevOpsQuest

**Last Updated**: 2026-06-22

---

## ADR-001: Next.js 14 with CSR-First Architecture

### Context
We need a React framework that supports PWA features, works well with Cloudflare Pages, and provides an excellent developer experience.

### Decision
Use Next.js 14 with App Router in CSR (Client-Side Rendering) mode as the default. Server components used only where beneficial.

### Consequences
- **Pros**: Fast initial page loads for static content, SEO friendly, React 18 features
- **Cons**: Requires careful handling for auth state (solved with client-side auth context)

### Status: ACCEPTED

---

## ADR-002: Cloudflare Workers for API/Auth

### Context
We need a backend that deploys to the edge, has generous free tier, and integrates with Cloudflare's identity services.

### Decision
Use Cloudflare Workers for all API endpoints and OAuth authentication.

### Consequences
- **Pros**: Edge computing, global distribution, free tier, D1/KV integration
- **Cons**: Workers have CPU time limits (50ms free tier), less flexible than full Node.js

### Status: ACCEPTED

---

## ADR-003: CSS Variables + Tailwind for Theming

### Context
We need a theming system that supports dark/light modes and defaults to system preference.

### Decision
Use Tailwind CSS with CSS custom properties (variables) for theme colors. Use `class` dark mode strategy.

### Consequences
- **Pros**: Fast, utility-first, easy to customize, CSS variables for runtime theming
- **Cons**: Large CSS bundle without purge

### Status: ACCEPTED

---

## ADR-004: LocalStorage + React Context for State

### Context
We need client-side state management that works offline and doesn't require backend round-trips.

### Decision
Use React Context for global state (user, theme, gamification) with localStorage persistence.

### Consequences
- **Pros**: Simple, offline-capable, no complex state library
- **Cons**: localStorage has size limits (5MB), syncing across tabs requires extra work

### Status: ACCEPTED

---

## ADR-005: W3Schools iframe Embedding

### Context
We need to leverage W3Schools content without hosting it ourselves.

### Decision
Embed W3Schools topic pages using iframes with the user's learning progress overlaid.

### Consequences
- **Pros**: No content hosting needed, W3Schools content always up-to-date
- **Cons**: iframe may have restrictions, depends on W3Schools availability

### Status: ACCEPTED

---

## ADR-006: XP-Based Leveling with Square Root Formula

### Context
We need a leveling system that rewards early progress but doesn't become impossible at higher levels.

### Decision
Use `level = floor(sqrt(totalXP / 100))` formula.

### Consequences
- **Pros**: Early levels are quick, later levels require sustained effort, mathematically smooth
- **Cons**: May feel slow at high levels

### Status: ACCEPTED

---

## ADR-007: 47 Technologies in 5 Phases

### Context
W3Schools covers 47+ technologies. We need to organize them for a structured learning path.

### Decision
Organize into 5 phases based on prerequisites and difficulty:
- Phase 1: Foundations (6)
- Phase 2: Backend Basics (8)
- Phase 3: Frameworks & Databases (11)
- Phase 4: Advanced & Cloud (9)
- Phase 5: Modern DevOps (13)

### Status: ACCEPTED

---

## ADR-008: 5 Career Path Themes

### Context
Different users have different goals. We need to personalize the learning journey.

### Decision
Offer 5 career path themes:
1. Web Developer
2. Backend Engineer
3. DevOps Engineer
4. Data Scientist
5. Mobile Developer

### Status: ACCEPTED

---

## Future Decisions Needed

- [ ] Push notifications provider (Cloudflare Push or third-party)
- [ ] Payment system for premium features (future)
- [ ] Community features (forums, code sharing)
