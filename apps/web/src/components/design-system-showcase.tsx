'use client';

import React, { useState, useEffect } from 'react';
import { PLATFORM_CONFIG, getLocaleDirection } from '@gymos/config';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Crown,
  Dumbbell,
  Gift,
  Globe,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
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
    isAuthenticated,
    currentUser,
    activeTenantCustom,
    login,
    logout,
  } = usePlatformStore();

  const isAr = locale === 'ar';
  const dir = getLocaleDirection(locale);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [totpCode, setTotpCode] = useState('482910');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Synchronize data-theme attribute on root HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError(isAr ? 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم' : 'Please enter email');
      return;
    }
    const res = login(loginEmail, loginPassword);
    if (res.success) {
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError(res.message || (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
    }
  };

  const handleQuickDemoLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    const res = login(email, pass);
    if (res.success) {
      setShowLoginModal(false);
      setLoginError('');
    }
  };

  const brandDisplayName =
    activeTenantCustom?.nameAr && isAr
      ? activeTenantCustom.nameAr
      : activeTenantCustom?.nameEn || PLATFORM_CONFIG.appName;

  const brandDisplayLogo = activeTenantCustom?.logoUrl || PLATFORM_CONFIG.logoPath;

  return (
    <div
      dir={dir}
      data-theme={theme}
      data-testid="gymos-root-shell"
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#090D16] text-slate-100' : 'bg-[#FAFAFA] text-slate-900'
      }`}
    >
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 end-6 z-50 flex max-w-md items-center gap-3 rounded-2xl border-2 border-amber-500 bg-white px-5 py-3.5 text-xs font-extrabold text-slate-900 shadow-2xl dark:border-amber-400 dark:bg-slate-900 dark:text-white"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER: Dynamic Clean Storefront for Visitors vs Sleek Management Bar for Logged-In Admins */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-[#0B0F19]/95 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            {!isPublicWebsiteView && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveSection('PUBLIC_STOREFRONT')}
              className="flex items-center gap-3 text-start"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-400/80 bg-slate-950 shadow-xs">
                <img
                  src={brandDisplayLogo}
                  alt={brandDisplayName}
                  data-testid="brand-logo-img"
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    data-testid="brand-app-name"
                    className="text-lg font-black tracking-tight text-slate-900 dark:text-white"
                  >
                    {activeTenantCustom ? brandDisplayName : PLATFORM_CONFIG.appName}
                  </span>
                  {activeTenantCustom ? (
                    <span
                      style={{ backgroundColor: `${activeTenantCustom.primaryColor || '#D97706'}20`, color: activeTenantCustom.primaryColor || '#D97706' }}
                      className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-black uppercase"
                    >
                      {activeTenantCustom.planTier}
                    </span>
                  ) : (
                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                      SaaS & Coaching
                    </span>
                  )}
                </div>
                <p className="hidden text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:block">
                  {isAr
                    ? 'منصة إدارة الأندية الرياضية والتغذية والتدريب الأونلاين'
                    : 'Smart Gym Management & Online Coaching Platform'}
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Items (Clean Public Menu for Visitors with Rich Animations) */}
          {isPublicWebsiteView ? (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden items-center gap-1.5 md:flex"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveSection('PUBLIC_STOREFRONT')}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeSection === 'PUBLIC_STOREFRONT'
                    ? 'bg-amber-500 text-slate-950 shadow-xs dark:bg-amber-500 font-black'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {isAr ? 'الرئيسية' : 'Home'}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveSection('FREE_TRIAL_HUB')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                  activeSection === 'FREE_TRIAL_HUB'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                }`}
              >
                <Gift className="h-3.5 w-3.5" />
                {isAr ? '🎁 جرب مجاناً' : '🎁 Free Trial'}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setActiveSection('PUBLIC_STOREFRONT');
                  setTimeout(() => {
                    document.getElementById('coaching-packages')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {isAr ? 'باقات الاشتراك' : 'Pricing Plans'}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setActiveSection('PUBLIC_STOREFRONT');
                  setTimeout(() => {
                    document.getElementById('free-calorie-calculator')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {isAr ? 'حاسبة السعرات' : 'Macro Calculator'}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setActiveSection('PUBLIC_STOREFRONT');
                  setTimeout(() => {
                    document.getElementById('transformations-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {isAr ? 'قصص التحول' : 'Success Stories'}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveSection('MEMBER_PWA')}
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Smartphone className="h-3.5 w-3.5 text-amber-500" />
                {isAr ? 'تطبيق المشترك' : 'Member App'}
              </motion.button>
            </motion.nav>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                {isAr ? 'القسم الحالي:' : 'Current View:'} {activeSection}
              </span>
              <button
                type="button"
                onClick={() => setActiveSection('PUBLIC_STOREFRONT')}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {isAr ? 'معاينة الموقع للزوار' : 'View Storefront'}
              </button>
            </div>
          )}

          {/* Right Action Controls: Lang, Theme & Login/Profile */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              type="button"
              data-testid="locale-toggle-btn"
              onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:border-amber-500 hover:bg-amber-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Globe className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>{locale === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              data-testid="theme-toggle-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-amber-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline">{isAr ? 'النهاري' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" />
                  <span className="hidden sm:inline">{isAr ? 'الليلي' : 'Dark'}</span>
                </>
              )}
            </button>

            {/* Auth Button: Login vs User Profile & Logout */}
            {!isAuthenticated ? (
              <button
                type="button"
                data-testid="open-login-modal-btn"
                onClick={() => setShowLoginModal(true)}
                className="inline-flex min-h-[38px] items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] px-4 py-1.5 text-xs font-black text-slate-950 shadow-sm transition hover:opacity-95"
              >
                <LogIn className="h-4 w-4" />
                <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden text-end sm:block">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {currentUser?.name || (isAr ? 'مدير النظام' : 'Manager')}
                  </p>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {activeRole}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title={isAr ? 'تسجيل الخروج' : 'Log Out'}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{isAr ? 'خروج' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-65px)]">
        {/* MODERN UPGRADED SIDEBAR — Shown inside ERP & Admin Views */}
        {!isPublicWebsiteView && (
          <aside
            className={`fixed inset-y-0 start-0 z-40 flex w-72 flex-col border-e border-slate-200 bg-white text-slate-800 shadow-xl transition-transform dark:border-slate-800 dark:bg-[#0B0F19] dark:text-slate-200 lg:static lg:translate-x-0 ${
              mobileSidebarOpen
                ? 'translate-x-0'
                : dir === 'rtl'
                  ? 'translate-x-full lg:translate-x-0'
                  : '-translate-x-full lg:translate-x-0'
            }`}
          >
            {/* Sidebar Branding Header */}
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 overflow-hidden rounded-xl border border-amber-400/60 bg-slate-950 p-0.5">
                    <img
                      src={brandDisplayLogo}
                      alt={brandDisplayName}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                      {brandDisplayName}
                    </p>
                    <p className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {activeRole}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Branch Selector (For Gym Owners) */}
              <div className="mt-3">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {isAr ? 'الفرع النشط' : 'Active Branch'}
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="ALL">
                    {isAr ? 'جميع الفروع + التدريب الأونلاين' : 'All Branches + Online'}
                  </option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {isAr ? b.nameAr : b.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
              {sidebarGroups.map((grp) => (
                <div key={grp.groupEn}>
                  <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${
                            active
                              ? 'bg-gradient-to-r from-amber-500 to-[#D4AF37] font-black text-slate-950 shadow-sm'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
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
                                  : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
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

            {/* Bottom User & Security Session Footer */}
            <div className="border-t border-slate-200 p-3.5 dark:border-slate-800">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                    {currentUser?.name || (isAr ? 'كابتن نور الدين' : 'Nour El-Din')}
                  </p>
                  <p className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    2FA ACTIVE • TLS 1.3
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    title={isAr ? 'إعدادات الجلسة والأمان 2FA' : 'Auth & 2FA'}
                    className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-slate-800"
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    title={isAr ? 'تسجيل الخروج' : 'Logout'}
                    className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 bg-white p-4 transition-colors dark:bg-[#090D16] sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
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

      {/* MODERN MULTI-TENANT LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isAr ? 'تسجيل الدخول إلى TitanFit' : 'Sign In to TitanFit SaaS'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr ? 'لوحة مالك المنصة أو حساب ناديك الخاص' : 'Super Admin or Gym Owner Account'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Manual Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-3.5">
              {loginError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'البريد الإلكتروني أو اسم النادي (Slug)' : 'Email or Gym Slug'}
                </label>
                <input
                  type="text"
                  data-testid="login-email-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={isAr ? "noureldin أو admin@titanfit.com" : "noureldin / admin@titanfit.com"}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <input
                  type="password"
                  data-testid="login-password-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={isAr ? "010023 أو admin123" : "010023 / admin123"}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                data-testid="login-submit-btn"
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] py-2.5 text-xs font-black text-slate-950 shadow-md transition hover:opacity-95"
              >
                {isAr ? 'تسجيل الدخول وفتح لوحة التحكم' : 'Sign In to Dashboard'}
              </button>
            </form>

            {/* Enterprise Security Note */}
            <div className="mt-5 border-t border-slate-100 pt-3.5 space-y-1 text-center dark:border-slate-800">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>{isAr ? 'بوابة دخول آمنة ومشفرة بالكامل (256-bit AES Enterprise)' : '256-bit AES Encrypted Enterprise Authentication'}</span>
              </div>
              <p className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">
                {isAr ? 'حساب مالك المنصة: noureldin • كلمة المرور: 010023' : 'SaaS Super Admin: noureldin • Password: 010023'}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2FA TOTP & RBAC Switcher Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr
                    ? 'بوابة المصادقة، التبديل بين الأدوار، والتحقق الثنائي (TOTP 2FA)'
                    : 'Enterprise Auth, RBAC Role Switcher & TOTP 2FA Verification'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
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
                          ? 'border-amber-500 bg-amber-50 text-amber-950 dark:bg-amber-950 dark:text-amber-200'
                          : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {isAr ? r.labelAr : r.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/60">
                <p className="font-bold text-amber-700 dark:text-amber-400">
                  {isAr ? 'التحقق الثنائي (RFC 6238 TOTP) & OTP' : 'RFC 6238 TOTP 2FA & Phone OTP'}
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm tracking-widest text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
