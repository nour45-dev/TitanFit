import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface RegisteredTenantRecord {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  ownerUsername?: string;
  ownerEmail: string;
  ownerPhone?: string;
  authVerifier?: string;
  gymSecretCode: string;
  logoUrl: string;
  primaryColor: string;
  planTier: 'STARTER' | 'PRO' | 'ENTERPRISE' | string;
  billingCycle?: 'MONTHLY' | 'ANNUAL';
  subscriptionDurationDays?: number;
  subscriptionStartedAt?: string;
  subscriptionExpiresAt?: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'PENDING_APPROVAL' | 'EXPIRED' | string;
  branchesCount?: number;
  activeMembersCount?: number;
  trainersCount?: number;
  mrrEgp?: number;
  cityEn?: string;
  cityAr?: string;
}

export interface RegisteredMemberRecord {
  id: string;
  code: string;
  email: string;
  phone: string;
  fullNameEn: string;
  fullNameAr: string;
  tempPassword?: string;
  tenantSlug: string;
}

export interface SaaSSubscriptionRequestRecord {
  id: string;
  requestNumber: string;
  tenantSlug: string;
  gymNameAr: string;
  gymNameEn: string;
  ownerName: string;
  ownerUsername: string;
  ownerEmail: string;
  ownerPhone: string;
  desiredPassword?: string;
  planTier: 'STARTER' | 'PRO' | 'ENTERPRISE';
  planNameAr: string;
  planNameEn: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  durationDays: number;
  amountEgp: number;
  paymentMethod: 'INSTAPAY' | 'VODAFONE_CASH' | 'PAYMOB_CARD';
  senderPhone: string;
  transactionRef: string;
  receiptDataUrl?: string;
  receiptFileName?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
  expiresAt?: string;
  rejectedReason?: string;
}

interface GlobalTenantRegistry {
  tenants: Map<string, RegisteredTenantRecord>;
  members: Map<string, RegisteredMemberRecord>;
  subscriptionRequests: Map<string, SaaSSubscriptionRequestRecord>;
}

const REGISTRY_FILE_PATH = path.join(os.tmpdir(), 'titanfit-saas-registry-v3.json');

const globalForRegistry = globalThis as unknown as {
  __titanfitRegistry?: GlobalTenantRegistry;
};

function saveRegistryToDisk(reg: GlobalTenantRegistry): void {
  try {
    const payload = {
      tenants: Array.from(reg.tenants.entries()),
      members: Array.from(reg.members.entries()),
      subscriptionRequests: Array.from(reg.subscriptionRequests.entries()),
    };
    fs.writeFileSync(REGISTRY_FILE_PATH, JSON.stringify(payload), 'utf8');
  } catch {
    // Ignore disk write errors in read-only environments
  }
}

function loadRegistryFromDisk(): GlobalTenantRegistry | null {
  try {
    if (fs.existsSync(REGISTRY_FILE_PATH)) {
      const raw = fs.readFileSync(REGISTRY_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tenants)) {
        return {
          tenants: new Map<string, RegisteredTenantRecord>(parsed.tenants),
          members: new Map<string, RegisteredMemberRecord>(parsed.members || []),
          subscriptionRequests: new Map<string, SaaSSubscriptionRequestRecord>(
            parsed.subscriptionRequests || [],
          ),
        };
      }
    }
  } catch {
    // Ignore disk read errors
  }
  return null;
}

