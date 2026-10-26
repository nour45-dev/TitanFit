#!/usr/bin/env node
/**
 * GymOS Automated Offsite PostgreSQL Backup Script (`pg_dump` -> Cloudflare R2 / S3)
 * Provides a second, independent encrypted/compressed backup copy in external object
 * storage alongside Railway native PostgreSQL volume backups.
 */
import { execSync } from 'node:child_process';
import { readFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

async function runOffsiteBackup() {
  const dbUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_MIGRATION_URL or DATABASE_URL is required for pg_dump backup.');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `gymos-db-backup-${timestamp}.dump`;
  const tempFilePath = join(tmpdir(), fileName);

  console.log(`[backup] Running pg_dump to ${tempFilePath}...`);
  execSync(`pg_dump --format=custom --no-owner --no-acl --file="${tempFilePath}" "${dbUrl}"`, {
    stdio: 'inherit',
  });

  const s3 = new S3Client({
    region: process.env.STORAGE_REGION || 'auto',
    endpoint: process.env.STORAGE_ENDPOINT,
    forcePathStyle: (process.env.STORAGE_FORCE_PATH_STYLE ?? 'true') === 'true',
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || '',
    },
  });

  const bucket = process.env.STORAGE_BACKUP_BUCKET || 'gymos-backups';
  const fileBuffer = readFileSync(tempFilePath);
  const objectKey = `postgres/${new Date().toISOString().slice(0, 10)}/${fileName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: 'application/octet-stream',
    }),
  );

  unlinkSync(tempFilePath);
  console.log(`✅ [backup] Successfully uploaded offsite backup to s3://${bucket}/${objectKey}`);
}

runOffsiteBackup().catch((err) => {
  console.error('❌ [backup] Offsite PostgreSQL backup failed:', err);
  process.exit(1);
});
