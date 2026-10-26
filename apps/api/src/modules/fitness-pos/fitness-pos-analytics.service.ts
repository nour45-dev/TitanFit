import {
  type CreatePosSaleDto,
  type LogBodyMeasurementDto,
  type LogDailyNutritionDto,
  type LogWorkoutSessionDto,
  type SendChatMessageDto,
} from '@gymos/contracts';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit/audit-log.service.js';
import { ClassesAccessService } from '../classes-access/classes-access.service.js';
import { MembersBillingService } from '../members-billing/members-billing.service.js';

export interface WorkoutSessionRecord extends LogWorkoutSessionDto {
  id: string;
  tenantId: string;
  totalVolumeKg: number;
  personalRecordsAchieved: Array<{
    exerciseCode: string;
    exerciseNameEn: string;
    estimatedOneRepMaxKg: number;
  }>;
  loggedAtIso: string;
}

export interface BodyMeasurementRecord extends LogBodyMeasurementDto {
  id: string;
  tenantId: string;
  bmi: number;
  bmiCategory: 'UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE';
  loggedAtIso: string;
}

export interface PosProductRecord {
  id: string;
  tenantId: string;
  sku: string;
  nameEn: string;
  nameAr: string;
  category: 'SUPPLEMENT' | 'DRINK' | 'MERCHANDISE';
  priceMinor: number;
  stockQuantity: number;
}

export interface PosSaleRecord {
  id: string;
  tenantId: string;
  branchId: string;
  memberId: string | null;
  totalMinor: number;
  paymentProvider: string;
  createdAtIso: string;
}

export interface GamificationProfile {
  tenantId: string;
  memberId: string;
  currentStreakDays: number;
  longestStreakDays: number;
  points: number;
  badges: string[];
  optInLeaderboard: boolean;
}

export interface ChatMessageRecord extends SendChatMessageDto {
  id: string;
  tenantId: string;
  sentAtIso: string;
}

@Injectable()
export class FitnessPosAnalyticsService {
  private readonly workoutLogs: WorkoutSessionRecord[] = [];
  private readonly exercisePrMap = new Map<string, number>(); // `${tenantId}:${memberId}:${exerciseCode}` -> best 1RM
  private readonly measurements: BodyMeasurementRecord[] = [];
  private readonly nutritionLogs: Array<LogDailyNutritionDto & { tenantId: string }> = [];
  private readonly posProducts = new Map<string, PosProductRecord>();
  private readonly posSales: PosSaleRecord[] = [];
  private readonly gamification = new Map<string, GamificationProfile>();
  private readonly chatMessages: ChatMessageRecord[] = [];

  constructor(
    @Inject(MembersBillingService) private readonly membersBilling: MembersBillingService,
    @Inject(ClassesAccessService) private readonly classesAccess: ClassesAccessService,
    @Inject(AuditLogService) private readonly auditLog: AuditLogService,
  ) {
    this.seedFitnessAndPosData();
  }

  private seedFitnessAndPosData() {
    const titanCairoId = '11111111-1111-4111-8111-111111111111';
    const ahmedMemberId = '11111111-1111-4111-8111-000000000005';
    const coachKarimId = '11111111-1111-4111-8111-000000000004';

    const prodWheyId = '11111111-1111-4111-8111-700000000001';
    const prodIsoDrinkId = '11111111-1111-4111-8111-700000000002';
    const prodShirtId = '11111111-1111-4111-8111-700000000003';

    this.posProducts.set(prodWheyId, {
      id: prodWheyId,
      tenantId: titanCairoId,
      sku: 'SUP-WHEY-ISO',
      nameEn: 'TitanFit Gold Isolate Whey (1 Scoop Shake)',
      nameAr: 'مشروب واي بروتين أيزوليت جولد',
      category: 'SUPPLEMENT',
      priceMinor: 12000, // 120 EGP
      stockQuantity: 85,
    });

    this.posProducts.set(prodIsoDrinkId, {
      id: prodIsoDrinkId,
      tenantId: titanCairoId,
      sku: 'DRK-ELECTRO',
      nameEn: 'Rooted Electrolyte Hydration 500ml',
      nameAr: 'مشروب إلكتروليت للطاقة ٥٠٠ مل',
      category: 'DRINK',
      priceMinor: 4500, // 45 EGP
      stockQuantity: 150,
    });

    this.posProducts.set(prodShirtId, {
      id: prodShirtId,
      tenantId: titanCairoId,
      sku: 'MRCH-TEE-BLK',
      nameEn: 'Rooted Performance Gold Crest Tee',
      nameAr: 'تيشيرت تايتن فيت الأسود بالذهبي',
      category: 'MERCHANDISE',
      priceMinor: 65000, // 650 EGP
      stockQuantity: 40,
    });

    this.gamification.set(`${titanCairoId}:${ahmedMemberId}`, {
      tenantId: titanCairoId,
      memberId: ahmedMemberId,
      currentStreakDays: 14,
      longestStreakDays: 21,
      points: 1850,
      badges: ['FIRST_CHECKIN', 'STREAK_7_DAYS', 'STREAK_14_DAYS', 'BARBELL_PR_CLUB'],
      optInLeaderboard: true,
    });

    this.chatMessages.push({
      id: crypto.randomUUID(),
      tenantId: titanCairoId,
      senderId: coachKarimId,
      recipientId: ahmedMemberId,
      body: 'أهلاً يا بطل! تم تحديث جدول تمارين القوة والـ Macros للأسبوع الجديد.',
      sentAtIso: new Date(Date.now() - 3600_000).toISOString(),
    });
  }

