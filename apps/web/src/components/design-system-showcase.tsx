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
  Award,
  Calendar,
  CheckCircle2,
  CreditCard,
  Dumbbell,
  FileText,
  Flame,
  Globe,
  Lock,
  MessageSquare,
  Moon,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DICTIONARIES } from '../i18n/dictionaries';

type WorkspaceTab =
  | 'ADMIN_OVERVIEW'
  | 'MEMBERS_BILLING'
  | 'CLASSES_QR_ACCESS'
  | 'MEMBER_PWA'
  | 'POS_REPORTS_CHAT'
  | 'SUPER_ADMIN';

const DEMO_TENANTS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'titanfit-cairo',
    nameEn: 'TitanFit — Rooted Performance (Cairo)',
    nameAr: 'تايتن فيت — الأداء المتجذر (القاهرة)',
    primaryHex: '#D4AF37',
    accentHex: '#10B981',
    branches: ['Zamalek Flagship', 'New Cairo 5th Settlement'],
    branchesAr: ['فرع الزمالك الرئيسي', 'فرع التجمع الخامس'],
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    slug: 'alexandria-iron',
    nameEn: 'Alexandria Iron House',
    nameAr: 'بيت الحديد - الإسكندرية',
    primaryHex: '#10B981',
    accentHex: '#F59E0B',
    branches: ['Smouha Athletic Hub'],
    branchesAr: ['فرع سموحة الرياضي'],
    plan: 'PRO_MULTI_BRANCH',
    status: 'ACTIVE',
  },
] as const;

