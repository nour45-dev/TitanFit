import { prisma, withTenantContext } from '@gymos/database';
import type {
  RegisteredTenantRecord,
  RegisteredMemberRecord,
  SaaSSubscriptionRequestRecord,
} from './tenant-registry';

export interface SyncTenantStatePayload {
  version: number;
  lastUpdated: string;
  members: any[];
  plans: any[];
  branches: any[];
  invoices: any[];
  classes: any[];
  staff: any[];
  attendance: any[];
  sales: any[];
  customBranding: Record<string, any>;
  customWorkouts: any[];
  customRecipes: any[];
  customFiles: any[];
}

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

const globalForPgBootstrap = globalThis as unknown as {
  __titanfitPgReady?: Promise<void>;
};

/**
 * Ensures all multi-tenant SaaS & GymOS tables exist in PostgreSQL idempotently,
 * including `tenants`, `saas_subscription_requests`, `gym_tenant_states` (with FORCE RLS),
 * and `registered_members`. Safe to call on a brand-new empty Railway Postgres DB.
 */
export async function ensurePostgresReady(): Promise<void> {
  if (!isPostgresConfigured()) return;
  if (globalForPgBootstrap.__titanfitPgReady) {
    return globalForPgBootstrap.__titanfitPgReady;
  }

  globalForPgBootstrap.__titanfitPgReady = (async () => {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION current_app_tenant_id() RETURNS UUID AS $$
        DECLARE val TEXT;
        BEGIN
          val := NULLIF(current_setting('app.current_tenant_id', true), '');
          IF val IS NULL THEN RETURN NULL; END IF;
          RETURN val::UUID;
        EXCEPTION WHEN OTHERS THEN RETURN NULL;
        END;
        $$ LANGUAGE plpgsql STABLE;
      `);

      await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION is_app_super_admin() RETURNS BOOLEAN AS $$
        BEGIN
          RETURN COALESCE(current_setting('app.is_super_admin', true), 'false') = 'true';
        END;
        $$ LANGUAGE plpgsql STABLE;
      `);

      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status') THEN
            CREATE TYPE "tenant_status" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED');
          END IF;
        END $$;
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "tenants" (
          "id" UUID NOT NULL DEFAULT gen_random_uuid(),
          "slug" VARCHAR(80) NOT NULL,
          "name_en" VARCHAR(160) NOT NULL,
          "name_ar" VARCHAR(160) NOT NULL,
          "status" "tenant_status" NOT NULL DEFAULT 'TRIAL',
          "saas_plan_code" VARCHAR(40) NOT NULL DEFAULT 'PRO_MULTI_BRANCH',
          "owner_username" VARCHAR(80),
          "owner_email" VARCHAR(160),
          "owner_phone" VARCHAR(32),
          "auth_verifier" VARCHAR(160),
          "gym_secret_code" VARCHAR(40) NOT NULL DEFAULT 'TF-JOIN',
          "billing_cycle" VARCHAR(16) NOT NULL DEFAULT 'MONTHLY',
          "subscription_duration_days" INTEGER NOT NULL DEFAULT 30,
          "subscription_started_at" TIMESTAMPTZ(6),
          "subscription_expires_at" TIMESTAMPTZ(6),
          "city_en" VARCHAR(120) DEFAULT 'Cairo, Egypt',
          "city_ar" VARCHAR(120) DEFAULT 'القاهرة، مصر',
          "branches_count" INTEGER NOT NULL DEFAULT 0,
          "active_members_count" INTEGER NOT NULL DEFAULT 0,
          "trainers_count" INTEGER NOT NULL DEFAULT 0,
          "mrr_egp" INTEGER NOT NULL DEFAULT 0,
          "default_currency" VARCHAR(3) NOT NULL DEFAULT 'EGP',
          "default_locale" VARCHAR(10) NOT NULL DEFAULT 'en',
          "timezone" VARCHAR(64) NOT NULL DEFAULT 'Africa/Cairo',
          "primary_color_hex" VARCHAR(7) NOT NULL DEFAULT '#D4AF37',
          "accent_color_hex" VARCHAR(7) NOT NULL DEFAULT '#10B981',
          "logo_url" TEXT,
          "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "deleted_at" TIMESTAMPTZ(6),
          CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
        );
      `);

      await prisma.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "tenants_slug_key" ON "tenants"("slug");`,
      );

      await prisma.$executeRawUnsafe(`
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
      `);

      await prisma.$executeRawUnsafe(`
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
      `);

      await prisma.$executeRawUnsafe(`
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
      `);
      await prisma.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "gym_tenant_states_tenant_id_key" ON "gym_tenant_states"("tenant_id");`,
      );
      await prisma.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "gym_tenant_states_tenant_slug_key" ON "gym_tenant_states"("tenant_slug");`,
      );

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "gym_tenant_states" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "gym_tenant_states" FORCE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS gym_tenant_states_isolation_policy ON "gym_tenant_states";
        CREATE POLICY gym_tenant_states_isolation_policy ON "gym_tenant_states"
          USING (is_app_super_admin() OR tenant_id = current_app_tenant_id())
          WITH CHECK (is_app_super_admin() OR tenant_id = current_app_tenant_id());
      `);

      await prisma.$executeRawUnsafe(`
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
      `);
    } catch (err) {
      // Reset promise on failure so next request retries
      globalForPgBootstrap.__titanfitPgReady = undefined;
      console.error('[postgres-store] ensurePostgresReady error:', err);
      throw err;
    }
  })();

  return globalForPgBootstrap.__titanfitPgReady;
}

function mapTenantRow(row: any): RegisteredTenantRecord {
  const tier =
    row.saasPlanCode === 'STARTER' || row.saasPlanCode === 'ENTERPRISE' || row.saasPlanCode === 'PRO'
      ? row.saasPlanCode
      : 'PRO';

  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    ownerUsername: row.ownerUsername || row.slug,
    ownerEmail: row.ownerEmail || `owner@${row.slug}.eg`,
    ownerPhone: row.ownerPhone || undefined,
    authVerifier: row.authVerifier || undefined,
    gymSecretCode: row.gymSecretCode || 'TF-JOIN',
    logoUrl: row.logoUrl || '/brand/logo.png',
    primaryColor: row.primaryColorHex || '#D4AF37',
    planTier: tier,
    billingCycle: row.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY',
    subscriptionDurationDays: row.subscriptionDurationDays ?? 30,
    subscriptionStartedAt: row.subscriptionStartedAt ? row.subscriptionStartedAt.toISOString() : undefined,
    subscriptionExpiresAt: row.subscriptionExpiresAt ? row.subscriptionExpiresAt.toISOString() : undefined,
    status: row.status || 'ACTIVE',
    branchesCount: row.branchesCount ?? 0,
    activeMembersCount: row.activeMembersCount ?? 0,
    trainersCount: row.trainersCount ?? 0,
    mrrEgp: row.mrrEgp ?? 0,
    cityEn: row.cityEn || 'Cairo, Egypt',
    cityAr: row.cityAr || 'القاهرة، مصر',
  };
}

function mapSubRequestRow(row: any): SaaSSubscriptionRequestRecord {
  return {
    id: row.id,
    requestNumber: row.requestNumber,
    tenantSlug: row.tenantSlug,
    gymNameAr: row.gymNameAr,
    gymNameEn: row.gymNameEn,
    ownerName: row.ownerName,
    ownerUsername: row.ownerUsername,
    ownerEmail: row.ownerEmail,
    ownerPhone: row.ownerPhone,
    desiredPassword: row.desiredPassword || undefined,
    planTier: (row.planTier as 'STARTER' | 'PRO' | 'ENTERPRISE') || 'PRO',
    planNameAr: row.planNameAr,
    planNameEn: row.planNameEn,
    billingCycle: row.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY',
    durationDays: row.durationDays,
    amountEgp: row.amountEgp,
    paymentMethod: (row.paymentMethod as 'INSTAPAY' | 'VODAFONE_CASH' | 'PAYMOB_CARD') || 'INSTAPAY',
    senderPhone: row.senderPhone,
    transactionRef: row.transactionRef,
    receiptDataUrl: row.receiptDataUrl || undefined,
    receiptFileName: row.receiptFileName || undefined,
    status: (row.status as 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED') || 'PENDING_APPROVAL',
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    approvedAt: row.approvedAt ? row.approvedAt.toISOString() : undefined,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : undefined,
    rejectedReason: row.rejectedReason || undefined,
  };
}

export async function dbListTenants(): Promise<RegisteredTenantRecord[]> {
  await ensurePostgresReady();
  return withTenantContext(prisma, { tenantId: null, isSuperAdmin: true }, async (tx) => {
    const rows = await tx.tenant.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(mapTenantRow);
  });
}

export async function dbFindTenantBySlug(slug: string): Promise<RegisteredTenantRecord | null> {
  await ensurePostgresReady();
  const cleanSlug = slug.trim().toLowerCase();
  return withTenantContext(prisma, { tenantId: null, isSuperAdmin: true }, async (tx) => {
    const row = await tx.tenant.findUnique({ where: { slug: cleanSlug } });
    return row ? mapTenantRow(row) : null;
  });
}

export async function dbUpsertTenant(tenant: RegisteredTenantRecord): Promise<RegisteredTenantRecord> {
  await ensurePostgresReady();
  const cleanSlug = tenant.slug.trim().toLowerCase();
  const planTier = tenant.planTier || 'PRO';
  const statusMap: Record<string, 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED'> = {
    TRIAL: 'TRIAL',
    ACTIVE: 'ACTIVE',
    PAST_DUE: 'PAST_DUE',
    SUSPENDED: 'SUSPENDED',
    CANCELLED: 'CANCELLED',
  };
  const dbStatus = statusMap[tenant.status] || 'ACTIVE';

  return withTenantContext(prisma, { tenantId: null, isSuperAdmin: true }, async (tx) => {
    const existing = await tx.tenant.findUnique({ where: { slug: cleanSlug } });
    const row = existing
      ? await tx.tenant.update({
          where: { slug: cleanSlug },
          data: {
            nameEn: tenant.nameEn,
            nameAr: tenant.nameAr,
            status: dbStatus,
            saasPlanCode: planTier,
            ownerUsername: tenant.ownerUsername || cleanSlug,
            ownerEmail: tenant.ownerEmail,
            ownerPhone: tenant.ownerPhone || null,
            authVerifier: tenant.authVerifier ?? existing.authVerifier,
            gymSecretCode: tenant.gymSecretCode || existing.gymSecretCode,
            billingCycle: tenant.billingCycle || existing.billingCycle,
            subscriptionDurationDays: tenant.subscriptionDurationDays ?? existing.subscriptionDurationDays,
            subscriptionStartedAt: tenant.subscriptionStartedAt
              ? new Date(tenant.subscriptionStartedAt)
              : existing.subscriptionStartedAt,
            subscriptionExpiresAt: tenant.subscriptionExpiresAt
              ? new Date(tenant.subscriptionExpiresAt)
              : existing.subscriptionExpiresAt,
            cityEn: tenant.cityEn || existing.cityEn,
            cityAr: tenant.cityAr || existing.cityAr,
            branchesCount: tenant.branchesCount ?? existing.branchesCount,
            activeMembersCount: tenant.activeMembersCount ?? existing.activeMembersCount,
            trainersCount: tenant.trainersCount ?? existing.trainersCount,
            mrrEgp: tenant.mrrEgp ?? existing.mrrEgp,
            primaryColorHex: (tenant.primaryColor || '#D4AF37').slice(0, 7),
            logoUrl: tenant.logoUrl || existing.logoUrl,
            deletedAt: null,
          },
        })
      : await tx.tenant.create({
          data: {
            slug: cleanSlug,
            nameEn: tenant.nameEn,
            nameAr: tenant.nameAr,
            status: dbStatus,
            saasPlanCode: planTier,
            ownerUsername: tenant.ownerUsername || cleanSlug,
            ownerEmail: tenant.ownerEmail,
            ownerPhone: tenant.ownerPhone || null,
            authVerifier: tenant.authVerifier || null,
            gymSecretCode: tenant.gymSecretCode || 'TF-JOIN',
            billingCycle: tenant.billingCycle || 'MONTHLY',
            subscriptionDurationDays: tenant.subscriptionDurationDays ?? 30,
            subscriptionStartedAt: tenant.subscriptionStartedAt
              ? new Date(tenant.subscriptionStartedAt)
              : new Date(),
            subscriptionExpiresAt: tenant.subscriptionExpiresAt
              ? new Date(tenant.subscriptionExpiresAt)
              : new Date(Date.now() + 30 * 86400 * 1000),
            cityEn: tenant.cityEn || 'Cairo, Egypt',
            cityAr: tenant.cityAr || 'القاهرة، مصر',
            branchesCount: tenant.branchesCount ?? 0,
            activeMembersCount: tenant.activeMembersCount ?? 0,
            trainersCount: tenant.trainersCount ?? 0,
            mrrEgp: tenant.mrrEgp ?? 0,
            primaryColorHex: (tenant.primaryColor || '#D4AF37').slice(0, 7),
            logoUrl: tenant.logoUrl || '/brand/logo.png',
          },
        });

    // Ensure an isolated GymTenantState partition exists for this tenant
    await tx.gymTenantState.upsert({
      where: { tenantSlug: cleanSlug },
      update: {},
      create: {
        tenantId: row.id,
        tenantSlug: cleanSlug,
      },
    });

    return mapTenantRow(row);
  });
}

export async function dbDeleteTenantBySlug(slug: string): Promise<void> {
  await ensurePostgresReady();
  const cleanSlug = slug.trim().toLowerCase();
  await withTenantContext(prisma, { tenantId: null, isSuperAdmin: true }, async (tx) => {
    await tx.tenant.deleteMany({ where: { slug: cleanSlug } });
  });
}

export async function dbListSubscriptionRequests(): Promise<SaaSSubscriptionRequestRecord[]> {
  await ensurePostgresReady();
  const rows = await prisma.saasSubscriptionRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapSubRequestRow);
}

export async function dbGetSubscriptionRequest(
  id: string,
): Promise<SaaSSubscriptionRequestRecord | null> {
  await ensurePostgresReady();
  const row = await prisma.saasSubscriptionRequest.findUnique({ where: { id } });
  return row ? mapSubRequestRow(row) : null;
}

export async function dbCreateSubscriptionRequest(
  req: SaaSSubscriptionRequestRecord,
): Promise<SaaSSubscriptionRequestRecord> {
  await ensurePostgresReady();
  const row = await prisma.saasSubscriptionRequest.create({
    data: {
      id: req.id,
      requestNumber: req.requestNumber,
      tenantSlug: req.tenantSlug.toLowerCase(),
      gymNameAr: req.gymNameAr,
      gymNameEn: req.gymNameEn,
      ownerName: req.ownerName,
      ownerUsername: req.ownerUsername,
      ownerEmail: req.ownerEmail,
      ownerPhone: req.ownerPhone,
      desiredPassword: req.desiredPassword || null,
      planTier: req.planTier,
      planNameAr: req.planNameAr,
      planNameEn: req.planNameEn,
      billingCycle: req.billingCycle,
      durationDays: req.durationDays,
      amountEgp: req.amountEgp,
      paymentMethod: req.paymentMethod,
      senderPhone: req.senderPhone,
      transactionRef: req.transactionRef,
      receiptDataUrl: req.receiptDataUrl || null,
      receiptFileName: req.receiptFileName || null,
      status: req.status,
      createdAt: new Date(req.createdAt),
    },
  });
  return mapSubRequestRow(row);
}

export async function dbUpdateSubscriptionRequest(
  id: string,
  data: Partial<{
    status: string;
    approvedAt: Date | null;
    expiresAt: Date | null;
    rejectedReason: string | null;
  }>,
): Promise<SaaSSubscriptionRequestRecord | null> {
  await ensurePostgresReady();
  const row = await prisma.saasSubscriptionRequest.update({
    where: { id },
    data,
  });
  return mapSubRequestRow(row);
}

export async function dbGetTenantState(tenantSlug: string): Promise<SyncTenantStatePayload | null> {
  await ensurePostgresReady();
  const cleanSlug = tenantSlug.trim().toLowerCase();

  // First lookup tenant UUID using super-admin context so we can open tenant-isolated RLS context
  const tenant = await withTenantContext(prisma, { tenantId: null, isSuperAdmin: true }, async (tx) =>
    tx.tenant.findUnique({ where: { slug: cleanSlug } }),
  );
  if (!tenant) return null;

  return withTenantContext(prisma, { tenantId: tenant.id, isSuperAdmin: false }, async (tx) => {
    const state = await tx.gymTenantState.findUnique({ where: { tenantId: tenant.id } });
    if (!state) return null;

    return {
      version: state.version,
      lastUpdated: state.updatedAt.toISOString(),
      branches: JSON.parse(state.branchesJson || '[]'),
      members: JSON.parse(state.membersJson || '[]'),
      plans: JSON.parse(state.plansJson || '[]'),
      invoices: JSON.parse(state.invoicesJson || '[]'),
      classes: JSON.parse(state.classesJson || '[]'),
      staff: JSON.parse(state.staffJson || '[]'),
      attendance: JSON.parse(state.attendanceJson || '[]'),
      sales: JSON.parse(state.salesJson || '[]'),
      customBranding: JSON.parse(state.customBrandingJson || '{}'),
      customWorkouts: JSON.parse(state.customWorkoutsJson || '[]'),
      customRecipes: JSON.parse(state.customRecipesJson || '[]'),
      customFiles: JSON.parse(state.customFilesJson || '[]'),
    };
  });
}

export async function dbSaveTenantState(
  tenantSlug: string,
  state: SyncTenantStatePayload,
): Promise<SyncTenantStatePayload> {
  await ensurePostgresReady();
  const cleanSlug = tenantSlug.trim().toLowerCase();

  let tenant = await withTenantContext(prisma, { tenantId: null, isSuperAdmin: true }, async (tx) =>
    tx.tenant.findUnique({ where: { slug: cleanSlug } }),
  );

  if (!tenant) {
    // Auto-provision tenant row in PostgreSQL if it doesn't exist yet
    const created = await dbUpsertTenant({
      id: '',
      slug: cleanSlug,
      nameEn: cleanSlug,
      nameAr: cleanSlug,
      ownerEmail: `owner@${cleanSlug}.eg`,
      gymSecretCode: 'TF-JOIN',
      logoUrl: '/brand/logo.png',
      primaryColor: '#D4AF37',
      planTier: 'PRO',
      status: 'ACTIVE',
    });
    tenant = await withTenantContext(prisma, { tenantId: null, isSuperAdmin: true }, async (tx) =>
      tx.tenant.findUnique({ where: { id: created.id } }),
    );
  }

  if (!tenant) return state;

  await withTenantContext(prisma, { tenantId: tenant.id, isSuperAdmin: false }, async (tx) => {
    await tx.gymTenantState.upsert({
      where: { tenantId: tenant!.id },
      update: {
        version: state.version,
        branchesJson: JSON.stringify(state.branches || []),
        membersJson: JSON.stringify(state.members || []),
        plansJson: JSON.stringify(state.plans || []),
        invoicesJson: JSON.stringify(state.invoices || []),
        classesJson: JSON.stringify(state.classes || []),
        staffJson: JSON.stringify(state.staff || []),
        attendanceJson: JSON.stringify(state.attendance || []),
        salesJson: JSON.stringify(state.sales || []),
        customBrandingJson: JSON.stringify(state.customBranding || {}),
        customWorkoutsJson: JSON.stringify(state.customWorkouts || []),
        customRecipesJson: JSON.stringify(state.customRecipes || []),
        customFilesJson: JSON.stringify(state.customFiles || []),
      },
      create: {
        tenantId: tenant!.id,
        tenantSlug: cleanSlug,
        version: state.version,
        branchesJson: JSON.stringify(state.branches || []),
        membersJson: JSON.stringify(state.members || []),
        plansJson: JSON.stringify(state.plans || []),
        invoicesJson: JSON.stringify(state.invoices || []),
        classesJson: JSON.stringify(state.classes || []),
        staffJson: JSON.stringify(state.staff || []),
        attendanceJson: JSON.stringify(state.attendance || []),
        salesJson: JSON.stringify(state.sales || []),
        customBrandingJson: JSON.stringify(state.customBranding || {}),
        customWorkoutsJson: JSON.stringify(state.customWorkouts || []),
        customRecipesJson: JSON.stringify(state.customRecipes || []),
        customFilesJson: JSON.stringify(state.customFiles || []),
      },
    });
  });

  // Update summary counters on Tenant row for Super Admin dashboard
  await withTenantContext(prisma, { tenantId: null, isSuperAdmin: true }, async (tx) => {
    await tx.tenant.update({
      where: { id: tenant!.id },
      data: {
        branchesCount: Array.isArray(state.branches) ? state.branches.length : 0,
        activeMembersCount: Array.isArray(state.members) ? state.members.length : 0,
        trainersCount: Array.isArray(state.staff) ? state.staff.length : 0,
      },
    });
  });

  return state;
}

export async function dbUpsertRegisteredMember(member: RegisteredMemberRecord): Promise<void> {
  await ensurePostgresReady();
  await prisma.registeredMember.upsert({
    where: { id: member.id },
    update: {
      tenantSlug: member.tenantSlug.toLowerCase(),
      code: member.code,
      email: member.email.toLowerCase(),
      phone: member.phone,
      fullNameEn: member.fullNameEn,
      fullNameAr: member.fullNameAr,
      tempPassword: member.tempPassword || null,
    },
    create: {
      id: member.id,
      tenantSlug: member.tenantSlug.toLowerCase(),
      code: member.code,
      email: member.email.toLowerCase(),
      phone: member.phone,
      fullNameEn: member.fullNameEn,
      fullNameAr: member.fullNameAr,
      tempPassword: member.tempPassword || null,
    },
  });
}

export async function dbFindRegisteredMember(identifier: string): Promise<RegisteredMemberRecord | null> {
  await ensurePostgresReady();
  const clean = identifier.trim().toLowerCase();
  const row = await prisma.registeredMember.findFirst({
    where: {
      OR: [{ email: clean }, { code: { equals: clean, mode: 'insensitive' } }, { phone: clean }],
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    email: row.email,
    phone: row.phone,
    fullNameEn: row.fullNameEn,
    fullNameAr: row.fullNameAr,
    tempPassword: row.tempPassword || undefined,
    tenantSlug: row.tenantSlug,
  };
}
