# Claude Prompt: EventGrid Phase 6 Expansion + Deployability

Use this as the starting prompt for Claude to begin Phase 6 implementation work in this repository in an additive, deployment-focused way.

## Prompt
You are the implementation agent for EventGrid. Start Phase 6 work in this repository.

Important context:

- Phases 1, 2, 3, 4, and 5 are complete.
- The formal product docs currently define Phases 1 through 5 only.

Because the docs stop at Phase 5, treat Phase 6 as a post-roadmap expansion phase that adds operational scale, deployment simplicity, and the remaining deferred high-value capabilities from `technical_blueprint.md`.

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
10. `claude_phase_5_prompt.md`

Then inspect the current repo state before making changes.

## Mission
Implement Phase 6 as the next additive expansion layer for EventGrid after the documented roadmap.

Phase 6 should focus on two things:

1. Make the full EventGrid stack easy to deploy from a single script or command.
2. Expand the product with the remaining high-value post-Phase-5 capabilities in a way that preserves the completed work.

## Phase 6 working definition
Since Phase 6 is not explicitly defined in the docs, use this definition:

Phase 6 = deployability, commercialization, field operations, intelligent validation, and external-system integration built on top of the completed product.

## Phase 6 scope
Prioritize the remaining advanced capabilities already implied by `technical_blueprint.md` and the current repo state:

- one-command or one-script deployment of the full stack
- rental catalog and quote workflow expansion
- CRM or ERP integration scaffolding and sync boundaries
- collision warnings and intelligent layout validation
- smart layout suggestions built on top of existing object, venue, reporting, and AI-assisted product foundations
- mobile or tablet optimized field mode

These items should be treated as the candidate Phase 6 backlog in this order unless the repo shape suggests a safer incremental sequence:

1. Single-script deployability
2. Quote and rental workflow expansion
3. Integration boundaries for CRM or ERP systems
4. Collision warnings and layout validation
5. Smart layout suggestions
6. Mobile or tablet field mode

## Relationship to existing docs
The main docs are still authoritative, but because they stop at Phase 5 you must infer Phase 6 from the remaining deferred items and future-direction language in `technical_blueprint.md`.

Use the docs this way:

1. `product_requirements_document.md` and `database_schema.md` define the stable contracts you must preserve.
2. `development_plan.md` defines the sequence through Phase 5 and therefore what already exists before this work lands.
3. `technical_blueprint.md` supplies the Phase 6 candidate features that were intentionally deferred earlier, such as:
   - quote integration
   - CRM/ERP integration
   - mobile/tablet field mode
   - collision warnings
   - smart layout suggestions
   - richer operational workflows

If there is tension between a Phase 6 idea and the documented product contracts, preserve the documented contracts.

## Hard non-interference rules
All earlier phases are complete. Preserve them.

Because of that:

- Do not regenerate the repo or restructure the monorepo without a compelling additive reason.
- Do not replace or rewrite the core editor, save model, version model, venue/spatial model, export pipeline, or completed AI workflow.
- Do not rename shared contracts, routes, packages, modules, or schemas just to fit your preference.
- Do not destabilize working Phase 5 AI, review, or collaboration behavior in order to make Phase 6 features easier.
- Do not redesign the existing product to “prepare” for future features unless the preparation is a small, backward-compatible extension.

If you need to extend completed areas:

- prefer adapters, extension points, feature flags, and additive modules
- keep diffs localized and backward-compatible
- preserve current public behavior unless a clear improvement is required

## Deployment-first requirement
The first Phase 6 goal is operational simplicity.

You must make EventGrid easy to deploy from a single script or single command that can bring up the complete working stack, including:

- frontend
- API
- AI service
- PostgreSQL
- Redis
- required env wiring
- database migrations or equivalent startup preparation

Good outcomes:

- one root command such as `pnpm deploy`, `./scripts/deploy.ps1`, or an equivalent single entrypoint
- containerized or scripted startup that matches the current monorepo and service layout
- documentation that explains the single deployment path clearly
- health checks or validation that confirm the stack is up

Bad outcomes:

- a deploy path that still requires many manual steps
- separate undocumented startup flows for web, API, AI, and infra
- deployment changes that break local development

## Current technical assumptions
Preserve the existing EventGrid stack and workspace shape:

- `pnpm` workspace
- `turbo`
- NestJS API in `apps/api`
- existing frontend structure, likely `apps/web`
- Python AI service in `services/ai`
- shared types in `packages/types`
- PostgreSQL and Prisma
- Redis and BullMQ
- existing asset, export, audit, review, quote, spatial, and AI foundations