export function DesignSystemShowcase({
  initialLocale = 'en',
}: {
  initialLocale?: SupportedLocale;
}) {
  const [locale, setLocale] = useState<SupportedLocale>(initialLocale);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('ADMIN_OVERVIEW');
  const [selectedTenantIdx, setSelectedTenantIdx] = useState(0);
  const [qrCountdown, setQrCountdown] = useState(30);

  // Interactive Phase 2 State (Members & Cashier Checkout)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'PAYMOB_CARD' | 'FAWRY' | 'VODAFONE_CASH' | 'INSTAPAY' | 'CASH'
  >('PAYMOB_CARD');
  const [couponInput, setCouponInput] = useState('RAMADAN20');
  const [invoiceStatusMsg, setInvoiceStatusMsg] = useState<string | null>(null);

  // Interactive Phase 3 State (Class Booking, Auto-Waitlist & Turnstile QR Scan)
  const [hiitBookedCount, setHiitBookedCount] = useState(20);
  const [hiitWaitlistCount, setHiitWaitlistCount] = useState(1);
  const [waitlistBanner, setWaitlistBanner] = useState<string | null>(null);
  const [turnstileStatus, setTurnstileStatus] = useState<string | null>(null);

  // Interactive Phase 4 State (Member PWA Workout Logger & PR Tracker)
  const [squatWeightKg, setSquatWeightKg] = useState('145');
  const [squatReps, setSquatReps] = useState('5');
  const [prNotification, setPrNotification] = useState<string | null>(
    'New Barbell Back Squat 1RM PR: 169.2 kg (+150 XP)',
  );

  // Interactive Phase 5 State (POS Cart & Real-time Trainer Chat)
  const [posCartCount, setPosCartCount] = useState(2);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'Coach Karim Nabil',
      senderAr: 'كابتن كريم نبيل',
      text: 'أهلاً يا بطل! تم تحديث جدول تمارين القوة والـ Macros للأسبوع الجديد.',
      time: '17:15',
    },
    {
      sender: 'Ahmed Mahmoud (VIP)',
      senderAr: 'أحمد محمود (VIP)',
      text: 'تمام يا كابتن، سجلت النهاردة PR جديد في السكوات ١٤٥ كجم!',
      time: '17:18',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Interactive Phase 6 State (Super Admin Impersonation)
  const [impersonationBanner, setImpersonationBanner] = useState<string | null>(null);

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

  const isDark = theme === 'dark';
  const cardSurfaceClass = !isDark ? 'border-slate-200 bg-white text-slate-900 shadow-sm' : '';

  const tabs: Array<{ id: WorkspaceTab; labelEn: string; labelAr: string }> = [
    { id: 'ADMIN_OVERVIEW', labelEn: '1. Executive & RBAC', labelAr: '١. النظرة العامة والصلاحيات' },
    { id: 'MEMBERS_BILLING', labelEn: '2. Members & Egypt Pay', labelAr: '٢. المشتركون والمدفوعات' },
    { id: 'CLASSES_QR_ACCESS', labelEn: '3. Classes & QR Gate', labelAr: '٣. الحصص وبوابة QR' },
    { id: 'MEMBER_PWA', labelEn: '4. Member PWA & PRs', labelAr: '٤. تطبيق المشترك والتمارين' },
    { id: 'POS_REPORTS_CHAT', labelEn: '5. POS, Reports & Chat', labelAr: '٥. المبيعات والتقارير والشات' },
    { id: 'SUPER_ADMIN', labelEn: '6. Super Admin SaaS', labelAr: '٦. إدارة المنصة الشاملة' },
  ];

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
      {/* Audited Impersonation Alert Banner (if active) */}
      {impersonationBanner && (
        <div
          data-testid="impersonation-banner"
          className="bg-amber-500 text-slate-950 ps-6 pe-6 py-2 text-center text-xs font-bold flex items-center justify-center gap-3"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{impersonationBanner}</span>
          <button
            type="button"
            onClick={() => setImpersonationBanner(null)}
            className="underline ms-3"
          >
            {locale === 'ar' ? 'إنهاء الجلسة' : 'Exit Impersonation'}
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header
        className={
          isDark
            ? 'sticky top-0 z-30 border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md'
            : 'sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md'
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
              onClick={() => setTheme((p) => (p === 'dark' ? 'light' : 'dark'))}
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
              onClick={() => setLocale((p) => (p === 'en' ? 'ar' : 'en'))}
              data-testid="locale-toggle-btn"
              startIcon={<Globe className="h-4 w-4" />}
            >
              {dict.nav.switchLocaleLabel}
            </Button>
          </div>
        </div>

        {/* Phase Navigation Bar */}
        <div className="mx-auto max-w-7xl overflow-x-auto ps-6 pe-6 pb-3">
          <nav
            aria-label="Platform Modules Navigation"
            className="flex items-center gap-2"
          >
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                data-testid={`nav-tab-${tab.id}`}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
              >
                {locale === 'ar' ? tab.labelAr : tab.labelEn}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-10 ps-6 pe-6 py-8">
        {/* Hero & Rotating QR Section (Always visible at top for instant status) */}
        <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <Badge tone="emerald" className="text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {locale === 'ar'
                  ? 'جميع المراحل (٠ إلى ٦) مفعلة ومختبرة بالكامل'
                  : 'All Phases (0–6) Live, Verified & Production-Ready'}
              </span>
            </Badge>

            <h1
              data-testid="hero-heading"
              className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight"
            >
              {dict.hero.title}
            </h1>

            <p
              className={
                isDark
                  ? 'text-base text-slate-300 sm:text-lg'
                  : 'text-base text-slate-600 sm:text-lg'
              }
            >
              {dict.hero.subtitle}
            </p>

            <div className="flex flex-wrap gap-2.5">
              <Badge tone="emerald">
                <ShieldCheck className="h-3.5 w-3.5" />
                {dict.system.rlsBadge}
              </Badge>
              <Badge tone="blue">{dict.system.rtlBadge}</Badge>
              <Badge tone="amber">{dict.system.egyptPaymentsBadge}</Badge>
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

              <div className="my-5 flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white">
                <QrCode className="h-28 w-28 text-amber-400" aria-label="Dynamic Member QR Code" />
                <code className="mt-3 rounded bg-slate-900 ps-3 pe-3 py-1 font-mono text-xs text-emerald-300">
                  TITANFIT:v1:{activeTenant.slug}:HMAC-{qrCountdown}S
                </code>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {locale === 'ar'
                    ? 'أحمد محمود • باقة سنوية VIP'
                    : 'Ahmed Mahmoud • Annual VIP Plan'}
                </span>
                <span>{locale === 'ar' ? 'فرع الزمالك' : 'Zamalek Branch'}</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Live KPI Stat Cards */}
        <section
          aria-label="Gym Performance Overview"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Card className={cardSurfaceClass}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {dict.metrics.activeMembers}
              </span>
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-bold">
              {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG').format(1420)}
            </p>
            <p className="mt-1 text-xs text-emerald-400">+12.4% vs last month • Churn: 1.8%</p>
          </Card>

          <Card className={cardSurfaceClass}>
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

          <Card className={cardSurfaceClass}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {dict.metrics.todayCheckins}
              </span>
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-bold">
              {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG').format(386)}
            </p>
            <p className="mt-1 text-xs text-slate-400">p95 check-in latency: 18ms</p>
          </Card>

          <Card className={cardSurfaceClass}>
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

        {/* ==================================================================== */}
        {/* TAB 1: PHASE 1 — EXECUTIVE OVERVIEW, RBAC ROLES & AUDIT LOGS         */}
        {/* ==================================================================== */}
        {activeTab === 'ADMIN_OVERVIEW' && (
          <section data-testid="panel-admin-overview" className="space-y-6">
            <Card className={cardSurfaceClass}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-bold">
                    {locale === 'ar'
                      ? 'المرحلة ١: التحكم بالصلاحيات (RBAC)، الفروع، وسجل المراجعة غير القابل للتعديل'
                      : 'Phase 1: Permission-Based RBAC, Multi-Branch & Immutable Audit Log'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {locale === 'ar'
                      ? 'عزل تام بين الأندية عبر PostgreSQL FORCE RLS + تدوير التوكن واكتشاف الاختراق'
                      : 'PostgreSQL FORCE RLS (NOBYPASSRLS) + Rotating Refresh Token Family Reuse Detection'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
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

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 p-4">
                  <Badge tone="amber">GYM_OWNER & BRANCH_MANAGER</Badge>
                  <p className="mt-2 text-sm font-semibold">
                    {locale === 'ar' ? 'طارق المصري • مريم حسن' : 'Tarek El-Masry • Mariam Hassan'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Permissions: <code>members:health:read</code>, <code>payments:refund</code>,{' '}
                    <code>reports:financial:read</code>
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 p-4">
                  <Badge tone="emerald">RECEPTIONIST & TRAINER</Badge>
                  <p className="mt-2 text-sm font-semibold">
                    {locale === 'ar' ? 'عمر عبد الرحمن • كابتن كريم نبيل' : 'Omar • Coach Karim Nabil'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Permissions: <code>attendance:scan_qr</code>, <code>payments:collect</code>,{' '}
                    <code>workouts:manage</code>
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 p-4">
                  <Badge tone="blue">IMMUTABLE AUDIT LOGS</Badge>
                  <p className="mt-2 text-sm font-semibold">
                    PostgreSQL Trigger: <code>trg_audit_logs_immutable</code>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Blocks <code>UPDATE</code> & <code>DELETE</code> at DB engine level. Every sensitive action is logged with Actor, IP & Tenant ID.
                  </p>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: PHASE 2 — MEMBERS, SUBSCRIPTIONS, EGYPT PAYMENTS & INVOICES   */}
        {/* ==================================================================== */}
        {activeTab === 'MEMBERS_BILLING' && (
          <section data-testid="panel-members-billing" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Card className={`${cardSurfaceClass} lg:col-span-7 space-y-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    {locale === 'ar'
                      ? 'ملف المشترك والبيانات الطبية المشفرة (AES-256-GCM)'
                      : 'Member Profile & Encrypted Health Record (AES-256-GCM)'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Membership #TF-CAI-1001 • Bound to Tenant AAD
                  </p>
                </div>
                <Badge tone="emerald">ACTIVE VIP</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={locale === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                  defaultValue={locale === 'ar' ? 'أحمد محمود' : 'Ahmed Mahmoud'}
                />
                <Input
                  label={locale === 'ar' ? 'رقم الموبايل المصري' : 'Egyptian Mobile (+20)'}
                  defaultValue="+201055555555"
                />
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-emerald-400">
                  <span>AES-256-GCM Decrypted Medical & PAR-Q Record</span>
                  <span>Blood Type: O+</span>
                </div>
                <p className="text-slate-300">
                  • PAR-Q Cleared: Yes • Past Injury: Mild left shoulder impingement (2024)
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setInvoiceStatusMsg(
                      locale === 'ar'
                        ? 'تم تجميد الاشتراك ١٤ يوماً وتمديد تاريخ الانتهاء تلقائياً!'
                        : 'Subscription frozen for 14 days; expiry date automatically extended!',
                    )
                  }
                >
                  {locale === 'ar' ? 'تجميد الاشتراك (١٤ يوم)' : 'Freeze Plan (+14 Days)'}
                </Button>
              </div>
            </Card>

            <Card className={`${cardSurfaceClass} lg:col-span-5 space-y-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-400" />
                  <span>
                    {locale === 'ar'
                      ? 'بوابة الدفع المصرية والفاتورة الضريبية'
                      : 'Egypt Payment Checkout & QR Invoice'}
                  </span>
                </h3>
                <Badge tone="amber">Idempotent</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['PAYMOB_CARD', 'FAWRY', 'VODAFONE_CASH', 'INSTAPAY', 'CASH'] as const).map(
                  (pm) => (
                    <Button
                      key={pm}
                      size="sm"
                      variant={selectedPaymentMethod === pm ? 'primary' : 'outline'}
                      onClick={() => setSelectedPaymentMethod(pm)}
                    >
                      {pm}
                    </Button>
                  ),
                )}
              </div>

              <Input
                label={locale === 'ar' ? 'كود الخصم (الكوبون)' : 'Discount Coupon Code'}
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />

              <div className="rounded-xl border border-slate-800 p-4 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Annual Rooted VIP Plan:</span>
                  <span>{formatMoneyMinor(1200000, 'EGP', locale)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon ({couponInput || 'NONE'} -20%):</span>
                  <span>-{formatMoneyMinor(240000, 'EGP', locale)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Egypt VAT (14%):</span>
                  <span>{formatMoneyMinor(134400, 'EGP', locale)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold">
                  <span>Total Due:</span>
                  <span>{formatMoneyMinor(1094400, 'EGP', locale)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                data-testid="issue-invoice-btn"
                startIcon={<FileText className="h-4 w-4" />}
                onClick={() =>
                  setInvoiceStatusMsg(
                    `Invoice INV-2026-1002 issued via ${selectedPaymentMethod} with signed QR verification hash!`,
                  )
                }
              >
                {locale === 'ar'
                  ? 'إصدار الفاتورة الضريبية بـ QR'
                  : 'Complete Payment & Issue Signed QR Invoice'}
              </Button>

              {invoiceStatusMsg && (
                <p
                  data-testid="invoice-status-msg"
                  className="rounded-lg bg-emerald-500/15 p-3 text-xs font-medium text-emerald-300"
                >
                  {invoiceStatusMsg}
                </p>
              )}
            </Card>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: PHASE 3 — CLASSES, AUTO-WAITLIST & ROTATING QR CHECK-IN       */}
        {/* ==================================================================== */}
        {activeTab === 'CLASSES_QR_ACCESS' && (
          <section data-testid="panel-classes-access" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Card className={`${cardSurfaceClass} lg:col-span-7 space-y-4`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <span>
                    {locale === 'ar'
                      ? 'جدول الحصص والترقية التلقائية لقائمة الانتظار'
                      : 'Class Schedule & Auto-Waitlist Promotion Engine'}
                  </span>
                </h2>
                <Badge tone="emerald">Redis Locked</Badge>
              </div>

              <div className="rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">
                      {locale === 'ar'
                        ? 'تدريب القوة والتحمل المكثف (Barbell HIIT)'
                        : 'Rooted Conditioning & Barbell HIIT'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Coach Karim Nabil • Arena Studio A • 18:00 – 19:00
                    </p>
                  </div>
                  <Badge tone="amber">
                    Booked: {hiitBookedCount}/20 • Waitlist: {hiitWaitlistCount}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    data-testid="simulate-cancel-promote-btn"
                    onClick={() => {
                      setHiitWaitlistCount(0);
                      setHiitBookedCount(20);
                      setWaitlistBanner(
                        'Spot opened! Waitlisted Member #1 (Yasmine Adel) was automatically promoted to BOOKED and notified via WhatsApp/Push.',
                      );
                    }}
                  >
                    {locale === 'ar'
                      ? 'محاكاة إلغاء حجز وترقية قائمة الانتظار تلقائياً'
                      : 'Simulate Cancellation -> Auto-Promote Waitlist #1'}
                  </Button>
                </div>

                {waitlistBanner && (
                  <p
                    data-testid="waitlist-promoted-msg"
                    className="rounded-lg bg-emerald-500/15 p-3 text-xs font-medium text-emerald-300"
                  >
                    {waitlistBanner}
                  </p>
                )}
              </div>
            </Card>

            <Card className={`${cardSurfaceClass} lg:col-span-5 space-y-4`}>
              <h3 className="text-base font-bold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-400" />
                <span>
                  {locale === 'ar'
                    ? 'بوابة الدخول الذكية (Turnstile Relay & Anti-Passback)'
                    : 'Reception QR Scanner & Hardware Turnstile Hook'}
                </span>
              </h3>

              <p className="text-xs text-slate-400">
                Verifies 30s HMAC-SHA256 signature, blocks FROZEN/EXPIRED plans, and enforces 15-min anti-passback cooldown.
              </p>

              <Button
                variant="primary"
                className="w-full"
                data-testid="simulate-turnstile-scan-btn"
                onClick={() =>
                  setTurnstileStatus(
                    'ALLOW_ACCESS • Turnstile Relay Pulse: 1500ms • Member: Ahmed Mahmoud (VIP)',
                  )
                }
              >
                {locale === 'ar'
                  ? 'مسح كود QR وفتح البوابة الإلكترونية'
                  : 'Scan Member Rotating QR & Pulse Turnstile Gate'}
              </Button>

              {turnstileStatus && (
                <p
                  data-testid="turnstile-status-msg"
                  className="rounded-lg bg-emerald-500/15 p-3 text-xs font-mono text-emerald-300"
                >
                  {turnstileStatus}
                </p>
              )}
            </Card>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: PHASE 4 — MEMBER PWA: WORKOUTS, 1RM PRs, BMI & NUTRITION      */}
        {/* ==================================================================== */}
        {activeTab === 'MEMBER_PWA' && (
          <section data-testid="panel-member-pwa" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Card className={`${cardSurfaceClass} lg:col-span-7 space-y-4`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-400" />
                  <span>
                    {locale === 'ar'
                      ? 'تسجيل التمارين واكتشاف الأرقام القياسية (1RM PR)'
                      : 'Member PWA Workout Logger & Epley 1RM PR Detector'}
                  </span>
                </h2>
                <Badge tone="amber">14-Day Streak</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Barbell Back Squat Weight (kg)"
                  value={squatWeightKg}
                  onChange={(e) => setSquatWeightKg(e.target.value)}
                />
                <Input
                  label="Completed Reps"
                  value={squatReps}
                  onChange={(e) => setSquatReps(e.target.value)}
                />
              </div>

              <Button
                variant="primary"
                data-testid="log-workout-set-btn"
                onClick={() => {
                  const w = Number(squatWeightKg) || 145;
                  const r = Number(squatReps) || 5;
                  const est1Rm = (w * (1 + r / 30)).toFixed(1);
                  setPrNotification(
                    `Logged ${w}kg x ${r} reps! Estimated 1RM: ${est1Rm} kg — NEW PERSONAL RECORD!`,
                  );
                }}
              >
                {locale === 'ar' ? 'تسجيل المجموعة وحساب الـ PR' : 'Log Set & Calculate 1RM PR'}
              </Button>

              {prNotification && (
                <p
                  data-testid="pr-notification-msg"
                  className="rounded-lg bg-amber-500/15 p-3 text-xs font-semibold text-amber-300"
                >
                  {prNotification}
                </p>
              )}
            </Card>

            <Card className={`${cardSurfaceClass} lg:col-span-5 space-y-4`}>
              <h3 className="text-base font-bold">
                {locale === 'ar'
                  ? 'قياسات الجسم والماكروز اليومية'
                  : 'Body Composition (BMI) & Daily Macro Target'}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 p-3">
                  <span className="text-slate-400">Weight / Body Fat</span>
                  <p className="mt-1 text-lg font-bold">81.5 kg • 13.2%</p>
                </div>
                <div className="rounded-xl border border-slate-800 p-3">
                  <span className="text-slate-400">Daily Macros</span>
                  <p className="mt-1 text-lg font-bold">2,650 kcal • 195g P</p>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: PHASE 5 — POS-LITE, REPORTS, GAMIFICATION & TRAINER CHAT      */}
        {/* ==================================================================== */}
        {activeTab === 'POS_REPORTS_CHAT' && (
          <section data-testid="panel-pos-reports-chat" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Card className={`${cardSurfaceClass} lg:col-span-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-400" />
                  <span>
                    {locale === 'ar'
                      ? 'نقطة البيع السريعة (POS-Lite) والمكملات'
                      : 'Inventory & POS-Lite (Supplements & Merch)'}
                  </span>
                </h2>
                <Badge tone="emerald">Cart: {posCartCount} items</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl border border-slate-800 p-3">
                  <span>TitanFit Gold Isolate Whey Shake (Stock: 85)</span>
                  <span className="font-bold">{formatMoneyMinor(12000, 'EGP', locale)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-800 p-3">
                  <span>Rooted Performance Gold Crest Tee (Stock: 40)</span>
                  <span className="font-bold">{formatMoneyMinor(65000, 'EGP', locale)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setPosCartCount((c) => c + 1)}
              >
                {locale === 'ar' ? 'إضافة للسلة وتحصيل فوري' : 'Add Shake to Member Tab'}
              </Button>
            </Card>

            <Card className={`${cardSurfaceClass} lg:col-span-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-400" />
                  <span>
                    {locale === 'ar'
                      ? 'محادثة فورية مع المدرب ولوحة المتصدرين'
                      : 'Real-Time Trainer Chat & Gamification Leaderboard'}
                  </span>
                </h3>
                <Badge tone="amber">
                  <Award className="h-3.5 w-3.5" /> #1 Ahmed (1,850 pts)
                </Badge>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto rounded-xl border border-slate-800 p-3 text-xs">
                {chatMessages.map((m, i) => (
                  <div key={i} className="space-y-0.5">
                    <span className="font-bold text-amber-400">
                      {locale === 'ar' ? m.senderAr : m.sender} ({m.time}):
                    </span>
                    <p className="text-slate-300">{m.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={locale === 'ar' ? 'اكتب رسالة للمدرب...' : 'Message Coach Karim...'}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="primary"
                  data-testid="send-chat-btn"
                  onClick={() => {
                    if (!chatInput.trim()) return;
                    setChatMessages((prev) => [
                      ...prev,
                      {
                        sender: 'Ahmed Mahmoud (VIP)',
                        senderAr: 'أحمد محمود (VIP)',
                        text: chatInput,
                        time: 'Now',
                      },
                    ]);
                    setChatInput('');
                  }}
                >
                  {locale === 'ar' ? 'إرسال' : 'Send'}
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: PHASE 6 — SUPER ADMIN SAAS CONTROL & AUDITED IMPERSONATION    */}
        {/* ==================================================================== */}
        {activeTab === 'SUPER_ADMIN' && (
          <section data-testid="panel-super-admin" className="space-y-6">
            <Card className={cardSurfaceClass}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    {locale === 'ar'
                      ? 'لوحة تحكم مالك المنصة (Super Admin SaaS Console)'
                      : 'Super Admin Console — Multi-Tenant SaaS Lifecycle & Audited Impersonation'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Manage tenant trials/suspensions, feature flags per plan, and audited support impersonation.
                  </p>
                </div>
                <Badge tone="amber">SUPER_ADMIN ONLY</Badge>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {DEMO_TENANTS.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-800 p-4 gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          {locale === 'ar' ? t.nameAr : t.nameEn}
                        </span>
                        <Badge tone="emerald">{t.plan}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        Slug: <code>{t.slug}</code> • Branches: {t.branches.join(', ')}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        data-testid={`impersonate-btn-${t.slug}`}
                        onClick={() =>
                          setImpersonationBanner(
                            `AUDITED IMPERSONATION ACTIVE: Viewing ${t.nameEn} as Gym Owner (Logged to immutable audit_logs)`,
                          )
                        }
                      >
                        {locale === 'ar'
                          ? 'دخول بحساب النادي للدعم الفني (مسجل أمنياً)'
                          : 'Audited Impersonate Tenant'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
