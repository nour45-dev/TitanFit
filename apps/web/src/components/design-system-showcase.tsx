'use client';

import { PLATFORM_CONFIG, type SupportedLocale, getLocaleDirection } from '@gymos/config';
import {
  Badge,
  Button,
  Card,
  Input,
  buildTenantCssVariables,
  formatMoneyMinor,
} from '@gymos/ui';
import {
  Activity,
  CheckCircle2,
  Dumbbell,
  Globe,
  Lock,
  Moon,
  QrCode,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DICTIONARIES } from '../i18n/dictionaries';

const DEMO_TENANTS = [
  {
    slug: 'titanfit-cairo',
    nameEn: 'TitanFit — Rooted Performance (Cairo)',
    nameAr: 'تايتن فيت — الأداء المتجذر (القاهرة)',
    primaryHex: '#D4AF37',
    accentHex: '#10B981',
  },
  {
    slug: 'alexandria-iron',
    nameEn: 'Alexandria Iron House',
    nameAr: 'بيت الحديد - الإسكندرية',
    primaryHex: '#10B981',
    accentHex: '#F59E0B',
  },
] as const;

export function DesignSystemShowcase({ initialLocale = 'en' }: { initialLocale?: SupportedLocale }) {
  const [locale, setLocale] = useState<SupportedLocale>(initialLocale);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedTenantIdx, setSelectedTenantIdx] = useState(0);
  const [qrCountdown, setQrCountdown] = useState(30);

  const dir = getLocaleDirection(locale);
  const dict = DICTIONARIES[locale];
  const activeTenant = DEMO_TENANTS[selectedTenantIdx] ?? DEMO_TENANTS[0];
  const tenantCssVars = buildTenantCssVariables({
    primaryHex: activeTenant.primaryHex,
    accentHex: activeTenant.accentHex,
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  useEffect(() => {
    const timer = setInterval(() => {
      setQrCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleLocale = () => {
    setLocale((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  return (
    <div
      dir={dir}
      style={tenantCssVars as React.CSSProperties}
      data-testid="gymos-root-shell"
      data-theme={theme}
      className={
        isDark
          ? 'min-h-screen bg-[#090D16] text-slate-50 transition-colors duration-200'
          : 'min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200'
      }
    >
      {/* Top Navigation Bar */}
      <header
        className={
          isDark
            ? 'sticky top-0 z-30 border-b border-slate-800/80 bg-[#090D16]/85 backdrop-blur-md'
            : 'sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md'
        }
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 ps-6 pe-6 py-4">
          <div className="flex items-center gap-3.5">
            <img
              src={PLATFORM_CONFIG.logoPath}
              alt={`${PLATFORM_CONFIG.appName} - ${PLATFORM_CONFIG.brandSubtitle}`}
              data-testid="brand-logo-img"
              className="h-12 w-12 rounded-xl border border-amber-500/40 object-cover shadow-md"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold tracking-tight" data-testid="brand-app-name">
                  {PLATFORM_CONFIG.appName}
                </span>
                <Badge tone="amber">{PLATFORM_CONFIG.brandSubtitle}</Badge>
              </div>
              <p className="text-xs text-slate-400">
                {locale === 'ar' ? activeTenant.nameAr : activeTenant.nameEn}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              data-testid="theme-toggle-btn"
              className={!isDark ? 'border-slate-300 text-slate-800 hover:bg-slate-100' : ''}
              startIcon={
                isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />
              }
            >
              {dict.nav.toggleThemeLabel} ({theme.toUpperCase()})
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={toggleLocale}
              data-testid="locale-toggle-btn"
              startIcon={<Globe className="h-4 w-4" />}
            >
              {dict.nav.switchLocaleLabel}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-10 ps-6 pe-6 py-10">
        {/* Hero Banner */}
        <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Badge tone="emerald" className="text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{dict.nav.badge}</span>
            </Badge>

            <h1
              data-testid="hero-heading"
              className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight"
            >
              {dict.hero.title}
            </h1>

            <p className={isDark ? 'text-base text-slate-300 sm:text-lg' : 'text-base text-slate-600 sm:text-lg'}>
              {dict.hero.subtitle}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Badge tone="emerald">
                <ShieldCheck className="h-3.5 w-3.5" />
                {dict.system.rlsBadge}
              </Badge>
              <Badge tone="blue">{dict.system.rtlBadge}</Badge>
              <Badge tone="amber">{dict.system.egyptPaymentsBadge}</Badge>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button variant="primary" size="lg">
                {dict.hero.ctaPrimary}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={!isDark ? 'border-slate-300 text-slate-800 hover:bg-slate-100' : ''}
              >
                {dict.hero.ctaSecondary}
              </Button>
            </div>
          </div>

          {/* Interactive Member PWA Rotating QR Card */}
          <div className="lg:col-span-5">
            <Card
              glass
              className={
                isDark
                  ? 'border-emerald-500/30 bg-slate-900/90'
                  : 'border-slate-200 bg-white text-slate-900 shadow-xl'
              }
            >
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                <div>
                  <h2 className="text-base font-bold">{dict.system.qrTitle}</h2>
                  <p className="text-xs text-slate-400">{dict.system.qrSubtitle}</p>
                </div>
                <Badge tone="emerald">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{qrCountdown}s</span>
                </Badge>
              </div>

              <div className="my-6 flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white">
                <QrCode className="h-32 w-32 text-emerald-400" aria-label="Dynamic Member QR Code" />
                <code className="mt-3 rounded bg-slate-900 ps-3 pe-3 py-1 font-mono text-xs text-emerald-300">
                  GYMOS:v1:{activeTenant.slug}:HMAC-{qrCountdown}S
                </code>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {locale === 'ar' ? 'العضوية نشطة • باقة سنوية VIP' : 'Active • Annual VIP Plan'}
                </span>
                <span>{locale === 'ar' ? 'فرع الزمالك' : 'Zamalek Branch'}</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Live KPI Stat Cards (Demonstrating Locale-Aware EGP Formatting) */}
        <section
          aria-label="Gym Performance Overview"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Card className={!isDark ? 'border-slate-200 bg-white text-slate-900' : ''}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {dict.metrics.activeMembers}
              </span>
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-bold">
              {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG').format(1420)}
            </p>
            <p className="mt-1 text-xs text-emerald-400">+12.4% vs last month</p>
          </Card>

          <Card className={!isDark ? 'border-slate-200 bg-white text-slate-900' : ''}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {dict.metrics.monthlyRevenue}
              </span>
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <p className="mt-3 text-3xl font-bold" data-testid="revenue-egp">
              {formatMoneyMinor(184500000, 'EGP', locale)}
            </p>
            <p className="mt-1 text-xs text-emerald-400">Paymob • Fawry • InstaPay • Cash</p>
          </Card>

          <Card className={!isDark ? 'border-slate-200 bg-white text-slate-900' : ''}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {dict.metrics.todayCheckins}
              </span>
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-bold">
              {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG').format(386)}
            </p>
            <p className="mt-1 text-xs text-slate-400">p95 check-in latency: 42ms</p>
          </Card>

          <Card className={!isDark ? 'border-slate-200 bg-white text-slate-900' : ''}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {dict.metrics.classOccupancy}
              </span>
              <Dumbbell className="h-5 w-5 text-amber-400" />
            </div>
            <p className="mt-3 text-3xl font-bold">
              {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                style: 'percent',
              }).format(0.92)}
            </p>
            <p className="mt-1 text-xs text-amber-400">Auto-waitlist active</p>
          </Card>
        </section>

        {/* Design System & Tenant White-Label Controls */}
        <section>
          <Card className={!isDark ? 'border-slate-200 bg-white text-slate-900' : ''}>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="space-y-1">
                <h2 className="text-lg font-bold">{dict.system.sectionTitle}</h2>
                <p className="text-sm text-slate-400">
                  WCAG 2.1 AA contrast • 44px minimum touch targets • Logical CSS RTL/LTR properties
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-slate-400">
                  {dict.system.tenantThemeLabel}
                </span>
                {DEMO_TENANTS.map((tenant, idx) => (
                  <Button
                    key={tenant.slug}
                    size="sm"
                    variant={selectedTenantIdx === idx ? 'primary' : 'outline'}
                    onClick={() => setSelectedTenantIdx(idx)}
                  >
                    {locale === 'ar' ? tenant.nameAr : tenant.nameEn}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label={locale === 'ar' ? 'بحث سريع عن المشتركين' : 'Quick Member Lookup'}
                placeholder={dict.system.searchPlaceholder}
                hint={
                  locale === 'ar'
                    ? 'يدعم البحث بالاسم العربي أو الإنجليزي أو رقم الموبايل المصري'
                    : 'Supports Arabic/English names or Egyptian mobile numbers (+20)'
                }
              />

              <div className="flex flex-wrap items-end gap-3">
                <Button variant="primary">
                  {locale === 'ar' ? 'تسجيل دخول سريع (QR)' : 'Quick QR Check-In'}
                </Button>
                <Button variant="secondary">
                  {locale === 'ar' ? 'تحصيل دفعة (Paymob / فوري)' : 'Collect Payment'}
                </Button>
                <Button variant="danger">
                  {locale === 'ar' ? 'تجميد الاشتراك' : 'Freeze Plan'}
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