  /**
   * Logs a workout session, calculates total volume lifted, and automatically detects
   * new Personal Records (PRs) using the Epley 1RM formula: `weight * (1 + reps / 30)`.
   */
  logWorkoutSession(tenantId: string, dto: LogWorkoutSessionDto): WorkoutSessionRecord {
    let totalVolumeKg = 0;
    const personalRecordsAchieved: WorkoutSessionRecord['personalRecordsAchieved'] = [];

    for (const set of dto.sets) {
      totalVolumeKg += set.reps * set.weightKg;
      const estimated1Rm = Number((set.weightKg * (1 + set.reps / 30)).toFixed(1));
      const prKey = `${tenantId}:${dto.memberId}:${set.exerciseCode}`;
      const previousBest = this.exercisePrMap.get(prKey) ?? 0;

      if (estimated1Rm > previousBest && set.weightKg > 0) {
        this.exercisePrMap.set(prKey, estimated1Rm);
        personalRecordsAchieved.push({
          exerciseCode: set.exerciseCode,
          exerciseNameEn: set.exerciseNameEn,
          estimatedOneRepMaxKg: estimated1Rm,
        });
      }
    }

    const record: WorkoutSessionRecord = {
      ...dto,
      id: crypto.randomUUID(),
      tenantId,
      totalVolumeKg: Number(totalVolumeKg.toFixed(1)),
      personalRecordsAchieved,
      loggedAtIso: new Date().toISOString(),
    };

    this.workoutLogs.push(record);

    // Reward gamification points & streak
    const gamKey = `${tenantId}:${dto.memberId}`;
    const currentGam = this.gamification.get(gamKey) ?? {
      tenantId,
      memberId: dto.memberId,
      currentStreakDays: 0,
      longestStreakDays: 0,
      points: 0,
      badges: [],
      optInLeaderboard: true,
    };

    currentGam.currentStreakDays += 1;
    currentGam.longestStreakDays = Math.max(
      currentGam.longestStreakDays,
      currentGam.currentStreakDays,
    );
    currentGam.points += 100 + personalRecordsAchieved.length * 50;
    if (
      personalRecordsAchieved.length > 0 &&
      !currentGam.badges.includes('NEW_PR_CRUSHER')
    ) {
      currentGam.badges.push('NEW_PR_CRUSHER');
    }
    this.gamification.set(gamKey, currentGam);

    return record;
  }

  logBodyMeasurement(tenantId: string, dto: LogBodyMeasurementDto): BodyMeasurementRecord {
    const heightM = dto.heightCm / 100;
    const bmi = Number((dto.weightKg / (heightM * heightM)).toFixed(1));
    const bmiCategory: BodyMeasurementRecord['bmiCategory'] =
      bmi < 18.5
        ? 'UNDERWEIGHT'
        : bmi < 25
          ? 'NORMAL'
          : bmi < 30
            ? 'OVERWEIGHT'
            : 'OBESE';

    const record: BodyMeasurementRecord = {
      ...dto,
      id: crypto.randomUUID(),
      tenantId,
      bmi,
      bmiCategory,
      loggedAtIso: new Date().toISOString(),
    };
    this.measurements.push(record);
    return record;
  }

  logDailyNutrition(tenantId: string, dto: LogDailyNutritionDto) {
    const entry = { ...dto, tenantId };
    this.nutritionLogs.push(entry);
    return entry;
  }

