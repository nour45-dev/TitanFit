-- ============================================================================
-- Migration: 0001_init_roles_and_rls
-- 1. Creates dedicated non-superuser, non-bypassrls runtime roles:
--    - gymos_app (used by NestJS API at runtime: NOSUPERUSER NOBYPASSRLS)
--    - gymos_worker (used by BullMQ worker / platform jobs: NOSUPERUSER NOBYPASSRLS)
-- 2. Creates foundational `tenants` and `branches` tables.
-- 3. Enables and FORCES PostgreSQL Row-Level Security (RLS) so even table owners
--    and runtime roles must satisfy tenant isolation policies.
-- ============================================================================

-- 1. Create dedicated roles if they do not already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gymos_app') THEN
    CREATE ROLE gymos_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  ELSE
    ALTER ROLE gymos_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gymos_worker') THEN
    CREATE ROLE gymos_worker WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  ELSE
    ALTER ROLE gymos_worker WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
END
$$;

-- 2. Helper functions to safely read session context variables without throwing if unset
CREATE OR REPLACE FUNCTION current_app_tenant_id() RETURNS UUID AS $$
DECLARE
  val TEXT;
BEGIN
  val := NULLIF(current_setting('app.current_tenant_id', true), '');
  IF val IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN val::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION is_app_super_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(current_setting('app.is_super_admin', true), 'false') = 'true';
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Create Enum & Core Tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status') THEN
    CREATE TYPE "tenant_status" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "tenants" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" VARCHAR(80) NOT NULL,
  "name_en" VARCHAR(160) NOT NULL,
  "name_ar" VARCHAR(160) NOT NULL,
  "status" "tenant_status" NOT NULL DEFAULT 'TRIAL',
  "default_currency" VARCHAR(3) NOT NULL DEFAULT 'EGP',
  "default_locale" VARCHAR(10) NOT NULL DEFAULT 'en',
  "timezone" VARCHAR(64) NOT NULL DEFAULT 'Africa/Cairo',
  "primary_color_hex" VARCHAR(7) NOT NULL DEFAULT '#10B981',
  "accent_color_hex" VARCHAR(7) NOT NULL DEFAULT '#F59E0B',
  "logo_url" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tenants_slug_key" ON "tenants"("slug");
CREATE INDEX IF NOT EXISTS "tenants_status_idx" ON "tenants"("status");

CREATE TABLE IF NOT EXISTS "branches" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(32) NOT NULL,
  "name_en" VARCHAR(160) NOT NULL,
  "name_ar" VARCHAR(160) NOT NULL,
  "city" VARCHAR(100) NOT NULL,
  "address_en" TEXT,
  "address_ar" TEXT,
  "phone" VARCHAR(32),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "branches_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "branches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "branches_tenant_id_code_key" ON "branches"("tenant_id", "code");
CREATE INDEX IF NOT EXISTS "branches_tenant_id_is_active_idx" ON "branches"("tenant_id", "is_active");

-- 4. Enable and FORCE Row-Level Security (RLS)
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenants_rls_isolation_policy" ON "tenants";
CREATE POLICY "tenants_rls_isolation_policy" ON "tenants"
  FOR ALL
  USING (
    "id" = current_app_tenant_id()
    OR is_app_super_admin()
  )
  WITH CHECK (
    "id" = current_app_tenant_id()
    OR is_app_super_admin()
  );

ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "branches" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "branches_rls_isolation_policy" ON "branches";
CREATE POLICY "branches_rls_isolation_policy" ON "branches"
  FOR ALL
  USING (
    "tenant_id" = current_app_tenant_id()
    OR is_app_super_admin()
  )
  WITH CHECK (
    "tenant_id" = current_app_tenant_id()
    OR is_app_super_admin()
  );

-- 5. Grant least-privilege table & schema permissions to gymos_app and gymos_worker
GRANT USAGE ON SCHEMA public TO gymos_app, gymos_worker;
GRANT EXECUTE ON FUNCTION current_app_tenant_id() TO gymos_app, gymos_worker;
GRANT EXECUTE ON FUNCTION is_app_super_admin() TO gymos_app, gymos_worker;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gymos_app, gymos_worker;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gymos_app, gymos_worker;
