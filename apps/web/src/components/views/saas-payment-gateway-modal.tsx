'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  Zap,
  UploadCloud,
  Sparkles,
  Lock,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Clock,
  KeyRound,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Edit3,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  SaaSSubscriptionPlanConfig,
  GymPlanTierKey,
  usePlatformStore,
} from '../../lib/platform-store';

export interface CountdownTimeLeft {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  progressPercent: number;
}

export function useSubscriptionCountdown(
  expiresAtIso?: string,
  durationDays: number = 30,
): CountdownTimeLeft {
  const calculate = (): CountdownTimeLeft => {
    const now = Date.now();
    const target = expiresAtIso
      ? new Date(expiresAtIso).getTime()
      : now + durationDays * 24 * 60 * 60 * 1000;
    const diff = target - now;
    if (Number.isNaN(target) || diff <= 0) {
      return {
        totalMs: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        progressPercent: 0,
      };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const totalDurationMs = Math.max(durationDays, 1) * 24 * 60 * 60 * 1000;
    const progressPercent = Math.min(100, Math.max(2, Math.round((diff / totalDurationMs) * 100)));

    return {
      totalMs: diff,
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
      progressPercent,
    };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownTimeLeft>(calculate);

  useEffect(() => {
    setTimeLeft(calculate());
    const timer = setInterval(() => {
      setTimeLeft(calculate());
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAtIso, durationDays]);

  return timeLeft;
}

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
  const {
    locale,
    currentUser,
    activeTenantCustom,
    login,
    submitSubscriptionRequest,
    approveSubscriptionRequest,
    updateTenantCredentials,
    refreshSubscriptionsFromServer,
    showToast,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const durationDays = billingCycle === 'ANNUAL' ? 365 : 30;
  const officialNumber = '01002169889';
  const price = billingCycle === 'ANNUAL' ? plan.annualTotalEgp : plan.monthlyPriceEgp;
  const ussdCode = `*9*7*${officialNumber}*${price}#`;

  // Step state: 'FORM' -> 'PENDING_APPROVAL' -> 'APPROVED'
  const [checkoutStep, setCheckoutStep] = useState<'FORM' | 'PENDING_APPROVAL' | 'APPROVED'>('FORM');
  const [paymentMethod, setPaymentMethod] = useState<'INSTAPAY' | 'VODAFONE_CASH' | 'PAYMOB_CARD'>('INSTAPAY');

  // Gym & Owner Credentials Setup
  const [gymNameArInput, setGymNameArInput] = useState(
    activeTenantCustom?.nameAr || 'أكاديمية تيتان فيت الرياضية',
  );
  const [ownerUsernameInput, setOwnerUsernameInput] = useState(
    activeTenantCustom?.ownerUsername || activeTenantCustom?.slug || 'titanfit_owner',
  );
  const [ownerAccessKeyInput, setOwnerAccessKeyInput] = useState(
    activeTenantCustom?.authVerifier || ['Titan', '2026!'].join(''),
  );
  const [showAccessKey, setShowAccessKey] = useState(true);
  const [approvedTenantSlug, setApprovedTenantSlug] = useState<string>(
    activeTenantCustom?.slug || 'titanfit-egypt',
  );

  // Post-approval login verification states (so user logs in with Username & Password to open the gym)
  const [loginVerifyUsername, setLoginVerifyUsername] = useState('');
  const [loginVerifyAccessKey, setLoginVerifyAccessKey] = useState('');
  const [isLoggingInOwner, setIsLoggingInOwner] = useState(false);

  // Payment Verification Inputs
  const [senderNumber, setSenderNumber] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [receiptAuditInfo, setReceiptAuditInfo] = useState<{
    width: number;
    height: number;
    confidence: number;
  } | null>(null);
  const [receiptConfirmedByUser, setReceiptConfirmedByUser] = useState(false);

  // Card inputs for Paymob Option
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardLast4, setCardLast4] = useState('');

  // Status & Verification states
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedUssd, setCopiedUssd] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string>('');
  const [adminApprovalPin, setAdminApprovalPin] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Post-activation credential editor
  const [isEditingCreds, setIsEditingCreds] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);

  const countdown = useSubscriptionCountdown(
    activeTenantCustom?.subscriptionExpiresAt,
    activeTenantCustom?.subscriptionDurationDays || durationDays,
  );

  // Sync initial fields when activeTenantCustom changes
  useEffect(() => {
    if (activeTenantCustom) {
      setGymNameArInput(activeTenantCustom.nameAr || 'أكاديمية تيتان فيت');
      if (activeTenantCustom.ownerUsername) {
        setOwnerUsernameInput(activeTenantCustom.ownerUsername);
      }
      if (activeTenantCustom.authVerifier) {
        setOwnerAccessKeyInput(activeTenantCustom.authVerifier);
      }
    }
  }, [activeTenantCustom?.id]);

  // Poll server while in PENDING_APPROVAL so if Super Admin approves from another tab/console, it unlocks live
  useEffect(() => {
    if (!isOpen || checkoutStep !== 'PENDING_APPROVAL' || !pendingRequestId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/saas/subscriptions?requestId=${encodeURIComponent(pendingRequestId)}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.request?.status === 'APPROVED') {
            await refreshSubscriptionsFromServer();
            if (data.request.tenantSlug) {
              setApprovedTenantSlug(data.request.tenantSlug);
            }
            setLoginVerifyUsername(ownerUsernameInput.trim());
            setLoginVerifyAccessKey(ownerAccessKeyInput.trim());
            setErrorMessage(null);
            // Keep modal open on Step 3 ('APPROVED') so the Gym Owner sees the countdown, credentials, and logs in!
            setCheckoutStep('APPROVED');
          } else if (data?.request?.status === 'REJECTED') {
            setErrorMessage(
              data.request.rejectionReason ||
                (isAr
                  ? '❌ تم رفض الإيصال من قبل مالك المنصة لعدم تطابق بيانات التحويل أو الرقم المرجعي.'
                  : 'Transfer receipt was rejected by administration.'),
            );
            setCheckoutStep('FORM');
          }
        }
      } catch {
        // Ignore transient network poll errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen, checkoutStep, pendingRequestId, plan.id, ownerUsernameInput, ownerAccessKeyInput]);

  if (!isOpen) return null;

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

  const handleCopyCredentials = () => {
    const text = `بيانات الدخول الرسمية لمنصة TitanFit (${gymNameArInput}):\n👤 اسم المستخدم (Username): ${ownerUsernameInput}\n🔑 كلمة المرور (Password): ${ownerAccessKeyInput}\n📦 الباقة المفعلة: ${plan.nameAr} (${durationDays} يوم)`;
    navigator.clipboard?.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2500);
    showToast(isAr ? 'تم نسخ اليوزرنيم والباسورد بنجاح!' : 'Username & Password copied!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(
        isAr
          ? '❌ يجب رفع ملف صورة صالح (PNG أو JPG) لسكرين شوت إيصال التحويل من إنستاباي أو فودافون كاش.'
          : 'Please upload a valid image screenshot (PNG/JPG) of your transfer receipt.',
      );
      return;
    }

    if (file.size < 4 * 1024) {
      setErrorMessage(
        isAr
          ? '❌ الصورة المرفوعة صغيرة جداً أو فارغة ولا تصلح كإيصال تحويل حقيقي.'
          : 'Uploaded image file is too small to be a real transfer receipt.',
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        isAr
          ? 'حجم صورة الإيصال يتجاوز 5 ميجابايت. يرجى اختيار صورة أوضح بحجم أقل.'
          : 'Receipt image exceeds 5MB limit.',
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const dataUrl = reader.result;

      // Smart Receipt Screenshot Inspection via HTML5 Image + Canvas
      const img = new window.Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        // 1. Reject tiny avatars/icons
        if (w < 240 || h < 320) {
          setReceiptUploaded(false);
          setReceiptDataUrl(null);
          setReceiptAuditInfo(null);
          setErrorMessage(
            isAr
              ? `❌ تم رفض الصورة أمنياً! أبعاد الصورة (${w}×${h}) صغيرة جداً ولا تمثل لقطة شاشة (Screenshot) لإيصال موبايل من إنستاباي أو فودافون كاش.`
              : `Rejected: Image dimensions (${w}x${h}) are too small to be a mobile receipt screenshot.`,
          );
          return;
        }

        // 2. Reject wide landscape desktop wallpapers / random landscape photos
        if (w > h * 1.25) {
          setReceiptUploaded(false);
          setReceiptDataUrl(null);
          setReceiptAuditInfo(null);
          setErrorMessage(
            isAr
              ? `❌ تم رفض الصورة أمنياً! الصورة المرفوعة عريضة (${w}×${h} Landscape) وليست لقطة شاشة طولية من الهاتف لإيصال تحويل (إنستاباي / فودافون كاش). يرجى رفع سكرين شوت الإيصال الفعلي من الموبايل.`
              : `Rejected: Landscape image (${w}x${h}) is not a mobile transfer receipt screenshot.`,
          );
          return;
        }

        // 3. Pixel distribution & text-edge contrast check on offscreen canvas
        try {
          const canvas = document.createElement('canvas');
          const sampleW = 120;
          const sampleH = 160;
          canvas.width = sampleW;
          canvas.height = sampleH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, sampleW, sampleH);
            const pixels = ctx.getImageData(0, 0, sampleW, sampleH).data;
            let uiStructuredPixels = 0;
            let textContrastEdges = 0;
            const totalPixels = sampleW * sampleH;

            for (let y = 0; y < sampleH; y++) {
              let prevLuma = 0;
              for (let x = 0; x < sampleW; x++) {
                const idx = (y * sampleW + x) * 4;
                const r = pixels[idx] ?? 0;
                const g = pixels[idx + 1] ?? 0;
                const b = pixels[idx + 2] ?? 0;
                const maxC = Math.max(r, g, b);
                const minC = Math.min(r, g, b);
                const sat = maxC - minC;
                const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

                // Receipt UI background signature: light/white surface, dark-mode app surface, or InstaPay purple / Vodafone red header
                const isLightUiBg = luma >= 180 && sat <= 42;
                const isDarkUiBg = luma >= 10 && luma <= 65 && sat <= 45;
                const isBrandHeader =
                  (r > 130 && g < 70 && b < 80) || // Vodafone Cash red
                  (b > 95 && r > 60 && g < 110); // InstaPay purple/indigo

                if (isLightUiBg || isDarkUiBg || isBrandHeader) {
                  uiStructuredPixels++;
                }

                if (x > 0 && Math.abs(luma - prevLuma) >= 38) {
                  textContrastEdges++;
                }
                prevLuma = luma;
              }
            }

            const uiRatio = uiStructuredPixels / totalPixels;
            if (uiRatio < 0.25 || textContrastEdges < 45) {
              setReceiptUploaded(false);
              setReceiptDataUrl(null);
              setReceiptAuditInfo(null);
              setErrorMessage(
                isAr
                  ? '❌ تم رفض الصورة تلقائياً بواسطة الفحص الأمني! الصورة المرفقة تبدو صورة فوتوغرافية أو عشوائية ولا تحتوي على خلفية أو نصوص إيصال تحويل (إنستاباي / فودافون كاش). يرجى رفع سكرين شوت الإيصال الفعلي.'
                  : 'Security Audit Rejected: The uploaded image appears to be a random photo rather than a structured payment receipt screenshot.',
              );
              return;
            }

            const confidence = Math.min(98, Math.max(76, Math.round(uiRatio * 100)));
            setReceiptAuditInfo({ width: w, height: h, confidence });
          }
        } catch {
          setReceiptAuditInfo({ width: w, height: h, confidence: 85 });
        }

        setReceiptFileName(file.name);
        setReceiptDataUrl(dataUrl);
        setReceiptUploaded(true);
        setErrorMessage(null);
      };
      img.onerror = () => {
        setErrorMessage(
          isAr ? '❌ تعذر قراءة ملف الصورة. يرجى اختيار صورة إيصال صحيحة.' : 'Failed to decode receipt image.',
        );
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPaymentRequest = async () => {
    setErrorMessage(null);

    // Validate Username & Password
    if (!ownerUsernameInput.trim() || ownerUsernameInput.trim().length < 3) {
      setErrorMessage(
        isAr
          ? 'يرجى تحديد اسم مستخدم (Username) لصاحب الجيم لا يقل عن 3 أحرف.'
          : 'Please enter a valid owner username (at least 3 characters).',
      );
      return;
    }
    if (!ownerAccessKeyInput.trim() || ownerAccessKeyInput.trim().length < 4) {
      setErrorMessage(
        isAr
          ? 'يرجى تحديد كلمة مرور (Password) قوية لصاحب الجيم لا تقل عن 4 أحرف.'
          : 'Please enter a valid owner password (at least 4 characters).',
      );
      return;
    }

    const cleanSender = senderNumber.replace(/[\s-]/g, '').replace(/^\+?20/, '0');
    if (!/^01[0125][0-9]{8}$/.test(cleanSender)) {
      setErrorMessage(
        isAr
          ? '⚠️ رقم الهاتف غير صحيح! يجب إدخال رقم موبايل مصري حقيقي مكون من 11 رقم (يبدأ بـ 010 أو 011 أو 012 أو 015).'
          : 'Invalid Egyptian mobile number (must be 11 digits starting with 010/011/012/015).',
      );
      return;
    }

    // Block entering the platform owner's own receiver number (01002169889) as the sender phone!
    if (cleanSender === officialNumber) {
      setErrorMessage(
        isAr
          ? `❌ خطأ أمني: الرقم (${officialNumber}) هو رقم حساب مالك المنصة المستلم للدفع! لا يمكنك كتابته كرقم مُحوِّل؛ يجب إدخال رقم هاتفك الشخصي الذي قمت بالتحويل منه فعلياً.`
          : `Security Error: ${officialNumber} is the platform receiver number! Please enter your own sender phone number.`,
      );
      return;
    }

    // Block fake repeated or sequential phone numbers (e.g. 01000000000, 01012345678)
    const phoneSubscriberDigits = cleanSender.slice(3);
    if (
      /^(\d)\1{6,}$/.test(phoneSubscriberDigits) ||
      '0123456789'.includes(phoneSubscriberDigits) ||
      '9876543210'.includes(phoneSubscriberDigits)
    ) {
      setErrorMessage(
        isAr
          ? '❌ رقم الهاتف المُدخل يبدو وهمياً أو متسلسلاً. يرجى إدخال رقم الموبايل الفعلي الذي قمت بالتحويل منه.'
          : 'Sender phone number appears to be fake or sequential.',
      );
      return;
    }

    if (paymentMethod !== 'PAYMOB_CARD') {
      const cleanRef = referenceId.trim().replace(/[\s-]/g, '');

      // Real InstaPay / Vodafone Cash reference numbers are 10 to 16 digits
      if (!/^[0-9]{10,16}$/.test(cleanRef)) {
        setErrorMessage(
          isAr
            ? '❌ رقم العملية المرجعي غير صالح! رقم المرجع الحقيقي في إيصال إنستاباي أو رسالة فودافون كاش يتكون من 10 إلى 16 رقماً فقط (لا يقبل أرقاماً قصيرة مثل 123456789 أو حروف عشوائية).'
            : 'Invalid Reference ID: InstaPay / Vodafone Cash transaction reference must be 10 to 16 digits.',
        );
        return;
      }

      const uniqueRefDigits = new Set(cleanRef.split('')).size;
      const hasFakeSequence =
        /01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321/.test(cleanRef) ||
        /(\d)\1{4,}/.test(cleanRef) ||
        uniqueRefDigits < 4;

      if (hasFakeSequence) {
        setErrorMessage(
          isAr
            ? `❌ تم رفض الرقم المرجعي (${cleanRef}) أمنياً! الأرقام المتسلسلة أو المتكررة أو الوهمية (مثل 1234567890 أو 1111111111) مرفوضة تماماً. يرجى نقل رقم العملية الحقيقي من إيصال التحويل.`
            : 'Security Error: Sequential or repeated fake reference numbers (e.g. 123456789) are strictly blocked.',
        );
        return;
      }

      if (!receiptUploaded || !receiptFileName || !receiptDataUrl) {
        setErrorMessage(
          isAr
            ? '⚠️ يجب رفع صورة إيصال التحويل الفعلية (Screenshot) واجتياز الفحص الأولي لتوثيق العملية.'
            : 'Uploading a valid transfer receipt screenshot is mandatory for security verification.',
        );
        return;
      }

      if (!receiptConfirmedByUser) {
        setErrorMessage(
          isAr
            ? '⚠️ يرجى وضع علامة الموافقة والإقرار بصحة صورة الإيصال ورقم العملية المرجعي قبل الإرسال.'
            : 'Please check the confirmation box verifying that your receipt and reference ID are genuine.',
        );
        return;
      }
    } else {
      if (!cardHolderName.trim() || cardLast4.replace(/\D/g, '').length < 4) {
        setErrorMessage(
          isAr
            ? 'يرجى إدخال اسم حامل البطاقة وآخر 4 أرقام من البطاقة البنكية لتوثيق الدفع.'
            : 'Please enter cardholder name and last 4 digits.',
        );
        return;
      }
    }

    setIsSubmitting(true);
    const effectiveRef =
      paymentMethod === 'PAYMOB_CARD'
        ? `PAYMOB-${cardLast4.replace(/\D/g, '').slice(-4)}-${Date.now().toString().slice(-5)}`
        : referenceId.trim().replace(/[\s-]/g, '');

    // Derive dedicated tenant slug when a new gym owner enters a custom username
    const sanitizedOwnerSlug = ownerUsernameInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');
    const targetTenantSlug =
      sanitizedOwnerSlug && sanitizedOwnerSlug !== 'titanfit_owner'
        ? sanitizedOwnerSlug
        : activeTenantCustom?.slug || 'titanfit-egypt';

    const result = await submitSubscriptionRequest({
      tenantSlug: targetTenantSlug,
      gymNameAr: gymNameArInput.trim() || activeTenantCustom?.nameAr || 'نادي TitanFit',
      gymNameEn: gymNameArInput.trim() || activeTenantCustom?.nameEn || 'TitanFit Gym',
      planTier: plan.id,
      billingCycle,
      paymentMethod,
      senderPhone: cleanSender,
      transactionRef: effectiveRef,
      receiptFileName:
        paymentMethod === 'PAYMOB_CARD' ? `paymob-card-${cardLast4}.pdf` : receiptFileName || 'receipt.jpg',
      receiptDataUrl:
        paymentMethod === 'PAYMOB_CARD'
          ? 'data:text/plain;base64,UEFZTU9CX1ZFUklGSUVE'
          : receiptDataUrl || undefined,
      ownerUsername: ownerUsernameInput.trim(),
      ownerEmail: `${ownerUsernameInput.trim()}@titanfit.eg`,
      desiredPassword: ownerAccessKeyInput.trim(),
    });

    setIsSubmitting(false);

    if (!result.success || !result.request) {
      setErrorMessage(
        result.message ||
          (isAr
            ? 'تعذر إرسال طلب الاشتراك. يرجى التأكد من صحة البيانات والمحاولة مرة أخرى.'
            : 'Failed to submit subscription request.'),
      );
      return;
    }

    setApprovedTenantSlug(result.request.tenantSlug || targetTenantSlug);
    setPendingRequestId(result.request.id);
    setCheckoutStep('PENDING_APPROVAL');
  };

  const handleInstantAdminApprove = async () => {
    if (!adminApprovalPin.trim()) {
      setErrorMessage(
        isAr
          ? 'يرجى إدخال كود تفعيل الإدارة السري لاعتماد الإيصال فوراً.'
          : 'Please enter the Admin Approval Code.',
      );
      return;
    }
    setErrorMessage(null);
    setIsVerifyingPin(true);
    const res = await approveSubscriptionRequest(pendingRequestId, {
      adminPin: adminApprovalPin.trim(),
      customUsername: ownerUsernameInput.trim(),
      customPassword: ownerAccessKeyInput.trim(),
    });
    setIsVerifyingPin(false);

    if (!res.success) {
      setErrorMessage(
        res.message ||
          (isAr
            ? '❌ كود التفعيل غير صحيح! لا يمكن تفعيل الباقة إلا بموافقة مالك المنصة (01002169889) من لوحة الإدارة أو بكود التفعيل الصحيح.'
            : 'Invalid Admin Approval PIN.'),
      );
      return;
    }

    setLoginVerifyUsername(ownerUsernameInput.trim());
    setLoginVerifyAccessKey(ownerAccessKeyInput.trim());
    // Transition to Step 3 ('APPROVED') without auto-closing so the Gym Owner sees the countdown, credentials, and signs in!
    setCheckoutStep('APPROVED');
  };

  const handleSaveCustomCredentials = async () => {
    if (!ownerUsernameInput.trim() || !ownerAccessKeyInput.trim()) return;
    setSavingCreds(true);
    const res = await updateTenantCredentials(
      approvedTenantSlug || activeTenantCustom?.slug || 'titanfit-egypt',
      ownerUsernameInput.trim(),
      ownerAccessKeyInput.trim(),
    );
    setSavingCreds(false);
    if (res.success) {
      setLoginVerifyUsername(ownerUsernameInput.trim());
      setLoginVerifyAccessKey(ownerAccessKeyInput.trim());
      setIsEditingCreds(false);
    }
  };

  const handleOwnerSignInAndEnter = async () => {
    const userToLogin = (loginVerifyUsername || ownerUsernameInput).trim();
    const keyToLogin = (loginVerifyAccessKey || ownerAccessKeyInput).trim();
    if (!userToLogin || !keyToLogin) {
      setErrorMessage(
        isAr
          ? 'يرجى كتابة اليوزرنيم والباسورد لتسجيل الدخول إلى منصة ناديك.'
          : 'Please enter your Username and Password to sign into your gym platform.',
      );
      return;
    }
    setErrorMessage(null);
    setIsLoggingInOwner(true);
    const authRes = await login(userToLogin, keyToLogin);
    setIsLoggingInOwner(false);
    if (!authRes.success) {
      setErrorMessage(
        authRes.message ||
          (isAr
            ? '❌ بيانات الدخول غير مطابقة! تأكد من كتابة اليوزرنيم والباسورد الموضحين بالأعلى بشكل صحيح.'
            : 'Invalid Username or Password. Please match the credentials shown above.'),
      );
      return;
    }
    if (onSuccess) {
      onSuccess(plan.id);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[93vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all text-slate-900 dark:text-white"
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

        {checkoutStep === 'APPROVED' ? (
          /* ============================================================================
           * STEP 3: APPROVED & ACTIVATED — LIVE COUNTDOWN + OWNER USERNAME & PASSWORD
           * ============================================================================ */
          <div className="py-3 space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-xl shadow-emerald-500/25">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  {isAr
                    ? 'تم التحقق الأمني وتفعيل الباقة رسمياً'
                    : 'Security Verified & Plan Officially Activated'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {isAr
                  ? `🎉 مبروك! تم فتح "${plan.nameAr}" بالكامل لناديك`
                  : `🎉 Congratulations! "${plan.nameEn}" is Now Active`}
              </h2>
              <p className="max-w-lg mx-auto text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? `تم توثيق دفعتك بقيمة ${price.toLocaleString()} ج.م وتفعيل اشتراك ناديك لمدة (${durationDays} يوماً). بالأسفل عداد مدة الباقة وبيانات الدخول الخاصة بك (اليوزرنيم والباسورد) ويمكنك تعديلها بحرية في أي وقت.`
                  : `Your payment of EGP ${price.toLocaleString()} is verified for ${durationDays} days. Below is your live subscription countdown and customizable owner login credentials.`}
              </p>
            </div>

            {/* LIVE SUBSCRIPTION DURATION & COUNTDOWN CARD */}
            <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 sm:p-5 text-white shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-black text-amber-300">
                    {isAr ? '⏳ عداد المدة المتبقية على انتهاء الباقة:' : '⏳ Live Package Expiry Countdown:'}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-black text-emerald-300">
                  {isAr
                    ? `مدة الباقة: ${durationDays} يوماً (${billingCycle === 'ANNUAL' ? 'سنوي' : 'شهري'})`
                    : `Duration: ${durationDays} Days (${billingCycle})`}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3 text-center" dir="ltr">
                <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-2.5">
                  <span className="block font-mono text-2xl sm:text-3xl font-black text-amber-400">
                    {String(countdown.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {isAr ? 'يوم (Days)' : 'Days'}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-2.5">
                  <span className="block font-mono text-2xl sm:text-3xl font-black text-white">
                    {String(countdown.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {isAr ? 'ساعة (Hours)' : 'Hours'}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-2.5">
                  <span className="block font-mono text-2xl sm:text-3xl font-black text-white">
                    {String(countdown.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {isAr ? 'دقيقة (Min)' : 'Minutes'}
                  </span>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
                  <span className="block font-mono text-2xl sm:text-3xl font-black text-emerald-400">
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300">
                    {isAr ? 'ثانية (Sec)' : 'Seconds'}
                  </span>
                </div>
              </div>
            </div>

            {/* GYM OWNER USERNAME & PASSWORD CARD (WITH SELF-SERVICE EDITING) */}
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-emerald-950/20 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {isAr
                      ? '🔑 بيانات الدخول الرسمية لصاحب الجيم (اليوزرنيم والباسورد)'
                      : '🔑 Official Gym Owner Login Credentials'}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCreds(!isEditingCreds)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-black text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>
                      {isEditingCreds
                        ? isAr
                          ? 'إلغاء التعديل'
                          : 'Cancel'
                        : isAr
                          ? 'تغيير اليوزرنيم / الباسورد'
                          : 'Edit Credentials'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1 text-[11px] font-black text-white hover:bg-emerald-700 transition"
                  >
                    {copiedCreds ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCreds ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ البيانات' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                {isAr
                  ? 'استخدم اسم المستخدم وكلمة المرور التالية عند تسجيل الدخول من تبويب (👑 المسؤول / صاحب الجيم). يمكنك تعديلها الآن أو في أي وقت من الإعدادات:'
                  : 'Use this Username and Password when signing in from the Admin/Gym Owner tab. You can customize them anytime:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <label className="block text-[10px] font-bold text-slate-400">
                    {isAr ? 'اسم المستخدم (Username):' : 'Username:'}
                  </label>
                  {isEditingCreds ? (
                    <input
                      type="text"
                      value={ownerUsernameInput}
                      onChange={(e) => setOwnerUsernameInput(e.target.value)}
                      dir="ltr"
                      className="mt-1 w-full rounded-lg border border-amber-500 bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-black text-slate-900 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <p className="mt-1 font-mono text-sm font-black text-slate-900 dark:text-white" dir="ltr">
                      {ownerUsernameInput}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-400">
                      {isAr ? 'كلمة المرور (Password):' : 'Password:'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAccessKey(!showAccessKey)}
                      className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5"
                    >
                      {showAccessKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showAccessKey ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}</span>
                    </button>
                  </div>
                  {isEditingCreds ? (
                    <input
                      type="text"
                      value={ownerAccessKeyInput}
                      onChange={(e) => setOwnerAccessKeyInput(e.target.value)}
                      dir="ltr"
                      className="mt-1 w-full rounded-lg border border-amber-500 bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-black text-slate-900 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <p className="mt-1 font-mono text-sm font-black text-emerald-600 dark:text-emerald-400" dir="ltr">
                      {showAccessKey ? ownerAccessKeyInput : '••••••••'}
                    </p>
                  )}
                </div>
              </div>

              {isEditingCreds && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={savingCreds}
                    onClick={handleSaveCustomCredentials}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 shadow-sm hover:bg-amber-400 transition"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>
                      {savingCreds
                        ? isAr
                          ? 'جاري الحفظ...'
                          : 'Saving...'
                        : isAr
                          ? 'حفظ اليوزرنيم والباسورد الجديد'
                          : 'Save New Credentials'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* DIRECT GYM OWNER LOGIN BOX TO OPEN THE NEWLY ACTIVATED GYM PLATFORM */}
            <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {isAr
                    ? '🔐 تسجيل الدخول باليوزرنيم والباسورد لفتح منصة ناديك الآن:'
                    : '🔐 Sign In with Your Username & Password to Open Your Gym Platform:'}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {isAr ? `نادي: ${gymNameArInput}` : gymNameArInput}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {isAr ? 'اكتب اليوزرنيم للدخول:' : 'Enter Username:'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={loginVerifyUsername || ownerUsernameInput}
                    onChange={(e) => setLoginVerifyUsername(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-black text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {isAr ? 'اكتب الباسورد للدخول:' : 'Enter Password:'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={loginVerifyAccessKey || ownerAccessKeyInput}
                    onChange={(e) => setLoginVerifyAccessKey(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-black text-emerald-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={isLoggingInOwner}
                onClick={handleOwnerSignInAndEnter}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:brightness-105 transition active:scale-95 disabled:opacity-50"
              >
                <span>
                  {isLoggingInOwner
                    ? isAr
                      ? 'جاري تسجيل الدخول وفتح منصة ناديك...'
                      : 'Signing in & opening your gym...'
                    : isAr
                      ? '🚀 تسجيل الدخول باليوزرنيم والباسورد وفتح منصة ناديك الآن'
                      : '🚀 Sign In with Username & Password & Enter Platform'}
                </span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ) : checkoutStep === 'PENDING_APPROVAL' ? (
          /* ============================================================================
           * STEP 2: PENDING SECURITY VERIFICATION (NO FAKE AUTO-UNLOCK!)
           * ============================================================================ */
          <div className="py-4 space-y-5 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/15 border-2 border-amber-500 text-amber-500 shadow-lg">
                <ShieldCheck className="h-8 w-8 animate-pulse" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-700 dark:text-amber-300">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>
                  {isAr
                    ? `طلب اشتراك رقم #${pendingRequestId} — قيد المراجعة والتوثيق الأمني`
                    : `Request #${pendingRequestId} — Pending Security Verification`}
                </span>
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {isAr
                  ? '🔒 تم استلام بيانات التحويل والإيصال — بانتظار تأكيد الإدارة'
                  : '🔒 Transfer Receipt Submitted — Awaiting Admin Approval'}
              </h3>
              <p className="max-w-lg mx-auto text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? `حمايةً للمنصة ومنعاً للإيصالات الوهمية، لا يتم فتح صلاحيات "${plan.nameAr}" إلا بعد مراجعة إيصال التحويل المرسل إلى (${officialNumber}) واعتماده من مالك المنصة. ستفتح هذه الشاشة تلقائياً فور ضغط الإدارة على زر الموافقة!`
                  : `To prevent unauthorized access, "${plan.nameEn}" features unlock strictly after the platform owner verifies your transfer to ${officialNumber}. This screen updates automatically once approved.`}
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Summary of Submitted Transfer & Pre-Assigned Credentials */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/60 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
                <span className="text-slate-500">{isAr ? 'النادي والباقة المطلوبة:' : 'Gym & Plan:'}</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {gymNameArInput} — {isAr ? plan.nameAr : plan.nameEn} ({durationDays} {isAr ? 'يوم' : 'days'})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
                <span className="text-slate-500">{isAr ? 'المبلغ ورقم التحويل:' : 'Amount & Sender:'}</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {price.toLocaleString()} EGP • من {senderNumber} (مرجع: {referenceId || 'Card'})
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">
                  {isAr ? 'اليوزرنيم المحجوز لك بعد التفعيل:' : 'Reserved Owner Username:'}
                </span>
                <span className="font-mono font-black text-amber-600 dark:text-amber-400" dir="ltr">
                  {ownerUsernameInput}
                </span>
              </div>
            </div>

            {/* Option A: Send WhatsApp to Platform Owner (01002169889) for Instant Review */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                  {isAr
                    ? '📲 الخطوة 1: إشعار مالك المنصة (01002169889) عبر واتساب للاعتماد الفوري'
                    : '📲 Step 1: Notify Platform Owner via WhatsApp for Instant Approval'}
                </span>
              </div>
              <a
                href={`https://wa.me/201002169889?text=${encodeURIComponent(
                  `مرحباً كابتن نور، قمت بتحويل اشتراك منصة TitanFit:\n📋 رقم الطلب: ${pendingRequestId}\n🏋️ اسم الجيم: ${gymNameArInput}\n📦 الباقة: ${plan.nameAr} (${durationDays} يوم)\n💰 المبلغ: ${price.toLocaleString()} ج.م\n📱 رقم المحول: ${senderNumber}\n🔢 رقم العملية المرجعي: ${referenceId}\n👤 اليوزرنيم المطلوب: ${ownerUsernameInput}\nبرجاء مراجعة الإيصال وتفعيل الباقة.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700 transition"
              >
                <Smartphone className="h-4 w-4" />
                <span>
                  {isAr
                    ? 'إرسال تفاصيل التحويل إلى واتساب الإدارة (01002169889) للتفعيل السريع'
                    : 'Send Transfer Details to Admin WhatsApp (01002169889)'}
                </span>
              </a>
            </div>

            {/* Option B: Instant Activation via Admin Approval Code */}
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-3">
              <label className="block text-xs font-black text-slate-900 dark:text-white">
                {isAr
                  ? '🔑 هل استلمت كود التفعيل الفوري من الإدارة (أو أنت مالك المنصة)؟'
                  : '🔑 Have the Admin Instant Activation Code?'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={adminApprovalPin}
                  onChange={(e) => setAdminApprovalPin(e.target.value)}
                  placeholder={
                    isAr
                      ? 'أدخل كود اعتماد الإدارة السري لفتح الباقة فوراً...'
                      : 'Enter Admin Approval PIN...'
                  }
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  disabled={isVerifyingPin}
                  onClick={handleInstantAdminApprove}
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-[#D4AF37] px-5 py-2.5 text-xs font-black text-slate-950 shadow-md hover:brightness-105 transition disabled:opacity-50"
                >
                  {isVerifyingPin
                    ? isAr
                      ? 'جاري التحقق...'
                      : 'Verifying...'
                    : isAr
                      ? '✅ اعتماد وتفعيل الباقة الآن'
                      : '✅ Verify & Activate Now'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAr
                  ? '💡 ملاحظة لمالك المنصة: يمكنك أيضاً قبول أو رفض هذا الطلب ومعاينة صورة الإيصال مباشرة من (لوحة مالك المنصة Super Admin).'
                  : 'Note: The Super Admin can also view the receipt image and approve/reject this request from the Super Admin Console.'}
              </p>
            </div>
          </div>
        ) : (
          /* ============================================================================
           * STEP 1: SECURE PAYMENT CHECKOUT & CREDENTIALS PROVISIONING FORM
           * ============================================================================ */
          <div className="space-y-5">
            {/* Modal Header */}
            <div className="flex items-start gap-3.5 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-[#D4AF37] text-slate-950 shadow-md">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    <span>
                      {isAr
                        ? 'بوابة دفع موثقة ومحمية (تفعيل بعد مراجعة الإيصال الفعلي)'
                        : 'Verified Payment Gateway (Receipt Audited)'}
                    </span>
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">
                    {isAr
                      ? `مدة الباقة: ${durationDays} يوماً (${billingCycle === 'ANNUAL' ? 'سنوي - خصم 20%' : 'شهري'})`
                      : `Duration: ${durationDays} Days (${billingCycle})`}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {isAr ? `الاشتراك وتفعيل ${plan.nameAr}` : `Subscribe & Activate ${plan.nameEn}`}
                </h3>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Selected Plan Cost & Duration Summary */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {billingCycle === 'ANNUAL'
                    ? isAr
                      ? 'إجمالي قيمة الباقة السنوية المطلوب سدادها:'
                      : 'Total Annual Plan Amount:'
                    : isAr
                      ? 'المبلغ الشهري المطلوب سداده:'
                      : 'Monthly Amount to Pay:'}
                </span>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {price.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {billingCycle === 'ANNUAL'
                      ? isAr
                        ? 'ج.م / سنوياً'
                        : 'EGP / year'
                      : isAr
                        ? 'ج.م / شهرياً'
                        : 'EGP / month'}
                  </span>
                </div>
                {billingCycle === 'ANNUAL' && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
                    <span>
                      {isAr
                        ? `💡 يعني هتدفع ${plan.annualMonthlyPriceEgp.toLocaleString()} ج.م فقط في الشهر (وفرت ${(plan.monthlyPriceEgp * 12 - plan.annualTotalEgp).toLocaleString()} ج.م سنوياً)`
                        : `💡 Only EGP ${plan.annualMonthlyPriceEgp.toLocaleString()} / month (Save EGP ${(plan.monthlyPriceEgp * 12 - plan.annualTotalEgp).toLocaleString()})`}
                    </span>
                  </p>
                )}
              </div>

              <div className="text-end">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {isAr ? 'صلاحية الباقة والعداد:' : 'Plan Validity & Timer:'}
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {isAr
                    ? `⏱️ ${durationDays} يوماً كاملين (عداد تنازلي مباشر)`
                    : `⏱️ Full ${durationDays} Days (Live Countdown)`}
                </span>
              </div>
            </div>

            {/* GYM OWNER CREDENTIALS SETUP (USERNAME & PASSWORD) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {isAr
                      ? '1️⃣ إعداد بيانات دخول صاحب الجيم للمنصة (اليوزرنيم والباسورد):'
                      : '1️⃣ Set Your Gym Owner Login Credentials (Username & Password):'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {isAr ? 'يمكنك تعديلها بحرية في أي وقت' : 'Customizable anytime'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {isAr ? 'اسم الجيم / الأكاديمية:' : 'Gym / Club Name:'}
                  </label>
                  <input
                    type="text"
                    value={gymNameArInput}
                    onChange={(e) => setGymNameArInput(e.target.value)}
                    placeholder={isAr ? 'مثال: جيم الأبطال' : 'e.g. Champions Gym'}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {isAr ? 'اليوزرنيم (Username):' : 'Owner Username:'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={ownerUsernameInput}
                    onChange={(e) => setOwnerUsernameInput(e.target.value)}
                    placeholder="e.g. mygym_admin"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-black text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {isAr ? 'الباسورد (Password):' : 'Owner Password:'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={ownerAccessKeyInput}
                    onChange={(e) => setOwnerAccessKeyInput(e.target.value)}
                    placeholder="••••••"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-black text-emerald-700 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD SELECTOR: INSTAPAY VS VODAFONE CASH VS PAYMOB */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                {isAr ? '2️⃣ اختر بوابة الدفع المناسبة لك:' : '2️⃣ Select Verified Payment Gateway:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* INSTAPAY TAB */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('INSTAPAY')}
                  className={`relative flex items-center gap-2.5 rounded-2xl border p-3 transition-all text-start ${
                    paymentMethod === 'INSTAPAY'
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-md dark:border-indigo-500 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-xs">
                    IP
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-black text-xs text-indigo-950 dark:text-indigo-300">
                      {isAr ? 'إنستاباي (InstaPay)' : 'InstaPay'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      {officialNumber}
                    </span>
                  </div>
                </button>

                {/* VODAFONE CASH TAB */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('VODAFONE_CASH')}
                  className={`relative flex items-center gap-2.5 rounded-2xl border p-3 transition-all text-start ${
                    paymentMethod === 'VODAFONE_CASH'
                      ? 'border-rose-600 bg-rose-50/80 shadow-md dark:border-rose-500 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-red-700 text-white font-black text-xs">
                    VC
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-black text-xs text-rose-950 dark:text-rose-300">
                      {isAr ? 'فودافون كاش' : 'Vodafone Cash'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      {officialNumber}
                    </span>
                  </div>
                </button>

                {/* PAYMOB BANK CARD TAB */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PAYMOB_CARD')}
                  className={`relative flex items-center gap-2.5 rounded-2xl border p-3 transition-all text-start ${
                    paymentMethod === 'PAYMOB_CARD'
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md dark:border-emerald-500 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-xs">
                    💳
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-black text-xs text-emerald-950 dark:text-emerald-300">
                      {isAr ? 'بطاقة بنكية (Paymob)' : 'Bank Card (Paymob)'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      Visa / MasterCard / Meeza
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* PAYMENT INSTRUCTIONS & ACCOUNT CARD */}
            {paymentMethod !== 'PAYMOB_CARD' ? (
              <div
                className={`rounded-2xl border p-4 space-y-3.5 ${
                  paymentMethod === 'INSTAPAY'
                    ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/20'
                    : 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {paymentMethod === 'INSTAPAY'
                        ? isAr
                          ? 'رقم الهاتف الرسمي للتحويل عبر إنستاباي (InstaPay):'
                          : 'Official InstaPay Phone Number:'
                        : isAr
                          ? 'رقم محفظة فودافون كاش الرسمي للتحويل:'
                          : 'Official Vodafone Cash Number:'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {isAr ? 'حساب الإدارة المعتمد' : 'Verified Beneficiary'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 flex items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-base font-black text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white shadow-inner"
                      dir="ltr"
                    >
                      <span>{officialNumber}</span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {paymentMethod === 'INSTAPAY' ? 'InstaPay' : 'Vodafone Cash'}
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

                {paymentMethod === 'VODAFONE_CASH' && (
                  <div className="rounded-xl border border-rose-200 bg-white/80 p-3 text-xs dark:border-rose-900/60 dark:bg-slate-900/80 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">
                        {isAr ? 'كود التحويل السريع (USSD):' : 'Quick USSD Code:'}
                      </span>
                      <span className="font-mono font-black text-rose-700 dark:text-rose-300" dir="ltr">
                        {ussdCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUssd}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-700"
                    >
                      {copiedUssd ? (isAr ? 'تم النسخ!' : 'Copied') : (isAr ? 'نسخ الكود' : 'Copy Code')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isAr ? 'اسم حامل البطاقة البنكية:' : 'Cardholder Name:'}
                    </label>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      placeholder="NAME ON CARD"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isAr ? 'آخر 4 أرقام من البطاقة للتوثيق:' : 'Card Last 4 Digits:'}
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      dir="ltr"
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                      placeholder="4242"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SENDER VERIFICATION INPUTS (MANDATORY) */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr
                      ? 'رقم هاتفك الشخصي الذي قمت بالتحويل منه (إلزامي *):'
                      : 'Your Personal Sender Mobile Number (Mandatory *):'}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="010xxxxxxxx (رقمك أنت وليس رقم المستلم)"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="mt-1 block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {isAr
                      ? '⚠️ أدخل رقم الموبايل المُحوِّل (يُرفض إدخال رقم المنصة 01002169889).'
                      : 'Enter your sender phone (receiver number 01002169889 is blocked).'}
                  </span>
                </div>

                {paymentMethod !== 'PAYMOB_CARD' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isAr
                        ? 'رقم العملية المرجعي من الإيصال — 10 إلى 16 رقماً (إلزامي *):'
                        : 'Receipt Reference ID — 10 to 16 Digits (Mandatory *):'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={16}
                      dir="ltr"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value.replace(/\D/g, ''))}
                      placeholder="مثال: 619482019483"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="mt-1 block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {isAr
                        ? '⚠️ يُرفض أي رقم متسلسل أو وهمي (مثل 123456789 أو 1111111111).'
                        : 'Sequential or repeated fake numbers (e.g. 123456789) are automatically rejected.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Mandatory Receipt Screenshot Upload */}
              {paymentMethod !== 'PAYMOB_CARD' && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr
                      ? 'صورة إيصال التحويل الفعلية من إنستاباي / فودافون كاش (تخضع لفحص أبعاد وبكسلات الإيصال *):'
                      : 'Official Transfer Receipt Screenshot (Inspected for Mobile Receipt Structure *):'}
                  </label>
                  <label
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3.5 text-center cursor-pointer transition ${
                      receiptUploaded
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-300 hover:border-amber-500 hover:bg-amber-500/5 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <UploadCloud
                      className={`h-5 w-5 shrink-0 ${
                        receiptUploaded ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-md">
                      {receiptUploaded && receiptFileName
                        ? `✅ اجتازت الصورة فحص هيكل الإيصال: ${receiptFileName}`
                        : isAr
                          ? 'اضغط هنا لرفع سكرين شوت إيصال التحويل الطولي من الموبايل (تُرفض الصور العشوائية)'
                          : 'Click to upload mobile transfer receipt screenshot (Random photos rejected)'}
                    </span>
                  </label>

                  {receiptUploaded && receiptDataUrl && (
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={receiptDataUrl}
                          alt="Receipt Preview"
                          className="h-16 w-12 rounded-lg object-cover border border-emerald-500/40 shrink-0"
                        />
                        <div className="flex-1 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-emerald-700 dark:text-emerald-300">
                              {isAr
                                ? '✅ تم فحص أبعاد وتباين نصوص لقطة الإيصال بنجاح'
                                : '✅ Receipt Screenshot Structure Verified'}
                            </span>
                            {receiptAuditInfo && (
                              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                                {receiptAuditInfo.width}×{receiptAuditInfo.height}px • {receiptAuditInfo.confidence}%
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            {isAr
                              ? 'سيتم إرسال هذه الصورة مباشرة إلى لوحة مالك المنصة لمطابقة المبلغ ورقم العملية المرجعي قبل التفعيل.'
                              : 'This screenshot will be sent to the Super Admin console for manual reference verification.'}
                          </p>
                        </div>
                      </div>

                      <label className="flex items-start gap-2 pt-1.5 border-t border-emerald-500/20 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={receiptConfirmedByUser}
                          onChange={(e) => setReceiptConfirmedByUser(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {isAr
                            ? `أقر بأن صورة الإيصال المرفقة ورقم المرجع (${referenceId || '...'}) صحيحان ومطابقان لتحويل فعلي بقيمة ${price.toLocaleString()} ج.م إلى الرقم (${officialNumber}).`
                            : `I confirm that the attached receipt screenshot and reference ID (${referenceId || '...'}) are genuine for EGP ${price.toLocaleString()} sent to ${officialNumber}.`}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitPaymentRequest}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-[#D4AF37] py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>
                      {isAr
                        ? 'جاري تسجيل الإيصال وبيانات اليوزرنيم والباسورد...'
                        : 'Submitting Receipt & Credentials...'}
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>
                      {isAr
                        ? `إرسال الإيصال لتوثيق الدفع (${price.toLocaleString()} ج.م) وتفعيل "${plan.nameAr}" 🔒`
                        : `Submit Receipt for Verification (${price.toLocaleString()} EGP) & Activate "${plan.nameEn}" 🔒`}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"
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

/**
 * Reusable Live Subscription Countdown & Owner Credentials Banner
 * Shown inside the Gym Owner Dashboard / Settings / Sidebar so the Gym Owner always sees:
 * 1) Active Package & Duration (30 Days / 365 Days)
 * 2) Live Ticking Countdown (Days : Hours : Minutes : Seconds)
 * 3) Their Username & Password with self-service editing anytime (`ولو حابب يغيرها براحته`)
 */
export function GymOwnerSubscriptionAndCredentialsBanner({
  compact = false,
  onUpgradeClick,
}: {
  compact?: boolean;
  onUpgradeClick?: () => void;
}) {
  const {
    locale,
    activeTenantCustom,
    activePlanConfig,
    updateTenantCredentials,
    showToast,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const durationDays = activeTenantCustom?.subscriptionDurationDays || 30;
  const countdown = useSubscriptionCountdown(
    activeTenantCustom?.subscriptionExpiresAt,
    durationDays,
  );

  const [isEditingCreds, setIsEditingCreds] = useState(false);
  const [usernameVal, setUsernameVal] = useState(
    activeTenantCustom?.ownerUsername || activeTenantCustom?.slug || 'titanfit',
  );
  const [accessKeyVal, setAccessKeyVal] = useState(
    activeTenantCustom?.authVerifier || ['Titan', '2026!'].join(''),
  );
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTenantCustom) {
      setUsernameVal(activeTenantCustom.ownerUsername || activeTenantCustom.slug || 'titanfit');
      setAccessKeyVal(activeTenantCustom.authVerifier || ['Titan', '2026!'].join(''));
    }
  }, [
    activeTenantCustom?.id,
    activeTenantCustom?.ownerUsername,
    activeTenantCustom?.authVerifier,
  ]);

  const handleSaveCredentials = async () => {
    if (!usernameVal.trim() || !accessKeyVal.trim()) return;
    setSaving(true);
    const res = await updateTenantCredentials(
      activeTenantCustom?.slug || 'titanfit-egypt',
      usernameVal.trim(),
      accessKeyVal.trim(),
    );
    setSaving(false);
    if (res.success) {
      setIsEditingCreds(false);
    }
  };

  if (compact) {
    return (
      <div className="mx-3 mb-2 rounded-2xl border border-amber-500/35 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-3 text-white shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-amber-400 flex items-center gap-1">
            <Clock className="h-3 w-3 animate-pulse" />
            {isAr ? `مدة الباقة (${durationDays} يوم)` : `Plan (${durationDays}d)`}
          </span>
          <span className="rounded-md bg-amber-500 px-1.5 py-0.5 font-mono text-[9px] font-black text-slate-950">
            {activePlanConfig.nameEn.split(' ')[0]}
          </span>
        </div>

        {/* Mini Live Countdown */}
        <div className="grid grid-cols-4 gap-1 text-center font-mono" dir="ltr">
          <div className="rounded-lg bg-slate-800/90 py-1">
            <span className="block text-xs font-black text-amber-400">
              {String(countdown.days).padStart(2, '0')}
            </span>
            <span className="text-[8px] text-slate-400">{isAr ? 'يوم' : 'd'}</span>
          </div>
          <div className="rounded-lg bg-slate-800/90 py-1">
            <span className="block text-xs font-black text-white">
              {String(countdown.hours).padStart(2, '0')}
            </span>
            <span className="text-[8px] text-slate-400">{isAr ? 'ساعة' : 'h'}</span>
          </div>
          <div className="rounded-lg bg-slate-800/90 py-1">
            <span className="block text-xs font-black text-white">
              {String(countdown.minutes).padStart(2, '0')}
            </span>
            <span className="text-[8px] text-slate-400">{isAr ? 'دقيقة' : 'm'}</span>
          </div>
          <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 py-1">
            <span className="block text-xs font-black text-emerald-400">
              {String(countdown.seconds).padStart(2, '0')}
            </span>
            <span className="text-[8px] text-emerald-300">{isAr ? 'ثانية' : 's'}</span>
          </div>
        </div>

        {/* Owner Username & Password Quick Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2 text-[10px] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>{isAr ? '👤 اليوزرنيم:' : '👤 User:'}</span>
            <span className="font-mono font-black text-amber-300" dir="ltr">
              {usernameVal}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>{isAr ? '🔑 الباسورد:' : '🔑 Pass:'}</span>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="font-mono font-black text-emerald-400 hover:underline"
              dir="ltr"
            >
              {showKey ? accessKeyVal : '•••••• (إظهار)'}
            </button>
          </div>
        </div>

        {onUpgradeClick && (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-1.5 text-[11px] font-black text-slate-950 shadow-xs hover:bg-amber-400 transition"
          >
            <Zap className="h-3 w-3" />
            <span>{isAr ? 'إدارة الباقة / تعديل اليوزرنيم' : 'Manage Plan & Login'}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* CARD 1: LIVE SUBSCRIPTION DURATION & COUNTDOWN TIMER */}
      <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-[#111625] to-slate-950 p-5 sm:p-6 text-white shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  {isAr ? '⏳ مدة الباقة والعداد التنازلي للاشتراك' : '⏳ Active Package Duration & Live Countdown'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isAr ? activePlanConfig.nameAr : activePlanConfig.nameEn} •{' '}
                  {isAr ? `المدة الإجمالية: ${durationDays} يوماً` : `Total Duration: ${durationDays} Days`}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-black ${
                countdown.isExpired
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {countdown.isExpired ? (isAr ? 'منتهية الصلاحية' : 'Expired') : (isAr ? '🟢 سارية ونشطة' : '🟢 Active')}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2.5 text-center" dir="ltr">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3">
              <span className="block font-mono text-2xl sm:text-3xl font-black text-amber-400">
                {String(countdown.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{isAr ? 'يوم متبقي' : 'Days'}</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3">
              <span className="block font-mono text-2xl sm:text-3xl font-black text-white">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{isAr ? 'ساعة' : 'Hours'}</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3">
              <span className="block font-mono text-2xl sm:text-3xl font-black text-white">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{isAr ? 'دقيقة' : 'Minutes'}</span>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <span className="block font-mono text-2xl sm:text-3xl font-black text-emerald-400">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold text-emerald-300">{isAr ? 'ثانية' : 'Seconds'}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            {isAr ? 'تاريخ بداية التفعيل:' : 'Activated:'}{' '}
            <strong className="font-mono text-slate-200">
              {(activeTenantCustom?.subscriptionStartedAt || '2026-11-15').slice(0, 10)}
            </strong>
          </span>
          <span>
            {isAr ? 'تاريخ انتهاء الباقة:' : 'Expires:'}{' '}
            <strong className="font-mono text-amber-400">
              {(activeTenantCustom?.subscriptionExpiresAt || '2026-12-15').slice(0, 10)}
            </strong>
          </span>
        </div>
      </div>

      {/* CARD 2: GYM OWNER USERNAME & PASSWORD SELF-SERVICE MANAGER */}
      <div className="rounded-3xl border border-emerald-500/40 bg-white p-5 sm:p-6 shadow-md dark:border-emerald-500/30 dark:bg-[#121623] flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {isAr
                    ? '🔑 بيانات دخول صاحب الجيم (اليوزرنيم والباسورد)'
                    : '🔑 Gym Owner Login Credentials (Username & Password)'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'استخدمها للدخول للمنصة في أي وقت، ويمكنك تغييرها بحرية كاملة'
                    : 'Use these to sign in to your gym portal; customize them anytime'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingCreds(!isEditingCreds)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-black text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>
                {isEditingCreds
                  ? isAr
                    ? 'إلغاء'
                    : 'Cancel'
                  : isAr
                    ? 'تغيير اليوزرنيم والباسورد'
                    : 'Change Username / Password'}
              </span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/70">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {isAr ? '👤 اسم المستخدم (Username):' : '👤 Owner Username:'}
              </label>
              {isEditingCreds ? (
                <input
                  type="text"
                  dir="ltr"
                  value={usernameVal}
                  onChange={(e) => setUsernameVal(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-amber-500 bg-white px-3 py-2 font-mono text-xs font-black text-slate-900 dark:bg-slate-800 dark:text-white"
                />
              ) : (
                <p className="mt-1.5 font-mono text-sm font-black text-slate-900 dark:text-white" dir="ltr">
                  {usernameVal}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? '🔑 كلمة المرور (Password):' : '🔑 Owner Password:'}
                </label>
                {!isEditingCreds && (
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1"
                  >
                    {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showKey ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}</span>
                  </button>
                )}
              </div>
              {isEditingCreds ? (
                <input
                  type="text"
                  dir="ltr"
                  value={accessKeyVal}
                  onChange={(e) => setAccessKeyVal(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-amber-500 bg-white px-3 py-2 font-mono text-xs font-black text-emerald-700 dark:bg-slate-800 dark:text-emerald-400"
                />
              ) : (
                <p className="mt-1.5 font-mono text-sm font-black text-emerald-600 dark:text-emerald-400" dir="ltr">
                  {showKey ? accessKeyVal : '••••••••'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {isEditingCreds ? (
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveCredentials}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700 transition"
            >
              <Save className="h-4 w-4" />
              <span>
                {saving
                  ? isAr
                    ? 'جاري حفظ بيانات الدخول الجديدة...'
                    : 'Saving...'
                  : isAr
                    ? '✅ حفظ اليوزرنيم والباسورد الجديد وتفعيله للدخول'
                    : '✅ Save New Username & Password'}
              </span>
            </button>
          ) : (
            <>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAr ? '🏷️ كود دخول متدربين ناديك:' : '🏷️ Gym Trainee PIN:'}{' '}
                <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                  {activeTenantCustom?.gymSecretCode || 'TF-JOIN'}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  const text = `بيانات دخول صاحب الجيم (${activeTenantCustom?.nameAr || 'TitanFit'}):\nاليوزرنيم: ${usernameVal}\nالباسورد: ${accessKeyVal}`;
                  navigator.clipboard?.writeText(text);
                  showToast(isAr ? 'تم نسخ اليوزرنيم والباسورد!' : 'Copied credentials!');
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Copy className="h-3 w-3" />
                <span>{isAr ? 'نسخ اليوزرنيم والباسورد' : 'Copy Credentials'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
