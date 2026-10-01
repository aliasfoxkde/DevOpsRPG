#!/usr/bin/env bash
# Sharded pass/fail gate for hosts with bursty background load.
#
# The monolithic full-suite run (~14 min) loses random test files to
# worker-start timeouts whenever a load wave lands mid-run: the worker's
# 90 s startup window is a hardcoded vitest constant, so a busy host starves
# it, and pool-level spawn failures bypass --retry. Splitting the suite into
# shards shortens each exposure window, and a shard that loses files is
# retried on its own instead of invalidating the whole run.
#
# This script proves test correctness only (every test file executed, zero
# failures). It deliberately runs WITHOUT --coverage: vitest 4.1.9 cannot
# merge coverage across shard processes accurately — v8 range sets under-union
# (~5-9 points lost) and istanbul blobs zero out files un-exercised by later
# shards — so any sharded coverage number would be wrong. The authoritative
# coverage gate is a single-process `npx vitest run --coverage` in a quiet
# window (see docs/planning/003-QUALITY_PLAN.md §6.8).
set -u
cd "$(dirname "$0")/.." || exit 1

SHARDS="${GATE_SHARDS:-4}"
ATTEMPTS="${GATE_ATTEMPTS:-3}"
ARGS=(--pool=threads --maxWorkers=1 --fileParallelism=false --testTimeout=60000 --reporter=blob)
REPORTS=.vitest-reports

rm -rf "$REPORTS"
for shard in $(seq 1 "$SHARDS"); do
  ok=0
  for attempt in $(seq 1 "$ATTEMPTS"); do
    log="/tmp/gate-shard-${shard}-${attempt}.log"
    echo "[gate] shard ${shard}/${SHARDS} attempt ${attempt}"
    npx vitest run "${ARGS[@]}" --shard="${shard}/${SHARDS}" >"$log" 2>&1
    if grep -q "Failed to start\|Timeout waiting for worker" "$log"; then
      echo "[gate] shard ${shard} attempt ${attempt} lost files to worker startup; retrying"
      continue
    fi
    if ! grep -qE "Test Files +[0-9]+ passed" "$log"; then
      echo "[gate] shard ${shard} attempt ${attempt} has test failures; see $log"
      exit 1
    fi
    ok=1
    break
  done
  if [ "$ok" -ne 1 ]; then
    echo "[gate] shard ${shard} failed after ${ATTEMPTS} attempts — see /tmp/gate-shard-${shard}-*.log"
    exit 1
  fi
done

echo "[gate] merging ${SHARDS} shard reports (pass/fail only)"
npx vitest --merge-reports
