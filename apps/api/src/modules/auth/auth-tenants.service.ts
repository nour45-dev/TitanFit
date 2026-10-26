import {
  type AuthenticatedUser,
  DEFAULT_ROLE_PERMISSIONS,
  type LoginRequestDto,
  type PermissionCode,
  type SystemRoleKey,
  type VerifyOtpDto,
} from '@gymos/contracts';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CryptoService } from '../../common/crypto.service.js';
import { AuditLogService } from '../audit/audit-log.service.js';

export interface TenantRecord {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED';
  saasPlanCode: 'STARTER' | 'PRO_MULTI_BRANCH' | 'ENTERPRISE';
  defaultCurrency: 'EGP' | 'SAR' | 'AED' | 'USD' | 'EUR';
  defaultLocale: 'en' | 'ar';
  primaryColorHex: string;
  accentColorHex: string;
  featureFlags: Record<string, boolean>;
}

export interface BranchRecord {
  id: string;
  tenantId: string;
  code: string;
  nameEn: string;
  nameAr: string;
  city: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  isActive: boolean;
}

export interface UserAccountRecord {
  id: string;
  tenantId: string;
  branchId: string | null;
  email: string;
  phone: string;
  fullNameEn: string;
  fullNameAr: string;
  passwordHash: string;
  roleKeys: SystemRoleKey[];
  permissions: PermissionCode[];
  totpSecretHex: string | null;
  totpEnabled: boolean;
  failedLoginAttempts: number;
  lockedUntilMs: number | null;
}

interface RefreshTokenRecord {
  tokenId: string;
  familyId: string;
  userId: string;
  tenantId: string;
  used: boolean;
  revoked: boolean;
  expiresAtMs: number;
}

@Injectable()
export class AuthTenantsService {
  private readonly tenants = new Map<string, TenantRecord>();
  private readonly branches = new Map<string, BranchRecord>();
  private readonly users = new Map<string, UserAccountRecord>();
  private readonly refreshTokens = new Map<string, RefreshTokenRecord>();
  private readonly otpChallenges = new Map<
    string,
    { code: string; expiresAtMs: number; attempts: number }
  >();

  constructor(
    @Inject(CryptoService) private readonly crypto: CryptoService,
    @Inject(AuditLogService) private readonly auditLog: AuditLogService,
  ) {
    this.seedInitialTenantsAndUsers();
  }

