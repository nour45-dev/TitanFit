-- ============================================================================
-- Migration: 0004_saas_tenants_and_gym_state
-- 1. Adds SaaS owner, secret code, and subscription duration columns to `tenants`
-- 2. Creates `saas_subscription_requests` (Super Admin transfer verification queue)
-- 3. Creates `gym_tenant_states` (Per-gym isolated PostgreSQL state partition with FORCE RLS)
-- 4. Creates `registered_members` (Fast cross-gym member login & QR lookup)
-- ============================================================================

-- 1. Extend `tenants` table idempotently
ALTER TABLE "tenants"
  ADD COLUMN IF NOT EXISTS "saas_plan_code" VARCHAR(40) NOT NULL DEFAULT 'PRO_MULTI_BRANCH',
  ADD COLUMN IF NOT EXISTS "owner_username" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "owner_email" VARCHAR(160),
  ADD COLUMN IF NOT EXISTS "owner_phone" VARCHAR(32),
  ADD COLUMN IF NOT EXISTS "auth_verifier" VARCHAR(160),
  ADD COLUMN IF NOT EXISTS "gym_secret_code" VARCHAR(40) NOT NULL DEFAULT 'TF-JOIN',
  ADD COLUMN IF NOT EXISTS "billing_cycle" VARCHAR(16) NOT NULL DEFAULT 'MONTHLY',
  ADD COLUMN IF NOT EXISTS "subscription_duration_days" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS "subscription_started_at" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "subscription_expires_at" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "city_en" VARCHAR(120) DEFAULT 'Cairo, Egypt',
  ADD COLUMN IF NOT EXISTS "city_ar" VARCHAR(120) DEFAULT 'القاهرة، مصر',
  ADD COLUMN IF NOT EXISTS "branches_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "active_members_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "trainers_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "mrr_egp" INTEGER NOT NULL DEFAULT 0;

-- 2. Create `saas_subscription_requests`
CREATE TABLE IF NOT EXISTS "saas_subscription_requests" (
  "id" VARCHAR(64) NOT NULL,
  "request_number" VARCHAR(40) NOT NULL,
  "tenant_slug" VARCHAR(80) NOT NULL,
  "gym_name_ar" VARCHAR(160) NOT NULL,
  "gym_name_en" VARCHAR(160) NOT NULL,
  "owner_name" VARCHAR(160) NOT NULL,
  "owner_username" VARCHAR(80) NOT NULL,
  "owner_email" VARCHAR(160) NOT NULL,
  "owner_phone" VARCHAR(32) NOT NULL,
  "desired_password" VARCHAR(160),
  "plan_tier" VARCHAR(24) NOT NULL,
  "plan_name_ar" VARCHAR(160) NOT NULL,
  "plan_name_en" VARCHAR(160) NOT NULL,
  "billing_cycle" VARCHAR(16) NOT NULL,
  "duration_days" INTEGER NOT NULL,
  "amount_egp" INTEGER NOT NULL,
  "payment_method" VARCHAR(32) NOT NULL,
  "sender_phone" VARCHAR(32) NOT NULL,
  "transaction_ref" VARCHAR(64) NOT NULL,
  "receipt_data_url" TEXT,
  "receipt_file_name" VARCHAR(200),
  "status" VARCHAR(24) NOT NULL DEFAULT 'PENDING_APPROVAL',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approved_at" TIMESTAMPTZ(6),
  "expires_at" TIMESTAMPTZ(6),
  "rejected_reason" TEXT,
  CONSTRAINT "saas_subscription_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "saas_subscription_requests_tenant_slug_status_idx"
  ON "saas_subscription_requests"("tenant_slug", "status");
CREATE INDEX IF NOT EXISTS "saas_subscription_requests_created_at_idx"
  ON "saas_subscription_requests"("created_at");

-- 3. Create `gym_tenant_states` with strict tenant_id isolation (FORCE RLS)
CREATE TABLE IF NOT EXISTS "gym_tenant_states" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "tenant_slug" VARCHAR(80) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "branches_json" TEXT NOT NULL DEFAULT '[]',
  "members_json" TEXT NOT NULL DEFAULT '[]',
  "plans_json" TEXT NOT NULL DEFAULT '[]',
  "invoices_json" TEXT NOT NULL DEFAULT '[]',
  "classes_json" TEXT NOT NULL DEFAULT '[]',
  "staff_json" TEXT NOT NULL DEFAULT '[]',
  "attendance_json" TEXT NOT NULL DEFAULT '[]',
  "sales_json" TEXT NOT NULL DEFAULT '[]',
  "custom_branding_json" TEXT NOT NULL DEFAULT '{}',
  "custom_workouts_json" TEXT NOT NULL DEFAULT '[]',
  "custom_recipes_json" TEXT NOT NULL DEFAULT '[]',
  "custom_files_json" TEXT NOT NULL DEFAULT '[]',
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gym_tenant_states_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gym_tenant_states_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "gym_tenant_states_tenant_id_key" ON "gym_tenant_states"("tenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "gym_tenant_states_tenant_slug_key" ON "gym_tenant_states"("tenant_slug");

ALTER TABLE "gym_tenant_states" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gym_tenant_states" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gym_tenant_states_isolation_policy ON "gym_tenant_states";
CREATE POLICY gym_tenant_states_isolation_policy ON "gym_tenant_states"
  USING (is_app_super_admin() OR tenant_id = current_app_tenant_id())
  WITH CHECK (is_app_super_admin() OR tenant_id = current_app_tenant_id());

-- 4. Create `registered_members`
CREATE TABLE IF NOT EXISTS "registered_members" (
  "id" VARCHAR(64) NOT NULL,
  "tenant_slug" VARCHAR(80) NOT NULL,
  "code" VARCHAR(40) NOT NULL,
  "email" VARCHAR(160) NOT NULL,
  "phone" VARCHAR(32) NOT NULL,
  "full_name_en" VARCHAR(160) NOT NULL,
  "full_name_ar" VARCHAR(160) NOT NULL,
  "temp_password" VARCHAR(120),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "registered_members_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "registered_members_tenant_slug_code_idx"
  ON "registered_members"("tenant_slug", "code");
CREATE INDEX IF NOT EXISTS "registered_members_email_idx"
  ON "registered_members"("email");
CREATE INDEX IF NOT EXISTS "registered_members_phone_idx"
  ON "registered_members"("phone");

-- Grant privileges to runtime roles if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gymos_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "saas_subscription_requests", "gym_tenant_states", "registered_members" TO gymos_app;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gymos_worker') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "saas_subscription_requests", "gym_tenant_states", "registered_members" TO gymos_worker;
  END IF;
END
$$;
