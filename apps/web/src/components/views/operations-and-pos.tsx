'use client';

import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Dumbbell,
  Edit3,
  Lock,
  MessageCircle,
  MessageSquare,
  Minus,
  Package,
  Phone,
  Plus,
  QrCode,
  Radio,
  Receipt,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Unlock,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { WhatsAppLiveChat } from '../whatsapp-live-chat';
import {
  type AccessLogItem,
  type ClassSessionItem,
  type InvoiceItem,
  type PosProductItem,
  type StaffMemberItem,
  type TrainerPayoutTransaction,
  usePlatformStore,
} from '../../lib/platform-store';

export function ClassesScheduleView() {
  const {
    locale,
    classes,
    members,
    createClassSession,
    cancelAndPromoteWaitlist,
    bookMemberIntoClass,
    simulateGateScan,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddClass, setShowAddClass] = useState(false);
  const [promotedBanner, setPromotedBanner] = useState<string | null>(null);
  const [turnstileQuickResult, setTurnstileQuickResult] = useState<AccessLogItem | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id ?? 'mem-1001');

  // New class form
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [category, setCategory] = useState<ClassSessionItem['category']>('HIIT');
  const [trainerEn, setTrainerEn] = useState('Coach Omar Hassan');
  const [roomEn, setRoomEn] = useState('Arena Studio A');
  const [timeRange, setTimeRange] = useState('07:00 PM – 08:00 PM');
  const [capacity, setCapacity] = useState(20);

  const visibleClasses = classes.filter(
    (c) => categoryFilter === 'ALL' || c.category === categoryFilter,
  );

  const handleDownloadIcs = (cls: ClassSessionItem) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TitanFit//Class Schedule//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${cls.titleEn} (${cls.trainerEn})`,
      `LOCATION:${cls.roomEn}`,
      `DESCRIPTION:TitanFit Group Class - Category: ${cls.category}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cls.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() && !titleAr.trim()) return;
    createClassSession({
      titleEn: titleEn || titleAr,
      titleAr: titleAr || titleEn,
      category,
      trainerEn,
      roomEn,
      timeRange,
      capacity,
    });
    setTitleEn('');
    setTitleAr('');
    setShowAddClass(false);
  };

  return (
    <div data-testid="panel-classes-access" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {isAr
              ? 'جدول الحصص التدريبية، قوائم الانتظار الذكية، وتزامن التقويم (.ICS)'
              : 'Class Schedule, Auto-Waitlist Promotion & Calendar Sync'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'إدارة الحصص الجماعية والترقية التلقائية الفورية من قائمة الانتظار عند إلغاء أي حجز'
              : 'Manage group sessions, trainer assignments, and instant waitlist auto-promotion'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="simulate-turnstile-scan-btn"
            onClick={() => {
              const res = simulateGateScan(
                selectedMemberId,
                'Main Lobby Turnstile #1',
                'بوابة الدخول الرئيسية #١',
              );
              setTurnstileQuickResult(res);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2.5 text-xs font-bold text-emerald-300"
          >
            <QrCode className="h-4 w-4" />
            {isAr ? 'محاكاة مسح QR للبوابة' : 'Simulate Turnstile QR Scan'}
          </button>
          <button
            type="button"
            onClick={() => setShowAddClass(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-extrabold text-slate-950"
          >
            <Plus className="h-4 w-4" />
            {isAr ? '+ إضافة حصة جديدة' : '+ Schedule Class'}
          </button>
        </div>
      </div>

      {turnstileQuickResult && (
        <div
          data-testid="turnstile-status-msg"
          className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 text-xs font-bold text-emerald-300"
        >
          ⚡ Turnstile Decision: {turnstileQuickResult.decision} — Relay Pulse:{' '}
          {turnstileQuickResult.relayPulseMs}ms ({turnstileQuickResult.memberCode})
        </div>
      )}

      {promotedBanner && (
        <div
          data-testid="waitlist-promoted-msg"
          className="rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/15 p-3.5 text-xs font-bold text-[#F3E5AB]"
        >
          🔔 {promotedBanner} (automatically promoted)
        </div>
      )}

      {/* Filter Bar + Member Selector for Quick Booking */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'HIIT', 'STRENGTH', 'SPINNING', 'YOGA', 'BOXING'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                categoryFilter === cat
                  ? 'bg-[#D4AF37] text-slate-950'
                  : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#121623] text-slate-300'
              }`}
            >
              {cat === 'ALL' ? (isAr ? 'جميع الفئات' : 'All Categories') : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isAr ? 'حجز سريع للعضو:' : 'Quick Book Member:'}
          </span>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#121623] px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {isAr ? m.fullNameAr : m.fullNameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {visibleClasses.map((cls, index) => (
          <div
            key={cls.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block rounded-lg bg-[#D4AF37]/15 px-2.5 py-0.5 text-xs font-extrabold text-[#D4AF37]">
                    {cls.category} • {isAr ? cls.dayAr : cls.dayEn}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
                    {isAr ? cls.titleAr : cls.titleEn}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {isAr ? cls.trainerAr : cls.trainerEn} • {isAr ? cls.roomAr : cls.roomEn} •{' '}
                    {cls.timeRange}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadIcs(cls)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-[#D4AF37]"
                >
                  <Download className="h-3.5 w-3.5 text-[#D4AF37]" />
                  .ICS
                </button>
              </div>

              {/* Roster & Waitlist */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>{isAr ? 'الأعضاء المؤكدون' : 'Confirmed Roster'}</span>
                    <span className="text-emerald-400">
                      {cls.bookedMembers.length}/{cls.capacity}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {cls.bookedMembers.map((bm) => (
                      <div key={bm.id} className="flex items-center justify-between text-xs">
                        <span className="text-white">{isAr ? bm.nameAr : bm.nameEn}</span>
                        <span className="text-[10px] font-bold text-emerald-400">{bm.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>{isAr ? 'قائمة الانتظار التلقائية' : 'Auto-Promotion Waitlist'}</span>
                    <span className="text-amber-400">{cls.waitlistMembers.length}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {cls.waitlistMembers.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        {isAr ? 'لا يوجد أعضاء في الانتظار' : 'No members waiting'}
                      </p>
                    ) : (
                      cls.waitlistMembers.map((wm, wIdx) => (
                        <div key={wm.id} className="flex items-center justify-between text-xs">
                          <span className="text-amber-200">
                            #{wIdx + 1} {isAr ? wm.nameAr : wm.nameEn}
                          </span>
                          <span className="text-[10px] text-slate-400">{wm.joinedAt}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-4">
              <button
                type="button"
                onClick={() => bookMemberIntoClass(cls.id, selectedMemberId)}
                className="rounded-xl bg-[#D4AF37] px-3.5 py-2 text-xs font-extrabold text-slate-950"
              >
                {isAr ? '+ حجز مقعد للعضو المختار' : '+ Book Selected Member'}
              </button>

              <button
                type="button"
                data-testid={index === 0 ? 'simulate-cancel-promote-btn' : undefined}
                onClick={() => {
                  cancelAndPromoteWaitlist(cls.id);
                  setPromotedBanner(
                    isAr
                      ? 'تم إلغاء مقعد وترقية العضو الأول من قائمة الانتظار تلقائياً (automatically promoted)!'
                      : 'Spot cancelled — Waitlist #1 automatically promoted to BOOKED!',
                  );
                }}
                className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25"
              >
                {isAr
                  ? 'إلغاء حجز وترقية قائمة الانتظار تلقائياً'
                  : 'Cancel Spot & Auto-Promote Waitlist'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Class Modal */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#121623] p-6 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold">
                {isAr ? 'إضافة حصة تدريبية جديدة للجدول' : 'Schedule New Group Class'}
              </h3>
              <button type="button" onClick={() => setShowAddClass(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="mt-4 space-y-3">
              <input
                type="text"
                required
                placeholder={isAr ? 'اسم الحصة بالعربية' : 'Class Title (Arabic)'}
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <input
                type="text"
                required
                placeholder="Class Title (English, e.g. Titan Kettlebell Burn)"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={trainerEn}
                  onChange={(e) => setTrainerEn(e.target.value)}
                  placeholder="Trainer Name"
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
                <input
                  type="text"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  placeholder="Time Range"
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-extrabold text-slate-950"
                >
                  {isAr ? 'حفظ وجدولة' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AccessControlTurnstilesView() {
  const { locale, members, accessLogs, simulateGateScan } = usePlatformStore();
  const isAr = locale === 'ar';
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id ?? 'mem-1001');
  const [selectedGate, setSelectedGate] = useState({
    en: 'Main Lobby Turnstile #1',
    ar: 'بوابة الدخول الرئيسية #١',
  });

  const gates = [
    { id: 'g1', en: 'Main Lobby Turnstile #1', ar: 'بوابة الدخول الرئيسية #١', status: 'ONLINE', zone: 'Main Floor' },
    { id: 'g2', en: 'Main Lobby Turnstile #2', ar: 'بوابة الدخول الرئيسية #٢', status: 'ONLINE', zone: 'Main Floor' },
    { id: 'g3', en: 'Ladies Private Lounge Gate', ar: 'بوابة استوديو السيدات الخاص', status: 'ONLINE', zone: 'Ladies Wing' },
    { id: 'g4', en: 'VIP Spa & Recovery Gate', ar: 'بوابة السبا وكبار الزوار VIP', status: 'ONLINE', zone: 'VIP Recovery' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {isAr
            ? 'وحدة التحكم في البوابات الإلكترونية والـ QR الدوار (Access Control & Turnstiles)'
            : 'Hardware Turnstile Relay Controller & Rotating HMAC QR Scanner'}
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {isAr
            ? 'تحقق لحظي من توقيع QR المتغير كل 30 ثانية مع منع الدخول المتكرر (Anti-Passback 15m) وإرسال نبضة فتح البوابة (1500ms)'
            : '30-second rotating HMAC-SHA256 QR verification, 15-minute anti-passback protection, and 1500ms TCP/Webhook gate relay pulses'}
        </p>

        {/* 4 Hardware Gates Grid */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {gates.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  {g.status}
                </span>
                <span className="font-mono text-[11px] text-slate-400">1500ms Relay</span>
              </div>
              <p className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">
                {isAr ? g.ar : g.en}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{g.zone}</p>
              <button
                type="button"
                onClick={() => simulateGateScan(selectedMemberId, g.en, g.ar)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37]/15 py-2 text-xs font-extrabold text-[#F3E5AB] transition hover:bg-[#D4AF37] hover:text-slate-950"
              >
                <Unlock className="h-3.5 w-3.5" />
                {isAr ? 'مسح QR وفتح البوابة' : 'Scan QR & Pulse Gate'}
              </button>
            </div>
          ))}
        </div>

        {/* Simulator Bar */}
        <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-[#D4AF37]/30 bg-slate-900/90 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-[#F3E5AB]">
              {isAr ? 'اختر العضو لاختبار البوابة (نشط / مجمد / منتهي):' : 'Select Member to Test Gate Rules:'}
            </span>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#121623] px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
            >
              {members.length === 0 && (
                <option value="">{isAr ? 'لا يوجد أعضاء مسجلين بعد (0 عضو)' : 'No members registered yet'}</option>
              )}
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {isAr ? m.fullNameAr : m.fullNameEn} — [{m.status}]
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() =>
              simulateGateScan(selectedMemberId, selectedGate.en, selectedGate.ar)
            }
            className="rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-extrabold text-slate-950"
          >
            {isAr ? 'تنفيذ مسح QR الآن' : 'Execute Live QR Check-in'}
          </button>
        </div>
      </div>

      {/* Access Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623]">
        <div className="border-b border-slate-800 px-6 py-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {isAr ? 'سجل حركات البوابات الإلكترونية اللحظي' : 'Real-Time Gate Access Audit Trail'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 text-start">{isAr ? 'التوقيت' : 'Time'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'العضو' : 'Member'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'البوابة' : 'Turnstile Gate'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'قرار البوابة' : 'Decision'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'السبب التقني' : 'Verification Detail'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {accessLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'لا توجد تسجيلات دخول اليوم (0 حركة دخول) — البوابات الإلكترونية في وضع الاستعداد بانتظار مسح QR.'
                      : 'No gate access logs recorded today (0 check-ins).'}
                  </td>
                </tr>
              )}
              {accessLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                  <td className="px-4 py-3 font-bold text-white">
                    {isAr ? log.memberNameAr : log.memberNameEn}{' '}
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">({log.memberCode})</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                    {isAr ? log.gateNameAr : log.gateNameEn}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                        log.decision === 'ALLOW_ACCESS'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {log.decision}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                    {isAr ? log.reasonAr : log.reasonEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PosInventoryView() {
  const { locale, posProducts, members, completePosCheckout, addPosProduct, updatePosProduct, deletePosProduct } = usePlatformStore();
  const isAr = locale === 'ar';

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [cart, setCart] = useState<Array<{ productId: string; qty: number }>>([]);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id ?? '');
  const [paymentMethod, setPaymentMethod] = useState<InvoiceItem['method']>('INSTAPAY');

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PosProductItem | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // New Product Form State
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdNameEn, setNewProdNameEn] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<PosProductItem['category']>('PROTEIN');
  const [newProdPrice, setNewProdPrice] = useState(450);
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdSku, setNewProdSku] = useState('PROD-NEW');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdNameAr.trim() && !newProdNameEn.trim()) return;
    addPosProduct({
      nameAr: newProdNameAr || newProdNameEn,
      nameEn: newProdNameEn || newProdNameAr,
      category: newProdCategory,
      priceEgp: newProdPrice,
      stock: newProdStock,
      sku: newProdSku || `SKU-${Date.now().toString().slice(-4)}`,
    });
    setNewProdNameAr('');
    setNewProdNameEn('');
    setShowAddProductModal(false);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updatePosProduct(editingProduct.id, {
      nameAr: editingProduct.nameAr,
      nameEn: editingProduct.nameEn,
      priceEgp: editingProduct.priceEgp,
      stock: editingProduct.stock,
    });
    setEditingProduct(null);
  };

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { productId, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const filteredProducts = posProducts.filter(
    (p) => categoryFilter === 'ALL' || p.category === categoryFilter,
  );

  const subtotal = cart.reduce((sum, item) => {
    const prod = posProducts.find((p) => p.id === item.productId);
    return sum + (prod ? prod.priceEgp * item.qty : 0);
  }, 0);
  const vat = Math.round(subtotal * 0.14);
  const total = subtotal + vat;

  return (
    <div data-testid="panel-pos-reports-chat" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Product Catalog */}
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {isAr
                  ? 'نقطة بيع المكملات الغذائية والبار الرياضي (POS & Supplement Bar)'
                  : 'POS Register, Supplement Bar & Apparel Inventory'}
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'بيع فوري للمشروبات والمكملات وملابس تيتان فيت مع خصم آلي من المخزون وإصدار فاتورة'
                  : 'Ring up protein shakes, supplements, and gear with atomic inventory stock deduction'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddProductModal(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              {isAr ? '+ إضافة مكمل جديد' : '+ Add Supplement'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {(['ALL', 'PROTEIN', 'PRE_WORKOUT', 'DRINKS', 'APPAREL', 'ACCESSORIES'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    categoryFilter === cat
                      ? 'bg-[#D4AF37] text-slate-950'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-5 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">{prod.sku}</span>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                    {prod.stock} {isAr ? 'متاح بالمخزن' : 'in stock'}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">
                  {isAr ? prod.nameAr : prod.nameEn}
                </h3>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                <span className="font-mono text-lg font-extrabold text-[#D4AF37]">
                  {prod.priceEgp.toLocaleString()} EGP
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(prod)}
                    title={isAr ? 'تعديل السعر والمخزون' : 'Edit Product'}
                    className="rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-300 hover:border-[#D4AF37]"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingProductId(prod.id)}
                    title={isAr ? 'حذف المنتج' : 'Delete Product'}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-500 hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addToCart(prod.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {isAr ? 'أضف للسلة' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Shopping Cart Register */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#D4AF37]/40 bg-white p-6 shadow-sm dark:bg-[#121623]">
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#D4AF37]" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isAr ? 'سلة الكاشير الحالية' : 'Active POS Register Cart'}
              </h2>
            </div>
            <span className="rounded-full bg-[#D4AF37]/20 px-2.5 py-0.5 text-xs font-extrabold text-amber-800 dark:text-[#F3E5AB]">
              {cart.reduce((s, c) => s + c.qty, 0)} {isAr ? 'قطع' : 'items'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {cart.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                {isAr ? 'السلة فارغة — اختر منتجات من القائمة' : 'Cart is empty — add items'}
              </p>
            ) : (
              cart.map((item) => {
                const prod = posProducts.find((p) => p.id === item.productId);
                if (!prod) return null;
                return (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {isAr ? prod.nameAr : prod.nameEn}
                      </p>
                      <p className="font-mono text-xs text-[#D4AF37]">
                        {item.qty} × {prod.priceEgp} = {(item.qty * prod.priceEgp).toLocaleString()} EGP
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/15"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-5 space-y-3 border-t border-slate-800 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-400">
                {isAr ? 'ربط بحساب عضو' : 'Link to Member Account'}
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {isAr ? m.fullNameAr : m.fullNameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-mono font-bold">{subtotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'ضريبة القيمة المضافة (14%):' : 'VAT (14%):'}</span>
                <span className="font-mono font-bold">+{vat.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-extrabold text-slate-900 dark:text-white">
                <span>{isAr ? 'الإجمالي:' : 'Total:'}</span>
                <span className="font-mono text-[#D4AF37]">{total.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={cart.length === 0}
          onClick={() => {
            completePosCheckout(cart, paymentMethod, selectedMemberId);
            setCart([]);
          }}
          className="mt-5 w-full rounded-xl bg-[#D4AF37] py-3 text-xs font-extrabold text-slate-950 disabled:opacity-40 hover:bg-amber-400"
        >
          {isAr
            ? `إتمام البيع وخصم المخزون (${total.toLocaleString()} ج.م)`
            : `Complete POS Sale (EGP ${total.toLocaleString()})`}
        </button>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold">
                {isAr ? 'إضافة منتج أو مكمل جديد للمخزون' : 'Add New Inventory Product'}
              </h3>
              <button type="button" onClick={() => setShowAddProductModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'اسم المنتج بالعربية' : 'Product Name (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: واي بروتين أيزوليت 2 كجم"
                  value={newProdNameAr}
                  onChange={(e) => setNewProdNameAr(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'اسم المنتج بالإنجليزية' : 'Product Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Standard 100% Whey Isolate 2kg"
                  value={newProdNameEn}
                  onChange={(e) => setNewProdNameEn(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'القسم' : 'Category'}
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as PosProductItem['category'])}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="PROTEIN">PROTEIN (بروتين)</option>
                    <option value="PRE_WORKOUT">PRE_WORKOUT (طاقة وتركيز)</option>
                    <option value="DRINKS">DRINKS (مشروبات وبار)</option>
                    <option value="APPAREL">APPAREL (ملابس وأحزمة)</option>
                    <option value="ACCESSORIES">ACCESSORIES (شيكر ومستلزمات)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'كود المخزن SKU' : 'SKU Code'}
                  </label>
                  <input
                    type="text"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'السعر (ج.م)' : 'Price (EGP)'}
                  </label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'الكمية المتاحة بالمخزن' : 'Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
                >
                  {isAr ? 'إضافة المنتج' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold">
                {isAr ? `تعديل منتج (${editingProduct.sku})` : `Edit Product (${editingProduct.sku})`}
              </h3>
              <button type="button" onClick={() => setEditingProduct(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.nameAr}
                  onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.nameEn}
                  onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'السعر (ج.م)' : 'Price (EGP)'}
                  </label>
                  <input
                    type="number"
                    value={editingProduct.priceEgp}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceEgp: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'المخزون المتوفر' : 'Stock Qty'}
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
                >
                  {isAr ? 'تحديث المنتج' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-white p-6 text-slate-900 shadow-2xl dark:border-rose-500/40 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? 'تأكيد حذف المنتج' : 'Confirm Product Deletion'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'هل أنت متأكد من حذف هذا المنتج نهائياً من نقطة البيع والمخزون؟'
                    : 'Are you sure you want to delete this product from POS inventory?'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePosProduct(deletingProductId);
                  setDeletingProductId(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-rose-700"
              >
                {isAr ? 'نعم، احذف المنتج' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StaffTrainersView() {
  const {
    locale,
    staff,
    members,
    trainerPayouts,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    recordTrainerPayout,
    activeTraineeChatId,
    setActiveTraineeChatId,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const [trainersViewMode, setTrainersViewMode] = useState<'STAFF_GRID' | 'WHATSAPP_LIVE'>('STAFF_GRID');
  const [traineeSearch, setTraineeSearch] = useState('');
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMemberItem | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const [selectedTrainerForPayout, setSelectedTrainerForPayout] = useState<StaffMemberItem | null>(null);

  // New Trainer Form State
  const [newStaffNameAr, setNewStaffNameAr] = useState('');
  const [newStaffNameEn, setNewStaffNameEn] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffMemberItem['role']>('TRAINER');
  const [newStaffSpecialtyAr, setNewStaffSpecialtyAr] = useState('');
  const [newStaffSpecialtyEn, setNewStaffSpecialtyEn] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('+20100');
  const [newStaffWhatsapp, setNewStaffWhatsapp] = useState('20100');
  const [newStaffShiftAr, setNewStaffShiftAr] = useState('٠٨:٠٠ ص – ٠٤:٠٠ م');
  const [newStaffShiftEn, setNewStaffShiftEn] = useState('08:00 AM – 04:00 PM');
  const [newStaffBaseSalary, setNewStaffBaseSalary] = useState(12000);
  const [newStaffCommission, setNewStaffCommission] = useState(35);
  const [newStaffPtRate, setNewStaffPtRate] = useState(450);
  const [newStaffBioAr, setNewStaffBioAr] = useState('');
  const [newStaffAvatarUrl, setNewStaffAvatarUrl] = useState('');

  // Payout Form State
  const [payoutTrainerId, setPayoutTrainerId] = useState(staff[0]?.id || 'stf-1');
  const [payoutAmount, setPayoutAmount] = useState(15000);
  const [payoutType, setPayoutType] = useState<TrainerPayoutTransaction['payoutType']>('COMMISSION');
  const [payoutNote, setPayoutNote] = useState('');

  const handleCreateTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffNameAr.trim() && !newStaffNameEn.trim()) return;
    addStaffMember({
      nameAr: newStaffNameAr.trim() || newStaffNameEn.trim(),
      nameEn: newStaffNameEn.trim() || newStaffNameAr.trim(),
      role: newStaffRole,
      specialtyAr: newStaffSpecialtyAr.trim() || (isAr ? 'مدرب معتمد' : 'Certified Coach'),
      specialtyEn: newStaffSpecialtyEn.trim() || 'Certified Fitness Coach',
      branchId: 'br-new-cairo',
      phone: newStaffPhone,
      whatsappNumber: newStaffWhatsapp.replace(/[^0-9]/g, ''),
      shiftAr: newStaffShiftAr,
      shiftEn: newStaffShiftEn,
      baseSalaryEgp: Number(newStaffBaseSalary) || 10000,
      commissionRatePercent: Number(newStaffCommission) || 30,
      ptSessionRateEgp: Number(newStaffPtRate) || 400,
      bioAr: newStaffBioAr || 'مدرب محترف معتمد في بناء الأجسام واللياقة البدنية.',
      bioEn: 'Certified fitness and bodybuilding coach with customized training plans.',
      avatarUrl:
        newStaffAvatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });
    setNewStaffNameAr('');
    setNewStaffNameEn('');
    setNewStaffSpecialtyAr('');
    setNewStaffSpecialtyEn('');
    setNewStaffBioAr('');
    setShowAddTrainerModal(false);
  };

  const handleRecordPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trainer = staff.find((s) => s.id === payoutTrainerId);
    if (!trainer) return;
    recordTrainerPayout({
      trainerId: trainer.id,
      trainerNameAr: trainer.nameAr,
      trainerNameEn: trainer.nameEn,
      amountEgp: Number(payoutAmount) || 0,
      payoutType,
      note: payoutNote || (isAr ? `صرف ${payoutType}` : `Payout ${payoutType}`),
    });
    setShowPayoutModal(false);
    setPayoutNote('');
  };

  const handleUpdateFinancials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    updateStaffMember(editingStaff.id, {
      baseSalaryEgp: editingStaff.baseSalaryEgp,
      commissionRatePercent: editingStaff.commissionRatePercent,
      ptSessionRateEgp: editingStaff.ptSessionRateEgp,
      phone: editingStaff.phone,
      whatsappNumber: editingStaff.whatsappNumber,
      specialtyAr: editingStaff.specialtyAr,
      specialtyEn: editingStaff.specialtyEn,
    });
    setEditingStaff(null);
  };

  const openPayoutForTrainer = (trainer: StaffMemberItem) => {
    setSelectedTrainerForPayout(trainer);
    setPayoutTrainerId(trainer.id);
    const comm = Math.round((trainer.monthlyRevenueEgp * trainer.commissionRatePercent) / 100);
    setPayoutAmount(comm > 0 ? comm : (trainer.baseSalaryEgp || 10000));
    setPayoutNote(
      isAr
        ? `صرف مستحقات عمولة لشهر نوفمبر — ${trainer.nameAr}`
        : `November commission payout — ${trainer.nameEn}`,
    );
    setShowPayoutModal(true);
  };

  const totalPtRevenue = staff.reduce((sum, s) => sum + s.monthlyRevenueEgp, 0);
  const totalCommissionsEarned = staff.reduce(
    (sum, s) => sum + Math.round((s.monthlyRevenueEgp * s.commissionRatePercent) / 100),
    0,
  );
  const totalPayoutsGiven = trainerPayouts.reduce((sum, p) => sum + p.amountEgp, 0);

  return (
    <div data-testid="panel-staff-trainers" className="space-y-6">
      {/* Top Switcher: Staff Grid vs WhatsApp Live Trainee Console */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTrainersViewMode('STAFF_GRID')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition ${
            trainersViewMode === 'STAFF_GRID'
              ? 'bg-[#D4AF37] text-slate-950 shadow-md'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-[#121623] dark:text-slate-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{isAr ? '👥 طاقم المدربين والعمولات المالية' : 'Staff Coaches & Commissions'}</span>
        </button>

        <button
          type="button"
          onClick={() => setTrainersViewMode('WHATSAPP_LIVE')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition ${
            trainersViewMode === 'WHATSAPP_LIVE'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-[#121623] dark:text-slate-300'
          }`}
        >
          <MessageCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          <span>{isAr ? '💬 محادثات الواتساب الحية مع المتدربين' : 'WhatsApp Live Trainee Chat'}</span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300">
            Real-Time
          </span>
        </button>
      </div>

      {trainersViewMode === 'WHATSAPP_LIVE' ? (
        /* Real-Time WhatsApp Web Coach Console */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Trainees Contacts Sidebar */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#121623]">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {isAr ? 'قائمة متدربي النادي' : 'Trainees Directory'}
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  {members.length} {isAr ? 'متدرب' : 'members'}
                </span>
              </div>
              <div className="relative mt-2.5">
                <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={traineeSearch}
                  onChange={(e) => setTraineeSearch(e.target.value)}
                  placeholder={isAr ? 'بحث بالاسم أو رقم الهاتف...' : 'Search trainee...'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pe-3 ps-8 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-3 max-h-[500px] space-y-1.5 overflow-y-auto">
              {members.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  {isAr ? 'لا يوجد متدربون مسجلون بعد' : 'No members yet'}
                </div>
              ) : (
                members
                  .filter((m) => {
                    if (!traineeSearch.trim()) return true;
                    const q = traineeSearch.toLowerCase();
                    return (
                      m.fullNameAr.includes(q) ||
                      m.fullNameEn.toLowerCase().includes(q) ||
                      m.phone.includes(q)
                    );
                  })
                  .map((m) => {
                    const isSelected = (activeTraineeChatId || members[0]?.id) === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setActiveTraineeChatId(m.id)}
                        className={`w-full text-start flex items-center gap-3 rounded-2xl p-2.5 transition ${
                          isSelected
                            ? 'bg-emerald-500/15 ring-1 ring-emerald-500/50 dark:bg-emerald-500/20'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 font-black text-[#D4AF37] ring-1 ring-[#D4AF37]/30">
                          {m.avatarInitials || m.fullNameAr.slice(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate text-xs font-black text-slate-900 dark:text-white">
                              {isAr ? m.fullNameAr : m.fullNameEn}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">●</span>
                          </div>
                          <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {isAr ? m.planNameAr : m.planNameEn} • {m.phone}
                          </span>
                        </div>
                      </button>
                    );
                  })
              )}
            </div>
          </div>

          {/* Right Live WhatsApp Chat Window */}
          <div className="lg:col-span-2">
            {members.length === 0 ? (
              <div className="flex h-[620px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#121623]">
                <MessageCircle className="h-12 w-12 text-slate-400 mb-3" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {isAr ? 'لا يوجد متدربون للتواصل معهم بعد' : 'No trainees to message yet'}
                </h3>
              </div>
            ) : (
              <WhatsAppLiveChat
                currentRole="TRAINER"
                contactNameAr={
                  (members.find((m) => m.id === (activeTraineeChatId || members[0]?.id)) || members[0])
                    ?.fullNameAr || 'المتدرب'
                }
                contactNameEn={
                  (members.find((m) => m.id === (activeTraineeChatId || members[0]?.id)) || members[0])
                    ?.fullNameEn || 'Trainee'
                }
                contactAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                contactSubtitleAr={
                  ((members.find((m) => m.id === (activeTraineeChatId || members[0]?.id)) || members[0])
                    ?.planNameAr || 'عضوية نشطة') + ' • متدرب'
                }
                contactSubtitleEn={
                  ((members.find((m) => m.id === (activeTraineeChatId || members[0]?.id)) || members[0])
                    ?.planNameEn || 'Active Member') + ' • Trainee'
                }
                contactPhone={
                  (members.find((m) => m.id === (activeTraineeChatId || members[0]?.id)) || members[0])
                    ?.phone
                }
                isAr={isAr}
                memberId={
                  (members.find((m) => m.id === (activeTraineeChatId || members[0]?.id)) || members[0])
                    ?.id
                }
              />
            )}
          </div>
        </div>
      ) : (
        /* Staff Grid & Financial Payouts View */
        <>
          {/* Header Banner & Financial Metrics KPI */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#121623]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-800 dark:bg-[#D4AF37]/20 dark:text-[#F3E5AB]">
              <Users className="h-3.5 w-3.5 text-[#D4AF37]" />
              {isAr ? 'إدارة الكباتن والمدربين والعمولات المالية' : 'TRAINERS & FINANCIAL COMMISSIONS'}
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              {isAr
                ? 'فريق التدريب والعمولات والمعاملات المالية'
                : 'Coaching Staff, Shifts & PT Commissions'}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? 'إدارة حسابات المدربين، تحديد نسب العمولات، الراتب الأساسي، سعر الحصة، وتسجيل صرف المستحقات'
                : 'Manage trainer profiles, commissions, base salaries, PT rates, and record payouts'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPayoutTrainerId(staff[0]?.id || '');
                setShowPayoutModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-300"
            >
              <DollarSign className="h-4 w-4" />
              {isAr ? 'صرف مستحقات / عمولات' : 'Record Payout'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddTrainerModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              {isAr ? '+ إضافة كابتن جديد' : '+ Add New Coach'}
            </button>
          </div>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? 'إجمالي المدربين' : 'Active Coaches'}
            </span>
            <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{staff.length}</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              {isAr ? 'طاقم معتمد' : 'Certified Staff'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? 'مبيعات التدريب الخاص (PT)' : 'Total PT Revenue'}
            </span>
            <p className="mt-1 font-mono text-xl font-extrabold text-slate-900 dark:text-white">
              {totalPtRevenue.toLocaleString()} <span className="text-xs">ج.م</span>
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400">
              {isAr ? 'خلال الشهر الجاري' : 'Current Month'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? 'العمولات المستحقة' : 'Commissions Earned'}
            </span>
            <p className="mt-1 font-mono text-xl font-extrabold text-[#D4AF37]">
              {totalCommissionsEarned.toLocaleString()} <span className="text-xs">ج.م</span>
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {isAr ? 'محسوبة بالنسب المحددة' : 'Per trainer rates'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? 'إجمالي المنصرف للمدربين' : 'Total Payouts Done'}
            </span>
            <p className="mt-1 font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalPayoutsGiven.toLocaleString()} <span className="text-xs">ج.م</span>
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              {isAr ? 'مسجل بالدفاتر' : 'Audited transactions'}
            </span>
          </div>
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((s) => {
          const commissionEgp = Math.round((s.monthlyRevenueEgp * s.commissionRatePercent) / 100);
          const totalEstimatedIncome = (s.baseSalaryEgp || 0) + commissionEgp;
          return (
            <div
              key={s.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:border-[#D4AF37]/60 dark:border-slate-800/80 dark:bg-[#121623]"
            >
              <div>
                {/* Top Coach Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        s.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={s.nameAr}
                      className="h-14 w-14 rounded-2xl border-2 border-amber-500/40 object-cover shadow-sm"
                    />
                    <div>
                      <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-[#D4AF37]/15 dark:text-[#D4AF37]">
                        {s.role}
                      </span>
                      <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                        {isAr ? s.nameAr : s.nameEn}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isAr ? s.specialtyAr : s.specialtyEn}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-xl bg-emerald-500/15 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                    ★ {s.rating}
                  </span>
                </div>

                {/* Bio & Contact info */}
                {s.bioAr && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {isAr ? s.bioAr : s.bioEn}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <a
                    href={`tel:${s.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-mono text-[11px]">{s.phone}</span>
                  </a>
                  {s.whatsappNumber && (
                    <a
                      href={`https://wa.me/${s.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-bold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
                    </a>
                  )}
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr ? `الوردية: ${s.shiftAr}` : `Shift: ${s.shiftEn}`}
                  </span>
                </div>

                {/* Financial Terms Breakdown Box */}
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs font-extrabold text-slate-800 dark:border-slate-800 dark:text-white">
                    <span>{isAr ? 'البنود المالية والعمولات' : 'Financial Terms & Rates'}</span>
                    <button
                      type="button"
                      onClick={() => setEditingStaff(s)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline dark:text-amber-400"
                    >
                      <Edit3 className="h-3 w-3" />
                      {isAr ? 'تعديل' : 'Edit'}
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        {isAr ? 'الراتب الأساسي' : 'Base Salary'}
                      </span>
                      <p className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                        {(s.baseSalaryEgp || 0).toLocaleString()} EGP
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        {isAr ? 'نسبة العمولة' : 'Commission %'}
                      </span>
                      <p className="font-mono text-sm font-extrabold text-[#D4AF37]">
                        {s.commissionRatePercent}%
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        {isAr ? 'سعر الحصة PT' : 'PT Session Rate'}
                      </span>
                      <p className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                        {s.ptSessionRateEgp || 400} EGP
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        {isAr ? 'المتدربون النشطون' : 'Active Clients'}
                      </span>
                      <p className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                        {s.activeClients}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-slate-200 pt-2 dark:border-slate-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {isAr ? 'مبيعات الشهر الحالي:' : 'Month PT Revenue:'}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {s.monthlyRevenueEgp.toLocaleString()} EGP
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {isAr ? 'عمولة الشهر المستحقة:' : 'Earned Commission:'}
                      </span>
                      <span className="font-mono font-bold text-[#D4AF37]">
                        {commissionEgp.toLocaleString()} EGP
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/80 pt-1 text-xs font-extrabold text-emerald-700 dark:border-slate-800 dark:text-emerald-400">
                      <span>{isAr ? 'إجمالي مستحقات الشهر:' : 'Est. Total Earnings:'}</span>
                      <span className="font-mono">{totalEstimatedIncome.toLocaleString()} EGP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Payout & Delete */}
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => openPayoutForTrainer(s)}
                  className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-center text-xs font-extrabold text-white hover:bg-emerald-700"
                >
                  {isAr ? 'صرف عمولة / مستحقات' : 'Record Payout'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingStaffId(s.id)}
                  title={isAr ? 'مسح المدرب من الجيم' : 'Delete Trainer'}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Transactions / Payouts Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#121623]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isAr ? 'سجل صرف العمولات والمستحقات المالية للمدربين' : 'Trainer Financial Payouts Ledger'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? 'توثيق رسمي لجميع الرواتب والعمولات والمكافآت المصروفة لطاقم التدريب'
                : 'Audited log of all salaries, commissions, and bonuses disbursed'}
            </p>
          </div>
          <Receipt className="h-5 w-5 text-[#D4AF37]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'اسم الكابتن' : 'Coach'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'نوع الصرف' : 'Payout Type'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'المبلغ' : 'Amount (EGP)'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'البيان والملاحظات' : 'Note'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {trainerPayouts.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{tx.date}</td>
                  <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                    {isAr ? tx.trainerNameAr : tx.trainerNameEn}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                        tx.payoutType === 'COMMISSION'
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                          : tx.payoutType === 'SALARY'
                            ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300'
                            : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {tx.payoutType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-extrabold text-slate-900 dark:text-white">
                    {tx.amountEgp.toLocaleString()} EGP
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{tx.note}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      {isAr ? 'تم التحويل والصرف' : 'Disbursed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

  {/* Modal 1: Add Trainer */}
      {showAddTrainerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold">
                {isAr ? 'إضافة مدرب / كابتن جديد للجيم' : 'Add New Gym Coach / Staff'}
              </h3>
              <button type="button" onClick={() => setShowAddTrainerModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTrainer} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'الاسم بالعربية' : 'Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: كابتن أحمد طارق"
                    value={newStaffNameAr}
                    onChange={(e) => setNewStaffNameAr(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coach Ahmed Tarek"
                    value={newStaffNameEn}
                    onChange={(e) => setNewStaffNameEn(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'التخصص (عربي)' : 'Specialty (Arabic)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="كمال أجسام وقوة بدنية"
                    value={newStaffSpecialtyAr}
                    onChange={(e) => setNewStaffSpecialtyAr(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'الدور الوظيفي' : 'Role'}
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as StaffMemberItem['role'])}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="TRAINER">TRAINER (مدرب خاص / كابتن)</option>
                    <option value="BRANCH_MANAGER">BRANCH_MANAGER (مدير فرع)</option>
                    <option value="RECEPTIONIST">RECEPTIONIST (موظف استقبال)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'رقم الواتساب' : 'WhatsApp'}
                  </label>
                  <input
                    type="text"
                    value={newStaffWhatsapp}
                    onChange={(e) => setNewStaffWhatsapp(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Financial Terms Section */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <span className="block text-xs font-extrabold text-amber-900 dark:text-amber-200">
                  {isAr ? '💰 الشروط المالية والعمولات' : 'Financial Terms & Rates'}
                </span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {isAr ? 'الراتب الأساسي (ج.م)' : 'Base Salary (EGP)'}
                    </label>
                    <input
                      type="number"
                      value={newStaffBaseSalary}
                      onChange={(e) => setNewStaffBaseSalary(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {isAr ? 'نسبة العمولة (%)' : 'Commission (%)'}
                    </label>
                    <input
                      type="number"
                      value={newStaffCommission}
                      onChange={(e) => setNewStaffCommission(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {isAr ? 'سعر الحصة PT (ج.م)' : 'PT Rate (EGP)'}
                    </label>
                    <input
                      type="number"
                      value={newStaffPtRate}
                      onChange={(e) => setNewStaffPtRate(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'نبذة عن خبرة الكابتن' : 'Coach Bio / Experience'}
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: خبرة 7 سنوات في إعداد الأبطال وبرامج التغذية المخصصة..."
                  value={newStaffBioAr}
                  onChange={(e) => setNewStaffBioAr(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-2 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTrainerModal(false)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
                >
                  {isAr ? 'إضافة وتثبيت المدرب' : 'Save Coach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Payout */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-white p-6 text-slate-900 shadow-2xl dark:border-emerald-500/40 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold">
                {isAr ? 'صرف مستحقات / عمولات لكابتن' : 'Record Trainer Payout'}
              </h3>
              <button type="button" onClick={() => setShowPayoutModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleRecordPayoutSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'اختر الكابتن' : 'Select Coach'}
                </label>
                <select
                  value={payoutTrainerId}
                  onChange={(e) => setPayoutTrainerId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isAr ? s.nameAr : s.nameEn} — [عمولة: {s.commissionRatePercent}% • مبيعات:{' '}
                      {s.monthlyRevenueEgp} EGP]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'نوع المستحقات' : 'Payout Type'}
                  </label>
                  <select
                    value={payoutType}
                    onChange={(e) =>
                      setPayoutType(e.target.value as TrainerPayoutTransaction['payoutType'])
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="COMMISSION">COMMISSION (عمولة حصص واشتراكات)</option>
                    <option value="SALARY">SALARY (راتب أساسي)</option>
                    <option value="BONUS">BONUS (مكافأة أداء وتميز)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'المبلغ (ج.م)' : 'Amount (EGP)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'ملاحظات وسند الصرف' : 'Note / Reference'}
                </label>
                <input
                  type="text"
                  placeholder="مثال: تسوية مبيعات شهر أكتوبر عبر إنستاباي"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-2 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-700"
                >
                  {isAr ? 'تأكيد وصرف المستحقات' : 'Disburse Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Financial Terms */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold">
                {isAr
                  ? `تعديل البنود المالية: ${editingStaff.nameAr}`
                  : `Edit Financial Terms: ${editingStaff.nameEn}`}
              </h3>
              <button type="button" onClick={() => setEditingStaff(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateFinancials} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'الراتب الأساسي (ج.م)' : 'Base Salary (EGP)'}
                  </label>
                  <input
                    type="number"
                    value={editingStaff.baseSalaryEgp || 0}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, baseSalaryEgp: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'نسبة العمولة (%)' : 'Commission (%)'}
                  </label>
                  <input
                    type="number"
                    value={editingStaff.commissionRatePercent}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        commissionRatePercent: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'سعر حصة التدريب الخاص PT (ج.م)' : 'PT Session Rate (EGP)'}
                </label>
                <input
                  type="number"
                  value={editingStaff.ptSessionRateEgp || 400}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, ptSessionRateEgp: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-2 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
                >
                  {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Delete Trainer Confirmation */}
      {deletingStaffId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-white p-6 text-slate-900 shadow-2xl dark:border-rose-500/40 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">
                  {isAr ? 'تأكيد مسح الكابتن / المدرب' : 'Confirm Coach Deletion'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'هل أنت متأكد من حذف هذا الكابتن نهائياً من سجلات الجيم وفريق التدريب؟'
                    : 'Are you sure you want to permanently delete this trainer from gym records?'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingStaffId(null)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStaffMember(deletingStaffId);
                  setDeletingStaffId(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-rose-700"
              >
                {isAr ? 'نعم، احذف الكابتن' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
