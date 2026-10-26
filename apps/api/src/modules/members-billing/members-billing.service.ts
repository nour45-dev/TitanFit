import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  type CreateMemberDto,
  type CreateSubscriptionPlanDto,
  type FreezeSubscriptionDto,
  type PaymentMethodProvider,
  type PurchaseSubscriptionDto,
} from '@gymos/contracts';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CryptoService, type EncryptedFieldPayload } from '../../common/crypto.service.js';
import { AuditLogService } from '../audit/audit-log.service.js';

export interface MemberRecord {
  id: string;
  tenantId: string;
  branchId: string;
  membershipNumber: string;
  fullNameEn: string;
  fullNameAr: string;
  phone: string;
  email: string | null;
  gender: 'MALE' | 'FEMALE';
  emergencyContactName: string;
  emergencyContactPhone: string;
  tags: string[];
  encryptedHealth: EncryptedFieldPayload | null;
  createdAtIso: string;
}

export interface SubscriptionPlanRecord extends CreateSubscriptionPlanDto {
  id: string;
  tenantId: string;
}

export interface SubscriptionRecord {
  id: string;
  tenantId: string;
  memberId: string;
  planId: string;
  planNameEn: string;
  planNameAr: string;
  branchId: string;
  status: 'ACTIVE' | 'FROZEN' | 'GRACE_PERIOD' | 'EXPIRED' | 'CANCELLED';
  startsAtIso: string;
  endsAtIso: string;
  remainingSessions: number | null;
  freezeDaysUsed: number;
  freezeCountUsed: number;
  autoRenew: boolean;
}

export interface InvoiceRecord {
  id: string;
  tenantId: string;
  branchId: string;
  memberId: string;
  memberNameEn: string;
  memberNameAr: string;
  invoiceNumber: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: 'EGP' | 'SAR' | 'AED' | 'USD' | 'EUR';
  paymentProvider: PaymentMethodProvider;
  instaPayReference: string | null;
  status: 'PAID' | 'PENDING_INSTAPAY_VERIFICATION' | 'REFUNDED';
  installmentsCount: number;
  qrVerificationHash: string;
  createdAtIso: string;
}

@Injectable()
export class MembersBillingService {
  private readonly members = new Map<string, MemberRecord>();
  private readonly plans = new Map<string, SubscriptionPlanRecord>();
  private readonly subscriptions = new Map<string, SubscriptionRecord>();
  private readonly invoices = new Map<string, InvoiceRecord>();
  private readonly idempotencyStore = new Map<string, unknown>();
  private readonly coupons = new Map<string, { code: string; discountPercent: number }>([
    ['RAMADAN20', { code: 'RAMADAN20', discountPercent: 20 }],
    ['TITAN15', { code: 'TITAN15', discountPercent: 15 }],
    ['CORPORATE25', { code: 'CORPORATE25', discountPercent: 25 }],
  ]);

  constructor(
    @Inject(CryptoService) private readonly crypto: CryptoService,
    @Inject(AuditLogService) private readonly auditLog: AuditLogService,
  ) {
    this.seedInitialMembersAndPlans();
  }

