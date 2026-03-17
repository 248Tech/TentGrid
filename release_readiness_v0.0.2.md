# EventGrid Release Readiness: v0.0.2

This document records the release boundary for `v0.0.2`, which is focused on usability, local-operability, and demo reliability rather than expanding the product promise to production readiness.

## Release decision

EventGrid is ready for a `v0.0.2` release as a usability update to the initial local/demo package.

This release improves the day-to-day product flow and local bootstrap experience without changing the overall production-readiness boundary.

## Release focus

### Product usability

Status: improved for release.

- Project creation now has a valid entry route and lands in the working editor instead of a dead-end flow.
- The editor now exposes first-use setup actions for project details, venue selection/creation, and starter object placement.
- Templates and settings now provide usable product surfaces instead of placeholder pages.
- Venue flows now operate on real session-backed team and user context.

### Auth and workspace context

Status: improved for release.

- Web auth sessions now sync against backend memberships.
- Session-backed team resolution is available across project, venue, template, and settings screens.
- Sign-out has a more deterministic redirect path.

### Local deployment and operations

Status: improved for release.

- Root database seeding works through `pnpm db:seed`.
- The Dockerfiles align with the current workspace layout and correct runtime entrypoints.
- The containerized stack was verified end-to-end with PostgreSQL, Redis, MinIO, AI, API, and web services.
- API health and auth sync were validated after local startup.

## Verification summary

The following checks were run against the current repository state:

- `pnpm --filter @eventgrid/web typecheck`
- `pnpm --filter @eventgrid/api typecheck`
- `pnpm --filter @eventgrid/web build`
- `pnpm --filter @eventgrid/api build`
- `pnpm db:seed`
- `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-local.ps1 -SkipEnvBootstrap`

## Remaining boundaries

The following remain intentionally outside the promise of `v0.0.2`:

- Production-grade authentication and account lifecycle management.
- Real AI computer-vision inference.
- Production hosting automation, observability, and secret rotation.
- Elimination of the current Next.js Edge Runtime warning emitted through `next-auth` / `jose`.

## Sign-off notes

`v0.0.2` is suitable for:

- local evaluation
- internal demos
- usability-focused iteration
- a tagged GitHub release that reflects the current working product path

`v0.0.2` should still not be marketed as:

- production-hardened
- enterprise secure
- AI-complete
