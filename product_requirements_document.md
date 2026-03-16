# EventGrid Product Requirements Document

## Document Summary
- Product: EventGrid
- Audience: Product, design, engineering, and delivery leads
- Source: Derived from `technical_blueprint.md`
- Purpose: Convert the blueprint into an execution-ready product specification

## Product Summary
EventGrid is a browser-based event layout platform for sales and operations teams that need to design tented and non-tented event setups quickly, accurately, and repeatably. The product combines a lightweight CAD-style editor, reusable venue and template data, reporting for guest and rental counts, export workflows, and later-phase AI-assisted diagram interpretation.

The product should be built in this order:

1. Layout editor first
2. Sales workflow support second
3. AI assistance third

## Problem Statement
Event sales and planning teams usually work across several disconnected tools:

- Email or CRM for client intake
- Spreadsheets for counts and quoting
- Static diagrams or image editors for layouts
- Shared folders for versioned files
- Separate mapping tools for site context

This creates slow turnaround, inconsistent layouts, poor version control, and avoidable mistakes in guest capacity and rental counts. EventGrid should replace that fragmented process with one hosted system that moves a user from project setup to layout draft to exportable presentation asset.

## Product Goals
EventGrid should achieve the following business outcomes:

1. Reduce time from inquiry to first usable layout draft.
2. Preserve dimensional accuracy for tents, furniture, and venue geometry.
3. Turn layouts into operational outputs such as counts, table numbering, and exports.
4. Make layouts repeatable through projects, templates, venues, and version history.
5. Provide a stable data model that can support map overlays, AI interpretation, and quote integration later.

## Non-Goals
The initial product should explicitly avoid these traps:

- Building a full general-purpose CAD platform
- Shipping Figma-style real-time multiplayer as a launch requirement
- Treating AI output as authoritative or auto-applying it without user review
- Building deep CRM or ERP integrations before the core editor and data model are stable
- Optimizing for mobile-first field editing before desktop workflows are reliable

## Product Defaults
The working defaults for this product are:

- Frontend: Next.js, TypeScript, Tailwind CSS, shadcn/ui, React Konva
- Frontend state: Zustand, TanStack Query, React Hook Form, Zod
- Backend: NestJS on Node.js
- Database: PostgreSQL with Prisma
- Storage: AWS S3
- Background jobs: Redis and BullMQ
- Maps: Mapbox
- Export: client or server PDF generation via `pdf-lib`
- AI architecture: separate Python service for diagram interpretation and texture workflows
- Authentication: Auth.js

## Users and Personas
| Persona | Primary goal | Main pain points |
| --- | --- | --- |
| Sales Rep | Build a client-ready layout fast and export it | Too many tools, manual counts, slow revisions |
| Designer / Planner | Create accurate layouts with reusable assets | Weak controls in slide tools, no geometry model |
| Admin / Manager | Control team access, templates, and project records | No shared system of record, poor audit trail |
| Viewer / Reviewer | Review layouts and exports without editing them | Hard to find latest version, unclear status |

## Jobs To Be Done
- When a new inquiry arrives, a sales rep wants to create a layout quickly so they can respond with a visual proposal.
- When planning a repeat venue, a designer wants reusable venue geometry and templates so they do not redraw the same layout foundations.
- When preparing a quote, a team wants guest counts, object counts, and tent dimensions so pricing and staffing are based on the actual plan.
- When revisiting a past event, a team wants searchable project history and version snapshots so they can reuse prior work safely.
- When using AI later, a user wants a draft they can correct, not a hidden black-box output that overwrites their work.

## Release Framing
EventGrid should be delivered in five product phases:

1. Foundation
2. Core Editor MVP
3. Business Workflow
4. Venue + Spatial
5. AI + Advanced Ops

The Core Editor MVP is the first sellable product. Search, advanced reporting, venue spatial tooling, and AI are intentionally phased after the editor and data model are stable.