  private seedInitialMembersAndPlans() {
    const titanCairoId = '11111111-1111-4111-8111-111111111111';
    const zamalekBranchId = '11111111-1111-4111-8111-111111110001';

    const annualVipPlanId = '11111111-1111-4111-8111-200000000001';
    const quarterlyPlanId = '11111111-1111-4111-8111-200000000002';
    const ptPackPlanId = '11111111-1111-4111-8111-200000000003';

    this.plans.set(annualVipPlanId, {
      id: annualVipPlanId,
      tenantId: titanCairoId,
      code: 'ANNUAL-VIP',
      nameEn: 'Annual Rooted VIP All-Access',
      nameAr: 'اشتراك سنوي VIP شامل جميع الفروع',
      type: 'DURATION',
      priceMinor: 1200000, // 12,000.00 EGP
      currency: 'EGP',
      durationDays: 365,
      totalSessions: null,
      maxFreezeDays: 30,
      maxFreezeCount: 3,
      gracePeriodDays: 5,
      multiBranchAccess: true,
      maxFamilyMembers: 1,
    });

    this.plans.set(quarterlyPlanId, {
      id: quarterlyPlanId,
      tenantId: titanCairoId,
      code: 'QUARTERLY-PRO',
      nameEn: 'Quarterly Pro Transformation (3 Months)',
      nameAr: 'باقة التحول الاحترافية (٣ شهور)',
      type: 'DURATION',
      priceMinor: 420000, // 4,200.00 EGP
      currency: 'EGP',
      durationDays: 90,
      totalSessions: null,
      maxFreezeDays: 14,
      maxFreezeCount: 2,
      gracePeriodDays: 3,
      multiBranchAccess: true,
      maxFamilyMembers: 1,
    });

    this.plans.set(ptPackPlanId, {
      id: ptPackPlanId,
      tenantId: titanCairoId,
      code: 'PT-20-SESSIONS',
      nameEn: '20 Private Coaching Sessions Pack',
      nameAr: 'باقة ٢٠ حصة تدريب شخصي',
      type: 'SESSION_PACK',
      priceMinor: 650000, // 6,500.00 EGP
      currency: 'EGP',
      durationDays: 120,
      totalSessions: 20,
      maxFreezeDays: 14,
      maxFreezeCount: 1,
      gracePeriodDays: 0,
      multiBranchAccess: true,
      maxFamilyMembers: 1,
    });

    const ahmedMemberId = '11111111-1111-4111-8111-000000000005';
    const encryptedHealth = this.crypto.encryptHealthData(
      JSON.stringify({
        bloodType: 'O+',
        medicalConditions: ['None'],
        injuries: ['Mild left shoulder impingement (2024)'],
        medications: [],
        parqCleared: true,
        doctorNotes: 'Cleared for high-intensity resistance & CrossFit training',
      }),
      titanCairoId,
    );

    this.members.set(ahmedMemberId, {
      id: ahmedMemberId,
      tenantId: titanCairoId,
      branchId: zamalekBranchId,
      membershipNumber: 'TF-CAI-1001',
      fullNameEn: 'Ahmed Mahmoud',
      fullNameAr: 'أحمد محمود',
      phone: '+201055555555',
      email: 'member.ahmed@titanfit.eg',
      gender: 'MALE',
      emergencyContactName: 'Mahmoud Hassan',
      emergencyContactPhone: '+201055555500',
      tags: ['VIP', 'Morning-Crew', 'CrossFit'],
      encryptedHealth,
      createdAtIso: new Date(Date.now() - 30 * 86400_000).toISOString(),
    });

    const now = Date.now();
    const subId = '11111111-1111-4111-8111-300000000001';
    this.subscriptions.set(subId, {
      id: subId,
      tenantId: titanCairoId,
      memberId: ahmedMemberId,
      planId: annualVipPlanId,
      planNameEn: 'Annual Rooted VIP All-Access',
      planNameAr: 'اشتراك سنوي VIP شامل جميع الفروع',
      branchId: zamalekBranchId,
      status: 'ACTIVE',
      startsAtIso: new Date(now - 30 * 86400_000).toISOString(),
      endsAtIso: new Date(now + 335 * 86400_000).toISOString(),
      remainingSessions: null,
      freezeDaysUsed: 0,
      freezeCountUsed: 0,
      autoRenew: true,
    });

    const invId = '11111111-1111-4111-8111-400000000001';
    this.invoices.set(invId, {
      id: invId,
      tenantId: titanCairoId,
      branchId: zamalekBranchId,
      memberId: ahmedMemberId,
      memberNameEn: 'Ahmed Mahmoud',
      memberNameAr: 'أحمد محمود',
      invoiceNumber: 'INV-2026-1001',
      subtotalMinor: 1200000,
      discountMinor: 0,
      taxMinor: 168000, // 14% Egypt VAT
      totalMinor: 1368000,
      currency: 'EGP',
      paymentProvider: 'PAYMOB_CARD',
      instaPayReference: null,
      status: 'PAID',
      installmentsCount: 1,
      qrVerificationHash: createHmac('sha256', 'invoice-qr-key')
        .update(`${titanCairoId}:INV-2026-1001:1368000`)
        .digest('hex')
        .slice(0, 32),
      createdAtIso: new Date(now - 30 * 86400_000).toISOString(),
    });
  }

