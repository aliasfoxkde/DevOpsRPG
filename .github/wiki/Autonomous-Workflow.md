# Autonomous Workflow System

The DevOpsRPG project uses an autonomous agent workflow inspired by Dark Factory patterns for handling community contributions.

## Overview

```
User submits issue → Triage → Analyze → Implement → Quality Check → Report
```

## Components

### 1. In-App Feedback Form

Users can submit feedback directly from the app at `/feedback`:
- **Bug Reports** - Report issues with detailed reproduction steps
- **Feature Requests** - Propose new functionality
- **Change Requests** - Suggest modifications to existing features
- **Praise** - Celebrate what's working well

### 2. GitHub Issue Templates

Located in `.github/ISSUE_TEMPLATE/`:
- `bug_report.yml` - Structured bug reports
- `feature_request.yml` - Feature proposals
- `change_request.yml` - Change suggestions
- `config.yml` - Template configuration

### 3. GitHub Actions Workflow

`.github/workflows/autonomous-agents.yml` runs daily at 9 AM UTC with phases:

| Phase | Description |
|-------|-------------|
| Triage | Fetch issues with `needs-triage` label |
| Analyze | Categorize by type (bug/feature/change) and priority |
| Implement | Create branches and draft PRs for high-priority items |
| Quality Check | Run full CI validation |
| Report | Generate daily summary |

### 4. AI Copilot Instructions

`.github/copilot-instructions.md` provides context-aware guidance for handling issues.

## Labels

Issues are automatically labeled based on type and priority:

| Label | Description |
|-------|-------------|
| `needs-triage` | New issue awaiting categorization |
| `bug` | Bug report |
| `enhancement` | Feature request |
| `change` | Change request |
| `praise` | Positive feedback |
| `priority:high` | High priority item |
| `priority:medium` | Medium priority item |
| `priority:low` | Low priority item |
| `good-first-issue` | Suitable for new contributors |

## Auto-Merge

The repository uses a Safeguards ruleset (imported from Atheon-Enhanced):
- Branch protection enabled
- Linear history required
- PR reviews with thread resolution
- Admin merge available after checks pass

## Related

- [Dark Factory](https://github.com/aliasfoxkde/dark-factory)
- [Atheon-Enhanced](https://github.com/aliasfoxkde/Atheon-Enhanced)
- [Getting Started](Getting-Started)