## Primary User Journeys
### 1. New project to export
1. User signs in and opens the dashboard.
2. User creates a new project and enters project metadata.
3. User selects blank canvas or a starting template.
4. User builds a layout on the grid using tents, furniture, labels, and measurements.
5. System autosaves changes and updates save status.
6. User exports PNG or PDF for client review.

### 2. Template-based repeat event
1. User creates a project from a saved template.
2. User adjusts dimensions, counts, and labels for the new event.
3. User saves named version snapshots as the layout evolves.
4. User reopens the project later from search and continues editing.

### 3. Venue-based planning
1. User selects a saved venue.
2. User places a layout against reusable venue geometry.
3. User later toggles into satellite or hybrid view for presentation and validation.
4. System preserves map state and calibration with the project version.

### 4. AI-assisted redraw
1. User uploads a sketch, site plan, or floor plan.
2. System runs an asynchronous AI job and returns an editable draft.
3. User reviews confidence indicators and corrects the result manually.
4. Approved draft becomes a normal project version.

## Scope by Phase
| Capability | Core Editor MVP | Phase 3 | Phase 4 | Phase 5 |
| --- | --- | --- | --- | --- |
| Auth and team roles | Yes | Yes | Yes | Yes |
| Project creation and templates | Yes | Yes | Yes | Yes |
| Grid-based editor | Yes | Yes | Yes | Yes |
| Object library and tent builder | Yes | Yes | Yes | Yes |
| Autosave and exports | Yes | Yes | Yes | Yes |
| Search and version snapshots | No | Yes | Yes | Yes |
| Guest count and table numbering | No | Yes | Yes | Yes |
| Image overlays | No | Yes | Yes | Yes |
| Venue geometry and map overlays | No | No | Yes | Yes |
| AI diagram interpretation | No | No | No | Yes |
| Smart skins and review workflows | No | No | No | Yes |

## Functional Requirements
Each requirement is written as a testable product rule.

### Auth and Roles
- `AUTH-01 [MVP]` The system must require authentication before a user can access project, venue, template, asset, or export data.
- `AUTH-02 [MVP]` The system must support team-scoped roles: `ADMIN`, `SALES`, `DESIGNER`, and `VIEWER`.
- `AUTH-03 [MVP]` `VIEWER` users must have read-only access to projects, templates, venues, exports, and reports.
- `AUTH-04 [MVP]` All project, template, venue, and asset access must be restricted to the active team.
- `AUTH-05 [Phase 5]` Review and approval workflows must allow non-editing stakeholders to comment on versions without direct canvas edit access.

### Project, Template, and Venue Management
- `PROJ-01 [MVP]` The entry flow must provide `New Project`, `From Template`, `Open Existing Project`, `Open Venue`, and `Upload Diagram / Site Plan` actions.
- `PROJ-02 [MVP]` Before opening the canvas, the project setup flow must capture project number, client first name, client last name, venue name, event date, address, optional template selection, and initial background mode.
- `PROJ-03 [MVP]` The system must store projects, templates, and venues as separate reusable records.
- `PROJ-04 [MVP]` Users must be able to save a layout as a project and save a reusable starting state as a template.
- `PROJ-05 [MVP]` The system must autosave layout changes without requiring manual submission.
- `PROJ-06 [MVP]` The UI must show visible save state so users can distinguish saving, saved, and failed states.
- `PROJ-07 [Phase 3]` Users must be able to create named manual version snapshots separate from autosaves.
- `PROJ-08 [Phase 3]` Users must be able to search projects by project number, client first name, client last name, venue name, address, and event date.
- `PROJ-09 [Phase 4]` Users must be able to create reusable venue records with geometry, notes, fixed obstacles, entrances, exits, and default map settings.

