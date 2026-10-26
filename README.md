# GymOS — Multi-Tenant Gym Management SaaS Platform

> **Enterprise-grade, bilingual (Arabic RTL / English LTR) multi-branch fitness operating system built for Egypt, MENA, and global scale.**

---

## 1. Quick Start (< 10 Minutes)

### Prerequisites
- **Node.js** `>= 20.0.0` (Node 22 LTS recommended)
- **pnpm** `>= 9.0.0` (`npm install -g pnpm`)
- **Docker** (optional for local containers; embedded PGlite is also supported for instant zero-daemon RLS testing)

### Step-by-Step Local Setup
```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Copy the environment template for local dev
cp .env.example .env.local

# 3. (Optional) Start isolated local Docker services (Postgres 16, Redis 7, MinIO, MailHog)
docker compose up -d

# 4. Generate Prisma client & build all monorepo packages
pnpm build

# 5. Run all unit, integration (including non-bypassable Postgres RLS proof), and E2E tests
pnpm test
```

---

## 2. Monorepo Structure

| Path | Package Name | Purpose |
| :--- | :--- | :--- |
| `apps/api` | `@gymos/api` | NestJS 11 (Fastify) REST `/api/v1`, Swagger `/api/docs`, Health `/api/v1/health`, Readiness `/api/v1/ready`, and BullMQ Worker (`src/worker.ts`). |
| `apps/web` | `@gymos/web` | Next.js 15 App Router (Admin Dashboard, Super Admin Console, and Installable Member PWA with RTL Arabic & LTR English). |
| `packages/config` | `@gymos/config` | Single source of truth for platform brand name (`GymOS`), currencies (`EGP`), locales (`ar`, `en`), and fail-fast Zod startup env validation. |
| `packages/contracts` | `@gymos/contracts` | Shared Zod schemas, RBAC permission enums, API response envelopes, and health/readiness contracts. |
| `packages/database` | `@gymos/database` | Prisma schema, SQL migrations, non-superuser/non-bypassrls runtime role provisioning (`gymos_app`, `gymos_worker`), and bilingual seed scripts. |
| `packages/ui` | `@gymos/ui` | Design System tokens, tenant white-label CSS variable builder, RTL-ready accessible components (`44px` min tap target), and Storybook 8. |

---

## 3. Git & Deployment Workflow

- **Private Repository**: `https://github.com/Nour-EldinAhmed/gymos`
- **Branching Model**:
  - `main`: Production environment on Railway (protected, requires CI + PR).
  - `develop`: Staging environment on Railway (protected, requires CI + PR).
  - `phase-N/*`: Feature/phase branches merged into `develop` via Pull Request.
- See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for the complete Railway setup, database role security model, Cloudflare R2 storage configuration, and backup/restore runbook.