  private seedInitialTenantsAndUsers() {
    const titanCairoId = '11111111-1111-4111-8111-111111111111';
    const alexIronId = '22222222-2222-4222-8222-222222222222';

    const zamalekBranchId = '11111111-1111-4111-8111-111111110001';
    const newCairoBranchId = '11111111-1111-4111-8111-111111110002';
    const smouhaBranchId = '22222222-2222-4222-8222-222222220001';

    this.tenants.set(titanCairoId, {
      id: titanCairoId,
      slug: 'titanfit-cairo',
      nameEn: 'TitanFit — Rooted Performance (Cairo)',
      nameAr: 'تايتن فيت — الأداء المتجذر (القاهرة)',
      status: 'ACTIVE',
      saasPlanCode: 'ENTERPRISE',
      defaultCurrency: 'EGP',
      defaultLocale: 'ar',
      primaryColorHex: '#D4AF37',
      accentColorHex: '#10B981',
      featureFlags: {
        offlineQrCheckin: true,
        egyptPayments: true,
        waitlistAutoPromote: true,
        posLite: true,
        gamification: true,
        trainerChat: true,
      },
    });

    this.tenants.set(alexIronId, {
      id: alexIronId,
      slug: 'alexandria-iron',
      nameEn: 'Alexandria Iron House',
      nameAr: 'بيت الحديد - الإسكندرية',
      status: 'ACTIVE',
      saasPlanCode: 'PRO_MULTI_BRANCH',
      defaultCurrency: 'EGP',
      defaultLocale: 'en',
      primaryColorHex: '#10B981',
      accentColorHex: '#F59E0B',
      featureFlags: {
        offlineQrCheckin: true,
        egyptPayments: true,
        waitlistAutoPromote: true,
        posLite: true,
        gamification: false,
        trainerChat: true,
      },
    });

    this.branches.set(zamalekBranchId, {
      id: zamalekBranchId,
      tenantId: titanCairoId,
      code: 'ZAMALEK-01',
      nameEn: 'Zamalek Flagship Branch',
      nameAr: 'فرع الزمالك الرئيسي',
      city: 'Cairo',
      addressEn: '26th of July Corridor, Zamalek, Cairo',
      addressAr: 'شارع ٢٦ يوليو، الزمالك، القاهرة',
      phone: '+201000000001',
      isActive: true,
    });

    this.branches.set(newCairoBranchId, {
      id: newCairoBranchId,
      tenantId: titanCairoId,
      code: 'NEWCAIRO-02',
      nameEn: 'New Cairo Fifth Settlement Branch',
      nameAr: 'فرع التجمع الخامس - القاهرة الجديدة',
      city: 'New Cairo',
      addressEn: 'North 90th Street, Fifth Settlement, New Cairo',
      addressAr: 'شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة',
      phone: '+201000000002',
      isActive: true,
    });

    this.branches.set(smouhaBranchId, {
      id: smouhaBranchId,
      tenantId: alexIronId,
      code: 'SMOUHA-01',
      nameEn: 'Smouha Athletic Hub',
      nameAr: 'فرع سموحة الرياضي',
      city: 'Alexandria',
      addressEn: 'Victor Emmanuel Sq, Smouha, Alexandria',
      addressAr: 'ميدان فيكتور عمانويل، سموحة، الإسكندرية',
      phone: '+201200000001',
      isActive: true,
    });

    const defaultPassHash = this.crypto.hashPassword('TitanFit#2026!');

    const seedUsers: Array<{
      id: string;
      tenantId: string;
      branchId: string | null;
      email: string;
      phone: string;
      fullNameEn: string;
      fullNameAr: string;
      roleKey: SystemRoleKey;
    }> = [
      {
        id: '99999999-9999-4999-8999-999999999999',
        tenantId: titanCairoId,
        branchId: null,
        email: 'superadmin@titanfit.eg',
        phone: '+201099999999',
        fullNameEn: 'Nour Eldin (Platform Super Admin)',
        fullNameAr: 'نور الدين (مدير المنصة العام)',
        roleKey: 'SUPER_ADMIN',
      },
      {
        id: '11111111-1111-4111-8111-000000000001',
        tenantId: titanCairoId,
        branchId: zamalekBranchId,
        email: 'owner@titanfit.eg',
        phone: '+201011111111',
        fullNameEn: 'Tarek El-Masry (Gym Owner)',
        fullNameAr: 'طارق المصري (مالك النادي)',
        roleKey: 'GYM_OWNER',
      },
      {
        id: '11111111-1111-4111-8111-000000000002',
        tenantId: titanCairoId,
        branchId: zamalekBranchId,
        email: 'manager.zamalek@titanfit.eg',
        phone: '+201022222222',
        fullNameEn: 'Mariam Hassan (Zamalek Branch Manager)',
        fullNameAr: 'مريم حسن (مديرة فرع الزمالك)',
        roleKey: 'BRANCH_MANAGER',
      },
      {
        id: '11111111-1111-4111-8111-000000000003',
        tenantId: titanCairoId,
        branchId: zamalekBranchId,
        email: 'reception@titanfit.eg',
        phone: '+201033333333',
        fullNameEn: 'Omar Abdelrahman (Receptionist)',
        fullNameAr: 'عمر عبد الرحمن (موظف الاستقبال)',
        roleKey: 'RECEPTIONIST',
      },
      {
        id: '11111111-1111-4111-8111-000000000004',
        tenantId: titanCairoId,
        branchId: zamalekBranchId,
        email: 'coach.karim@titanfit.eg',
        phone: '+201044444444',
        fullNameEn: 'Coach Karim Nabil (Head Trainer)',
        fullNameAr: 'كابتن كريم نبيل (المدرب الرئيسي)',
        roleKey: 'TRAINER',
      },
      {
        id: '11111111-1111-4111-8111-000000000005',
        tenantId: titanCairoId,
        branchId: zamalekBranchId,
        email: 'member.ahmed@titanfit.eg',
        phone: '+201055555555',
        fullNameEn: 'Ahmed Mahmoud (VIP Member)',
        fullNameAr: 'أحمد محمود (عضو VIP)',
        roleKey: 'MEMBER',
      },
      {
        id: '22222222-2222-4222-8222-000000000001',
        tenantId: alexIronId,
        branchId: smouhaBranchId,
        email: 'owner@alexiron.eg',
        phone: '+201211111111',
        fullNameEn: 'Youssef Ibrahim (Alexandria Owner)',
        fullNameAr: 'يوسف إبراهيم (مالك فرع الإسكندرية)',
        roleKey: 'GYM_OWNER',
      },
    ];

    for (const u of seedUsers) {
      this.users.set(u.id, {
        id: u.id,
        tenantId: u.tenantId,
        branchId: u.branchId,
        email: u.email,
        phone: u.phone,
        fullNameEn: u.fullNameEn,
        fullNameAr: u.fullNameAr,
        passwordHash: defaultPassHash,
        roleKeys: [u.roleKey],
        permissions: [...DEFAULT_ROLE_PERMISSIONS[u.roleKey]],
        totpSecretHex: null,
        totpEnabled: false,
        failedLoginAttempts: 0,
        lockedUntilMs: null,
      });
    }
  }

