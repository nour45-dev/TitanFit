-- ============================================================================
-- Migration: 0002_domain_tables_and_rls
-- Creates all core tenant-scoped domain tables with FORCE ROW LEVEL SECURITY
-- and an append-only immutability trigger on `audit_logs`.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE "subscription_status" AS ENUM ('ACTIVE', 'FROZEN', 'GRACE_PERIOD', 'EXPIRED', 'CANCELLED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE "booking_status" AS ENUM ('BOOKED', 'WAITLISTED', 'CHECKED_IN', 'LATE_CANCELLED', 'CANCELLED');
  END IF;
END
$$;

ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "saas_plan_code" VARCHAR(40) NOT NULL DEFAULT 'PRO_MULTI_BRANCH';

CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE RESTRICT,
  "branch_id" UUID,
  "email" VARCHAR(160),
  "phone" VARCHAR(32) NOT NULL,
  "full_name_en" VARCHAR(160) NOT NULL,
  "full_name_ar" VARCHAR(160) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "totp_secret_encrypted" TEXT,
  "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
  "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
  "locked_until" TIMESTAMPTZ(6),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_tenant_id_phone_key" UNIQUE ("tenant_id", "phone")
);

CREATE TABLE IF NOT EXISTS "roles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE RESTRICT,
  "key" VARCHAR(64) NOT NULL,
  "name_en" VARCHAR(120) NOT NULL,
  "name_ar" VARCHAR(120) NOT NULL,
  "permissions" TEXT[] NOT NULL DEFAULT '{}',
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "roles_tenant_id_key_key" UNIQUE ("tenant_id", "key")
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "actor_id" UUID NOT NULL,
  "impersonator_id" UUID,
  "action" VARCHAR(120) NOT NULL,
  "entity_type" VARCHAR(80) NOT NULL,
  "entity_id" VARCHAR(120) NOT NULL,
  "ip_address" VARCHAR(64) NOT NULL,
  "user_agent" TEXT,
  "metadata_json" TEXT NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Immutable Audit Log Trigger: Block UPDATE and DELETE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Security Violation: audit_logs table is immutable and append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON "audit_logs";
CREATE TRIGGER trg_audit_logs_immutable
  BEFORE UPDATE OR DELETE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

CREATE TABLE IF NOT EXISTS "member_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "branch_id" UUID NOT NULL,
  "user_id" UUID,
  "membership_number" VARCHAR(40) NOT NULL,
  "full_name_en" VARCHAR(160) NOT NULL,
  "full_name_ar" VARCHAR(160) NOT NULL,
  "phone" VARCHAR(32) NOT NULL,
  "email" VARCHAR(160),
  "gender" VARCHAR(16) NOT NULL DEFAULT 'MALE',
  "emergency_contact_name" VARCHAR(160) NOT NULL,
  "emergency_contact_phone" VARCHAR(32) NOT NULL,
  "tags" TEXT[] NOT NULL DEFAULT '{}',
  "encrypted_health_blob" TEXT,
  "health_iv" VARCHAR(64),
  "health_auth_tag" VARCHAR(64),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "member_profiles_tenant_membership_key" UNIQUE ("tenant_id", "membership_number")
);

CREATE TABLE IF NOT EXISTS "subscription_plans" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(40) NOT NULL,
  "name_en" VARCHAR(120) NOT NULL,
  "name_ar" VARCHAR(120) NOT NULL,
  "type" VARCHAR(32) NOT NULL,
  "price_minor" INTEGER NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'EGP',
  "duration_days" INTEGER NOT NULL,
  "total_sessions" INTEGER,
  "max_freeze_days" INTEGER NOT NULL DEFAULT 14,
  "max_freeze_count" INTEGER NOT NULL DEFAULT 2,
  "grace_period_days" INTEGER NOT NULL DEFAULT 3,
  "multi_branch_access" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "subscription_plans_tenant_code_key" UNIQUE ("tenant_id", "code")
);

CREATE TABLE IF NOT EXISTS "member_subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "member_id" UUID NOT NULL,
  "plan_id" UUID NOT NULL,
  "branch_id" UUID NOT NULL,
  "status" "subscription_status" NOT NULL DEFAULT 'ACTIVE',
  "starts_at" TIMESTAMPTZ(6) NOT NULL,
  "ends_at" TIMESTAMPTZ(6) NOT NULL,
  "remaining_sessions" INTEGER,
  "freeze_days_used" INTEGER NOT NULL DEFAULT 0,
  "freeze_count_used" INTEGER NOT NULL DEFAULT 0,
  "auto_renew" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "member_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "branch_id" UUID NOT NULL,
  "member_id" UUID NOT NULL,
  "invoice_number" VARCHAR(64) NOT NULL,
  "subtotal_minor" INTEGER NOT NULL,
  "discount_minor" INTEGER NOT NULL DEFAULT 0,
  "tax_minor" INTEGER NOT NULL DEFAULT 0,
  "total_minor" INTEGER NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'EGP',
  "payment_provider" VARCHAR(32) NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'PAID',
  "qr_verification_hash" VARCHAR(128) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invoices_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "invoices_tenant_invoice_number_key" UNIQUE ("tenant_id", "invoice_number")
);

CREATE TABLE IF NOT EXISTS "class_schedules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "branch_id" UUID NOT NULL,
  "room_name" VARCHAR(80) NOT NULL,
  "title_en" VARCHAR(120) NOT NULL,
  "title_ar" VARCHAR(120) NOT NULL,
  "category" VARCHAR(40) NOT NULL,
  "trainer_id" UUID NOT NULL,
  "trainer_name_en" VARCHAR(120) NOT NULL,
  "trainer_name_ar" VARCHAR(120) NOT NULL,
  "starts_at" TIMESTAMPTZ(6) NOT NULL,
  "ends_at" TIMESTAMPTZ(6) NOT NULL,
  "capacity" INTEGER NOT NULL,
  "booked_count" INTEGER NOT NULL DEFAULT 0,
  "waitlist_count" INTEGER NOT NULL DEFAULT 0,
  "late_cancel_window_minutes" INTEGER NOT NULL DEFAULT 180,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "class_bookings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "class_schedule_id" UUID NOT NULL,
  "member_id" UUID NOT NULL,
  "status" "booking_status" NOT NULL DEFAULT 'BOOKED',
  "waitlist_order" INTEGER,
  "penalty_applied" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "class_bookings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "class_bookings_unique_member" UNIQUE ("tenant_id", "class_schedule_id", "member_id")
);

CREATE TABLE IF NOT EXISTS "attendance_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "branch_id" UUID NOT NULL,
  "member_id" UUID NOT NULL,
  "method" VARCHAR(32) NOT NULL DEFAULT 'QR_ROTATING_HMAC',
  "allowed" BOOLEAN NOT NULL DEFAULT true,
  "denial_reason" VARCHAR(160),
  "turnstile_device_id" VARCHAR(64),
  "checked_in_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

-- Enable & FORCE Row-Level Security on ALL new tenant tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users',
    'roles',
    'audit_logs',
    'member_profiles',
    'subscription_plans',
    'member_subscriptions',
    'invoices',
    'class_schedules',
    'class_bookings',
    'attendance_logs'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', tbl || '_rls_policy', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (tenant_id = current_app_tenant_id() OR is_app_super_admin()) WITH CHECK (tenant_id = current_app_tenant_id() OR is_app_super_admin());',
      tbl || '_rls_policy',
      tbl
    );
  END LOOP;
END
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gymos_app, gymos_worker;
