import { PrismaClient } from '@prisma/client';
import { withTenantContext } from './client.js';

export async function seedBaselineTenants(client: PrismaClient = new PrismaClient()) {
  await withTenantContext(client, { tenantId: null, isSuperAdmin: true }, async (tx) => {
    const cairoTitans = await tx.tenant.upsert({
      where: { slug: 'cairo-titans' },
      update: {},
      create: {
        slug: 'cairo-titans',
        nameEn: 'Cairo Titans Fitness Club',
        nameAr: 'نادي عمالقة القاهرة للياقة البدنية',
        status: 'ACTIVE',
        defaultCurrency: 'EGP',
        defaultLocale: 'ar',
        timezone: 'Africa/Cairo',
        primaryColorHex: '#10B981',
        accentColorHex: '#F59E0B',
      },
    });

    await tx.branch.upsert({
      where: {
        tenantId_code: {
          tenantId: cairoTitans.id,
          code: 'ZAMALEK-01',
        },
      },
      update: {},
      create: {
        tenantId: cairoTitans.id,
        code: 'ZAMALEK-01',
        nameEn: 'Zamalek Flagship Branch',
        nameAr: 'فرع الزمالك الرئيسي',
        city: 'Cairo',
        addressEn: '26th of July Corridor, Zamalek, Cairo',
        addressAr: 'شارع ٢٦ يوليو، الزمالك، القاهرة',
        phone: '+201000000001',
      },
    });

    await tx.branch.upsert({
      where: {
        tenantId_code: {
          tenantId: cairoTitans.id,
          code: 'NEWCAIRO-02',
        },
      },
      update: {},
      create: {
        tenantId: cairoTitans.id,
        code: 'NEWCAIRO-02',
        nameEn: 'New Cairo Fifth Settlement Branch',
        nameAr: 'فرع التجمع الخامس - القاهرة الجديدة',
        city: 'New Cairo',
        addressEn: 'North 90th Street, Fifth Settlement, New Cairo',
        addressAr: 'شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة',
        phone: '+201000000002',
      },
    });

    const alexIron = await tx.tenant.upsert({
      where: { slug: 'alexandria-iron' },
      update: {},
      create: {
        slug: 'alexandria-iron',
        nameEn: 'Alexandria Iron House',
        nameAr: 'بيت الحديد - الإسكندرية',
        status: 'ACTIVE',
        defaultCurrency: 'EGP',
        defaultLocale: 'en',
        timezone: 'Africa/Cairo',
        primaryColorHex: '#3B82F6',
        accentColorHex: '#EC4899',
      },
    });

    await tx.branch.upsert({
      where: {
        tenantId_code: {
          tenantId: alexIron.id,
          code: 'SMOUHA-01',
        },
      },
      update: {},
      create: {
        tenantId: alexIron.id,
        code: 'SMOUHA-01',
        nameEn: 'Smouha Athletic Hub',
        nameAr: 'فرع سموحة الرياضي',
        city: 'Alexandria',
        addressEn: 'Victor Emmanuel Sq, Smouha, Alexandria',
        addressAr: 'ميدان فيكتور عمانويل، سموحة، الإسكندرية',
        phone: '+201200000001',
      },
    });
  });

  console.log('✅ [seed] Seeded bilingual demo tenants & branches (Cairo Titans & Alexandria Iron).');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedBaselineTenants()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ [seed] Error seeding database:', err);
      process.exit(1);
    });
}
