import { Injectable } from '@nestjs/common';

export interface AuditLogEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly impersonatorId: string | null;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAtIso: string;
}

/**
 * Immutable Append-Only Audit Log Service.
 * Every entry is frozen (`Object.freeze`) upon creation and stored per tenant.
 * Attempts to mutate or delete existing audit records are forbidden both in
 * application memory and via the PostgreSQL `trg_audit_logs_immutable` trigger.
 */
@Injectable()
export class AuditLogService {
  private readonly logs: Readonly<AuditLogEntry>[] = [];

  record(input: Omit<AuditLogEntry, 'id' | 'createdAtIso'>): Readonly<AuditLogEntry> {
    const entry: Readonly<AuditLogEntry> = Object.freeze({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      actorId: input.actorId,
      impersonatorId: input.impersonatorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: Object.freeze({ ...input.metadata }),
      createdAtIso: new Date().toISOString(),
    });

    this.logs.push(entry);
    return entry;
  }

  listByTenant(tenantId: string, actionFilter?: string): Readonly<AuditLogEntry>[] {
    return this.logs
      .filter(
        (log) =>
          log.tenantId === tenantId &&
          (!actionFilter || log.action === actionFilter),
      )
      .slice()
      .reverse();
  }

  listAllForSuperAdmin(): Readonly<AuditLogEntry>[] {
    return this.logs.slice().reverse();
  }
}
