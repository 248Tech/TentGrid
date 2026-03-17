# EventGrid

![Release](https://img.shields.io/github/v/release/248Tech/TentGrid?display_name=tag)
![Stage](https://img.shields.io/badge/stage-usability%20update-0ea5e9)
![Deploy](https://img.shields.io/badge/deploy-docker%20compose-2496ED?logo=docker&logoColor=white)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20NestJS%20%7C%20Prisma%20%7C%20PostgreSQL-111827)
[![CI](https://github.com/248Tech/TentGrid/actions/workflows/ci.yml/badge.svg)](https://github.com/248Tech/TentGrid/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/248Tech/TentGrid)](https://github.com/248Tech/TentGrid/blob/main/LICENSE)
[![PRD](https://img.shields.io/badge/spec-PRD-0ea5e9)](./product_requirements_document.md)
[![Schema](https://img.shields.io/badge/spec-Database%20Schema-10b981)](./database_schema.md)
[![Plan](https://img.shields.io/badge/spec-Development%20Plan-f97316)](./development_plan.md)

EventGrid is a browser-based event layout platform for tent planning, venue planning, floor plan design, event sales operations, and quoting workflows. It gives sales and operations teams one workspace for creating layouts, reusing venue data, tracking versions, generating counts, handling spatial context, and preparing client-ready deliverables.

## About EventGrid

EventGrid is designed to replace the fragmented workflow of whiteboards, PDFs, screenshots, spreadsheets, and ad hoc CAD files used to scope event setups. The product combines a lightweight canvas editor, reusable venue records, search and reporting workflows, spatial overlays, and AI-assisted intake into one system that can move a user from intake to layout draft to export.

For `v0.0.2`, the repository is positioned as a usability-focused runnable release for local deployment, demos, and continued development. It is still not presented as a hardened production SaaS product.

## What Ships In v0.0.2

- Project, team, template, venue, asset, audit, and version data models backed by NestJS, Prisma, PostgreSQL, and shared TypeScript contracts.
- Browser-based web app with sign-in, projects, templates, venues, venue detail, settings, and project editor surfaces.
- Core editor workflows for object placement, tent configuration, layout state persistence, reporting, and export job orchestration.
- Business workflow support for project search, guest/count reporting, table numbering, and version snapshots.
- Venue and spatial support for reusable venue geometry, fixtures, utilities, map view persistence, and calibration endpoints.
- AI and advanced-ops scaffolding for uploads, review comments, approvals, quote retrieval, presence, and skin presets.
- Full local container stack for PostgreSQL, Redis, MinIO, AI service, API, and web app.

## Usability Updates

- Working `/projects` route plus a new-project launcher that creates a draft project and opens the CAD editor directly.
- In-editor onboarding panel for saving project details, selecting or creating a venue, and placing preset starter objects on the grid.
- Functional templates and settings pages instead of placeholder or dead-end surfaces.
- Session-backed team resolution so venues, templates, projects, and settings resolve the active team consistently after sign-in.
- More reliable local bootstrap with fixed root database seeding, updated Docker startup flow, and stronger sign-out behavior.

## Current Release Boundaries

- Credential auth is demo-local for `v0.0.2` and uses seeded development identities.
- The AI service is wired end-to-end but still returns stub detections instead of production computer-vision results.
- GitHub OAuth is optional and must be configured manually.
- Production cloud deployment, secret management, and observability should be treated as the next hardening layer after this release.

## Quick Start

### Single-script deployment

The fastest way to get EventGrid running locally is:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-local.ps1
```

Docker Desktop must already be running before you execute the script.

This script:

1. Creates missing local env files from the checked-in examples.
2. Builds and starts the full Docker Compose stack.
3. Waits for the API, web app, and AI sidecar health endpoints.
4. Prints the local URLs and demo credentials.

After startup:

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api`
- API health: `http://localhost:4000/health`
- AI health: `http://localhost:8000/health`
- MinIO console: `http://localhost:9001`

Demo sign-in:

- `admin@eventgrid.dev` / any password
- `sales@eventgrid.dev` / any password

### Container-only command

If you want the raw container workflow without the bootstrap script:

```bash
docker compose up -d --build
```

### Local development workflow

If you want to run the apps outside containers:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Use Docker for PostgreSQL, Redis, and MinIO, or point the env files at managed services.

Do not run the Dockerized web/API stack and `pnpm dev` on the same ports at the same time.

## Repository Layout

```text
eventgrid/
├── apps/
│   ├── api/                  # NestJS API
│   └── web/                  # Next.js app
├── packages/
│   └── types/                # Shared contracts
├── services/
│   └── ai/                   # Python AI sidecar
├── scripts/
│   └── deploy-local.ps1      # Single-script local bootstrap
├── product_requirements_document.md
├── database_schema.md
├── development_plan.md
└── technical_blueprint.md
```

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, NextAuth, React Konva
- Backend: NestJS 10, Prisma, PostgreSQL, BullMQ, Redis
- Spatial and assets: Mapbox-ready spatial contracts, S3-compatible storage, MinIO for local deployment
- AI sidecar: FastAPI service scaffold for diagram intake and normalization
- Tooling: pnpm workspace, Turbo, Docker Compose

## Documentation

- [Product Requirements Document](./product_requirements_document.md)
- [Database Schema](./database_schema.md)
- [Development Plan](./development_plan.md)
- [Technical Blueprint](./technical_blueprint.md)
- [Release Readiness v0.0.2](./release_readiness_v0.0.2.md)
- [Release Notes v0.0.2](./release_notes_v0.0.2.md)
- [Release Readiness v0.0.1](./release_readiness_v0.0.1.md)
- [Release Notes v0.0.1](./release_notes_v0.0.1.md)
- [Changelog](./CHANGELOG.md)

## Service Defaults

| Service | Default | Purpose |
| --- | --- | --- |
| PostgreSQL | `localhost:5432/eventgrid` | Primary relational store |
| Redis | `localhost:6379` | Queues and ephemeral state |
| MinIO | `localhost:9000` | Local S3-compatible asset storage |
| MinIO Console | `localhost:9001` | Local object storage admin UI |
| AI Service | `localhost:8000` | Diagram-processing sidecar |
| API | `localhost:4000` | EventGrid backend |
| Web | `localhost:3000` | EventGrid frontend |

## Release Notes

`v0.0.2` is a usability and local-operability update on top of the initial release. It improves the project creation flow, turns placeholder pages into working surfaces, and makes local bootstrap more reliable for demos and evaluation. See [release_notes_v0.0.2.md](./release_notes_v0.0.2.md) for the release summary and [release_readiness_v0.0.2.md](./release_readiness_v0.0.2.md) for the release audit.
