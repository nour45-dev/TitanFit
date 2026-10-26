import { z } from 'zod';
import { SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from './brand.config.js';

export const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('TitanFit'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(SUPPORTED_LOCALES).default('en'),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.enum(SUPPORTED_CURRENCIES).default('EGP'),
  NEXT_PUBLIC_DEFAULT_TIMEZONE: z.string().min(1).default('Africa/Cairo'),

  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_HOST: z.string().min(1).default('0.0.0.0'),
  API_CORS_ORIGINS: z.string().min(1).default('http://localhost:3000'),

  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
      'DATABASE_URL must be a valid PostgreSQL connection string',
    ),
  DATABASE_MIGRATION_URL: z.string().optional(),
  DATABASE_WORKER_URL: z.string().optional(),

  REDIS_URL: z
    .string()
    .min(1, 'REDIS_URL is required')
    .refine(
      (val) => val.startsWith('redis://') || val.startsWith('rediss://'),
      'REDIS_URL must be a valid Redis connection string',
    ),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),
  HEALTH_DATA_ENCRYPTION_KEY: z
    .string()
    .length(64, 'HEALTH_DATA_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)'),
  QR_HMAC_MASTER_SECRET: z.string().min(32, 'QR_HMAC_MASTER_SECRET must be at least 32 characters'),

  STORAGE_ENDPOINT: z.string().url().default('http://localhost:9000'),
  STORAGE_REGION: z.string().min(1).default('auto'),
  STORAGE_BUCKET: z.string().min(1).default('gymos-media'),
  STORAGE_BACKUP_BUCKET: z.string().min(1).default('gymos-backups'),
  STORAGE_ACCESS_KEY_ID: z.string().min(1).default('gymos_minio_admin'),
  STORAGE_SECRET_ACCESS_KEY: z.string().min(1).default('gymos_minio_secret_key'),
  STORAGE_FORCE_PATH_STYLE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  STORAGE_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(86400).default(900),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SENTRY_DSN: z.string().optional().default(''),
});

export type ApiEnvConfig = z.infer<typeof ApiEnvSchema>;

export const WebEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('TitanFit'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(SUPPORTED_LOCALES).default('en'),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.enum(SUPPORTED_CURRENCIES).default('EGP'),
  NEXT_PUBLIC_DEFAULT_TIMEZONE: z.string().min(1).default('Africa/Cairo'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000/api/v1'),
  NEXT_PUBLIC_WS_URL: z.string().min(1).default('ws://localhost:4000'),
  NEXT_PUBLIC_WEB_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional().default(''),
});

export type WebEnvConfig = z.infer<typeof WebEnvSchema>;

export function validateApiEnv(rawEnv: Record<string, string | undefined> = process.env): ApiEnvConfig {
  const result = ApiEnvSchema.safeParse(rawEnv);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid API Environment Configuration:\n${formatted}`);
  }
  return result.data;
}

export function validateWebEnv(rawEnv: Record<string, string | undefined> = process.env): WebEnvConfig {
  const result = WebEnvSchema.safeParse(rawEnv);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid Web Environment Configuration:\n${formatted}`);
  }
  return result.data;
}
