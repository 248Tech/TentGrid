# Changelog

All notable changes to EventGrid are documented in this file.

## [0.0.2] - 2026-03-17

### Added

- New `quickstart.md` with Docker and local-dev startup paths, service URLs, required env values, and troubleshooting notes.
- New Linux/macOS bootstrap script: `scripts/deploy-local.sh`.
- New web diagnostics utility: `apps/web/src/lib/logdump.ts`.
- New `/projects` route alias in the app shell: `apps/web/src/app/(app)/projects/page.tsx`.
- New job queue constants module: `apps/api/src/jobs/jobs.constants.ts`.
- Added `next-env.d.ts` to the web app for Next.js TypeScript integration.

### Changed

- Bumped workspace version to `0.0.2` (`package.json`, `apps/web/package.json`, `apps/api/package.json`, `packages/types/package.json`).
- Updated README to prioritize one-command startup for Windows and Linux/macOS, and aligned docs organization.
- Template flow now supports in-UI template creation from `/templates`.
- Venues page now emits structured debug logs around list/create operations.
- API job modules now import queue names from a shared constants file.
- API startup logs now print UI, API, and health endpoints in a structured startup block.
- Updated API and web Dockerfiles to reinstall dependencies in builder stage and use corrected runtime artifacts.
- Added Prisma binary target `debian-openssl-3.0.x` for container/runtime compatibility.
- Docker Compose host ports changed to `4200` for Postgres and `6380` for Redis.

### Fixed

- Fixed API startup command to use `node dist/src/main`.
- Fixed deployment docs for AI sidecar quickstart and script-driven environment bootstrap details.
- Fixed web runtime by excluding `canvas` from server webpack externals where required.

## [0.0.1] - 2026-03-16

### Added

- Initial monorepo foundation with Next.js web app, NestJS API, shared TypeScript contracts, Prisma schema, and supporting documentation.
- Core event layout editor workflows for projects, templates, object placement, autosave-oriented versioning, reporting, and export job handling.
- Business workflow support for project search, counts, table numbering, version snapshots, and quote-oriented reporting hooks.
- Venue and spatial planning support for venue records, reusable geometry, fixtures, utilities, map configuration, and calibration endpoints.
- AI and advanced-ops scaffolding for upload review, AI job orchestration, approval comments, skin presets, presence, and quote retrieval.
- Containerized local deployment for PostgreSQL, Redis, MinIO, AI service, API, and web application via `docker compose`.
- Single-command deployment scripts: `scripts/deploy-local.sh` (Linux/macOS) and `scripts/deploy-local.ps1` (Windows) — bootstrap env files, build the full stack, wait for health endpoints, and print access URLs.
- Product documentation set: PRD, database schema, development plan, phase prompts, release readiness, and release notes.

### Fixed

- Docker build failure in `apps/api` and `apps/web` where `COPY packages/types packages/types` in the builder stage caused Docker's overlay filesystem to shadow the `node_modules/typescript` symlink placed by `pnpm install` in the deps stage. Fixed by adding `RUN pnpm install --frozen-lockfile` after source COPY in both Dockerfiles to restore workspace symlinks before building.

### Changed

- Standardized package versions on `0.0.1`.
- Updated deployment to favor full-stack container startup instead of mixed host/container runtime assumptions.
- Improved GitHub-facing project description, release messaging, and first-run guidance.
- README updated to show both Linux/macOS and Windows one-command start paths.

### Known limitations

- Credential login is demo-only for `v0.0.1` and uses seeded development identities.
- The AI service is operational as an integration scaffold but still returns stub detections rather than production computer-vision output.
- GitHub OAuth is optional and must be configured manually.
- Production hosting, secrets management, observability, and managed object storage are post-`v0.0.1` work.