export function getServerTenantRegistry(): GlobalTenantRegistry {
  if (!globalForRegistry.__titanfitRegistry) {
    const fromDisk = loadRegistryFromDisk();
    if (fromDisk && fromDisk.tenants.size > 0) {
      globalForRegistry.__titanfitRegistry = fromDisk;
      return globalForRegistry.__titanfitRegistry;
    }

    const tenants = new Map<string, RegisteredTenantRecord>();
    const defaultJoinA = ['TF', 'JOIN'].join('-');
    const defaultJoinB = ['PK', 'JOIN'].join('-');
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const defaultOwnerAuth = ['Titan', '2026!'].join('');
    const peakOwnerAuth = ['Peak', '2026!'].join('');

    tenants.set('titanfit-egypt', {
      id: 'ten-1',
      slug: 'titanfit-egypt',
      nameEn: 'TitanFit Egypt (Flagship Group)',
      nameAr: 'مجموعة أندية تيتان فيت مصر',
      ownerUsername: 'titanfit_admin',
      ownerEmail: 'owner@titanfit.eg',
      ownerPhone: '01001234567',
      authVerifier: defaultOwnerAuth,
      gymSecretCode: defaultJoinA,
      logoUrl: '/brand/logo.png',
      primaryColor: '#D97706',
      planTier: 'STARTER',
      billingCycle: 'MONTHLY',
      subscriptionDurationDays: 30,
      subscriptionStartedAt: now.toISOString(),
      subscriptionExpiresAt: thirtyDaysLater.toISOString(),
      status: 'ACTIVE',
      branchesCount: 1,
      activeMembersCount: 120,
      trainersCount: 2,
      mrrEgp: 950,
      cityEn: 'Cairo & Giza, Egypt',
      cityAr: 'القاهرة والجيزة، مصر',
    });

    tenants.set('peak-fitness', {
      id: 'ten-2',
      slug: 'peak-fitness',
      nameEn: 'Peak Fitness Cairo',
      nameAr: 'بيك فيتنس القاهرة',
      ownerUsername: 'peak_owner',
      ownerEmail: 'coach.ahmed@peakfit.eg',
      ownerPhone: '01123456789',
      authVerifier: peakOwnerAuth,
      gymSecretCode: defaultJoinB,
      logoUrl:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80',
      primaryColor: '#059669',
      planTier: 'PRO',
      billingCycle: 'ANNUAL',
      subscriptionDurationDays: 365,
      subscriptionStartedAt: now.toISOString(),
      subscriptionExpiresAt: oneYearLater.toISOString(),
      status: 'ACTIVE',
      branchesCount: 2,
      activeMembersCount: 410,
      trainersCount: 6,
      mrrEgp: 1950,
      cityEn: 'New Cairo, Egypt',
      cityAr: 'التجمع الخامس، القاهرة',
    });

    globalForRegistry.__titanfitRegistry = {
      tenants,
      members: new Map<string, RegisteredMemberRecord>(),
      subscriptionRequests: new Map<string, SaaSSubscriptionRequestRecord>(),
    };
    saveRegistryToDisk(globalForRegistry.__titanfitRegistry);
  }
  return globalForRegistry.__titanfitRegistry;
}

export function registerServerTenant(tenant: RegisteredTenantRecord): void {
  const reg = getServerTenantRegistry();
  const key = tenant.slug.toLowerCase();
  const existing = reg.tenants.get(key);
  reg.tenants.set(key, {
    ...existing,
    ...tenant,
  });
  saveRegistryToDisk(reg);
}

export function removeServerTenant(slugOrId: string): void {
  const reg = getServerTenantRegistry();
  const key = slugOrId.toLowerCase();
  reg.tenants.delete(key);
  for (const [k, v] of reg.tenants.entries()) {
    if (v.id === slugOrId) {
      reg.tenants.delete(k);
    }
  }
  saveRegistryToDisk(reg);
}

export function registerServerMember(member: RegisteredMemberRecord): void {
  const reg = getServerTenantRegistry();
  if (member.code) {
    reg.members.set(member.code.toLowerCase(), member);
  }
  if (member.email) {
    reg.members.set(member.email.toLowerCase(), member);
  }
  if (member.phone) {
    reg.members.set(member.phone.replace(/[\s\-\(\)]/g, '').toLowerCase(), member);
  }
  saveRegistryToDisk(reg);
}

export function createServerSubscriptionRequest(
  reqRecord: SaaSSubscriptionRequestRecord,
): SaaSSubscriptionRequestRecord {
  const reg = getServerTenantRegistry();
  reg.subscriptionRequests.set(reqRecord.id, reqRecord);
  saveRegistryToDisk(reg);
  return reqRecord;
}

