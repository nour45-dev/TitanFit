/**
 * Pre-deploy role password & grant provisioning script.
 * Executed automatically after `prisma migrate deploy` using DATABASE_MIGRATION_URL
 * (the database owner role on Railway or local Docker).
 * Sets passwords for `gymos_app` and `gymos_worker` from environment variables
 * without hardcoding any credentials in SQL migration files.
 */
import { PrismaClient } from '@prisma/client';

async function provisionRuntimeRoles() {
  const migrationUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
  if (!migrationUrl) {
    console.log('[provision-roles] No DATABASE_MIGRATION_URL or DATABASE_URL provided; skipping.');
    return;
  }

  const appPassword = process.env.DB_RUNTIME_APP_PASSWORD;
  const workerPassword = process.env.DB_RUNTIME_WORKER_PASSWORD;

  const ownerClient = new PrismaClient({
    datasources: { db: { url: migrationUrl } },
  });

  try {
    await ownerClient.$connect();

    // Ensure roles exist with NOSUPERUSER and NOBYPASSRLS
    await ownerClient.$executeRawUnsafe(`
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
    `);

    if (appPassword && appPassword.length >= 12) {
      const escaped = appPassword.replace(/'/g, "''");
      await ownerClient.$executeRawUnsafe(`ALTER ROLE gymos_app WITH PASSWORD '${escaped}';`);
    }

    if (workerPassword && workerPassword.length >= 12) {
      const escaped = workerPassword.replace(/'/g, "''");
      await ownerClient.$executeRawUnsafe(`ALTER ROLE gymos_worker WITH PASSWORD '${escaped}';`);
    }

    await ownerClient.$executeRawUnsafe(`
      GRANT USAGE ON SCHEMA public TO gymos_app, gymos_worker;
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gymos_app, gymos_worker;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gymos_app, gymos_worker;
    `);

    console.log('✅ [provision-roles] Verified gymos_app and gymos_worker roles (NOSUPERUSER, NOBYPASSRLS).');
  } finally {
    await ownerClient.$disconnect();
  }
}

provisionRuntimeRoles().catch((err) => {
  console.error('❌ [provision-roles] Failed to provision runtime roles:', err);
  process.exit(1);
});
