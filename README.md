# EventGrid

![Release](https://img.shields.io/github/v/release/248Tech/TentGrid?display_name=tag)
![Stage](https://img.shields.io/badge/stage-v0.0.2-16a34a)
![Deploy](https://img.shields.io/badge/deploy-docker%20compose-2496ED?logo=docker&logoColor=white)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20NestJS%20%7C%20Prisma%20%7C%20PostgreSQL-111827)
[![CI](https://github.com/248Tech/TentGrid/actions/workflows/ci.yml/badge.svg)](https://github.com/248Tech/TentGrid/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/248Tech/TentGrid)](https://github.com/248Tech/TentGrid/blob/main/LICENSE)

EventGrid is a browser-based event layout platform for tent planning, venue planning, floor plan design, event sales operations, and quoting workflows.

## Running EventGrid

### Step 1 — Install Docker Desktop

EventGrid runs entirely in containers. You need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running before you continue.

- **Windows / macOS:** Download and install Docker Desktop, then open it and wait until the whale icon in your system tray shows "Docker Desktop is running."
- **Linux:** Install Docker Engine with the Compose plugin (`docker compose` v2).

### Step 2 — Launch the app

Open a terminal in the project folder and run the one-liner for your OS:

**macOS / Linux**

```bash
bash scripts/deploy-local.sh
```

**Windows (PowerShell)**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-local.ps1
```

The script will:

1. Copy the example env files into place (first run only).
2. Build and start all services (database, cache, storage, AI sidecar, API, web app).
3. Wait until every service passes its health check.
4. Print the URLs and demo credentials when ready.

> The first launch takes a few minutes while Docker pulls base images and builds the containers. Subsequent starts are much faster.

### Step 3 — Open the app

Once the script finishes, open your browser and go to:

**`http://localhost:3000`**

Sign in with one of the demo accounts (any password works):

| Account | Role |
|---|---|
| `admin@eventgrid.dev` | Admin |
| `sales@eventgrid.dev` | Sales |

### Stopping the app

```bash
docker compose down
```

Add `-v` to also delete the database and storage volumes: `docker compose down -v`

## About EventGrid

EventGrid replaces the fragmented workflow of whiteboards, PDFs, screenshots, spreadsheets, and ad hoc CAD files used to scope event setups. It combines a canvas editor, reusable venue records, search and reporting, spatial overlays, and AI-assisted intake into one system that can move a user from intake to layout draft to export.

`v0.0.2` is an iterative runnable release for local deployment, demos, and continued development. It is not yet a hardened production SaaS product.

**v0.0.2 includes:**

- Project, team, template, venue, asset, audit, and version data models.
- Browser-based app with sign-in, dashboard, templates, venues, venue detail, and project editor.
- Core editor workflows for object placement, tent configuration, layout state persistence, reporting, and export jobs.
- Business workflows for project search, guest/count reporting, table numbering, and version snapshots.
- Venue and spatial support for reusable geometry, fixtures, utilities, map view persistence, and calibration.
- Full local container stack: PostgreSQL, Redis, MinIO, AI service, API, and web app.

**Known boundaries for v0.0.2:**

- Auth uses seeded demo identities only (no real user accounts).
- The AI service returns stub detections, not production computer-vision results.
- GitHub OAuth is optional and must be configured manually.
- Production cloud deployment, secret management, and observability are out of scope for this release.

## Service URLs

| Service | URL | Purpose |
|---|---|---|
| Web app | `http://localhost:3000` | EventGrid frontend |
| API | `http://localhost:4000/api` | EventGrid backend |
| API health | `http://localhost:4000/health` | Health check |
| AI health | `http://localhost:8000/health` | AI sidecar health |
| MinIO console | `http://localhost:9001` | Object storage admin UI |

## Manual container start (no script)

If you prefer to skip the bootstrap script, copy the env files first, then start Docker Compose directly:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
docker compose up -d --build
```

## Developer setup (running outside containers)

If you want to run the apps directly on your machine for development:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Requires Node 20+, pnpm 9+, and external PostgreSQL, Redis, and MinIO instances (or point the env files at managed services).

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, NextAuth, React Konva
- Backend: NestJS 10, Prisma, PostgreSQL, BullMQ, Redis
- Storage: S3-compatible (MinIO for local), Mapbox-ready spatial contracts
- AI sidecar: FastAPI scaffold for diagram intake and normalization
- Tooling: pnpm workspace, Turbo, Docker Compose

## Documentation

- [Quickstart](./quickstart.md)
- [Release Notes v0.0.2](./release_notes_v0.0.2.md)
- [Release Notes v0.0.1](./release_notes_v0.0.1.md)
- [Changelog](./CHANGELOG.md)
- [Product Requirements Document](./product_requirements_document.md)
- [Database Schema](./database_schema.md)
- [Development Plan](./development_plan.md)
- [Technical Blueprint](./technical_blueprint.md)
- [Release Readiness v0.0.1](./release_readiness_v0.0.1.md)
