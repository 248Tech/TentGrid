# Changelog

All notable changes to EventGrid are documented in this file.

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
