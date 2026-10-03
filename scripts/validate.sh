#!/usr/bin/env bash
# Local one-command validation ladder — every CI gate except e2e, which needs
# browsers installed and is left explicit (`npm run test:e2e`).
#
# The unit step uses vitest.loadresilient.config.ts (same suite, three
# projects, one long-lived worker for the shared suites) so the ladder stays
# green on shared hosts with background CPU waves; on a quiet machine it is
# equivalent to `npm run test`. See the config header and
# docs/process/VALIDATION.md for why sharding/coverage are NOT part of this
# ladder (coverage must come from a single invocation; see
# docs/planning/003-QUALITY_PLAN.md §6.8).
set -euo pipefail
cd "$(dirname "$0")/.."

npm run lint
npm run typecheck
npm run format:check
npm run knip
npx vitest run --config vitest.loadresilient.config.ts \
  --maxWorkers=1 --fileParallelism=false --testTimeout=60000
npm run test:worker
npm run build

echo "validate: all gates green"
