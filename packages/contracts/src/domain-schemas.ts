import { z } from 'zod';
import { PermissionSchema, SYSTEM_ROLE_KEYS } from './permissions.js';

export const EgyptianPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, 'Phone number must be a valid E.164 or 10-15 digit phone number');

export const LoginRequestSchema = z.object({
  tenantSlug: z.string().trim().min(2).max(80),
  identifier: z.string().trim().min(3).max(160), // Email or Phone
  password: z.string().min(8).max(128),
  totpCode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/)
    .optional(),
});

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

export const RequestOtpSchema = z.object({
  tenantSlug: z.string().trim().min(2).max(80),
  phoneOrEmail: z.string().trim().min(3).max(160),
  purpose: z.enum(['LOGIN', 'ONBOARDING', 'PASSWORD_RESET']).default('LOGIN'),
});

export type RequestOtpDto = z.infer<typeof RequestOtpSchema>;

export const VerifyOtpSchema = z.object({
  tenantSlug: z.string().trim().min(2).max(80),
  phoneOrEmail: z.string().trim().min(3).max(160),
  code: z.string().trim().regex(/^[0-9]{6}$/, 'OTP must be 6 digits'),
});

export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;

export const AuthenticatedUserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  tenantSlug: z.string(),
  branchId: z.string().uuid().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  fullNameEn: z.string(),
  fullNameAr: z.string(),
  roleKeys: z.array(z.enum(SYSTEM_ROLE_KEYS)),
  permissions: z.array(PermissionSchema),
  totpEnabled: z.boolean(),
  impersonatedByUserId: z.string().uuid().nullable().optional(),
});

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;

export const AuthSessionResponseSchema = z.object({
  accessToken: z.string(),
  expiresInSeconds: z.number().int().positive(),
  qrDeviceSecret: z.string(), // Used by Member PWA for offline 30s rotating HMAC-SHA256 QR
  user: AuthenticatedUserSchema,
});

export type AuthSessionResponse = z.infer<typeof AuthSessionResponseSchema>;

/**
 * Phase 2 — Members, Subscriptions, Egypt/Intl Payments & Invoices Schemas
 */
export const CreateMemberSchema = z.object({
  branchId: z.string().uuid(),
  fullNameEn: z.string().trim().min(2).max(120),
  fullNameAr: z.string().trim().min(2).max(120),
  phone: EgyptianPhoneSchema,
  email: z.string().email().optional(),
  gender: z.enum(['MALE', 'FEMALE']).default('MALE'),
  dateOfBirth: z.string().optional(),
  emergencyContactName: z.string().trim().min(2).max(120),
  emergencyContactPhone: EgyptianPhoneSchema,
  tags: z.array(z.string().trim().max(32)).default([]),
  healthInfo: z
    .object({
      bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN']).default('UNKNOWN'),
      medicalConditions: z.array(z.string()).default([]),
      injuries: z.array(z.string()).default([]),
      medications: z.array(z.string()).default([]),
      parqCleared: z.boolean().default(true),
      doctorNotes: z.string().max(1000).optional(),
    })
    .optional(),
});

export type CreateMemberDto = z.infer<typeof CreateMemberSchema>;

export const PlanTypeSchema = z.enum([
  'DURATION',
  'SESSION_PACK',
  'CLASS_PACK',
  'FAMILY',
  'CORPORATE',
]);

export type PlanType = z.infer<typeof PlanTypeSchema>;

export const CreateSubscriptionPlanSchema = z.object({
  code: z.string().trim().min(2).max(40),
  nameEn: z.string().trim().min(2).max(120),
  nameAr: z.string().trim().min(2).max(120),
  type: PlanTypeSchema,
  priceMinor: z.number().int().nonnegative(), // e.g., 150000 = 1,500.00 EGP
  currency: z.enum(['EGP', 'SAR', 'AED', 'USD', 'EUR']).default('EGP'),
  durationDays: z.number().int().positive(),
  totalSessions: z.number().int().positive().nullable().default(null),
  maxFreezeDays: z.number().int().nonnegative().default(14),
  maxFreezeCount: z.number().int().nonnegative().default(2),
  gracePeriodDays: z.number().int().nonnegative().default(3),
  multiBranchAccess: z.boolean().default(true),
  maxFamilyMembers: z.number().int().min(1).max(10).default(1),
});

export type CreateSubscriptionPlanDto = z.infer<typeof CreateSubscriptionPlanSchema>;

export const PaymentMethodProviderSchema = z.enum([
  'CASH',
  'PAYMOB_CARD',
  'FAWRY',
  'VODAFONE_CASH',
  'INSTAPAY',
  'STRIPE',
]);

export type PaymentMethodProvider = z.infer<typeof PaymentMethodProviderSchema>;

