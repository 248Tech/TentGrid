FROM node:20-bookworm-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY packages/types packages/types
COPY apps/api apps/api

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @eventgrid/types build
RUN pnpm --filter @eventgrid/api db:generate
RUN pnpm --filter @eventgrid/api build

FROM node:20-bookworm-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json /app/tsconfig.base.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/apps/api ./apps/api

EXPOSE 4000

CMD ["sh", "-c", "pnpm --filter @eventgrid/api db:deploy && pnpm --filter @eventgrid/api db:seed && pnpm --filter @eventgrid/api start"]
