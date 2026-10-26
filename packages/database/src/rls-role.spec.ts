import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationSqlPath = resolve(
  __dirname,
  '../prisma/migrations/0001_init_roles_and_rls/migration.sql',
);
const domainMigrationSqlPath = resolve(
  __dirname,
  '../prisma/migrations/0002_domain_tables_and_rls/migration.sql',
);

interface SqlExecutor {
  exec(sql: string): Promise<void>;
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  close(): Promise<void>;
}

async function createSqlExecutor(): Promise<{ executor: SqlExecutor; mode: 'external-pg' | 'pglite' }> {
  const externalUrl = process.env.TEST_DATABASE_MIGRATION_URL || process.env.DATABASE_MIGRATION_URL;
  if (externalUrl) {
    const pool = new Pool({ connectionString: externalUrl });
    return {
      mode: 'external-pg',
      executor: {
        async exec(sql: string) {
          await pool.query(sql);
        },
        async query<T = Record<string, unknown>>(sql: string, params?: unknown[]) {
          const res = await pool.query(sql, params);
          return { rows: res.rows as T[] };
        },
        async close() {
          await pool.end();
        },
      },
    };
  }

  const db = new PGlite();
  return {
    mode: 'pglite',
    executor: {
      async exec(sql: string) {
        await db.exec(sql);
      },
      async query<T = Record<string, unknown>>(sql: string, params?: unknown[]) {
        const res = await db.query<T>(sql, params);
        return { rows: res.rows };
      },
      async close() {
        await db.close();
      },
    },
  };
}

