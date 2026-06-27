#!/bin/bash
# setup-repository.sh - Configure repository settings for DevOpsRPG
# This script sets up guardrails, branch protection, and repository settings
# Inspired by dark-factory patterns

set -e

REPO="${1:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"

echo "🔧 Setting up repository: $REPO"

# Create the Safeguards ruleset (imported from Atheon-Enhanced)
echo "📋 Creating Safeguards ruleset..."
cat << 'RULESET_EOF' > /tmp/safeguards-ruleset.json
{
  "name": "Safeguards",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "exclude": ["refs/heads/stable/clean"],
      "include": ["~DEFAULT_BRANCH", "refs/heads/stable/*", "refs/heads/release/*"]
    }
  },
  "rules": [
    {"type": "deletion"},
    {"type": "non_fast_forward"},
    {"type": "required_linear_history"},
    {"type": "pull_request", "parameters": {"required_approving_review_count": 0, "dismiss_stale_reviews_on_push": true, "required_reviewers": [], "require_code_owner_review": false, "require_last_push_approval": false, "required_review_thread_resolution": true, "allowed_merge_methods": ["merge", "squash", "rebase"]}},
    {"type": "code_scanning", "parameters": {"code_scanning_tools": [{"tool": "CodeQL", "security_alerts_threshold": "all", "alerts_threshold": "all"}]}},
    {"type": "code_quality", "parameters": {"severity": "all"}}
  ]
}
RULESET_EOF

# Check if ruleset already exists
EXISTING_RULESET=$(gh api repos/"$REPO"/rulesets --jq '.[] | select(.name == "Safeguards") | .id' 2>/dev/null || echo "")

if [ -n "$EXISTING_RULESET" ]; then
    echo "⚠️  Safeguards ruleset already exists (ID: $EXISTING_RULESET), skipping..."
else
    gh api repos/"$REPO"/rulesets -X POST --input /tmp/safeguards-ruleset.json
    echo "✅ Safeguards ruleset created"
fi

# Enable repository settings
echo "⚙️  Configuring repository settings..."

# Enable required status checks (if not already enabled)
# This is handled by the ruleset above

echo "✅ Repository setup complete!"
echo ""
echo "📊 Current rulesets:"
gh api repos/"$REPO"/rulesets --jq '.[] | "  - \(.name) (\(.enforcement))"' 2>/dev/null || echo "  None"

rm -f /tmp/safeguards-ruleset.json