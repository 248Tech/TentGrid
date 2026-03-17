# Changelog

All notable changes to EventGrid are documented in this file.

## [0.0.2] - 2026-03-17

### Added

- Working `/projects` and `/projects/new` routes, including a draft-project launcher that opens the editor directly.
- In-editor project setup panel for venue selection/creation and preset object placement.
- Functional settings and templates surfaces with team/member management and blank-template creation.
- Shared web-side session helpers for resolving active team and user context consistently.
- Release documentation for `v0.0.2`, including updated README guidance and release audit notes.

### Changed

- Synced web auth sessions against backend memberships so project, venue, template, and settings pages can resolve the active team.
- Replaced broken venue, template, settings, and project flows with usable end-to-end paths.
- Hardened local bootstrap by fixing root `db:seed`, improving Docker startup defaults, and aligning API/web container builds to the current workspace layout.
- Updated sign-out behavior to force a clean redirect back to the sign-in page.
- Refined job queue constants and build/runtime paths in the API package and Dockerfiles.

### Known limitations

- Credential auth remains demo-local and depends on the seeded development users.
- The AI service remains a scaffold and does not yet provide production computer-vision output.
- Next.js still emits an Edge Runtime warning from `next-auth`/`jose` during web builds, though the build completes successfully.

## [0.0.1] - 2026-03-16

### Added

- Initial monorepo foundation with Next.js web app, NestJS API, shared TypeScript contracts, Prisma schema, and supporting documentation.
- Core event layout editor workflows for projects, templates, object placement, autosave-oriented versioning, reporting, and export job handling.
- Business workflow support for project search, counts, table numbering, version snapshots, and quote-oriented reporting hooks.
- Venue and spatial planning support for venue records, reusable geometry, fixtures, utilities, map configuration, and calibration endpoints.
- AI and advanced-ops scaffolding for upload review, AI job orchestration, approval comments, skin presets, presence, and quote retrieval.
- Containerized local deployment for PostgreSQL, Redis, MinIO, AI service, API, and web application via `docker compose` and `scripts/deploy-local.ps1`.
- Product documentation set: PRD, database schema, development plan, phase prompts, release readiness, and release notes.

### Changed

- Standardized package versions on `0.0.1`.
- Updated deployment to favor full-stack container startup instead of mixed host/container runtime assumptions.
- Improved GitHub-facing project description, release messaging, and first-run guidance.

### Known limitations

- Credential login is demo-only for `v0.0.1` and uses seeded development identities.
- The AI service is operational as an integration scaffold but still returns stub detections rather than production computer-vision output.
- Validation in this workspace could not be completed end-to-end in the current sandbox because `docker`, `pnpm`, and direct execution of some installed binaries are unavailable here.