### Editor Canvas
- `CAN-01 [MVP]` The editor must provide a large bounded working canvas optimized for mouse and keyboard input.
- `CAN-02 [MVP]` The editor must support pan, zoom, select, multi-select, drag, duplicate, delete, copy, paste, and keyboard nudging.
- `CAN-03 [MVP]` The editor must render a visible grid and let users toggle snap-to-grid on and off.
- `CAN-04 [MVP]` Supported objects must expose resize handles, rotation controls, and numeric dimension entry.
- `CAN-05 [MVP]` The editor must provide undo and redo for in-session editing actions.
- `CAN-06 [MVP]` The editor must support text labels, basic shapes, and measurement or ruler objects.
- `CAN-07 [MVP]` The editor must protect against accidental loss with unsaved-changes handling when a save is still in progress.
- `CAN-08 [Phase 3]` The editor must support snap-to-object edges and centers.
- `CAN-09 [Phase 3]` The editor must provide contextual alignment tools for selected objects, including align and distribute actions.
- `CAN-10 [Phase 5]` Presence and richer collaboration must not degrade the baseline single-user editing experience.

### Object Library and Object System
- `OBJ-01 [MVP]` The seeded object library must include tents, tables, chairs, stages, dance floors, bars, restrooms, lounge furniture, fencing or barriers, generic rectangles, circles, polygons, text, and image overlays.
- `OBJ-02 [MVP]` Every object must persist a canonical data structure that includes ID, type, subtype, position, dimensions, rotation, z-order, layer, visibility, lock state, style, metadata, and relationship fields.
- `OBJ-03 [MVP]` Object definitions must be data-driven so the same model powers rendering, save and load, export, counts, and later AI interpretation.
- `OBJ-04 [Phase 3]` Parent-child attachment logic must support common event arrangements such as chairs around tables, stage stairs attached to stages, and accessories attached to tent boundaries.
- `OBJ-05 [Phase 5]` Objects may support curated material presets and AI-assisted skin generation after manual editing workflows are mature.

### Tent Builder
- `TENT-01 [MVP]` The tent builder must support square, rectangle, oval, and polygon tent footprints.
- `TENT-02 [MVP]` Polygon tents must require side count input before placement.
- `TENT-03 [MVP]` Tent objects must persist footprint geometry, dimensions, orientation, and structural metadata.
- `TENT-04 [Phase 4]` Tent placement should support venue-aware workflows that reference venue boundaries and fixed site features.
- `TENT-05 [Phase 5]` Advanced structural options such as pole placement and sidewall segmentation may be added once the base tent model is stable.

### Layers and Object Organization
- `LAY-01 [MVP]` The editor must provide visible layers for base map, venue boundary, tent, furniture, decor, labels, uploaded overlays, and measurements.
- `LAY-02 [MVP]` Users must be able to reorder layers and objects forward and backward and send them to front or back.
- `LAY-03 [MVP]` Users must be able to lock, hide, and rename layers.
- `LAY-04 [Phase 3]` Users must be able to group and ungroup objects.
- `LAY-05 [Phase 3]` Users must be able to filter layers by type and optionally assign color tags.

### Overlays and Spatial Context
- `OVR-01 [Phase 3]` Users must be able to upload PNG or JPEG reference images and place, resize, rotate, change opacity, and lock them on the canvas.
- `OVR-02 [Phase 4]` Users must be able to calibrate overlays to scale by choosing two points and entering a known real-world distance.
- `OVR-03 [Phase 4]` Users must be able to switch background mode between `GRID`, `SATELLITE`, and `HYBRID` using Mapbox.
- `OVR-04 [Phase 4]` The system must persist map center, zoom, bearing, pitch, and calibration state as part of a saved project version.

### Reporting and Sales Support
- `RPT-01 [MVP]` The system must generate object count summaries by type and subtype for the current layout.
- `RPT-02 [Phase 3]` The system must generate guest count estimates using attached seating, loose seating, standing assumptions, and user overrides.
- `RPT-03 [Phase 3]` The system must support automatic table numbering with sequential, zone-based, and prefix formats.
- `RPT-04 [Phase 3]` Reports must expose seated guest count, cocktail capacity, table counts, chair counts, tent dimensions, and used square footage.
- `RPT-05 [Phase 5]` Objects may later map to rental SKU, internal cost, quoted price, and setup labor estimates.

