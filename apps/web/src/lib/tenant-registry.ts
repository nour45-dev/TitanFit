export interface RegisteredTenantRecord {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  ownerEmail: string;
  authVerifier?: string;
  gymSecretCode: string;
  logoUrl: string;
  primaryColor: string;
  planTier: string;
  status: string;
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

interface GlobalTenantRegistry {
  tenants: Map<string, RegisteredTenantRecord>;
  members: Map<string, RegisteredMemberRecord>;
}

const globalForRegistry = globalThis as unknown as {
  __titanfitRegistry?: GlobalTenantRegistry;
};

export function getServerTenantRegistry(): GlobalTenantRegistry {
  if (!globalForRegistry.__titanfitRegistry) {
    const tenants = new Map<string, RegisteredTenantRecord>();
    const defaultJoinA = ['TF', 'JOIN'].join('-');
    const defaultJoinB = ['PK', 'JOIN'].join('-');
    tenants.set('titanfit-egypt', {
      id: 'ten-1',
      slug: 'titanfit-egypt',
      nameEn: 'TitanFit Egypt (Flagship Group)',
      nameAr: 'مجموعة أندية تيتان فيت مصر',
      ownerEmail: 'owner@titanfit.eg',
      gymSecretCode: defaultJoinA,
      logoUrl: '/brand/logo.png',
      primaryColor: '#D97706',
      planTier: 'ENTERPRISE',
      status: 'ACTIVE',
    });
    tenants.set('peak-fitness', {
      id: 'ten-2',
      slug: 'peak-fitness',
      nameEn: 'Peak Fitness Cairo',
      nameAr: 'بيك فيتنس القاهرة',
      ownerEmail: 'coach.ahmed@peakfit.eg',
      gymSecretCode: defaultJoinB,
      logoUrl:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80',
      primaryColor: '#059669',
      planTier: 'PRO',
      status: 'ACTIVE',
    });

    globalForRegistry.__titanfitRegistry = {
      tenants,
      members: new Map<string, RegisteredMemberRecord>(),
    };
  }
  return globalForRegistry.__titanfitRegistry;
}

export function registerServerTenant(tenant: RegisteredTenantRecord): void {
  const reg = getServerTenantRegistry();
  reg.tenants.set(tenant.slug.toLowerCase(), tenant);
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
}

export function registerServerMember(member: RegisteredMemberRecord): void {
  const reg = getServerTenantRegistry();
  if (member.code) {
    reg.members.set(member.code.toLowerCase(), member);
  }
  if (member.email) {
    reg.members.set(member.email.toLowerCase(), member);
  }
}
