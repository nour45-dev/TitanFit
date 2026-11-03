import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPackageDir = resolve(__dirname, '..');

const migrationUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;

if (!migrationUrl) {
  console.log('[db:migrate:deploy] No DATABASE_MIGRATION_URL or DATABASE_URL provided; skipping migration.');
  process.exit(0);
}

const env = {
  ...process.env,
  DATABASE_URL: migrationUrl,
  DATABASE_MIGRATION_URL: migrationUrl,
};

console.log('[db:migrate:deploy] Deploying Prisma migrations using migration URL...');
const migrateResult = spawnSync('pnpm exec prisma migrate deploy', {
  cwd: dbPackageDir,
  shell: true,
  env,
  encoding: 'utf8',
});

if (migrateResult.stdout) console.log(migrateResult.stdout);
if (migrateResult.stderr) console.error(migrateResult.stderr);

if (migrateResult.status !== 0) {
  const errMsg = (migrateResult.stderr || migrateResult.stdout || 'Unknown error').trim();
  console.log(`::error title=Prisma Migrate Failure::${errMsg.replace(/\r?\n/g, '%0A')}`);
  process.exit(migrateResult.status || 1);
}

console.log('[db:migrate:deploy] Provisioning runtime non-bypassable RLS roles...');
const provisionResult = spawnSync('node ./dist/provision-roles.js', {
  cwd: dbPackageDir,
  shell: true,
  env,
  encoding: 'utf8',
});

if (provisionResult.stdout) console.log(provisionResult.stdout);
if (provisionResult.stderr) console.error(provisionResult.stderr);

if (provisionResult.status !== 0) {
  const errMsg = (provisionResult.stderr || provisionResult.stdout || 'Unknown error').trim();
  console.log(`::error title=Provision Roles Failure::${errMsg.replace(/\r?\n/g, '%0A')}`);
  process.exit(provisionResult.status || 1);
}

console.log('✅ [db:migrate:deploy] Database migrations and roles provisioned successfully.');
