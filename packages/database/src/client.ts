import { PrismaClient } from '@prisma/client';

export interface TenantRlsContext {
  readonly tenantId: string | null;
  readonly isSuperAdmin?: boolean;
}

export interface DatabaseRoleSecurityStatus {
  readonly currentRole: string;
  readonly isSuperuser: boolean;
  readonly canBypassRls: boolean;
  readonly rlsStrictlyEnforced: boolean;
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Executes a callback inside an explicit PostgreSQL transaction with
 * `app.current_tenant_id` and `app.is_super_admin` session settings locked
 * via `set_config(..., true)` (transaction-local).
 */
export async function withTenantContext<T>(
  client: PrismaClient,
  context: TenantRlsContext,
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
): Promise<T> {
  const tenantIdStr = context.tenantId ?? '';
  const isSuperAdminStr = context.isSuperAdmin ? 'true' : 'false';

  return client.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantIdStr}, true), set_config('app.is_super_admin', ${isSuperAdminStr}, true)`;
    return fn(tx);
  });
}

/**
 * Queries pg_roles for the active connection role to verify that the runtime
 * service is NOT connecting as a PostgreSQL superuser or a role with BYPASSRLS.
 */
export async function verifyRuntimeRoleSecurity(
  client: PrismaClient = prisma,
): Promise<DatabaseRoleSecurityStatus> {
  const rows = await client.$queryRaw<
    Array<{ rolname: string; rolsuper: boolean; rolbypassrls: boolean }>
  >`
    SELECT rolname, rolsuper, rolbypassrls
    FROM pg_roles
    WHERE rolname = current_user
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) {
    return {
      currentRole: 'unknown',
      isSuperuser: true,
      canBypassRls: true,
      rlsStrictlyEnforced: false,
    };
  }

  return {
    currentRole: row.rolname,
    isSuperuser: Boolean(row.rolsuper),
    canBypassRls: Boolean(row.rolbypassrls),
    rlsStrictlyEnforced: !row.rolsuper && !row.rolbypassrls,
  };
}
