import type { SupportedLocale } from '@gymos/config';

export interface Dictionary {
  readonly nav: {
    readonly badge: string;
    readonly switchLocaleLabel: string;
    readonly toggleThemeLabel: string;
    readonly adminPreview: string;
    readonly memberPwaPreview: string;
  };
  readonly hero: {
    readonly title: string;
    readonly subtitle: string;
    readonly ctaPrimary: string;
    readonly ctaSecondary: string;
  };
  readonly metrics: {
    readonly activeMembers: string;
    readonly monthlyRevenue: string;
    readonly todayCheckins: string;
    readonly classOccupancy: string;
  };
  readonly system: {
    readonly sectionTitle: string;
    readonly rlsBadge: string;
    readonly rtlBadge: string;
    readonly pwaBadge: string;
    readonly egyptPaymentsBadge: string;
    readonly tenantThemeLabel: string;
    readonly qrTitle: string;
    readonly qrSubtitle: string;
    readonly searchPlaceholder: string;
  };
}

export const DICTIONARIES: Record<SupportedLocale, Dictionary> = {
  en: {
    nav: {
      badge: 'Phase 0 • Design System & Multi-Tenant Foundation',
      switchLocaleLabel: 'العربية (RTL)',
      toggleThemeLabel: 'Switch Theme',
      adminPreview: 'Gym Admin Console',
      memberPwaPreview: 'Member PWA',
    },
    hero: {
      title: 'The Operating System for Modern Multi-Branch Gyms in Egypt & MENA',
      subtitle:
        'Manage memberships, rotating offline QR access control, class waitlists, trainers, and Paymob/Fawry/InstaPay billing in one ultra-fast platform.',
      ctaPrimary: 'Explore Admin Dashboard',
      ctaSecondary: 'Preview Member QR Card',
    },
    metrics: {
      activeMembers: 'Active Members (Cairo Titans)',
      monthlyRevenue: 'Monthly Revenue (EGP)',
      todayCheckins: 'Check-ins Today (Zamalek & New Cairo)',
      classOccupancy: 'Peak Class Occupancy',
    },
    system: {
      sectionTitle: 'Interactive Design System & Tenant White-Label Preview',
      rlsBadge: 'PostgreSQL FORCE RLS (NOBYPASSRLS Verified)',
      rtlBadge: 'True Arabic RTL & English LTR',
      pwaBadge: 'Offline-Ready Member PWA',
      egyptPaymentsBadge: 'Paymob • Fawry • Vodafone Cash • InstaPay',
      tenantThemeLabel: 'Live Tenant Brand Switcher:',
      qrTitle: 'Rotating Signed Member Access Pass',
      qrSubtitle: 'Refreshes HMAC-SHA256 signature every 30s (Works Offline)',
      searchPlaceholder: 'Search member by name, phone (+20), or membership ID...',
    },
  },
  ar: {
    nav: {
      badge: 'المرحلة ٠ • نظام التصميم والأساس متعدد الفروع',
      switchLocaleLabel: 'English (LTR)',
      toggleThemeLabel: 'تبديل المظهر',
      adminPreview: 'لوحة تحكم الإدارة',
      memberPwaPreview: 'تطبيق المشتركين',
    },
    hero: {
      title: 'نظام التشغيل المتكامل للأندية الرياضية متعددة الفروع في مصر والشرق الأوسط',
      subtitle:
        'إدارة الاشتراكات، بوابات الدخول بـ QR المتغير بدون إنترنت، قوائم انتظار الحصص، المدربين، ومدفوعات Paymob وفوري وإنستا باي في منصة واحدة فائقة السرعة.',
      ctaPrimary: 'استعراض لوحة التحكم',
      ctaSecondary: 'معاينة بطاقة الدخول الذكية',
    },
    metrics: {
      activeMembers: 'المشتركون النشطون (عمالقة القاهرة)',
      monthlyRevenue: 'إيرادات الشهر (ج.م)',
      todayCheckins: 'تسجيلات الدخول اليوم (الزمالك والتجمع)',
      classOccupancy: 'نسبة إشغال الحصص التدريبية',
    },
    system: {
      sectionTitle: 'معاينة نظام التصميم وتخصيص العلامة التجارية لكل جيم',
      rlsBadge: 'عزل تام للبيانات PostgreSQL FORCE RLS',
      rtlBadge: 'دعم كامل للعربية (RTL) والإنجليزية (LTR)',
      pwaBadge: 'تطبيق ويب تقدمي يعمل بدون إنترنت',
      egyptPaymentsBadge: 'Paymob • فوري • فودافون كاش • إنستا باي',
      tenantThemeLabel: 'تغيير هوية النادي لحظياً:',
      qrTitle: 'بطاقة الدخول الرقمية المشفرة والمتغيرة',
      qrSubtitle: 'توقيع HMAC-SHA256 يتجدد كل ٣٠ ثانية (يعمل بدون إنترنت)',
      searchPlaceholder: 'ابحث عن مشترك بالاسم، رقم الهاتف (+20)، أو رقم العضوية...',
    },
  },
};