  /**
   * Generates a valid RFC 5545 iCalendar (`.ics`) payload for syncing a booked class
   * to Apple Calendar, Google Calendar, or Outlook.
   */
  generateClassIcsCalendar(tenantId: string, classScheduleId: string): string {
    const schedules = this.classesAccess.listSchedules(tenantId);
    const schedule = schedules.find((s) => s.id === classScheduleId);
    if (!schedule) {
      throw new NotFoundException({
        code: 'CLASS_NOT_FOUND',
        message: 'Class schedule not found in current tenant',
      });
    }

    const formatIcsDate = (iso: string) =>
      iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TitanFit//Rooted Performance//EN',
      'BEGIN:VEVENT',
      `UID:${schedule.id}@titanfit.eg`,
      `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
      `DTSTART:${formatIcsDate(schedule.startsAtIso)}`,
      `DTEND:${formatIcsDate(schedule.endsAtIso)}`,
      `SUMMARY:${schedule.titleEn} (${schedule.titleAr})`,
      `DESCRIPTION:Trainer: ${schedule.trainerNameEn} | Room: ${schedule.roomName}`,
      `LOCATION:${schedule.roomName}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  listPosProducts(tenantId: string): PosProductRecord[] {
    return Array.from(this.posProducts.values()).filter((p) => p.tenantId === tenantId);
  }

  createPosSale(tenantId: string, actorId: string, dto: CreatePosSaleDto): PosSaleRecord {
    let totalMinor = 0;

    for (const item of dto.items) {
      const product = this.posProducts.get(item.productId);
      if (!product || product.tenantId !== tenantId) {
        throw new NotFoundException({
          code: 'POS_PRODUCT_NOT_FOUND',
          message: `Product ${item.productId} not found in current tenant`,
        });
      }
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException({
          code: 'INSUFFICIENT_POS_STOCK',
          message: `Insufficient stock for ${product.nameEn}`,
        });
      }
      product.stockQuantity -= item.quantity;
      totalMinor += product.priceMinor * item.quantity;
    }

    const sale: PosSaleRecord = {
      id: crypto.randomUUID(),
      tenantId,
      branchId: dto.branchId,
      memberId: dto.memberId ?? null,
      totalMinor,
      paymentProvider: dto.paymentProvider,
      createdAtIso: new Date().toISOString(),
    };
    this.posSales.push(sale);

    this.auditLog.record({
      tenantId,
      actorId,
      impersonatorId: null,
      action: 'pos.sale_completed',
      entityType: 'pos_order',
      entityId: sale.id,
      ipAddress: '127.0.0.1',
      userAgent: 'ReceptionPOS',
      metadata: { totalMinor, itemCount: dto.items.length },
    });

    return sale;
  }

  sendChatMessage(tenantId: string, dto: SendChatMessageDto): ChatMessageRecord {
    const msg: ChatMessageRecord = {
      ...dto,
      id: crypto.randomUUID(),
      tenantId,
      sentAtIso: new Date().toISOString(),
    };
    this.chatMessages.push(msg);
    return msg;
  }

  listChatMessages(tenantId: string): ChatMessageRecord[] {
    return this.chatMessages.filter((m) => m.tenantId === tenantId);
  }

  getGamificationLeaderboard(tenantId: string): GamificationProfile[] {
    return Array.from(this.gamification.values())
      .filter((g) => g.tenantId === tenantId && g.optInLeaderboard)
      .sort((a, b) => b.points - a.points);
  }

  getExecutiveReportSummary(tenantId: string) {
    const members = this.membersBilling.listMembers(tenantId);
    const invoices = this.membersBilling.listInvoices(tenantId);
    const paidInvoices = invoices.filter((i) => i.status === 'PAID');
    const subscriptionRevenueMinor = paidInvoices.reduce((acc, i) => acc + i.totalMinor, 0);
    const posRevenueMinor = this.posSales
      .filter((s) => s.tenantId === tenantId)
      .reduce((acc, s) => acc + s.totalMinor, 0);
    const attendance = this.classesAccess.listAttendanceLogs(tenantId);

    // Exportable CSV string for finance/accounting teams
    const csvRows = [
      'InvoiceNumber,MemberName,PaymentProvider,Status,TotalEGP,CreatedAt',
      ...invoices.map(
        (i) =>
          `${i.invoiceNumber},"${i.memberNameEn}",${i.paymentProvider},${i.status},${(i.totalMinor / 100).toFixed(2)},${i.createdAtIso}`,
      ),
    ];

    return {
      tenantId,
      activeMembersCount: members.length,
      subscriptionRevenueMinor,
      posRevenueMinor,
      totalRevenueMinor: subscriptionRevenueMinor + posRevenueMinor,
      checkinsCount: attendance.filter((a) => a.allowed).length,
      deniedCheckinsCount: attendance.filter((a) => !a.allowed).length,
      invoicesCsvExport: csvRows.join('\n'),
    };
  }
}
