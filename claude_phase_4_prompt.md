# Claude Prompt: EventGrid Phase 4 Venue + Spatial

Use this as the starting prompt for Claude to begin Phase 4 implementation work in this repository in a non-invasive way.

## Prompt
You are the implementation agent for EventGrid. Start Phase 4 work in this repository, but do it in a way that stays additive and does not interfere with the active implementation work still underway for Phase 1 and Phase 2.

Phase 3 is considered complete. Build on it instead of redesigning it.

Read these files first and follow them in this order:

1. `development_plan.md`
2. `product_requirements_document.md`
3. `database_schema.md`
4. `technical_blueprint.md`
5. `README.md`
6. `claude_phase_1_prompt.md`
7. `claude_phase_2_prompt.md`
8. `claude_phase_3_prompt.md`

Then inspect the current repo state before making changes.

## Mission
Implement Phase 4: Venue + Spatial for EventGrid.

Per `development_plan.md`, this phase should add reusable venue intelligence and spatial context without destabilizing the editor.

## Phase 4 scope
Implement the Phase 4 capabilities defined in the docs:

- finalize the venue library with reusable venue boundaries, fixed obstacles, entrances, exits, loading zones, and utilities
- apply venue defaults when creating new projects
- integrate Mapbox for `GRID`, `SATELLITE`, and `HYBRID` backgrounds
- persist map center, zoom, bearing, pitch, and calibration state per project version
- add overlay and map calibration workflows so layout units can align to site context
- improve the relationship between venue geometry, placed objects, and saved project versions

Use the PRD requirements for exact Phase 4 behavior, especially:

- `PROJ-09`
- `TENT-04`
- `OVR-02`
- `OVR-03`
- `OVR-04`

Use the schema doc for the venue and map persistence surfaces already defined, especially:

- `venues.default_map_view`
- `venues.geometry`
- `venues.fixtures`
- `venues.utilities`
- `MapViewState`
- `CanvasDocument.background`

## Non-invasive rules
Phase 1 and Phase 2 are still in progress. You must assume foundational setup and core editor work are still moving.

Because of that:

- Do not regenerate the repo or restructure the monorepo.
- Do not replace or rewrite auth, teams, storage, job wiring, or workspace setup.
- Do not replace the existing Phase 2 editor architecture, save model, or export flows.
- Do not redesign completed Phase 3 workflows such as search, snapshotting, reporting, attachment logic, or overlay basics unless a tiny backward-compatible extension is required.
- Do not rename existing modules, packages, routes, or shared contracts just to fit your preference.
- Do not churn Prisma models or shared payload contracts unless the change is additive and backward-compatible.
- Do not pull Phase 5 work forward.

If you need to touch shared code:

- prefer extension points over refactors
- keep diffs minimal
- preserve existing behaviors
- avoid changing public contracts unless absolutely necessary
- if a dependency is unstable, isolate your work behind new modules, routes, services, feature flags, or opt-in UI

## Change strategy
Favor isolated venue and spatial work that layers onto the current product.

Good change patterns:

- add venue-specific modules, routes, UI panels, services, and persistence helpers
- extend the existing saved document model with backward-compatible spatial metadata only where necessary
- add Mapbox integration as an optional background mode that does not break plain grid mode
- build calibration as a dedicated workflow rather than weaving it into unrelated editor controls
- keep venue geometry and fixed-site features in venue-focused data structures

Bad change patterns:

- rewriting the canvas store to accommodate map state
- changing the autosave/version model just to support calibration
- reworking completed Phase 3 reporting or search logic
- rebuilding project setup from scratch
- coupling venue geometry tightly to unfinished Phase 1 or Phase 2 internals

## Document precedence
If the docs appear to conflict, use this precedence:

1. `development_plan.md` for what belongs in Phase 4
2. `product_requirements_document.md` for behavior and acceptance requirements
3. `database_schema.md` for persistence contracts
4. `technical_blueprint.md` as supplemental context

The phase prompt files are implementation-boundary context only. They do not override the main product docs.

## Current technical assumptions
Preserve the existing EventGrid stack and current workspace shape:

- `pnpm` workspace
- `turbo`
- NestJS API in `apps/api`
- shared types in `packages/types`
- existing frontend structure, likely including or expecting `apps/web`
- PostgreSQL and Prisma
- Redis and BullMQ

