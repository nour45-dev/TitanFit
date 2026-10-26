# GymOS — Railway Cloud Deployment & Database Security Runbook (`DEPLOYMENT.md`)

---

## 1. Railway Project Architecture

GymOS deploys inside **one Railway Project** with **two environments**:
- **`staging`**: Auto-deploys from the `develop` branch (with **"Wait for CI"** enabled).
- **`production`**: Auto-deploys from the `main` branch (with **"Wait for CI"** enabled).

### Services in Each Environment
| Service Name | Source / Image | Public Network | Private Network (`*.railway.internal`) | Config File / Start Command |
| :--- | :--- | :--- | :--- | :--- |
| **`postgres`** | Railway PostgreSQL 16 | Disabled (Private Only) | `postgres.railway.internal:5432` | Managed Railway Volume + Native Backups |
| **`redis`** | Railway Redis 7 | Disabled (Private Only) | `redis.railway.internal:6379` | Managed Railway Redis |
| **`api`** | Repo (`apps/api/Dockerfile`) | **Enabled** (`api.gymos...`) | Connected to `postgres` & `redis` | `apps/api/railway.api.json` (`node apps/api/dist/main.js`) |
| **`worker`** | Repo (`apps/api/Dockerfile`) | Disabled (Private Only) | Connected to `postgres` & `redis` | `apps/api/railway.worker.json` (`node apps/api/dist/worker.js`) |
| **`web`** | Repo (`apps/web/Dockerfile`) | **Enabled** (`app.gymos...`) | Connected to `api` | `apps/web/railway.web.json` (`node apps/web/server.js`) |

---

## 2. Non-Bypassable PostgreSQL RLS on Railway

> [!CAUTION]
> Railway's default `postgres` user is created with `SUPERUSER` and `BYPASSRLS` privileges. If the `api` service connects as `postgres`, PostgreSQL Row-Level Security (RLS) policies are bypassed!

### How GymOS Solves This Automatically
1. **`DATABASE_MIGRATION_URL` (Owner / Pre-Deploy Only)**:
   - Set to Railway's default `${{Postgres.DATABASE_URL}}`.
   - Used **only** during `preDeployCommand` (`pnpm --filter @gymos/database db:migrate:deploy`).
   - Runs migration `0001_init_roles_and_rls` and `provision-roles.js`, which create/update:
     - `gymos_app` (`LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS`)
     - `gymos_worker` (`LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS`)
2. **`DATABASE_URL` (Runtime API Role)**:
   - Used by the `api` service at runtime:
     ```text
     postgresql://gymos_app:${DB_RUNTIME_APP_PASSWORD}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}?schema=public&connection_limit=15&pool_timeout=15
     ```
3. **Live Readiness Verification (`/api/v1/ready`)**:
   - The `/api/v1/ready` endpoint queries `pg_roles` for `current_user`. If `rolsuper` or `rolbypassrls` is `true`, `/api/v1/ready` returns `HTTP 503 Service Unavailable` (`rlsEnforced: false`), preventing misconfigured deployments from serving traffic.

---

## 3. Complete Environment Variables Reference

Configure these in Railway Service Variables (never commit `.env` files to Git):

