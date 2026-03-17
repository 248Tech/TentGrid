# EventGrid Quickstart

This quickstart is based on the current repo layout and runtime configuration in `TentGrid-0.0.1`.

## Framework Snapshot

- Monorepo: `pnpm` workspace + Turborepo
- Frontend: Next.js 15 (App Router), React 19, Tailwind, NextAuth
- API: NestJS 10 + Prisma 5 + PostgreSQL
- Jobs/queue: Bull + Redis
- AI sidecar: FastAPI (Python)
- Shared contracts: `packages/types` (TypeScript)

## Repo Structure

- `apps/web`: Next.js frontend (`@eventgrid/web`)
- `apps/api`: NestJS backend (`@eventgrid/api`)
- `packages/types`: shared TypeScript types (`@eventgrid/types`)
- `services/ai`: FastAPI sidecar
- `docker-compose.yml`: full local stack
- `scripts/deploy-local.ps1` / `scripts/deploy-local.sh`: bootstrap scripts

## Prerequisites

- Docker Desktop (recommended path)
- Node.js 20+
- pnpm 9+

## Option A: Full Stack with Docker (Recommended)

Windows (PowerShell):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-local.ps1
```

macOS/Linux:

```bash
bash scripts/deploy-local.sh
```

If the script times out on port waits, run one of these:

- `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-local.ps1 -SkipWait`
- `bash scripts/deploy-local.sh --skip-wait`
- `docker compose up -d --build`

Then open:

- Web: `http://localhost:3000`
- API health: `http://localhost:4000/health`
- AI health: `http://localhost:8000/health`
- MinIO console: `http://localhost:9001`

Demo sign-in:

- `admin@eventgrid.dev` (any password)
- `sales@eventgrid.dev` (any password)

Stop stack:

```bash
docker compose down
```

Reset data volumes:

```bash
docker compose down -v
```

## Option B: Local App Development (Outside Containers)

Use this when you want hot-reload Node processes locally.

1. Install dependencies:

```bash
pnpm install
```

2. Copy env files:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

3. Start infra dependencies (DB, Redis, MinIO, AI) with Docker:

```bash
docker compose up -d postgres redis minio minio-init ai
```

4. Ensure PostgreSQL is reachable from host:

- Current compose maps postgres as `4200:4200`; Postgres listens on `5432`.
- Either edit `docker-compose.yml` to `4200:5432`, or use your own host Postgres instance.

5. Update local env ports:

- `DATABASE_URL` -> use port `4200`
- `REDIS_URL` -> use port `6380`

Example for `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:4200/eventgrid?schema=public"
REDIS_URL="redis://localhost:6380"
AI_SERVICE_URL="http://localhost:8000"
S3_ENDPOINT_URL="http://localhost:9000"
```

6. Initialize Prisma:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

7. Start apps:

```bash
pnpm dev
```

This runs:

- web on `http://localhost:3000`
- api on `http://localhost:4000`

## Required Env Note: `NEXT_PUBLIC_TEAM_ID`

The venues pages currently default to `dev-team`, but seeded teams use a UUID id.
For venues flows, set `NEXT_PUBLIC_TEAM_ID` in `apps/web/.env.local` to your seeded team id.

You can get the team id from seed output:

```bash
pnpm --filter @eventgrid/api db:seed
```

Then set:

```env
NEXT_PUBLIC_TEAM_ID="<team-uuid-from-seed-output>"
```

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

## API Base Path

- API uses global prefix `/api`
- Controllers are versioned under `/v1`
- Effective pattern: `http://localhost:4000/api/v1/...`