### Exports
- `EXP-01 [MVP]` Users must be able to export the active layout to PNG.
- `EXP-02 [MVP]` Users must be able to export the active layout to PDF.
- `EXP-03 [MVP]` Export generation must be tracked asynchronously with visible status and downloadable output assets.
- `EXP-04 [Phase 3]` Export outputs should include the latest counts summary and project metadata for distribution-ready deliverables.

### Search and Dashboard
- `SRCH-01 [MVP]` The dashboard must show recent projects, templates, and venues relevant to the signed-in team.
- `SRCH-02 [Phase 3]` Project search must support partial matches across project number, client name, venue name, and address.
- `SRCH-03 [Phase 3]` Search results must show event date, status, last updated timestamp, and the latest thumbnail where available.

### AI
- `AI-01 [Phase 5]` Users must be able to upload a sketch, scanned plan, PDF, or aerial screenshot for asynchronous diagram interpretation.
- `AI-02 [Phase 5]` AI interpretation must return an editable draft composed of normal EventGrid objects rather than a locked image output.
- `AI-03 [Phase 5]` AI results must include confidence indicators and require user confirmation before they replace or create a canonical project version.
- `AI-04 [Phase 5]` AI-generated textures or skins must start as curated presets or controlled prompts, not unrestricted image generation.

## Non-Functional Requirements
- `NFR-01` The editor should feel responsive during common workflows and target smooth interaction on modern desktop browsers with typical event scenes.
- `NFR-02` Autosave should persist changes within a short idle window and must surface failures to the user immediately.
- `NFR-03` Saved layouts must be versioned so future schema changes can migrate documents safely.
- `NFR-04` Team data isolation must be enforced at the application and database query layers.
- `NFR-05` All uploads, exports, and AI jobs must be traceable through status records and audit events.
- `NFR-06` Core editing workflows must be keyboard operable for desktop users.
- `NFR-07` The product is desktop-first for initial release; mobile and tablet optimization are deferred.
- `NFR-08` AI processing and exports must run asynchronously so the editor remains interactive.
- `NFR-09` The system should log enough metadata to debug failed saves, failed exports, and failed AI jobs.

## MVP Out of Scope
The following items are intentionally deferred beyond the Core Editor MVP:

- Real-time concurrent editing
- Approval and commenting workflow
- AI upload-to-diagram
- AI-generated textures
- CRM or ERP integration
- Rental pricing automation
- Collision warnings and smart layout suggestions
- Mobile-first field workflow
- Full overlay calibration and spatial map alignment

## Dependencies and Integrations
- Mapbox for satellite and hybrid map backgrounds in Phase 4
- AWS S3 for uploaded overlays, exports, thumbnails, and future AI files
- Redis and BullMQ for export and AI job orchestration
- PostgreSQL full-text or trigram search for project lookup
- Separate Python AI service for diagram interpretation and texture workflows in Phase 5

## Risks
- Overbuilding editor complexity before sales workflow value is proven
- Canvas performance degradation from a poor object model or excessive rerenders
- A weak save document structure causing rework across templates, exports, search, and versioning
- Map calibration drift between layout coordinates and satellite context
- User distrust if AI results are presented as final instead of editable drafts

## Success Metrics
- Most first-pass layouts should be creatable within 15 minutes of project setup.
- Users should be able to reopen the latest project version without manual recovery steps.
- Export jobs should complete reliably enough to support same-session client sharing.
- Teams should be able to find existing projects quickly by project number, client name, venue, or date once search ships.
- Later AI drafts should reduce redraw time without lowering trust in final editable layouts.

## Acceptance Scenarios
1. A sales rep creates a new project, lays out a tented event, sees count summaries, and exports a PDF.
2. A user starts from a template, saves named versions, searches for the project later, and reopens it.
3. A team creates a reusable venue, applies a layout on grid mode, then reopens it in satellite or hybrid view.
4. A user uploads a site plan and receives an editable AI draft with confidence indicators and manual confirmation.
