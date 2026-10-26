import {
  CreateClassScheduleSchema,
  CreateMemberSchema,
  CreatePosSaleSchema,
  CreateSubscriptionPlanSchema,
  FreezeSubscriptionSchema,
  ImpersonateTenantSchema,
  LogBodyMeasurementSchema,
  LogDailyNutritionSchema,
  LogWorkoutSessionSchema,
  LoginRequestSchema,
  PurchaseSubscriptionSchema,
  RequestOtpSchema,
  SendChatMessageSchema,
  VerifyOtpSchema,
  VerifyQrCheckinSchema,
  createSuccessResponse,
} from '@gymos/contracts';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AuthRbacGuard,
  type AuthenticatedFastifyRequest,
  PublicRoute,
  RequirePermissions,
} from './common/auth-rbac.guard.js';
import { CryptoService } from './common/crypto.service.js';
import { AuditLogService } from './modules/audit/audit-log.service.js';
import { AuthTenantsService } from './modules/auth/auth-tenants.service.js';
import { ClassesAccessService } from './modules/classes-access/classes-access.service.js';
import { FitnessPosAnalyticsService } from './modules/fitness-pos/fitness-pos-analytics.service.js';
import { MembersBillingService } from './modules/members-billing/members-billing.service.js';

interface SafeParseIssue {
  path: Array<string | number>;
  message: string;
}

interface SafeParseSchema<T> {
  safeParse(
    data: unknown,
  ):
    | { success: true; data: T }
    | { success: false; error: { issues: SafeParseIssue[] } };
}

function parseZod<T>(schema: SafeParseSchema<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: result.error.issues
        .map((i: SafeParseIssue) => `${i.path.join('.')}: ${i.message}`)
        .join('; '),
    });
  }
  return result.data;
}

@ApiTags('TitanFit Platform API (Phases 1–6)')
@ApiBearerAuth()
@UseGuards(AuthRbacGuard)
@Controller()
export class PlatformController {
  constructor(
    @Inject(AuthTenantsService) private readonly authTenants: AuthTenantsService,
    @Inject(MembersBillingService) private readonly membersBilling: MembersBillingService,
    @Inject(ClassesAccessService) private readonly classesAccess: ClassesAccessService,
    @Inject(FitnessPosAnalyticsService)
    private readonly fitnessPos: FitnessPosAnalyticsService,
    @Inject(AuditLogService) private readonly auditLog: AuditLogService,
    @Inject(CryptoService) private readonly crypto: CryptoService,
  ) {}

  // ==========================================================================
  // PHASE 1: AUTH, OTP, REFRESH ROTATION, TENANTS & AUDIT LOGS
  // ==========================================================================

  @PublicRoute()
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with password and optional 2FA TOTP' })
  login(@Body() body: unknown, @Headers('x-request-id') reqId?: string) {
    const dto = parseZod(LoginRequestSchema, body);
    const session = this.authTenants.login(dto);
    return createSuccessResponse(session, reqId || 'req-login');
  }

