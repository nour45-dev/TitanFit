'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Dumbbell,
  FileText,
  Flame,
  Gift,
  HeartPulse,
  Lock,
  MessageCircle,
  MessageSquare,
  Play,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Utensils,
  Video,
  Zap,
  X,
  Trophy,
} from 'lucide-react';
import { PLATFORM_CONFIG } from '@gymos/config';
import { usePlatformStore, SaaSSubscriptionPlanConfig } from '../../lib/platform-store';
import { downloadEbookPdf, downloadSaaSPricingPdf } from '../../lib/pdf-docs';
import { SaaSPaymentGatewayModal } from './saas-payment-gateway-modal';
import { CalorieAndMealPlanner } from './calorie-and-meal-planner';
import { SportsHeroBackdrop, SportsTicker } from '../ui/modern-ambient-background';

interface TransformationStory {
  id: string;
  nameAr: string;
  nameEn: string;
  age?: number;
  roleAr?: string;
  roleEn?: string;
  durationAr: string;
  durationEn: string;
  weightBeforeKg: number;
  weightAfterKg: number;
  bodyFatBefore: string;
  bodyFatAfter: string;
  quoteAr: string;
  quoteEn: string;
  badgeAr: string;
  badgeEn: string;
  photoUrl?: string;
  isIllustrativeExample?: boolean;
}


const TRANSFORMATION_STORIES: TransformationStory[] = [
  {
    id: 'tr-1',
    nameAr: 'نموذج محاكاة رقمي (مثال توضيحي)',
    nameEn: 'Simulated Digital Model (Illustrative Case)',
    roleAr: 'محاكاة حسابية لرحلة نحت وخسارة دهون (ليس عميلاً حقيقياً)',
    roleEn: 'Mathematical simulation of fat-loss & recomposition (Not a real person)',
    durationAr: '١٢ أسبوع متابعة افتراضية',
    durationEn: '12 Weeks Projected',
    weightBeforeKg: 92,
    weightAfterKg: 83,
    bodyFatBefore: '24%',
    bodyFatAfter: '16.5%',
    badgeAr: '-9 كجم وزن إجمالي (-8.4 كجم دهون صافية) خلال 12 أسبوع',
    badgeEn: '-9 kg Total (-8.4 kg Fat) over 12 weeks',
    isIllustrativeExample: true,
    quoteAr:
      'مثال توضيحي بالأرقام: نزول واقعي من ٩٢ كجم (٢٤٪ دهون = ٢٢.١ كجم دهون و٦٩.٩ كجم كتلة خالية من الدهون) إلى ٨٣ كجم (١٦.٥٪ دهون = ١٣.٧ كجم دهون و٦٩.٣ كجم كتلة خالية من الدهون) خلال ١٢ أسبوعاً بمعدل صافي -٨.٤ كجم دهون مع الحفاظ على الكتلة العضلية.',
    quoteEn:
      'Illustrative numerical example: realistic drop from 92 kg (24% body fat = 22.1 kg fat, 69.9 kg lean mass) to 83 kg (16.5% body fat = 13.7 kg fat, 69.3 kg lean mass) in 12 weeks (-9 kg total weight, -8.4 kg fat mass while preserving lean mass).',
  },
];


const MYTH_FAQS = [
  {
    qAr: 'أنا مش بتاع دايت، أنا دايماً جعان فمش هقدر ألتزم!',
    qEn: 'I am always hungry — I can never stick to a diet!',
    aAr: 'متصدقش اللي دماغك بتقوله! إحساس الجوع غالباً بيكون بسبب نقص الألياف والبروتين. إحنا بنعالج ده بأكل مشبع جداً وغني بالألياف وبنظبط الـ Mindset عشان توصل لهدفك من غير حرمان.',
    aEn: 'Hunger usually comes from low-protein, low-fiber crash diets. We design high-volume, macro-balanced meals that keep you full all day.',
  },
  {
    qAr: 'أنا خايف من الترهلات بعد ما أخس؟',
    qEn: 'Will I get loose skin after losing weight?',
    aAr: 'الترهلات بتحصل بس لما تعتمد على دايت قاسي بيخسس عضل ومياه بسرعة. في منصتنا بننزل دهون بمعدل علمي محسوب مع تمارين مقاومة تحافظ على شد الجلد والكتلة العضلية.',
    aEn: 'Loose skin happens with starvation diets. Our scientific fat-loss pace combined with resistance training tightens your physique naturally.',
  },
  {
    qAr: 'هو أنا ممكن أخس دهون وأزيد عضلات في نفس الوقت؟',
    qEn: 'Can I lose fat and build muscle at the same time (Body Recomp)?',
    aAr: 'أكيد! وده هدفنا الأساسي (Body Recomposition) عن طريق ضبط كمية البروتين اليومية وتدرج الأحمال التدريبية (Progressive Overload).',
    aEn: 'Yes! Body recomposition is our core specialty using high protein intake and tracked progressive overload.',
  },
  {
    qAr: 'عايز أخس 20 كيلو في أسبوعين! هل ده ممكن؟',
    qEn: 'Can I lose 20 kg in two weeks?',
    aAr: 'علمياً وطبياً ده مستحيل ومضر جداً بصحتك. إحنا مش بنبيع أوهام؛ بنحط هدف استراتيجي واقعي وملموس يغير شكل جسمك وحياتك للأبد بدون رجوع في الوزن.',
    aEn: 'Medically, crash weight loss destroys metabolism. We build sustainable, permanent fat loss that never rebounds.',
  },
  {
    qAr: 'إيه رأيك في الكيتو دايت؟ وهل لازم أقطع نشويات من يوم السبت؟',
    qEn: 'Should I do Keto or cut out all carbs starting Saturday?',
    aAr: 'النشويات مش عدوك! قطع النشويات بينزل مياه وهمية بترجع أول ما تاكل. الدايت الصح بيحتوي على كل الماكروز (بروتين، نشويات، دهون صحية) محسوبة بدقة لطبيعة جسمك.',
    aEn: 'Carbs are fuel, not the enemy! Cutting carbs only drops water weight. We include rice, oats, bread, and pasta in calculated portions.',
  },
  {
    qAr: 'أنا مش هعرف ألتزم مع مدرب أونلاين!',
    qEn: 'How do I stay accountable with online coaching?',
    aAr: 'إنت مش لوحدك! الكوتش معاك يومياً على الواتساب والتطبيق، بالإضافة لتصحيح الأداء عن طريق تصوير فيديو لتمرينك ومراجعته خطوة بخطوة في أقل من 24 ساعة.',
    aEn: 'You get daily WhatsApp check-ins, video form reviews for every exercise, and live group meetings so you are supported every single day.',
  },
];


