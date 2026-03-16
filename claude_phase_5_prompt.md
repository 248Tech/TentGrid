# Claude Prompt: EventGrid Phase 5 AI + Advanced Ops

Use this as the starting prompt for Claude to begin Phase 5 implementation work in this repository in a non-invasive, additive way.

## Prompt
You are the implementation agent for EventGrid. Start Phase 5 work in this repository, but do it in a way that preserves completed work from Phases 1 and 3 and does not interfere with the in-progress implementation work still underway for Phases 2 and 4.

Treat Phases 1 and 3 as built. Treat Phases 2 and 4 as under construction and potentially unstable at their extension points.

Read these files first and follow them in this order:

1. `development_plan.md`
2. `product_requirements_document.md`
3. `database_schema.md`
4. `technical_blueprint.md`
5. `README.md`
6. `claude_phase_1_prompt.md`
7. `claude_phase_2_prompt.md`
8. `claude_phase_3_prompt.md`
9. `claude_phase_4_prompt.md`

Then inspect the current repo state before making changes.

## Mission
Implement Phase 5: AI + Advanced Ops for EventGrid.

Per `development_plan.md`, this phase should layer intelligent assistance and higher-order operational workflows on top of the stable core product.

## Phase 5 scope
Implement the Phase 5 capabilities defined in the docs:

- build the asynchronous upload-to-diagram AI pipeline using the dedicated Python service
- normalize AI results into editable EventGrid objects and return confidence metadata
- add manual review and acceptance steps before AI output becomes a canonical project version
- introduce curated material presets and controlled smart skin workflows
- add review comments, approvals, and richer collaboration or presence features
- prepare quote integration hooks through object metadata and exportable summaries

Use the PRD for the exact product behavior inside this phase, especially:

- `AUTH-05`
- `OBJ-05`
- `RPT-05`
- `AI-01`
- `AI-02`
- `AI-03`
- `AI-04`

## Phase-awareness rules
Phase 5 depends conceptually on earlier phases, but in this repo:

- Phase 1 is built
- Phase 3 is built
- Phase 2 is under construction
- Phase 4 is under construction

That means your work must assume:

- core auth, team scoping, jobs, assets, and audit foundations should already exist
- business workflow logic from Phase 3 should be preserved and reused
- the editor internals from Phase 2 may still be evolving
- venue and spatial integration from Phase 4 may still be evolving

Design your work so it can plug into the finished versions of Phase 2 and 4 without forcing rewrites now.

## Hard non-interference rules
Because Phases 2 and 4 are still active:

- Do not regenerate the repo or restructure the monorepo.
- Do not replace or rewrite the core editor architecture, canvas state store, autosave model, export pipeline, venue model, or map calibration workflows.
- Do not rename or churn shared contracts, routes, packages, or persistence models just to fit your preference.
- Do not rework completed Phase 3 search, reporting, snapshot, attachment, or overlay workflows unless a tiny backward-compatible extension is strictly required.
- Do not couple AI features tightly to unstable editor or spatial implementation details.
- Do not assume unfinished Phase 2 or 4 UI is yours to “finish” as part of Phase 5.

If you need to integrate with unstable areas:

- build against documented interfaces first
- use adapters, service boundaries, feature flags, and additive API surfaces
- isolate AI and advanced ops behind new modules and opt-in routes where possible
- keep shared-file diffs minimal and backward-compatible

## Change strategy
Favor additive systems that sit beside the active work rather than inside it.

Good change patterns:

- add an isolated AI service contract, queue handlers, result normalizers, and review flows
- create new review, approval, and commenting modules instead of retrofitting unrelated features
- extend object metadata and export summaries in backward-compatible ways
- add collaboration or presence in an opt-in, non-destructive way
- add quote-integration hooks as metadata and extension points, not a mandatory new sales workflow

Bad change patterns:

- rebuilding the saved document shape to fit AI
- rewriting editor controls to accommodate review or presence
- binding AI output directly to unstable canvas internals
- redesigning venue or map state to support later AI ideas
- forcing pricing, quote, or collaboration dependencies into basic project editing paths

## Document precedence
If the docs appear to conflict, use this precedence:

1. `development_plan.md` for what belongs in Phase 5
2. `product_requirements_document.md` for behavior and acceptance requirements
3. `database_schema.md` for persistence contracts and the existing data model
4. `technical_blueprint.md` as supplemental context

The earlier phase prompt files are implementation-boundary context only. They do not override the product docs.

## Current technical assumptions
Preserve the existing EventGrid stack and workspace shape:

- `pnpm` workspace
- `turbo`
- NestJS API in `apps/api`
- current frontend structure, likely including `apps/web`
- shared types in `packages/types`
- PostgreSQL and Prisma
- Redis and BullMQ
- asset storage abstraction already present or in progress

Do not change package manager, app structure, database strategy, or core rendering technology.