Do not change package manager, workspace layout, database strategy, or rendering technology.

## Non-negotiable contract rules
Continue using the existing product contracts as the foundation:

- `CanvasDocument`
- `ViewportState`
- `Layer`
- `CanvasObject`
- `CountsSummary`
- `MapViewState`

Phase 6 features must layer on top of these rather than replace them.

Any new Phase 6 persistence should be:

- additive
- backward-compatible
- optional where possible
- isolated from core editing paths unless clearly necessary

## Implementation priorities
Implement in this order unless the repo shape suggests a safer incremental path:

1. Single-script deployment
- Add a root deployment entrypoint that can build or start the full stack in one shot.
- Prefer a deployment flow that is repeatable and matches the repo's actual services.
- Ensure env setup, infrastructure startup, migrations, and app startup are coherent.
- Update docs so the deployment flow is obvious.

2. Quote workflow expansion
- Turn the existing quote hooks into a more usable quote-oriented layer.
- Add rental SKU, pricing, labor-estimate, or quote-summary handling in a way that consumes existing object metadata.
- Keep quote logic modular and avoid hard-wiring it into every edit action.

3. External integration boundaries
- Add CRM or ERP integration scaffolding through sync adapters, queueable jobs, and explicit data-mapping layers.
- Define clear ownership of source-of-truth fields so integrations do not corrupt EventGrid project data.
- Prefer explicit boundaries before deep automation.

4. Collision warnings and layout validation
- Add warnings or validations for overlapping objects, blocked access paths, or obviously invalid spatial arrangements where current object and venue data supports it.
- Keep warnings advisory rather than destructive.
- Make the system explain why a warning exists.

5. Smart layout suggestions
- Add recommendation services that propose adjustments or placements based on object definitions, venue geometry, counts, and prior rules.
- Suggestions must be optional, reviewable, and never auto-applied without user action.
- Keep recommendation logic layered above the existing scene model and compatible with the AI work already completed.

6. Mobile or tablet field mode
- Add a focused field-mode experience for reviewing layouts, checking key metadata, and making constrained updates where appropriate.
- Do not try to port every advanced desktop editing interaction to mobile immediately.
- Favor narrow field workflows over broad parity claims.

## Operational safeguards
- All Phase 6 features must fail safely without damaging project versions or editor stability.
- The single deployment path must be documented and verifiable.
- Integrations must be traceable through jobs, statuses, or audit events.
- Suggestions and warnings must never silently mutate a project.
- Quote and pricing logic must preserve manual override paths.
- Mobile or tablet mode must degrade gracefully when advanced desktop controls are unavailable.

## Explicit exclusions
Do not do these as part of Phase 6 unless the repo clearly already contains a stable foundation for them and the work remains additive:

- rewrite the completed Phase 5 AI stack
- replatform the frontend or backend
- replace the existing persistence model
- enforce fully automatic autonomous layout changes
- build deep bidirectional enterprise integrations before adapter boundaries are stable

## Quality bar
- Phase 6 should feel like product expansion and operational polish, not architectural churn.
- The deployment path should be simple enough that a new engineer can bring up the full stack from one entrypoint.
- Commercial and integration features must remain modular.
- Warnings and suggestions must be explainable and user-controlled.
- Mobile or tablet mode must solve focused operational problems, not dilute the desktop experience.

## Acceptance criteria to target
Aim for these Phase 6 outcomes:

- the full stack can be brought up from a single documented script or command
- quote-oriented object metadata and summaries can drive a usable quoting workflow
- CRM or ERP integration boundaries exist without corrupting project ownership or save flows
- collision warnings or layout validations can be surfaced against saved scenes
- smart layout suggestions can be generated and reviewed without auto-applying changes
- a constrained field-mode experience works on tablet or mobile without compromising the desktop editor

## Working style
- Start by summarizing current repo state and identifying the simplest safe deployment path for the full stack.
- Implement Phase 6 using isolated modules, adapters, jobs, and additive schema or API extensions.
- Before editing a shared file, confirm whether a new module, service, queue, script, or feature flag can solve the problem first.
- If you must touch shared code, keep the change minimal and backward-compatible.
- Run relevant checks and report the actual results.
- If some Phase 6 work is blocked, complete the deployability work first and clearly identify the blocked items.

## End-of-run report
At the end of your run, provide:

1. A concise summary of what you implemented
2. A list of files created or modified
3. Commands run and whether they passed
4. Which Phase 6 acceptance criteria were completed
5. How the single-script deployment flow works
6. The single highest-value next step

Do not rewrite the product docs. Use them to build, and preserve the work already completed.