  getTenantBySlug(slug: string): TenantRecord {
    for (const t of this.tenants.values()) {
      if (t.slug === slug) return t;
    }
    throw new NotFoundException({
      code: 'TENANT_NOT_FOUND',
      message: `Tenant with slug '${slug}' not found`,
    });
  }

  getTenantById(tenantId: string): TenantRecord {
    const t = this.tenants.get(tenantId);
    if (!t) {
      throw new NotFoundException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant '${tenantId}' not found`,
      });
    }
    return t;
  }

  listBranchesForTenant(tenantId: string): BranchRecord[] {
    return Array.from(this.branches.values()).filter((b) => b.tenantId === tenantId);
  }

  listAllTenantsForSuperAdmin(): TenantRecord[] {
    return Array.from(this.tenants.values());
  }

  updateTenantStatusForSuperAdmin(
    actorId: string,
    targetTenantId: string,
    status: TenantRecord['status'],
    saasPlanCode?: TenantRecord['saasPlanCode'],
    ipAddress: string = '127.0.0.1',
  ): TenantRecord {
    const tenant = this.getTenantById(targetTenantId);
    tenant.status = status;
    if (saasPlanCode) {
      tenant.saasPlanCode = saasPlanCode;
    }
    this.auditLog.record({
      tenantId: targetTenantId,
      actorId,
      impersonatorId: null,
      action: 'platform.tenant.status_updated',
      entityType: 'tenant',
      entityId: targetTenantId,
      ipAddress,
      userAgent: 'SuperAdminConsole',
      metadata: { status, saasPlanCode: tenant.saasPlanCode },
    });
    return tenant;
  }

  login(input: LoginRequestDto, ipAddress: string = '127.0.0.1', userAgent: string = 'Web') {
    const tenant = this.getTenantBySlug(input.tenantSlug);
    if (tenant.status === 'SUSPENDED' || tenant.status === 'CANCELLED') {
      throw new ForbiddenException({
        code: 'TENANT_SUSPENDED',
        message: 'This gym account is currently suspended.',
      });
    }

    const user = Array.from(this.users.values()).find(
      (u) =>
        u.tenantId === tenant.id &&
        (u.email.toLowerCase() === input.identifier.toLowerCase() ||
          u.phone === input.identifier),
    );

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email/phone or password',
      });
    }

    if (user.lockedUntilMs && user.lockedUntilMs > Date.now()) {
      throw new ForbiddenException({
        code: 'ACCOUNT_LOCKED_BRUTE_FORCE',
        message: 'Account temporarily locked due to repeated failed login attempts',
      });
    }

    const validPassword = this.crypto.verifyPassword(input.password, user.passwordHash);
    if (!validPassword) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntilMs = Date.now() + 15 * 60 * 1000; // 15-minute progressive lockout
      }
      this.auditLog.record({
        tenantId: tenant.id,
        actorId: user.id,
        impersonatorId: null,
        action: 'auth.login_failed',
        entityType: 'user',
        entityId: user.id,
        ipAddress,
        userAgent,
        metadata: { attempts: user.failedLoginAttempts },
      });
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email/phone or password',
      });
    }

    if (user.totpEnabled && user.totpSecretHex) {
      if (
        !input.totpCode ||
        !this.crypto.verifyTotpCode(user.totpSecretHex, input.totpCode)
      ) {
        throw new UnauthorizedException({
          code: 'INVALID_2FA_TOTP',
          message: 'Valid 6-digit 2FA TOTP code is required',
        });
      }
    }

    user.failedLoginAttempts = 0;
    user.lockedUntilMs = null;

    return this.issueSessionTokens(user, tenant, ipAddress, userAgent);
  }

  private issueSessionTokens(
    user: UserAccountRecord,
    tenant: TenantRecord,
    ipAddress: string,
    userAgent: string,
    familyId: string = crypto.randomUUID(),
    impersonatedByUserId: string | null = null,
  ) {
    const accessToken = this.crypto.signAccessToken(
      {
        sub: user.id,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        branchId: user.branchId,
        roleKeys: user.roleKeys,
        permissions: user.permissions,
        impersonatedByUserId,
      },
      900,
    );

    const refreshTokenId = crypto.randomUUID();
    this.refreshTokens.set(refreshTokenId, {
      tokenId: refreshTokenId,
      familyId,
      userId: user.id,
      tenantId: tenant.id,
      used: false,
      revoked: false,
      expiresAtMs: Date.now() + 7 * 24 * 3600 * 1000,
    });

    this.auditLog.record({
      tenantId: tenant.id,
      actorId: user.id,
      impersonatorId: impersonatedByUserId,
      action: impersonatedByUserId ? 'auth.impersonation_started' : 'auth.login_succeeded',
      entityType: 'user',
      entityId: user.id,
      ipAddress,
      userAgent,
      metadata: { roleKeys: user.roleKeys },
    });

    const authUser: AuthenticatedUser = {
      id: user.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      branchId: user.branchId,
      email: user.email,
      phone: user.phone,
      fullNameEn: user.fullNameEn,
      fullNameAr: user.fullNameAr,
      roleKeys: user.roleKeys,
      permissions: user.permissions,
      totpEnabled: user.totpEnabled,
      impersonatedByUserId,
    };

    return {
      accessToken,
      refreshToken: refreshTokenId,
      expiresInSeconds: 900,
      qrDeviceSecret: this.crypto.deriveMemberQrSecret(tenant.id, user.id),
      user: authUser,
    };
  }

  /**
   * Rotating Refresh Token with Reuse Detection:
   * If a previously used refresh token is presented again (token theft / replay),
   * the ENTIRE token family for that session is immediately revoked!
   */
  rotateRefreshToken(refreshTokenId: string, ipAddress: string = '127.0.0.1') {
    const record = this.refreshTokens.get(refreshTokenId);
    if (!record) {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token not found',
      });
    }

    if (record.used || record.revoked) {
      // Reuse detected! Revoke entire family
      for (const token of this.refreshTokens.values()) {
        if (token.familyId === record.familyId) {
          token.revoked = true;
        }
      }
      this.auditLog.record({
        tenantId: record.tenantId,
        actorId: record.userId,
        impersonatorId: null,
        action: 'auth.refresh_token_reuse_detected',
        entityType: 'session_family',
        entityId: record.familyId,
        ipAddress,
        userAgent: 'RefreshTokenRotation',
        metadata: { compromisedTokenId: refreshTokenId },
      });
      throw new ForbiddenException({
        code: 'REFRESH_TOKEN_REUSE_DETECTED',
        message: 'Compromised refresh token detected; entire session family revoked',
      });
    }

    if (record.expiresAtMs <= Date.now()) {
      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_EXPIRED',
        message: 'Refresh token has expired',
      });
    }

    record.used = true;
    const user = this.users.get(record.userId);
    const tenant = this.tenants.get(record.tenantId);
    if (!user || !tenant) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'User or tenant no longer active',
      });
    }

    return this.issueSessionTokens(user, tenant, ipAddress, 'RefreshTokenRotation', record.familyId);
  }

  requestOtp(tenantSlug: string, phoneOrEmail: string): { expiresInSeconds: number; demoOtpCode: string } {
    const tenant = this.getTenantBySlug(tenantSlug);
    const key = `${tenant.id}:${phoneOrEmail.toLowerCase()}`;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpChallenges.set(key, {
      code,
      expiresAtMs: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });
    return { expiresInSeconds: 300, demoOtpCode: code };
  }

  verifyOtp(input: VerifyOtpDto): boolean {
    const tenant = this.getTenantBySlug(input.tenantSlug);
    const key = `${tenant.id}:${input.phoneOrEmail.toLowerCase()}`;
    const challenge = this.otpChallenges.get(key);
    if (!challenge || challenge.expiresAtMs <= Date.now()) {
      throw new UnauthorizedException({
        code: 'OTP_EXPIRED_OR_NOT_FOUND',
        message: 'OTP challenge expired or not found',
      });
    }
    challenge.attempts += 1;
    if (challenge.attempts > 5) {
      this.otpChallenges.delete(key);
      throw new ForbiddenException({
        code: 'OTP_MAX_ATTEMPTS_EXCEEDED',
        message: 'Too many invalid OTP attempts',
      });
    }
    if (challenge.code !== input.code) {
      throw new UnauthorizedException({
        code: 'INVALID_OTP_CODE',
        message: 'Invalid 6-digit OTP code',
      });
    }
    this.otpChallenges.delete(key);
    return true;
  }

  impersonateTenantOwner(
    superAdminUserId: string,
    targetTenantId: string,
    reason: string,
    ipAddress: string = '127.0.0.1',
  ) {
    const tenant = this.getTenantById(targetTenantId);
    const owner = Array.from(this.users.values()).find(
      (u) => u.tenantId === targetTenantId && u.roleKeys.includes('GYM_OWNER'),
    );
    if (!owner) {
      throw new NotFoundException({
        code: 'TENANT_OWNER_NOT_FOUND',
        message: 'No gym owner found for target tenant',
      });
    }

    this.auditLog.record({
      tenantId: targetTenantId,
      actorId: owner.id,
      impersonatorId: superAdminUserId,
      action: 'platform.super_admin.impersonate',
      entityType: 'tenant',
      entityId: targetTenantId,
      ipAddress,
      userAgent: 'SuperAdminImpersonation',
      metadata: { reason },
    });

    return this.issueSessionTokens(
      owner,
      tenant,
      ipAddress,
      'SuperAdminImpersonation',
      crypto.randomUUID(),
      superAdminUserId,
    );
  }
}
