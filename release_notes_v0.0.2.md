# EventGrid v0.0.2

`v0.0.2` is a documentation + runtime quality release focused on startup reliability, template workflow completeness, and clearer local developer onboarding.

## Update summary (from diff)

- 28 files changed
- 649 insertions, 189 deletions
- New files added:
  - `quickstart.md`
  - `scripts/deploy-local.sh`
  - `apps/api/src/jobs/jobs.constants.ts`
  - `apps/web/src/app/(app)/projects/page.tsx`
  - `apps/web/src/lib/logdump.ts`
  - `apps/web/next-env.d.ts`

## Highlights

### 1) Quickstart and deployment improvements

- Added a dedicated `quickstart.md` with:
  - Docker-first startup path
  - host/local-dev startup path
  - env and port notes
  - troubleshooting for startup waits
- Added Linux/macOS one-command bootstrap script: `scripts/deploy-local.sh`.
- Refined Windows bootstrap script: `scripts/deploy-local.ps1`.

### 2) Web app workflow improvements

- Templates page now supports creating templates directly from UI modal flow.
- Added `/projects` route entry that maps to dashboard project experience.
- Added in-browser structured logging helpers (`logdump`) and wired venue create/list paths to log diagnostics.

### 3) API and runtime reliability updates

- API job queue constants centralized in `jobs.constants.ts`.
- API startup command corrected to `node dist/src/main`.
- API boot logs now print UI/API/health URLs as a structured startup block.
- Prisma generator now includes `debian-openssl-3.0.x` binary target for container compatibility.

### 4) Container and build fixes

- API and web Dockerfiles now reinstall dependencies in builder stage after source copy.
- API runtime image now installs OpenSSL and uses builder `node_modules`.
- Web Next.js config adds server external handling for `canvas`.

### 5) Versioning

- Workspace version bumped from `0.0.1` to `0.0.2` in:
  - root `package.json`
  - `apps/api/package.json`
  - `apps/web/package.json`
  - `packages/types/package.json`

## Known caveats carried into v0.0.2

- Demo credential auth is still development-scaffolded.
- AI sidecar remains integration-first and returns stub detections.
- `docker-compose.yml` currently maps Postgres as `4200:4200`; if you require host access, use `4200:5432`.
