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
  CreditCard,
  Download,
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
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
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
  } = usePlatformStore();
  const isAr = locale === 'ar';
  const [chartPeriod, setChartPeriod] = useState<'7D' | '30D' | '90D' | '12M'>('30D');

  const filteredMembers =
    selectedBranchId === 'ALL'
      ? members
      : members.filter((m) => m.branchId === selectedBranchId);
  const activeCount = filteredMembers.filter((m) => m.status === 'ACTIVE').length;
  const expiringCount = filteredMembers.filter((m) => m.status === 'EXPIRING_SOON').length;
  const totalRevenueEgp = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, i) => acc + i.totalEgp, 842500);

  const revenueSeries =
    chartPeriod === '7D'
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
      <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#121624] via-[#171C2E] to-[#1E1910] p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-[#D4AF37]/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold text-[#F3E5AB]">
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
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
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
              onClick={() => setActiveSection('PAYMENTS')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/15"
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
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'إجمالي الإيرادات الشهرية' : 'Monthly Gross Revenue'}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
              <Wallet className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-white">
              {isAr
                ? `${totalRevenueEgp.toLocaleString('ar-EG')} ج.م`
                : `EGP ${totalRevenueEgp.toLocaleString()}`}
            </p>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" /> +18.4%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {isAr
              ? 'إنستاباي 42% • بطاقات Paymob 31% • نقدي وفوري 27%'
              : 'InstaPay 42% • Paymob 31% • Cash & Fawry 27%'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'الأعضاء النشطون حالياً' : 'Active Subscriptions'}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-white">
              {isAr ? (2840 + activeCount).toLocaleString('ar-EG') : (2840 + activeCount).toLocaleString()}
            </p>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
              +12.1%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {isAr ? 'معدل الاحتفاظ بالأعضاء 96.6% (معدل تسرب 3.4%)' : '96.6% retention rate (3.4% monthly churn)'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'تسجيلات الدخول اليوم (البوابات)' : 'Turnstile Check-ins Today'}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <QrCode className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-white">
              {isAr ? (412 + accessLogs.length).toLocaleString('ar-EG') : 412 + accessLogs.length}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-bold text-sky-400">
              {isAr ? '٣٦١ داخل النادي الآن' : '361 On-Floor Now'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {isAr ? 'متوسط زمن التحقق من رمز QR الدوار: 42ms' : 'Avg rotating HMAC QR verification: 42ms'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'اشتراكات تنتهي خلال 7 أيام' : 'Expiring Within 7 Days'}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-amber-400">
              {isAr ? (38 + expiringCount).toLocaleString('ar-EG') : 38 + expiringCount}
            </p>
            <button
              type="button"
              onClick={() =>
                showToast(
                  isAr
                    ? 'تم إرسال رسائل تذكير التجديد عبر واتساب لـ 39 عضواً مع رابط دفع فوري!'
                    : 'Dispatched WhatsApp renewal reminders with instant Paymob/InstaPay links to 39 members!',
                )
              }
              className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 transition hover:bg-amber-500/30"
            >
              {isAr ? 'إرسال تذكير واتساب' : 'Send WhatsApp Blast'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {isAr ? 'إيرادات تجديد متوقعة: 164,000 ج.م' : 'Projected renewal pipeline: EGP 164,000'}
          </p>
        </div>
      </div>

      {/* Main Analytics Row: Revenue Chart + Live Branch Occupancy */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Interactive Revenue & Attendance Chart */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-white">
                {isAr ? 'تحليل الإيرادات وحركة حضور الأعضاء' : 'Revenue & Member Attendance Velocity'}
              </h2>
              <p className="text-xs text-slate-400">
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
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Bar + Trend Visual */}
          <div className="mt-6 grid grid-cols-7 items-end gap-3 pt-4" style={{ height: '210px' }}>
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

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
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
        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white">
              {isAr ? 'إشغال الفروع اللحظي' : 'Live Branch Occupancy'}
            </h2>
            <Building2 className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {isAr ? 'قراءة مباشرة من بوابات الدخول الإلكترونية' : 'Live telemetry from turnstile counters'}
          </p>

          <div className="mt-5 space-y-4">
            {branches.map((br) => {
              const pct = Math.round((br.currentOccupancy / br.capacity) * 100);
              return (
                <div
                  key={br.id}
                  className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {isAr ? br.nameAr : br.nameEn}
                      </p>
                      <p className="text-xs text-slate-400">
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
                      {br.currentOccupancy}/{br.capacity} ({pct}%)
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
        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white">
                {isAr ? 'سجل بوابات الدخول المباشر (Turnstile Live Feed)' : 'Live Turnstile & QR Access Stream'}
              </h2>
              <p className="text-xs text-slate-400">
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
                    <p className="text-sm font-bold text-white">
                      {isAr ? log.memberNameAr : log.memberNameEn}{' '}
                      <span className="font-mono text-xs text-slate-400">({log.memberCode})</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {isAr ? log.gateNameAr : log.gateNameEn} •{' '}
                      {isAr ? log.reasonAr : log.reasonEn}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs text-slate-400">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Classes Snapshot */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white">
                {isAr ? 'حصص اليوم وقوائم الانتظار' : "Today's Group Classes & Waitlists"}
              </h2>
              <p className="text-xs text-slate-400">
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
                    <p className="text-sm font-bold text-white">
                      {isAr ? cls.titleAr : cls.titleEn}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {isAr ? cls.trainerAr : cls.trainerEn} • {cls.timeRange}
                  </p>
                </div>
                <div className="text-end">
                  <span className="inline-block rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-white">
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
    toggleMemberFreeze,
    simulateGateScan,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MemberItem['status']>('ALL');
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
    addMember({
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
    setFullNameEn('');
    setFullNameAr('');
    setMedicalConditions('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#121623] p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-white">
            {isAr ? 'إدارة الأعضاء والملفات الطبية المشفرة (CRM)' : 'Members Directory & Encrypted Health Vault'}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
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
            className="w-full rounded-xl border border-slate-800 bg-[#121623] py-2.5 ps-10 pe-4 text-sm text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none"
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
                  : 'border border-slate-800 bg-[#121623] text-slate-300 hover:border-slate-700'
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
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#121623]">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3.5 text-start">{isAr ? 'العضو' : 'Member'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'الباقة الحالية' : 'Subscription Plan'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'المدرب المسؤول' : 'Assigned Coach'}</th>
                <th className="px-4 py-3.5 text-end">{isAr ? 'إجراءات سريعة' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="transition hover:bg-slate-900/40">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 font-extrabold text-[#D4AF37]">
                        {m.avatarInitials}
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {isAr ? m.fullNameAr : m.fullNameEn}
                        </p>
                        <p className="font-mono text-xs text-slate-400">
                          {m.code} • {m.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-200">
                      {isAr ? m.planNameAr : m.planNameEn}
                    </p>
                    <p className="text-xs text-slate-400">
                      {isAr
                        ? `رصيد التجميد: ${m.freezeDaysRemaining} يوم`
                        : `Freeze balance: ${m.freezeDaysRemaining} days`}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : m.status === 'FROZEN'
                            ? 'bg-sky-500/15 text-sky-300'
                            : m.status === 'EXPIRING_SOON'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                    {m.endDate}
                    <div className="text-[11px] text-slate-500">
                      {isAr ? `آخر حضور: ${m.lastCheckIn}` : `Last seen: ${m.lastCheckIn}`}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-300">
                    {isAr ? m.assignedTrainerAr : m.assignedTrainerEn}
                  </td>
                  <td className="px-4 py-3.5 text-end">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(m)}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-white hover:border-[#D4AF37]"
                      >
                        {isAr ? 'ملف 360°' : '360° Profile'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMemberFreeze(m.id, 14)}
                        className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20"
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
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20"
                      >
                        {isAr ? 'دخول QR' : 'Check-in'}
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
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#121623] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {isAr ? 'تسجيل عضو جديد + تشفير الملف الصحي' : 'Register New Member + AES-256 Health Vault'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'يتم تشفير البيانات الطبية تلقائياً بمفتاح خاص بالمستأجر (AAD)'
                    : 'Medical PAR-Q notes are encrypted with AES-256-GCM bound to tenantId AAD'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'الاسم الكامل (عربي)' : 'Full Name (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={fullNameAr}
                  onChange={(e) => setFullNameAr(e.target.value)}
                  placeholder="مثال: كريم وائل المنياوي"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={fullNameEn}
                  onChange={(e) => setFullNameEn(e.target.value)}
                  placeholder="e.g. Karim Wael El-Miniawy"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'رقم الموبايل المصري (+20)' : 'Phone Number (+20)'}
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="karim@titanfit.eg"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'باقة الاشتراك' : 'Subscription Plan'}
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isAr ? p.nameAr : p.nameEn} ({p.priceEgp.toLocaleString()} EGP)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'الفرع الأساسي' : 'Home Branch'}
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {isAr ? b.nameAr : b.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'اسم قريب للطوارئ' : 'Emergency Contact Name'}
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder={isAr ? 'وائل المنياوي' : 'Wael El-Miniawy'}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'فصيلة الدم والنوع' : 'Blood Type & Gender'}
                </label>
                <div className="mt-1 flex gap-2">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-1/2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="MALE">{isAr ? 'ذكر' : 'Male'}</option>
                    <option value="FEMALE">{isAr ? 'أنثى' : 'Female'}</option>
                  </select>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-1/2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
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
                <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
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
                  className="mt-1 w-full rounded-xl border border-emerald-500/30 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-5 py-2 text-xs font-extrabold text-slate-950"
                >
                  {isAr ? 'حفظ وتفعيل العضوية فوراً' : 'Save & Activate Membership'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member 360° Slide-Over Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl overflow-y-auto border-s border-slate-800 bg-[#121623] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37]/20 text-lg font-extrabold text-[#D4AF37]">
                  {selectedMember.avatarInitials}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold">
                    {isAr ? selectedMember.fullNameAr : selectedMember.fullNameEn}
                  </h3>
                  <p className="font-mono text-xs text-slate-400">
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
                <p className="mt-2 text-base font-bold text-white">
                  {isAr ? selectedMember.planNameAr : selectedMember.planNameEn}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-900/70 p-2.5">
                    <span className="text-slate-400">{isAr ? 'البداية' : 'Start'}</span>
                    <p className="mt-0.5 font-mono font-bold text-white">{selectedMember.startDate}</p>
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
                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
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
    </div>
  );
}

export function SubscriptionsView() {
  const { locale, plans, members, createPlan, toggleMemberFreeze } = usePlatformStore();
  const isAr = locale === 'ar';
  const [showPlanModal, setShowPlanModal] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#121623] p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-white">
            {isAr ? 'هندسة باقات الاشتراكات، التجميد، والكوبونات' : 'Subscription Plans, Freeze Rules & Promo Coupons'}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
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
                ? 'border-[#D4AF37] bg-gradient-to-b from-[#1A1F33] to-[#121623] shadow-lg shadow-[#D4AF37]/10'
                : 'border-slate-800/80 bg-[#121623]'
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 end-4 rounded-full bg-[#D4AF37] px-3 py-0.5 text-[10px] font-extrabold text-slate-950">
                {isAr ? 'الأكثر مبيعاً' : 'MOST POPULAR'}
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-slate-800 px-2.5 py-1 font-mono text-xs font-bold text-[#F3E5AB]">
                {p.code}
              </span>
              <span className="text-xs font-semibold text-slate-400">{p.type}</span>
            </div>
            <h3 className="mt-3 text-base font-extrabold text-white">
              {isAr ? p.nameAr : p.nameEn}
            </h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#D4AF37]">
                {p.priceEgp.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400">
                EGP / {p.durationDays} {isAr ? 'يوم' : 'days'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-4 text-xs text-slate-300">
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
                <strong className="text-emerald-400">{p.activeSubscribers}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Coupons Strip */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
        <h2 className="text-base font-extrabold text-white">
          {isAr ? 'أكواد الخصم والعروض الترويجية النشطة' : 'Active Promotional & Corporate Discount Codes'}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { code: 'RAMADAN20', pct: '20% OFF', descEn: 'Seasonal campaign across Annual & Quarterly plans', descAr: 'خصم ٢٠٪ على الباقات السنوية وربع السنوية' },
            { code: 'TITAN15', pct: '15% OFF', descEn: 'Member referral reward discount code', descAr: 'خصم ١٥٪ عند ترشيح صديق جديد للنادي' },
            { code: 'CORPORATE25', pct: '25% OFF', descEn: 'CIB, Vodafone & Banque Misr corporate partner rate', descAr: 'خصم ٢٥٪ لموظفي الشركات والبنوك المتعاقدة' },
          ].map((cp) => (
            <div key={cp.code} className="rounded-xl border border-dashed border-[#D4AF37]/40 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-extrabold text-[#D4AF37]">{cp.code}</span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-extrabold text-emerald-300">
                  {cp.pct}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-300">{isAr ? cp.descAr : cp.descEn}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#121623] p-6 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <input
                type="text"
                required
                placeholder="Plan Name (English, e.g. 6-Month Semi-Annual Pro)"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">{isAr ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                  <input
                    type="number"
                    value={priceEgp}
                    onChange={(e) => setPriceEgp(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">{isAr ? 'المدة (يوم)' : 'Duration (Days)'}</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">{isAr ? 'أيام التجميد' : 'Freeze Days'}</label>
                  <input
                    type="number"
                    value={maxFreezeDays}
                    onChange={(e) => setMaxFreezeDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-extrabold text-slate-950"
                >
                  {isAr ? 'حفظ الباقة' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function PaymentsBillingView() {
  const { locale, members, plans, invoices, createInvoicePayment, refundInvoice } =
    usePlatformStore();
  const isAr = locale === 'ar';

  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id ?? 'mem-1001');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? 'plan-annual-vip');
  const [paymentMethod, setPaymentMethod] = useState<InvoiceItem['method']>('INSTAPAY');
  const [couponCode, setCouponCode] = useState('RAMADAN20');
  const [referenceCode, setReferenceCode] = useState('IPA-992837415-CIB');
  const [lastIssuedInvoice, setLastIssuedInvoice] = useState<InvoiceItem | null>(null);
  const [printableInvoice, setPrintableInvoice] = useState<InvoiceItem | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0]!;
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

  const handleIssueInvoice = () => {
    const inv = createInvoicePayment({
      memberId: selectedMemberId,
      planId: selectedPlanId,
      method: paymentMethod,
      couponCode,
      referenceCode,
    });
    setLastIssuedInvoice(inv);
  };

  return (
    <div data-testid="panel-members-billing" className="space-y-6">
      {/* Cashier Checkout & Tax Invoice Generator */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6 lg:col-span-2">
          <h2 className="text-lg font-extrabold text-white">
            {isAr
              ? 'محطة تحصيل الاشتراكات وبوابات الدفع المصرية (Paymob / Fawry / InstaPay)'
              : 'Egypt & Global Cashier Terminal (InstaPay / Paymob / Fawry / Vodafone Cash)'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {isAr
              ? 'إصدار فوري للفاتورة الضريبية شاملة 14% ضريبة القيمة المضافة مع منع التكرار (Idempotency-Key)'
              : 'Idempotent checkout with 14% Egypt VAT calculation and verified webhook signatures'}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-300">
                {isAr ? 'اختر العضو' : 'Select Member'}
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {isAr ? m.fullNameAr : m.fullNameEn} ({m.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">
                {isAr ? 'باقة الاشتراك' : 'Subscription Plan'}
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {isAr ? p.nameAr : p.nameEn} — {p.priceEgp.toLocaleString()} EGP
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300">
                {isAr ? 'وسيلة الدفع المعتمدة' : 'Payment Gateway / Method'}
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(
                  [
                    { id: 'INSTAPAY', labelEn: 'InstaPay Egypt', labelAr: 'إنستاباي (InstaPay)' },
                    { id: 'PAYMOB_CARD', labelEn: 'Paymob Visa/MC', labelAr: 'بطاقة بنكية (Paymob)' },
                    { id: 'VODAFONE_CASH', labelEn: 'Vodafone Cash', labelAr: 'فودافون كاش' },
                    { id: 'FAWRY', labelEn: 'Fawry Reference', labelAr: 'فوري (Fawry Pay)' },
                    { id: 'CASH', labelEn: 'Cash at Reception', labelAr: 'نقدي بالاستقبال' },
                    { id: 'STRIPE', labelEn: 'Stripe Global (USD)', labelAr: 'سترايب دولي (Stripe)' },
                  ] as const
                ).map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold transition ${
                      paymentMethod === pm.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F3E5AB]'
                        : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {isAr ? pm.labelAr : pm.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">
                {isAr ? 'كود الخصم (اختياري)' : 'Coupon Code (RAMADAN20 / TITAN15)'}
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm uppercase text-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">
                {isAr ? 'رقم مرجع التحويل (InstaPay / POS Ref)' : 'Transaction Reference / IPA Handle'}
              </label>
              <input
                type="text"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white"
              />
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
              <div className="flex justify-between text-slate-300">
                <span>{isAr ? 'قيمة الباقة الأساسية' : 'Plan Subtotal'}</span>
                <span className="font-mono font-bold">{subtotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>
                  {isAr ? 'خصم الكوبون' : 'Coupon Discount'} ({Math.round(discountRate * 100)}%)
                </span>
                <span className="font-mono font-bold">-{discount.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{isAr ? 'ضريبة القيمة المضافة (14%)' : 'Egypt VAT (14%)'}</span>
                <span className="font-mono font-bold">+{vat.toLocaleString()} EGP</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between text-lg font-extrabold text-white">
                <span>{isAr ? 'الإجمالي المستحق' : 'Total Payable'}</span>
                <span className="font-mono text-[#D4AF37]">{total.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              data-testid="issue-invoice-btn"
              onClick={handleIssueInvoice}
              className="w-full rounded-xl bg-[#D4AF37] py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-[#D4AF37]/20 transition hover:bg-[#e5c145]"
            >
              {isAr
                ? 'تأكيد التحصيل وإصدار الفاتورة الضريبية + QR'
                : 'Confirm Payment & Issue QR Tax Invoice'}
            </button>

            {lastIssuedInvoice && (
              <div
                data-testid="invoice-status-msg"
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs font-bold text-emerald-300"
              >
                ✅ INV-2026-1002 / {lastIssuedInvoice.invoiceNumber} —{' '}
                {isAr
                  ? `تم التحصيل بنجاح (${lastIssuedInvoice.totalEgp.toLocaleString()} ج.م)`
                  : `Paid EGP ${lastIssuedInvoice.totalEgp.toLocaleString()} via ${lastIssuedInvoice.method}`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoices Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#121623]">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-base font-extrabold text-white">
            {isAr ? 'سجل الفواتير الضريبية والمدفوعات' : 'Issued Tax Invoices & Payment Ledger'}
          </h3>
          <span className="text-xs text-slate-400">
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
                <th className="px-4 py-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-[#F3E5AB]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    {isAr ? inv.memberNameAr : inv.memberNameEn}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">
                    {isAr ? inv.planNameAr : inv.planNameEn}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-200">
                      {inv.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    {inv.totalEgp.toLocaleString()} EGP
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
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-bold text-white hover:border-[#D4AF37]"
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
          <div className="w-full max-w-md rounded-2xl border border-[#D4AF37]/50 bg-[#121623] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <p className="text-xs font-extrabold text-[#D4AF37]">TITANFIT EGYPT — ETA TAX INVOICE</p>
                <h4 className="font-mono text-base font-extrabold">{printableInvoice.invoiceNumber}</h4>
              </div>
              <button type="button" onClick={() => setPrintableInvoice(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-300">
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
                <p className="font-bold text-white">ETA Digital Tax Signature</p>
                <p className="font-mono">SHA256: 9F82A1C0...TitanFit</p>
              </div>
              <QrCode className="h-12 w-12 text-[#D4AF37]" />
            </div>
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="mt-4 w-full rounded-xl bg-[#D4AF37] py-2.5 text-xs font-extrabold text-slate-950"
            >
              {isAr ? 'طباعة / حفظ كملف PDF' : 'Print / Save as PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