### Shared / `api` & `worker` Services
| Variable | Required | Example / Railway Reference | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `staging` or `production` | Runtime environment mode |
| `NEXT_PUBLIC_APP_NAME` | Yes | `GymOS` | Configurable platform brand name |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Yes | `en` | Default locale (`en` or `ar`) |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Yes | `EGP` | Default ISO currency (`EGP`, `SAR`, `AED`, `USD`) |
| `NEXT_PUBLIC_DEFAULT_TIMEZONE` | Yes | `Africa/Cairo` | Default IANA timezone |
| `API_PORT` | Yes | `4000` | Internal port bound by Fastify |
| `API_HOST` | Yes | `0.0.0.0` | Listen interface |
| `API_CORS_ORIGINS` | Yes | `https://${{web.RAILWAY_PUBLIC_DOMAIN}}` | Comma-separated allowed CORS origins |
| `DATABASE_MIGRATION_URL` | Yes (`api`) | `${{Postgres.DATABASE_URL}}` | Elevated owner URL used ONLY by pre-deploy migrations |
| `DB_RUNTIME_APP_PASSWORD` | Yes | `<32-char-random-secret>` | Password assigned to `gymos_app` role |
| `DB_RUNTIME_WORKER_PASSWORD` | Yes | `<32-char-random-secret>` | Password assigned to `gymos_worker` role |
| `DATABASE_URL` | Yes (`api`) | `postgresql://gymos_app:${DB_RUNTIME_APP_PASSWORD}@${{Postgres.RAILWAY_PRIVATE_DOMAIN}}:5432/${{Postgres.PGDATABASE}}?schema=public&connection_limit=15&pool_timeout=15` | Non-bypassable RLS runtime connection string |
| `DATABASE_WORKER_URL` | Yes (`worker`) | `postgresql://gymos_worker:${DB_RUNTIME_WORKER_PASSWORD}@${{Postgres.RAILWAY_PRIVATE_DOMAIN}}:5432/${{Postgres.PGDATABASE}}?schema=public&connection_limit=5&pool_timeout=15` | Restricted worker connection string |
| `REDIS_URL` | Yes | `${{Redis.REDIS_URL}}` (private network) | Redis connection string for Cache, BullMQ, Redlock |
| `JWT_ACCESS_SECRET` | Yes | `<64-char-hex>` | HMAC secret for short-lived access JWTs |
| `JWT_REFRESH_SECRET` | Yes | `<64-char-hex>` | HMAC secret for rotating refresh tokens |
| `COOKIE_SECRET` | Yes | `<64-char-hex>` | Secret for signing httpOnly cookies |
| `HEALTH_DATA_ENCRYPTION_KEY` | Yes | `<64-char-hex>` (32 bytes) | AES-256-GCM key for encrypting member health records |
| `QR_HMAC_MASTER_SECRET` | Yes | `<64-char-hex>` | Master key for 30s rotating QR check-in signatures |
| `STORAGE_ENDPOINT` | Yes | `https://<account_id>.r2.cloudflarestorage.com` | Cloudflare R2 / S3 endpoint |
| `STORAGE_REGION` | Yes | `auto` | R2/S3 region |
| `STORAGE_BUCKET` | Yes | `gymos-media-prod` | Media bucket for signed URLs |
| `STORAGE_BACKUP_BUCKET` | Yes | `gymos-backups-prod` | Offsite database backup bucket |
| `STORAGE_ACCESS_KEY_ID` | Yes | `<r2-access-key>` | R2/S3 Access Key ID |
| `STORAGE_SECRET_ACCESS_KEY` | Yes | `<r2-secret-key>` | R2/S3 Secret Access Key |
| `STORAGE_FORCE_PATH_STYLE` | Yes | `false` (`true` for local MinIO) | Path style addressing flag |
| `SENTRY_DSN` | Optional | `https://...@sentry.io/...` | Sentry error reporting DSN |

### `web` Service Variables
| Variable | Required | Example / Railway Reference | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `staging` or `production` | Runtime environment |
| `NEXT_PUBLIC_APP_NAME` | Yes | `GymOS` | Brand name |
| `NEXT_PUBLIC_API_URL` | Yes | `https://${{api.RAILWAY_PUBLIC_DOMAIN}}/api/v1` | Public REST API base URL |
| `NEXT_PUBLIC_WS_URL` | Yes | `wss://${{api.RAILWAY_PUBLIC_DOMAIN}}` | Public WebSocket URL |
| `NEXT_PUBLIC_WEB_URL` | Yes | `https://${{web.RAILWAY_PUBLIC_DOMAIN}}` | Canonical web URL |

---

## 4. Zero-Downtime Migration Strategy (Expand / Contract)

All schema changes follow the **Expand $\rightarrow$ Migrate $\rightarrow$ Contract** pattern:
1. **Expand**: Add nullable columns or new tables/indexes (`CREATE INDEX CONCURRENTLY`) in a backward-compatible migration so the currently running `api` replicas continue working during rollout.
2. **Deploy**: Railway runs `preDeployCommand` (`prisma migrate deploy`), then switches traffic once `/api/v1/health` returns `200 OK`.
3. **Contract**: Remove deprecated columns only in a subsequent release after all code references are removed.

---

## 5. Backups & Disaster Recovery Runbook

1. **Primary Backups (Railway Native Volume Snapshots)**:
   - Enable **Automated Daily Backups** on the Railway `Postgres` service volume.
2. **Secondary Offsite Backups (`pg_dump` $\rightarrow$ Cloudflare R2 / S3)**:
   - Execute `node infra/scripts/pg-backup-to-s3.mjs` via scheduled job to upload compressed custom-format dumps (`gymos-db-backup-<timestamp>.dump`) to `s3://${STORAGE_BACKUP_BUCKET}/postgres/`.
3. **Restore Procedure**:
   ```bash
   # Download the dump file from R2/S3 and restore into target database:
   pg_restore --clean --if-exists --no-owner --no-acl -d "$TARGET_DATABASE_MIGRATION_URL" gymos-db-backup.dump
   # Re-apply runtime role grants:
   pnpm --filter @gymos/database db:migrate:deploy
   ```
