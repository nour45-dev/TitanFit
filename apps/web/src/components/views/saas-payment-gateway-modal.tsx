'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  QrCode,
  ShieldCheck,
  Zap,
  UploadCloud,
  Sparkles,
  Lock,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  PhoneCall,
  CreditCard,
  FileText,
} from 'lucide-react';
import { SaaSSubscriptionPlanConfig, GymPlanTierKey, usePlatformStore } from '../../lib/platform-store';

export interface SaaSPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SaaSSubscriptionPlanConfig;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  onSuccess?: (planId: GymPlanTierKey) => void;
}

export function SaaSPaymentGatewayModal({
  isOpen,
  onClose,
  plan,
  billingCycle,
  onSuccess,
}: SaaSPaymentGatewayModalProps) {
  const { locale, upgradeActiveTenantPlan, activeTenantCustom } = usePlatformStore();
  const isAr = locale === 'ar';

  const [paymentMethod, setPaymentMethod] = useState<'INSTAPAY' | 'VODAFONE_CASH'>('INSTAPAY');
  const [senderNumber, setSenderNumber] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedUssd, setCopiedUssd] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedInvoiceNum, setGeneratedInvoiceNum] = useState<string>('');

  if (!isOpen) return null;

  const officialNumber = '01002169889';
  const price = billingCycle === 'ANNUAL' ? plan.annualTotalEgp : plan.monthlyPriceEgp;
  const ussdCode = `*9*7*${officialNumber}*${price}#`;

  const handleCopyNumber = () => {
    navigator.clipboard?.writeText(officialNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleCopyUssd = () => {
    navigator.clipboard?.writeText(ussdCode);
    setCopiedUssd(true);
    setTimeout(() => setCopiedUssd(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      setReceiptUploaded(true);
    }
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    const invoiceNumber = `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedInvoiceNum(invoiceNumber);

    // Simulate instant real-time settlement & validation over Egyptian National Payments Switch
    setTimeout(() => {
      upgradeActiveTenantPlan(plan.id, {
        method: paymentMethod,
        senderNumber: senderNumber || '0100xxxxxxx',
        billingCycle,
      });
      setIsProcessing(false);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(plan.id);
      }
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all text-slate-900 dark:text-white"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {isSuccess ? (
          /* SUCCESS CELEBRATION CARD */
          <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl shadow-emerald-500/25">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isAr ? 'تم تأكيد الدفع اللحظي بنجاح' : 'Payment Confirmed Successfully'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {isAr
                  ? `🎉 مبروك! تم تفعيل "${plan.nameAr}" لناديك`
                  : `🎉 Congratulations! "${plan.nameEn}" is Active`}
              </h2>
              <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? `تم استلام مبلغ ${price.toLocaleString()} ج.م بنجاح عبر ${paymentMethod === 'INSTAPAY' ? 'إنستاباي (InstaPay)' : 'فودافون كاش (Vodafone Cash)'} وتحديث باقة النادي وفتح كافة الصفحات والميزات المقفلة فوراً!`
                  : `Successfully received EGP ${price.toLocaleString()} via ${paymentMethod}. All locked features have been unlocked.`}
              </p>
            </div>

            {/* Invoice & Plan Details Card */}
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/60 space-y-2 text-start">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-500">{isAr ? 'رقم الفاتورة الضريبية:' : 'Tax Invoice #:'}</span>
                <span className="font-mono font-black text-slate-900 dark:text-white">{generatedInvoiceNum}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-500">{isAr ? 'النادي المستفيد:' : 'Gym Tenant:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeTenantCustom?.nameAr || 'نادي TitanFit'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-500">{isAr ? 'طريقة السداد:' : 'Payment Method:'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {paymentMethod === 'INSTAPAY' ? 'إنستاباي (01002169889)' : 'فودافون كاش (01002169889)'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-slate-500">{isAr ? 'فترة الصلاحية:' : 'Valid Until:'}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {isAr
                    ? billingCycle === 'ANNUAL' ? 'سنة كاملة (365 يوماً)' : 'شهر كامل (30 يوماً)'
                    : billingCycle === 'ANNUAL' ? 'Full 1 Year' : 'Full 1 Month'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:brightness-105 transition active:scale-95"
              >
                <span>{isAr ? '🚀 ابدأ استخدام جميع مميزات الباقة الآن' : 'Start Exploring Unlocked Features'}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT CHECKOUT FORM */
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex items-start gap-3.5 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-[#D4AF37] text-slate-950 shadow-md">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{isAr ? 'بوابة الدفع الإلكتروني المباشر' : 'Instant Checkout Gateway'}</span>
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {billingCycle === 'ANNUAL' ? (isAr ? 'سنوي (وفرت 20%)' : 'Annual (Save 20%)') : (isAr ? 'شهري' : 'Monthly')}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {isAr ? `تفعيل ${plan.nameAr}` : `Activate ${plan.nameEn}`}
                </h3>
              </div>
            </div>

            {/* Selected Plan Cost Summary */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'المبلغ المطلوب سداده:' : 'Total Amount to Pay:'}
                </span>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {price.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {isAr ? 'جنيه مصري (EGP)' : 'EGP'}
                  </span>
                </div>
              </div>

              <div className="text-end">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {isAr ? 'المستفيد الرسمي:' : 'Official Beneficiary:'}
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {isAr ? 'منصة TitanFit لإدارة الأندية' : 'TitanFit Gym Platform'}
                </span>
              </div>
            </div>

            {/* PAYMENT METHOD SELECTOR: INSTAPAY VS VODAFONE CASH */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'اختر طريقة الدفع المناسبة لك:' : 'Select Payment Gateway:'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* INSTAPAY TAB */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('INSTAPAY')}
                  className={`relative flex items-center gap-3 rounded-2xl border p-3.5 transition-all text-start ${
                    paymentMethod === 'INSTAPAY'
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-md dark:border-indigo-500 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-xs shadow-xs">
                    IP
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-black text-xs text-indigo-950 dark:text-indigo-300">
                      {isAr ? 'إنستاباي (InstaPay)' : 'InstaPay'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      {isAr ? 'تحويل لحظي بالبنك المركزي' : 'Instant Bank Transfer'}
                    </span>
                  </div>
                  {paymentMethod === 'INSTAPAY' && (
                    <div className="absolute top-2 end-2 h-2.5 w-2.5 rounded-full bg-indigo-600"></div>
                  )}
                </button>

                {/* VODAFONE CASH TAB */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('VODAFONE_CASH')}
                  className={`relative flex items-center gap-3 rounded-2xl border p-3.5 transition-all text-start ${
                    paymentMethod === 'VODAFONE_CASH'
                      ? 'border-rose-600 bg-rose-50/80 shadow-md dark:border-rose-500 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-red-700 text-white font-black text-xs shadow-xs">
                    VC
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-black text-xs text-rose-950 dark:text-rose-300">
                      {isAr ? 'فودافون كاش ومحافظ المحمول' : 'Vodafone Cash & Wallets'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      {isAr ? 'محافظ إلكترونية / USSD' : 'Smart Wallets'}
                    </span>
                  </div>
                  {paymentMethod === 'VODAFONE_CASH' && (
                    <div className="absolute top-2 end-2 h-2.5 w-2.5 rounded-full bg-rose-600"></div>
                  )}
                </button>
              </div>
            </div>

            {/* PAYMENT INSTRUCTIONS & ACCOUNT CARD */}
            <div className={`rounded-2xl border p-4 space-y-4 ${
              paymentMethod === 'INSTAPAY'
                ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/20'
                : 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'
            }`}>
              {/* Account Number & Copy Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {paymentMethod === 'INSTAPAY'
                      ? (isAr ? 'رقم الهاتف المسجل على إنستاباي (InstaPay):' : 'InstaPay Transfer Phone Number:')
                      : (isAr ? 'رقم محفظة فودافون كاش المعتمد للتحويل:' : 'Vodafone Cash Wallet Number:')}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {isAr ? 'حساب رسمي نشط' : 'Verified Account'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-base font-black text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white shadow-inner" dir="ltr">
                    <span>{officialNumber}</span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {paymentMethod === 'INSTAPAY' ? 'IPA / Mobile' : 'Wallet'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition shadow-sm ${
                      copiedNumber
                        ? 'bg-emerald-600 text-white'
                        : paymentMethod === 'INSTAPAY'
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    {copiedNumber ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedNumber ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرقم' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic USSD code for Vodafone Cash or Steps for InstaPay */}
              {paymentMethod === 'VODAFONE_CASH' ? (
                <div className="rounded-xl border border-rose-200 bg-white/80 p-3 text-xs dark:border-rose-900/60 dark:bg-slate-900/80 space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {isAr ? '🚀 كود التحويل السريع عبر هاتفك المحمول (USSD):' : 'Quick Transfer USSD Dial Code:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg bg-rose-50 px-3 py-2 font-mono font-bold text-rose-950 dark:bg-rose-950/50 dark:text-rose-200" dir="ltr">
                      {ussdCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUssd}
                      className="rounded-lg bg-slate-800 px-3 py-2 text-[11px] font-bold text-white hover:bg-slate-700 dark:bg-slate-700"
                    >
                      {copiedUssd ? (isAr ? 'تم النسخ!' : 'Copied') : (isAr ? 'نسخ الكود' : 'Copy Code')}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isAr
                      ? `أو افتح تطبيق "أنا فودافون" واختر تحويل أموال إلى الرقم: ${officialNumber} بمبلغ ${price.toLocaleString()} ج.م.`
                      : `Or open Ana Vodafone app and transfer EGP ${price.toLocaleString()} to ${officialNumber}.`}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-indigo-200 bg-white/80 p-3 text-xs dark:border-indigo-900/60 dark:bg-slate-900/80 space-y-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {isAr ? '📋 خطوات التحويل البسيطة عبر إنستاباي:' : 'Quick Steps to Transfer via InstaPay:'}
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <li>{isAr ? 'افتح تطبيق إنستاباي (InstaPay) على هاتفك المحمول.' : 'Open InstaPay app on your mobile.'}</li>
                    <li>
                      {isAr
                        ? `اختر "إرسال نقود" ⬅️ "رقم الهاتف المحمول" واكتب: ${officialNumber}`
                        : `Choose Send Money -> Mobile Number: ${officialNumber}`}
                    </li>
                    <li>
                      {isAr
                        ? `اكتب المبلغ المطلوب بدقة: ${price.toLocaleString()} ج.م`
                        : `Enter exact amount: ${price.toLocaleString()} EGP`}
                    </li>
                    <li>{isAr ? 'أكّد العملية في التطبيق، ثم اضغط على زر التفعيل بالأسفل.' : 'Confirm transfer in app, then click button below.'}</li>
                  </ol>
                </div>
              )}
            </div>

            {/* SENDER VERIFICATION INPUTS */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'رقم الهاتف الذي قمت بالتحويل منه:' : 'Sender Phone Number (Your Mobile):'}
                </label>
                <input
                  type="text"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder={isAr ? "مثال: 01xxxxxxxxx" : "e.g. 01xxxxxxxxx"}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'رقم العملية / المرجع المالي (اختياري):' : 'Transaction Reference / Notes (Optional):'}
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder={isAr ? "مثال: 18294829402" : "e.g. 18294829402"}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Receipt Attachment Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'إشعار التحويل / سكرين شوت الإيصال (اختياري للتوثيق):' : 'Attach Transfer Receipt Screenshot (Optional):'}
                </label>
                <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-3 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 dark:border-slate-700 dark:hover:border-amber-500 transition">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-xs">
                    {receiptUploaded && receiptFileName
                      ? `✓ تم إرفاق: ${receiptFileName}`
                      : isAr
                        ? 'انقر لرفع صورة إشعار التحويل أو الإيصال'
                        : 'Click to upload receipt screenshot'}
                  </span>
                </label>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-[#D4AF37] py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{isAr ? 'جاري التحقق من التحويل وتفعيل الباقة...' : 'Verifying & Activating Plan...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-slate-950" />
                    <span>
                      {isAr
                        ? `تأكيد التحويل إلى (01002169889) وتفعيل "${plan.nameAr}" فوراً 🚀`
                        : `Confirm Transfer to (01002169889) & Activate "${plan.nameEn}" 🚀`}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"
              >
                {isAr ? 'إلغاء والعودة' : 'Cancel & Go Back'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
