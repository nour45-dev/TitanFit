'use client';

import React, { useState } from 'react';
import { PLATFORM_CONFIG, getLocaleDirection } from '@gymos/config';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  CreditCard,
  Globe,
  KeyRound,
  LayoutDashboard,
  Menu,
  Moon,
  QrCode,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Sun,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  PlatformProvider,
  type UserRoleKey,
  type WorkspaceSection,
  usePlatformStore,
} from '../lib/platform-store';
import {
  MembersCrmView,
  OverviewView,
  PaymentsBillingView,
  SubscriptionsView,
} from './views/dashboard-and-crm';
import {
  AccessControlTurnstilesView,
  ClassesScheduleView,
  PosInventoryView,
  StaffTrainersView,
} from './views/operations-and-pos';
import {
  MemberPwaPortalView,
  ReportsAnalyticsView,
  SuperAdminConsoleView,
  TenantSettingsView,
} from './views/member-pwa-and-admin';
import { PublicCoachingStorefrontView } from './views/public-coaching-storefront';

function TitanFitEnterpriseShell() {
  const {
    locale,
    setLocale,
    theme,
    setTheme,
    activeSection,
    setActiveSection,
    activeRole,
    setActiveRole,
    selectedBranchId,
    setSelectedBranchId,
    branches,
    members,
    invoices,
    classes,
    toastMessage,
    showToast,
  } = usePlatformStore();

  const isAr = locale === 'ar';
  const dir = getLocaleDirection(locale);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [totpCode, setTotpCode] = useState('482910');

  const sidebarGroups: Array<{
    groupEn: string;
    groupAr: string;
    items: Array<{
      id: WorkspaceSection;
      testId?: string;
      labelEn: string;
      labelAr: string;
      badge?: string | number;
      icon: React.ComponentType<{ className?: string }>;
    }>;
  }> = [
    {
      groupEn: 'PUBLIC TRAINEE STOREFRONT',
      groupAr: 'واجهة الزوار والمتدربين (العامة)',
      items: [
        {
          id: 'PUBLIC_STOREFRONT',
          testId: 'nav-tab-PUBLIC_STOREFRONT',
          labelEn: 'Trainee Storefront (Diet & Cheat)',
          labelAr: 'واجهة المتدربين (Diet & Cheat)',
          badge: 'LIVE',
          icon: Sparkles,
        },
        {
          id: 'MEMBER_PWA',
          testId: 'nav-tab-MEMBER_PWA',
          labelEn: 'Member App (PWA)',
          labelAr: 'تطبيق المتدرب (PWA)',
          badge: '1RM PR',
          icon: Smartphone,
        },
      ],
    },
    {
      groupEn: 'CLUB OPERATIONS & CRM',
      groupAr: 'إدارة النادي والكوتشينج',
      items: [
        {
          id: 'OVERVIEW',
          testId: 'nav-tab-ADMIN_OVERVIEW',
          labelEn: 'Executive Overview',
          labelAr: 'لوحة القيادة التنفيذية',
          icon: LayoutDashboard,
        },
        {
          id: 'MEMBERS',
          labelEn: 'Members CRM & Vault',
          labelAr: 'المتدربون والملف الطبي',
          badge: members.length,
          icon: Users,
        },
        {
          id: 'CLASSES',
          testId: 'nav-tab-CLASSES_QR_ACCESS',
          labelEn: 'Classes & Waitlists',
          labelAr: 'جدول الحصص والانتظار',
          badge: classes.length,
          icon: Calendar,
        },
        {
          id: 'ACCESS_CONTROL',
          labelEn: 'QR & Turnstile Gates',
          labelAr: 'بوابات الدخول والـ QR',
          badge: 'LIVE',
          icon: QrCode,
        },
        {
          id: 'STAFF_TRAINERS',
          labelEn: 'Trainers & Staff',
          labelAr: 'المدربون والأطباء والعمولات',
          icon: UserCheck,
        },
      ],
    },
    {
      groupEn: 'FINANCE, BILLING & POS',
      groupAr: 'المالية، الاشتراكات، والبار',
      items: [
        {
          id: 'SUBSCRIPTIONS',
          labelEn: 'Plans & Coupons',
          labelAr: 'الباقات والكوبونات',
          icon: Award,
        },
        {
          id: 'PAYMENTS',
          testId: 'nav-tab-MEMBERS_BILLING',
          labelEn: 'Cashier & Egypt Gateways',
          labelAr: 'تحصيل الفواتير والمدفوعات',
          badge: invoices.length,
          icon: CreditCard,
        },
        {
          id: 'POS_INVENTORY',
          testId: 'nav-tab-POS_REPORTS_CHAT',
          labelEn: 'POS & Supplement Bar',
          labelAr: 'نقطة بيع المكملات (POS)',
          icon: ShoppingBag,
        },
        {
          id: 'REPORTS',
          labelEn: 'Financial & BI Reports',
          labelAr: 'التقارير المالية وتصدير CSV',
          icon: BarChart3,
        },
      ],
    },
    {
      groupEn: 'SAAS PLATFORM & WHITE-LABEL',
      groupAr: 'بيع المنصة كـ SaaS والهوية',
      items: [
        {
          id: 'SETTINGS',
          labelEn: 'Club & Brand Settings',
          labelAr: 'إعدادات الفروع والهوية',
          icon: Settings,
        },
        {
          id: 'SUPER_ADMIN',
          testId: 'nav-tab-SUPER_ADMIN',
          labelEn: 'Super Admin SaaS',
          labelAr: 'لوحة مالك المنصة (SaaS)',
          badge: 'SaaS',
          icon: ShieldCheck,
        },
      ],
    },
  ];

  const roles: Array<{ id: UserRoleKey; labelEn: string; labelAr: string }> = [
    { id: 'GYM_OWNER', labelEn: 'Gym Owner', labelAr: 'مالك النادي / الكوتش' },
    { id: 'BRANCH_MANAGER', labelEn: 'Branch Manager', labelAr: 'مدير فرع' },
    { id: 'RECEPTIONIST', labelEn: 'Receptionist', labelAr: 'موظف استقبال' },
    { id: 'TRAINER', labelEn: 'Coach / Trainer', labelAr: 'مدرب / طبيب تغذية' },
    { id: 'MEMBER', labelEn: 'Member App', labelAr: 'متدرب (Member)' },
    { id: 'SUPER_ADMIN', labelEn: 'Super Admin', labelAr: 'مالك المنصة (SaaS)' },
  ];

  const quickPortalModes: Array<{
    section: WorkspaceSection;
    labelAr: string;
    labelEn: string;
    descAr: string;
    descEn: string;
  }> = [
    {
      section: 'PUBLIC_STOREFRONT',
      labelAr: '🌟 صفحة المتدرب والزائر (Diet & Cheat)',
      labelEn: '🌟 Public Trainee Storefront (Diet & Cheat)',
      descAr: 'الصفحة التي تظهر لأي شخص غريب يريد الاشتراك',
      descEn: 'What visitors see to calculate calories & subscribe',
    },
    {
      section: 'MEMBER_PWA',
      labelAr: '📱 تطبيق المتدرب بعد الاشتراك',
      labelEn: '📱 Subscribed Member App (PWA)',
      descAr: 'جدول التمارين، الماكروز، الشات، وباركود الدخول',
      descEn: 'Workouts, macros, coach chat & QR pass',
    },
    {
      section: 'OVERVIEW',
      labelAr: '📊 لوحة تحكم صاحب الجيم / الكوتش',
      labelEn: '📊 Gym Owner / Coach ERP Dashboard',
      descAr: 'إدارة المتدربين، الفواتير، المبيعات، والمدربين',
      descEn: 'Manage trainees, billing, POS & trainers',
    },
    {
      section: 'SUPER_ADMIN',
      labelAr: '🌐 لوحة بيع المنصة كـ SaaS',
      labelEn: '🌐 Super Admin SaaS Console',
      descAr: 'تفعيل المنصة لعميل جديد بضغطة زر وإدارة باقاتك',
      descEn: 'Provision new gym/coach tenants in 1 click',
    },
  ];

  return (
    <div
      dir={dir}
      data-theme={theme}
      data-testid="gymos-root-shell"
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#090C15] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 end-6 z-50 flex max-w-md items-center gap-3 rounded-2xl border border-[#D4AF37] bg-[#121623] px-5 py-3.5 text-xs font-extrabold text-[#F3E5AB] shadow-2xl"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#D4AF37]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        {/* Enterprise Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 start-0 z-40 flex w-72 flex-col border-e border-slate-800/80 bg-[#0D111D] text-slate-200 transition-transform lg:static lg:translate-x-0 ${
            mobileSidebarOpen
              ? 'translate-x-0'
              : dir === 'rtl'
                ? 'translate-x-full lg:translate-x-0'
                : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#D4AF37]/50 bg-[#0A0E17] shadow-md">
                <img
                  src={PLATFORM_CONFIG.logoPath}
                  alt={PLATFORM_CONFIG.appName}
                  data-testid="brand-logo-img"
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    data-testid="brand-app-name"
                    className="text-lg font-extrabold tracking-tight text-white"
                  >
                    {PLATFORM_CONFIG.appName}
                  </span>
                  <span className="rounded bg-[#D4AF37]/20 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-[#D4AF37]">
                    SaaS
                  </span>
                </div>
                <p className="text-[11px] font-semibold tracking-wider text-[#D4AF37]">
                  {PLATFORM_CONFIG.tagline[locale]}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-lg p-1 text-slate-400 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Active Branch Selector inside Sidebar */}
          <div className="border-b border-slate-800/80 px-4 py-3">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {isAr ? 'الفرع النشط حالياً' : 'ACTIVE CLUB BRANCH'}
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-[#141929] px-3 py-2 text-xs font-bold text-white focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="ALL">
                {isAr ? 'جميع الفروع + الأونلاين كوتشينج' : 'All Branches + Online Coaching'}
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {isAr ? b.nameAr : b.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
            {sidebarGroups.map((grp) => (
              <div key={grp.groupEn}>
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {isAr ? grp.groupAr : grp.groupEn}
                </p>
                <div className="mt-1.5 space-y-1">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-testid={item.testId}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                          active
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#b89322] text-slate-950 font-extrabold shadow-md shadow-[#D4AF37]/15'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{isAr ? item.labelAr : item.labelEn}</span>
                        </span>
                        {item.badge !== undefined && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                              active
                                ? 'bg-slate-950/20 text-slate-950'
                                : 'bg-slate-800 text-[#F3E5AB]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom User & Security Footer */}
          <div className="border-t border-slate-800/80 p-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#141929] p-3">
              <div>
                <p className="text-xs font-extrabold text-white">
                  {isAr ? 'كابتن نور الدين (المدير التنفيذي)' : 'Nour El-Din (Executive Owner)'}
                </p>
                <p className="font-mono text-[10px] text-[#D4AF37]">
                  RBAC: {activeRole} • 2FA ON
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                title={isAr ? 'إعدادات الجلسة والأمان' : 'Auth & 2FA Session'}
                className="rounded-lg bg-slate-800 p-2 text-[#D4AF37] hover:bg-slate-700"
              >
                <KeyRound className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace Container */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Enterprise Navbar */}
          <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0D111D]/95 px-4 py-3 backdrop-blur lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-white lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {/* 4-Journey Switcher Pills (Storefront vs Member App vs Gym Admin vs SaaS Super Admin) */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {quickPortalModes.map((mode) => {
                    const isCurrent = activeSection === mode.section;
                    return (
                      <button
                        key={mode.section}
                        type="button"
                        onClick={() => setActiveSection(mode.section)}
                        title={isAr ? mode.descAr : mode.descEn}
                        className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                          isCurrent
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#b89322] text-slate-950 shadow-sm'
                            : 'border border-slate-700/70 bg-slate-800/70 text-slate-200 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        {isAr ? mode.labelAr : mode.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Controls: Auth Modal, Locale RTL/LTR, Theme Light/Dark */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isAr ? 'الأدوار والأمان (JWT/2FA)' : 'Roles & 2FA'}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="locale-toggle-btn"
                  onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3.5 py-1.5 text-xs font-extrabold text-[#F3E5AB] transition hover:bg-[#D4AF37] hover:text-slate-950"
                >
                  <Globe className="h-4 w-4" />
                  {locale === 'en' ? 'العربية (RTL)' : 'English (LTR)'}
                </button>

                <button
                  type="button"
                  data-testid="theme-toggle-btn"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-[#D4AF37]"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4 text-amber-400" />
                      <span className="hidden sm:inline">{isAr ? 'الوضع النهاري' : 'Light Mode'}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-sky-400" />
                      <span className="hidden sm:inline">{isAr ? 'الوضع الليلي' : 'Dark Mode'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Active Module View with Smooth Framer Motion Page Transitions */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {activeSection === 'PUBLIC_STOREFRONT' && (
                  <PublicCoachingStorefrontView
                    onSwitchToDashboard={() => setActiveSection('OVERVIEW')}
                    onSwitchToMemberApp={() => setActiveSection('MEMBER_PWA')}
                    onSwitchToSaaSPricing={() => setActiveSection('SUPER_ADMIN')}
                  />
                )}
                {activeSection === 'OVERVIEW' && <OverviewView />}
                {activeSection === 'MEMBERS' && <MembersCrmView />}
                {activeSection === 'SUBSCRIPTIONS' && <SubscriptionsView />}
                {activeSection === 'PAYMENTS' && <PaymentsBillingView />}
                {activeSection === 'CLASSES' && <ClassesScheduleView />}
                {activeSection === 'ACCESS_CONTROL' && <AccessControlTurnstilesView />}
                {activeSection === 'POS_INVENTORY' && <PosInventoryView />}
                {activeSection === 'STAFF_TRAINERS' && <StaffTrainersView />}
                {activeSection === 'MEMBER_PWA' && <MemberPwaPortalView />}
                {activeSection === 'REPORTS' && <ReportsAnalyticsView />}
                {activeSection === 'SETTINGS' && <TenantSettingsView />}
                {activeSection === 'SUPER_ADMIN' && <SuperAdminConsoleView />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Authentication, 2FA TOTP & Session Security Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/40 bg-[#121623] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {isAr
                    ? 'بوابة المصادقة، التبديل بين الأدوار، والتحقق الثنائي (TOTP 2FA)'
                    : 'Enterprise Auth, RBAC Role Switcher & TOTP 2FA Verification'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'تدوير Refresh Tokens تلقائي + قفل الحساب بعد 5 محاولات خاطئة'
                    : 'Rotating httpOnly refresh token family + 5-attempt progressive lockout'}
                </p>
              </div>
              <button type="button" onClick={() => setShowAuthModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'تبديل الدور الوظيفي الفوري (RBAC Role)' : 'Switch Active RBAC Role'}
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setActiveRole(r.id);
                        if (r.id === 'MEMBER') setActiveSection('MEMBER_PWA');
                        if (r.id === 'SUPER_ADMIN') setActiveSection('SUPER_ADMIN');
                        showToast(
                          isAr
                            ? `تم التبديل إلى صلاحيات: ${r.labelAr}`
                            : `Switched RBAC session to: ${r.labelEn}`,
                        );
                      }}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                        activeRole === r.id
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F3E5AB]'
                          : 'border-slate-800 bg-slate-900 text-slate-300'
                      }`}
                    >
                      {isAr ? r.labelAr : r.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs">
                <p className="font-bold text-[#D4AF37]">
                  {isAr ? 'التحقق الثنائي (RFC 6238 TOTP) & OTP' : 'RFC 6238 TOTP 2FA & Phone OTP'}
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm tracking-widest text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      showToast(
                        isAr
                          ? 'تم التحقق من رمز 2FA وتدوير عائلة الـ Refresh Token بنجاح!'
                          : 'Verified TOTP 2FA code & rotated refresh token family!',
                      );
                      setShowAuthModal(false);
                    }}
                    className="rounded-xl bg-[#D4AF37] px-4 py-2 font-extrabold text-slate-950"
                  >
                    {isAr ? 'تحقق وتدوير التوكن' : 'Verify & Rotate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DesignSystemShowcase({
  initialLocale = 'ar',
}: {
  initialLocale?: 'en' | 'ar';
}) {
  return (
    <PlatformProvider initialLocale={initialLocale}>
      <TitanFitEnterpriseShell />
    </PlatformProvider>
  );
}
