'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Award,
  Building2,
  CheckCircle2,
  Copy,
  Download,
  Droplets,
  Dumbbell,
  FileSpreadsheet,
  Flame,
  Globe,
  Lock,
  MessageSquare,
  Palette,
  Plus,
  QrCode,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  UserCheck,
  X,
} from 'lucide-react';
import {
  type TenantSaaSItem,
  type WorkoutLogEntry,
  usePlatformStore,
} from '../../lib/platform-store';

export function MemberPwaPortalView() {
  const {
    locale,
    members,
    workoutLogs,
    chatMessages,
    logWorkoutSet,
    sendChatMessage,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const currentMember = members[0]!;
  const [qrCountdown, setQrCountdown] = useState(28);
  const [qrWindowHash, setQrWindowHash] = useState('9F4A2C8E');
  const [exerciseEn, setExerciseEn] = useState('Barbell Bench Press');
  const [weightKg, setWeightKg] = useState(115);
  const [reps, setReps] = useState(5);
  const [sets, setSets] = useState(4);
  const [latestPrBanner, setLatestPrBanner] = useState<WorkoutLogEntry | null>(null);

  // Body & Nutrition state
  const [bodyWeightKg, setBodyWeightKg] = useState(82.4);
  const [heightCm, setHeightCm] = useState(181);
  const [waterMl, setWaterMl] = useState(2400);
  const [calories, setCalories] = useState(2350);
  const [proteinG, setProteinG] = useState(192);
  const [restSeconds, setRestSeconds] = useState(0);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          setQrWindowHash(Math.random().toString(16).slice(2, 10).toUpperCase());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (restSeconds <= 0) return;
    const t = setTimeout(() => setRestSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restSeconds]);

  const bmi = Math.round((bodyWeightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;

  const handleLogSet = () => {
    const entry = logWorkoutSet(exerciseEn, exerciseEn, weightKg, reps, sets);
    setLatestPrBanner(entry);
    setRestSeconds(90);
  };

  return (
    <div data-testid="panel-member-pwa" className="space-y-6">
      {/* Top Member App Header */}
      <div className="rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#14192B] via-[#191F36] to-[#211B11] p-6 text-white">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-extrabold text-[#F3E5AB]">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              {isAr ? 'تطبيق العضو الذكي (Installable PWA)' : 'INSTALLABLE MEMBER PWA PORTAL'}
            </span>
            <h1 className="mt-2 text-2xl font-extrabold">
              {isAr
                ? `مرحباً، ${currentMember.fullNameAr} 🔥 (${currentMember.streakDays} يوم التزام متتالي)`
                : `Welcome back, ${currentMember.fullNameEn} 🔥 (${currentMember.streakDays}-Day Streak)`}
            </h1>
            <p className="mt-1 text-xs text-slate-300">
              {isAr
                ? `${currentMember.planNameAr} • تنتهي في ${currentMember.endDate} • النقاط: ${currentMember.points}`
                : `${currentMember.planNameEn} • Valid until ${currentMember.endDate} • ${currentMember.points} XP`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-center">
              <span className="text-[11px] text-slate-400">
                {isAr ? 'مؤشر كتلة الجسم BMI' : 'Current BMI'}
              </span>
              <p className="font-mono text-lg font-extrabold text-emerald-400">{bmi}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-center">
              <span className="text-[11px] text-slate-400">
                {isAr ? 'مرات الحضور' : 'Total Check-ins'}
              </span>
              <p className="font-mono text-lg font-extrabold text-[#D4AF37]">
                {currentMember.checkInsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column PWA Experience */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Column 1: Rotating Digital QR Pass + Gamification Leaderboard */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#121623] p-6 text-center">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>{isAr ? 'بطاقة الدخول الذكية' : 'ROTATING GATE PASS'}</span>
              <span className="font-mono text-emerald-400">HMAC-SHA256</span>
            </div>

            <div className="mx-auto my-5 flex h-44 w-44 flex-col items-center justify-center rounded-2xl border-2 border-[#D4AF37] bg-white p-4 text-slate-950 shadow-xl">
              <QrCode className="h-28 w-28 text-slate-950" />
              <span className="mt-1 font-mono text-[10px] font-extrabold tracking-widest">
                TF:{qrWindowHash}
              </span>
            </div>

            <p className="font-mono text-xs text-[#F3E5AB]">
              TITANFIT:v1:titanfit-egypt:{currentMember.code}:{qrWindowHash}
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-1000"
                style={{ width: `${(qrCountdown / 30) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {isAr
                ? `يتغير الرمز المشفر تلقائياً خلال ${qrCountdown} ثانية لمنع مشاركة الصور`
                : `Anti-screenshot token rotates in ${qrCountdown}s`}
            </p>
          </div>

          {/* Branch Leaderboard */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">
                {isAr ? 'لوحة متصدري الفرع (Leaderboard)' : 'Branch Consistency Leaderboard'}
              </h3>
              <Trophy className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div className="mt-4 space-y-2.5">
              {members.slice(0, 4).map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37]/20 text-xs font-extrabold text-[#D4AF37]">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {isAr ? m.fullNameAr : m.fullNameEn}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-[#F3E5AB]">
                    {m.points.toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Workout Logger + 1RM PR Detector + Rest Timer */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white">
                {isAr
                  ? 'مسجل التمارين وحاسبة الأرقام القياسية (Epley 1RM)'
                  : 'Workout Logger & Auto 1RM PR Engine'}
              </h2>
              <Dumbbell className="h-5 w-5 text-[#D4AF37]" />
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'التمرين' : 'Exercise'}
                </label>
                <select
                  value={exerciseEn}
                  onChange={(e) => setExerciseEn(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                >
                  <option value="Barbell Bench Press">Barbell Bench Press (ضغط صدر بالبار)</option>
                  <option value="Barbell Back Squat">Barbell Back Squat (سكوات خلفي بالبار)</option>
                  <option value="Romanian Deadlift (RDL)">Romanian Deadlift (ديدليفت روماني)</option>
                  <option value="Strict Overhead Press">Strict Overhead Press (ضغط أكتاف)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">{isAr ? 'الوزن (كجم)' : 'Weight (kg)'}</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">{isAr ? 'العدات' : 'Reps'}</label>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">{isAr ? 'المجموعات' : 'Sets'}</label>
                  <input
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white"
                  />
                </div>
              </div>

              <button
                type="button"
                data-testid="log-workout-set-btn"
                onClick={handleLogSet}
                className="w-full rounded-xl bg-[#D4AF37] py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-[#D4AF37]/20"
              >
                {isAr
                  ? 'تسجيل المجموعة وحساب الرقم القياسي (1RM PR)'
                  : 'Log Set & Calculate Epley 1RM PR'}
              </button>

              {latestPrBanner && (
                <div
                  data-testid="pr-notification-msg"
                  className="rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/15 p-3 text-xs font-extrabold text-[#F3E5AB]"
                >
                  🏆 NEW PERSONAL RECORD! {latestPrBanner.exerciseEn}: Est. 1RM{' '}
                  {latestPrBanner.estimated1RmKg} kg ({latestPrBanner.weightKg}kg ×{' '}
                  {latestPrBanner.reps})
                </div>
              )}

              {/* Rest Timer */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Timer className="h-4 w-4 text-[#D4AF37]" />
                  <span>{isAr ? 'مؤقت الراحة بين المجموعات:' : 'Rest Timer:'}</span>
                  <span className="font-mono text-sm font-extrabold text-[#D4AF37]">
                    {restSeconds}s
                  </span>
                </div>
                <div className="flex gap-1">
                  {[60, 90, 120].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setRestSeconds(sec)}
                      className="rounded-lg bg-slate-800 px-2 py-1 font-mono text-[11px] font-bold text-slate-200 hover:bg-[#D4AF37] hover:text-slate-950"
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
              {workoutLogs.slice(0, 3).map((wk) => (
                <div
                  key={wk.id}
                  className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{isAr ? wk.exerciseAr : wk.exerciseEn}</p>
                    <p className="text-[11px] text-slate-400">
                      {wk.sets} sets × {wk.reps} reps @ {wk.weightKg}kg
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="font-mono font-extrabold text-[#D4AF37]">
                      1RM: {wk.estimated1RmKg}kg
                    </span>
                    {wk.isNewPr && (
                      <span className="ms-1.5 rounded bg-[#D4AF37]/20 px-1.5 py-0.5 text-[10px] font-extrabold text-[#F3E5AB]">
                        PR
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Daily Nutrition/Macros + Real-Time Trainer Chat */}
        <div className="space-y-6">
          {/* Nutrition & Hydration Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white">
                {isAr ? 'خطة التغذية، الماكروز، وشرب المياه' : 'Daily Macros & Hydration Tracker'}
              </h2>
              <Flame className="h-5 w-5 text-amber-400" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-slate-900/70 p-3">
                <span className="text-slate-400">{isAr ? 'السعرات' : 'Calories'}</span>
                <p className="mt-1 font-mono text-base font-extrabold text-white">{calories}</p>
                <span className="text-[10px] text-emerald-400">/ 2,600 kcal</span>
              </div>
              <div className="rounded-xl bg-slate-900/70 p-3">
                <span className="text-slate-400">{isAr ? 'البروتين' : 'Protein'}</span>
                <p className="mt-1 font-mono text-base font-extrabold text-[#D4AF37]">{proteinG}g</p>
                <span className="text-[10px] text-slate-400">/ 200g goal</span>
              </div>
              <div className="rounded-xl bg-slate-900/70 p-3">
                <span className="text-slate-400">{isAr ? 'المياه' : 'Hydration'}</span>
                <p className="mt-1 font-mono text-base font-extrabold text-sky-400">{waterMl}ml</p>
                <button
                  type="button"
                  onClick={() => setWaterMl((w) => w + 250)}
                  className="mt-1 rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300"
                >
                  +250ml
                </button>
              </div>
            </div>
          </div>

          {/* Trainer Direct Chat */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {isAr ? 'محادثة مباشرة مع كابتن عمر حسن' : 'Direct Chat — Coach Omar Hassan'}
                  </h3>
                  <p className="text-[11px] text-emerald-400">
                    ● {isAr ? 'متصل الآن — يرد خلال دقائق' : 'Online — Strength & Nutrition Lead'}
                  </p>
                </div>
                <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
              </div>

              <div className="mt-4 max-h-52 space-y-2.5 overflow-y-auto pe-1">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl p-3 text-xs ${
                      msg.senderRole === 'MEMBER'
                        ? 'bg-[#D4AF37]/15 text-[#F3E5AB]'
                        : 'bg-slate-900 text-slate-200'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>{isAr ? msg.senderNameAr : msg.senderNameEn}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="mt-1">{isAr ? msg.textAr : msg.textEn}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isAr ? 'اكتب رسالة لمدربك...' : 'Message your coach...'}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  sendChatMessage(chatInput, 'MEMBER');
                  setChatInput('');
                }}
                className="rounded-xl bg-[#D4AF37] px-3.5 py-2 text-xs font-extrabold text-slate-950"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportsAnalyticsView() {
  const { locale, invoices, members, branches, showToast } = usePlatformStore();
  const isAr = locale === 'ar';

  const handleExportCsv = () => {
    const headers = ['InvoiceNumber,MemberName,Plan,Method,SubtotalEGP,VATEGP,TotalEGP,Status'];
    const rows = invoices.map(
      (i) =>
        `${i.invoiceNumber},"${i.memberNameEn}","${i.planNameEn}",${i.method},${i.subtotalEgp},${i.vatEgp},${i.totalEgp},${i.status}`,
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TitanFit-Financial-Report-2026.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      isAr
        ? 'تم تصدير التقرير المالي بصيغة CSV/Excel بنجاح!'
        : 'Downloaded TitanFit-Financial-Report-2026.csv!',
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#121623] p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-white">
            {isAr
              ? 'التقارير المالية، معدلات الاحتفاظ بالأعضاء، وتصدير Excel / CSV'
              : 'Executive Financial, Retention & Attendance BI Reports'}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {isAr
              ? 'تحليل الإيرادات حسب بوابة الدفع والفرع مع إمكانية التصدير المباشر للمحاسبين والضرائب'
              : 'Granular revenue attribution by payment gateway, branch P&L, and cohort retention'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-extrabold text-slate-950"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isAr ? 'تصدير التقرير المالي (CSV / Excel)' : 'Export Financial Ledger (CSV)'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
          <h3 className="text-sm font-extrabold text-white">
            {isAr ? 'توزيع التحصيل حسب بوابة الدفع' : 'Revenue by Payment Gateway'}
          </h3>
          <div className="mt-4 space-y-3 text-xs">
            {[
              { name: 'InstaPay Egypt (إنستاباي)', pct: 42, amount: '353,850 EGP' },
              { name: 'Paymob Card (بطاقات بنكية)', pct: 31, amount: '261,175 EGP' },
              { name: 'Vodafone Cash & Fawry', pct: 16, amount: '134,800 EGP' },
              { name: 'Cash at Reception (نقدي)', pct: 11, amount: '92,675 EGP' },
            ].map((g) => (
              <div key={g.name}>
                <div className="flex justify-between font-bold text-slate-200">
                  <span>{g.name}</span>
                  <span className="font-mono text-[#D4AF37]">{g.amount}</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
          <h3 className="text-sm font-extrabold text-white">
            {isAr ? 'أداء الفروع وصافي الربحية' : 'Branch Revenue Breakdown'}
          </h3>
          <div className="mt-4 space-y-3 text-xs">
            {branches.map((b, i) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3"
              >
                <div>
                  <p className="font-bold text-white">{isAr ? b.nameAr : b.nameEn}</p>
                  <p className="text-slate-400">{isAr ? b.managerAr : b.managerEn}</p>
                </div>
                <span className="font-mono font-extrabold text-emerald-400">
                  {(420000 - i * 95000).toLocaleString()} EGP
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
          <h3 className="text-sm font-extrabold text-white">
            {isAr ? 'مؤشرات الاحتفاظ والتجديد (Cohort Retention)' : 'Member Retention & LTV Metrics'}
          </h3>
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-xl bg-slate-900/70 p-3">
              <span className="text-slate-400">
                {isAr ? 'معدل التجديد التلقائي للباقات السنوية' : 'Annual Plan Renewal Rate'}
              </span>
              <p className="mt-1 font-mono text-xl font-extrabold text-emerald-400">88.4%</p>
            </div>
            <div className="rounded-xl bg-slate-900/70 p-3">
              <span className="text-slate-400">
                {isAr ? 'متوسط القيمة الدائمة للعضو (LTV)' : 'Average Member Lifetime Value (LTV)'}
              </span>
              <p className="mt-1 font-mono text-xl font-extrabold text-[#D4AF37]">22,400 EGP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TenantSettingsView() {
  const { locale, branches, brandAccentHex, setBrandAccentHex, showToast } = usePlatformStore();
  const isAr = locale === 'ar';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
        <h1 className="text-xl font-extrabold text-white">
          {isAr
            ? 'إعدادات النادي، الفروع، الهوية البصرية، والضرائب المصرية'
            : 'Club Settings, Multi-Branch Setup, White-Label Branding & Tax'}
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          {isAr
            ? 'تخصيص ألوان الهوية البصرية للمستأجر، مواعيد عمل الفروع، وقوالب رسائل واتساب التلقائية'
            : 'Customize tenant white-label theme tokens, branch working hours, Egypt 14% VAT, and WhatsApp templates'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white">
              {isAr ? 'تخصيص الهوية البصرية (White-Label Theme)' : 'White-Label Brand Tokens'}
            </h3>
            <Palette className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { name: 'Titan Championship Gold', hex: '#D4AF37' },
              { name: 'Emerald Athletic', hex: '#10B981' },
              { name: 'Electric Cobalt', hex: '#3B82F6' },
              { name: 'Crimson Power', hex: '#F43F5E' },
            ].map((col) => (
              <button
                key={col.hex}
                type="button"
                onClick={() => {
                  setBrandAccentHex(col.hex);
                  showToast(
                    isAr
                      ? `تم تحديث لون الهوية البصرية إلى ${col.name}`
                      : `Updated tenant brand token to ${col.name}`,
                  );
                }}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${
                  brandAccentHex === col.hex
                    ? 'border-white bg-slate-800 text-white'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: col.hex }} />
                {col.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
          <h3 className="text-base font-extrabold text-white">
            {isAr ? 'الفروع المسجلة ومواعيد العمل' : 'Configured Club Branches'}
          </h3>
          <div className="mt-4 space-y-3">
            {branches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs"
              >
                <div>
                  <p className="font-bold text-white">{isAr ? b.nameAr : b.nameEn}</p>
                  <p className="text-slate-400">
                    {isAr ? b.addressAr : b.addressEn} • {b.workingHours}
                  </p>
                </div>
                <span className="font-mono text-emerald-400">{b.phone}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminConsoleView() {
  const {
    locale,
    tenants,
    auditLogs,
    impersonatedTenant,
    setImpersonatedTenant,
    addTenant,
    toggleTenantStatus,
    login,
    showToast,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const [showAddTenant, setShowAddTenant] = useState(false);
  const [createdTenantCredentials, setCreatedTenantCredentials] = useState<TenantSaaSItem | null>(null);

  // Form states
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('pass123');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#059669');
  const [planTier, setPlanTier] = useState<TenantSaaSItem['planTier']>('PRO');
  const [cityEn, setCityEn] = useState('New Cairo, Egypt');

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameAr.trim()) return;
    const finalSlug = slug.trim() || (nameEn || nameAr).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalLogo = logoUrl.trim() || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80';
    const finalEmail = ownerEmail.trim() || `owner@${finalSlug}.eg`;

    const newTenant = addTenant(
      nameEn || nameAr,
      nameAr || nameEn,
      finalEmail,
      planTier,
      cityEn,
      password,
      finalLogo,
      primaryColor,
      finalSlug,
    );

    setCreatedTenantCredentials(newTenant);
    setShowAddTenant(false);
    setNameAr('');
    setNameEn('');
    setSlug('');
    setOwnerEmail('');
    setLogoUrl('');
  };

  const copyCredentials = (ten: TenantSaaSItem) => {
    const text = `🎉 بيانات تفعيل منصتك الخاصة (${ten.nameAr}):\n🌐 الرابط: https://titanfit.app/${ten.slug}\n📧 اسم المستخدم / الإيميل: ${ten.ownerEmail}\n🔑 كلمة المرور: ${ten.password || 'pass123'}\n🚀 يمكنك تسجيل الدخول الآن وإدارة ناديك ومتدربيك بالكامل!`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(isAr ? 'تم نسخ بيانات الاعتماد لمشاركتها مع العميل!' : 'Copied credentials to clipboard!');
  };

  return (
    <div data-testid="panel-super-admin" className="space-y-6">
      {impersonatedTenant && (
        <div
          data-testid="impersonation-banner"
          className="flex items-center justify-between rounded-2xl border border-amber-500/60 bg-amber-500/15 px-6 py-4 text-xs font-extrabold text-amber-900 dark:text-amber-200"
        >
          <span>
            🛡️ AUDITED IMPERSONATION ACTIVE — Viewing tenant &quot;{impersonatedTenant}&quot; (Logged in
            immutable audit_logs)
          </span>
          <button
            type="button"
            onClick={() => setImpersonatedTenant(null)}
            className="rounded-lg bg-amber-500 px-3 py-1 font-black text-slate-950"
          >
            {isAr ? 'إنهاء جلسة الدعم' : 'Exit Impersonation'}
          </button>
        </div>
      )}

      {/* Created Tenant Success Card Alert */}
      {createdTenantCredentials && (
        <div className="theme-card relative overflow-hidden rounded-3xl border-2 border-emerald-500 bg-emerald-500/10 p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={createdTenantCredentials.logoUrl}
                alt={createdTenantCredentials.nameAr}
                className="h-16 w-16 rounded-2xl border-2 border-emerald-500 object-cover bg-white"
              />
              <div>
                <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                  {isAr ? 'تم تفعيل العميل الجديد بنجاح' : 'TENANT ONBOARDED'}
                </span>
                <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  {isAr ? createdTenantCredentials.nameAr : createdTenantCredentials.nameEn}
                </h3>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-300">
                  {isAr ? 'الرابط: ' : 'URL: '} https://titanfit.app/{createdTenantCredentials.slug} •{' '}
                  {createdTenantCredentials.ownerEmail} • 🔑 {createdTenantCredentials.password}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyCredentials(createdTenantCredentials)}
                className="rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700"
              >
                {isAr ? '📋 نسخ بيانات الدخول للواتساب' : 'Copy Credentials'}
              </button>
              <button
                type="button"
                onClick={() => {
                  login(createdTenantCredentials.ownerEmail, createdTenantCredentials.password);
                  setCreatedTenantCredentials(null);
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800 dark:bg-slate-800"
              >
                {isAr ? '🚀 تسجيل الدخول الآن بحسابه' : 'Login as this Tenant'}
              </button>
              <button
                type="button"
                onClick={() => setCreatedTenantCredentials(null)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="theme-card flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {isAr
              ? 'لوحة مالك المنصة (Super Admin SaaS Multi-Tenant Control Plane)'
              : 'Super Admin SaaS Control Plane & Immutable Audit Explorer'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'إضافة عملاء جدد (White-Label)، تعيين الشعارات وكلمات المرور، وإدارة الاشتراكات'
              : 'Onboard gym/coach tenants, assign custom logos & passwords, and manage SaaS tiers'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddTenant(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-black text-slate-950 shadow-md transition hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          {isAr ? '+ إضافة نادي / مستأجر جديد (White-Label)' : '+ Onboard New Gym Tenant'}
        </button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {tenants.map((ten, idx) => (
          <div
            key={ten.id}
            className="theme-card flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-amber-500/15 px-2.5 py-0.5 font-mono text-xs font-extrabold text-amber-700 dark:text-amber-400">
                  {ten.planTier}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                    ten.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : ten.status === 'TRIAL'
                        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {ten.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {ten.logoUrl ? (
                  <img
                    src={ten.logoUrl}
                    alt={ten.nameAr}
                    className="h-12 w-12 rounded-xl object-cover border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-black">
                    TF
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isAr ? ten.nameAr : ten.nameEn}
                  </h3>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    /{ten.slug} • {ten.cityAr || ten.cityEn}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <p>📧 {ten.ownerEmail}</p>
                <p className="mt-1">🔑 {ten.password || 'pass123'}</p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <div>
                  <span className="text-slate-400">{isAr ? 'الفروع' : 'Branches'}</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{ten.branchesCount}</p>
                </div>
                <div>
                  <span className="text-slate-400">{isAr ? 'الأعضاء' : 'Members'}</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{ten.activeMembersCount}</p>
                </div>
                <div>
                  <span className="text-slate-400">MRR</span>
                  <p className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
                    {(ten.mrrEgp / 1000).toFixed(0)}k EGP
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                data-testid={idx === 0 ? 'impersonate-btn-titanfit-cairo' : undefined}
                onClick={() => setImpersonatedTenant(ten.slug)}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-black text-slate-950 shadow-xs"
              >
                {isAr ? 'دخول دعم مسجل (Impersonate)' : 'Audited Impersonate'}
              </button>
              <button
                type="button"
                onClick={() => copyCredentials(ten)}
                title={isAr ? 'نسخ بيانات الدخول' : 'Copy Credentials'}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Immutable Audit Logs Table */}
      <div className="theme-card overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isAr
                ? 'سجل التدقيق الأمني غير القابل للتعديل (Append-Only Audit Log)'
                : 'Append-Only Security Audit Log (trg_audit_logs_immutable)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? 'محمي بواسطة Trigger في PostgreSQL يمنع أي عملية UPDATE أو DELETE'
                : 'Protected by PostgreSQL BEFORE UPDATE OR DELETE trigger'}
            </p>
          </div>
          <span className="rounded-lg bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            FORCE RLS + IMMUTABLE
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 text-start">{isAr ? 'التوقيت' : 'Timestamp'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'المستخدم والدور' : 'Actor / Role'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'الحدث الأمني' : 'Action'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'التفاصيل' : 'Target Resource'}</th>
                <th className="px-4 py-3 text-start">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
              {auditLogs.map((aud) => (
                <tr key={aud.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono">{aud.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 dark:text-white">{aud.actorEmail}</span>{' '}
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-800 dark:bg-slate-800 dark:text-amber-400">
                      {aud.actorRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {aud.action}
                  </td>
                  <td className="px-4 py-3">{aud.target}</td>
                  <td className="px-4 py-3 font-mono">{aud.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal with White-Label Logo & Password */}
      {showAddTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="theme-card w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAr ? 'إضافة نادي / كوتش جديد للمنصة (White-Label SaaS)' : 'Onboard New Gym / Coach Tenant'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'إنشاء مساحة معزولة بهوية بصرية وشعار وبيانات دخول خاصة' : 'Provision isolated space with custom branding'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTenant(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'اسم النادي / الكوتش (بالعربية)' : 'Gym Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: باور جيم المعادي' : 'Power Gym Maadi'}
                    value={nameAr}
                    onChange={(e) => {
                      setNameAr(e.target.value);
                      if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'اسم النادي (بالإنجليزية)' : 'Gym Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Power Gym"
                    value={nameEn}
                    onChange={(e) => {
                      setNameEn(e.target.value);
                      if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'الرابط المخصص (Slug)' : 'Tenant Slug'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. power-gym"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'الباقة (SaaS Tier)' : 'Subscription Tier'}
                  </label>
                  <select
                    value={planTier}
                    onChange={(e) => setPlanTier(e.target.value as typeof planTier)}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="STARTER">{isAr ? 'STARTER (مدرب فردي)' : 'STARTER (Coach)'}</option>
                    <option value="PRO">{isAr ? 'PRO (نادي متوسط)' : 'PRO (Medium Gym)'}</option>
                    <option value="ENTERPRISE">{isAr ? 'ENTERPRISE (سلسلة أندية)' : 'ENTERPRISE (Multi-Branch)'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'اسم المستخدم / الإيميل للمالك' : 'Owner Email / Username'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@gym.eg"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'كلمة المرور الخاصة به' : 'Owner Password'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. gym2026"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'رابط شعار النادي (Logo URL)' : 'Custom Gym Logo URL'}
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'لون الهوية البصرية الرئيسية' : 'Brand Primary Color'}
                </label>
                <div className="mt-1.5 flex gap-2">
                  {[
                    { name: 'Gold', hex: '#D97706' },
                    { name: 'Emerald', hex: '#059669' },
                    { name: 'Blue', hex: '#2563EB' },
                    { name: 'Purple', hex: '#7C3AED' },
                    { name: 'Crimson', hex: '#E11D48' },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setPrimaryColor(c.hex)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-bold ${
                        primaryColor === c.hex
                          ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-800'
                          : 'border-slate-200'
                      }`}
                    >
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTenant(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-black text-slate-950 shadow-md"
                >
                  {isAr ? 'إنشاء العميل وإصدار بيانات الدخول' : 'Create Tenant & Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

