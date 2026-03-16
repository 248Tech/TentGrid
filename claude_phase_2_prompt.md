# Claude Prompt: EventGrid Phase 2 Core Editor MVP

Use this as the starting prompt for Claude to begin Phase 2 implementation work in this repository.

## Prompt
You are the implementation agent for EventGrid. Continue implementation in this repository and start Phase 2: Core Editor MVP using the existing docs and current repo state as the source of truth.

Read these files first and follow them in this order:

1. `development_plan.md`
2. `product_requirements_document.md`
3. `database_schema.md`
4. `technical_blueprint.md`
5. `README.md`

After reading the docs, inspect the repo and build on what already exists. Do not regenerate the workspace from scratch if there is already usable Phase 1 scaffolding.

## Current repo expectations
Assume the repository already has a `pnpm` and `turbo` workspace with at least:

- an existing `apps/api` NestJS service
- `packages/types`
- root workspace config and docs

The README also expects an `apps/web` frontend. If it does not exist yet, create it and wire it into the existing monorepo cleanly instead of restructuring the whole repo.

## Mission
Implement Phase 2: Core Editor MVP.

This phase should produce the first sellable version of EventGrid: a reliable grid-based layout editor with save, load, template, autosave, and export workflows.

## Phase 2 scope
Use `development_plan.md` as the phase boundary. Implement these outcomes:

- project setup flow for new projects and template-based starts
- grid-based canvas editor using React Konva
- pan, zoom, selection, multi-select, drag, duplicate, resize, rotate, undo, redo
- seeded object library for tents, tables, chairs, stages, dance floors, bars, restrooms, lounge furniture, fencing, shapes, text, and measurements
- tent builder for square, rectangle, oval, and polygon footprints
- layers, lock and hide controls, visible save state, autosave, save and reopen, template creation
- base object count summaries
- PNG and PDF export through asynchronous jobs

## Scope guardrails
Do not drift into later phases unless a tiny amount of supporting scaffolding is required. In particular, do not implement these now:

- project search
- named version snapshots beyond the autosave and current-version foundation already required for Phase 2
- guest count estimation beyond base object count summaries
- auto table numbering
- parent-child attachment logic
- snap-to-object edges and centers
- advanced alignment and distribute tools
- full image upload and overlay manipulation workflows if they are not already part of the existing foundation
- venue spatial workflows, Mapbox integration, calibration, or satellite mode
- AI upload-to-diagram
- comments, approvals, or realtime collaboration

If the docs appear to conflict, use this precedence:

1. `development_plan.md` for what belongs in Phase 2
2. `product_requirements_document.md` for behavior and acceptance expectations inside that phase
3. `database_schema.md` for persistence contracts and saved document structure
4. `technical_blueprint.md` as supplemental product context

## Technical defaults to follow
- Frontend: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- Canvas: React Konva
- Client state: Zustand for editor state, TanStack Query for server state
- Forms: React Hook Form and Zod where useful
- Backend: extend the existing NestJS app instead of replacing it
- Persistence: PostgreSQL and Prisma
- Jobs: use the existing Redis and BullMQ foundation for export jobs

## Non-negotiable persistence contract
The saved editor model must follow `database_schema.md`. Use these as the canonical persisted types:

- `CanvasDocument`
- `ViewportState`
- `Layer`
- `CanvasObject`
- `CountsSummary`

Do not invent an alternate canvas save model. If you need to extend the shape, do it in a way that remains aligned with the documented schema versioning approach.

## Implementation priorities
Implement in this order unless the repo structure makes a small reordering more practical:

1. Frontend editor shell
- Create or extend `apps/web`.
- Add authenticated routes for dashboard, project setup, project editor, and template start flow.
- Build the editor layout with a top bar, left library/tool area, center canvas, and right properties panel.
- Keep the UI desktop-first and pragmatic.

2. Project setup and load flow
- Support creating a new project with the MVP metadata fields from the PRD.
- Support starting from a template.
- Support opening an existing project and restoring the latest saved canvas state.
- Show clear save status in the UI.

3. Canvas engine
- Implement a grid-based canvas with pan and zoom.
- Support selection, multi-select, drag, duplicate, delete, resize, rotate, and keyboard nudging.
- Add undo and redo for in-session edits.
- Keep performance acceptable for normal sales-layout scenes.

4. Object model and library
- Seed the object library from the documented MVP categories.
- Make object creation data-driven using the canonical object model.
- Support text labels, basic shapes, and measurement objects.
- Implement tent object creation for square, rectangle, oval, and polygon shapes, including polygon side count input.

5. Layers and properties
- Provide default layers aligned to the docs.
- Support reorder, hide, lock, and rename behavior where Phase 2 requires it.
- Add properties editing for dimensions, rotation, visibility, and relevant object metadata.

6. Save, autosave, templates, and reopen
- Persist the editor as `CanvasDocument` in the existing backend.
- Implement autosave with visible save state and failure handling.
- Support save and reopen on the latest project version.
- Support template creation from a saved layout.

7. Counts and export
- Generate base object count summaries by type and subtype.
- Implement PNG and PDF export using asynchronous export jobs.
- Make export status visible and keep export records aligned with the existing schema.

## API and backend expectations
- Extend the NestJS API only where needed to support Phase 2 flows.
- Reuse or refine the existing schema instead of inventing side-channel storage.
- Add endpoints or services for project setup, project load, canvas save, template creation, and export job creation and retrieval.
- Keep auth and team scoping intact for every Phase 2 route and query.

## Quality bar
- The editor must feel coherent, not like disconnected demos.
- Avoid overbuilding abstract editor frameworks if direct implementation is clearer.
- Prefer simple, stable interactions over ambitious but brittle features.
- Do not sacrifice save-model clarity for short-term UI convenience.

## Acceptance criteria to hit
Aim to satisfy these concrete outcomes from `development_plan.md`:

- A sales user can create a project, place core objects, edit dimensions, and save the result.
- The latest autosaved layout can be reopened without manual recovery.
- PNG and PDF exports complete successfully from the current project version.
- Object count summaries reflect the objects on the canvas.
- The editor remains responsive during normal sales-layout use.

## Working style
- Start by summarizing the current repo state and any Phase 1 gaps that materially affect Phase 2.
- Then implement directly.
- If a small missing Phase 1 prerequisite blocks Phase 2, add only the minimum needed and continue.
- Run relevant checks after changes and report the actual results.
- If you cannot finish all of Phase 2 in one pass, leave the repo in a coherent state with the editor architecture and persistence model moving in the right direction.

## End-of-run report
At the end of your run, provide:

1. A concise summary of what you implemented
2. A list of files created or modified
3. Commands run and whether they passed
4. Remaining gaps versus the Phase 2 acceptance criteria
5. The single highest-value next step

Do not rewrite the docs. Use them to build the product.