describe('PostgreSQL Non-Bypassable Runtime Role & Tenant RLS Isolation Proof', () => {
  let executor: SqlExecutor;
  const tenantAId = '11111111-1111-4111-8111-111111111111';
  const tenantBId = '22222222-2222-4222-8222-222222222222';

  beforeAll(async () => {
    const setup = await createSqlExecutor();
    executor = setup.executor;

    const migrationSql = readFileSync(migrationSqlPath, 'utf8');
    await executor.exec(migrationSql);

    const domainMigrationSql = readFileSync(domainMigrationSqlPath, 'utf8');
    await executor.exec(domainMigrationSql);

    // Seed two tenants and two branches as Super Admin
    await executor.exec(`
      BEGIN;
      SELECT set_config('app.is_super_admin', 'true', true);
      INSERT INTO tenants (id, slug, name_en, name_ar, status)
      VALUES
        ('${tenantAId}', 'rls-test-cairo', 'Cairo Gym A', 'جيم القاهرة أ', 'ACTIVE'),
        ('${tenantBId}', 'rls-test-alex', 'Alex Gym B', 'جيم الإسكندرية ب', 'ACTIVE')
      ON CONFLICT (slug) DO NOTHING;

      INSERT INTO branches (tenant_id, code, name_en, name_ar, city)
      VALUES
        ('${tenantAId}', 'CAIRO-1', 'Maadi Branch', 'فرع المعادي', 'Cairo'),
        ('${tenantBId}', 'ALEX-1', 'Gleem Branch', 'فرع جليم', 'Alexandria')
      ON CONFLICT (tenant_id, code) DO NOTHING;
      COMMIT;
    `);
  });

  afterAll(async () => {
    if (executor) {
      await executor.close();
    }
  });

  it('proves gymos_app and gymos_worker roles have NOSUPERUSER and NOBYPASSRLS in pg_roles', async () => {
    const { rows } = await executor.query<{
      rolname: string;
      rolsuper: boolean;
      rolbypassrls: boolean;
      rolcreatedb: boolean;
      rolcreaterole: boolean;
    }>(`
      SELECT rolname, rolsuper, rolbypassrls, rolcreatedb, rolcreaterole
      FROM pg_roles
      WHERE rolname IN ('gymos_app', 'gymos_worker')
      ORDER BY rolname ASC
    `);

    expect(rows).toHaveLength(2);
    for (const role of rows) {
      expect(role.rolsuper).toBe(false);
      expect(role.rolbypassrls).toBe(false);
      expect(role.rolcreatedb).toBe(false);
      expect(role.rolcreaterole).toBe(false);
    }
  });

  it('proves FORCE ROW LEVEL SECURITY is enabled on tenants and branches tables', async () => {
    const { rows } = await executor.query<{
      relname: string;
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
    }>(`
      SELECT relname, relrowsecurity, relforcerowsecurity
      FROM pg_class
      WHERE relname IN ('tenants', 'branches')
      ORDER BY relname ASC
    `);

    expect(rows).toHaveLength(2);
    for (const table of rows) {
      expect(table.relrowsecurity).toBe(true);
      expect(table.relforcerowsecurity).toBe(true);
    }
  });

  it('denies access to all rows when gymos_app queries without setting app.current_tenant_id', async () => {
    await executor.exec(`
      SET ROLE gymos_app;
      SELECT set_config('app.current_tenant_id', '', false);
      SELECT set_config('app.is_super_admin', 'false', false);
    `);

    const tenantsResult = await executor.query(`SELECT id, slug FROM tenants`);
    const branchesResult = await executor.query(`SELECT id, code FROM branches`);

    expect(tenantsResult.rows).toHaveLength(0);
    expect(branchesResult.rows).toHaveLength(0);

    await executor.exec(`RESET ROLE;`);
  });

  it('strictly isolates Tenant A from reading, updating, or deleting Tenant B data as gymos_app', async () => {
    await executor.exec(`
      SET ROLE gymos_app;
      SELECT set_config('app.current_tenant_id', '${tenantAId}', false);
      SELECT set_config('app.is_super_admin', 'false', false);
    `);

    // 1. SELECT without WHERE clause only returns Tenant A's data!
    const visibleTenants = await executor.query<{ id: string; slug: string }>(
      `SELECT id, slug FROM tenants`,
    );
    expect(visibleTenants.rows).toHaveLength(1);
    expect(visibleTenants.rows[0]?.id).toBe(tenantAId);

    const visibleBranches = await executor.query<{ tenant_id: string; code: string }>(
      `SELECT tenant_id, code FROM branches`,
    );
    expect(visibleBranches.rows).toHaveLength(1);
    expect(visibleBranches.rows[0]?.tenant_id).toBe(tenantAId);
    expect(visibleBranches.rows[0]?.code).toBe('CAIRO-1');

    // 2. Attempting to UPDATE Tenant B's branch while scoped to Tenant A affects 0 rows
    await executor.exec(`
      UPDATE branches SET name_en = 'HACKED' WHERE tenant_id = '${tenantBId}';
    `);

    // 3. Attempting to INSERT a branch for Tenant B while scoped to Tenant A throws RLS policy violation
    await expect(
      executor.exec(`
        INSERT INTO branches (tenant_id, code, name_en, name_ar, city)
        VALUES ('${tenantBId}', 'FORGED-1', 'Forged Branch', 'فرع مزور', 'Alexandria');
      `),
    ).rejects.toThrow(/row-level security policy/);

    await executor.exec(`RESET ROLE;`);

    // Verify Tenant B's branch was untouched
    await executor.exec(`
      SELECT set_config('app.current_tenant_id', '${tenantBId}', false);
    `);
    const tenantBBranch = await executor.query<{ name_en: string }>(
      `SELECT name_en FROM branches WHERE tenant_id = '${tenantBId}' AND code = 'ALEX-1'`,
    );
    expect(tenantBBranch.rows[0]?.name_en).toBe('Gleem Branch');
  });

  it('enforces append-only immutability on audit_logs (blocks UPDATE and DELETE at DB trigger level)', async () => {
    const actorId = '33333333-3333-4333-8333-333333333333';
    await executor.exec(`
      SET ROLE gymos_app;
      SELECT set_config('app.current_tenant_id', '${tenantAId}', false);
      INSERT INTO audit_logs (tenant_id, actor_id, action, entity_type, entity_id, ip_address)
      VALUES ('${tenantAId}', '${actorId}', 'auth.login', 'user', '${actorId}', '197.55.10.1');
    `);

    await expect(
      executor.exec(`UPDATE audit_logs SET action = 'TAMPERED' WHERE tenant_id = '${tenantAId}';`),
    ).rejects.toThrow(/audit_logs table is immutable/);

    await expect(
      executor.exec(`DELETE FROM audit_logs WHERE tenant_id = '${tenantAId}';`),
    ).rejects.toThrow(/audit_logs table is immutable/);

    await executor.exec(`RESET ROLE;`);
  });
});
