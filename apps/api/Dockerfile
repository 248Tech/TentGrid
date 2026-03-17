FROM node:20-bookworm-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api apps/api
COPY packages/types packages/types

RUN pnpm install --frozen-lockfile

FROM deps AS builder

RUN pnpm --filter @eventgrid/types build
RUN pnpm --filter @eventgrid/api db:generate
RUN pnpm --filter @eventgrid/api build

FROM node:20-bookworm-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json /app/tsconfig.base.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/apps/api ./apps/api

EXPOSE 4000

CMD ["sh", "-c", "pnpm --filter @eventgrid/api db:push && pnpm --filter @eventgrid/api db:seed && pnpm --filter @eventgrid/api start"]
