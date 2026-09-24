# ADR-0001: GitForge is the primary CI/CD platform, GitHub is a mirror

- **Status:** Accepted
- **Date:** 2026-09-23
- **Deciders:** Repository owners

## Context

DevOpsQuest's Git hosting is mirrored: `origin` points at GitHub and a `gitforge`
remote points at the self-hosted GitForge instance (API gateway `:42780`, CI
orchestrator `:42781`, repos under `repos/<owner>/<repo>.git`). The GitHub account
is billing-blocked, so GitHub Actions runs are not a reliable quality signal, while
GitForge runs entirely on infrastructure we control.

## Decision

CI/CD, pipelines and releases run on **GitForge first**; GitHub remains a
backup/sync mirror. `.github/workflows/ci.yml` is kept as a mirror of the pipeline
(lint, typecheck, test, e2e matrix, build, Cloudflare Pages deploy) but a red GitHub
run is not treated as a code failure signal.

- Projects push to both remotes, GitForge first.
- Release automation extracts release notes from `docs/CHANGELOG.md` on tag push
  and publishes to GitForge (GitHub release as a mirror copy).
- Credentials never live in the repository; the interactive `gitforge auth
--login` on the user's machine is the credential path.

## Consequences

- Local validation (`npm run lint && npm run typecheck && npm run test`) is the
  first gate; the GitForge pipeline is the authoritative gate after push.
- GitHub Actions gaps (billing, runner availability) never block a release.
- Any new CI feature must be added to the GitForge pipeline definition and mirrored
  in `.github/workflows/ci.yml` in the same change, or it does not exist.
