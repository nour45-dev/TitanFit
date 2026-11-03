-- ============================================================================
-- Migration: 0003_add_session_table
-- Centralized Session Storage for Multi-Device Revocation and Token Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "refresh_token_hash" TEXT NOT NULL,
  "user_agent" TEXT,
  "ip_address" VARCHAR(64),
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMPTZ(6),

  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sessions_user_id_revoked_at_idx" ON "sessions"("user_id", "revoked_at");
CREATE INDEX IF NOT EXISTS "sessions_tenant_id_expires_at_idx" ON "sessions"("tenant_id", "expires_at");

-- Enable and FORCE Row-Level Security
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" FORCE ROW LEVEL SECURITY;

-- Tenant Isolation Policy
DROP POLICY IF EXISTS "tenant_isolation_sessions" ON "sessions";
CREATE POLICY "tenant_isolation_sessions" ON "sessions"
  AS RESTRICTIVE
  FOR ALL
  TO gymos_app, gymos_worker
  USING (
    is_app_super_admin()
    OR tenant_id = current_app_tenant_id()
  )
  WITH CHECK (
    is_app_super_admin()
    OR tenant_id = current_app_tenant_id()
  );
