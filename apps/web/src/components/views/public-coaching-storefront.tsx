'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Award,
  BookOpen,
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
  MessageCircle,
  MessageSquare,
  Play,
  ShieldCheck,
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
import { usePlatformStore } from '../../lib/platform-store';
import { downloadEbookPdf } from '../../lib/pdf-docs';
import { CalorieAndMealPlanner } from './calorie-and-meal-planner';

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
  const { locale, showToast } = usePlatformStore();
  const isAr = locale === 'ar';

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
    <div data-testid="panel-public-storefront" className="mx-auto max-w-7xl space-y-16 bg-white pb-20 text-slate-900">
      {/* 1. PURE WHITE LUXURY HERO SECTION — DIET & CHEAT HIGH-CONVERSION STYLE */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0E131F] sm:p-12"
      >
        <div className="pointer-events-none absolute -top-40 start-1/2 -translate-x-1/2 h-80 w-full max-w-4xl rounded-full bg-amber-500/10 blur-3xl" />
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
                  ? 'أفضل وقت للبداية كان من سنة.. وتاني أفضل وقت هو الآن!'
                  : 'THE BEST TIME TO START WAS A YEAR AGO — THE SECOND BEST TIME IS NOW!'}
              </span>
            </motion.div>

            <h1 className="text-3xl font-black leading-[1.22] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              {isAr ? (
                <>
                  إنسى نظام الدايت الممل..{' '}
                  <span className="text-amber-700 dark:text-amber-400">
                    وابنِ لنفسك نمط حياة صحي
                  </span>{' '}
                  وجسم مثالي بدون حرمان!
                </>
              ) : (
                <>
                  Forget Boring Diets —{' '}
                  <span className="text-amber-700 dark:text-amber-400">
                    Build Your Sustainable Physique
                  </span>{' '}
                  With Balanced Nutrition & Structured Training
                </>
              )}
            </h1>

            <p className="max-w-2xl text-sm font-normal leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              {isAr
                ? `منصة تفاعلية تساعدك على تخطيط نظامك الغذائي وحساب سعراتك وماكروزك اليومية بدقة، مع مكتبة وصفات مصورة وتمارين مشروحة بالفيديو والرسوم المتحركة من الجيم أو البيت خطوة بخطوة.`
                : `An interactive platform to plan your nutrition, calculate your daily calories and macros, and follow illustrated meal recipes and step-by-step video & animated workouts.`}
            </p>

            {/* Primary CTA Buttons including the FREE TRIAL WORKOUTS & DIETS Button */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <a
                href="#free-calorie-calculator"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 py-3.5 text-sm font-black text-white shadow-md shadow-slate-950/10 transition hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
              >
                <Calculator className="h-4 w-4 text-amber-400 dark:text-slate-950" />
                <span>{isAr ? 'احسب سعراتك وابدأ الآن' : 'Calculate Your Calories'}</span>
              </a>

              {onOpenFreeTrialHub && (
                <button
                  type="button"
                  data-testid="open-free-trial-hub-btn"
                  onClick={onOpenFreeTrialHub}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                >
                  <Gift className="h-4 w-4 text-amber-500" />
                  <span>{isAr ? 'جرب مجاناً (تمارين فيديو + أنظمة)' : 'Try Free Workouts & Meal Plans'}</span>
                </button>
              )}

              <a
                href="#recipes-section"
                className="inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-600 transition hover:text-amber-600 sm:ps-2"
              >
                <Utensils className="h-4 w-4 text-amber-500" />
                <span>{isAr ? 'وصفات مبنية على سعراتك ←' : 'Recipes built on your calories →'}</span>
              </a>
            </div>

            {/* Trust Metrics - Only renders verified, non-placeholder metrics */}
            {(() => {
              const metrics: Array<{ val: string; ar: string; en: string }> = [];
              const rawCount = PLATFORM_CONFIG.claims.activeMembersCount?.trim();
              if (rawCount && !rawCount.startsWith('[')) {
                metrics.push({
                  val: rawCount,
                  ar: 'قصة نجاح وتحول حقيقي',
                  en: 'Verified Transformations',
                });
              }
              const rawMed = PLATFORM_CONFIG.claims.medicalSupervisionPercent?.trim();
              if (rawMed && !rawMed.startsWith('[')) {
                metrics.push({
                  val: rawMed,
                  ar: 'تحت إشراف طبي ورياضي',
                  en: 'Medical & PT Supervised',
                });
              }
              metrics.push({
                val: '24/7',
                ar: 'متابعة يومية بالواتساب',
                en: 'Daily 1-on-1 WhatsApp Support',
              });

              return (
                <div
                  data-testid="hero-trust-metrics"
                  className={`grid grid-cols-${metrics.length === 1 ? '1' : metrics.length === 2 ? '2' : '3'} gap-3 border-t border-slate-100 pt-6 sm:gap-6 dark:border-slate-800`}
                >
                  {metrics.map((m, idx) => (
                    <div
                      key={m.en}
                      className={idx > 0 ? 'border-s border-slate-100 ps-3 sm:ps-6 dark:border-slate-800' : ''}
                    >
                      <p className="font-mono text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                        {m.val}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {isAr ? m.ar : m.en}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Left Visual Column — White Card with Real Fitness Photo + Before/After Transformation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex flex-col justify-end p-5">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.22),transparent_70%)]" />
                <div className="absolute top-4 end-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Trophy className="h-6 w-6 text-amber-400" />
                </div>
                <span className="relative z-10 w-fit rounded-full bg-emerald-700 px-3.5 py-1 text-xs font-extrabold text-white shadow">
                  {isAr ? '🔥 مثال توضيحي لرحلة تحوّل متدرب' : '🔥 Illustrative Transformation Example'}
                </span>
                <div className="relative z-10 mt-3 flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm font-black">
                      {isAr ? 'نموذج محاكاة رقمي (مثال توضيحي)' : 'Simulated Macro Case Model'}
                    </p>
                    <p className="text-[11px] text-amber-300">
                      {isAr ? 'محاكاة علمية لنحت القوام وخسارة دهون (ليس عميلاً حقيقياً)' : 'Scientific recomp projection (Illustrative - not a real client)'}
                    </p>
                  </div>
                  <div className="flex gap-0.5 text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950">
                  <div className="border-e border-slate-200 pe-2 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {isAr ? 'قبل الاشتراك' : 'Before'}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-black text-rose-600">92 kg</p>
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {isAr ? 'نسبة الدهون: 24% (22.1 كجم دهون)' : 'Body Fat: 24% (22.1 kg fat)'}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {isAr ? 'الكتلة الخالية من الدهون: 69.9 كجم' : 'Lean Mass: 69.9 kg'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                      {isAr ? 'بعد ١٢ أسبوع' : 'After 12 Wks'}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-black text-emerald-700 dark:text-emerald-400">83 kg</p>
                    <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                      {isAr ? 'نسبة الدهون: 16.5% • فرق الوزن: -9 كجم' : 'Body Fat: 16.5% • Weight Change: -9 kg'}
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {isAr ? 'الدهون: 13.7 كجم (-8.4 كجم) • الكتلة الصافية: 69.3 كجم' : 'Fat: 13.7 kg (-8.4 kg) • Lean Mass: 69.3 kg'}
                    </p>
                  </div>
                </div>

                <blockquote className="mt-4 text-xs leading-relaxed font-semibold text-slate-700 dark:text-slate-300">
                  {isAr
                    ? '“مثال توضيحي بالأرقام: نزول واقعي بمعدل ٩ كجم في ١٢ أسبوعاً (منها ٨.٤ كجم دهون صافية: من ٢٢.١ كجم إلى ١٣.٧ كجم) مع الحفاظ على الكتلة الخالية من الدهون (٦٩.٩ كجم ← ٦٩.٣ كجم) عبر عجز سعرات معتدل وتدرج الأحمال.”'
                    : '“Illustrative calculation: realistic 9 kg loss over 12 weeks (8.4 kg fat loss: 22.1 kg → 13.7 kg) while preserving lean mass (69.9 kg → 69.3 kg) through a moderate calorie deficit and progressive overload.”'}
                </blockquote>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. FREE WORKOUT & DIET TRIAL CALLOUT BANNER FOR NEW VISITORS */}
      {onOpenFreeTrialHub && (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/60 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xs dark:bg-amber-500 dark:text-slate-950">
                <Video className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="inline-block rounded-full border border-slate-200 bg-white px-3 py-0.5 text-[11px] font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  {isAr ? 'تجربة مجانية لزوار الموقع' : 'FREE ACCESS FOR VISITORS'}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                  {isAr
                    ? 'داخل تجرب الأول؟ افتح مكتبة التمارين بالفيديو والأنظمة الغذائية المجانية!'
                    : 'Want to Try First? Open Our Free Video Workouts & Meal Plans Hub!'}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                  {isAr
                    ? 'شاهد فيديوهات التمارين مع إرشادات الأداء الحركي السليم، شغل تايمر التمرين التفاعلي، وحمل ٣ أنظمة غذائية كاملة بالجرامات والبدائل الاقتصادية مجاناً.'
                    : 'Watch HD exercise demos with proper form cues, use our interactive set & rest timer, and grab 3 complete meal plans for free.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenFreeTrialHub}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-7 py-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-850 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
            >
              <Play className="h-4 w-4 fill-current" />
              {isAr
                ? 'افتح التمارين والأنظمة المجانية الآن ←'
                : 'Open Free Workouts & Diets Now →'}
            </button>
          </div>
        </motion.section>
      )}

      {/* 3. HOW IT WORKS IN 4 STEPS — "إنت مش لوحدك" */}
      <section className="space-y-8">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
            {isAr ? 'رحلتك معانا خطوة بخطوة' : 'HOW YOUR TRANSFORMATION WORKS'}
          </span>
          <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
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
              color: 'text-amber-600 bg-amber-50 border-amber-200',
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
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
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
              color: 'text-sky-600 bg-sky-50 border-sky-200',
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
              color: 'text-purple-600 bg-purple-50 border-purple-200',
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
                whileHover={{ y: -5 }}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl border p-3 ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-200">{item.step}</span>
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
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
          <a
            href="#free-calorie-calculator"
            className="text-xs font-extrabold text-amber-800 dark:text-amber-400 hover:underline"
          >
            {isAr ? 'ابدأ قصتك بحساب سعراتك ←' : 'Start your story — calculate your calories →'}
          </a>
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

        {/* B2B SaaS Callout: For Gym Owners & Coaches with Direct WhatsApp */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/60 sm:p-8"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
              {isAr ? 'لأصحاب الجيمات والمدربين (B2B SaaS White-Label)' : 'FOR GYM OWNERS & ONLINE COACHES'}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              {isAr ? 'قريباً / نسخة تجريبية' : 'Coming Soon / Demo Preview'}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
            {isAr
              ? 'هل أنت صاحب جيم أو مدرب أونلاين؟ استكشف النسخة التجريبية لمنصتك الخاصة!'
              : 'Own a Gym or Coaching Brand? Explore the White-Label SaaS Demo Preview'}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
            {isAr
              ? 'نموذج تجريبي استعراضي لنظام الهوية البصرية (White-Label) يشمل واجهة المتدربين، تطبيق العضو، محاكاة بوابات الـ QR، والربط المزمع مع فوري وإنستاباي و Paymob (قريباً / نسخة تجريبية).'
              : 'Interactive demo preview of the white-label ecosystem: member PWA, simulated QR turnstiles, and planned Egypt payment gateway integrations (Coming Soon / Demo).'}
          </p>

          {/* WhatsApp Waitlist Highlight Box */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-xs">
                  <MessageSquare className="h-5 w-5 fill-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isAr ? 'سجّل اهتمامك للانضمام لقائمة الانتظار (نسخة تجريبية)' : 'Register Interest to Join the Waitlist (Demo)'}
                  </p>
                  <p className="font-mono text-sm font-black text-slate-900 dark:text-white dir-ltr">
                    +20 155 994 9271
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/201559949271?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D9%86%D8%B6%D9%85%D8%A7%D9%85%20%D9%84%D9%82%D8%A7%D8%A6%D9%85%D8%A9%20%D8%A7%D9%86%D8%AA%D8%B8%D8%A7%D8%B1%20%D9%85%D9%86%D8%B5%D8%A9%20TitanFit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-[#20bd5a]"
              >
                <MessageSquare className="h-4 w-4 fill-white" />
                <span>{isAr ? 'قائمة انتظار' : 'Join Waitlist'}</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

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
                    href="https://wa.me/201559949271?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%82%D8%B1%D8%A3%D8%AA%20%D9%83%D8%AA%D8%A7%D8%A8%20%D8%A7%D9%84%D8%AA%D9%85%D8%B1%D9%8A%D9%86%20%D8%A7%D9%84%D9%85%D8%AC%D8%A7%D9%86%D9%8A%20%D9%88%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D9%86%D8%B6%D9%85%D8%A7%D9%85%20%D9%84%D9%82%D8%A7%D8%A6%D9%85%D8%A9%20%D8%A7%D9%84%D8%A7%D9%86%D8%AA%D8%B8%D8%A7%D9%85"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-black text-white hover:bg-[#20bd5a]"
                  >
                    <MessageSquare className="h-4 w-4 fill-white" />
                    {isAr ? 'قائمة انتظار (واتساب)' : 'Join Waitlist (WhatsApp)'}
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
