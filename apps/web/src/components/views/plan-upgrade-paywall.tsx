'use client';

import React, { useState } from 'react';
import {
  Lock,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Video,
  BarChart3,
  Settings,
  Calendar,
  QrCode,
  ShoppingBag,
  UserCheck,
  Crown,
} from 'lucide-react';
import { usePlatformStore, WorkspaceSection, GymPlanTierKey } from '../../lib/platform-store';

interface PlanUpgradePaywallProps {
  section: WorkspaceSection;
  onBack?: () => void;
}

export function PlanUpgradePaywallView({ section, onBack }: PlanUpgradePaywallProps) {
  const {
    locale,
    activePlanTier,
    saasPlans,
    getRequiredPlanForSection,
    upgradeActiveTenantPlan,
    activeTenantCustom,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [upgrading, setUpgrading] = useState(false);

  const requiredPlan = getRequiredPlanForSection(section);
  const currentPlan = saasPlans.find((p) => p.id === activePlanTier) || saasPlans[0]!;

  const getSectionDetails = (sec: WorkspaceSection) => {
    switch (sec) {
      case 'CONTENT_LIBRARY':
        return {
          icon: Video,
          titleAr: 'استوديو رفع فيديوهات التمارين والوصفات المحمي (Anti-Rip DRM)',
          titleEn: 'DRM Protected Exercise & Nutrition Video Studio',
          benefitAr:
            'ارفع فيديوهات تمارينك وشروحات كباتنك بجودة فائقة مع تشفير كامل ضد التحميل أو سرقة المحتوى. قدّم تدريباً هجيناً أونلاين لمتدربيك وحقق دخلاً شهرياً إضافياً لناديك بأكثر من 40%.',
          benefitEn:
            'Upload proprietary exercise cues and meal recipes protected by anti-download DRM. Deliver online coaching to boost recurring gym revenue by 40%.',
        };
      case 'REPORTS':
        return {
          icon: BarChart3,
          titleAr: 'التقارير المالية الموسعة وتحليلات الـ BI وتصدير CSV',
          titleEn: 'Advanced Financial BI Reports & CSV Spreadsheet Export',
          benefitAr:
            'راقب بدقة ميزانية النادي، الأرباح والخسائر، صافي الإيرادات، وتتبع ديون المشتركين المتأخرة مع إمكانية تصدير ملفات إكسيل CSV للمحاسب المالي بضغطة زر واحدة.',
          benefitEn:
            'Monitor accurate P&L cashflow, member debt aging, and revenue breakdown. Export full CSV sheets for your accountant with one click.',
        };
      case 'SETTINGS':
        return {
          icon: Settings,
          titleAr: 'الفروع المتعددة وتخصيص الهوية البصرية (White-Label Branding)',
          titleEn: 'Multi-Branch Management & White-Label Theme Customization',
          benefitAr:
            'أطلق علامة ناديك التجارية باحترافية كاملة: اربط فروعاً غير محدودة، خصص ألوان المنصة، الشعار، ودومين ناديك الخاص ليظهر لجميع أعضائك وفريق عملك.',
          benefitEn:
            'Operate unlimited branches under your gym brand. Customize theme tokens, club logo, and custom domain across all member portals.',
        };
      case 'CLASSES':
        return {
          icon: Calendar,
          titleAr: 'جدول الحصص الجماعية وقوائم الانتظار الذكية',
          titleEn: 'Group Fitness Schedules & Automated Waitlists',
          benefitAr:
            'نظّم حصص الأيروبكس، الكروس فيت، والغزل بدقة. امنع التكدس مع حجز مسبق في تطبيق المتدرب وترقية تلقائية لقوائم الانتظار فور إلغاء أي مشترك.',
          benefitEn:
            'Organize spinning, crossfit, and yoga classes. Prevent overcrowding with in-app member bookings and automated waitlist promotion.',
        };
      case 'ACCESS_CONTROL':
        return {
          icon: QrCode,
          titleAr: 'بوابات الدخول الإلكترونية والـ QR Code الذكي التفاعلي',
          titleEn: 'Smart QR & Turnstile Electronic Gate Integration',
          benefitAr:
            'احمِ ناديك بنسبة 100% من دخول غير المشتركين أو تمرير الكروت. كود QR ديناميكي يتغير تلقائياً في هاتف المتدرب ويسجل الحضور في جزء من الثانية.',
          benefitEn:
            'Eliminate unauthorized entries and card sharing with dynamic rolling QR codes scanning turnstiles in under 0.5s.',
        };
      case 'POS_INVENTORY':
        return {
          icon: ShoppingBag,
          titleAr: 'نقطة بيع المكملات والبار (POS) وإدارة المخزون',
          titleEn: 'Supplement Bar POS Cashier & Inventory Alerts',
          benefitAr:
            'حوّل بار النادي لماكينة أرباح سريعة: بيع البروتينات والمشروبات، راقب الجرد، واستلم تنبيهات فورية عند وصول أي مكمل لمرحلة النواقص.',
          benefitEn:
            'Maximize secondary revenue with barcode scanning, instant cashier transactions, and real-time inventory depletion alerts.',
        };
      case 'STAFF_TRAINERS':
        return {
          icon: UserCheck,
          titleAr: 'إدارة المدربين وتوزيع المشتركين وحساب العمولات',
          titleEn: 'Trainers CRM, Member Allocation & Commission Tracking',
          benefitAr:
            'أدِر فريق مدربيك باحترافية: اربط كل متدرب بمدربه، راقب التزام الكباتن، واحسب عمولات التدريب الخاص (PT) وصرف المستحقات تلقائياً.',
          benefitEn:
            'Distribute trainees among certified coaches, track PT sessions, and calculate accurate commission payroll automatically.',
        };
      default:
        return {
          icon: Sparkles,
          titleAr: 'ميزة احترافية في منصة TitanFit',
          titleEn: 'Advanced TitanFit Platform Module',
          benefitAr: 'هذه الصفحة مخصصة لترقية أداء ناديك الرياضي وتتطلب ترقية باقة الاشتراك.',
          benefitEn: 'This module is designed to scale gym operations and requires a higher plan tier.',
        };
    }
  };

  const secInfo = getSectionDetails(section);
  const SecIcon = secInfo.icon;

  const handleUpgrade = (tier: GymPlanTierKey) => {
    setUpgrading(true);
    setTimeout(() => {
      upgradeActiveTenantPlan(tier);
      setUpgrading(false);
    }, 400);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      {/* Top Banner Alert */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-slate-950 p-6 sm:p-8 text-white shadow-xl dark:border-amber-500/30">
        <div className="absolute -top-12 -end-12 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-300">
                <Lock className="h-3.5 w-3.5" />
                <span>
                  {isAr
                    ? `ميزة مقفلة في باقتك الحالية (${currentPlan.nameAr})`
                    : `Locked on your current tier (${currentPlan.nameEn})`}
                </span>
              </span>
              <span className="rounded-xl bg-slate-800/80 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-300">
                {activeTenantCustom?.nameAr || activeTenantCustom?.nameEn || 'نادي TitanFit'}
              </span>
            </div>

            <div className="flex items-start gap-3.5 pt-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md">
                <SecIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isAr ? secInfo.titleAr : secInfo.titleEn}
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                  {isAr ? secInfo.benefitAr : secInfo.benefitEn}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              disabled={upgrading}
              onClick={() => handleUpgrade(requiredPlan.id)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-[#D4AF37] px-6 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 fill-slate-950" />
              <span>
                {upgrading
                  ? isAr ? 'جاري تفعيل الباقة...' : 'Upgrading...'
                  : isAr
                    ? `ترقية فورية إلى "${requiredPlan.nameAr}" وفتح الصفحة`
                    : `Upgrade to "${requiredPlan.nameEn}" & Unlock`}
              </span>
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
              >
                {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                <span>{isAr ? 'الرجوع للصفحة السابقة' : 'Back to previous page'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plan Details & Pricing Comparison Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isAr ? 'اختر باقة SaaS المناسبة لحجم ناديك الرياضي' : 'Select the Right SaaS Plan for Your Gym'}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? 'أسعار واضحة ومدروسة بالجنيه المصري تضمن لك أعلى عائد استثماري دون أي عمولات خفية'
                : 'Clear and transparent pricing in EGP to scale your fitness business'}
            </p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {isAr ? 'دفع شهري' : 'Monthly'}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              className={`relative rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                billingCycle === 'ANNUAL'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <span>{isAr ? 'دفع سنوي' : 'Annual'}</span>
              <span className="ms-1.5 rounded-full bg-emerald-600 px-1.5 py-0.2 text-[9px] text-white">
                {isAr ? 'خصم 20%' : '-20%'}
              </span>
            </button>
          </div>
        </div>

        {/* 3 Tier Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {saasPlans.map((plan) => {
            const isCurrent = plan.id === activePlanTier;
            const isRequired = plan.id === requiredPlan.id;
            const price = billingCycle === 'ANNUAL' ? plan.annualMonthlyPriceEgp : plan.monthlyPriceEgp;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all ${
                  isRequired
                    ? 'border-2 border-amber-500 bg-white shadow-2xl shadow-amber-500/10 dark:bg-[#121625]'
                    : isCurrent
                      ? 'border border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-500/40'
                      : 'border border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#0E121E]'
                }`}
              >
                {/* Top Badge */}
                {isRequired && (
                  <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1 text-[11px] font-black text-slate-950 shadow-md">
                    {isAr ? '⭐ الباقة المطلوبة لفتح هذه الميزة' : '⭐ Required for this Module'}
                  </div>
                )}
                {isCurrent && !isRequired && (
                  <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-emerald-600 px-3.5 py-1 text-[10px] font-black text-white shadow-md">
                    {isAr ? '✓ باقتك الحالية' : '✓ Current Active Plan'}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {isAr ? plan.nameAr : plan.nameEn}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {isAr ? plan.taglineAr : plan.taglineEn}
                      </p>
                    </div>
                  </div>

                  {/* Price Block */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-3xl font-black text-slate-900 dark:text-white">
                        {price.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {isAr ? 'ج.م / شهرياً' : 'EGP / mo'}
                      </span>
                    </div>
                    {billingCycle === 'ANNUAL' ? (
                      <p className="mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {isAr
                          ? `تدفع ${plan.annualTotalEgp.toLocaleString()} ج.م سنوياً (وفرت ${(plan.monthlyPriceEgp * 12 - plan.annualTotalEgp).toLocaleString()} ج.م)`
                          : `Billed annually at ${plan.annualTotalEgp.toLocaleString()} EGP (Save ${(plan.monthlyPriceEgp * 12 - plan.annualTotalEgp).toLocaleString()} EGP)`}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-400">
                        {isAr ? 'تجديد شهري مرن بدون التزام طويل' : 'Flexible month-to-month billing'}
                      </p>
                    )}
                  </div>

                  {/* Operational Limits */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/40">
                      <p className="font-mono font-black text-slate-900 dark:text-white">
                        {plan.maxBranches === 'UNLIMITED' ? '∞' : plan.maxBranches}
                      </p>
                      <p className="text-[10px] text-slate-500">{isAr ? 'فروع' : 'Branches'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/40">
                      <p className="font-mono font-black text-slate-900 dark:text-white">
                        {plan.maxMembers === 'UNLIMITED' ? '∞' : plan.maxMembers}
                      </p>
                      <p className="text-[10px] text-slate-500">{isAr ? 'مشتركين' : 'Members'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/40">
                      <p className="font-mono font-black text-slate-900 dark:text-white">
                        {plan.maxStaff === 'UNLIMITED' ? '∞' : plan.maxStaff}
                      </p>
                      <p className="text-[10px] text-slate-500">{isAr ? 'مدربين' : 'Staff'}</p>
                    </div>
                  </div>

                  {/* Highlights List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      {isAr ? 'أهم مميزات الباقة:' : 'Plan Highlights:'}
                    </p>
                    {(isAr ? plan.highlightsAr : plan.highlightsEn).map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-6">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-2xl border border-emerald-500/40 bg-emerald-500/10 py-3 text-xs font-black text-emerald-700 dark:text-emerald-300 cursor-default text-center"
                    >
                      ✓ {isAr ? 'باقتك النشطة حالياً' : 'Your Current Active Plan'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={upgrading}
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full rounded-2xl py-3 text-xs font-black transition active:scale-95 disabled:opacity-50 ${
                        isRequired
                          ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-[#D4AF37] text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-105'
                          : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {isRequired
                        ? isAr
                          ? `⚡ الترقية إلى ${plan.nameAr.split(' ')[0]} الآن`
                          : `⚡ Upgrade to ${plan.nameEn.split(' ')[0]} Now`
                        : isAr
                          ? `التحويل إلى ${plan.nameAr.split(' ')[0]}`
                          : `Switch to ${plan.nameEn.split(' ')[0]}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
