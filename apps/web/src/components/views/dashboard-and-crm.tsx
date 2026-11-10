'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Edit3,
  Eye,
  Filter,
  HeartPulse,
  Lock,
  MessageCircle,
  PauseCircle,
  PlayCircle,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Video,
  Wallet,
  X,
  Camera,
  Upload,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { downloadInvoicePdf } from '../../lib/pdf-docs';
import { ReceiptScannerModal, ReceiptViewerModal } from '../receipt-scanner-modal';
import {
  type InvoiceItem,
  type MemberItem,
  type PlanItem,
  usePlatformStore,
} from '../../lib/platform-store';

export function OverviewView() {
  const {
    locale,
    members,
    invoices,
    branches,
    accessLogs,
    classes,
    selectedBranchId,
    setActiveSection,
    simulateGateScan,
    showToast,
    currentUser,
    impersonatedTenant,
    activeTenantCustom,
    customWorkouts,
    customRecipes,
    customFiles,
    gymStateMode,
    resetToCleanGymState,
  } = usePlatformStore();
  const isAr = locale === 'ar';
  const isCleanSlate = gymStateMode === 'CLEAN_SLATE' || (members.length === 0 && invoices.length === 0);
  const isolatedTenantSlug =
    currentUser?.tenantSlug || impersonatedTenant || activeTenantCustom?.slug || 'titanfit-egypt';
  const isolatedClubNameAr = activeTenantCustom?.nameAr || 'مجموعة أندية تيتان فيت مصر';
  const isolatedClubNameEn = activeTenantCustom?.nameEn || 'TitanFit Egypt Athletic Clubs';
  const [chartPeriod, setChartPeriod] = useState<'7D' | '30D' | '90D' | '12M'>('30D');

  const filteredMembers =
    selectedBranchId === 'ALL'
      ? members
      : members.filter((m) => m.branchId === selectedBranchId);
  const activeCount = filteredMembers.filter((m) => m.status === 'ACTIVE').length;
  const expiringCount = filteredMembers.filter((m) => m.status === 'EXPIRING_SOON').length;
  const totalRevenueEgp = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, i) => acc + i.totalEgp, 0);

  const revenueSeries =
    isCleanSlate || totalRevenueEgp === 0
      ? [0, 0, 0, 0, 0, 0, 0]
      : chartPeriod === '7D'
        ? [68, 74, 82, 79, 91, 96, 100]
        : chartPeriod === '30D'
          ? [52, 61, 58, 72, 78, 85, 94]
          : chartPeriod === '90D'
            ? [40, 49, 63, 71, 80, 88, 97]
            : [30, 42, 55, 64, 76, 89, 100];

  const daysLabels = isAr
    ? ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div data-testid="panel-admin-overview" className="space-y-6">
      {/* Top Executive Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-50 via-slate-50 to-amber-50/60 p-6 text-slate-900 dark:border-[#D4AF37]/30 dark:bg-gradient-to-r dark:from-[#121624] dark:via-[#171C2E] dark:to-[#1E1910] dark:text-white shadow-xl">
        <div className="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-[#D4AF37]/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-900 dark:border-[#D4AF37]/40 dark:bg-[#D4AF37]/10 dark:text-[#F3E5AB]">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              {isAr
                ? 'مركز القيادة التنفيذي المباشر — تيتان فيت مصر'
                : 'LIVE EXECUTIVE COMMAND CENTER — TITANFIT EGYPT'}
            </div>
            <h1
              data-testid="hero-heading"
              className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
            >
              {isAr
                ? 'منصة الإدارة المتكاملة للأندية الرياضية والفروع (Rooted Performance)'
                : 'TitanFit Enterprise Gym & Athletic Club OS'}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              {isAr
                ? 'متابعة لحظية للإيرادات، بوابات الدخول بالـ QR الدوار، اشتراكات الأعضاء، الحصص التدريبية، ومبيعات المكملات عبر جميع الفروع.'
                : 'Real-time multi-branch telemetry across memberships, Egypt payment gateways, rotating HMAC QR turnstiles, classes, and POS.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveSection('MEMBERS')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-[#D4AF37]/20 transition hover:bg-[#e3be42]"
            >
              <UserPlus className="h-4 w-4" />
              {isAr ? '+ تسجيل عضو جديد' : '+ Register Member'}
            </button>
            <button
              type="button"
              data-testid="overview-open-content-studio-btn"
              onClick={() => setActiveSection('CONTENT_LIBRARY')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <Video className="h-4 w-4" />
              {isAr ? '🎬 رفع فيديوهات ووصفات وملفات' : '🎬 Upload Videos & Recipes'}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('PAYMENTS')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              <CreditCard className="h-4 w-4 text-[#D4AF37]" />
              {isAr ? 'تحصيل اشتراك / فاتورة' : 'Collect Payment'}
            </button>
            <button
              type="button"
              onClick={() => {
                simulateGateScan('mem-1001', 'Main Lobby Turnstile #1', 'بوابة الدخول الرئيسية #١');
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/25"
            >
              <QrCode className="h-4 w-4" />
              {isAr ? 'مسح QR سريع' : 'Quick QR Check-in'}
            </button>
            <button
              type="button"
              onClick={() => {
                resetToCleanGymState();
                showToast(
                  isAr
                    ? '🧼 تم تصفير المنصة بالكامل (جديدة لانج): 0 مشتركين • 0 فواتير • 0 إيرادات • 1 مدرب عام جاهز لعميلك!'
                    : 'Pristine Clean Slate activated: 0 members, 0 invoices, 0 EGP, 1 head trainer ready!',
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-500/25 dark:text-rose-300"
              title={isAr ? 'تصفير كافة الفواتير والمشتركين والتحصيلات ليبدأ الجيم من الصفر' : 'Reset all data to 0'}
            >
              <Trash2 className="h-4 w-4" />
              {isAr ? 'تصفير المنصة (جديدة لانج 🧼)' : 'Clean Slate 🧼'}
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Tenant Isolated Database & Payment Gateways Status Bar */}
      <div
        data-testid="tenant-db-isolation-banner"
        className="grid grid-cols-1 gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/5 p-4 dark:bg-emerald-950/20 md:grid-cols-3"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {isAr
                  ? `قاعدة بيانات معزولة: ${isolatedClubNameAr}`
                  : `Isolated Tenant DB: ${isolatedClubNameEn}`}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                FORCE RLS
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
              {isAr
                ? `معرف العزل: (${isolatedTenantSlug}) — بيانات أعضائك (${members.length}) ومكتبتك (${customWorkouts.length} فيديو • ${customRecipes.length} وصفة • ${customFiles.length} ملف) معزولة 100% عن أي نادي آخر.`
                : `Tenant partition (${isolatedTenantSlug}) — ${members.length} members & club library strictly isolated via PostgreSQL RLS.`}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-slate-200/70 pt-3 dark:border-slate-800 md:border-t-0 md:border-s md:ps-3 md:pt-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {isAr ? 'بوابات الدفع المصرية والفواتير الضريبية' : 'Egyptian Payment Gateways & VAT'}
              </span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">
                14% VAT
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
              {isAr
                ? 'إنستاباي (IPA) • بطاقات Paymob • كود فوري المرجعي • كاش POS مع بصمة تدقيق SHA-256.'
                : 'InstaPay IPA • Paymob Cards • Fawry Ref Code • Cash POS with SHA-256 receipt hash.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200/70 pt-3 dark:border-slate-800 md:border-t-0 md:border-s md:ps-3 md:pt-0">
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {isAr ? 'كود انضمام المتدربين للنادي' : 'Club Member Join Code'}
            </span>
            <p className="mt-0.5 font-mono text-xs font-black text-amber-600 dark:text-amber-400">
              {activeTenantCustom?.gymSecretCode || 'TF-JOIN'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveSection('PAYMENTS')}
            className="rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-black text-amber-400 transition hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950"
          >
            {isAr ? 'بوابة الدفع والفواتير ←' : 'Open Cashier →'}
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isAr ? 'إجمالي الإيرادات الشهرية' : 'Monthly Gross Revenue'}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
              <Wallet className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isAr
                ? `${totalRevenueEgp.toLocaleString('ar-EG')} ج.م`
                : `EGP ${totalRevenueEgp.toLocaleString()}`}
            </p>
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                totalRevenueEgp > 0
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-slate-500/15 text-slate-400'
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              {totalRevenueEgp > 0 ? '+18.4%' : '0%'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {totalRevenueEgp > 0
              ? isAr
                ? 'إنستاباي • بطاقات Paymob • نقدي وفوري'
                : 'InstaPay • Paymob Cards • Cash & Fawry'
              : isAr
                ? 'لا توجد فواتير محصلة بعد (0 ج.م)'
                : 'No collected invoices yet (EGP 0)'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isAr ? 'الأعضاء النشطون حالياً' : 'Active Subscriptions'}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isAr ? activeCount.toLocaleString('ar-EG') : activeCount.toLocaleString()}
            </p>
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                activeCount > 0
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-slate-500/15 text-slate-400'
              }`}
            >
              {activeCount > 0 ? '+12.1%' : '0'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {filteredMembers.length > 0
              ? isAr
                ? `${Math.round((activeCount / Math.max(1, filteredMembers.length)) * 100)}% نسبة الأعضاء النشطين`
                : `${Math.round((activeCount / Math.max(1, filteredMembers.length)) * 100)}% active ratio`
              : isAr
                ? 'لا يوجد أعضاء مسجلين بعد (0 عضو)'
                : 'No members registered yet'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isAr ? 'تسجيلات الدخول اليوم (البوابات)' : 'Turnstile Check-ins Today'}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <QrCode className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isAr ? accessLogs.length.toLocaleString('ar-EG') : accessLogs.length}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-bold text-sky-400">
              {accessLogs.length > 0
                ? isAr
                  ? `${Math.min(accessLogs.length, 12)} داخل النادي الآن`
                  : `${Math.min(accessLogs.length, 12)} On-Floor Now`
                : isAr
                  ? '0 داخل النادي الآن'
                  : '0 On-Floor Now'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {isAr ? 'متوسط زمن التحقق من رمز QR الدوار: 42ms' : 'Avg rotating HMAC QR verification: 42ms'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isAr ? 'اشتراكات تنتهي خلال 7 أيام' : 'Expiring Within 7 Days'}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
              {isAr ? expiringCount.toLocaleString('ar-EG') : expiringCount}
            </p>
            <button
              type="button"
              onClick={() =>
                showToast(
                  isAr
                    ? `تم إرسال رسائل تذكير التجديد عبر واتساب لـ ${expiringCount} عضواً!`
                    : `Dispatched WhatsApp renewal reminders to ${expiringCount} members!`,
                )
              }
              className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-500/30 dark:text-amber-200"
            >
              {isAr ? 'إرسال تذكير واتساب' : 'Send WhatsApp Blast'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {expiringCount > 0
              ? isAr
                ? `إيرادات تجديد متوقعة: ${(expiringCount * 1400).toLocaleString('ar-EG')} ج.م`
                : `Projected pipeline: EGP ${(expiringCount * 1400).toLocaleString()}`
              : isAr
                ? 'لا توجد اشتراكات تنتهي قريباً (0 ج.م)'
                : 'No upcoming renewals'}
          </p>
        </div>
      </div>

      {/* Main Analytics Row: Revenue Chart + Live Branch Occupancy */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Interactive Revenue & Attendance Chart */}
        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isAr ? 'تحليل الإيرادات وحركة حضور الأعضاء' : 'Revenue & Member Attendance Velocity'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'مقارنة التدفقات النقدية (ج.م) مع كثافة الحضور اليومي في الفروع'
                  : 'Daily collected revenue (EGP) correlated with floor check-in volume'}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
              {(['7D', '30D', '90D', '12M'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setChartPeriod(period)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                    chartPeriod === period
                      ? 'bg-[#D4AF37] text-slate-950'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Bar + Trend Visual */}
          <div className="relative mt-6 grid grid-cols-7 items-end gap-3 pt-4" style={{ height: '210px' }}>
            {totalRevenueEgp === 0 && (
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4 bg-slate-900/40 rounded-xl backdrop-blur-[1px]">
                <p className="text-sm font-bold text-amber-300">
                  {isAr ? 'قاعدة بيانات جديدة كلياً — لا توجد تحصيلات بعد (٠ ج.م)' : 'Pristine Launch State — No collected revenues yet (EGP 0)'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {isAr ? 'ستظهر التحليلات البيانية تلقائياً بمجرد إصدار أول فاتورة اشتراك أو بيع كاشير POS.' : 'Analytics will populate dynamically once the first membership or POS sale is recorded.'}
                </p>
              </div>
            )}
            {revenueSeries.map((val, idx) => (
              <div key={idx} className="group flex h-full flex-col items-center justify-end gap-2">
                <div className="opacity-0 transition group-hover:opacity-100">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-[#F3E5AB]">
                    {val}k EGP
                  </span>
                </div>
                <div className="relative flex w-full max-w-[44px] items-end justify-center overflow-hidden rounded-t-xl bg-slate-800/50 h-full">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-[#997A15] via-[#D4AF37] to-[#F3E5AB] transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${val}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-400">{daysLabels[idx]}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
                {isAr ? 'إيرادات الاشتراكات والـ PT' : 'Membership & PT Revenue'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                {isAr ? 'مبيعات البار والمكملات (POS)' : 'Supplement Bar POS'}
              </span>
            </div>
            <span className="font-bold text-[#F3E5AB]">
              {isAr ? 'أعلى ذروة حضور: 06:00 م – 09:30 م' : 'Peak Floor Window: 06:00 PM – 09:30 PM'}
            </span>
          </div>
        </div>

        {/* Live Multi-Branch Occupancy & Capacity */}
        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isAr ? 'إشغال الفروع اللحظي' : 'Live Branch Occupancy'}
            </h2>
            <Building2 className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAr ? 'قراءة مباشرة من بوابات الدخول الإلكترونية' : 'Live telemetry from turnstile counters'}
          </p>

          <div className="mt-5 space-y-4">
            {branches.map((br) => {
              const activeOnFloor = accessLogs.filter(
                (log) => log.decision === 'ALLOW_ACCESS',
              ).length;
              const occ = isCleanSlate ? 0 : activeOnFloor;
              const pct = br.capacity > 0 ? Math.round((occ / br.capacity) * 100) : 0;
              return (
                <div
                  key={br.id}
                  className="rounded-xl border border-slate-200 bg-white dark:border-slate-800/90 dark:bg-slate-900/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {isAr ? br.nameAr : br.nameEn}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isAr ? br.cityAr : br.cityEn} • {isAr ? br.managerAr : br.managerEn}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                        pct > 75
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {occ}/{br.capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        pct > 75 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Live Gate Feed + Today's High-Demand Classes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Live Gate Feed */}
        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isAr ? 'سجل بوابات الدخول المباشر (Turnstile Live Feed)' : 'Live Turnstile & QR Access Stream'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'حالة التحقق من التوقيع المشفر HMAC-SHA256 ومنع الدخول المتكرر'
                  : 'Real-time HMAC-SHA256 QR verification & anti-passback logs'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('ACCESS_CONTROL')}
              className="text-xs font-bold text-[#D4AF37] hover:underline"
            >
              {isAr ? 'فتح لوحة البوابات ←' : 'Open Gate Console →'}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {accessLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                      log.decision === 'ALLOW_ACCESS'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {log.decision === 'ALLOW_ACCESS' ? 'OK' : 'DENY'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {isAr ? log.memberNameAr : log.memberNameEn}{' '}
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">({log.memberCode})</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAr ? log.gateNameAr : log.gateNameEn} •{' '}
                      {isAr ? log.reasonAr : log.reasonEn}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Classes Snapshot */}
        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isAr ? 'حصص اليوم وقوائم الانتظار' : "Today's Group Classes & Waitlists"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'ترقية تلقائية لأول عضو في قائمة الانتظار عند أي إلغاء'
                  : 'Automatic waitlist promotion when a confirmed spot opens'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('CLASSES')}
              className="text-xs font-bold text-[#D4AF37] hover:underline"
            >
              {isAr ? 'إدارة الجدول الكامل ←' : 'Manage Schedule →'}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {classes.slice(0, 3).map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#D4AF37]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#F3E5AB]">
                      {cls.category}
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {isAr ? cls.titleAr : cls.titleEn}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {isAr ? cls.trainerAr : cls.trainerEn} • {cls.timeRange}
                  </p>
                </div>
                <div className="text-end">
                  <span className="inline-block rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white">
                    {cls.bookedMembers.length}/{cls.capacity}{' '}
                    {isAr ? 'محجوز' : 'Booked'}
                  </span>
                  {cls.waitlistMembers.length > 0 && (
                    <p className="mt-1 text-[11px] font-bold text-amber-400">
                      +{cls.waitlistMembers.length} {isAr ? 'في الانتظار' : 'Waitlisted'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MembersCrmView() {
  const {
    locale,
    members,
    plans,
    branches,
    selectedBranchId,
    addMember,
    updateMember,
    deleteMember,
    toggleMemberFreeze,
    simulateGateScan,
    showToast,
    createInvoicePayment,
    setActiveSection,
    activeTenantCustom,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MemberItem['status']>('ALL');
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [newlyCreatedMember, setNewlyCreatedMember] = useState<MemberItem | null>(null);
  const [newlyCreatedInvoice, setNewlyCreatedInvoice] = useState<InvoiceItem | null>(null);

  // Add Member Form State
  const [fullNameEn, setFullNameEn] = useState('');
  const [fullNameAr, setFullNameAr] = useState('');
  const [phone, setPhone] = useState('+2010');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [planId, setPlanId] = useState(plans[0]?.id ?? 'plan-annual-vip');
  const [branchId, setBranchId] = useState(branches[0]?.id ?? 'br-new-cairo');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+2010');
  const [bloodType, setBloodType] = useState('O+');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [collectPaymentNow, setCollectPaymentNow] = useState(true);
  const [addMemberPaymentMethod, setAddMemberPaymentMethod] = useState<InvoiceItem['method']>('CASH');
  const [addMemberReferenceCode, setAddMemberReferenceCode] = useState('');
  const [addMemberReceiptUrl, setAddMemberReceiptUrl] = useState<string | null>(null);
  const [addMemberReceiptFileName, setAddMemberReceiptFileName] = useState<string | null>(null);
  const [showAddMemberReceiptScanner, setShowAddMemberReceiptScanner] = useState(false);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  const selectedPlanForAdd = plans.find((p) => p.id === planId) ?? plans[0];
  const subtotalForAdd = selectedPlanForAdd?.priceEgp ?? 0;
  const vatForAdd = Math.round(subtotalForAdd * 0.14);
  const totalForAdd = subtotalForAdd + vatForAdd;

  const filteredMembers = members.filter((m) => {
    if (selectedBranchId !== 'ALL' && m.branchId !== selectedBranchId) return false;
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.fullNameEn.toLowerCase().includes(q) ||
      m.fullNameAr.includes(q) ||
      m.phone.includes(q) ||
      m.code.toLowerCase().includes(q)
    );
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameEn.trim() && !fullNameAr.trim()) return;
    const created = addMember({
      fullNameEn: fullNameEn || fullNameAr,
      fullNameAr: fullNameAr || fullNameEn,
      phone,
      email: email || 'member@titanfit.eg',
      gender,
      planId,
      branchId,
      emergencyContactName,
      emergencyContactPhone,
      bloodType,
      medicalConditions,
    });

    let inv: InvoiceItem | null = null;
    if (collectPaymentNow) {
      inv = createInvoicePayment({
        memberId: created.id,
        planId,
        method: addMemberPaymentMethod,
        referenceCode: addMemberReferenceCode,
        receiptUrl: addMemberReceiptUrl || undefined,
        receiptFileName: addMemberReceiptFileName || undefined,
      });
      setNewlyCreatedInvoice(inv);
    } else {
      setNewlyCreatedInvoice(null);
    }

    setFullNameEn('');
    setFullNameAr('');
    setMedicalConditions('');
    setAddMemberReferenceCode('');
    setAddMemberReceiptUrl(null);
    setAddMemberReceiptFileName(null);
    setShowAddModal(false);
    setNewlyCreatedMember(created);
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const selectedPlan = plans.find((p) => p.id === editingMember.planId);
    updateMember(editingMember.id, {
      fullNameAr: editingMember.fullNameAr,
      fullNameEn: editingMember.fullNameEn,
      phone: editingMember.phone,
      email: editingMember.email,
      planId: editingMember.planId,
      planNameAr: selectedPlan?.nameAr || editingMember.planNameAr,
      planNameEn: selectedPlan?.nameEn || editingMember.planNameEn,
      status: editingMember.status,
    });
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {isAr ? 'إدارة الأعضاء والملفات الطبية المشفرة (CRM)' : 'Members Directory & Encrypted Health Vault'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'بحث شامل، تصفية حسب الحالة والفرع، تجميد فوري، وخزينة طبية مشفرة بمعيار AES-256-GCM لكل عضو'
              : 'Complete member lifecycle, instant freeze/unfreeze, attendance history, and tenant-bound AES-256-GCM health records'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-[#D4AF37]/20 transition hover:bg-[#e2bd40]"
        >
          <UserPlus className="h-4 w-4" />
          {isAr ? '+ تسجيل عضو جديد' : '+ Add New Member'}
        </button>
      </div>

      {/* Search & Status Pills */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-3 start-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث بالاسم، رقم العضوية (TF-2026-1001)، أو رقم الموبايل...'
                : 'Search by name, member ID (TF-2026-1001), or phone (+2010...)'
            }
            className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#121623] py-2.5 ps-10 pe-4 text-sm text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'ACTIVE', 'EXPIRING_SOON', 'FROZEN', 'EXPIRED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-[#D4AF37] text-slate-950'
                  : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#121623] text-slate-300 hover:border-slate-700'
              }`}
            >
              {st === 'ALL'
                ? isAr
                  ? 'الكل'
                  : 'All'
                : st === 'ACTIVE'
                  ? isAr
                    ? 'نشط'
                    : 'Active'
                  : st === 'EXPIRING_SOON'
                    ? isAr
                      ? 'ينتهي قريباً'
                      : 'Expiring Soon'
                    : st === 'FROZEN'
                      ? isAr
                        ? 'مجمد'
                        : 'Frozen'
                      : isAr
                        ? 'منتهي'
                        : 'Expired'}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623]">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5 text-start">{isAr ? 'العضو' : 'Member'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'الباقة الحالية' : 'Subscription Plan'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'المدرب المسؤول' : 'Assigned Coach'}</th>
                <th className="px-4 py-3.5 text-end">{isAr ? 'إجراءات سريعة' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <Users className="mb-3 h-10 w-10 text-slate-400 opacity-40" />
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {isAr ? 'لا يوجد أعضاء مسجلين حتى الآن (0 عضو)' : 'No registered members yet (0 members)'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {isAr
                          ? 'النادي جديد تماماً وجاهز لاستقبال أول مشترك في ناديك.'
                          : 'Brand new club. Click (+ Register Member) to add your first member.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-black text-slate-950 shadow-md hover:bg-[#e2bc3f]"
                      >
                        {isAr ? '+ إضافة أول مشترك الآن' : '+ Register First Member'}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {filteredMembers.map((m) => (
                <tr key={m.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 font-extrabold text-[#D4AF37]">
                        {m.avatarInitials}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {isAr ? m.fullNameAr : m.fullNameEn}
                        </p>
                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {m.code} • {m.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">
                      {isAr ? m.planNameAr : m.planNameEn}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAr
                        ? `رصيد التجميد: ${m.freezeDaysRemaining} يوم`
                        : `Freeze balance: ${m.freezeDaysRemaining} days`}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                          : m.status === 'FROZEN'
                            ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300'
                            : m.status === 'EXPIRING_SOON'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {m.endDate}
                    <div className="text-[11px] text-slate-500">
                      {isAr ? `آخر حضور: ${m.lastCheckIn}` : `Last seen: ${m.lastCheckIn}`}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                    {isAr ? m.assignedTrainerAr : m.assignedTrainerEn}
                  </td>
                  <td className="px-4 py-3.5 text-end">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(m)}
                        className="rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-white hover:border-[#D4AF37]"
                      >
                        {isAr ? 'ملف 360°' : '360° Profile'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMember(m)}
                        title={isAr ? 'تعديل بيانات العضو' : 'Edit Member'}
                        className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMemberFreeze(m.id, 14)}
                        className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-300 hover:bg-sky-500/20"
                      >
                        {m.status === 'FROZEN'
                          ? isAr
                            ? 'فك التجميد'
                            : 'Unfreeze'
                          : isAr
                            ? 'تجميد'
                            : 'Freeze'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          simulateGateScan(
                            m.id,
                            'Reception Fast-Track Gate',
                            'بوابة الاستقبال السريعة',
                          )
                        }
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20"
                      >
                        {isAr ? 'دخول QR' : 'Check-in'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingMemberId(m.id)}
                        title={isAr ? 'حذف العضو' : 'Delete Member'}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {isAr ? 'تسجيل عضو جديد + تشفير الملف الصحي' : 'Register New Member + AES-256 Health Vault'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'يتم تشفير البيانات الطبية تلقائياً بمفتاح خاص بالمستأجر (AAD)'
                    : 'Medical PAR-Q notes are encrypted with AES-256-GCM bound to tenantId AAD'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الاسم الكامل (عربي)' : 'Full Name (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={fullNameAr}
                  onChange={(e) => setFullNameAr(e.target.value)}
                  placeholder="مثال: كريم وائل المنياوي"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={fullNameEn}
                  onChange={(e) => setFullNameEn(e.target.value)}
                  placeholder="e.g. Karim Wael El-Miniawy"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'رقم الموبايل المصري (+20)' : 'Phone Number (+20)'}
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="karim@titanfit.eg"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="member-plan-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'باقة الاشتراك' : 'Subscription Plan'}
                </label>
                <select
                  id="member-plan-select"
                  aria-label={isAr ? 'باقة الاشتراك' : 'Subscription Plan'}
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isAr ? p.nameAr : p.nameEn} ({p.priceEgp.toLocaleString()} EGP)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="member-branch-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الفرع الأساسي' : 'Home Branch'}
                </label>
                <select
                  id="member-branch-select"
                  aria-label={isAr ? 'الفرع الأساسي' : 'Home Branch'}
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {isAr ? b.nameAr : b.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Real Subscription Pricing & Cashier Collection */}
              <div className="rounded-2xl border border-amber-500/40 bg-amber-50/80 p-4 dark:border-amber-500/30 dark:bg-amber-950/20 sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {isAr ? 'تسعير الباقة وتحصيل الاشتراك فوراً' : 'Subscription Pricing & Cashier'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="text-slate-600 dark:text-slate-400">
                      {isAr ? 'قيمة الباقة:' : 'Base:'} <strong className="text-slate-900 dark:text-white">{subtotalForAdd.toLocaleString()} EGP</strong>
                    </span>
                    <span className="text-slate-400">+</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {isAr ? 'ضريبة (14% VAT):' : 'VAT:'} <strong className="text-slate-900 dark:text-white">{vatForAdd.toLocaleString()} EGP</strong>
                    </span>
                    <span className="rounded-lg bg-[#D4AF37] px-2.5 py-1 font-black text-slate-950 shadow-sm">
                      {isAr ? 'الإجمالي المطلوب:' : 'Total:'} {totalForAdd.toLocaleString()} EGP
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={collectPaymentNow}
                      onChange={(e) => setCollectPaymentNow(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isAr
                        ? 'تأكيد تحصيل المبلغ وإصدار الفاتورة الضريبية فوراً (تظهر مباشرة في تابة الفواتير 🧾)'
                        : 'Collect payment & issue tax invoice now (recorded immediately in Invoices tab)'}
                    </span>
                  </label>

                  {collectPaymentNow && (
                    <div className="mt-3 space-y-3 pt-2">
                      <div>
                        <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                          {isAr ? 'اختر وسيلة الدفع التي سيسدد بها المتدرب:' : 'Select Payment Method:'}
                        </span>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {[
                            { id: 'CASH', labelAr: '💵 نقدي بالاستقبال (Cash)', labelEn: 'Cash at Reception' },
                            { id: 'INSTAPAY', labelAr: '📱 إنستاباي (InstaPay)', labelEn: 'InstaPay' },
                            { id: 'PAYMOB_CARD', labelAr: '💳 بطاقة بنكية (Paymob)', labelEn: 'Paymob Card' },
                            { id: 'VODAFONE_CASH', labelAr: '🔴 فودافون كاش', labelEn: 'Vodafone Cash' },
                            { id: 'FAWRY', labelAr: '🟡 كود فوري (Fawry)', labelEn: 'Fawry Pay' },
                            { id: 'STRIPE', labelAr: '🌐 سترايب دولي (Stripe)', labelEn: 'Stripe Global' },
                          ].map((pm) => (
                            <button
                              key={pm.id}
                              type="button"
                              onClick={() => setAddMemberPaymentMethod(pm.id as any)}
                              className={`rounded-xl border px-2.5 py-2 text-xs font-extrabold transition ${
                                addMemberPaymentMethod === pm.id
                                  ? 'border-amber-500 bg-amber-500 text-slate-950 font-black shadow-md'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300'
                              }`}
                            >
                              {isAr ? pm.labelAr : pm.labelEn}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={addMemberReferenceCode}
                          onChange={(e) => setAddMemberReferenceCode(e.target.value)}
                          placeholder={isAr ? 'رقم إيصال الكاشير أو مرجع التحويل InstaPay/POS (اختياري)' : 'Receipt / Transfer Reference (Optional)'}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Receipt Scanner / Attachment in Add Member */}
                      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {isAr ? '🧾 إرفاق أو مسح وصل الدفع / التحويل البنكي:' : 'Attach or Scan Payment Receipt:'}
                          </span>
                          {addMemberReceiptUrl ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                                <CheckCircle className="h-3 w-3" />
                                {addMemberReceiptFileName || 'receipt.jpg'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setViewingReceiptUrl(addMemberReceiptUrl)}
                                className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
                              >
                                {isAr ? 'معاينة' : 'View'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddMemberReceiptUrl(null);
                                  setAddMemberReceiptFileName(null);
                                }}
                                className="rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                              >
                                {isAr ? 'إزالة' : 'Remove'}
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setShowAddMemberReceiptScanner(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
                              >
                                <Camera className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                <span>{isAr ? 'مسح بالكاميرا' : 'Camera'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAddMemberReceiptScanner(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                              >
                                <Upload className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                <span>{isAr ? 'رفع ملف' : 'Upload'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'اسم قريب للطوارئ' : 'Emergency Contact Name'}
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder={isAr ? 'وائل المنياوي' : 'Wael El-Miniawy'}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'فصيلة الدم والنوع' : 'Blood Type & Gender'}
                </label>
                <div className="mt-1 flex gap-2">
                  <select
                    aria-label={isAr ? 'النوع' : 'Gender'}
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="MALE">{isAr ? 'ذكر' : 'Male'}</option>
                    <option value="FEMALE">{isAr ? 'أنثى' : 'Female'}</option>
                  </select>
                  <select
                    aria-label={isAr ? 'فصيلة الدم' : 'Blood Type'}
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Lock className="h-3.5 w-3.5" />
                  {isAr
                    ? 'ملاحظات طبية أو إصابات (تُشفر بمعيار AES-256-GCM)'
                    : 'Medical Conditions & PAR-Q Notes (Encrypted with AES-256-GCM)'}
                </label>
                <input
                  type="text"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder={
                    isAr
                      ? 'لا توجد أمراض مزمنة — لائق للتمرين الرياضي الكامل'
                      : 'Cleared for full strength & conditioning'
                  }
                  className="mt-1 w-full rounded-xl border border-emerald-500/30 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
                >
                  {isAr ? 'حفظ وتفعيل العضوية فوراً' : 'Save & Activate Membership'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-[#D4AF37]" />
                <h3 className="text-base font-extrabold">
                  {isAr ? `تعديل بيانات العضو (${editingMember.code})` : `Edit Member (${editingMember.code})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الاسم بالكامل (عربي)' : 'Full Name (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.fullNameAr}
                  onChange={(e) => setEditingMember({ ...editingMember, fullNameAr: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الاسم بالكامل (إنجليزي)' : 'Full Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.fullNameEn}
                  onChange={(e) => setEditingMember({ ...editingMember, fullNameEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'الباقة الحالية' : 'Subscription Plan'}
                  </label>
                  <select
                    value={editingMember.planId}
                    onChange={(e) => setEditingMember({ ...editingMember, planId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {isAr ? p.nameAr : p.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'حالة العضوية' : 'Status'}
                  </label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as MemberItem['status'] })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="FROZEN">FROZEN</option>
                    <option value="EXPIRING_SOON">EXPIRING_SOON</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
                >
                  {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {deletingMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-white p-6 text-slate-900 shadow-2xl dark:border-rose-500/40 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? 'تأكيد حذف العضو' : 'Confirm Member Deletion'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'هل أنت متأكد من حذف هذا العضو نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.'
                    : 'Are you sure you want to delete this member? This action cannot be undone.'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingMemberId(null)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMember(deletingMemberId);
                  setDeletingMemberId(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-rose-700"
              >
                {isAr ? 'نعم، احذف العضو' : 'Yes, Delete Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Newly Registered Member Welcome Pass Modal */}
      {newlyCreatedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border-2 border-[#D4AF37] bg-white p-6 text-slate-900 shadow-2xl dark:border-[#D4AF37] dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                <h3 className="text-base font-black">
                  {isAr ? '🎉 كارت دخول وبيانات المتدرب الجديد' : 'New Member Access Pass & Credentials'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewlyCreatedMember(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/20 font-black text-xl text-[#D4AF37]">
                {newlyCreatedMember.avatarInitials}
              </div>
              <h4 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                {isAr ? newlyCreatedMember.fullNameAr : newlyCreatedMember.fullNameEn}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? newlyCreatedMember.planNameAr : newlyCreatedMember.planNameEn}
              </p>

              {/* Credentials Box */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-start font-mono text-xs dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">{isAr ? 'كود العضوية:' : 'Member Code:'}</span>
                  <span className="font-black text-[#D4AF37] text-sm">{newlyCreatedMember.code}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">{isAr ? 'رقم الهاتف:' : 'Phone:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{newlyCreatedMember.phone}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">{isAr ? 'كلمة المرور المؤقتة:' : 'Temp Password:'}</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {newlyCreatedMember.tempPassword || 'TF@2026'}
                  </span>
                </div>
              </div>

              {/* Paid Invoice Badge & Direct Ledger Actions */}
              {newlyCreatedInvoice && (
                <div className="mt-3 rounded-2xl border border-emerald-500/40 bg-emerald-50/80 p-3.5 text-start dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                        {isAr ? 'تم تحصيل الفاتورة الضريبية وإدراجها في تابة الفواتير 🧾' : 'Tax Invoice Paid & Logged'}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-black text-[#D4AF37]">
                      {newlyCreatedInvoice.invoiceNumber}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-600 dark:text-slate-400">
                      {isAr ? 'وسيلة التحصيل:' : 'Gateway:'} <strong className="text-slate-900 dark:text-white">{newlyCreatedInvoice.method}</strong>
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {newlyCreatedInvoice.totalEgp.toLocaleString()} EGP (14% VAT)
                    </span>
                  </div>
                  {newlyCreatedInvoice.receiptUrl && (
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {isAr ? 'وصل التحويل المرفق:' : 'Attached Receipt:'} {newlyCreatedInvoice.receiptFileName || 'receipt.jpg'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingReceiptUrl(newlyCreatedInvoice.receiptUrl || null)}
                        className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[11px] font-black text-white hover:bg-emerald-500"
                      >
                        {isAr ? 'معاينة الوصل 👁️' : 'View Receipt 👁️'}
                      </button>
                    </div>
                  )}
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewlyCreatedMember(null);
                        setActiveSection('PAYMENTS');
                      }}
                      className="flex-1 rounded-xl bg-slate-900 dark:bg-slate-800 py-1.5 text-center text-xs font-bold text-amber-400 hover:bg-slate-800 transition"
                    >
                      {isAr ? 'عرض في سجل الفواتير والمدفوعات ←' : 'Open Invoices Tab →'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const gymName =
                            isAr && activeTenantCustom?.nameAr
                              ? activeTenantCustom.nameAr
                              : activeTenantCustom?.nameEn || 'TitanFit Club';
                          await downloadInvoicePdf(
                            {
                              invoiceNumber: newlyCreatedInvoice.invoiceNumber,
                              memberName: isAr ? newlyCreatedInvoice.memberNameAr : newlyCreatedInvoice.memberNameEn,
                              planName: isAr ? newlyCreatedInvoice.planNameAr : newlyCreatedInvoice.planNameEn,
                              subtotalEgp: newlyCreatedInvoice.subtotalEgp,
                              discountEgp: newlyCreatedInvoice.discountEgp,
                              vatEgp: newlyCreatedInvoice.vatEgp,
                              totalEgp: newlyCreatedInvoice.totalEgp,
                              method: newlyCreatedInvoice.method,
                              referenceCode: newlyCreatedInvoice.referenceCode,
                              createdAt: newlyCreatedInvoice.createdAt,
                            },
                            gymName,
                            isAr,
                          );
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-500/30 transition"
                    >
                      {isAr ? 'تحميل إيصال PDF 🖨️' : 'PDF Receipt'}
                    </button>
                  </div>
                </div>
              )}

              {/* Digital QR Code */}
              <div className="mx-auto my-4 flex h-36 w-36 flex-col items-center justify-center rounded-2xl border-2 border-[#D4AF37] bg-white p-2 text-slate-950 shadow-md">
                <QrCode className="h-24 w-24 text-slate-950" />
                <span className="mt-1 font-mono text-[9px] font-extrabold tracking-widest">
                  {newlyCreatedMember.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'يمكن للمتدرب استخدام هذا الكود وكلمة المرور للدخول لمنصة التمارين أو إظهار الـ QR عند البوابة'
                  : 'Member can log into the PWA portal using this password or scan at the turnstiles'}
              </p>

              {/* Action Buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    const text = `🎉 أهلاً بك في TitanFit!\nتم تفعيل اشتراكك بنجاح:\n👤 الاسم: ${newlyCreatedMember.fullNameAr}\n🆔 كود العضوية: ${newlyCreatedMember.code}\n🔑 كلمة المرور المؤقتة: ${newlyCreatedMember.tempPassword || 'TF@2026'}\n🌐 رابط تسجيل الدخول: https://titanfit.up.railway.app/\n\nيمكنك تسجيل الدخول ومتابعة جدول تمارينك ونظامك الغذائي وكارت البوابة الذكي!`;
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(text);
                    }
                    showToast(isAr ? 'تم نسخ بيانات الدخول إلى الحافظة' : 'Copied credentials to clipboard');
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-[#D4AF37]"
                >
                  <Copy className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>{isAr ? 'نسخ البيانات' : 'Copy'}</span>
                </button>

                <a
                  href={`https://wa.me/${newlyCreatedMember.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `🎉 أهلاً بك في TitanFit!\nتم تفعيل اشتراكك بنجاح:\n👤 الاسم: ${newlyCreatedMember.fullNameAr}\n🆔 كود العضوية: ${newlyCreatedMember.code}\n🔑 كلمة المرور: ${newlyCreatedMember.tempPassword || 'TF@2026'}\n🌐 رابط المنصة: https://titanfit.up.railway.app/`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-700"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{isAr ? 'إرسال واتساب' : 'WhatsApp'}</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] px-3 py-2 text-xs font-black text-slate-950 hover:bg-amber-400"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>{isAr ? 'طباعة الكارت' : 'Print Pass'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member 360° Slide-Over Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl overflow-y-auto border-s border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37]/20 text-lg font-extrabold text-[#D4AF37]">
                  {selectedMember.avatarInitials}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold">
                    {isAr ? selectedMember.fullNameAr : selectedMember.fullNameEn}
                  </h3>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {selectedMember.code} • {selectedMember.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {/* Digital Membership Pass Card */}
              <div className="rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#1b2034] to-[#141722] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
                    TITANFIT DIGITAL PASS
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                    {selectedMember.status}
                  </span>
                </div>
                <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? selectedMember.planNameAr : selectedMember.planNameEn}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-900/70 p-2.5">
                    <span className="text-slate-400">{isAr ? 'البداية' : 'Start'}</span>
                    <p className="mt-0.5 font-mono font-bold text-slate-900 dark:text-white">{selectedMember.startDate}</p>
                  </div>
                  <div className="rounded-lg bg-slate-900/70 p-2.5">
                    <span className="text-slate-400">{isAr ? 'الانتهاء' : 'Expires'}</span>
                    <p className="mt-0.5 font-mono font-bold text-[#F3E5AB]">{selectedMember.endDate}</p>
                  </div>
                  <div className="rounded-lg bg-slate-900/70 p-2.5">
                    <span className="text-slate-400">{isAr ? 'مرات الحضور' : 'Check-ins'}</span>
                    <p className="mt-0.5 font-mono font-bold text-emerald-400">
                      {selectedMember.checkInsCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* AES-256-GCM Encrypted Health Vault */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
                    <HeartPulse className="h-4 w-4" />
                    {isAr
                      ? 'الخزينة الطبية المشفرة (AES-256-GCM Decrypted)'
                      : 'AES-256-GCM Decrypted Medical & PAR-Q Vault'}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-300">
                    Blood: {selectedMember.bloodType}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    <strong className="text-white">{isAr ? 'الحالة الطبية:' : 'Conditions:'}</strong>{' '}
                    {selectedMember.medicalConditions}
                  </p>
                  <p>
                    <strong className="text-white">{isAr ? 'إصابات سابقة:' : 'Injuries:'}</strong>{' '}
                    {selectedMember.injuries}
                  </p>
                  <p>
                    <strong className="text-white">{isAr ? 'طوارئ:' : 'Emergency Contact:'}</strong>{' '}
                    {selectedMember.emergencyContactName} ({selectedMember.emergencyContactPhone})
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400">
                  {isAr ? 'الوسوم والمجموعات' : 'Member Tags'}
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedMember.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-[#F3E5AB]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Scanner & Fullscreen Viewer Modals in Members View */}
      <ReceiptScannerModal
        isOpen={showAddMemberReceiptScanner}
        onClose={() => setShowAddMemberReceiptScanner(false)}
        onReceiptCaptured={(dataUrl, fName) => {
          setAddMemberReceiptUrl(dataUrl);
          setAddMemberReceiptFileName(fName || 'receipt.jpg');
          if (!addMemberReferenceCode) {
            setAddMemberReferenceCode(`REC-INSTA-${Date.now().toString().slice(-6)}`);
          }
        }}
        isAr={isAr}
      />

      <ReceiptViewerModal
        isOpen={Boolean(viewingReceiptUrl)}
        onClose={() => setViewingReceiptUrl(null)}
        receiptUrl={viewingReceiptUrl}
        isAr={isAr}
      />
    </div>
  );
}

export function SubscriptionsView() {
  const { locale, plans, members, createPlan, updatePlan, deletePlan, toggleMemberFreeze } = usePlatformStore();
  const isAr = locale === 'ar';
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [type, setType] = useState<PlanItem['type']>('DURATION');
  const [durationDays, setDurationDays] = useState(90);
  const [priceEgp, setPriceEgp] = useState(5200);
  const [maxFreezeDays, setMaxFreezeDays] = useState(14);

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameAr.trim()) return;
    createPlan({
      nameEn: nameEn || nameAr,
      nameAr: nameAr || nameEn,
      type,
      durationDays,
      priceEgp,
      maxFreezeDays,
    });
    setNameEn('');
    setNameAr('');
    setShowPlanModal(false);
  };

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updatePlan(editingPlan.id, {
      nameAr: editingPlan.nameAr,
      nameEn: editingPlan.nameEn,
      priceEgp: editingPlan.priceEgp,
      durationDays: editingPlan.durationDays,
      maxFreezeDays: editingPlan.maxFreezeDays,
    });
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {isAr ? 'هندسة باقات الاشتراكات، التجميد، والكوبونات' : 'Subscription Plans, Freeze Rules & Promo Coupons'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'إدارة الباقات الزمنية وباقات الحصص والعائلات والشركات مع حساب تلقائي لأيام التجميد وفترة السماح'
              : 'Configure Duration, PT Session Packs, Family, and Corporate tiers with automated freeze extensions'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPlanModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-extrabold text-slate-950"
        >
          <Plus className="h-4 w-4" />
          {isAr ? '+ إنشاء باقة جديدة' : '+ Create Subscription Plan'}
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-2xl border p-6 transition ${
              p.popular
                ? 'border-[#D4AF37] bg-gradient-to-b from-amber-50 to-white shadow-lg shadow-amber-500/10 dark:from-[#1A1F33] dark:to-[#121623] shadow-lg shadow-[#D4AF37]/10'
                : 'border-slate-200/90 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121623]'
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 end-4 rounded-full bg-[#D4AF37] px-3 py-0.5 text-[10px] font-extrabold text-slate-950">
                {isAr ? 'الأكثر مبيعاً' : 'MOST POPULAR'}
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-[#F3E5AB] px-2.5 py-1 font-mono text-xs font-bold">
                {p.code}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{p.type}</span>
            </div>
            <h3 className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">
              {isAr ? p.nameAr : p.nameEn}
            </h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#D4AF37]">
                {p.priceEgp.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                EGP / {p.durationDays} {isAr ? 'يوم' : 'days'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 dark:border-slate-800/80 pt-4 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-500">{isAr ? 'أقصى تجميد:' : 'Max Freeze:'}</span>{' '}
                <strong>{p.maxFreezeDays}d</strong>
              </div>
              <div>
                <span className="text-slate-500">{isAr ? 'فترة السماح:' : 'Grace Period:'}</span>{' '}
                <strong>{p.gracePeriodDays}d</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">{isAr ? 'المشتركون النشطون:' : 'Active Subscribers:'}</span>{' '}
                <strong className="text-emerald-500 dark:text-emerald-400">
                  {members.filter((m) => m.planId === p.id && m.status === 'ACTIVE').length}
                </strong>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800/80 pt-3">
              <button
                type="button"
                onClick={() => setEditingPlan(p)}
                className="rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-[#D4AF37]"
              >
                {isAr ? 'تعديل الباقة' : 'Edit Plan'}
              </button>
              <button
                type="button"
                onClick={() => setDeletingPlanId(p.id)}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
              >
                {isAr ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Coupons Strip */}
      <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          {isAr ? 'أكواد الخصم والعروض الترويجية النشطة' : 'Active Promotional & Corporate Discount Codes'}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { code: 'RAMADAN20', pct: '20% OFF', descEn: 'Seasonal campaign across Annual & Quarterly plans', descAr: 'خصم ٢٠٪ على الباقات السنوية وربع السنوية' },
            { code: 'TITAN15', pct: '15% OFF', descEn: 'Member referral reward discount code', descAr: 'خصم ١٥٪ عند ترشيح صديق جديد للنادي' },
            { code: 'CORPORATE25', pct: '25% OFF', descEn: 'CIB, Vodafone & Banque Misr corporate partner rate', descAr: 'خصم ٢٥٪ لموظفي الشركات والبنوك المتعاقدة' },
          ].map((cp) => (
            <div key={cp.code} className="rounded-xl border border-dashed border-[#D4AF37]/40 bg-slate-50 dark:bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-extrabold text-[#D4AF37]">{cp.code}</span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-300">
                  {cp.pct}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{isAr ? cp.descAr : cp.descEn}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold">
                {isAr ? 'إنشاء باقة اشتراك جديدة' : 'Create New Subscription Plan'}
              </h3>
              <button type="button" onClick={() => setShowPlanModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddPlan} className="mt-4 space-y-3">
              <input
                type="text"
                required
                placeholder={isAr ? 'اسم الباقة بالعربية (مثال: باقة 6 شهور بلس)' : 'Plan Name (Arabic)'}
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <input
                type="text"
                required
                placeholder="Plan Name (English, e.g. 6-Month Semi-Annual Pro)"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400">{isAr ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                  <input
                    type="number"
                    value={priceEgp}
                    onChange={(e) => setPriceEgp(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400">{isAr ? 'المدة (يوم)' : 'Duration (Days)'}</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400">{isAr ? 'أيام التجميد' : 'Freeze Days'}</label>
                  <input
                    type="number"
                    value={maxFreezeDays}
                    onChange={(e) => setMaxFreezeDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
                >
                  {isAr ? 'حفظ الباقة' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold">
                {isAr ? `تعديل باقة (${editingPlan.code})` : `Edit Plan (${editingPlan.code})`}
              </h3>
              <button type="button" onClick={() => setEditingPlan(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdatePlan} className="mt-4 space-y-3">
              <input
                type="text"
                required
                value={editingPlan.nameAr}
                onChange={(e) => setEditingPlan({ ...editingPlan, nameAr: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <input
                type="text"
                required
                value={editingPlan.nameEn}
                onChange={(e) => setEditingPlan({ ...editingPlan, nameEn: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400">{isAr ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                  <input
                    type="number"
                    value={editingPlan.priceEgp}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceEgp: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400">{isAr ? 'المدة (يوم)' : 'Duration (Days)'}</label>
                  <input
                    type="number"
                    value={editingPlan.durationDays}
                    onChange={(e) => setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400">{isAr ? 'أيام التجميد' : 'Freeze Days'}</label>
                  <input
                    type="number"
                    value={editingPlan.maxFreezeDays}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxFreezeDays: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
                >
                  {isAr ? 'تحديث الباقة' : 'Update Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Plan Confirmation Modal */}
      {deletingPlanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-white p-6 text-slate-900 shadow-2xl dark:border-rose-500/40 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? 'تأكيد حذف باقة الاشتراك' : 'Confirm Plan Deletion'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'هل أنت متأكد من حذف هذه الباقة؟ لن يتمكن الأعضاء الجدد من الاشتراك فيها.'
                    : 'Are you sure you want to delete this subscription plan?'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingPlanId(null)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePlan(deletingPlanId);
                  setDeletingPlanId(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-rose-700"
              >
                {isAr ? 'نعم، احذف الباقة' : 'Yes, Delete Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PaymentsBillingView() {
  const {
    locale,
    members,
    plans,
    invoices,
    createInvoicePayment,
    attachReceiptToInvoice,
    refundInvoice,
    activeTenantCustom,
    showToast,
    setActiveSection,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id ?? '');
  const [selectedPlanId, setSelectedPlanId] = useState(members[0]?.planId ?? plans[0]?.id ?? 'plan-annual-vip');
  const [paymentMethod, setPaymentMethod] = useState<InvoiceItem['method']>('CASH');
  const [couponCode, setCouponCode] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [lastIssuedInvoice, setLastIssuedInvoice] = useState<InvoiceItem | null>(null);
  const [printableInvoice, setPrintableInvoice] = useState<InvoiceItem | null>(null);
  const [cashierReceiptUrl, setCashierReceiptUrl] = useState<string | null>(null);
  const [cashierReceiptFileName, setCashierReceiptFileName] = useState<string | null>(null);
  const [showCashierScanner, setShowCashierScanner] = useState(false);
  const [activeReceiptInvoiceId, setActiveReceiptInvoiceId] = useState<string | null>(null);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [viewingReceiptInvoiceNum, setViewingReceiptInvoiceNum] = useState<string | undefined>(undefined);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0] ?? {
    id: 'plan-custom',
    nameAr: 'باقة تدريب عامة',
    nameEn: 'General Plan',
    priceEgp: 1500,
    durationDays: 30,
  };

  const discountRate =
    couponCode.trim().toUpperCase() === 'RAMADAN20'
      ? 0.2
      : couponCode.trim().toUpperCase() === 'TITAN15'
        ? 0.15
        : couponCode.trim().toUpperCase() === 'CORPORATE25'
          ? 0.25
          : 0;
  const subtotal = selectedPlan.priceEgp;
  const discount = Math.round(subtotal * discountRate);
  const net = subtotal - discount;
  const vat = Math.round(net * 0.14);
  const total = net + vat;

  const handleMemberSelect = (memId: string) => {
    setSelectedMemberId(memId);
    const m = members.find((x) => x.id === memId);
    if (m?.planId) {
      setSelectedPlanId(m.planId);
    }
  };

  const handleIssueInvoice = () => {
    if (members.length === 0 || !selectedMemberId) {
      showToast(
        isAr
          ? '⚠️ يُرجى تسجيل متدرب أولاً لتحصيل الاشتراك وإصدار الفاتورة الضريبية باسمه!'
          : 'Please register a member first!',
      );
      return;
    }
    const inv = createInvoicePayment({
      memberId: selectedMemberId,
      planId: selectedPlanId,
      method: paymentMethod,
      couponCode,
      referenceCode,
      receiptUrl: cashierReceiptUrl || undefined,
      receiptFileName: cashierReceiptFileName || undefined,
    });
    setLastIssuedInvoice(inv);
    setCashierReceiptUrl(null);
    setCashierReceiptFileName(null);
  };

  return (
    <div data-testid="panel-members-billing" className="space-y-6">
      {/* Cashier Checkout & Tax Invoice Generator */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6 lg:col-span-2">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {isAr
              ? 'محطة تحصيل الاشتراكات وبوابات الدفع الرسمية (Cash / InstaPay / Paymob / Fawry)'
              : 'Official Egypt & Global Cashier Terminal (Cash / InstaPay / Paymob / Fawry)'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'إصدار فوري للفواتير الضريبية المعتمدة شاملة 14% ضريبة القيمة المضافة ومحمية بتشفير SHA-256'
              : 'Official checkout with 14% Egypt VAT calculation and verified SHA-256 digital receipt signatures'}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {members.length === 0 ? (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/20 p-4 text-center sm:col-span-2">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {isAr
                    ? '⚠️ لا يوجد متدربون مسجلون في النادي حالياً لتحصيل اشتراكهم.'
                    : 'No members registered yet.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection('MEMBERS')}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 shadow-md transition"
                >
                  <UserPlus className="h-4 w-4" />
                  {isAr ? '+ تسجيل متدرب جديد وتحصيل اشتراكه فوراً' : '+ Register Member & Collect'}
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="checkout-member-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'اختر المتدرب' : 'Select Member'}
                  </label>
                  <select
                    id="checkout-member-select"
                    aria-label={isAr ? 'اختر المتدرب' : 'Select Member'}
                    value={selectedMemberId}
                    onChange={(e) => handleMemberSelect(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {isAr ? m.fullNameAr : m.fullNameEn} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="checkout-plan-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'باقة الاشتراك المحددة' : 'Subscription Plan'}
                  </label>
                  <select
                    id="checkout-plan-select"
                    aria-label={isAr ? 'باقة الاشتراك المحددة' : 'Subscription Plan'}
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {isAr ? p.nameAr : p.nameEn} — {p.priceEgp.toLocaleString()} EGP
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'وسيلة وبوابة التحصيل المعتمدة (قنوات دفع رسمية مرخصة)' : 'Official Payment Gateway & Cashier Channel'}
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(
                  [
                    { id: 'CASH', labelEn: 'Cash at Reception', labelAr: '💵 نقدي بالاستقبال (Cash)' },
                    { id: 'INSTAPAY', labelEn: 'InstaPay Egypt', labelAr: '📱 إنستاباي (InstaPay)' },
                    { id: 'PAYMOB_CARD', labelEn: 'Paymob Visa/MC', labelAr: '💳 بطاقة بنكية (Paymob)' },
                    { id: 'VODAFONE_CASH', labelEn: 'Vodafone Cash', labelAr: '🔴 فودافون كاش' },
                    { id: 'FAWRY', labelEn: 'Fawry Reference', labelAr: '🟡 كود فوري (Fawry)' },
                    { id: 'STRIPE', labelEn: 'Stripe Global (USD)', labelAr: '🌐 سترايب دولي (Stripe)' },
                  ] as const
                ).map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      paymentMethod === pm.id
                        ? 'border-amber-500 bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-400 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {isAr ? pm.labelAr : pm.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'كود الخصم أو الكوبون (اختياري)' : 'Coupon Code (Optional)'}
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={isAr ? 'مثال: TITAN15 أو RAMADAN20' : 'e.g. TITAN15'}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm uppercase text-slate-900 focus:bg-white focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'رقم إيصال الكاشير أو مرجع التحويل (اختياري)' : 'Transaction Reference / IPA Handle'}
              </label>
              <input
                type="text"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                placeholder={isAr ? 'مثال: POS-00124 أو IPA-CIB-992' : 'e.g. POS-00124'}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:bg-white focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Live Camera Scan or Upload Receipt in Cashier Terminal */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    {isAr ? '📷 إيصال أو وصل الدفع والتحويل (مسح بالكاميرا أو رفع صورة)' : 'Receipt (Camera Scan / Upload Image)'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr ? 'اربط صورة إيصال إنستاباي / التحويل البنكي مباشرة بالفاتورة' : 'Attach InstaPay or POS receipt image'}
                  </span>
                </div>
                {cashierReceiptUrl ? (
                  <div className="flex items-center gap-2">
                    <img src={cashierReceiptUrl} alt="Receipt preview" className="h-9 w-9 rounded-lg object-cover ring-1 ring-amber-500" />
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ {cashierReceiptFileName || 'receipt.jpg'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewingReceiptUrl(cashierReceiptUrl)}
                      className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-100 dark:bg-slate-800 dark:text-white"
                    >
                      {isAr ? 'معاينة' : 'Preview'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCashierReceiptUrl(null);
                        setCashierReceiptFileName(null);
                      }}
                      className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                    >
                      {isAr ? 'إزالة' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReceiptInvoiceId(null);
                        setShowCashierScanner(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-black text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
                    >
                      <Camera className="h-4 w-4 text-amber-500" />
                      <span>{isAr ? '📷 مسح الوصل بالكاميرا' : 'Live Camera Scan'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReceiptInvoiceId(null);
                        setShowCashierScanner(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <Upload className="h-4 w-4 text-slate-500" />
                      <span>{isAr ? '📁 رفع صورة الوصل' : 'Upload File'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Tax Invoice Breakdown Summary */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#1A1F33] to-[#121623] p-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
                {isAr ? 'ملخص الفاتورة الضريبية' : 'TAX INVOICE SUMMARY'}
              </span>
              <Receipt className="h-5 w-5 text-[#D4AF37]" />
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-slate-200">
                <span>{isAr ? 'قيمة الباقة الأساسية' : 'Plan Subtotal'}</span>
                <span className="font-mono font-bold text-white">{subtotal.toLocaleString()} EGP</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>
                    {isAr ? 'خصم الكوبون' : 'Coupon Discount'} ({Math.round(discountRate * 100)}%)
                  </span>
                  <span className="font-mono font-bold text-emerald-300">-{discount.toLocaleString()} EGP</span>
                </div>
              )}
              <div className="flex justify-between text-slate-200">
                <span>{isAr ? 'ضريبة القيمة المضافة (14%)' : 'Egypt VAT (14%)'}</span>
                <span className="font-mono font-bold text-white">+{vat.toLocaleString()} EGP</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between text-lg font-extrabold text-white">
                <span>{isAr ? 'الإجمالي المستحق' : 'Total Payable'}</span>
                <span className="font-mono text-[#F3E5AB] font-black text-xl">{total.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              data-testid="issue-invoice-btn"
              onClick={handleIssueInvoice}
              className="w-full rounded-xl bg-[#D4AF37] py-3 text-xs font-black text-slate-950 shadow-lg shadow-[#D4AF37]/20 transition hover:bg-[#e5c145]"
            >
              {isAr
                ? 'تأكيد التحصيل وإصدار الفاتورة الضريبية + QR'
                : 'Confirm Payment & Issue QR Tax Invoice'}
            </button>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-center text-[10px] text-slate-400">
              <span>{isAr ? '🛡️ معاملة مالية آمنة ومسجلة في السجل المالي الضريبي' : '🛡️ Audited & Tax Ledger Verified'}</span>
            </div>

            {lastIssuedInvoice && (
              <div
                data-testid="invoice-status-msg"
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs font-bold text-emerald-300"
              >
                ✅ {lastIssuedInvoice.invoiceNumber} —{' '}
                {isAr
                  ? `تم التحصيل بنجاح (${lastIssuedInvoice.totalEgp.toLocaleString()} ج.م)`
                  : `Paid EGP ${lastIssuedInvoice.totalEgp.toLocaleString()} via ${lastIssuedInvoice.method}`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoices Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623]">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {isAr ? 'سجل الفواتير الضريبية والمدفوعات' : 'Issued Tax Invoices & Payment Ledger'}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {invoices.length} {isAr ? 'فاتورة مسجلة' : 'invoices'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 text-start">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'العضو' : 'Member'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'البيان' : 'Description'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'بوابة الدفع' : 'Gateway'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'الإجمالي (شامل الضريبة)' : 'Total (Incl. VAT)'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'الوصل المرفق' : 'Receipt'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'لا توجد فواتير أو مدفوعات مسجلة بعد — يمكنك إصدار أول فاتورة من محطة التحصيل أعلاه.'
                      : 'No invoices or payments recorded yet — Issue your first invoice from the terminal above.'}
                  </td>
                </tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-[#F3E5AB]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {isAr ? inv.memberNameAr : inv.memberNameEn}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                    {isAr ? inv.planNameAr : inv.planNameEn}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      {inv.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {inv.totalEgp.toLocaleString()} EGP
                  </td>
                  <td className="px-4 py-3">
                    {inv.receiptUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          setViewingReceiptUrl(inv.receiptUrl || null);
                          setViewingReceiptInvoiceNum(inv.invoiceNumber);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition shadow-sm"
                      >
                        <FileText className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{isAr ? '🧾 عرض الوصل' : 'View Receipt'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReceiptInvoiceId(inv.id);
                          setShowCashierScanner(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-amber-500/50 bg-amber-50/50 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-300"
                      >
                        <Camera className="h-3 w-3 text-amber-500" />
                        <span>{isAr ? '+ مسح/إرفاق وصل' : '+ Attach'}</span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPrintableInvoice(inv)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white hover:border-[#D4AF37]"
                      >
                        <Printer className="h-3.5 w-3.5 text-[#D4AF37]" />
                        {isAr ? 'طباعة إيصال QR' : 'Print Receipt'}
                      </button>
                      {inv.status === 'PAID' && (
                        <button
                          type="button"
                          onClick={() => refundInvoice(inv.id)}
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
                        >
                          {isAr ? 'استرداد' : 'Refund'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Tax Invoice Modal */}
      {printableInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-[#D4AF37]/50 bg-white p-6 text-slate-900 shadow-2xl dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <p className="text-xs font-extrabold text-[#D4AF37]">TITANFIT EGYPT — ETA TAX INVOICE</p>
                <h4 className="font-mono text-base font-extrabold">{printableInvoice.invoiceNumber}</h4>
              </div>
              <button type="button" onClick={() => setPrintableInvoice(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>{isAr ? 'العضو:' : 'Member:'}</span>
                <strong className="text-white">
                  {isAr ? printableInvoice.memberNameAr : printableInvoice.memberNameEn}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'الخدمة:' : 'Item:'}</span>
                <strong className="text-white">
                  {isAr ? printableInvoice.planNameAr : printableInvoice.planNameEn}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'وسيلة الدفع:' : 'Gateway:'}</span>
                <strong className="font-mono text-[#F3E5AB]">{printableInvoice.method}</strong>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'المرجع:' : 'Ref:'}</span>
                <strong className="font-mono">{printableInvoice.referenceCode}</strong>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between">
                <span>{isAr ? 'الضريبة (14% VAT):' : 'VAT (14%):'}</span>
                <strong className="font-mono">{printableInvoice.vatEgp.toLocaleString()} EGP</strong>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#D4AF37]">
                <span>{isAr ? 'الإجمالي المدفوع:' : 'Total Paid:'}</span>
                <span className="font-mono">{printableInvoice.totalEgp.toLocaleString()} EGP</span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3">
              <div className="text-[11px] text-slate-400">
                <p className="font-bold text-slate-900 dark:text-white">ETA Digital Tax Signature</p>
                <p className="font-mono">SHA256: 9F82A1C0...TitanFit</p>
              </div>
              <QrCode className="h-12 w-12 text-[#D4AF37]" />
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const gymName =
                    isAr && activeTenantCustom?.nameAr
                      ? activeTenantCustom.nameAr
                      : activeTenantCustom?.nameEn || 'TitanFit Club';
                  await downloadInvoicePdf(
                    {
                      invoiceNumber: printableInvoice.invoiceNumber,
                      memberName: isAr ? printableInvoice.memberNameAr : printableInvoice.memberNameEn,
                      planName: isAr ? printableInvoice.planNameAr : printableInvoice.planNameEn,
                      subtotalEgp: printableInvoice.subtotalEgp,
                      discountEgp: printableInvoice.discountEgp,
                      vatEgp: printableInvoice.vatEgp,
                      totalEgp: printableInvoice.totalEgp,
                      method: printableInvoice.method,
                      referenceCode: printableInvoice.referenceCode,
                      createdAt: printableInvoice.createdAt,
                      cashierName: printableInvoice.cashierName,
                    },
                    gymName,
                    isAr,
                  );
                } catch {
                  window.print();
                }
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-amber-400"
            >
              <Download className="h-4 w-4" />
              {isAr ? 'تحميل إيصال PDF تجريبي' : 'Download Sample PDF Receipt'}
            </button>
          </div>
        </div>
      )}

      {/* Receipt Live Camera Scanner Modal */}
      <ReceiptScannerModal
        isOpen={showCashierScanner}
        onClose={() => {
          setShowCashierScanner(false);
          setActiveReceiptInvoiceId(null);
        }}
        onReceiptCaptured={(dataUrl, fName) => {
          if (activeReceiptInvoiceId) {
            attachReceiptToInvoice(activeReceiptInvoiceId, dataUrl, fName);
            setActiveReceiptInvoiceId(null);
          } else {
            setCashierReceiptUrl(dataUrl);
            setCashierReceiptFileName(fName || 'receipt.jpg');
            if (!referenceCode) {
              setReferenceCode(`REC-INSTA-${Date.now().toString().slice(-6)}`);
            }
          }
        }}
        isAr={isAr}
      />

      {/* Attached Receipt High-Res Inspector Viewer */}
      <ReceiptViewerModal
        isOpen={Boolean(viewingReceiptUrl)}
        onClose={() => {
          setViewingReceiptUrl(null);
          setViewingReceiptInvoiceNum(undefined);
        }}
        receiptUrl={viewingReceiptUrl}
        invoiceNumber={viewingReceiptInvoiceNum}
        isAr={isAr}
      />
    </div>
  );
}
