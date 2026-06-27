# Autonomous Workflow System

**Last Updated**: 2026-06-27

---

## Overview

DevOpsRPG uses an automated workflow system inspired by Dark Factory principles to continuously improve the project through AI-assisted issue handling, implementation, and validation.

## How It Works

### Submission Flow

1. **User Submits Feedback** → Via in-app Feedback page or GitHub Issues
2. **GitHub Issue Created** → With appropriate labels (`bug`, `enhancement`, `needs-triage`)
3. **Autonomous Workflow Triggered** → Daily at 9 AM UTC or on issue creation
4. **AI Agents Triage & Analyze** → Categorize, prioritize, estimate complexity
5. **Implementation Branch Created** → For high-priority items
6. **Automated PR Generated** → Draft PR with implementation plan
7. **CI/CD Validation** → Full test suite, linting, type checking
8. **Human Review** → Final review and merge

## In-App Feedback Form

Access via Settings page or `/feedback` route.

Features:
- Bug report, feature request, change request, or praise
- Categorization by area (Quest System, Battle Arena, etc.)
- Direct GitHub issue creation
- Real-time submission status

## GitHub Issue Templates

### Bug Report
For reporting bugs or unexpected behavior.
- Fields: Description, expected behavior, reproduction steps, area
- Auto-labels: `bug`, `needs-triage`

### Feature Request
For new feature suggestions.
- Fields: Problem statement, proposed solution, alternatives, area
- Auto-labels: `enhancement`, `needs-triage`

### Change Request
For modifying existing functionality.
- Fields: Current behavior, proposed change, rationale, area
- Auto-labels: `change-request`, `needs-triage`

## Autonomous Workflow (GitHub Actions)

### Trigger Conditions
- Daily at 9:00 AM UTC (off-peak)
- On issue creation with `needs-triage` label
- Manual trigger via `workflow_dispatch`

### Workflow Phases

#### Phase 1: Triage
- Fetch open issues with `needs-triage` label
- Filter out already-processed issues
- Output issue list for next phase

#### Phase 2: Analysis
- Categorize by type (bug, feature, change)
- Assign priority (high, medium, low)
- Estimate complexity and time

#### Phase 3: Implementation
- Create feature branch from `main`
- Run validation (lint, typecheck, tests)
- Generate implementation task file
- Create draft PR with context

#### Phase 4: Quality Check
- Full CI/CD validation
- Build verification
- Report generation

#### Phase 5: Reporting
- Generate daily report
- Post to artifact storage
- Comment on processed issues

## Integration with External Systems

### Dark Factory Integration
The workflow patterns are inspired by:
- Automated triage and prioritization
- AI-assisted analysis
- Continuous validation pipeline

### Atheon-Enhanced Integration
Security scanning integration:
- Pattern-based secrets detection
- Quality enforcement checks
- Code health monitoring

## Label Definitions

| Label | Purpose |
|-------|---------|
| `bug` | Bug reports |
| `enhancement` | Feature requests |
| `change-request` | Existing feature changes |
| `needs-triage` | New issues awaiting review |
| `priority-high` | Critical issues |
| `priority-medium` | Important issues |
| `priority-low` | Nice-to-have items |
| `good-first-issue` | Beginner-friendly tasks |
| `help-wanted` | Seeking community contributions |

## Copilot Instructions

The `.github/copilot-instructions.md` file provides AI coding assistants with:
- Project context and architecture
- Code quality standards
- Issue handling workflows
- Testing and validation requirements

## Metrics

- Issues processed: Daily automated scan
- PRs generated: Per high-priority issue
- Test coverage: 187 tests (and growing)
- Build status: All green

## Contributing Without Code

The system is designed so that anyone can contribute:

1. **Submit feedback** via in-app form or GitHub Issues
2. **No environment setup** required
3. **No coding skills** needed
4. **AI handles implementation**

Your ideas are automatically routed, prioritized, and implemented where possible.

## Future Enhancements

- [ ] AI-powered code review on PRs
- [ ] Automated changelog generation
- [ ] Sentiment analysis on feedback
- [ ] Predictive issue clustering
- [ ] Integration with external AI APIs for deeper analysis