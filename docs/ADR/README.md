# Architecture Decision Records (`docs/ADR/README.md`)

## ADR-001: Modular Monolith in NestJS (Fastify) over Early Microservices
- **Context**: TitanFit requires 13 domain modules (Auth, Tenants, RBAC, Members, Subscriptions, Payments, Classes, Bookings, Attendance, Workouts, Nutrition, POS, Reports) with strict sub-300ms p95 latency and low operational overhead on Railway.
- **Decision**: Build a modular monolith in NestJS 11 using the Fastify adapter, with strict module boundaries and shared Zod contracts (`@gymos/contracts`), plus a separate BullMQ worker process (`worker.ts`) using the same Docker image.
- **Consequences**: Zero network serialization overhead between domain modules during check-in/booking spikes, while allowing any module to be extracted into a standalone service later.

---

## ADR-002: Defense-in-Depth Multi-Tenancy with Non-Bypassable PostgreSQL RLS
- **Context**: In a shared-database SaaS platform, a single missing `WHERE tenant_id = ...` filter in application code could leak another gym's member or financial data. Furthermore, managed PostgreSQL default users have `BYPASSRLS`.
- **Decision**: Migration `0001_init_roles_and_rls` creates `gymos_app` with `NOSUPERUSER NOBYPASSRLS`, enables `FORCE ROW LEVEL SECURITY` on every tenant table, and binds every transaction to `app.current_tenant_id`. The `/api/v1/ready` probe actively verifies `rolbypassrls = false`.
- **Consequences**: Even if application code executes `SELECT * FROM members`, PostgreSQL's engine restricts results strictly to the active tenant.

---

## ADR-003: Offline-Capable 30-Second Rotating HMAC-SHA256 QR Check-In
- **Context**: Many gyms in Cairo and Alexandria have basement floors with weak mobile data, while static QR codes suffer from screenshot sharing among friends.
- **Decision**: Issue a device-bound HMAC secret (`qrDeviceSecret`) on login so the Member PWA computes a new time-windowed token (`TITANFIT:v1:<tenantId>:<memberId>:<window>:<hmac>`) every 30 seconds completely offline, paired with a 15-minute anti-passback cooldown at the reception scanner.
- **Consequences**: Works 100% offline on the member's phone while eliminating screenshot sharing fraud.
