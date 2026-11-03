import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, appendFileSync } from 'node:fs';

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
// Use a single command string so /bin/sh -c on Linux executes the full command with all arguments
const migrateResult = spawnSync('pnpm exec prisma migrate deploy', {
  cwd: dbPackageDir,
  stdio: 'inherit',
  shell: true,
  env,
});

if (migrateResult.status !== 0) {
  console.error('[db:migrate:deploy] prisma migrate deploy exited with code', migrateResult.status);
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `### Database Migration Error\n` +
        `\`prisma migrate deploy\` failed with exit code: ${migrateResult.status}\n`
      );
    } catch {}
  }
  process.exit(migrateResult.status || 1);
}

console.log('[db:migrate:deploy] Provisioning runtime non-bypassable RLS roles...');
const provisionResult = spawnSync('node ./dist/provision-roles.js', {
  cwd: dbPackageDir,
  stdio: 'inherit',
  shell: true,
  env,
});

if (provisionResult.status !== 0) {
  console.error('[db:migrate:deploy] provision-roles exited with code', provisionResult.status);
  process.exit(provisionResult.status || 1);
}

console.log('✅ [db:migrate:deploy] Database migrations and roles provisioned successfully.');
