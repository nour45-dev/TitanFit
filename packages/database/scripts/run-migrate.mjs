import { spawnSync } from 'node:child_process';

const migrationUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;

console.log('[db:migrate:deploy] Deploying Prisma migrations using owner/migration URL...');
const migrateResult = spawnSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    ...(migrationUrl ? { DATABASE_URL: migrationUrl } : {}),
  },
});

if (migrateResult.status !== 0) {
  process.exit(migrateResult.status || 1);
}

console.log('[db:migrate:deploy] Provisioning runtime non-bypassable RLS roles...');
const provisionResult = spawnSync('node', ['./dist/provision-roles.js'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    ...(migrationUrl ? { DATABASE_URL: migrationUrl } : {}),
  },
});

if (provisionResult.status !== 0) {
  process.exit(provisionResult.status || 1);
}
