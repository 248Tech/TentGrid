# EventGrid Development Plan

## Summary
This plan turns EventGrid into a usable product in five phases, with each phase delivering a coherent user outcome and a stable technical base for the next. The sequencing is deliberate:

1. Build the secure multi-tenant foundation first.
2. Ship a reliable grid-based editor as the first real product.
3. Layer on business workflow features that make the editor valuable to sales teams.
4. Add venue intelligence and spatial context after the geometry model is proven.
5. Add AI and advanced operational workflows only after the core data model is stable.

## Sequencing Principles
- The saved editor document must be stable before map calibration, AI interpretation, or advanced collaboration are introduced.
- Layout accuracy and persistence matter more than visual polish early on.
- AI should operate on top of normalized object data, not on an unstable or ad hoc scene model.
- Spatial features are intentionally deferred because calibration and map alignment introduce a separate geometry problem.

## Phase 1: Foundation
**Goal**

Stand up the application platform, team model, storage, and baseline UI so later editor work is built on a stable backbone.

**Scope**

- Create the Next.js frontend shell and NestJS backend service boundaries.
- Implement Auth.js authentication and team-scoped authorization.
- Ship core PostgreSQL and Prisma schema for users, teams, memberships, projects, venues, templates, assets, export jobs, AI jobs, and audit logs.
- Provision S3-backed asset storage, Redis, and BullMQ.
- Add baseline UI primitives, navigation shell, dashboard skeleton, and settings surfaces.
- Establish logging, error handling, environment configuration, and deployment conventions.

**Dependencies**

- Product naming, roles, and object taxonomy are stable enough to model in the schema.
- Infrastructure access exists for PostgreSQL, S3, and Redis.

**Major Risks**

- Over-modeling the schema before real editor workflows exist.
- Weak authorization boundaries leading to cross-team data leakage.
- Delaying editor work because platform choices remain unsettled.

**Acceptance Criteria**

- A user can authenticate, join a team, and be assigned a valid role.
- Team-scoped project, venue, and template records can be created and listed through the application.
- Asset uploads can be stored and tracked through status records.
- Background job infrastructure can enqueue and process a simple non-AI job.
- Audit events are emitted for core create and update actions.

**User Outcome**

Internal users can sign in, manage team access, and create the base records that the editor will depend on.

## Phase 2: Core Editor MVP
**Goal**

Deliver the first sellable version of EventGrid: a reliable grid-based layout editor with save, load, and export workflows.

**Scope**

- Build the project setup flow for new projects and template-based starts.
- Implement the grid-based canvas using React Konva with zoom, pan, selection, drag, duplicate, resize, rotate, undo, and redo.
- Ship the seeded object library for tents, tables, chairs, stages, dance floors, bars, restrooms, lounge furniture, fencing, shapes, text, and measurements.
- Implement the tent builder for square, rectangle, oval, and polygon footprints.
- Add layers, lock and hide controls, visible save status, autosave, save and reopen, and template creation.
- Generate base object count summaries.
- Support PNG and PDF export through asynchronous jobs.

**Dependencies**

- Phase 1 authentication, schema, storage, and job infrastructure are complete.
- Canonical `CanvasDocument` and `CanvasObject` payloads are fixed enough to persist.

**Major Risks**

- Canvas performance issues from excessive rerenders or heavy object payloads.
- A weak document model that later breaks templates, exports, and versioning.
- Unclear undo and autosave behavior causing user distrust.

**Acceptance Criteria**

- A sales user can create a project, place core objects, edit dimensions, and save the result.
- The latest autosaved layout can be reopened without manual recovery.
- PNG and PDF exports complete successfully from the current project version.
- Object count summaries reflect the objects on the canvas.
- The editor remains responsive during normal sales-layout use.

**User Outcome**

The team can go from intake to layout draft to client-ready export without leaving EventGrid.

## Phase 3: Business Workflow
**Goal**

Turn the editor into a stronger sales and operations tool by adding search, counts, attachments, and reusable history.

**Scope**

- Add project dashboard search across project number, client name, venue, address, and event date.
- Implement named version snapshots and restore flows on top of autosave.
- Add guest count estimation, seated count, cocktail capacity, and table numbering.
- Implement attachment logic for common arrangements such as chairs around tables and accessories around tents.
- Add alignment tools, snap-to-object behavior, and distribution actions.
- Add image overlay upload, placement, rotation, opacity control, and locking.
- Enrich audit history and dashboard metadata with version and export visibility.

