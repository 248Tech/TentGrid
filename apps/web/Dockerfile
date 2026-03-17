FROM node:20-bookworm-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY packages/types packages/types
COPY apps/web apps/web

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @eventgrid/types build
RUN pnpm --filter @eventgrid/web build

FROM node:20-bookworm-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json /app/tsconfig.base.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/apps/web ./apps/web

EXPOSE 3000

CMD ["sh", "-c", "pnpm --filter @eventgrid/web start"]
