import { z } from 'zod';

/**
 * Standardized API Response Envelope & Cursor Pagination Contracts
 */
export const ApiMetaSchema = z.object({
  requestId: z.string(),
  timestamp: z.string().datetime(),
  version: z.literal('v1').default('v1'),
});

export type ApiMeta = z.infer<typeof ApiMetaSchema>;

export const CursorPaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().max(120).optional(),
});

export type CursorPaginationQuery = z.infer<typeof CursorPaginationQuerySchema>;

export const ApiErrorDetailSchema = z.object({
  field: z.string().optional(),
  code: z.string(),
  message: z.string(),
});

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(ApiErrorDetailSchema).optional(),
  }),
  meta: ApiMetaSchema,
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export function createSuccessResponse<T>(data: T, requestId: string) {
  return {
    success: true as const,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      version: 'v1' as const,
    },
  };
}

/**
 * Health & Readiness Schemas (Used by Railway Health Checks & Uptime Monitors)
 */
export const HealthStatusSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  service: z.string(),
  appName: z.string(),
  version: z.string(),
  uptimeSeconds: z.number().nonnegative(),
  timestamp: z.string().datetime(),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const ReadinessStatusSchema = z.object({
  status: z.enum(['ready', 'not_ready']),
  checks: z.object({
    database: z.object({
      connected: z.boolean(),
      currentRole: z.string(),
      rlsEnforced: z.boolean(),
      latencyMs: z.number().nonnegative(),
    }),
    redis: z.object({
      connected: z.boolean(),
      latencyMs: z.number().nonnegative(),
    }),
  }),
  timestamp: z.string().datetime(),
});

export type ReadinessStatus = z.infer<typeof ReadinessStatusSchema>;
