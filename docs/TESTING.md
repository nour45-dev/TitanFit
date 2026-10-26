# TitanFit — Testing Strategy & Benchmark Baselines (`TESTING.md`)

## 1. Test Pyramid & Commands

```bash
# Run all unit, integration, and PostgreSQL RLS suites across the monorepo
pnpm test

# Run Playwright E2E browser tests (English LTR & Arabic RTL across all 6 phase workspaces)
pnpm --filter @gymos/web test:e2e

# Run k6 1,000-VU Load Test against Booking & Rotating QR Check-in endpoints
k6 run -e API_BASE_URL=http://localhost:4000/api/v1 infra/k6/booking-and-checkin.load.js
```

## 2. Verified Test Suites

1. **`@gymos/config` (`packages/config/src/config.spec.ts`)**: Brand configuration overrides, RTL/LTR resolution, and fail-fast Zod startup environment validation.
2. **`@gymos/contracts` (`packages/contracts/src/contracts.spec.ts`)**: Standardized `/api/v1` response envelopes, cursor pagination bounds, and readiness schemas.
3. **`@gymos/database` (`packages/database/src/rls-role.spec.ts`)**: Executes SQL migrations `0001_init_roles_and_rls` and `0002_domain_tables_and_rls` against real PostgreSQL engine; proves `gymos_app` & `gymos_worker` have `NOSUPERUSER NOBYPASSRLS`, proves cross-tenant queries return 0 rows, and proves `audit_logs` rejects `UPDATE` and `DELETE`.
4. **`@gymos/ui` (`packages/ui/src/ui.spec.ts`)**: WCAG 2.1 AA 44px touch target enforcement, tenant CSS variable generation, and `ar-EG`/`en-EG` EGP formatting.
5. **`@gymos/api` (`apps/api/src/health.spec.ts` & `apps/api/src/platform-phases.spec.ts`)**:
   - Auth login, progressive lockout, and refresh token reuse detection.
   - Permission-based RBAC matrix (`GYM_OWNER`, `RECEPTIONIST`, `MEMBER`, `SUPER_ADMIN`).
   - Tenant isolation between Cairo and Alexandria tenants.
   - AES-256-GCM health record encryption bound to tenant AAD.
   - Subscription purchase, coupon discount, 14% VAT, `Idempotency-Key` replay deduplication, and Paymob HMAC-SHA512 webhook verification.
   - Class capacity enforcement and automatic waitlist promotion on cancellation.
   - 30s rotating HMAC-SHA256 QR verification, turnstile relay pulse, and 15-minute anti-passback cooldown.
   - Workout 1RM Personal Record detection, BMI calculation, `.ics` calendar export, POS sales, and 200-request concurrent latency benchmark (`p95 < 300ms`).
6. **`@gymos/web` (`apps/web/e2e/foundation.spec.ts`)**: End-to-end Chromium verification of all 6 phase workspaces in English LTR, Arabic RTL, Dark Mode, and Light Mode.