Do not change package manager, app structure, database strategy, or core canvas technology.

## Non-negotiable persistence contract
Keep the existing saved editor and map contracts aligned to `database_schema.md`:

- `CanvasDocument`
- `ViewportState`
- `Layer`
- `CanvasObject`
- `CountsSummary`
- `MapViewState`

Any Phase 4 extension must be backward-compatible with the existing saved document model and safe for in-flight Phase 1 and Phase 2 work.

## Implementation priorities
Implement in this order unless the repo shape makes a small reordering safer:

1. Venue library finalization
- Add or extend venue CRUD and management flows for reusable venue boundaries and site features.
- Support boundaries, fixed obstacles, entrances, exits, loading zones, and utilities.
- Keep venue records reusable across projects.

2. Spatial state model
- Add or confirm the additive persistence needed for map state and calibration.
- Keep venue defaults separate from per-project-version map state.
- Make sure project versions can persist map center, zoom, bearing, pitch, and calibration state without breaking existing loads.

3. Mapbox background integration
- Add `GRID`, `SATELLITE`, and `HYBRID` background modes.
- Keep plain grid mode stable and available even if Mapbox configuration is missing.
- Make Mapbox integration opt-in and environment-driven so it does not block current work.

4. Calibration workflows
- Add overlay and map calibration so layout units can align to real-world site context.
- Treat calibration as a dedicated venue and spatial workflow with saved state.
- Preserve save, load, and export behavior while calibration data is present.

5. Venue-aware placement
- Improve how venue geometry relates to placed objects and saved versions.
- Support venue-aware tent placement against boundaries and fixed site features.
- Do not implement collision warnings or smart layout suggestions here.

6. Project integration
- Apply venue defaults when creating or opening projects tied to a venue.
- Keep this additive to existing project setup and editor flows.
- Avoid rewriting the current Phase 2 entry flow unless a targeted extension is necessary.

## Operational safeguards
- If Mapbox credentials are missing, implement the integration behind configuration checks so the app still works without crashing.
- If a shared frontend surface is clearly under active Phase 2 construction, add the Phase 4 entry points in adjacent modules or gated routes instead of trying to finish their work.
- If a schema change is required, make it additive and safe for partially completed upstream work.

## Explicit exclusions
Do not implement these as part of Phase 4:

- AI upload-to-diagram
- AI textures or skins
- comments or approvals
- realtime collaboration
- quote pricing integration
- CRM or ERP integration
- collision warnings
- smart layout suggestions
- advanced tent structural logic from Phase 5

## Quality bar
- Venue and spatial work must feel layered onto the existing product, not like a parallel app.
- Plain grid editing must remain stable.
- Saved map and calibration state must reopen deterministically.
- Venue geometry must stay reusable and understandable, not become an opaque blob.
- Spatial features must degrade gracefully when external map configuration is unavailable.

## Acceptance criteria to target
Aim to satisfy the Phase 4 outcomes from `development_plan.md`:

- A user can create a reusable venue record and apply it to more than one project.
- A user can toggle between grid, satellite, and hybrid background modes in a project.
- Map state and calibration persist when the project is reopened.
- Venue boundaries and fixed site features remain aligned with the layout after save and reload.

## Working style
- Start by summarizing the current repo state and identifying which Phase 1 and Phase 2 surfaces are still active or risky to touch.
- Implement Phase 4 using the most isolated, additive seams available.
- Before editing a shared file, confirm whether the problem can be solved in a new module, route, service, or adapter first.
- If you must touch shared code, keep the change minimal and backward-compatible.
- Run relevant checks and report the actual results.
- If part of Phase 4 is blocked by unstable upstream work, complete the independent venue and spatial pieces first and clearly call out the blocked items.

## End-of-run report
At the end of your run, provide:

1. A concise summary of what you implemented
2. A list of files created or modified
3. Commands run and whether they passed
4. Which Phase 4 acceptance criteria were completed
5. Which areas you intentionally avoided to prevent interference with active Phase 1 and Phase 2 work
6. The single highest-value next step

Do not rewrite the product docs. Use them to build, and preserve the work already underway.
