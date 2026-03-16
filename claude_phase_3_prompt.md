# Claude Prompt: EventGrid Phase 3 Business Workflow

Use this as the starting prompt for Claude to begin Phase 3 implementation work in this repository without interfering with active Phase 1 and Phase 2 work.

## Prompt
You are the implementation agent for EventGrid. Start Phase 3 work in this repository, but do it in a way that does not disrupt or rewrite active Phase 1 and Phase 2 implementation that may still be in progress.

Read these files first and follow them in this order:

1. `development_plan.md`
2. `product_requirements_document.md`
3. `database_schema.md`
4. `technical_blueprint.md`
5. `README.md`
6. `claude_phase_1_prompt.md`
7. `claude_phase_2_prompt.md`

Then inspect the current repo state before making changes.

## Mission
Implement Phase 3: Business Workflow for EventGrid.

Per `development_plan.md`, this phase should make EventGrid meaningfully better than a layout-only tool by adding repeatable sales and operations workflows on top of the Phase 2 editor.

## Phase 3 scope
Implement the Phase 3 capabilities defined in the docs:

- project dashboard search across project number, client name, venue, address, and event date
- named version snapshots and restore flows on top of autosave
- guest count estimation, seated count, cocktail capacity, and table numbering
- attachment logic for common arrangements such as chairs around tables and accessories around tents
- alignment tools, snap-to-object behavior, and distribution actions
- image overlay upload, placement, rotation, opacity control, and locking
- richer audit history and dashboard metadata with version and export visibility

Use the PRD requirements for the exact behaviors inside this phase, especially:

- `PROJ-07`
- `PROJ-08`
- `CAN-08`
- `CAN-09`
- `OBJ-04`
- `LAY-04`
- `LAY-05`
- `OVR-01`
- `RPT-02`
- `RPT-03`
- `RPT-04`
- `EXP-04`
- `SRCH-02`
- `SRCH-03`

## Hard non-interference rules
Phase 1 and Phase 2 are active. You must assume their code is incomplete, unstable, or currently being changed by another agent.

Because of that:

- Do not regenerate the repo or restructure the monorepo.
- Do not replace or rewrite core auth, team, storage, jobs, or workspace setup unless a change is strictly additive and required.
- Do not replace the Phase 2 editor architecture, canvas engine, or persistence model.
- Do not rename existing modules, folders, routes, packages, or shared contracts just to fit your preference.
- Do not churn foundational Prisma models or Phase 2 APIs unless you are making a backward-compatible additive change required for Phase 3.
- Do not “clean up” unrelated code.
- Do not pull Phase 4 or Phase 5 work forward.

If a Phase 1 or Phase 2 dependency is unfinished:

- build against the existing interfaces if possible
- add a thin adapter or extension point instead of rewriting the upstream area
- keep changes localized to new modules, routes, components, services, or additive schema changes
- leave explicit TODOs only where absolutely necessary

## Change strategy
Favor additive work in isolated seams.

Good Phase 3 change patterns:

- add dashboard search endpoints and UI on top of existing project records
- add manual snapshot flows on top of existing autosave and project version concepts
- add reporting services that derive counts from `CanvasDocument`
- add attachment metadata and rules in ways that remain compatible with the existing `CanvasObject` contract
- add overlay handling as an object type workflow, not as a separate editor system
- add alignment and snapping utilities without rewriting the canvas core

Bad change patterns:

- replacing the saved document shape
- rebuilding the entire editor state store
- redesigning the monorepo
- rewriting auth because a guard is inconvenient
- inventing a second persistence path for layout data

## Document precedence
If the docs appear to conflict, use this precedence:

1. `development_plan.md` for what belongs in Phase 3
2. `product_requirements_document.md` for behavior and acceptance requirements
3. `database_schema.md` for persistence contracts and saved payloads
4. `technical_blueprint.md` as supplemental context

The Phase 1 and Phase 2 prompt files are context about intended implementation boundaries. Use them to avoid overlap, not as product truth that overrides the main docs.

## Current technical assumptions
Build on the current EventGrid stack and preserve it:

- `pnpm` workspace
- `turbo`
- NestJS API in `apps/api`
- shared types in `packages/types`
- Next.js frontend in `apps/web` if it exists, or add Phase 3 UI to whatever frontend scaffold is already present
- PostgreSQL and Prisma
- Redis and BullMQ

Do not switch package manager, app structure, database strategy, or canvas technology.

## Non-negotiable data contract
Continue using the saved editor contract from `database_schema.md`:

- `CanvasDocument`
- `ViewportState`
- `Layer`
- `CanvasObject`
- `CountsSummary`

Phase 3 additions must remain compatible with this contract. If you extend it, do so minimally and in a backward-compatible way that would not break in-flight Phase 2 work.

## Implementation priorities
Implement in this order unless the repo shape makes a small reordering safer:

1. Search and dashboard enrichment
- Add project search across the documented fields.
- Show event date, status, last updated time, and latest thumbnail where available.
- Keep search additive to the existing dashboard and project APIs.

2. Manual versions and restore
- Add named manual snapshots on top of existing autosave or current-version flows.
- Support listing, creating, and restoring snapshots.
- Preserve the latest editable state and avoid breaking autosave behavior.

3. Reporting and numbering
- Add guest count estimation, seated count, cocktail capacity, and richer counts derived from saved layout objects.
- Add automatic table numbering with sequential, zone-based, and prefix options.
- Keep count rules explicit and deterministic.

4. Attachment logic
- Add parent-child attachment behavior for common arrangements such as chairs around tables and tent accessories.
- Prefer data-driven anchor logic and object definition metadata.
- Make movement, rotation, and save-load behavior consistent.

5. Alignment and snap enhancements
- Add snap-to-object edges and centers.
- Add contextual alignment and distribution actions.
- Do this as editor enhancements, not a rewrite of the canvas core.

6. Image overlays
- Add image upload, placement, rotation, opacity control, locking, and layer behavior.
- Keep this in Phase 3 only; do not add calibration or map alignment.

7. Export and audit enrichment
- Include latest counts summary and project metadata in exportable deliverables where Phase 3 calls for it.
- Enrich audit and dashboard metadata with version and export visibility.

## Explicit exclusions
Do not implement these as part of Phase 3:

- Mapbox background modes
- overlay calibration
- venue geometry expansion beyond what Phase 2 already needed
- AI upload-to-diagram
- AI textures or skins
- comments or approvals
- realtime collaboration
- quote pricing integrations
- CRM or ERP integrations

## Quality bar
- All Phase 3 work must preserve desktop-first editor responsiveness.
- Reporting outputs must be explainable and deterministic.
- Search must be useful, not just technically present.
- Attachment behavior must remain stable through move, rotate, save, and reload.
- New Phase 3 features must feel integrated with the existing product, not bolted on.

## Acceptance criteria to target
Aim to satisfy the Phase 3 outcomes from `development_plan.md`:

- Users can find projects quickly by the required business fields.
- Users can create and restore named project snapshots.
- Guest counts and table numbering generate deterministically from the saved layout.
- Chairs and similar child objects stay attached correctly when parent objects move.
- Image references can be placed and used during editing without blocking save and export workflows.

## Working style
- Start by summarizing current repo state and identifying any active Phase 1 or Phase 2 surfaces you must avoid touching.
- Implement Phase 3 in the most isolated, additive way possible.
- Before editing a shared file that likely belongs to Phase 1 or Phase 2, confirm whether you can solve the problem in a new file or extension layer first.
- If you must touch shared code, keep the diff minimal and backward-compatible.
- Run relevant checks and report the real results.
- If some Phase 3 work is blocked by unfinished upstream work, complete the independent parts first and clearly list the blocked items.

## End-of-run report
At the end of your run, provide:

1. A concise summary of what you implemented
2. A list of files created or modified
3. Commands run and whether they passed
4. Which Phase 3 acceptance criteria were completed
5. Which items were intentionally deferred to avoid interfering with active Phase 1 and Phase 2 work
6. The single highest-value next step

Do not rewrite the product docs. Use them to build, and preserve the work already underway.
