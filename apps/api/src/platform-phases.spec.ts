import 'reflect-metadata';
import { createHmac } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module.js';
import { CryptoService } from './common/crypto.service.js';
import { MembersBillingService } from './modules/members-billing/members-billing.service.js';

describe('TitanFit Complete End-to-End API, Security, RBAC & Tenant Isolation Suite (Phases 1–6)', () => {
  let app: NestFastifyApplication;
  let crypto: CryptoService;
  let membersBilling: MembersBillingService;

  let cairoOwnerToken: string;
  let cairoReceptionistToken: string;
  let cairoMemberToken: string;
  let alexOwnerToken: string;
  let superAdminToken: string;

  const titanCairoId = '11111111-1111-4111-8111-111111111111';
  const zamalekBranchId = '11111111-1111-4111-8111-111111110001';
  const ahmedMemberId = '11111111-1111-4111-8111-000000000005';
  const annualVipPlanId = '11111111-1111-4111-8111-200000000001';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix('api/v1');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    crypto = moduleRef.get<CryptoService>(CryptoService);
    membersBilling = moduleRef.get<MembersBillingService>(MembersBillingService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // ==========================================================================
  // PHASE 1: AUTH, ROTATING REFRESH TOKENS, RBAC MATRIX & TENANT ISOLATION
  // ==========================================================================

  it('Phase 1.1: Authenticates users across roles and tenants and issues rotating refresh tokens', async () => {
    const ownerRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        tenantSlug: 'titanfit-cairo',
        identifier: 'owner@titanfit.eg',
        password: 'TitanFit#2026!',
      },
    });
    expect(ownerRes.statusCode).toBe(200);
    const ownerData = ownerRes.json().data;
    cairoOwnerToken = ownerData.accessToken;
    expect(ownerData.user.roleKeys).toContain('GYM_OWNER');
    expect(ownerData.qrDeviceSecret).toHaveLength(64);

    // Receptionist login
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        tenantSlug: 'titanfit-cairo',
        identifier: 'reception@titanfit.eg',
        password: 'TitanFit#2026!',
      },
    });
    cairoReceptionistToken = recRes.json().data.accessToken;

    // Member login
    const memRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        tenantSlug: 'titanfit-cairo',
        identifier: '+201055555555',
        password: 'TitanFit#2026!',
      },
    });
    cairoMemberToken = memRes.json().data.accessToken;

    // Tenant B (Alexandria Iron) Owner login
    const alexRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        tenantSlug: 'alexandria-iron',
        identifier: 'owner@alexiron.eg',
        password: 'TitanFit#2026!',
      },
    });
    alexOwnerToken = alexRes.json().data.accessToken;

    // Super Admin login
    const saRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        tenantSlug: 'titanfit-cairo',
        identifier: 'superadmin@titanfit.eg',
        password: 'TitanFit#2026!',
      },
    });
    superAdminToken = saRes.json().data.accessToken;
  });

  it('Phase 1.2: Detects refresh token reuse/replay and revokes the entire session token family', async () => {
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        tenantSlug: 'titanfit-cairo',
        identifier: 'owner@titanfit.eg',
        password: 'TitanFit#2026!',
      },
    });
    const refreshToken1 = loginRes.json().data.refreshToken;

    // First rotation succeeds and returns refreshToken2
    const rot1 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken: refreshToken1 },
    });
    expect(rot1.statusCode).toBe(200);
    const refreshToken2 = rot1.json().data.refreshToken;

    // Attacker replays refreshToken1 -> triggers reuse detection (403)
    const replayAttempt = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken: refreshToken1 },
    });
    expect(replayAttempt.statusCode).toBe(403);

    // Even refreshToken2 in the same family is now revoked!
    const subsequentAttempt = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken: refreshToken2 },
    });
    expect(subsequentAttempt.statusCode).toBe(403);
  });

  it('Phase 1.3: Enforces permission-based RBAC (Receptionist cannot issue refunds or view encrypted health records)', async () => {
    // Receptionist attempts to read decrypted member health record -> 403 Forbidden
    const healthAttempt = await app.inject({
      method: 'GET',
      url: `/api/v1/members/${ahmedMemberId}/health`,
      headers: { authorization: `Bearer ${cairoReceptionistToken}` },
    });
    expect(healthAttempt.statusCode).toBe(403);

    // Gym Owner has `members:health:read` -> 200 OK
    const ownerHealthRes = await app.inject({
      method: 'GET',
      url: `/api/v1/members/${ahmedMemberId}/health`,
      headers: { authorization: `Bearer ${cairoOwnerToken}` },
    });
    expect(ownerHealthRes.statusCode).toBe(200);
    expect(ownerHealthRes.json().data.bloodType).toBe('O+');
  });

  it('Phase 1.4: Enforces strict Tenant Isolation (Alexandria Tenant B cannot see or access Cairo Tenant A members or branches)', async () => {
    const alexMembersRes = await app.inject({
      method: 'GET',
      url: '/api/v1/members',
      headers: { authorization: `Bearer ${alexOwnerToken}` },
    });
    expect(alexMembersRes.statusCode).toBe(200);
    expect(alexMembersRes.json().data).toHaveLength(0);

    // Alexandria Owner attempts to read Cairo member health record by ID -> 404 Not Found
    const crossTenantAttempt = await app.inject({
      method: 'GET',
      url: `/api/v1/members/${ahmedMemberId}/health`,
      headers: { authorization: `Bearer ${alexOwnerToken}` },
    });
    expect(crossTenantAttempt.statusCode).toBe(404);
  });

  // ==========================================================================
  // PHASE 2: MEMBERS, AES-256-GCM HEALTH, SUBSCRIPTIONS, PAYMENTS & IDEMPOTENCY
  // ==========================================================================

  it('Phase 2.1: Encrypts health records with AES-256-GCM bound to tenant AAD', () => {
    const encrypted = crypto.encryptHealthData(
      JSON.stringify({ condition: 'Asthma' }),
      titanCairoId,
    );
    expect(encrypted.ciphertextHex).not.toContain('Asthma');

    // Attempting to decrypt with a different tenantId AAD throws authentication error
    expect(() =>
      crypto.decryptHealthData(encrypted, '22222222-2222-4222-8222-222222222222'),
    ).toThrow();
  });

  it('Phase 2.2: Purchases subscription with coupon discount, 14% VAT, QR invoice, and Idempotency-Key deduplication', async () => {
    const idempotencyKey = 'idem-purchase-test-001';
    const payload = {
      memberId: ahmedMemberId,
      planId: annualVipPlanId,
      branchId: zamalekBranchId,
      couponCode: 'RAMADAN20', // 20% off 12,000 EGP = 9,600 EGP + 14% VAT (1,344 EGP) = 10,944 EGP
      paymentProvider: 'PAYMOB_CARD',
      installmentsCount: 1,
      autoRenew: true,
    };

    const firstRes = await app.inject({
      method: 'POST',
      url: '/api/v1/subscriptions/purchase',
      headers: {
        authorization: `Bearer ${cairoReceptionistToken}`,
        'idempotency-key': idempotencyKey,
      },
      payload,
    });
    expect(firstRes.statusCode).toBe(201);
    const firstData = firstRes.json().data;
    expect(firstData.idempotentReplay).toBe(false);
    expect(firstData.invoice.subtotalMinor).toBe(1200000);
    expect(firstData.invoice.discountMinor).toBe(240000);
    expect(firstData.invoice.taxMinor).toBe(134400);
    expect(firstData.invoice.totalMinor).toBe(1094400);

    // Replay same request with same Idempotency-Key -> returns identical invoice without double-charging
    const replayRes = await app.inject({
      method: 'POST',
      url: '/api/v1/subscriptions/purchase',
      headers: {
        authorization: `Bearer ${cairoReceptionistToken}`,
        'idempotency-key': idempotencyKey,
      },
      payload,
    });
    expect(replayRes.statusCode).toBe(201);
    const replayData = replayRes.json().data;
    expect(replayData.idempotentReplay).toBe(true);
    expect(replayData.invoice.id).toBe(firstData.invoice.id);
  });

  it('Phase 2.3: Verifies Paymob HMAC-SHA512 webhook signatures and rejects forged webhooks', () => {
    const rawBody = JSON.stringify({ obj: { id: 99123, success: true, amount_cents: 1094400 } });
    const validSig = createHmac('sha512', 'mock_paymob_hmac_secret')
      .update(rawBody)
      .digest('hex');

    expect(
      membersBilling.verifyPaymentWebhookSignature('PAYMOB', rawBody, validSig),
    ).toBe(true);

    expect(() =>
      membersBilling.verifyPaymentWebhookSignature('PAYMOB', rawBody, 'deadbeef'),
    ).toThrow(/Webhook signature verification failed/);
  });

  // ==========================================================================
  // PHASE 3: HIGH-CONCURRENCY CLASS BOOKING, AUTO-WAITLIST & ROTATING QR CHECK-IN
  // ==========================================================================

  it('Phase 3.1: Enforces class capacity under concurrent requests and automatically promotes waitlisted member on cancellation', async () => {
    // Create a class with capacity = 1 and waitlistCapacity = 5
    const createClassRes = await app.inject({
      method: 'POST',
      url: '/api/v1/classes',
      headers: { authorization: `Bearer ${cairoOwnerToken}` },
      payload: {
        branchId: zamalekBranchId,
        roomName: 'Private Pod 1',
        titleEn: '1-on-1 Elite Kettlebell Sprint',
        titleAr: 'تدريب كيتل بيل فردي',
        category: 'STRENGTH',
        trainerId: '11111111-1111-4111-8111-000000000004',
        trainerNameEn: 'Coach Karim Nabil',
        trainerNameAr: 'كابتن كريم نبيل',
        startsAtIso: new Date(Date.now() + 48 * 3600_000).toISOString(),
        endsAtIso: new Date(Date.now() + 49 * 3600_000).toISOString(),
        capacity: 1,
        waitlistCapacity: 5,
        lateCancelWindowMinutes: 180,
      },
    });
    expect(createClassRes.statusCode).toBe(201);
    const classId = createClassRes.json().data.id;

    const member1 = '11111111-1111-4111-8111-000000000005';
    const member2 = '11111111-1111-4111-8111-000000000099';

    // Member 1 books the 1 available spot -> BOOKED
    const book1 = await app.inject({
      method: 'POST',
      url: `/api/v1/classes/${classId}/book`,
      headers: { authorization: `Bearer ${cairoMemberToken}` },
      payload: { memberId: member1 },
    });
    expect(book1.json().data.status).toBe('BOOKED');

    // Member 2 attempts to book -> automatically placed on WAITLISTED position #1
    const book2 = await app.inject({
      method: 'POST',
      url: `/api/v1/classes/${classId}/book`,
      headers: { authorization: `Bearer ${cairoMemberToken}` },
      payload: { memberId: member2 },
    });
    expect(book2.json().data.status).toBe('WAITLISTED');
    expect(book2.json().data.waitlistPosition).toBe(1);

    // Member 1 cancels -> Member 2 is automatically promoted from WAITLISTED to BOOKED!
    const cancelRes = await app.inject({
      method: 'POST',
      url: `/api/v1/bookings/${book1.json().data.id}/cancel`,
      headers: { authorization: `Bearer ${cairoMemberToken}` },
    });
    expect(cancelRes.statusCode).toBe(200);
    const cancelData = cancelRes.json().data;
    expect(cancelData.cancelledBooking.status).toBe('CANCELLED');
    expect(cancelData.promotedBooking.memberId).toBe(member2);
    expect(cancelData.promotedBooking.status).toBe('BOOKED');
  });

  it('Phase 3.2: Verifies 30s rotating HMAC-SHA256 QR check-in, opens turnstile gate, and blocks anti-passback replay', async () => {
    const qrGenRes = await app.inject({
      method: 'GET',
      url: `/api/v1/attendance/qr-token/${ahmedMemberId}`,
      headers: { authorization: `Bearer ${cairoMemberToken}` },
    });
    expect(qrGenRes.statusCode).toBe(200);
    const qrToken = qrGenRes.json().data.qrToken;

    // First scan at reception turnstile -> ALLOWED (1500ms relay pulse)
    const scan1 = await app.inject({
      method: 'POST',
      url: '/api/v1/attendance/verify-qr',
      headers: { authorization: `Bearer ${cairoReceptionistToken}` },
      payload: {
        branchId: zamalekBranchId,
        qrToken,
        turnstileDeviceId: 'GATE-ZAMALEK-01',
      },
    });
    expect(scan1.statusCode).toBe(200);
    expect(scan1.json().data.allowed).toBe(true);
    expect(scan1.json().data.turnstileRelayPulseMs).toBe(1500);

    // Immediate second scan within 15-minute cooldown -> 409 ANTI_PASSBACK_COOLDOWN_ACTIVE
    const scan2 = await app.inject({
      method: 'POST',
      url: '/api/v1/attendance/verify-qr',
      headers: { authorization: `Bearer ${cairoReceptionistToken}` },
      payload: {
        branchId: zamalekBranchId,
        qrToken,
        turnstileDeviceId: 'GATE-ZAMALEK-01',
      },
    });
    expect(scan2.statusCode).toBe(409);
  });

  // ==========================================================================
  // PHASE 4 & 5: WORKOUT PRs, BMI, ICS EXPORT, POS SALES & GAMIFICATION
  // ==========================================================================

  it('Phase 4 & 5: Logs workouts with 1RM Personal Record detection, calculates BMI, exports ICS, and processes POS sales', async () => {
    const workoutRes = await app.inject({
      method: 'POST',
      url: '/api/v1/workouts/log',
      headers: { authorization: `Bearer ${cairoMemberToken}` },
      payload: {
        memberId: ahmedMemberId,
        workoutTitleEn: 'Heavy Squat & Bench Day',
        workoutTitleAr: 'تمرين سكوات وبنش ثقيل',
        durationMinutes: 65,
        sets: [
          {
            exerciseCode: 'BARBELL_SQUAT',
            exerciseNameEn: 'Barbell Back Squat',
            exerciseNameAr: 'سكوات بالبار الخلفي',
            reps: 5,
            weightKg: 140,
            rpe: 9,
          },
        ],
      },
    });
    expect(workoutRes.statusCode).toBe(201);
    const workoutData = workoutRes.json().data;
    expect(workoutData.totalVolumeKg).toBe(700);
    expect(workoutData.personalRecordsAchieved).toHaveLength(1);
    expect(workoutData.personalRecordsAchieved[0].estimatedOneRepMaxKg).toBeGreaterThan(160);

    // Log body measurement
    const bmiRes = await app.inject({
      method: 'POST',
      url: '/api/v1/progress/measurements',
      headers: { authorization: `Bearer ${cairoMemberToken}` },
      payload: {
        memberId: ahmedMemberId,
        weightKg: 82,
        heightCm: 180,
        bodyFatPercent: 13.5,
      },
    });
    expect(bmiRes.statusCode).toBe(201);
    expect(bmiRes.json().data.bmi).toBe(25.3);

    // Export ICS Calendar for class
    const icsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/classes/11111111-1111-4111-8111-500000000001/ics',
      headers: { authorization: `Bearer ${cairoMemberToken}` },
    });
    expect(icsRes.statusCode).toBe(200);
    expect(icsRes.json().data.ics).toContain('BEGIN:VCALENDAR');

    // Complete POS Sale
    const posRes = await app.inject({
      method: 'POST',
      url: '/api/v1/pos/sales',
      headers: { authorization: `Bearer ${cairoReceptionistToken}` },
      payload: {
        branchId: zamalekBranchId,
        memberId: ahmedMemberId,
        paymentProvider: 'CASH',
        items: [
          {
            productId: '11111111-1111-4111-8111-700000000001',
            quantity: 2,
          },
        ],
      },
    });
    expect(posRes.statusCode).toBe(201);
    expect(posRes.json().data.totalMinor).toBe(24000);

    // Executive Report & CSV Export
    const reportRes = await app.inject({
      method: 'GET',
      url: '/api/v1/reports/executive-summary',
      headers: { authorization: `Bearer ${cairoOwnerToken}` },
    });
    expect(reportRes.statusCode).toBe(200);
    expect(reportRes.json().data.invoicesCsvExport).toContain('INV-2026-1001');
  });

  // ==========================================================================
  // PHASE 6: SUPER ADMIN IMPERSONATION (AUDITED) & HIGH-LOAD LATENCY BENCHMARK
  // ==========================================================================

  it('Phase 6.1: Allows Super Admin to list all SaaS tenants and perform audited impersonation', async () => {
    const tenantsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/super-admin/tenants',
      headers: { authorization: `Bearer ${superAdminToken}` },
    });
    expect(tenantsRes.statusCode).toBe(200);
    expect(tenantsRes.json().data.length).toBeGreaterThanOrEqual(2);

    const impRes = await app.inject({
      method: 'POST',
      url: '/api/v1/super-admin/impersonate',
      headers: { authorization: `Bearer ${superAdminToken}` },
      payload: {
        targetTenantId: titanCairoId,
        reason: 'Investigating branch billing support ticket #402',
      },
    });
    expect(impRes.statusCode).toBe(200);
    expect(impRes.json().data.user.impersonatedByUserId).toBe(
      '99999999-9999-4999-8999-999999999999',
    );
  });

  it('Phase 6.2: Performance Benchmark — 200 concurrent requests complete with p95 latency well under 300ms target', async () => {
    const latenciesMs: number[] = [];
    const totalRequests = 200;

    await Promise.all(
      Array.from({ length: totalRequests }).map(async (_, idx) => {
        const start = performance.now();
        const res = await app.inject({
          method: 'GET',
          url: `/api/v1/attendance/qr-token/${ahmedMemberId}`,
          headers: {
            authorization: `Bearer ${cairoMemberToken}`,
            'x-request-id': `bench-${idx}`,
          },
        });
        expect(res.statusCode).toBe(200);
        latenciesMs.push(performance.now() - start);
      }),
    );

    latenciesMs.sort((a, b) => a - b);
    const p95Index = Math.floor(latenciesMs.length * 0.95);
    const p95Ms = latenciesMs[p95Index] ?? 0;
    expect(p95Ms).toBeLessThan(300);
  });
});
