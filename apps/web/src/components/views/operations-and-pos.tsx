'use client';

import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Dumbbell,
  Lock,
  Minus,
  Package,
  Plus,
  QrCode,
  Radio,
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
import {
  type AccessLogItem,
  type ClassSessionItem,
  type InvoiceItem,
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
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#121623] p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-white">
            {isAr
              ? 'جدول الحصص التدريبية، قوائم الانتظار الذكية، وتزامن التقويم (.ICS)'
              : 'Class Schedule, Auto-Waitlist Promotion & Calendar Sync'}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
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
                  : 'border border-slate-800 bg-[#121623] text-slate-300'
              }`}
            >
              {cat === 'ALL' ? (isAr ? 'جميع الفئات' : 'All Categories') : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {isAr ? 'حجز سريع للعضو:' : 'Quick Book Member:'}
          </span>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-[#121623] px-3 py-2 text-xs font-bold text-white"
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
            className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#121623] p-6"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block rounded-lg bg-[#D4AF37]/15 px-2.5 py-0.5 text-xs font-extrabold text-[#D4AF37]">
                    {cls.category} • {isAr ? cls.dayAr : cls.dayEn}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold text-white">
                    {isAr ? cls.titleAr : cls.titleEn}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
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
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
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

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
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
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-[#121623] p-6 text-white">
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
      <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
        <h1 className="text-xl font-extrabold text-white">
          {isAr
            ? 'وحدة التحكم في البوابات الإلكترونية والـ QR الدوار (Access Control & Turnstiles)'
            : 'Hardware Turnstile Relay Controller & Rotating HMAC QR Scanner'}
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          {isAr
            ? 'تحقق لحظي من توقيع QR المتغير كل 30 ثانية مع منع الدخول المتكرر (Anti-Passback 15m) وإرسال نبضة فتح البوابة (1500ms)'
            : '30-second rotating HMAC-SHA256 QR verification, 15-minute anti-passback protection, and 1500ms TCP/Webhook gate relay pulses'}
        </p>

        {/* 4 Hardware Gates Grid */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {gates.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  {g.status}
                </span>
                <span className="font-mono text-[11px] text-slate-400">1500ms Relay</span>
              </div>
              <p className="mt-2 text-sm font-extrabold text-white">
                {isAr ? g.ar : g.en}
              </p>
              <p className="text-xs text-slate-400">{g.zone}</p>
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
              className="rounded-xl border border-slate-700 bg-[#121623] px-3 py-2 text-xs font-bold text-white"
            >
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
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#121623]">
        <div className="border-b border-slate-800 px-6 py-4">
          <h3 className="text-base font-extrabold text-white">
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
              {accessLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.timestamp}</td>
                  <td className="px-4 py-3 font-bold text-white">
                    {isAr ? log.memberNameAr : log.memberNameEn}{' '}
                    <span className="font-mono text-xs text-slate-400">({log.memberCode})</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">
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
                  <td className="px-4 py-3 text-xs text-slate-300">
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
  const { locale, posProducts, members, completePosCheckout } = usePlatformStore();
  const isAr = locale === 'ar';

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [cart, setCart] = useState<Array<{ productId: string; qty: number }>>([
    { productId: 'pos-3', qty: 1 },
  ]);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id ?? 'mem-1001');
  const [paymentMethod, setPaymentMethod] = useState<InvoiceItem['method']>('INSTAPAY');

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
        <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
          <h1 className="text-xl font-extrabold text-white">
            {isAr
              ? 'نقطة بيع المكملات الغذائية والبار الرياضي (POS & Supplement Bar)'
              : 'POS Register, Supplement Bar & Apparel Inventory'}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {isAr
              ? 'بيع فوري للمشروبات والمكملات وملابس تيتان فيت مع خصم آلي من المخزون وإصدار فاتورة'
              : 'Ring up protein shakes, supplements, and gear with atomic inventory stock deduction'}
          </p>

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
                      : 'border border-slate-800 bg-slate-900 text-slate-300'
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
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#121623] p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">{prod.sku}</span>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                    {prod.stock} {isAr ? 'متاح بالمخزن' : 'in stock'}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-extrabold text-white">
                  {isAr ? prod.nameAr : prod.nameEn}
                </h3>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                <span className="font-mono text-lg font-extrabold text-[#D4AF37]">
                  {prod.priceEgp.toLocaleString()} EGP
                </span>
                <button
                  type="button"
                  onClick={() => addToCart(prod.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 py-2 text-xs font-extrabold text-slate-950"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isAr ? 'أضف للسلة' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Shopping Cart Register */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#D4AF37]/40 bg-[#121623] p-6">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#D4AF37]" />
              <h2 className="text-base font-extrabold text-white">
                {isAr ? 'سلة الكاشير الحالية' : 'Active POS Register Cart'}
              </h2>
            </div>
            <span className="rounded-full bg-[#D4AF37]/20 px-2.5 py-0.5 text-xs font-extrabold text-[#F3E5AB]">
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
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">
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

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-mono font-bold">{subtotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'ضريبة القيمة المضافة (14%):' : 'VAT (14%):'}</span>
                <span className="font-mono font-bold">+{vat.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-extrabold text-white">
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
          className="mt-5 w-full rounded-xl bg-[#D4AF37] py-3 text-xs font-extrabold text-slate-950 disabled:opacity-40"
        >
          {isAr
            ? `إتمام البيع وخصم المخزون (${total.toLocaleString()} ج.م)`
            : `Complete POS Sale (EGP ${total.toLocaleString()})`}
        </button>
      </div>
    </div>
  );
}

export function StaffTrainersView() {
  const { locale, staff } = usePlatformStore();
  const isAr = locale === 'ar';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6">
        <h1 className="text-xl font-extrabold text-white">
          {isAr
            ? 'إدارة المدربين، الموظفين، والعمولات الشهرية (Staff & Trainers)'
            : 'Coaching Staff, Shifts & PT Commission Performance'}
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          {isAr
            ? 'متابعة محافظ المتدربين لكل كابتن، نسب العمولات، التقييمات، ومواعيد الورديات'
            : 'Track trainer client rosters, PT revenue commissions, member ratings, and branch shifts'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {staff.map((s) => {
          const commissionEgp = Math.round((s.monthlyRevenueEgp * s.commissionRatePercent) / 100);
          return (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-800/80 bg-[#121623] p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-lg bg-[#D4AF37]/15 px-2.5 py-0.5 text-xs font-extrabold text-[#D4AF37]">
                    {s.role}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold text-white">
                    {isAr ? s.nameAr : s.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr ? s.specialtyAr : s.specialtyEn}
                  </p>
                </div>
                <span className="rounded-xl bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-300">
                  ★ {s.rating}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 text-xs">
                <div className="rounded-xl bg-slate-900/70 p-3">
                  <span className="text-slate-400">{isAr ? 'المتدربون' : 'Clients'}</span>
                  <p className="mt-1 text-base font-extrabold text-white">{s.activeClients}</p>
                </div>
                <div className="rounded-xl bg-slate-900/70 p-3">
                  <span className="text-slate-400">{isAr ? 'مبيعات الشهر' : 'PT Revenue'}</span>
                  <p className="mt-1 font-mono text-sm font-extrabold text-white">
                    {s.monthlyRevenueEgp.toLocaleString()} EGP
                  </p>
                </div>
                <div className="rounded-xl bg-slate-900/70 p-3">
                  <span className="text-slate-400">
                    {isAr ? `العمولة (${s.commissionRatePercent}%)` : `Commission (${s.commissionRatePercent}%)`}
                  </span>
                  <p className="mt-1 font-mono text-sm font-extrabold text-[#D4AF37]">
                    {commissionEgp.toLocaleString()} EGP
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {isAr ? `الوردية: ${s.shiftAr}` : `Shift: ${s.shiftEn}`} • {s.phone}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
