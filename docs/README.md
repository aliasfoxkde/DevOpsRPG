# Documentation Index - DevOpsRPG

**An Open Source Gamified DevOps Learning Experience**

---

## 🎮 Quick Links

| Resource | Description |
|----------|-------------|
| [Live Game](https://devopsquest.pages.dev) | Play the latest version |
| [GitHub Repository](https://github.com/aliasfoxkde/DevOpsRPG) | Source code |
| [Contributing Guide](../CONTRIBUTING.md) | How to contribute |

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
│   └── SDLC_WORKFLOW.md        # Development lifecycle
├── planning/
│   ├── 000-AUDIT_OVERVIEW.md   # Project audit and status
│   └── 002-REFACTORING.md      # Refactoring roadmap
│
├── # Game Documentation
├── AUTONOMOUS_WORKFLOW.md      # Automated issue handling system
├── CHANGELOG.md                # Version history
├── DECISIONS.md                # Architecture decisions
│
├── # Archived (Historical)
└── archive/                    # Outdated planning documents
```

---

## 🏗️ Architecture

**Stack**: React 19 + TypeScript + Vite + TailwindCSS + Cloudflare Pages

### Key Systems

| System | Location | Description |
|--------|----------|-------------|
| Game State | `src/contexts/GameContext.tsx` | Core state management |
| Quest Engine | `src/pages/BattleArenaPage.tsx` | Quiz and progression |
| Navigation | `src/components/ui/HUD.tsx` | Primary navigation |
| Data | `src/data/` | Quests, badges, technologies |

### CI/CD

- **Workflow**: `.github/workflows/ci.yml`
- **Preview Deploys**: Auto-deploys PRs to Cloudflare Pages
- **Production**: Deploys on merge to main

---

## 🚀 Development

### Prerequisites
- Node.js >= 20
- npm >= 10
- Git
- GitHub CLI (`gh`)

### Setup
```bash
git clone https://github.com/aliasfoxkde/DevOpsRPG.git
cd DevOpsRPG
npm install
npm run dev
```

### Validation
```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run test        # Tests (187 passing)
npm run build       # Production build
```

---

## 📖 Game Systems

| System | Status | Documentation |
|--------|--------|---------------|
| Quest Engine | ✅ Active | W3Schools integration, quiz mechanics |
| XP & Levels | ✅ Active | 100 XP/level, titles at 6/11/16/21 |
| Badges | ✅ Active | 80+ badges, rarity tiers |
| Daily/Weekly Quests | ✅ Active | Streak system with shields |
| Career Paths | ✅ Active | 10 career tracks |
| Skill System | ✅ Active | Per-skill XP tracking |
| Equipment | ✅ Active | 18 items, gameplay bonuses |
| Autonomous Workflow | ✅ Active | AI-assisted issue handling |

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

| Metric | Value |
|--------|-------|
| Tests | 187 passing |
| Lint Errors | 0 |
| TypeScript Errors | 0 |
| Build | ✅ Passing |
| Last Deploy | https://378111cd.devopsquest.pages.dev |

**Last Updated**: 2026-06-27