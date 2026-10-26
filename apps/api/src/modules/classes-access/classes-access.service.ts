import {
  type CreateClassScheduleDto,
  type VerifyQrCheckinDto,
} from '@gymos/contracts';
import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CryptoService } from '../../common/crypto.service.js';
import { AuditLogService } from '../audit/audit-log.service.js';
import { MembersBillingService } from '../members-billing/members-billing.service.js';

export interface ClassScheduleRecord {
  id: string;
  tenantId: string;
  branchId: string;
  roomName: string;
  titleEn: string;
  titleAr: string;
  category: 'HIIT' | 'STRENGTH' | 'YOGA' | 'SPINNING' | 'CROSSFIT' | 'BOXING' | 'PILATES';
  trainerId: string;
  trainerNameEn: string;
  trainerNameAr: string;
  startsAtIso: string;
  endsAtIso: string;
  capacity: number;
  waitlistCapacity: number;
  lateCancelWindowMinutes: number;
  bookedCount: number;
  waitlistCount: number;
}

export interface ClassBookingRecord {
  id: string;
  tenantId: string;
  classScheduleId: string;
  memberId: string;
  status: 'BOOKED' | 'WAITLISTED' | 'CHECKED_IN' | 'LATE_CANCELLED' | 'CANCELLED';
  waitlistPosition: number | null;
  penaltyApplied: boolean;
  createdAtIso: string;
}

export interface AttendanceLogRecord {
  id: string;
  tenantId: string;
  branchId: string;
  memberId: string;
  method: 'QR_ROTATING_HMAC' | 'MANUAL_RECEPTION';
  allowed: boolean;
  denialReason: string | null;
  turnstileRelayPulseMs: number;
  checkedInAtIso: string;
}

@Injectable()
export class ClassesAccessService {
  private readonly schedules = new Map<string, ClassScheduleRecord>();
  private readonly bookings = new Map<string, ClassBookingRecord>();
  private readonly attendanceLogs: AttendanceLogRecord[] = [];
  private readonly lastCheckinTimeByMember = new Map<string, number>();

  constructor(
    @Inject(CryptoService) private readonly crypto: CryptoService,
    @Inject(MembersBillingService) private readonly membersBilling: MembersBillingService,
    @Inject(AuditLogService) private readonly auditLog: AuditLogService,
  ) {
    this.seedInitialClasses();
  }

  private seedInitialClasses() {
    const titanCairoId = '11111111-1111-4111-8111-111111111111';
    const zamalekBranchId = '11111111-1111-4111-8111-111111110001';
    const coachKarimId = '11111111-1111-4111-8111-000000000004';

    const class1Id = '11111111-1111-4111-8111-500000000001';
    const class2Id = '11111111-1111-4111-8111-500000000002';

    const tomorrow6pm = new Date(Date.now() + 24 * 3600_000);
    tomorrow6pm.setUTCHours(16, 0, 0, 0);
    const tomorrow7pm = new Date(tomorrow6pm.getTime() + 3600_000);

    this.schedules.set(class1Id, {
      id: class1Id,
      tenantId: titanCairoId,
      branchId: zamalekBranchId,
      roomName: 'Arena Studio A',
      titleEn: 'Rooted Conditioning & Barbell HIIT',
      titleAr: 'تدريب القوة والتحمل المكثف (HIIT)',
      category: 'HIIT',
      trainerId: coachKarimId,
      trainerNameEn: 'Coach Karim Nabil',
      trainerNameAr: 'كابتن كريم نبيل',
      startsAtIso: tomorrow6pm.toISOString(),
      endsAtIso: tomorrow7pm.toISOString(),
      capacity: 20,
      waitlistCapacity: 10,
      lateCancelWindowMinutes: 180,
      bookedCount: 18,
      waitlistCount: 0,
    });

    this.schedules.set(class2Id, {
      id: class2Id,
      tenantId: titanCairoId,
      branchId: zamalekBranchId,
      roomName: 'Mind & Mobility Hall',
      titleEn: 'Athletic Recovery & Mobility Flow',
      titleAr: 'مرونة واستشفاء عضلي للرياضيين',
      category: 'YOGA',
      trainerId: coachKarimId,
      trainerNameEn: 'Coach Karim Nabil',
      trainerNameAr: 'كابتن كريم نبيل',
      startsAtIso: new Date(tomorrow7pm.getTime() + 1800_000).toISOString(),
      endsAtIso: new Date(tomorrow7pm.getTime() + 5400_000).toISOString(),
      capacity: 15,
      waitlistCapacity: 8,
      lateCancelWindowMinutes: 120,
      bookedCount: 12,
      waitlistCount: 0,
    });
  }