  createMember(tenantId: string, actorId: string, dto: CreateMemberDto): MemberRecord {
    const id = crypto.randomUUID();
    const count = Array.from(this.members.values()).filter((m) => m.tenantId === tenantId).length;
    const membershipNumber = `TF-${(count + 1001).toString()}`;

    const encryptedHealth = dto.healthInfo
      ? this.crypto.encryptHealthData(JSON.stringify(dto.healthInfo), tenantId)
      : null;

    const record: MemberRecord = {
      id,
      tenantId,
      branchId: dto.branchId,
      membershipNumber,
      fullNameEn: dto.fullNameEn,
      fullNameAr: dto.fullNameAr,
      phone: dto.phone,
      email: dto.email ?? null,
      gender: dto.gender,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactPhone: dto.emergencyContactPhone,
      tags: dto.tags,
      encryptedHealth,
      createdAtIso: new Date().toISOString(),
    };

    this.members.set(id, record);
    this.auditLog.record({
      tenantId,
      actorId,
      impersonatorId: null,
      action: 'members.created',
      entityType: 'member',
      entityId: id,
      ipAddress: '127.0.0.1',
      userAgent: 'AdminDashboard',
      metadata: { membershipNumber, branchId: dto.branchId },
    });

    return record;
  }

  listMembers(tenantId: string): Omit<MemberRecord, 'encryptedHealth'>[] {
    return Array.from(this.members.values())
      .filter((m) => m.tenantId === tenantId)
      .map(({ encryptedHealth: _enc, ...safeMember }) => safeMember);
  }

