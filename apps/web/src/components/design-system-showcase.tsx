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
  Gift,
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
  Video,
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
import { FreeTrialWorkoutsAndDietsView } from './views/free-trial-workouts-and-diets';

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

  const isPublicWebsiteView =
    activeSection === 'PUBLIC_STOREFRONT' || activeSection === 'FREE_TRIAL_HUB';

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
      groupEn: 'PUBLIC TRAINEE WEBSITE',
      groupAr: 'موقع المتدربين والزوار (العام)',
      items: [
        {
          id: 'PUBLIC_STOREFRONT',
          testId: 'nav-tab-PUBLIC_STOREFRONT',
          labelEn: 'Main Website (Diet & Cheat)',
          labelAr: 'الرئيسية والباقات (Diet & Cheat)',
          badge: 'LIVE',
          icon: Sparkles,
        },
        {
          id: 'FREE_TRIAL_HUB',
          testId: 'nav-tab-FREE_TRIAL_HUB',
          labelEn: 'Free Video Workouts & Diets',
          labelAr: 'تمارين فيديو وأنظمة مجانية',
          badge: 'FREE',
          icon: Video,
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

  return (
    <div
      dir={dir}
      data-theme={theme}
      data-testid="gymos-root-shell"
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#090C15] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 end-6 z-50 flex max-w-md items-center gap-3 rounded-2xl border-2 border-amber-500 bg-white px-5 py-3.5 text-xs font-extrabold text-slate-900 shadow-2xl"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLEAN ALL-WHITE TOP WEBSITE & PORTAL NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-xs backdrop-blur lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Brand Logo + Title */}
          <div className="flex items-center gap-3">
            {!isPublicWebsiteView && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-800 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveSection('PUBLIC_STOREFRONT')}
              className="flex items-center gap-2.5 text-start"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-400 bg-slate-950 shadow-xs">
                <img
                  src={PLATFORM_CONFIG.logoPath}
                  alt={PLATFORM_CONFIG.appName}
                  data-testid="brand-logo-img"
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    data-testid="brand-app-name"
                    className="text-lg font-black tracking-tight text-slate-900"
                  >
                    {PLATFORM_CONFIG.appName}
                  </span>
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-amber-800">
                    COACHING & SaaS
                  </span>
                </div>
                <p className="hidden text-[11px] font-bold text-slate-500 sm:block">
                  {isAr
                    ? 'منصة التغذية والتدريب الأونلاين وإدارة الأندية الرياضية'
                    : 'Online Nutrition, Video Coaching & Multi-Branch Gym SaaS'}
                </p>
              </div>
            </button>
          </div>

          {/* Primary User-Friendly Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveSection('PUBLIC_STOREFRONT')}
              className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                activeSection === 'PUBLIC_STOREFRONT'
                  ? 'bg-gradient-to-r from-amber-500 to-[#D4AF37] text-slate-950 shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isAr ? '🏠 الرئيسية والباقات' : '🏠 Main Storefront'}
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('FREE_TRIAL_HUB')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                activeSection === 'FREE_TRIAL_HUB'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Gift className="h-3.5 w-3.5" />
              {isAr
                ? '🎁 جرب مجاناً (تمارين فيديو + أنظمة غذائية)'
                : '🎁 Free Video Workouts & Diets'}
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('MEMBER_PWA')}
              className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                activeSection === 'MEMBER_PWA'
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isAr ? '📱 تطبيق المشتركين' : '📱 Member App'}
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('OVERVIEW')}
              className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                !isPublicWebsiteView &&
                activeSection !== 'MEMBER_PWA' &&
                activeSection !== 'SUPER_ADMIN'
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isAr ? '📊 لوحة تحكم الجيم والكوتش' : '📊 Coach & Gym Admin'}
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('SUPER_ADMIN')}
              className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                activeSection === 'SUPER_ADMIN'
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isAr ? '🌐 بيع المنصة (SaaS)' : '🌐 SaaS Console'}
            </button>
          </div>

          {/* Right Controls: Language & Theme */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="locale-toggle-btn"
              onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-800 transition hover:border-amber-500 hover:bg-amber-50"
            >
              <Globe className="h-4 w-4 text-amber-600" />
              {locale === 'en' ? 'العربية (RTL)' : 'English (LTR)'}
            </button>

            <button
              type="button"
              data-testid="theme-toggle-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-amber-500"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="hidden sm:inline">{isAr ? 'الوضع النهاري' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" />
                  <span className="hidden sm:inline">{isAr ? 'الوضع الليلي' : 'Dark'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Compact Quick-Access Module Bar (keeps all E2E testIds mounted and accessible in 1 click) */}
        <div className="mx-auto mt-2.5 flex max-w-7xl items-center gap-1.5 overflow-x-auto border-t border-slate-100 pt-2 text-[11px]">
          <span className="shrink-0 font-extrabold text-slate-400 pe-1">
            {isAr ? 'الوصول السريع للأقسام:' : 'Quick Modules:'}
          </span>
          {sidebarGroups.flatMap((g) => g.items).map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={item.testId}
                onClick={() => setActiveSection(item.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition ${
                  active
                    ? 'bg-amber-100 text-amber-950 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-amber-600" />
                <span>{isAr ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-110px)]">
        {/* Enterprise Sidebar Navigation — Shown only when inside Admin/ERP Views so Public Website is 100% Clean & Full-Width */}
        {!isPublicWebsiteView && (
          <aside
            className={`fixed inset-y-0 start-0 z-40 flex w-72 flex-col border-e border-slate-200 bg-white text-slate-800 transition-transform lg:static lg:translate-x-0 ${
              mobileSidebarOpen
                ? 'translate-x-0'
                : dir === 'rtl'
                  ? 'translate-x-full lg:translate-x-0'
                  : '-translate-x-full lg:translate-x-0'
            }`}
          >
            {/* Active Branch Selector inside Sidebar */}
            <div className="border-b border-slate-200 px-4 py-3.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {isAr ? 'الفرع النشط حالياً' : 'ACTIVE CLUB BRANCH'}
                </label>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg p-1 text-slate-400 lg:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
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
                          onClick={() => {
                            setActiveSection(item.id);
                            setMobileSidebarOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                            active
                              ? 'bg-gradient-to-r from-amber-500 to-[#D4AF37] text-slate-950 font-extrabold shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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
                                  ? 'bg-slate-950/15 text-slate-950'
                                  : 'bg-amber-100 text-amber-900'
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
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">
                    {isAr ? 'كابتن نور الدين (المدير التنفيذي)' : 'Nour El-Din (Executive Owner)'}
                  </p>
                  <p className="font-mono text-[10px] font-bold text-amber-700">
                    RBAC: {activeRole} • 2FA ON
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  title={isAr ? 'إعدادات الجلسة والأمان' : 'Auth & 2FA Session'}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-amber-600 hover:bg-amber-50"
                >
                  <KeyRound className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 bg-white p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {activeSection === 'PUBLIC_STOREFRONT' && (
                <PublicCoachingStorefrontView
                  onSwitchToDashboard={() => setActiveSection('OVERVIEW')}
                  onSwitchToMemberApp={() => setActiveSection('MEMBER_PWA')}
                  onSwitchToSaaSPricing={() => setActiveSection('SUPER_ADMIN')}
                  onOpenFreeTrialHub={() => setActiveSection('FREE_TRIAL_HUB')}
                />
              )}
              {activeSection === 'FREE_TRIAL_HUB' && (
                <FreeTrialWorkoutsAndDietsView
                  onSubscribeClick={() => setActiveSection('PUBLIC_STOREFRONT')}
                  onBackToHome={() => setActiveSection('PUBLIC_STOREFRONT')}
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

      {/* Authentication, 2FA TOTP & Session Security Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {isAr
                    ? 'بوابة المصادقة، التبديل بين الأدوار، والتحقق الثنائي (TOTP 2FA)'
                    : 'Enterprise Auth, RBAC Role Switcher & TOTP 2FA Verification'}
                </h3>
                <p className="text-xs text-slate-500">
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
                <label className="block text-xs font-bold text-slate-700">
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
                          ? 'border-amber-500 bg-amber-50 text-amber-950'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {isAr ? r.labelAr : r.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <p className="font-bold text-amber-700">
                  {isAr ? 'التحقق الثنائي (RFC 6238 TOTP) & OTP' : 'RFC 6238 TOTP 2FA & Phone OTP'}
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm tracking-widest text-slate-900"
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
                    className="rounded-xl bg-amber-500 px-4 py-2 font-extrabold text-slate-950"
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
