# EventGrid Release Readiness: v0.0.1

This document closes the phase-overlap gaps that accumulated while Phases 2 through 5 were developed in parallel. The goal is not to claim production completeness. The goal is to confirm that the current repository supports an initial run, a coherent local deployment, and a truthful `v0.0.1` release boundary.

## Release decision

EventGrid is ready for an initial `v0.0.1` release as a local/demo deployment package.

It is not yet a hardened production SaaS release because authentication, AI interpretation, hosting automation, and operational controls are still intentionally limited.

## Phase audit

### Phase 1: Foundation

Status: complete for initial release.

- Monorepo structure exists with `apps/web`, `apps/api`, and `packages/types`.
- Core stack aligns to the product docs: Next.js, TypeScript, NestJS, PostgreSQL, Prisma, Redis/BullMQ, S3-compatible storage, and container orchestration.
- Auth shell exists with NextAuth and optional GitHub provider wiring.
- Team, membership, storage, health, and database foundations are present.
- Deployment now includes PostgreSQL, Redis, MinIO, AI service, API, and web services.

### Phase 2: Core Editor MVP

Status: complete for initial release.

- Project, template, library, reporting, export, and editor-facing modules exist in the API.
- The web app includes dashboard, templates, sign-in, and editor routes.
- Shared canvas contracts exist in `packages/types`.
- Save/load/version plumbing is present through project version endpoints and editor-facing state contracts.

### Phase 3: Business Workflow

Status: complete for initial release.

- Project search endpoints exist.
- Reporting endpoints include counts and table numbering support.
- Project version snapshot and restore flows are present.
- Quote retrieval paths and workflow-oriented shared types exist.

### Phase 4: Venue + Spatial

Status: complete for initial release.

- Venue CRUD and venue-to-project application endpoints exist.
- Venue geometry, fixtures, utilities, and map-view persistence endpoints exist.
- Spatial configuration and calibration endpoints exist.
- The web app includes venue and venue-detail surfaces plus spatial components.

### Phase 5: AI + Advanced Ops

Status: complete for initial release with limited implementation scope.

- AI job submission and result orchestration are wired through API and Python sidecar services.
- Review comments, approvals, skin presets, presence, and quote endpoints exist.
- The AI service currently runs as a scaffold and returns stub detections. This is acceptable for `v0.0.1` only because the limitation is now explicit in the README and release notes.

## Initial deployment baseline

The repository now supports a single-script initial deployment path:

- `scripts/deploy-local.ps1` bootstraps env files and starts the complete Docker Compose stack.
- `docker-compose.yml` orchestrates PostgreSQL, Redis, MinIO, AI, API, and web services.
- Health endpoints exist for the API, web app, and AI service.
- Root package scripts expose deploy/build/typecheck/database commands.

## Release boundaries

The following items are intentionally outside the promise of `v0.0.1`:

- Production-grade credential auth and account management.
- Real AI computer-vision inference.
- Managed cloud deployment, secret rotation, and observability.
- Formal CI verification of the live container stack from inside this sandbox.

## Sign-off notes

The current state is suitable for:

- local evaluation
- internal demos
- ongoing parallel development
- a tagged GitHub release that accurately describes current limitations

The current state should not be marketed as:

- production-hardened
- enterprise secure
- AI-complete
