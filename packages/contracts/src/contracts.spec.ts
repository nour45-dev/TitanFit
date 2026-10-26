import { describe, expect, it } from 'vitest';
import {
  CursorPaginationQuerySchema,
  PERMISSIONS,
  ReadinessStatusSchema,
  createSuccessResponse,
} from './index.js';

describe('@gymos/contracts', () => {
  it('creates standardized v1 API success envelopes', () => {
    const res = createSuccessResponse({ ok: true }, 'req-123');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ ok: true });
    expect(res.meta.requestId).toBe('req-123');
    expect(res.meta.version).toBe('v1');
  });

  it('validates cursor pagination query defaults and bounds', () => {
    const parsed = CursorPaginationQuerySchema.parse({ limit: '50' });
    expect(parsed.limit).toBe(50);
    expect(parsed.sortOrder).toBe('desc');

    expect(() => CursorPaginationQuerySchema.parse({ limit: 500 })).toThrow();
  });

  it('validates readiness status with RLS enforcement flag', () => {
    const status = ReadinessStatusSchema.parse({
      status: 'ready',
      checks: {
        database: {
          connected: true,
          currentRole: 'gymos_app',
          rlsEnforced: true,
          latencyMs: 3.2,
        },
        redis: {
          connected: true,
          latencyMs: 1.1,
        },
      },
      timestamp: new Date().toISOString(),
    });
    expect(status.checks.database.rlsEnforced).toBe(true);
    expect(PERMISSIONS.includes('attendance:scan_qr')).toBe(true);
  });
});