export const PurchaseSubscriptionSchema = z.object({
  memberId: z.string().uuid(),
  planId: z.string().uuid(),
  branchId: z.string().uuid(),
  startDateIso: z.string().datetime().optional(),
  couponCode: z.string().trim().max(40).optional(),
  paymentProvider: PaymentMethodProviderSchema,
  installmentsCount: z.number().int().min(1).max(12).default(1),
  instaPayReference: z.string().trim().max(100).optional(),
  autoRenew: z.boolean().default(false),
});

export type PurchaseSubscriptionDto = z.infer<typeof PurchaseSubscriptionSchema>;

export const FreezeSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid(),
  freezeDays: z.number().int().min(1).max(90),
  reason: z.string().trim().min(3).max(240),
});

export type FreezeSubscriptionDto = z.infer<typeof FreezeSubscriptionSchema>;

/**
 * Phase 3 — Classes, Bookings, Waitlist & Rotating QR Check-in Schemas
 */
export const CreateClassScheduleSchema = z.object({
  branchId: z.string().uuid(),
  roomName: z.string().trim().min(2).max(80),
  titleEn: z.string().trim().min(2).max(120),
  titleAr: z.string().trim().min(2).max(120),
  category: z.enum(['HIIT', 'STRENGTH', 'YOGA', 'SPINNING', 'CROSSFIT', 'BOXING', 'PILATES']),
  trainerId: z.string().uuid(),
  trainerNameEn: z.string().trim().min(2).max(120),
  trainerNameAr: z.string().trim().min(2).max(120),
  startsAtIso: z.string().datetime(),
  endsAtIso: z.string().datetime(),
  capacity: z.number().int().min(1).max(200),
  waitlistCapacity: z.number().int().min(0).max(100).default(20),
  lateCancelWindowMinutes: z.number().int().min(0).max(2880).default(180), // 3 hours default
});

export type CreateClassScheduleDto = z.infer<typeof CreateClassScheduleSchema>;

export const VerifyQrCheckinSchema = z.object({
  branchId: z.string().uuid(),
  qrToken: z.string().trim().min(20).max(512),
  turnstileDeviceId: z.string().trim().max(64).optional(),
});

export type VerifyQrCheckinDto = z.infer<typeof VerifyQrCheckinSchema>;

/**
 * Phase 4 — Member PWA: Workouts, Body Measurements, Nutrition & Notifications Schemas
 */
export const LogWorkoutSessionSchema = z.object({
  memberId: z.string().uuid(),
  workoutTitleEn: z.string().trim().min(2).max(120),
  workoutTitleAr: z.string().trim().min(2).max(120),
  durationMinutes: z.number().int().min(1).max(360),
  sets: z
    .array(
      z.object({
        exerciseCode: z.string().trim().min(2).max(60),
        exerciseNameEn: z.string().trim().min(2).max(120),
        exerciseNameAr: z.string().trim().min(2).max(120),
        reps: z.number().int().min(1).max(200),
        weightKg: z.number().min(0).max(600),
        rpe: z.number().min(1).max(10).optional(),
      }),
    )
    .min(1),
});

export type LogWorkoutSessionDto = z.infer<typeof LogWorkoutSessionSchema>;

export const LogBodyMeasurementSchema = z.object({
  memberId: z.string().uuid(),
  weightKg: z.number().min(25).max(300),
  heightCm: z.number().min(100).max(250),
  bodyFatPercent: z.number().min(2).max(70).optional(),
  skeletalMuscleKg: z.number().min(5).max(120).optional(),
  waistCm: z.number().min(40).max(200).optional(),
});

export type LogBodyMeasurementDto = z.infer<typeof LogBodyMeasurementSchema>;

export const LogDailyNutritionSchema = z.object({
  memberId: z.string().uuid(),
  dateIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  caloriesKcal: z.number().int().min(0).max(15000),
  proteinGrams: z.number().int().min(0).max(1000),
  carbsGrams: z.number().int().min(0).max(2000),
  fatsGrams: z.number().int().min(0).max(1000),
  waterMl: z.number().int().min(0).max(15000).default(2500),
});

export type LogDailyNutritionDto = z.infer<typeof LogDailyNutritionSchema>;

/**
 * Phase 5 — POS-Lite, Trainer Commissions, Gamification & Chat Schemas
 */
export const CreatePosSaleSchema = z.object({
  branchId: z.string().uuid(),
  memberId: z.string().uuid().optional(),
  paymentProvider: PaymentMethodProviderSchema,
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1),
});

export type CreatePosSaleDto = z.infer<typeof CreatePosSaleSchema>;

export const SendChatMessageSchema = z.object({
  senderId: z.string().uuid(),
  recipientId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export type SendChatMessageDto = z.infer<typeof SendChatMessageSchema>;

/**
 * Phase 6 — Super Admin & SaaS Platform Schemas
 */
export const ImpersonateTenantSchema = z.object({
  targetTenantId: z.string().uuid(),
  reason: z.string().trim().min(5).max(240),
});

export type ImpersonateTenantDto = z.infer<typeof ImpersonateTenantSchema>;