  createClassSchedule(
    tenantId: string,
    actorId: string,
    dto: CreateClassScheduleDto,
  ): ClassScheduleRecord {
    const id = crypto.randomUUID();
    const schedule: ClassScheduleRecord = {
      id,
      tenantId,
      branchId: dto.branchId,
      roomName: dto.roomName,
      titleEn: dto.titleEn,
      titleAr: dto.titleAr,
      category: dto.category,
      trainerId: dto.trainerId,
      trainerNameEn: dto.trainerNameEn,
      trainerNameAr: dto.trainerNameAr,
      startsAtIso: dto.startsAtIso,
      endsAtIso: dto.endsAtIso,
      capacity: dto.capacity,
      waitlistCapacity: dto.waitlistCapacity,
      lateCancelWindowMinutes: dto.lateCancelWindowMinutes,
      bookedCount: 0,
      waitlistCount: 0,
    };

    this.schedules.set(id, schedule);
    this.auditLog.record({
      tenantId,
      actorId,
      impersonatorId: null,
      action: 'classes.schedule_created',
      entityType: 'class_schedule',
      entityId: id,
      ipAddress: '127.0.0.1',
      userAgent: 'AdminCalendar',
      metadata: { titleEn: dto.titleEn, capacity: dto.capacity },
    });
    return schedule;
  }

  listSchedules(tenantId: string, branchId?: string): ClassScheduleRecord[] {
    return Array.from(this.schedules.values()).filter(
      (s) => s.tenantId === tenantId && (!branchId || s.branchId === branchId),
    );
  }

  /**
   * Concurrency-safe booking engine:
   * - If `bookedCount < capacity`, books immediately (`BOOKED`).
   * - If class is full and `waitlistCount < waitlistCapacity`, places member on `WAITLISTED` queue.
   * - Rejects duplicate bookings by the same member.
   */
  bookClass(
    tenantId: string,
    classScheduleId: string,
    memberId: string,
  ): ClassBookingRecord {
    const schedule = this.schedules.get(classScheduleId);
    if (!schedule || schedule.tenantId !== tenantId) {
      throw new NotFoundException({
        code: 'CLASS_NOT_FOUND',
        message: 'Class schedule not found in current tenant',
      });
    }

    for (const existing of this.bookings.values()) {
      if (
        existing.tenantId === tenantId &&
        existing.classScheduleId === classScheduleId &&
        existing.memberId === memberId &&
        (existing.status === 'BOOKED' || existing.status === 'WAITLISTED')
      ) {
        throw new ConflictException({
          code: 'ALREADY_BOOKED_OR_WAITLISTED',
          message: 'Member is already booked or waitlisted for this class',
        });
      }
    }

    let status: 'BOOKED' | 'WAITLISTED';
    let waitlistPosition: number | null = null;

    if (schedule.bookedCount < schedule.capacity) {
      schedule.bookedCount += 1;
      status = 'BOOKED';
    } else if (schedule.waitlistCount < schedule.waitlistCapacity) {
      schedule.waitlistCount += 1;
      status = 'WAITLISTED';
      waitlistPosition = schedule.waitlistCount;
    } else {
      throw new ConflictException({
        code: 'CLASS_AND_WAITLIST_FULL',
        message: 'Both class capacity and waitlist capacity are full',
      });
    }

    const booking: ClassBookingRecord = {
      id: crypto.randomUUID(),
      tenantId,
      classScheduleId,
      memberId,
      status,
      waitlistPosition,
      penaltyApplied: false,
      createdAtIso: new Date().toISOString(),
    };

    this.bookings.set(booking.id, booking);
    return booking;
  }

  /**
   * Cancels a booking, evaluates late-cancellation window penalties,
   * and automatically promotes the first `WAITLISTED` member to `BOOKED`!
   */
  cancelBooking(
    tenantId: string,
    bookingId: string,
    nowMs: number = Date.now(),
  ): {
    cancelledBooking: ClassBookingRecord;
    promotedBooking: ClassBookingRecord | null;
  } {
    const booking = this.bookings.get(bookingId);
    if (!booking || booking.tenantId !== tenantId) {
      throw new NotFoundException({
        code: 'BOOKING_NOT_FOUND',
        message: 'Booking not found in current tenant',
      });
    }

    const schedule = this.schedules.get(booking.classScheduleId);
    if (!schedule) {
      throw new NotFoundException({ code: 'CLASS_NOT_FOUND', message: 'Class not found' });
    }

    const wasBooked = booking.status === 'BOOKED';
    const minutesUntilStart = (new Date(schedule.startsAtIso).getTime() - nowMs) / 60_000;

    if (wasBooked && minutesUntilStart < schedule.lateCancelWindowMinutes) {
      booking.status = 'LATE_CANCELLED';
      booking.penaltyApplied = true;
    } else {
      booking.status = 'CANCELLED';
    }

    let promotedBooking: ClassBookingRecord | null = null;

    if (wasBooked) {
      schedule.bookedCount = Math.max(0, schedule.bookedCount - 1);

      // Find earliest waitlisted member for this class and auto-promote
      const waitlisted = Array.from(this.bookings.values())
        .filter(
          (b) =>
            b.tenantId === tenantId &&
            b.classScheduleId === schedule.id &&
            b.status === 'WAITLISTED',
        )
        .sort((a, b) => (a.waitlistPosition ?? 999) - (b.waitlistPosition ?? 999));

      const nextInLine = waitlisted[0];
      if (nextInLine) {
        nextInLine.status = 'BOOKED';
        nextInLine.waitlistPosition = null;
        schedule.bookedCount += 1;
        schedule.waitlistCount = Math.max(0, schedule.waitlistCount - 1);
        promotedBooking = nextInLine;
      }
    } else if (booking.waitlistPosition !== null) {
      schedule.waitlistCount = Math.max(0, schedule.waitlistCount - 1);
      booking.waitlistPosition = null;
    }

    return { cancelledBooking: booking, promotedBooking };
  }