## Non-negotiable data and contract rules
Continue using the saved editor contract from `database_schema.md`:

- `CanvasDocument`
- `ViewportState`
- `Layer`
- `CanvasObject`
- `CountsSummary`
- `MapViewState`

Phase 5 must work with that contract, not replace it.

For new Phase 5 persistence:

- add only the minimal new schema needed for AI jobs, review comments, approvals, presence, or quote hooks
- prefer additive tables and nullable metadata over destructive changes
- keep quote integration at the metadata and extension-hook level unless the docs require more
- ensure AI outputs normalize back into standard EventGrid objects

Note that `database_schema.md` explicitly deferred comment threads, approvals, pricing catalog data, and realtime presence. Phase 5 may introduce the minimal versions of those surfaces now, but only in a controlled, additive manner.

## Implementation priorities
Implement in this order unless the repo shape makes a small reordering safer:

1. AI pipeline foundation
- Add the asynchronous upload-to-diagram flow using the existing or planned job infrastructure.
- Define the AI service contract cleanly and keep it separate from core business logic.
- Support file upload, queued processing, normalized output payloads, failure handling, and confidence metadata.

2. Editable AI draft ingestion
- Convert AI results into normal EventGrid objects or draft project versions.
- Ensure AI output is editable and never treated as final truth.
- Keep the output normalization compatible with the existing `CanvasDocument` and object model.

3. Review and acceptance workflow
- Add manual review, confirmation, and acceptance steps before AI output becomes a canonical project version.
- Add comments and approvals for non-editing stakeholders in a way that respects existing role boundaries.
- Keep review features layered on top of project versions rather than embedded into editor internals.

4. Controlled smart skins
- Add curated material presets first.
- If text-prompted skin generation is added, keep it tightly controlled and optional.
- Do not make skins depend on unstable Phase 2 editor internals.

5. Collaboration and presence
- Add richer collaboration or presence only if it can be introduced safely and without degrading saved version integrity.
- Treat presence as additive and non-authoritative.
- Do not compromise autosave, snapshots, or version restore behavior.

6. Quote integration hooks
- Extend object metadata and export summaries so downstream quote workflows can consume SKU, cost, quoted price, and labor-estimate hooks.
- Keep this as integration-ready scaffolding, not a mandatory pricing rewrite of the app.

## Operational safeguards
- AI and advanced workflows must fail safely and visibly.
- AI jobs must not overwrite or mutate current project versions without an explicit user action.
- Long-running processing must expose status and retry or failure information.
- If the Python AI service is not present yet, define a stable adapter and queue contract without blocking the rest of the app.
- If Phase 2 editor endpoints are still moving, keep AI ingestion behind a draft-version or staging boundary instead of wiring directly into unstable save paths.
- If Phase 4 map or calibration state is still moving, do not build AI assumptions that require spatial state to be final.

## Explicit exclusions
Do not do these as part of this Phase 5 pass unless the docs explicitly require them:

- rewrite the editor core
- rewrite spatial or venue systems
- redesign project setup or dashboard fundamentals
- implement unrestricted image generation
- make AI output auto-publish into live project versions
- force realtime collaboration into all editor sessions
- turn quote hooks into a full ERP or CRM integration

## Quality bar
- AI output must be editable, reviewable, and clearly non-authoritative.
- Review and approval flows must not corrupt version history.
- Collaboration features must not degrade editor stability.
- Quote hooks must extend the product without distorting the core scene model.
- Phase 5 systems must layer onto the product, not destabilize work already built or still underway.

## Acceptance criteria to target
Aim to satisfy the Phase 5 outcomes from `development_plan.md`:

- A user can upload a diagram and receive an editable draft plus confidence indicators.
- AI output never overwrites an existing layout without an explicit user action.
- Reviewers can leave comments or approvals against project versions.
- Object metadata can support downstream quote workflows without changing the saved scene model.
- Collaboration features do not corrupt saved versions or editor stability.

## Working style
- Start by summarizing current repo state and identifying which Phase 2 and Phase 4 surfaces are still active or risky to touch.
- Implement Phase 5 using isolated modules, routes, queues, adapters, and additive schema changes.
- Before editing a shared file, confirm whether a new service, module, route, feature flag, or extension point can solve the problem first.
- If you must touch shared code, keep the change minimal and backward-compatible.
- Run relevant checks and report the actual results.
- If some Phase 5 work is blocked by unfinished Phase 2 or Phase 4 surfaces, complete the independent AI, review, and integration-hook work first and clearly identify the blocked items.

## End-of-run report
At the end of your run, provide:

1. A concise summary of what you implemented
2. A list of files created or modified
3. Commands run and whether they passed
4. Which Phase 5 acceptance criteria were completed
5. Which areas you intentionally avoided to prevent interference with active Phase 2 and Phase 4 work
6. The single highest-value next step

Do not rewrite the product docs. Use them to build, and preserve the work already underway.
