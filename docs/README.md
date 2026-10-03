# Documentation Index - DevOpsRPG

**An Open Source Gamified DevOps Learning Experience**

---

## 🎮 Quick Links

| Resource                                                      | Description             |
| ------------------------------------------------------------- | ----------------------- |
| [Live Game](https://devopsquest.pages.dev)                    | Play the latest version |
| [GitHub Repository](https://github.com/aliasfoxkde/DevOpsRPG) | Source code             |
| [Contributing Guide](../CONTRIBUTING.md)                      | How to contribute       |

---

## 📚 Documentation Structure

```
docs/
├── README.md                    # This index
│
├── # Getting Started
├── QUICKSTART.md               # 5-minute setup guide
├── CONTRIBUTING.md             # Contribution guidelines (in root)
│
├── # Architecture & Planning
├── architecture/
│   ├── ARCHITECTURE.md         # System design and tech stack
│   ├── SDLC_WORKFLOW.md        # Development lifecycle
│   └── PLAN.md                 # Historical build plan (June 2026 snapshot)
├── planning/
│   ├── 000-AUDIT_OVERVIEW.md   # Project audit and status
│   ├── 002-REFACTORING.md      # Refactoring roadmap
│   ├── 003-QUALITY_PLAN.md     # Quality baselines & phased roadmap (coverage, a11y, CI)
│   └── 004-INTEGRITY_PLAN.md   # ACTIVE: Phase 7 — CI integrity, docs truthing, test depth
├── decisions/                  # Architecture Decision Records (ADRs)
│   ├── 0001-gitforge-primary-ci.md
│   ├── 0002-service-worker-prod-only.md
│   ├── 0003-onboarding-default.md
│   └── 0004-coverage-ratchet-policy.md
│
├── # Processes & Guides
├── process/
│   ├── TDD.md                  # Test architecture and coverage policy (current)
│   └── VALIDATION.md           # Active validation gates (enforced in CI)
├── development/
│   └── DEVELOPMENT.md          # Development guide (current)
├── guides/
│   └── DEPLOYMENT.md           # Cloudflare Pages + Worker deployment
│
├── # Game Documentation
├── AUTONOMOUS_WORKFLOW.md      # Automated issue handling system
├── CHANGELOG.md                # Version history
├── DECISIONS.md                # Architecture decisions
├── PLAN.md                     # Historical enhancement plan (June 2026 snapshot)
├── PROGRESS.md                 # Historical progress report (June 2026 snapshot)
├── RESEARCH.md                 # Historical enhancement research (June 2026 snapshot)
│
├── # Archived (Historical)
└── archive/                    # Outdated planning documents
    ├── BRAINSTORM.md
    ├── COMPLETE_BRAINSTORM_PLAN.md
    ├── COMPREHENSIVE_ENHANCEMENT_PLAN.md
    ├── REDESIGN.md
    └── RPG_DESIGN.md
```

Documents labelled "historical snapshot" record how the project evolved; the
authoritative plans are `planning/003-QUALITY_PLAN.md` and the ADRs.

---

## 🏗️ Architecture

**Stack**: React 19 + TypeScript + Vite + TailwindCSS v4 + Cloudflare Pages

### Key Systems

| System       | Location                        | Description                                                                                              |
| ------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Game State   | `src/contexts/GameContext.tsx`  | Core state management (split into `src/contexts/game/` modules: XP, bonus engine, storage, unlock rules) |
| Quest Engine | `src/pages/BattleArenaPage.tsx` | Quiz and progression                                                                                     |
| Navigation   | `src/components/ui/HUD.tsx`     | Primary navigation                                                                                       |
| Data         | `src/data/`                     | Quests, badges, technologies — single source of truth                                                    |

### CI/CD

- **Primary**: GitForge pipeline (`.gitforce.yml`) — see
  [ADR 0001](./decisions/0001-gitforge-primary-ci.md)
- **Mirror**: `.github/workflows/ci.yml` runs the same npm scripts
- **Preview Deploys**: Auto-deploy PRs to Cloudflare Pages
- **Production**: Deploys on merge to main

---

## 🚀 Development

### Prerequisites

- Node.js >= 20
- npm >= 10
- Git

### Setup

```bash
git clone https://github.com/aliasfoxkde/DevOpsRPG.git
cd DevOpsRPG
npm install
npm run dev
```

### Validation

```bash
npm run lint           # ESLint
npm run typecheck      # TypeScript (strict)
npm run format:check   # Prettier
npm run knip           # Unused exports/files/dependencies
npm run test           # Unit + component tests (Vitest, fast loop)
npm run test:coverage  # Same suite + coverage ratchet (97/91.5/98.5/98) — this
                       # is the variant CI runs
npm run validate       # One command: lint, typecheck, format, knip, unit +
                       # worker tests, build (load-resilient unit invocation)
./scripts/gate-sharded.sh   # Same suite, sharded with retries — pass/fail
                            # only, for hosts with bursty background load
npm run test:worker    # Worker KV API tests
npm run test:e2e       # Playwright (chromium + firefox + webkit)
npm run audit:secrets  # Aegis scan against the committed baseline
npm run audit:a11y     # axe WCAG audit (AA + AAA strict)
npm run build          # Production build (typechecks as part of build)
```

---

## 📖 Game Systems

| System              | Status    | Documentation                                          |
| ------------------- | --------- | ------------------------------------------------------ |
| Quest Engine        | ✅ Active | W3Schools integration, quiz mechanics                  |
| XP & Levels         | ✅ Active | Character: 100 XP/level; skills: `XP_THRESHOLDS` curve |
| Badges              | ✅ Active | 81 badges, rarity tiers                                |
| Titles & Frames     | ✅ Active | 28 collectible titles, unlock gates                    |
| Daily/Weekly Quests | ✅ Active | Streak system with shields                             |
| Career Paths        | ✅ Active | 10 career tracks                                       |
| Storylines          | ✅ Active | 5 story arcs with claimable rewards                    |
| Certifications      | ✅ Active | 12 certification exams                                 |
| Seasonal Events     | ✅ Active | 8 events with XP multipliers                           |
| Mini-games          | ✅ Active | 7 games (`gameCatalog.ts` payouts)                     |
| Skill System        | ✅ Active | Per-skill XP tracking                                  |
| Equipment           | ✅ Active | 18 items, gameplay bonuses                             |
| Autonomous Workflow | ✅ Active | AI-assisted issue handling                             |

---

## 🤖 Autonomous Workflow

The project uses an autonomous agent system for handling community contributions:

1. **Submit**: Users submit via in-app `/feedback` form or GitHub issues
2. **Triage**: AI triages issues (needs-triage label)
3. **Analyze**: Categorize by type/priority
4. **Implement**: Create branches and draft PRs
5. **Quality Check**: Full CI validation
6. **Report**: Daily summary at 9 AM UTC

See [AUTONOMOUS_WORKFLOW.md](./AUTONOMOUS_WORKFLOW.md) for full details.

---

## 📊 Project Status

| Metric            | Value                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| Unit Tests        | 106 files / 1,609 passing; coverage ratchet 97.34% stmts / 91.76% branch / 99.21% funcs / 98.58% lines (v0.1.5 gate) |
| Worker Tests      | 18 passing                                                                                                           |
| E2E Tests         | 10 specs passing × 3 browsers (chromium, firefox, webkit); expansion tracked in `planning/004-INTEGRITY_PLAN.md`     |
| Lint Errors       | 0                                                                                                                    |
| TypeScript Errors | 0                                                                                                                    |
| Build             | ✅ Passing                                                                                                           |
| Live              | https://devopsquest.pages.dev                                                                                        |

Current quality baselines and the phased roadmap live in
[planning/003-QUALITY_PLAN.md](./planning/003-QUALITY_PLAN.md); version history
in [CHANGELOG.md](./CHANGELOG.md).

**Last Updated**: 2026-09-30
