# TitanFit (Rooted Performance) — System Architecture (`ARCHITECTURE.md`)

## 1. Modular Monolith & Railway Topology

```mermaid
flowchart TB
    subgraph Clients["Clients (Arabic RTL & English LTR)"]
        PWA["Installable Member PWA\n(Next.js 15 + Offline QR)"]
        Admin["Gym & Branch Dashboard\n(Next.js 15)"]
        Super["Super Admin Console\n(Next.js 15)"]
        Gate["Hardware Turnstile Gate\n(REST Webhook)"]
    end

    subgraph Railway["Railway Cloud Project (staging & production)"]
        Web["Service: web\nNext.js 15 Standalone"]
        Api["Service: api\nNestJS 11 (Fastify) + Swagger"]
        Worker["Service: worker\nBullMQ Background Consumer"]
        PG[("PostgreSQL 16\nFORCE ROW LEVEL SECURITY\nRuntime Role: gymos_app (NOBYPASSRLS)")]
        Redis[("Redis 7\nCache, BullMQ, Redlock")]
    end

    subgraph External["External Gateways"]
        R2[("Cloudflare R2 / MinIO\nTenant-Prefixed Signed URLs")]
        Pay["Egypt & Intl Payments\nPaymob, Fawry, Vodafone Cash, InstaPay, Stripe"]
    end

    PWA & Admin & Super --> Web
    PWA & Admin & Super & Gate --> Api
    Web <--> Api
    Api --> PG
    Worker --> PG
    Api <--> Redis
    Worker <--> Redis
    Api <--> R2
    Worker --> R2
    Api <--> Pay
```

## 2. Isolated Domain Modules

1. **`Auth & Sessions`**: Memory-hard `scrypt` password hashing, short-lived HS256 JWT access tokens, rotating refresh token families with automatic reuse detection, 6-digit OTP challenges, RFC 6238 TOTP 2FA, and progressive brute-force lockout.
2. **`Tenants & RBAC`**: Permission-based `@RequirePermissions(...)` guards (`DEFAULT_ROLE_PERMISSIONS`), multi-branch scoping, and audited Super Admin impersonation.
3. **`Members & Billing`**: Member profiles, AES-256-GCM field-level health encryption bound to `tenantId` AAD, subscription plans, freeze/unfreeze date extension math, coupon discounts, 14% Egypt VAT calculation, idempotency-key deduplication, and signed QR tax invoices.
4. **`Classes & Access Control`**: Concurrency-safe class bookings, late-cancellation window penalties, automatic waitlist promotion, and 30-second rotating HMAC-SHA256 QR check-in with 15-minute anti-passback cooldown and hardware turnstile relay pulse.
5. **`Fitness, POS & Analytics`**: Workout logger with Epley 1RM Personal Record auto-detection, BMI body measurements, daily macro tracker, RFC 5545 `.ics` calendar export, POS inventory sales, gamification streaks/leaderboards, trainer-member chat, and CSV financial export.
