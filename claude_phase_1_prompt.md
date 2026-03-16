# Claude Prompt: EventGrid Phase 1 Foundation

Use this as the starting prompt for Claude to begin implementation work in this repository.

## Prompt
You are the implementation agent for EventGrid. Start Phase 1 work in this repository and use the existing documentation as the source of truth.

Read these files first and treat them as authoritative in this order:

1. `product_requirements_document.md`
2. `database_schema.md`
3. `development_plan.md`
4. `technical_blueprint.md`

Your job is to begin Phase 1: Foundation and make concrete implementation progress in the repo, not just restate the documents.

## Product and scope
EventGrid is a browser-based event layout platform for sales and operations teams. For this phase, only implement Phase 1 foundations described in the docs:

- Next.js frontend shell
- NestJS backend service boundaries
- Auth.js authentication
- team-scoped authorization and role model
- PostgreSQL + Prisma schema
- S3-backed asset storage abstraction
- Redis + BullMQ job infrastructure
- baseline UI shell, dashboard skeleton, settings surfaces
- logging, error handling, environment configuration, and deployment conventions

Do not start Phase 2 editor work unless a tiny amount of scaffolding is required to support Phase 1 structure. Do not implement canvas editing, map overlays, AI flows, or advanced business workflows yet.

## Execution rules
- Inspect the repo before making assumptions.
- If the repo is mostly empty, scaffold the project in a pragmatic way that fits the documented stack.
- Prefer a monorepo structure if starting from scratch:
  - `apps/web` for Next.js
  - `apps/api` for NestJS
  - `packages/` only if shared config or shared types are clearly useful
- Keep all naming aligned to `EventGrid`.
- Use TypeScript everywhere.
- Use the documents above as decision anchors. If they conflict, follow the precedence order above.
- Make decisions instead of asking unnecessary questions. Only stop if a missing secret, credential, or external dependency blocks safe progress.
- Avoid overbuilding. Phase 1 is about platform readiness, auth, schema, infra, and app shell.

## Technical defaults to follow
- Frontend: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- Backend: NestJS, TypeScript
- Auth: Auth.js
- Database: PostgreSQL with Prisma
- Storage: AWS S3 abstraction
- Jobs: Redis + BullMQ
- Logging: production-minded structured logging
- Package management and workspace tooling: choose one sensible option and keep it consistent

## Phase 1 deliverables
Implement as much of the following as is reasonable in one pass:

1. Repository/workspace bootstrap
- Create a clean project structure for frontend and backend.
- Add root-level workspace configuration, scripts, and environment examples.
- Add a README section explaining local setup and service dependencies.

2. Frontend shell
- Create the Next.js app shell with a basic authenticated layout.
- Add a landing or sign-in entry point.
- Add a dashboard skeleton and a settings area.
- Add a minimal design system setup using Tailwind and shadcn/ui.

3. Authentication and authorization
- Add Auth.js integration.
- Model team-scoped roles from the docs: `ADMIN`, `SALES`, `DESIGNER`, `VIEWER`.
- Implement route and API guards at a foundation level.
- Ensure the app can identify the active team context.

4. Database and schema
- Implement the initial Prisma schema from `database_schema.md` for the Phase 1 tables.
- Include enums, keys, relationships, timestamps, and search-oriented indexes where Prisma can represent them.
- Add migrations or equivalent schema setup artifacts.
- Seed enough initial data to validate the auth and team model if practical.

5. API foundation
- Create NestJS modules and basic endpoints for:
  - auth/session integration
  - teams and memberships
  - projects
  - venues
  - templates
  - assets
- Keep these endpoints minimal but real enough to support the dashboard shell.

6. Storage and jobs
- Add an S3 storage adapter abstraction with environment-driven configuration.
- Add BullMQ and Redis wiring with one simple queue or job path to prove the infrastructure works.
- Add status tracking patterns that fit the schema for uploads and future export jobs.

7. Cross-cutting concerns
- Add environment validation.
- Add error handling and logging conventions.
- Add basic health checks.
- Add a minimal test or smoke-check layer for boot success, auth guard behavior, and Prisma schema validity if practical.

## Required working style
- Start by summarizing current repo state and the first implementation steps.
- Then implement directly.
- After meaningful changes, summarize what was added, what remains, and any blockers.
- Run relevant checks after changes and report the real results.
- If you cannot finish all of Phase 1 in one pass, leave the repo in a coherent state with clear next steps.

## Acceptance criteria for your work
By the end of this pass, aim to satisfy as many of these Phase 1 outcomes as possible:

- A user can authenticate, join or belong to a team, and have a valid role.
- Team-scoped project, venue, and template records can be created and listed through the application or API foundation.
- Asset uploads are represented through a real storage abstraction and status model.
- Background job infrastructure can enqueue and process a simple non-AI job.
- Audit/event logging conventions are established for core create and update paths.

## Output format
At the end of your run, provide:

1. A concise summary of what you implemented
2. A list of files created or modified
3. Commands run and whether they passed
4. Remaining gaps versus Phase 1 acceptance criteria
5. The recommended next implementation step

Do not rewrite the product docs. Use them to build.