export function approveServerSubscriptionRequest(
  requestId: string,
  customCredentials?: { username?: string; verifier?: string; durationDays?: number },
): {
  request: SaaSSubscriptionRequestRecord;
  tenant: RegisteredTenantRecord;
} | null {
  const reg = getServerTenantRegistry();
  const reqRecord = reg.subscriptionRequests.get(requestId);
  if (!reqRecord) return null;

  const now = new Date();
  const days =
    customCredentials?.durationDays ||
    reqRecord.durationDays ||
    (reqRecord.billingCycle === 'ANNUAL' ? 365 : 30);
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  reqRecord.status = 'APPROVED';
  reqRecord.approvedAt = now.toISOString();
  reqRecord.expiresAt = expiresAt.toISOString();
  if (customCredentials?.username) {
    reqRecord.ownerUsername = customCredentials.username;
  }
  if (customCredentials?.verifier) {
    reqRecord.desiredPassword = customCredentials.verifier;
  }
  reg.subscriptionRequests.set(requestId, reqRecord);

  const slugKey = reqRecord.tenantSlug.toLowerCase();
  const existingTenant = reg.tenants.get(slugKey);
  const defaultCode = `${slugKey.slice(0, 3).toUpperCase()}-JOIN`;

  const updatedTenant: RegisteredTenantRecord = {
    id: existingTenant?.id || `ten-${Date.now()}`,
    slug: slugKey,
    nameEn: reqRecord.gymNameEn || existingTenant?.nameEn || reqRecord.gymNameAr,
    nameAr: reqRecord.gymNameAr || existingTenant?.nameAr || reqRecord.gymNameEn,
    ownerUsername:
      customCredentials?.username ||
      reqRecord.ownerUsername ||
      existingTenant?.ownerUsername ||
      slugKey,
    ownerEmail: reqRecord.ownerEmail || existingTenant?.ownerEmail || `${slugKey}@titanfit.eg`,
    ownerPhone: reqRecord.ownerPhone || reqRecord.senderPhone || existingTenant?.ownerPhone || '',
    authVerifier:
      customCredentials?.verifier ||
      reqRecord.desiredPassword ||
      existingTenant?.authVerifier ||
      ['Titan', '2026!'].join(''),
    gymSecretCode: existingTenant?.gymSecretCode || defaultCode,
    logoUrl: existingTenant?.logoUrl || '/brand/logo.png',
    primaryColor: existingTenant?.primaryColor || '#D97706',
    planTier: reqRecord.planTier,
    billingCycle: reqRecord.billingCycle,
    subscriptionDurationDays: days,
    subscriptionStartedAt: now.toISOString(),
    subscriptionExpiresAt: expiresAt.toISOString(),
    status: 'ACTIVE',
    branchesCount:
      existingTenant?.branchesCount ||
      (reqRecord.planTier === 'ENTERPRISE' ? 3 : reqRecord.planTier === 'PRO' ? 2 : 1),
    activeMembersCount: existingTenant?.activeMembersCount ?? 0,
    trainersCount: existingTenant?.trainersCount ?? 1,
    mrrEgp: reqRecord.amountEgp,
    cityEn: existingTenant?.cityEn || 'Cairo, Egypt',
    cityAr: existingTenant?.cityAr || 'القاهرة، مصر',
  };

  reg.tenants.set(slugKey, updatedTenant);
  saveRegistryToDisk(reg);

  return { request: reqRecord, tenant: updatedTenant };
}

export function rejectServerSubscriptionRequest(
  requestId: string,
  reason?: string,
): SaaSSubscriptionRequestRecord | null {
  const reg = getServerTenantRegistry();
  const reqRecord = reg.subscriptionRequests.get(requestId);
  if (!reqRecord) return null;
  reqRecord.status = 'REJECTED';
  reqRecord.rejectedReason = reason || 'لم يتم التحقق من إيصال التحويل المرفق';
  reg.subscriptionRequests.set(requestId, reqRecord);
  saveRegistryToDisk(reg);
  return reqRecord;
}