export function PublicCoachingStorefrontView({
  onSwitchToDashboard,
  onSwitchToMemberApp,
  onSwitchToSaaSPricing,
  onOpenFreeTrialHub,
}: {
  onSwitchToDashboard: () => void;
  onSwitchToMemberApp: () => void;
  onSwitchToSaaSPricing: () => void;
  onOpenFreeTrialHub?: () => void;
}) {
  const { locale, showToast, saasPlans } = usePlatformStore();
  const isAr = locale === 'ar';

  const [gymSaaSAnnual, setGymSaaSAnnual] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<SaaSSubscriptionPlanConfig | null>(null);

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const [ebookEmail, setEbookEmail] = useState('');
  const [showEbookModal, setShowEbookModal] = useState(false);
  const [sentEbookEmail, setSentEbookEmail] = useState('');

  const [ebookBusy, setEbookBusy] = useState(false);

  // Close ebook modal on Escape key press
  useEffect(() => {
    if (!showEbookModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEbookModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEbookModal]);

  const generateEbook = async (email: string): Promise<boolean> => {
    setEbookBusy(true);
    try {
      await downloadEbookPdf(email);
      return true;
    } catch {
      showToast(
        isAr
          ? 'تعذّر إنشاء ملف الكتاب على جهازك. حدّث الصفحة وحاول مرة أخرى.'
          : 'Could not create the e-book on your device. Refresh and try again.',
      );
      return false;
    } finally {
      setEbookBusy(false);
    }
  };

  const handleSendEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = ebookEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      showToast(isAr ? 'يرجى إدخال بريد إلكتروني صحيح لاستلام الكتاب' : 'Please enter a valid email address');
      return;
    }
    if (ebookBusy) return;
    setSentEbookEmail(email);
    if (await generateEbook(email)) {
      setShowEbookModal(true);
      showToast(
        isAr
          ? '📘 تم تنزيل كتاب الـ PDF العربي على جهازك. ابحث عنه في مجلد التنزيلات (Downloads).'
          : '📘 Your Arabic PDF e-book was downloaded to your device (check your Downloads folder).',
      );
    }
  };

  const redownloadEbook = async () => {
    if (await generateEbook(sentEbookEmail || ebookEmail.trim())) {
      showToast(isAr ? 'تم تنزيل الكتاب مرة أخرى' : 'E-book downloaded again');
    }
  };

  return (
    <div data-testid="panel-public-storefront" className="mx-auto max-w-7xl space-y-16 pb-20 text-slate-900 dark:text-slate-100">
      {/* 1. PURE WHITE LUXURY HERO SECTION — DIET & CHEAT HIGH-CONVERSION STYLE */}
      <SportsTicker isAr={isAr} />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#0E131F]/95 sm:p-12"
      >
        {/* Sports-themed animated backdrop: weight plate, activity rings, heartbeat */}
        <SportsHeroBackdrop />
        <div className="pointer-events-none absolute -top-32 start-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent blur-3xl animate-ambient-float" />
        <div className="pointer-events-none absolute -bottom-32 end-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl animate-ambient-pulse" />
        <div className="pointer-events-none absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-full max-w-5xl rounded-full bg-amber-500/5 blur-3xl" />
        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Right Text Column (in RTL) */}
          <div className="space-y-6 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3.5 py-1 text-xs font-bold text-slate-700 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {isAr
                  ? '🚀 المنصة السحابية المتكاملة لإدارة الجيمات والأندية الرياضية في مصر'
                  : '🚀 ALL-IN-ONE CLOUD OPERATING SYSTEM FOR GYMS & FITNESS CLUBS'}
              </span>
            </motion.div>

            <h1 className="text-3xl font-black leading-[1.2] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem] dark:text-white">
              {isAr ? (
                <>
                  أدِر ناديك الرياضي باحترافية كاملة —{' '}
                  <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-amber-400 dark:to-orange-400">
                    اشتراكات، بوابات QR، كاشير
                  </span>{' '}
                  وتطبيق متدربين باسم جيمك!
                </>
              ) : (
                <>
                  Run Your Gym Like an Enterprise —{' '}
                  <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-amber-400 dark:to-orange-400">
                    QR Gates, Cashier POS, CRM
                  </span>{' '}
                  &amp; Branded Member App!
                </>
              )}
            </h1>

            <p className="max-w-2xl text-sm font-normal leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
              {isAr
                ? 'منظومة سحابية متكاملة تجمع بين إدارة المتدربين، بوابات دخول بـ QR مشفر يمنع مشاركة الصور، تحصيل إنستاباي وفودافون كاش وكاش بضريبة 14%، نقطة بيع المكملات POS، وكوتش ذكاء اصطناعي — مع عزل تام 100% لبيانات كل نادٍ.'
                : 'One unified cloud OS for member management, rotating HMAC-SHA256 QR turnstiles, Egyptian cashier & supplement POS, trainer commissions, and AI coaching — with strict multi-tenant PostgreSQL RLS isolation.'}
            </p>

            {/* Primary SaaS Conversion CTAs */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => document.getElementById('saas-pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-[#D4AF37] px-7 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-105 active:scale-95"
              >
                <Zap className="h-4 w-4" />
                <span>{isAr ? 'اشترك الآن واختر باقة ناديك' : 'Choose Your Gym Plan'}</span>
              </button>

              {onOpenFreeTrialHub && (
                <button
                  type="button"
                  data-testid="open-free-trial-hub-btn"
                  onClick={onOpenFreeTrialHub}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                >
                  <Gift className="h-4 w-4 text-amber-500" />
                  <span>{isAr ? 'استعرض تجربة المتدرب المجانية' : 'Preview Free Member Experience'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => document.getElementById('free-calorie-calculator')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-600 transition hover:text-amber-600 dark:text-slate-300 sm:ps-2"
              >
                <Calculator className="h-4 w-4 text-amber-500" />
                <span>{isAr ? 'جرب حاسبة السعرات التفاعلية ←' : 'Try Interactive Calorie Planner →'}</span>
              </button>
            </div>

            {/* Verified Platform Architecture Trust Metrics */}
            <div
              data-testid="hero-trust-metrics"
              className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-6 sm:gap-6 dark:border-slate-800"
            >
              <div>
                <p className="font-mono text-lg font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                  FORCE RLS
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {isAr ? 'عزل بيانات 100% لكل جيم' : '100% Isolated Tenant DB'}
                </p>
              </div>
              <div className="border-s border-slate-100 ps-3 sm:ps-6 dark:border-slate-800">
                <p className="font-mono text-lg font-black tracking-tight text-emerald-600 sm:text-2xl dark:text-emerald-400">
                  30s QR
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {isAr ? 'كود دخول مشفر يمنع التصوير' : 'HMAC Anti-Screenshot Gate'}
                </p>
              </div>
              <div className="border-s border-slate-100 ps-3 sm:ps-6 dark:border-slate-800">
                <p className="font-mono text-lg font-black tracking-tight text-amber-600 sm:text-2xl dark:text-amber-400">
                  24/7
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {isAr ? 'تفعيل ودعم فني مباشر' : 'Instant Onboarding & Support'}
                </p>
              </div>
            </div>
          </div>

          {/* Left Visual Column — SaaS Product Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="relative h-64 w-full overflow-hidden bg-slate-950 flex flex-col justify-end p-5">
                <motion.img
                  src="/brand/hero-fitness-nutrition.jpg"
                  alt={isAr ? 'منظومة TitanFit لإدارة الأندية الرياضية' : 'TitanFit Gym Operating System'}
                  data-testid="hero-fitness-nutrition-img"
                  initial={{ scale: 1.08 }}
                  animate={{ scale: [1.04, 1.12, 1.04] }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 h-full w-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/15" />

                {/* Floating Pill 1: Rotating QR Gate */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-3.5 start-3.5 z-10 flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-slate-950/85 px-3 py-1.5 text-[11px] font-black text-emerald-300 shadow-lg backdrop-blur-md"
                >
                  <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isAr ? 'بوابة QR مشفرة HMAC' : 'HMAC QR Turnstiles'}</span>
                </motion.div>

                {/* Floating Pill 2: White-Label PWA */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute top-3.5 end-3.5 z-10 flex items-center gap-1.5 rounded-2xl border border-amber-400/40 bg-slate-950/85 px-3 py-1.5 text-[11px] font-black text-amber-300 shadow-lg backdrop-blur-md"
                >
                  <Smartphone className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isAr ? 'تطبيق المتدرب باسم ناديك' : 'White-Label Member PWA'}</span>
                </motion.div>

                <span className="relative z-10 w-fit rounded-full bg-amber-500 px-3.5 py-1 text-xs font-black text-slate-950 shadow">
                  {isAr ? '⚡ جاهز للتشغيل الفوري لناديك' : '⚡ Production-Ready Gym OS'}
                </span>
                <div className="relative z-10 mt-2.5 flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm font-black">
                      {isAr ? 'لوحة تحكم شاملة لصاحب الجيم + تطبيق المتدرب' : 'Owner Command Center + Member PWA'}
                    </p>
                    <p className="text-[11px] text-amber-300">
                      {isAr ? 'كاشير مصري • عمولات مدربين • جرد مكملات • AI Coach' : 'Cashier POS • Trainer Commissions • Supplement Inventory • AI Coach'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[10px] font-bold text-slate-500">{isAr ? 'بوابات الدفع المعتمدة' : 'Supported Gateways'}</p>
                    <p className="mt-1 font-black text-slate-900 dark:text-white">
                      {isAr ? 'إنستاباي • فودافون • كاش' : 'InstaPay • Vodafone • Cash'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[10px] font-bold text-slate-500">{isAr ? 'تبديل الهوية الفوري' : 'Club Branding'}</p>
                    <p className="mt-1 font-black text-emerald-600 dark:text-emerald-400">
                      {isAr ? 'شعار وألوان ناديك 100%' : '100% Your Logo & Colors'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => document.getElementById('saas-pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-xs font-black text-white transition hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
                >
                  <span>{isAr ? 'ابدأ من 950 ج.م / شهر (أو وفر 20% سنوياً)' : 'Plans starting at 950 EGP/mo (Save 20% annually)'}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 1.2 BEFORE VS AFTER TITANFIT — WHY GYM OWNERS SWITCH */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-rose-200/80 bg-rose-50/50 p-6 sm:p-8 dark:border-rose-500/20 dark:bg-rose-950/15">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-[11px] font-black text-rose-700 dark:text-rose-300">
            <span>❌ {isAr ? 'قبل TitanFit (الإدارة التقليدية)' : 'Before TitanFit (Manual Chaos)'}</span>
          </span>
          <h3 className="mt-3 text-lg font-black text-slate-900 dark:text-white">
            {isAr ? 'مشاكل تسرّب الإيرادات والفوضى اليومية' : 'Revenue Leaks & Daily Operational Chaos'}
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-black">•</span>
              <span>{isAr ? 'تداخل مواعيد انتهاء الاشتراكات وعدم معرفة المتدربين المتغيبين.' : 'Missed subscription expirations and zero churn visibility.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-black">•</span>
              <span>{isAr ? 'تصوير كروت الدخول أو إرسال QR ثابت بين الأصدقاء لدخول الجيم مجاناً.' : 'Static membership cards shared via screenshots among non-members.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-black">•</span>
              <span>{isAr ? 'تضارب حسابات الكاشير، عمولات المدربين، ومخزون المكملات الغذائية.' : 'Cashier mismatches, manual trainer commissions, and lost supplement stock.'}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/50 p-6 sm:p-8 dark:border-emerald-500/25 dark:bg-emerald-950/15">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
            <span>✅ {isAr ? 'مع منظومة TitanFit OS' : 'With TitanFit Cloud OS'}</span>
          </span>
          <h3 className="mt-3 text-lg font-black text-slate-900 dark:text-white">
            {isAr ? 'تحكم كامل، أمان بنكي، وتجربة فاخرة لمتدربيك' : 'Total Control, Bank-Grade Isolation & Luxury Member Experience'}
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? 'بوابة QR مشفرة تتغير كل 30 ثانية وتمنع مشاركة الصور نهائياً.' : 'Rotating 30s HMAC-SHA256 QR pass stops screenshot sharing cold.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? 'كاشير رسمي شامل ضريبة 14%، جرد لحظي لـ POS المكملات، وحساب عمولات المدربين تلقائياً.' : '14% VAT cashier, real-time POS supplement stock deduction & automated commissions.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? 'تطبيق متدربين (PWA) باسم وشعار ناديك مع تمارين 3D، جدول دايت، وكوتش AI.' : 'White-label Member PWA with 3D workouts, diet plans, and AI Coach.'}</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 1.4 6-PILLAR SAAS FEATURE GRID */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{isAr ? 'منظومة واحدة تغنيك عن 5 برامج منفصلة' : '6 CORE MODULES IN ONE UNIFIED SYSTEM'}</span>
          </span>
          <h2 className="text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
            {isAr ? 'كل أدوات إدارة الجيم والبيع وتدريب الأعضاء في لوحة واحدة' : 'Everything Your Gym Needs to Scale & Retain Members'}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: QrCode,
              color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
              titleAr: 'بوابات الدخول بالـ QR الدوار',
              titleEn: 'Rotating HMAC QR Gates',
              descAr: 'كود مشفر يتجدد كل 30 ثانية عبر الهاتف مع تحقق لحظي من صلاحية الاشتراك وعدد الحصص.',
              descEn: 'Cryptographic 30-second rotating pass with live membership & freeze validation.',
            },
            {
              icon: Users,
              color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
              titleAr: 'CRM المتدربين والملف الطبي والفروع',
              titleEn: 'Member CRM & Multi-Branch',
              descAr: 'تسجيل الأعضاء بالـ QR، تجميد الاشتراكات، سجل الإصابات، وعزل بيانات كل فرع وجيم.',
              descEn: 'Member onboarding, freeze tracking, medical notes, and strict RLS tenant isolation.',
            },
            {
              icon: CreditCard,
              color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
              titleAr: 'الكاشير ونقطة بيع المكملات (POS)',
              titleEn: 'Cashier & Supplement POS',
              descAr: 'تحصيل كاش، إنستاباي، فودافون كاش، وفوري مع إصدار فواتير بضريبة 14% وخصم فوري من المخزون.',
              descEn: 'Accept Cash, InstaPay, Vodafone Cash & Fawry with 14% VAT invoices and live stock deduction.',
            },
            {
              icon: Bot,
              color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
              titleAr: 'كوتش وأخصائي تغذية بالذكاء الاصطناعي',
              titleEn: 'Pro AI Coach & CRM Assistant',
              descAr: 'حساب Mifflin-St Jeor بالجرامات، بدائل إصابات المفاصل، ومساعد ذكي لبيانات الجيم للمالك.',
              descEn: 'Gram-accurate nutrition plans, joint-safe swaps, and live CRM lookup for owners.',
            },
            {
              icon: Smartphone,
              color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
              titleAr: 'تطبيق المتدرب (White-Label PWA)',
              titleEn: 'Branded Member PWA App',
              descAr: 'يعمل على أي موبايل بدون متجر تطبيقات: تمارين 3D تفاعلية، دايت، مياه، ونقاط XP.',
              descEn: 'Instant mobile web app with 3D animated workouts, macros, water tracker & XP leaderboard.',
            },
            {
              icon: BarChart3,
              color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
              titleAr: 'المدربون والعمولات والتقارير المالية',
              titleEn: 'Trainer Commissions & BI Reports',
              descAr: 'تتبع نسب المدربين، الحصص الجماعية، مصاريف الجيم، وتصدير تقارير CSV وPDF بضغطة زر.',
              descEn: 'Automated PT commissions, class waitlists, expense tracking, and 1-click CSV/PDF exports.',
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.titleEn}
                className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${feat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 text-sm font-black text-slate-900 dark:text-white">
                  {isAr ? feat.titleAr : feat.titleEn}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {isAr ? feat.descAr : feat.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 1.5 MODERN ANIMATED FITNESS, NUTRITION & AI BIOMECHANICS SHOWCASE */}
      <section
        data-testid="animated-fitness-nutrition-showcase"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            icon: Dumbbell,
            accent: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
            iconBg: 'bg-amber-500 text-slate-950',
            tagAr: 'محاكاة حركية 3D',
            tagEn: '3D Biomechanics',
            titleAr: 'تمارين مشروحة بالعضلات المستهدفة',
            titleEn: 'Anatomical Muscle Vector Workouts',
            descAr: 'شاهد زاوية المفصل (ROM) ونبض تفعيل الألياف العضلية (EMG) وإيقاع العدات 3-1-1.',
            descEn: 'Live joint ROM angles, EMG muscle fiber activation pulse, and 3-1-1 rep tempo.',
          },
          {
            icon: Utensils,
            accent: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
            iconBg: 'bg-emerald-600 text-white',
            tagAr: 'معادلة 4P + 4C + 9F',
            tagEn: 'Exact Macro Math',
            titleAr: 'تغذية رياضية ووصفات محسوبة',
            titleEn: 'Precision Sports Nutrition & Meals',
            descAr: 'وجبات مشبعة من البيت المصري محسوبة الجرامات والسعرات للتنشيف أو الضخامة.',
            descEn: 'Satiating meals with verified protein, carbs, and healthy fats for cutting or bulking.',
          },
          {
            icon: Sparkles,
            accent: 'from-sky-500/20 to-sky-600/5 border-sky-500/30',
            iconBg: 'bg-sky-500 text-slate-950',
            tagAr: 'AI Gym & Nutritionist',
            tagEn: 'Smart AI Coach',
            titleAr: 'مدرب ذكي وأخصائي تغذية فوري',
            titleEn: '24/7 AI Trainer & Nutritionist',
            descAr: 'اسأل المساعد الذكي عن أي تمرين أو دايت أو بديل غذائي وسيرد عليك بخطة مفصلة.',
            descEn: 'Ask our AI coach about workout splits, macros, or food swaps anytime.',
          },
          {
            icon: HeartPulse,
            accent: 'from-rose-500/20 to-rose-600/5 border-rose-500/30',
            iconBg: 'bg-rose-600 text-white',
            tagAr: 'خطة ٧ أيام + متابعة',
            tagEn: '7-Day Self Tracker',
            titleAr: 'جدول أسبوعي ومسجل تقدم ذاتي',
            titleEn: 'Weekly Split & Personal Progress Log',
            descAr: 'سجّل وزنك، أكواب المياه، التزامك بالدايت، وأرقامك القياسية (1RM) يومياً.',
            descEn: 'Log body weight, daily hydration, meal adherence, and Epley 1RM PRs.',
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.titleEn}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.01 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br ${card.accent} bg-white p-5 shadow-sm transition dark:bg-slate-900`}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconBg} shadow-md transition group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-[10px] font-black text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  {isAr ? card.tagAr : card.tagEn}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-black text-slate-950 dark:text-white">
                {isAr ? card.titleAr : card.titleEn}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {isAr ? card.descAr : card.descEn}
              </p>
            </motion.div>
          );
        })}
      </section>

      {/* 2. FREE WORKOUT & DIET TRIAL CALLOUT BANNER FOR NEW VISITORS */}
      {onOpenFreeTrialHub && (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-slate-950 via-[#0F172A] to-slate-950 p-6 sm:p-10 text-white shadow-2xl"
        >
          {/* Animated Ambient Glow & Light Shimmer */}
          <div className="pointer-events-none absolute -top-24 start-1/3 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl animate-ambient-float" />
          <div className="pointer-events-none absolute -bottom-24 end-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl animate-ambient-pulse" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-start gap-4 max-w-2xl">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25"
              >
                <Video className="h-7 w-7" />
              </motion.div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-0.5 text-[11px] font-black text-amber-300 backdrop-blur-xs">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>{isAr ? 'تجربة مجانية لزوار الموقع' : 'FREE ACCESS FOR VISITORS'}</span>
                </div>
                <h2 className="text-xl font-black text-white sm:text-2xl lg:text-3xl tracking-tight">
                  {isAr
                    ? 'داخل تجرب الأول؟ افتح مكتبة التمارين بالفيديو والأنظمة الغذائية المجانية!'
                    : 'Want to Try First? Open Our Free Video Workouts & Meal Plans Hub!'}
                </h2>
                <p className="text-xs text-slate-300 sm:text-sm leading-relaxed">
                  {isAr
                    ? 'شاهد فيديوهات التمارين مع إرشادات الأداء الحركي السليم، شغل تايمر التمرين التفاعلي، وحمل ٣ أنظمة غذائية كاملة بالجرامات والبدائل الاقتصادية مجاناً.'
                    : 'Watch HD exercise demos with proper form cues, use our interactive set & rest timer, and grab 3 complete meal plans for free.'}
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenFreeTrialHub}
              className="relative group overflow-hidden inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-8 py-4 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/20 transition hover:shadow-amber-500/35"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="h-4 w-4 fill-slate-950" />
                <span>
                  {isAr
                    ? 'افتح التمارين والأنظمة المجانية الآن ←'
                    : 'Open Free Workouts & Diets Now →'}
                </span>
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </motion.button>
          </div>
        </motion.section>
      )}

      {/* 3. HOW IT WORKS IN 4 STEPS — "إنت مش لوحدك" */}
      <section className="space-y-8 relative">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black text-amber-800 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{isAr ? 'رحلتك معانا خطوة بخطوة' : 'HOW YOUR TRANSFORMATION WORKS'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-4xl dark:text-white">
            {isAr
              ? 'ابدأ رحلة تغيير جسمك وحياتك في ٤ خطوات بسيطة'
              : 'Start in 4 Simple Steps — You Are Never Alone'}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: '01',
              titleAr: '١. اختر الباقة (قريباً / نسخة تجريبية)',
              titleEn: '1. Select Package (Coming Soon / Demo)',
              descAr:
                'استعرض الباقات المناسبة لهدفك؛ بوابات الدفع الإلكتروني (إنستاباي، فودافون كاش، فوري، والبطاقة البنكية) قريباً — المنصة حالياً في وضع النسخة التجريبية.',
              descEn:
                'Browse coaching packages; digital payment gateways (InstaPay, Fawry, Vodafone Cash, and Card) are coming soon — currently in demo preview.',
              icon: CreditCard,
              color: 'text-amber-600 bg-amber-500/10 border-amber-300/30 dark:text-amber-400',
              gradient: 'from-amber-500/20 to-transparent',
            },
            {
              step: '02',
              titleAr: '٢. نمط حياتك ومستواك الرياضي',
              titleEn: '2. Lifestyle & Activity Profile',
              descAr:
                'بنتعرف على تفاصيل يومك، الأكل اللي بتحبه، ومستوى نشاطك الحالي عشان نفصل البرنامج التدريبي والغذائي المناسب لك.',
              descEn:
                'We review your daily routine, food preferences, and current fitness level to tailor your plan.',
              icon: HeartPulse,
              color: 'text-emerald-600 bg-emerald-500/10 border-emerald-300/30 dark:text-emerald-400',
              gradient: 'from-emerald-500/20 to-transparent',
            },
            {
              step: '03',
              titleAr: '٣. الجزء السحري (البرنامج المفصل)',
              titleEn: '3. The Custom Blueprint',
              descAr:
                'تستلم على التطبيق خطتك الغذائية بالوصفات المصورة وبرنامجك التدريبي المشروح بالفيديو والرسوم التوضيحية.',
              descEn:
                'Receive your custom meal plan, illustrated recipes, and step-by-step video & animated workouts.',
              icon: Sparkles,
              color: 'text-sky-600 bg-sky-500/10 border-sky-300/30 dark:text-sky-400',
              gradient: 'from-sky-500/20 to-transparent',
            },
            {
              step: '04',
              titleAr: '٤. المتابعة: إنت مش لوحدك!',
              titleEn: '4. Daily Coaching & Check-Ins',
              descAr:
                'متابعة دورية على الواتساب والتطبيق، ومراجعة لأدائك التدريبي بالفيديو وتشجيع مستمر على الالتزام لحد ما توصل لهدفك.',
              descEn:
                'Regular WhatsApp check-ins, exercise form feedback, and ongoing accountability until you reach your goal.',
              icon: MessageCircle,
              color: 'text-purple-600 bg-purple-500/10 border-purple-300/30 dark:text-purple-400',
              gradient: 'from-purple-500/20 to-transparent',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/85 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-amber-400/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80"
              >
                {/* Subtle top glow highlight on hover */}
                <div className={`pointer-events-none absolute -top-12 start-1/2 -translate-x-1/2 h-24 w-32 rounded-full bg-gradient-to-b ${item.gradient} blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                <div className="relative z-10 flex items-center justify-between">
                  <div className={`rounded-xl border p-3 ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-3xl font-black bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 bg-clip-text text-transparent opacity-70 group-hover:opacity-100 transition-opacity">
                    {item.step}
                  </span>
                </div>
                <h3 className="relative z-10 mt-4 text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
                <p className="relative z-10 mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {isAr ? item.descAr : item.descEn}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. ILLUSTRATIVE TRANSFORMATION EXAMPLE */}
      <section id="transformations-section" className="scroll-mt-24 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
              {isAr ? 'مثال توضيحي لنتيجة ممكنة' : 'ILLUSTRATIVE EXAMPLE OF POSSIBLE RESULT'}
            </span>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              {isAr
                ? 'مثال توضيحي لنتيجة ممكنة بالالتزام بالخطة الغذائية والتدريبية'
                : 'Illustrative Example of a Possible Result with Consistent Training & Nutrition'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById('free-calorie-calculator')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs font-extrabold text-amber-800 dark:text-amber-400 hover:underline"
          >
            {isAr ? 'ابدأ قصتك بحساب سعراتك ←' : 'Start your story — calculate your calories →'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-xl">
          {TRANSFORMATION_STORIES.map((story, idx) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
            >
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-5 flex flex-col justify-end">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.2),transparent_70%)]" />
                  <div className="absolute top-3 end-3 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    <Trophy className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="relative z-10 w-fit rounded-full bg-emerald-700 px-3 py-1 text-[11px] font-extrabold text-white shadow">
                    {isAr ? story.badgeAr : story.badgeEn}
                  </span>
                  <div className="relative z-10 mt-2 flex items-center justify-between text-white">
                    <span className="rounded-lg bg-black/40 px-2.5 py-1 font-mono text-[11px] font-extrabold text-amber-300 border border-amber-500/20">
                      {isAr ? 'مثال توضيحي لرحلة تحوّل' : 'Illustrative Transformation'}
                    </span>
                    <span className="rounded-lg bg-white/95 px-2.5 py-1 font-mono text-[11px] font-extrabold text-slate-900">
                      {isAr ? story.durationAr : story.durationEn}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        {isAr ? 'الوزن السابق' : 'Before'}
                      </span>
                      <p className="font-mono text-base font-black text-rose-600">
                        {story.weightBeforeKg} kg
                      </p>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                        {isAr ? 'الوزن الحالي' : 'After'}
                      </span>
                      <p className="font-mono text-base font-black text-emerald-700 dark:text-emerald-400">
                        {story.weightAfterKg} kg
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        {isAr ? 'نسبة الدهون' : 'Body Fat'}
                      </span>
                      <p className="font-mono text-xs font-extrabold text-amber-800 dark:text-amber-400">
                        {story.bodyFatBefore} ← {story.bodyFatAfter}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    “{isAr ? story.quoteAr : story.quoteEn}”
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <p className="text-sm font-extrabold text-slate-900">
                  {isAr ? story.nameAr : story.nameEn}
                  {story.age != null ? ` (${story.age} ${isAr ? 'سنة' : 'yrs'})` : ''}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">
                  {isAr ? story.roleAr : story.roleEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. CALORIE CALCULATOR + RECIPES BUILT ON THE USER'S CALORIES */}
      <CalorieAndMealPlanner onOpenFreeTrialHub={onOpenFreeTrialHub} />

      {/* 7. MYTH VS SCIENCE Q&A */}
      <div className="grid grid-cols-1 gap-8">
        {/* "الحقيقة أو الدايت؟" Interactive Accordion */}
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              {isAr ? 'الحقيقة العلمية بدون خرافات' : 'SCIENCE VS. DIET MYTHS'}
            </span>
            <h3 className="mt-1 text-xl font-black text-slate-900">
              {isAr
                ? 'الحقيقة أو الدايت؟ إجابات علمية على أشهر مخاوفك'
                : 'Truth or Diet Myth? Scientific Answers'}
            </h3>
          </div>

          <div className="space-y-2.5">
            {MYTH_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={faq.qEn}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between px-5 py-4 text-start text-xs font-extrabold text-slate-900 sm:text-sm"
                  >
                    <span>{isAr ? faq.qAr : faq.qEn}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 text-xs leading-relaxed text-slate-600"
                      >
                        {isAr ? faq.aAr : faq.aEn}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8. FREE E-BOOK LEAD MAGNET + SAAS WHITE-LABEL CALLOUT FOR GYM OWNERS/COACHES */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Free E-Book Lead Magnet with Real Download & Interactive Reader */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <BookOpen className="h-3.5 w-3.5 text-amber-500" />
              {isAr ? 'هدية مجانية للزوار' : 'FREE TRAINING E-BOOK'}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {isAr ? 'تحميل فوري مباشر' : 'Instant Direct Download'}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
            {isAr
              ? 'حمل مجاناً كتاب "الدليل الشامل لاحتراف التمرين بدون إصابات"'
              : 'Download "The Complete Injury-Free Hypertrophy Guide" For Free'}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
            {isAr
              ? 'دليل عملي استرشادي يشمل المبادئ الحركية لحماية المفاصل، جدول تمارين Push/Pull/Legs، حساب الماكروز، والبدائل الاقتصادية المصرية.'
              : 'Practical reference guide covering joint-friendly exercise form, PPL workout splits, macro calculations, and smart budget food swaps.'}
          </p>

          <form onSubmit={handleSendEbook} className="mt-5 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={ebookEmail}
                onChange={(e) => setEbookEmail(e.target.value)}
                placeholder={isAr ? 'أدخل بريدك الإلكتروني لاستلام الكتاب...' : 'Enter your email for instant access...'}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-bold text-slate-900 shadow-2xs focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-xs font-black text-white shadow-xs transition hover:bg-slate-850 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
              >
                <Download className="h-4 w-4" />
                {ebookBusy
                  ? isAr ? 'جاري تجهيز الملف...' : 'Preparing file...'
                  : isAr ? 'تحميل واستلام الكتاب الآن' : 'Download Free E-Book'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{isAr ? 'يبدأ تنزيل الكتاب فوراً على جهازك بصيغة PDF عربي من اليمين إلى اليسار.' : 'The Arabic RTL PDF starts downloading to your device immediately.'}</span>
            </div>
          </form>
        </motion.div>

        {/* B2B SaaS Direct Sales & Onboarding Callout */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
          className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/5 p-6 shadow-2xs dark:border-amber-500/30 dark:bg-slate-900/90 sm:p-8"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-white px-3.5 py-1 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
              {isAr ? 'لأصحاب الجيمات والمدربين (B2B SaaS White-Label)' : 'FOR GYM OWNERS & ONLINE COACHES'}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-black text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {isAr ? 'متاح للتفعيل الفوري' : 'Live & Ready'}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
            {isAr
              ? 'جاهز لتحويل جيمك إلى منظومة احترافية باسمك وشعارك؟'
              : 'Ready to Launch Your Own Branded Gym Operating System?'}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
            {isAr
              ? 'احصل على لوحة تحكم متكاملة + تطبيق المتدرب PWA + بوابات QR دوارة + كاشير ضريبي + مساعد AI — مفعّلة فوراً عبر إنستاباي أو فودافون كاش مع عزل كامل لبيانات ناديك.'
              : 'Get your full Gym Owner Dashboard, White-Label Member PWA, HMAC QR turnstiles, 14% VAT cashier, and Pro AI Coach — activated immediately via InstaPay or Vodafone Cash.'}
          </p>

          {/* Official WhatsApp Sales Box (01002169889) */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-xs">
                  <MessageSquare className="h-5 w-5 fill-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isAr ? 'تواصل مباشرة مع مبيعات TitanFit وتفعيل الباقات' : 'Direct TitanFit SaaS Sales & Onboarding'}
                  </p>
                  <p className="font-mono text-sm font-black text-slate-900 dark:text-white" dir="ltr">
                    01002169889
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById('saas-pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2.5 text-xs font-black text-slate-950 shadow-xs transition hover:bg-amber-400"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>{isAr ? 'اختر الباقة واشترك' : 'View Plans'}</span>
                </button>
                <a
                  href="https://wa.me/201002169889?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%AA%D9%81%D8%B9%D9%8A%D9%84%20%D9%85%D9%86%D8%B5%D8%A9%20TitanFit%20%D9%84%D9%84%D8%AC%D9%8A%D9%85%20%D8%A7%D9%84%D8%AE%D8%A7%D8%B5%20%D8%A8%D9%8A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-[#20bd5a]"
                >
                  <MessageSquare className="h-4 w-4 fill-white" />
                  <span>{isAr ? 'واتساب المبيعات' : 'Sales WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 9. B2B SAAS SUBSCRIPTION PLANS FOR GYM OWNERS & FITNESS CLUBS */}
      <section id="saas-pricing-section" className="scroll-mt-24">
        <div id="gym-saas-plans" className="relative space-y-8 overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900/95 to-slate-950 p-6 sm:p-10 text-white shadow-2xl">
        <div className="absolute -top-24 -end-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-amber-500/20 pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/15 px-3 py-1 text-xs font-black text-amber-300">
              <Zap className="h-3.5 w-3.5" />
              <span>{isAr ? 'باقات اشتراك أصحاب الجيمات (SaaS)' : 'TitanFit B2B Gym SaaS Plans'}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {isAr
                ? 'اختر باقة إدارة ناديك الرياضي بالجنيه المصري وادفع حسب حجم صالتك'
                : 'Choose the Right Gym Management Plan in EGP'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'نظام سحابي متكامل يجمع بين بوابات الـ QR، الكاشير المصري، إدارة المتدربين والمدربين، وتطبيق PWA متطور — بدون أي عمولات خفية.'
                : 'All-in-one gym operating system: QR turnstiles, Egyptian cashier gateways, trainers CRM, and member PWA app.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => downloadSaaSPricingPdf(isAr)}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/15 px-4 py-2.5 text-xs font-black text-amber-300 hover:bg-amber-500/25 transition shadow-sm"
              title={isAr ? 'تحميل كراسة وعرض باقات TitanFit كملف PDF' : 'Download SaaS Proposal PDF'}
            >
              <Download className="h-4 w-4" />
              <span>{isAr ? '📄 كراسة الباقات الرسمية (PDF)' : '📄 Official Proposal (PDF)'}</span>
            </button>

            <div className="inline-flex items-center rounded-2xl border border-slate-700 bg-slate-800/90 p-1 shrink-0 shadow-lg">
              <button
                type="button"
                onClick={() => setGymSaaSAnnual(false)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  !gymSaaSAnnual
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {isAr ? 'اشتراك شهري' : 'Monthly'}
              </button>
              <button
                type="button"
                onClick={() => setGymSaaSAnnual(true)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  gymSaaSAnnual
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{isAr ? 'اشتراك سنوي' : 'Annual'}</span>
                <span className="ms-2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] text-white">
                  {isAr ? 'وفر 20%' : 'Save 20%'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Tier Cards Comparison */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {saasPlans.map((plan) => {
            const topDisplayPrice = gymSaaSAnnual ? plan.annualTotalEgp : plan.monthlyPriceEgp;
            const isPro = plan.id === 'PRO';
            const isEnterprise = plan.id === 'ENTERPRISE';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all ${
                  isPro
                    ? 'border-2 border-amber-400 bg-slate-900/95 shadow-xl shadow-amber-500/10'
                    : isEnterprise
                      ? 'border border-emerald-500/60 bg-slate-900/90'
                      : 'border border-slate-700/80 bg-slate-900/70'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1 text-[11px] font-black text-slate-950 shadow-md">
                    {isAr ? '⭐ الأكثر طلباً ومبيعاً' : '⭐ Most Popular Choice'}
                  </div>
                )}
                {isEnterprise && (
                  <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-emerald-600 px-3.5 py-1 text-[10px] font-black text-white shadow-md">
                    {isAr ? '👑 المنظومة الشاملة' : '👑 Enterprise Suite'}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {isAr ? plan.nameAr : plan.nameEn}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      {isAr ? plan.taglineAr : plan.taglineEn}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-3xl font-black text-amber-400">
                        {topDisplayPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {gymSaaSAnnual
                          ? isAr
                            ? 'ج.م / سنوياً'
                            : 'EGP / yr'
                          : isAr
                            ? 'ج.م / شهرياً'
                            : 'EGP / mo'}
                      </span>
                    </div>
                    {gymSaaSAnnual ? (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-black text-emerald-400">
                        <span>
                          {isAr
                            ? `💡 يعني هتدفع ${plan.annualMonthlyPriceEgp.toLocaleString()} ج.م فقط في الشهر (وفرت ${(plan.monthlyPriceEgp * 12 - plan.annualTotalEgp).toLocaleString()} ج.م)`
                            : `💡 Only ${plan.annualMonthlyPriceEgp.toLocaleString()} EGP / month (Save ${(plan.monthlyPriceEgp * 12 - plan.annualTotalEgp).toLocaleString()} EGP)`}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-400">
                        {isAr ? 'تجديد شهري مرن بالكامل (30 يوم)' : 'Flexible monthly renewal (30 days)'}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div
                      className={`rounded-xl border p-2 ${
                        plan.aiEnabled
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-rose-500/30 bg-rose-500/5'
                      }`}
                    >
                      <p
                        className={`font-black text-[11px] ${
                          plan.aiEnabled ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {plan.aiEnabled
                          ? isAr
                            ? '✅ مفعل بالكامل'
                            : '✅ Full AI'
                          : isAr
                            ? '🔒 غير مفعل'
                            : '🔒 No AI'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {isAr ? '🤖 الذكاء الاصطناعي' : '🤖 AI Coach'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-2">
                      <p className="font-mono font-black text-amber-300">
                        {plan.maxMembers === 'UNLIMITED' ? '∞' : plan.maxMembers}
                      </p>
                      <p className="text-[10px] text-slate-400">{isAr ? 'مشتركين' : 'Members'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-2">
                      <p className="font-mono font-black text-amber-300">
                        {plan.maxStaff === 'UNLIMITED' ? '∞' : plan.maxStaff}
                      </p>
                      <p className="text-[10px] text-slate-400">{isAr ? 'مدربين' : 'Staff'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {(isAr ? plan.highlightsAr : plan.highlightsEn).map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan(plan)}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black shadow-md transition active:scale-95 ${
                      isPro
                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-[#D4AF37] text-slate-950 hover:brightness-105 shadow-amber-500/20'
                        : isEnterprise
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
                          : 'border border-slate-600 bg-slate-800 text-white hover:bg-slate-750'
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>{isAr ? 'اشترك الآن ودفع فوري (إنستاباي / فودافون)' : 'Subscribe & Instant Pay'}</span>
                  </button>

                  <a
                    href={`https://wa.me/201002169889?text=${encodeURIComponent(
                      `مرحباً، أود الاستفسار عن باقة [${plan.nameAr}] لمنصة TitanFit بسعر [${topDisplayPrice.toLocaleString()} ج.م]`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-[11px] text-slate-400 hover:text-amber-400 transition"
                  >
                    {isAr ? '💬 أو تواصل عبر واتساب للمساعدة (01002169889)' : '💬 Or chat on WhatsApp (01002169889)'}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </section>

      {/* SAAS CHECKOUT & PAYMENT GATEWAY MODAL (INSTAPAY / VODAFONE CASH) */}
      {checkoutPlan && (
        <SaaSPaymentGatewayModal
          isOpen={!!checkoutPlan}
          plan={checkoutPlan}
          billingCycle={gymSaaSAnnual ? 'ANNUAL' : 'MONTHLY'}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={(planId) => {
            setCheckoutPlan(null);
            onSwitchToDashboard();
          }}
        />
      )}

      {/* INTERACTIVE E-BOOK PREVIEW & READER MODAL */}
      <AnimatePresence>
        {showEbookModal && (
          <div
            onClick={() => setShowEbookModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm cursor-pointer"
            role="presentation"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ebook-modal-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-amber-300 bg-white text-slate-900 shadow-2xl cursor-default"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-amber-500/15 via-transparent to-emerald-500/15 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-[#D4AF37] text-slate-950 shadow-md">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      {isAr ? 'تم تجهيز الكتاب وبدء التحميل' : 'Book ready — download started'}
                    </span>
                    <h3 id="ebook-modal-title" className="text-base font-black text-slate-900 sm:text-lg">
                      {isAr ? 'الدليل الشامل لاحتراف التمرين والتغذية بدون إصابات' : 'The Complete Injury-Free Hypertrophy Guide'}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={isAr ? 'إغلاق نافذة الكتاب' : 'Close modal'}
                  onClick={() => setShowEbookModal(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6 text-xs leading-relaxed text-slate-700">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <p className="font-extrabold text-emerald-900">
                    {isAr
                      ? `🎉 مبروك يا بطل! تم تجهيز الكتاب لـ (${sentEbookEmail}) وبدأ تنزيله مباشرة كملف PDF على جهازك.`
                      : `🎉 Congrats! Your e-book for (${sentEbookEmail}) is ready and the PDF download has started.`}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-800">
                    {isAr
                      ? 'الملف PDF عربي من اليمين إلى اليسار. إن لم يبدأ التنزيل اضغط زر "تنزيل الكتاب مرة أخرى" بالأسفل.'
                      : 'The file is an Arabic right-to-left PDF. If the download did not start, press the re-download button below.'}
                  </p>
                </div>

                {/* Chapters Index */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="font-black text-slate-900">
                      {isAr ? '📘 الفصل الأول: المبادئ الذهبية لحماية المفاصل (Joint Protection)' : 'Chapter 1: Joint Protection Biomechanics'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      تثبيت لوحي الكتف (Scapular Retraction)، زاوية 45 درجة للكوع بدلاً من 90°، ومرحلة النزول البطيء (Eccentric Tempo) لمدة 3 ثوانٍ.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="font-black text-slate-900">
                      {isAr ? '💪 الفصل الثاني: جدول تمارين Push / Pull / Legs مع تدرج الأحمال' : 'Chapter 2: Weekly Push/Pull/Legs Hypertrophy'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      تقسيم الـ 4 أيام وتمارين الصدر والظهر والأرجل مع آلية زيادة الأوزان والتكرارات التدريجية (Progressive Overload).
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="font-black text-slate-900">
                      {isAr ? '🥗 الفصل الثالث: حساب الماكروز والسعرات بالجرامات وتوزيع الوجبات' : 'Chapter 3: Daily Macro Targets & Meal Timing'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      احتياج البروتين (1.8 - 2.2 جم لكل كجم وزن)، الدهون الصحية، الكاربوهيدرات النظيفة، وشرب 3.5 لتر ماء يومياً.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="font-black text-slate-900">
                      {isAr ? '🇪🇬 الفصل الرابع: البدائل الاقتصادية المصرية لمصادر البروتين' : 'Chapter 4: Egyptian Economic Protein Swaps'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      الجبن القريش، البيض البلدي، التونة، كبدة الدجاج، والسمك البلطي المشوي كبدائل بروتينية عالية القيمة بسعر موفر.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={redownloadEbook}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 shadow-sm"
                  >
                    <span>🖨️</span>
                    {isAr ? 'حفظ / طباعة كـ PDF (RTL)' : 'Print / Save as PDF (RTL)'}
                  </button>
                  <button
                    type="button"
                    onClick={redownloadEbook}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4" />
                    {isAr ? 'تحميل ملف PDF' : 'Download PDF'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/201002169889?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%82%D8%B1%D8%A3%D8%AA%20%D9%83%D8%AA%D8%A7%D8%A8%20%D8%A7%D9%84%D8%AA%D9%85%D8%B1%D9%8A%D9%86%20%D8%A7%D9%84%D9%85%D8%AC%D8%A7%D9%86%D9%8A%20%D9%88%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D9%85%D9%86%D8%B5%D8%A9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-black text-white hover:bg-[#20bd5a]"
                  >
                    <MessageSquare className="h-4 w-4 fill-white" />
                    {isAr ? 'تواصل واتساب (01002169889)' : 'WhatsApp (01002169889)'}
                  </a>
                  <button
                    type="button"
                    aria-label={isAr ? 'إغلاق نافذة الكتاب' : 'Close modal'}
                    onClick={() => setShowEbookModal(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    {isAr ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
