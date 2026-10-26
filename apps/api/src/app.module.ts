import { Module } from '@nestjs/common';
import { AuthRbacGuard } from './common/auth-rbac.guard.js';
import { CryptoService } from './common/crypto.service.js';
import { StorageService } from './common/storage.service.js';
import { AuditLogService } from './modules/audit/audit-log.service.js';
import { AuthTenantsService } from './modules/auth/auth-tenants.service.js';
import { ClassesAccessService } from './modules/classes-access/classes-access.service.js';
import { FitnessPosAnalyticsService } from './modules/fitness-pos/fitness-pos-analytics.service.js';
import { HealthController } from './modules/health/health.controller.js';
import { MembersBillingService } from './modules/members-billing/members-billing.service.js';
import { PlatformController } from './platform.controller.js';

@Module({
  imports: [],
  controllers: [HealthController, PlatformController],
  providers: [
    CryptoService,
    StorageService,
    AuditLogService,
    AuthRbacGuard,
    AuthTenantsService,
    MembersBillingService,
    ClassesAccessService,
    FitnessPosAnalyticsService,
  ],
  exports: [
    CryptoService,
    StorageService,
    AuditLogService,
    AuthTenantsService,
    MembersBillingService,
    ClassesAccessService,
    FitnessPosAnalyticsService,
  ],
})
export class AppModule {}
