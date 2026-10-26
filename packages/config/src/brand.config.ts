/**
 * SINGLE SOURCE OF TRUTH FOR PLATFORM BRANDING & REGIONAL DEFAULTS
 * Change `appName`, `brandSubtitle`, `logoPath`, `defaultCurrency`, or `defaultTimezone`
 * here (or via env vars) to rebrand the entire platform without modifying application code.
 */
export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const SUPPORTED_CURRENCIES = ['EGP', 'SAR', 'AED', 'USD', 'EUR'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export interface PlatformBrandConfig {
  readonly appName: string;
  readonly brandSubtitle: string;
  readonly logoPath: string;
  readonly tagline: {
    readonly en: string;
    readonly ar: string;
  };
  readonly defaultLocale: SupportedLocale;
  readonly supportedLocales: readonly SupportedLocale[];
  readonly defaultCurrency: SupportedCurrency;
  readonly defaultTimezone: string;
  readonly supportEmail: string;
  readonly themeDefaults: {
    readonly primaryHex: string;
    readonly accentHex: string;
    readonly memberAppDefaultMode: 'dark' | 'light';
    readonly adminDashboardDefaultMode: 'dark' | 'light';
  };
}

export function getPlatformConfig(
  env: Record<string, string | undefined> = process.env,
): PlatformBrandConfig {
  const rawAppName = env.NEXT_PUBLIC_APP_NAME?.trim();
  const appName = rawAppName && rawAppName.length > 0 ? rawAppName : 'TitanFit';

  const rawLocale = env.NEXT_PUBLIC_DEFAULT_LOCALE?.trim();
  const defaultLocale: SupportedLocale =
    rawLocale === 'ar' || rawLocale === 'en' ? rawLocale : 'en';

  const rawCurrency = env.NEXT_PUBLIC_DEFAULT_CURRENCY?.trim() as SupportedCurrency | undefined;
  const defaultCurrency: SupportedCurrency =
    rawCurrency && SUPPORTED_CURRENCIES.includes(rawCurrency) ? rawCurrency : 'EGP';

  const defaultTimezone = env.NEXT_PUBLIC_DEFAULT_TIMEZONE?.trim() || 'Africa/Cairo';

  return {
    appName,
    brandSubtitle: env.NEXT_PUBLIC_BRAND_SUBTITLE?.trim() || 'ROOTED PERFORMANCE',
    logoPath: env.NEXT_PUBLIC_BRAND_LOGO_PATH?.trim() || '/brand/logo.png',
    tagline: {
      en: `${appName} (Rooted Performance) — Enterprise Multi-Branch Gym & Fitness Operating System`,
      ar: `${appName} (Rooted Performance) — نظام الإدارة المتكامل للأندية الرياضية والفروع`,
    },
    defaultLocale,
    supportedLocales: SUPPORTED_LOCALES,
    defaultCurrency,
    defaultTimezone,
    supportEmail: env.SUPPORT_EMAIL?.trim() || 'support@titanfit.eg',
    themeDefaults: {
      primaryHex: '#D4AF37', // Royal Gold — Rooted Performance Crest
      accentHex: '#10B981', // Performance Emerald
      memberAppDefaultMode: 'dark',
      adminDashboardDefaultMode: 'dark',
    },
  };
}

export const PLATFORM_CONFIG: PlatformBrandConfig = getPlatformConfig();

export function getLocaleDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