**Dependencies**

- Phase 2 editor document model and object definition library are stable.
- Attachment anchors and count rules exist in object definitions.

**Major Risks**

- Incorrect guest count logic creating quoting errors.
- Attachment logic drifting during move, resize, or rotation.
- Search returning noisy results if indexes and ranking are weak.

**Acceptance Criteria**

- Users can find projects quickly by the required business fields.
- Users can create and restore named project snapshots.
- Guest counts and table numbering generate deterministically from the saved layout.
- Chairs and similar child objects stay attached correctly when parent objects move.
- Image references can be placed and used during editing without blocking save and export workflows.

**User Outcome**

EventGrid becomes meaningfully better than a layout-only tool because it supports repeatable sales workflows and quoting preparation.

## Phase 4: Venue + Spatial
**Goal**

Add reusable venue intelligence and spatial context without destabilizing the editor.

**Scope**

- Finalize the venue library with reusable venue boundaries, fixed obstacles, entrances, exits, loading zones, and utilities.
- Apply venue defaults when creating new projects.
- Integrate Mapbox for `GRID`, `SATELLITE`, and `HYBRID` backgrounds.
- Persist map center, zoom, bearing, pitch, and calibration state per project version.
- Add overlay and map calibration workflows so layout units can align to site context.
- Improve the relationship between venue geometry, placed objects, and saved project versions.

**Dependencies**

- Phase 3 versioning and geometry contracts are stable.
- Mapbox credentials, licensing expectations, and cost controls are in place.

**Major Risks**

- Spatial drift between saved layout coordinates and map or image overlays.
- Performance degradation when rendering mapped backgrounds and large scenes together.
- Venue geometry becoming too loose or inconsistent for reuse.

**Acceptance Criteria**

- A user can create a reusable venue record and apply it to more than one project.
- A user can toggle between grid, satellite, and hybrid background modes in a project.
- Map state and calibration persist when the project is reopened.
- Venue boundaries and fixed site features remain aligned with the layout after save and reload.

**User Outcome**

Layouts become venue-aware and presentation-ready, making EventGrid useful for site-specific planning rather than only abstract drafting.

## Phase 5: AI + Advanced Ops
**Goal**

Layer intelligent assistance and higher-order operational workflows on top of the stable core product.

**Scope**

- Build the asynchronous upload-to-diagram AI pipeline using the dedicated Python service.
- Normalize AI results into editable EventGrid objects and return confidence metadata.
- Add manual review and acceptance steps before AI output becomes a canonical project version.
- Introduce curated material presets and controlled smart skin workflows.
- Add review comments, approvals, and richer collaboration or presence features.
- Prepare quote integration hooks through object metadata and exportable summaries.

**Dependencies**

- Phases 1 through 4 are complete, especially versioning, assets, and canonical object definitions.
- The AI service contract is stable and background job orchestration is proven.

**Major Risks**

- AI output quality may not be accurate enough for unattended use.
- Long-running jobs may frustrate users if status and retries are weak.
- Advanced features may create scope sprawl that distracts from the core editor value.

**Acceptance Criteria**

- A user can upload a diagram and receive an editable draft plus confidence indicators.
- AI output never overwrites an existing layout without an explicit user action.
- Reviewers can leave comments or approvals against project versions.
- Object metadata can support downstream quote workflows without changing the saved scene model.
- Collaboration features do not corrupt saved versions or editor stability.

**User Outcome**

EventGrid reduces redraw effort, supports review handoffs, and becomes a stronger bridge between design work and sales operations.

## Cross-Phase Validation Scenarios
1. New project to export is complete by the end of Phase 2.
2. Template start, named versions, and search are complete by the end of Phase 3.
3. Reusable venue plus grid-to-map workflow is complete by the end of Phase 4.
4. Upload-to-diagram AI draft workflow is complete by the end of Phase 5.

## Delivery Notes
- Do not pull Mapbox and calibration work into the Core Editor MVP just because the blueprint listed map view early; the geometry subsystem depends on a stable saved document first.
- Do not gate the product on real-time multiplayer; autosave, versioning, and clean ownership rules are more important early.
- Keep the `CanvasDocument` contract stable from Phase 2 onward, and only extend it through explicit schema versioning.
