# ============================================================================
# GymOS API & Worker Multi-Stage Production Dockerfile (Railway Ready)
# Builds `@gymos/api` and workspace dependencies (`@gymos/config`,
# `@gymos/contracts`, `@gymos/database`).
# Used by both the `api` and `worker` Railway services.
# ============================================================================

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl postgresql-client
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json ./
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/config/package.json ./packages/config/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile=false

FROM deps AS builder
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm --filter @gymos/database db:generate
RUN pnpm --filter @gymos/api... build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/apps/api ./apps/api
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

USER nestjs
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