  @PublicRoute()
  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate refresh token and detect token reuse/replay across session family',
  })
  refresh(
    @Body() body: { refreshToken?: string },
    @Headers('x-request-id') reqId?: string,
  ) {
    if (!body?.refreshToken) {
      throw new BadRequestException({
        code: 'MISSING_REFRESH_TOKEN',
        message: 'refreshToken is required',
      });
    }
    const rotated = this.authTenants.rotateRefreshToken(body.refreshToken);
    return createSuccessResponse(rotated, reqId || 'req-refresh');
  }

  @PublicRoute()
  @Post('auth/otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request 6-digit OTP via SMS/WhatsApp/Email' })
  requestOtp(@Body() body: unknown, @Headers('x-request-id') reqId?: string) {
    const dto = parseZod(RequestOtpSchema, body);
    const res = this.authTenants.requestOtp(dto.tenantSlug, dto.phoneOrEmail);
    return createSuccessResponse(res, reqId || 'req-otp');
  }

  @PublicRoute()
  @Post('auth/otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 6-digit OTP challenge' })
  verifyOtp(@Body() body: unknown, @Headers('x-request-id') reqId?: string) {
    const dto = parseZod(VerifyOtpSchema, body);
    const verified = this.authTenants.verifyOtp(dto);
    return createSuccessResponse({ verified }, reqId || 'req-otp-verify');
  }

  @Get('branches')
  @RequirePermissions('branches:read')
  @ApiOperation({ summary: 'List branches for the authenticated tenant' })
  listBranches(
    @Req() req: AuthenticatedFastifyRequest,
    @Headers('x-request-id') reqId?: string,
  ) {
    const branches = this.authTenants.listBranchesForTenant(req.user!.tenantId);
    return createSuccessResponse(branches, reqId || 'req-branches');
  }

  @Get('audit-logs')
  @RequirePermissions('audit_logs:read')
  @ApiOperation({ summary: 'List immutable audit logs for the authenticated tenant' })
  listAuditLogs(
    @Req() req: AuthenticatedFastifyRequest,
    @Headers('x-request-id') reqId?: string,
  ) {
    const logs = this.auditLog.listByTenant(req.user!.tenantId);
    return createSuccessResponse(logs, reqId || 'req-audit');
  }

  // ==========================================================================
  // PHASE 2: MEMBERS, ENCRYPTED HEALTH, SUBSCRIPTIONS, EGYPT PAYMENTS & INVOICES
  // ==========================================================================

  @Post('members')
  @RequirePermissions('members:create')
  @ApiOperation({ summary: 'Register a new gym member with AES-256-GCM encrypted health data' })
  createMember(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(CreateMemberSchema, body);
    const member = this.membersBilling.createMember(
      req.user!.tenantId,
      req.user!.sub,
      dto,
    );
    return createSuccessResponse(member, reqId || 'req-member-create');
  }

  @Get('members')
  @RequirePermissions('members:read')
  @ApiOperation({ summary: 'List members in the authenticated tenant' })
  listMembers(
    @Req() req: AuthenticatedFastifyRequest,
    @Headers('x-request-id') reqId?: string,
  ) {
    const members = this.membersBilling.listMembers(req.user!.tenantId);
    return createSuccessResponse(members, reqId || 'req-members-list');
  }

  @Get('members/:memberId/health')
  @RequirePermissions('members:health:read')
  @ApiOperation({
    summary: 'Decrypt and read a member health record (requires members:health:read permission)',
  })
  getMemberHealth(
    @Req() req: AuthenticatedFastifyRequest,
    @Param('memberId') memberId: string,
    @Headers('x-request-id') reqId?: string,
  ) {
    const health = this.membersBilling.getMemberDecryptedHealth(
      req.user!.tenantId,
      req.user!.sub,
      memberId,
    );
    return createSuccessResponse(health, reqId || 'req-member-health');
  }

  @Get('plans')
  @RequirePermissions('plans:read')
  @ApiOperation({ summary: 'List subscription plans for the authenticated tenant' })
  listPlans(
    @Req() req: AuthenticatedFastifyRequest,
    @Headers('x-request-id') reqId?: string,
  ) {
    const plans = this.membersBilling.listPlans(req.user!.tenantId);
    return createSuccessResponse(plans, reqId || 'req-plans');
  }

  @Post('plans')
  @RequirePermissions('plans:manage')
  @ApiOperation({ summary: 'Create a new subscription plan' })
  createPlan(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(CreateSubscriptionPlanSchema, body);
    const plan = this.membersBilling.createPlan(req.user!.tenantId, req.user!.sub, dto);
    return createSuccessResponse(plan, reqId || 'req-plan-create');
  }

  @Post('subscriptions/purchase')
  @RequirePermissions('subscriptions:create', 'payments:collect')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Purchase subscription & generate bilingual QR invoice (supports Idempotency-Key header)',
  })
  purchaseSubscription(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('idempotency-key') idempotencyKey?: string,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(PurchaseSubscriptionSchema, body);
    const res = this.membersBilling.purchaseSubscription(
      req.user!.tenantId,
      req.user!.sub,
      dto,
      idempotencyKey,
    );
    return createSuccessResponse(res, reqId || 'req-sub-purchase');
  }

  @Post('subscriptions/freeze')
  @RequirePermissions('subscriptions:freeze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Freeze an active subscription and extend expiry date accordingly' })
  freezeSubscription(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(FreezeSubscriptionSchema, body);
    const sub = this.membersBilling.freezeSubscription(
      req.user!.tenantId,
      req.user!.sub,
      dto,
    );
    return createSuccessResponse(sub, reqId || 'req-sub-freeze');
  }

  @Post('invoices/:invoiceId/refund')
  @RequirePermissions('payments:refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue a full refund on an invoice (requires payments:refund)' })
  refundInvoice(
    @Req() req: AuthenticatedFastifyRequest,
    @Param('invoiceId') invoiceId: string,
    @Body() body: { reason?: string },
    @Headers('x-request-id') reqId?: string,
  ) {
    const inv = this.membersBilling.refundInvoice(
      req.user!.tenantId,
      req.user!.sub,
      invoiceId,
      body?.reason || 'Customer refund request',
    );
    return createSuccessResponse(inv, reqId || 'req-invoice-refund');
  }

  // ==========================================================================
  // PHASE 3: CLASSES, AUTO-WAITLIST & ROTATING QR CHECK-IN
  // ==========================================================================

  @Get('classes')
  @RequirePermissions('classes:read')
  @ApiOperation({ summary: 'List scheduled classes for the authenticated tenant' })
  listClasses(
    @Req() req: AuthenticatedFastifyRequest,
    @Headers('x-request-id') reqId?: string,
  ) {
    const schedules = this.classesAccess.listSchedules(req.user!.tenantId);
    return createSuccessResponse(schedules, reqId || 'req-classes');
  }

  @Post('classes')
  @RequirePermissions('classes:manage')
  @ApiOperation({ summary: 'Create a scheduled class with room capacity and waitlist' })
  createClass(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(CreateClassScheduleSchema, body);
    const schedule = this.classesAccess.createClassSchedule(
      req.user!.tenantId,
      req.user!.sub,
      dto,
    );
    return createSuccessResponse(schedule, reqId || 'req-class-create');
  }

  @Post('classes/:classId/book')
  @RequirePermissions('bookings:self')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Book a class spot or automatically join waitlist if full' })
  bookClass(
    @Req() req: AuthenticatedFastifyRequest,
    @Param('classId') classId: string,
    @Body() body: { memberId?: string },
    @Headers('x-request-id') reqId?: string,
  ) {
    const memberId = body?.memberId || req.user!.sub;
    const booking = this.classesAccess.bookClass(
      req.user!.tenantId,
      classId,
      memberId,
    );
    return createSuccessResponse(booking, reqId || 'req-class-book');
  }

  @Post('bookings/:bookingId/cancel')
  @RequirePermissions('bookings:self')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel booking and automatically promote the first waitlisted member',
  })
  cancelBooking(
    @Req() req: AuthenticatedFastifyRequest,
    @Param('bookingId') bookingId: string,
    @Headers('x-request-id') reqId?: string,
  ) {
    const res = this.classesAccess.cancelBooking(req.user!.tenantId, bookingId);
    return createSuccessResponse(res, reqId || 'req-booking-cancel');
  }

  @Post('attendance/verify-qr')
  @RequirePermissions('attendance:scan_qr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Verify 30s rotating HMAC-SHA256 QR token, enforce anti-passback, and trigger turnstile gate',
  })
  verifyQr(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(VerifyQrCheckinSchema, body);
    const log = this.classesAccess.verifyQrCheckin(req.user!.tenantId, dto);
    return createSuccessResponse(log, reqId || 'req-qr-verify');
  }

  @Get('attendance/qr-token/:memberId')
  @RequirePermissions('plans:read')
  @ApiOperation({ summary: 'Generate current 30s rotating signed QR token for a member' })
  generateMemberQr(
    @Req() req: AuthenticatedFastifyRequest,
    @Param('memberId') memberId: string,
    @Headers('x-request-id') reqId?: string,
  ) {
    const qrToken = this.crypto.generateRotatingQrToken(req.user!.tenantId, memberId);
    return createSuccessResponse({ qrToken, validForSeconds: 30 }, reqId || 'req-qr-gen');
  }

  // ==========================================================================
  // PHASE 4 & 5: WORKOUTS, PROGRESS, NUTRITION, ICS, POS, GAMIFICATION & CHAT
  // ==========================================================================

  @Post('workouts/log')
  @RequirePermissions('workouts:log_self')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Log workout sets/reps/weight, auto-detect 1RM Personal Records, and award streak points',
  })
  logWorkout(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(LogWorkoutSessionSchema, body);
    const session = this.fitnessPos.logWorkoutSession(req.user!.tenantId, dto);
    return createSuccessResponse(session, reqId || 'req-workout-log');
  }

  @Post('progress/measurements')
  @RequirePermissions('progress:self')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log body weight, height, body fat %, and calculate BMI' })
  logMeasurements(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(LogBodyMeasurementSchema, body);
    const res = this.fitnessPos.logBodyMeasurement(req.user!.tenantId, dto);
    return createSuccessResponse(res, reqId || 'req-measurement');
  }

  @Post('nutrition/log')
  @RequirePermissions('nutrition:read')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log daily calories, macros (protein/carbs/fats), and hydration' })
  logNutrition(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(LogDailyNutritionSchema, body);
    const res = this.fitnessPos.logDailyNutrition(req.user!.tenantId, dto);
    return createSuccessResponse(res, reqId || 'req-nutrition');
  }

  @Get('classes/:classId/ics')
  @RequirePermissions('classes:read')
  @ApiOperation({ summary: 'Export RFC 5545 iCalendar (.ics) file for a scheduled class' })
  getClassIcs(
    @Req() req: AuthenticatedFastifyRequest,
    @Param('classId') classId: string,
    @Headers('x-request-id') reqId?: string,
  ) {
    const ics = this.fitnessPos.generateClassIcsCalendar(req.user!.tenantId, classId);
    return createSuccessResponse({ ics }, reqId || 'req-ics');
  }

  @Get('pos/products')
  @RequirePermissions('pos:sell')
  @ApiOperation({ summary: 'List POS supplements, drinks, and merchandise inventory' })
  listPosProducts(
    @Req() req: AuthenticatedFastifyRequest,
    @Headers('x-request-id') reqId?: string,
  ) {
    const products = this.fitnessPos.listPosProducts(req.user!.tenantId);
    return createSuccessResponse(products, reqId || 'req-pos-products');
  }

  @Post('pos/sales')
  @RequirePermissions('pos:sell')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Complete POS sale and deduct product stock quantity' })
  createPosSale(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(CreatePosSaleSchema, body);
    const sale = this.fitnessPos.createPosSale(
      req.user!.tenantId,
      req.user!.sub,
      dto,
    );
    return createSuccessResponse(sale, reqId || 'req-pos-sale');
  }

  @Get('gamification/leaderboard')
  @RequirePermissions('plans:read')
  @ApiOperation({ summary: 'Get opt-in member streak and points leaderboard' })
  getLeaderboard(
    @Req() req: AuthenticatedFastifyRequest,
    @Headers('x-request-id') reqId?: string,
  ) {
    const lb = this.fitnessPos.getGamificationLeaderboard(req.user!.tenantId);
    return createSuccessResponse(lb, reqId || 'req-leaderboard');
  }

  @Post('chat/messages')
  @RequirePermissions('workouts:read')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message between trainer and member' })
  sendChat(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(SendChatMessageSchema, body);
    const msg = this.fitnessPos.sendChatMessage(req.user!.tenantId, dto);
    return createSuccessResponse(msg, reqId || 'req-chat-send');
  }

  @Get('reports/executive-summary')
  @RequirePermissions('reports:financial:read')
  @ApiOperation({
    summary: 'Get executive financial, attendance, and CSV export report for the tenant',
  })
  getExecutiveSummary(
    @Req() req: AuthenticatedFastifyRequest,
    @Headers('x-request-id') reqId?: string,
  ) {
    const report = this.fitnessPos.getExecutiveReportSummary(req.user!.tenantId);
    return createSuccessResponse(report, reqId || 'req-exec-report');
  }

  // ==========================================================================
  // PHASE 6: SUPER ADMIN PLATFORM MANAGEMENT & AUDITED IMPERSONATION
  // ==========================================================================

  @Get('super-admin/tenants')
  @RequirePermissions('platform:tenants:read')
  @ApiOperation({ summary: 'Super Admin: list all SaaS tenants, plans, and feature flags' })
  listAllTenants(@Headers('x-request-id') reqId?: string) {
    const tenants = this.authTenants.listAllTenantsForSuperAdmin();
    return createSuccessResponse(tenants, reqId || 'req-sa-tenants');
  }

  @Post('super-admin/impersonate')
  @RequirePermissions('platform:impersonate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Super Admin: generate an audited impersonation session for a target tenant',
  })
  impersonateTenant(
    @Req() req: AuthenticatedFastifyRequest,
    @Body() body: unknown,
    @Headers('x-request-id') reqId?: string,
  ) {
    const dto = parseZod(ImpersonateTenantSchema, body);
    const session = this.authTenants.impersonateTenantOwner(
      req.user!.sub,
      dto.targetTenantId,
      dto.reason,
    );
    return createSuccessResponse(session, reqId || 'req-sa-impersonate');
  }
}