  /**
   * Verifies a 30-second rotating HMAC-SHA256 QR token, checks active subscription
   * status (blocking FROZEN / EXPIRED / CANCELLED memberships), enforces a 15-minute
   * anti-passback cooldown, and returns a hardware turnstile relay pulse response.
   */
  verifyQrCheckin(
    tenantId: string,
    dto: VerifyQrCheckinDto,
    nowMs: number = Date.now(),
  ): AttendanceLogRecord {
    const verification = this.crypto.verifyRotatingQrToken(dto.qrToken, tenantId, nowMs);
    if (!verification.valid || !verification.memberId) {
      const deniedLog: AttendanceLogRecord = {
        id: crypto.randomUUID(),
        tenantId,
        branchId: dto.branchId,
        memberId: '00000000-0000-0000-0000-000000000000',
        method: 'QR_ROTATING_HMAC',
        allowed: false,
        denialReason: verification.reason || 'INVALID_QR',
        turnstileRelayPulseMs: 0,
        checkedInAtIso: new Date(nowMs).toISOString(),
      };
      this.attendanceLogs.push(deniedLog);
      throw new ForbiddenException({
        code: deniedLog.denialReason,
        message: `Access denied: ${deniedLog.denialReason}`,
      });
    }

    const memberId = verification.memberId;

    // Anti-passback cooldown check (15 minutes = 900,000ms)
    const passbackKey = `${tenantId}:${memberId}`;
    const lastCheckinMs = this.lastCheckinTimeByMember.get(passbackKey);
    if (lastCheckinMs && nowMs - lastCheckinMs < 15 * 60_000) {
      const deniedLog: AttendanceLogRecord = {
        id: crypto.randomUUID(),
        tenantId,
        branchId: dto.branchId,
        memberId,
        method: 'QR_ROTATING_HMAC',
        allowed: false,
        denialReason: 'ANTI_PASSBACK_COOLDOWN_ACTIVE',
        turnstileRelayPulseMs: 0,
        checkedInAtIso: new Date(nowMs).toISOString(),
      };
      this.attendanceLogs.push(deniedLog);
      throw new ConflictException({
        code: 'ANTI_PASSBACK_COOLDOWN_ACTIVE',
        message: 'Member already checked in within the last 15 minutes (anti-passback protection)',
      });
    }

    // Check active subscription status
    const sub = this.membersBilling.getActiveMemberSubscription(tenantId, memberId);
    if (!sub || sub.status !== 'ACTIVE' || new Date(sub.endsAtIso).getTime() < nowMs) {
      const reason = !sub
        ? 'NO_SUBSCRIPTION'
        : sub.status === 'FROZEN'
          ? 'SUBSCRIPTION_FROZEN'
          : 'SUBSCRIPTION_EXPIRED';

      const deniedLog: AttendanceLogRecord = {
        id: crypto.randomUUID(),
        tenantId,
        branchId: dto.branchId,
        memberId,
        method: 'QR_ROTATING_HMAC',
        allowed: false,
        denialReason: reason,
        turnstileRelayPulseMs: 0,
        checkedInAtIso: new Date(nowMs).toISOString(),
      };
      this.attendanceLogs.push(deniedLog);
      throw new ForbiddenException({
        code: reason,
        message: `Access denied: ${reason}`,
      });
    }

    if (sub.remainingSessions !== null) {
      if (sub.remainingSessions <= 0) {
        throw new ForbiddenException({
          code: 'NO_REMAINING_SESSIONS',
          message: 'Session pack has 0 remaining sessions',
        });
      }
      sub.remainingSessions -= 1;
    }

    this.lastCheckinTimeByMember.set(passbackKey, nowMs);

    const allowedLog: AttendanceLogRecord = {
      id: crypto.randomUUID(),
      tenantId,
      branchId: dto.branchId,
      memberId,
      method: 'QR_ROTATING_HMAC',
      allowed: true,
      denialReason: null,
      turnstileRelayPulseMs: 1500, // Triggers 1.5s hardware turnstile gate relay
      checkedInAtIso: new Date(nowMs).toISOString(),
    };
    this.attendanceLogs.push(allowedLog);

    return allowedLog;
  }

  listAttendanceLogs(tenantId: string): AttendanceLogRecord[] {
    return this.attendanceLogs.filter((l) => l.tenantId === tenantId).slice().reverse();
  }
}