  getMemberDecryptedHealth(tenantId: string, actorId: string, memberId: string) {
    const member = this.members.get(memberId);
    if (!member || member.tenantId !== tenantId) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: 'Member not found in current tenant',
      });
    }
    this.auditLog.record({
      tenantId,
      actorId,
      impersonatorId: null,
      action: 'members.health_record.viewed',
      entityType: 'member_health',
      entityId: memberId,
      ipAddress: '127.0.0.1',
      userAgent: 'AuthorizedHealthAccess',
      metadata: {},
    });

    if (!member.encryptedHealth) {
      return null;
    }
    const jsonStr = this.crypto.decryptHealthData(member.encryptedHealth, tenantId);
    return JSON.parse(jsonStr) as Record<string, unknown>;
  }

  createPlan(tenantId: string, actorId: string, dto: CreateSubscriptionPlanDto): SubscriptionPlanRecord {
    const id = crypto.randomUUID();
    const plan: SubscriptionPlanRecord = {
      ...dto,
      id,
      tenantId,
    };
    this.plans.set(id, plan);
    this.auditLog.record({
      tenantId,
      actorId,
      impersonatorId: null,
      action: 'plans.created',
      entityType: 'subscription_plan',
      entityId: id,
      ipAddress: '127.0.0.1',
      userAgent: 'AdminDashboard',
      metadata: { code: dto.code, priceMinor: dto.priceMinor },
    });
    return plan;
  }

  listPlans(tenantId: string): SubscriptionPlanRecord[] {
    return Array.from(this.plans.values()).filter((p) => p.tenantId === tenantId);
  }

  /**
   * Purchases a subscription with strict Idempotency-Key deduplication,
   * coupon discount calculation, 14% Egypt VAT calculation, InstaPay reference handling,
   * and signed QR verification hash generation.
   */
  purchaseSubscription(
    tenantId: string,
    actorId: string,
    dto: PurchaseSubscriptionDto,
    idempotencyKey?: string,
  ): { subscription: SubscriptionRecord; invoice: InvoiceRecord; idempotentReplay: boolean } {
    if (idempotencyKey) {
      const cacheKey = `${tenantId}:purchase:${idempotencyKey}`;
      const existing = this.idempotencyStore.get(cacheKey) as
        | { subscription: SubscriptionRecord; invoice: InvoiceRecord }
        | undefined;
      if (existing) {
        return { ...existing, idempotentReplay: true };
      }
    }

    const member = this.members.get(dto.memberId);
    if (!member || member.tenantId !== tenantId) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: 'Member not found in current tenant',
      });
    }

    const plan = this.plans.get(dto.planId);
    if (!plan || plan.tenantId !== tenantId) {
      throw new NotFoundException({
        code: 'PLAN_NOT_FOUND',
        message: 'Subscription plan not found in current tenant',
      });
    }

    if (dto.paymentProvider === 'INSTAPAY' && !dto.instaPayReference) {
      throw new BadRequestException({
        code: 'INSTAPAY_REFERENCE_REQUIRED',
        message: 'InstaPay transfer reference number is required for InstaPay payments',
      });
    }

    const subtotalMinor = plan.priceMinor;
    let discountMinor = 0;
    if (dto.couponCode) {
      const coupon = this.coupons.get(dto.couponCode.toUpperCase());
      if (!coupon) {
        throw new BadRequestException({
          code: 'INVALID_COUPON_CODE',
          message: `Coupon '${dto.couponCode}' is invalid or expired`,
        });
      }
      discountMinor = Math.round((subtotalMinor * coupon.discountPercent) / 100);
    }

    const netMinor = subtotalMinor - discountMinor;
    const taxMinor = Math.round(netMinor * 0.14); // 14% Egypt VAT
    const totalMinor = netMinor + taxMinor;

    const startsAt = dto.startDateIso ? new Date(dto.startDateIso) : new Date();
    const endsAt = new Date(startsAt.getTime() + plan.durationDays * 86400_000);

    const subscription: SubscriptionRecord = {
      id: crypto.randomUUID(),
      tenantId,
      memberId: member.id,
      planId: plan.id,
      planNameEn: plan.nameEn,
      planNameAr: plan.nameAr,
      branchId: dto.branchId,
      status: 'ACTIVE',
      startsAtIso: startsAt.toISOString(),
      endsAtIso: endsAt.toISOString(),
      remainingSessions: plan.totalSessions,
      freezeDaysUsed: 0,
      freezeCountUsed: 0,
      autoRenew: dto.autoRenew,
    };

    const invCount = Array.from(this.invoices.values()).filter((i) => i.tenantId === tenantId).length;
    const invoiceNumber = `INV-2026-${(invCount + 1001).toString()}`;
    const qrVerificationHash = createHmac('sha256', 'invoice-qr-key')
      .update(`${tenantId}:${invoiceNumber}:${totalMinor}`)
      .digest('hex')
      .slice(0, 32);

    const invoice: InvoiceRecord = {
      id: crypto.randomUUID(),
      tenantId,
      branchId: dto.branchId,
      memberId: member.id,
      memberNameEn: member.fullNameEn,
      memberNameAr: member.fullNameAr,
      invoiceNumber,
      subtotalMinor,
      discountMinor,
      taxMinor,
      totalMinor,
      currency: plan.currency,
      paymentProvider: dto.paymentProvider,
      instaPayReference: dto.instaPayReference ?? null,
      status:
        dto.paymentProvider === 'INSTAPAY' ? 'PENDING_INSTAPAY_VERIFICATION' : 'PAID',
      installmentsCount: dto.installmentsCount,
      qrVerificationHash,
      createdAtIso: new Date().toISOString(),
    };

    this.subscriptions.set(subscription.id, subscription);
    this.invoices.set(invoice.id, invoice);

    this.auditLog.record({
      tenantId,
      actorId,
      impersonatorId: null,
      action: 'subscriptions.purchased',
      entityType: 'subscription',
      entityId: subscription.id,
      ipAddress: '127.0.0.1',
      userAgent: 'CashierCheckout',
      metadata: {
        invoiceNumber,
        totalMinor,
        paymentProvider: dto.paymentProvider,
      },
    });

    if (idempotencyKey) {
      const cacheKey = `${tenantId}:purchase:${idempotencyKey}`;
      this.idempotencyStore.set(cacheKey, { subscription, invoice });
    }

    return { subscription, invoice, idempotentReplay: false };
  }

  freezeSubscription(
    tenantId: string,
    actorId: string,
    dto: FreezeSubscriptionDto,
  ): SubscriptionRecord {
    const sub = this.subscriptions.get(dto.subscriptionId);
    if (!sub || sub.tenantId !== tenantId) {
      throw new NotFoundException({
        code: 'SUBSCRIPTION_NOT_FOUND',
        message: 'Subscription not found in current tenant',
      });
    }
    const plan = this.plans.get(sub.planId);
    if (!plan) {
      throw new NotFoundException({ code: 'PLAN_NOT_FOUND', message: 'Plan not found' });
    }

    if (sub.freezeCountUsed + 1 > plan.maxFreezeCount) {
      throw new ConflictException({
        code: 'MAX_FREEZE_COUNT_EXCEEDED',
        message: `Plan allows at most ${plan.maxFreezeCount} freezes`,
      });
    }
    if (sub.freezeDaysUsed + dto.freezeDays > plan.maxFreezeDays) {
      throw new ConflictException({
        code: 'MAX_FREEZE_DAYS_EXCEEDED',
        message: `Plan allows at most ${plan.maxFreezeDays} total freeze days`,
      });
    }

    sub.status = 'FROZEN';
    sub.freezeCountUsed += 1;
    sub.freezeDaysUsed += dto.freezeDays;
    // Extend endsAtIso by freezeDays so the member does not lose paid active days
    sub.endsAtIso = new Date(
      new Date(sub.endsAtIso).getTime() + dto.freezeDays * 86400_000,
    ).toISOString();

    this.auditLog.record({
      tenantId,
      actorId,
      impersonatorId: null,
      action: 'subscriptions.frozen',
      entityType: 'subscription',
      entityId: sub.id,
      ipAddress: '127.0.0.1',
      userAgent: 'AdminDashboard',
      metadata: { freezeDays: dto.freezeDays, reason: dto.reason, newEndsAtIso: sub.endsAtIso },
    });

    return sub;
  }

  unfreezeSubscription(tenantId: string, actorId: string, subscriptionId: string): SubscriptionRecord {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub || sub.tenantId !== tenantId) {
      throw new NotFoundException({
        code: 'SUBSCRIPTION_NOT_FOUND',
        message: 'Subscription not found in current tenant',
      });
    }
    sub.status = 'ACTIVE';
    this.auditLog.record({
      tenantId,
      actorId,
      impersonatorId: null,
      action: 'subscriptions.unfrozen',
      entityType: 'subscription',
      entityId: sub.id,
      ipAddress: '127.0.0.1',
      userAgent: 'AdminDashboard',
      metadata: {},
    });
    return sub;
  }

  verifyInstaPayInvoice(tenantId: string, actorId: string, invoiceId: string): InvoiceRecord {
    const inv = this.invoices.get(invoiceId);
    if (!inv || inv.tenantId !== tenantId) {
      throw new NotFoundException({
        code: 'INVOICE_NOT_FOUND',
        message: 'Invoice not found in current tenant',
      });
    }
    inv.status = 'PAID';
    this.auditLog.record({
      tenantId,
      actorId,
      impersonatorId: null,
      action: 'payments.instapay_verified',
      entityType: 'invoice',
      entityId: inv.id,
      ipAddress: '127.0.0.1',
      userAgent: 'CashierConsole',
      metadata: { instaPayReference: inv.instaPayReference },
    });
    return inv;
  }

  refundInvoice(tenantId: string, actorId: string, invoiceId: string, reason: string): InvoiceRecord {
    const inv = this.invoices.get(invoiceId);
    if (!inv || inv.tenantId !== tenantId) {
      throw new NotFoundException({
        code: 'INVOICE_NOT_FOUND',
        message: 'Invoice not found in current tenant',
      });
    }
    inv.status = 'REFUNDED';
    this.auditLog.record({
      tenantId,
      actorId,
      impersonatorId: null,
      action: 'payments.invoice_refunded',
      entityType: 'invoice',
      entityId: inv.id,
      ipAddress: '127.0.0.1',
      userAgent: 'AdminDashboard',
      metadata: { reason, refundedAmountMinor: inv.totalMinor },
    });
    return inv;
  }

  /**
   * Verifies HMAC-SHA512 / SHA256 payment webhook signatures (Paymob / Fawry / Stripe).
   */
  verifyPaymentWebhookSignature(
    provider: 'PAYMOB' | 'FAWRY' | 'STRIPE',
    rawPayload: string,
    signatureHex: string,
  ): boolean {
    const secret =
      provider === 'PAYMOB'
        ? process.env.PAYMOB_HMAC_SECRET || 'mock_paymob_hmac_secret'
        : provider === 'FAWRY'
          ? process.env.FAWRY_SECURITY_KEY || 'mock_fawry_security_key'
          : process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';

    const algo = provider === 'PAYMOB' ? 'sha512' : 'sha256';
    const expected = createHmac(algo, secret).update(rawPayload).digest('hex');

    const a = Buffer.from(signatureHex);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException({
        code: 'INVALID_WEBHOOK_SIGNATURE',
        message: `Webhook signature verification failed for ${provider}`,
      });
    }
    return true;
  }

  getActiveMemberSubscription(tenantId: string, memberId: string): SubscriptionRecord | null {
    for (const sub of this.subscriptions.values()) {
      if (sub.tenantId === tenantId && sub.memberId === memberId) {
        return sub;
      }
    }
    return null;
  }

  listInvoices(tenantId: string): InvoiceRecord[] {
    return Array.from(this.invoices.values()).filter((i) => i.tenantId === tenantId);
  }
}
