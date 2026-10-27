'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Dumbbell,
  Flame,
  Gift,
  HeartPulse,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Utensils,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { usePlatformStore } from '../../lib/platform-store';

interface CoachingTier {
  id: string;
  badgeAr: string;
  badgeEn: string;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  subtitleEn: string;
  oldPriceEgp: number;
  priceEgp: number;
  durationAr: string;
  durationEn: string;
  accentColor: string;
  popular?: boolean;
  spotsLeft: number;
  featuresAr: string[];
  featuresEn: string[];
}

const COACHING_TIERS: CoachingTier[] = [
  {
    id: 'tier-medfit',
    badgeAr: 'بداية ذكية',
    badgeEn: 'SMART START',
    nameAr: 'برنامج فيت كور (Fit Core)',
    nameEn: 'Fit Core Program',
    subtitleAr: 'مناسب للمبتدئين لبناء عادات صحية مستدامة',
    subtitleEn: 'Ideal for beginners building sustainable habits',
    oldPriceEgp: 3200,
    priceEgp: 1650,
    durationAr: '٣ شهور',
    durationEn: '3 Months',
    accentColor: '#10B981',
    spotsLeft: 14,
    featuresAr: [
      'خطة غذائية مخصصة لهدفك وإمكانياتك تتغير كل 15 يوم',
      'خطة تدريبية (من الجيم أو البيت) تحت إشراف دكتور علاج طبيعي كل 45 يوم',
      'متابعة والرد على استفساراتك على واتساب خلال 24–48 ساعة',
      'دخول مجاني لتطبيق المتدرب وتسجيل الأوزان والقياسات',
    ],
    featuresEn: [
      'Tailored nutrition plan updated every 15 days',
      'Gym or home workout program supervised by a physical therapist',
      'WhatsApp follow-up within 24–48 hours',
      'Full access to the Member PWA tracker',
    ],
  },
  {
    id: 'tier-prime',
    badgeAr: 'جديد • عدد محدود',
    badgeEn: 'NEW • LIMITED SPOTS',
    nameAr: 'الباقة الذكية (Smart PRIME)',
    nameEn: 'Smart PRIME Package',
    subtitleAr: 'توازن مثالي بين التغذية والتمرين واللقاءات التفاعلية',
    subtitleEn: 'Complete nutrition, training & live group coaching',
    oldPriceEgp: 4800,
    priceEgp: 2450,
    durationAr: '٣ شهور',
    durationEn: '3 Months',
    accentColor: '#3B82F6',
    spotsLeft: 9,
    featuresAr: [
      'خطة غذائية مرنة بوصفات مصورة فيديو تتغير كل 30 يوم',
      'خطة تدريبية مفصلة بالفيديو لتصحيح الأداء وتجنب الإصابات',
      'لقاء لايف 3 ساعات كل 10 أيام (Triple Care Meeting) لمناقشة التحديات',
      'نظام مقترح للمكملات الغذائية وكتب إلكترونية حصرية',
      'اشتراك مجاني على تطبيق المنصة + دخول فرع النادي',
    ],
    featuresEn: [
      'Flexible meal plan with video recipes updated every 30 days',
      'Video-guided training plan with form correction',
      '3-hour Live Triple Care Meeting every 10 days',
      'Supplement protocol & exclusive fitness e-books',
      'Full app subscription & club branch access',
    ],
  },
  {
    id: 'tier-elite',
    badgeAr: 'الأكثر طلباً • أفضل قيمة',
    badgeEn: 'MOST POPULAR • BEST VALUE',
    nameAr: 'باقة تيتان إيليت (Titan Elite)',
    nameEn: 'Titan Elite Pro',
    subtitleAr: 'متابعة يومية ورعاية طبية ورياضية شاملة للوصول لأسرع نتيجة',
    subtitleEn: 'Daily WhatsApp coaching, medical supervision & Zoom calls',
    oldPriceEgp: 7500,
    priceEgp: 4200,
    durationAr: '٣ شهور',
    durationEn: '3 Months',
    accentColor: '#D4AF37',
    popular: true,
    spotsLeft: 5,
    featuresAr: [
      'كل مزايا باقة Smart PRIME بالكامل',
      'متابعة يومية على واتساب وأولوية قصوى في الرد',
      '4 اجتماعات زوم (Zoom) شهرياً مع الكوتش المتخصص',
      'رعاية طبية شاملة ومراجعة التحاليل من فريق أطباء متخصصين',
      'تغيير النظام الغذائي كل 10 أيام حسب استجابة جسمك',
      'دخول VIP لجميع فروع النادي والبوابات الذكية',
    ],
    featuresEn: [
      'Everything in Smart PRIME included',
      'Daily priority WhatsApp follow-up with your coach',
      '4 monthly 1-on-1 Zoom check-in calls',
      'Comprehensive medical & lab work supervision',
      'Diet plan adjusted every 10 days based on bio-feedback',
      'All-branch VIP gym access & smart turnstile pass',
    ],
  },
  {
    id: 'tier-golden-max',
    badgeAr: 'للمميزين فقط VIP',
    badgeEn: 'VIP EXCLUSIVE',
    nameAr: 'الباقة الذهبية ماكس (Golden MAX)',
    nameEn: 'Golden Elite MAX',
    subtitleAr: 'متابعة شخصية مباشرة مع كبير المدربين والطبيب المختص يومياً',
    subtitleEn: 'Direct 1-on-1 coaching with the Head Coach & Chief Physician',
    oldPriceEgp: 14000,
    priceEgp: 8500,
    durationAr: '٣ شهور',
    durationEn: '3 Months',
    accentColor: '#b8860b',
    spotsLeft: 2,
    featuresAr: [
      'متابعة شخصية مباشرة 1-on-1 مع مؤسس المنصة وكبير المدربين',
      'مكالمات تليفونية مباشرة وزوم أسبوعي لمراجعة أدق التفاصيل',
      'تعديل لحظي للوجبات والتمارين حسب جدول يومك وسفرك',
      'تصحيح الأداء الحركي بالفيديو لكل تمرينة لتفادي أي إصابات',
      'كارت خصم الشركاء 40% لك ولـ 5 من أصدقائك شهرياً',
    ],
    featuresEn: [
      'Direct 1-on-1 supervision by the Founder & Head Coach',
      'Direct phone calls & weekly private Zoom strategy sessions',
      'On-demand meal & travel workout adjustments',
      'Frame-by-frame video form analysis for every workout',
      'VIP Partner Card with 40% discount for you and 5 friends',
    ],
  },
];

const TRANSFORMATIONS = [
  {
    id: 'tr-1',
    nameAr: 'م. أحمد عبد اللطيف (٣٢ سنة)',
    nameEn: 'Eng. Ahmed Abdellatif (32 yrs)',
    roleAr: 'مهندس برمجيات — التجمع الخامس',
    roleEn: 'Software Engineer — New Cairo',
    durationAr: '١٢ أسبوع',
    durationEn: '12 Weeks',
    beforeWeight: '108 kg',
    afterWeight: '84 kg',
    bodyFatDrop: '29% ← 12%',
    resultBadgeAr: '-24 كجم دهون + بناء عضل صافي',
    resultBadgeEn: '-24 kg Fat Loss + Lean Muscle',
    quoteAr:
      'كنت فاكر إن الدايت يعني حرمان وجوع طول اليوم، لكن مع وصفات الأكل المحسوبة والمتابعة اليومية خسيت ٢٤ كيلو من غير ترهلات وبأكل كل الأكل اللي بحبه!',
    quoteEn:
      'I thought dieting meant starving, but with macro-balanced recipes and daily WhatsApp coaching I dropped 24kg with zero loose skin!',
  },
  {
    id: 'tr-2',
    nameAr: 'د. سارة المنياوي (٢٨ سنة)',
    nameEn: 'Dr. Sara El-Miniawy (28 yrs)',
    roleAr: 'طبيبة أسنان — الشيخ زايد',
    roleEn: 'Dentist — Sheikh Zayed',
    durationAr: '١٠ أسابيع',
    durationEn: '10 Weeks',
    beforeWeight: '79 kg',
    afterWeight: '63 kg',
    bodyFatDrop: '31% ← 18%',
    resultBadgeAr: '-16 كجم وتنسيق قوام كامل',
    resultBadgeEn: '-16 kg & Complete Body Recomp',
    quoteAr:
      'جدول شغلي في العيادة كان مستحيل يخليني ألتزم، بس خطة الوجبات السريعة (٢٠ دقيقة) وتمارين الـ ٤٥ دقيقة غيرت حياتي وثقتي بنفسي ١٨٠ درجة.',
    quoteEn:
      'My clinic schedule was hectic, but the 20-minute recipes and structured 45-minute workouts completely transformed my energy and physique.',
  },
  {
    id: 'tr-3',
    nameAr: 'كابتن كريم فؤاد (٢٥ سنة)',
    nameEn: 'Karim Fouad (25 yrs)',
    roleAr: 'رائد أعمال — المعادي',
    roleEn: 'Entrepreneur — Maadi',
    durationAr: '١٦ أسبوع',
    durationEn: '16 Weeks',
    beforeWeight: '66 kg',
    afterWeight: '77 kg',
    bodyFatDrop: '16% ← 10%',
    resultBadgeAr: '+11 كجم كتلة عضلية صافية',
    resultBadgeEn: '+11 kg Pure Muscular Hypertrophy',
    quoteAr:
      'تحت إشراف دكتور العلاج الطبيعي والكوتش، اتعلمت أتمرن صح بدون إصابات كتف، وكسرت أرقامي القياسية في السكوات والبنش بريس.',
    quoteEn:
      'With physical therapy supervision and progressive overload tracking, I gained 11kg of lean mass pain-free.',
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

const HEALTHY_RECIPES = [
  {
    id: 'rcp-1',
    titleAr: 'راب الدجاج المشوي بصوص الزبادي اليوناني',
    titleEn: 'Grilled Chicken Greek Yogurt Tortilla Wrap',
    prepAr: '٢٠ دقيقة',
    prepEn: '20 Mins',
    kcal: 420,
    proteinG: 46,
    carbsG: 38,
    fatsG: 9,
    tagAr: 'وجبة الغداء السريعة',
    tagEn: 'Fast High-Protein Lunch',
  },
  {
    id: 'rcp-2',
    titleAr: 'توست فرنسي بالواي بروتين والقرفة والتوت',
    titleEn: 'Cinnamon Whey Protein French Toast',
    prepAr: '١٠ دقائق',
    prepEn: '10 Mins',
    kcal: 340,
    proteinG: 34,
    carbsG: 36,
    fatsG: 6,
    tagAr: 'فطار صحي لذيذ',
    tagEn: 'Sweet Craving Breakfast',
  },
  {
    id: 'rcp-3',
    titleAr: 'أفضل كبد دجاج مشوي بدبس الرمان الصحي',
    titleEn: 'Glazed Pomegranate Chicken Livers Skillet',
    prepAr: '٢٥ دقيقة',
    prepEn: '25 Mins',
    kcal: 380,
    proteinG: 48,
    carbsG: 18,
    fatsG: 12,
    tagAr: 'غني بالحديد والبروتين',
    tagEn: 'Iron & Protein Powerhouse',
  },
];

export function PublicCoachingStorefrontView({
  onSwitchToDashboard,
  onSwitchToMemberApp,
  onSwitchToSaaSPricing,
}: {
  onSwitchToDashboard: () => void;
  onSwitchToMemberApp: () => void;
  onSwitchToSaaSPricing: () => void;
}) {
  const { locale, showToast, createInvoicePayment, members, plans } = usePlatformStore();
  const isAr = locale === 'ar';

  // Free Calorie & Macro Calculator State
  const [calcGender, setCalcGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [calcAge, setCalcAge] = useState(27);
  const [calcWeight, setCalcWeight] = useState(86);
  const [calcHeight, setCalcHeight] = useState(176);
  const [calcActivity, setCalcActivity] = useState(1.55);
  const [calcGoal, setCalcGoal] = useState<'CUT' | 'MAINTAIN' | 'BULK'>('CUT');

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Selected Tier for Instant Subscription Modal
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<CoachingTier | null>(null);
  const [subscriberName, setSubscriberName] = useState('');
  const [subscriberPhone, setSubscriberPhone] = useState('+2010');
  const [subscriberGoal, setSubscriberGoal] = useState('تنشيف وخسارة دهون مع بناء عضل');
  const [selectedGateway, setSelectedGateway] = useState<'INSTAPAY' | 'PAYMOB_CARD' | 'VODAFONE_CASH' | 'FAWRY'>('INSTAPAY');
  const [ebookEmail, setEbookEmail] = useState('');

  // Mifflin-St Jeor Equation
  const bmr =
    calcGender === 'MALE'
      ? 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge + 5
      : 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge - 161;
  const tdee = Math.round(bmr * calcActivity);
  const targetCalories =
    calcGoal === 'CUT' ? tdee - 500 : calcGoal === 'BULK' ? tdee + 350 : tdee;
  const targetProteinG = Math.round(calcWeight * 2.1);
  const targetFatsG = Math.round((targetCalories * 0.25) / 9);
  const targetCarbsG = Math.max(
    50,
    Math.round((targetCalories - targetProteinG * 4 - targetFatsG * 9) / 4),
  );
  const targetWaterLiters = Math.round(calcWeight * 0.04 * 10) / 10;

  const handleCompleteSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTierForCheckout) return;
    createInvoicePayment({
      memberId: members[0]?.id ?? 'mem-1001',
      planId: plans[0]?.id ?? 'plan-annual-vip',
      method: selectedGateway,
      couponCode: 'RAMADAN20',
    });
    showToast(
      isAr
        ? `🎉 مبروك يا ${subscriberName || 'بطل'}! تم تأكيد اشتراكك في "${selectedTierForCheckout.nameAr}" وتفعيل حسابك في تطبيق المتدرب!`
        : `🎉 Welcome ${subscriberName || 'Athlete'}! Your "${selectedTierForCheckout.nameEn}" subscription is active!`,
    );
    setSelectedTierForCheckout(null);
  };

  return (
    <div data-testid="panel-public-storefront" className="space-y-16 pb-16">
      {/* 1. HERO SECTION — DIET & CHEAT / TITANFIT HIGH-CONVERSION STYLE */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-white via-amber-50/50 to-emerald-50/40 p-8 shadow-xl dark:border-[#D4AF37]/30 dark:from-[#121624] dark:via-[#171C2E] dark:to-[#1E1910] sm:p-12"
      >
        <div className="pointer-events-none absolute -top-24 -end-24 h-80 w-80 rounded-full bg-[#D4AF37]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -start-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-500/15 px-4 py-1.5 text-xs font-extrabold text-amber-900 dark:border-[#D4AF37]/40 dark:text-[#F3E5AB]"
            >
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-[#D4AF37]" />
              {isAr
                ? 'أفضل وقت للبداية كان من سنة.. وتاني أفضل وقت هو الآن!'
                : 'THE BEST TIME TO START WAS A YEAR AGO — THE SECOND BEST TIME IS NOW!'}
            </motion.div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {isAr ? (
                <>
                  إنسى نظام الدايت الممل..{' '}
                  <span className="bg-gradient-to-r from-amber-600 via-[#D4AF37] to-emerald-600 bg-clip-text text-transparent">
                    وإبني لنفسك نمط حياة صحي
                  </span>{' '}
                  وجسم مثالي بدون حرمان!
                </>
              ) : (
                <>
                  Forget Boring Diets —{' '}
                  <span className="bg-gradient-to-r from-amber-600 via-[#D4AF37] to-emerald-600 bg-clip-text text-transparent">
                    Build Your Dream Physique
                  </span>{' '}
                  With Science & Medical Supervision
                </>
              )}
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {isAr
                ? 'أكثر من +12,500 مشترك غيروا حياتهم بالكامل ووصلوا لشكل جسمهم المثالي من خلال خطط تغذية بوصفات مصورة، برامج تدريبية من الجيم أو البيت تحت إشراف أطباء علاج طبيعي، ومتابعة يومية خطوة بخطوة.'
                : 'Over 12,500+ members transformed their bodies and lives through tailored video-recipe nutrition, physical-therapist-supervised training, and daily 1-on-1 WhatsApp & app coaching.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#coaching-packages"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-500 px-7 py-4 text-sm font-black text-slate-950 shadow-lg shadow-[#D4AF37]/30 transition hover:scale-[1.02]"
              >
                <Zap className="h-4 w-4" />
                {isAr ? 'اشترك الآن وابدأ التغيير' : 'Subscribe & Start Now'}
              </a>

              <a
                href="#free-calorie-calculator"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-900/15 bg-white/90 px-6 py-4 text-sm font-extrabold text-slate-900 shadow-sm transition hover:border-[#D4AF37] dark:border-white/20 dark:bg-white/10 dark:text-white"
              >
                <Calculator className="h-4 w-4 text-amber-600 dark:text-[#D4AF37]" />
                {isAr ? 'احسب سعراتك مجاناً' : 'Free Calorie Calculator'}
              </a>

              <button
                type="button"
                onClick={onSwitchToMemberApp}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-xs font-extrabold text-emerald-800 dark:text-emerald-300"
              >
                {isAr ? 'دخول تطبيق المشتركين ←' : 'Open Member App →'}
              </button>
            </div>

            {/* Trust Stats Bar */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-200/80 pt-6 dark:border-slate-800">
              <div>
                <p className="text-2xl font-black text-amber-600 dark:text-[#D4AF37]">+12,500</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {isAr ? 'قصة نجاح وتحول حقيقي' : 'Verified Transformations'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {isAr ? 'تحت إشراف طبي ورياضي' : 'Medical & PT Supervised'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-sky-600 dark:text-sky-400">24/7</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {isAr ? 'متابعة واتساب وتطبيق ذكي' : 'WhatsApp & App Support'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Hero Card — Interactive Transformation Spotlight */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#151A2A]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                  {isAr ? '🔥 نتيجة الأسبوع الموثقة' : '🔥 FEATURED TRANSFORMATION'}
                </span>
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-[#D4AF37]">
                  12 WEEKS
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{isAr ? 'قبل الاشتراك' : 'Before'}</p>
                    <p className="font-mono text-2xl font-black text-rose-400">108 kg</p>
                    <p className="text-[11px] text-slate-400">Body Fat: 29%</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37] font-black text-slate-950">
                    -24kg
                  </div>
                  <div className="text-end">
                    <p className="text-xs text-slate-400">{isAr ? 'بعد ١٢ أسبوع' : 'After 12 Wks'}</p>
                    <p className="font-mono text-2xl font-black text-emerald-400">84 kg</p>
                    <p className="text-[11px] text-emerald-300">Body Fat: 12%</p>
                  </div>
                </div>
              </div>

              <blockquote className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                &ldquo;
                {isAr
                  ? 'خسيت ٢٤ كيلو دهون وزدت كتلة عضلية من غير ما أحرم نفسي من الأكل اللي بحبه، والكوتش والدكتور كانوا معايا يوم بيوم على الواتساب!'
                  : 'Lost 24kg of fat while eating delicious macro-friendly meals with daily doctor & coach check-ins!'}
                &rdquo;
              </blockquote>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {isAr ? 'م. أحمد عبد اللطيف' : 'Eng. Ahmed Abdellatif'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isAr ? 'مشترك باقة تيتان إيليت' : 'Titan Elite Subscriber'}
                  </p>
                </div>
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. 4-STEP HOW IT WORKS ("اشترك بخطوات بسيطة") */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-extrabold text-amber-700 dark:text-[#D4AF37]">
            {isAr ? 'رحلتك معنا خطوة بخطوة' : 'HOW YOUR TRANSFORMATION WORKS'}
          </span>
          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            {isAr ? 'اشترك بخطوات بسيطة.. وإنت مش لوحدك!' : 'Start in 4 Simple Steps — You Are Never Alone'}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: '01',
              titleAr: '١. إشترك بسهولة',
              titleEn: '1. Choose & Subscribe',
              descAr:
                'اختر البرنامج المناسب لك وادفع بأمان من أي مكان (إنستاباي، فوري، فودافون كاش، أو بطاقة بنكية).',
              descEn:
                'Pick your coaching package and pay securely via InstaPay, Fawry, Vodafone Cash, or Card.',
              icon: CreditCard,
            },
            {
              step: '02',
              titleAr: '٢. تاريخك الصحي والرياضي',
              titleEn: '2. Deep-Dive Assessment',
              descAr:
                'ندرس تاريخك مع الأكل والرياضة والتحاليل والإصابات عشان خطتك تتفصل فعلاً على مقاس حياتك وهدفك.',
              descEn:
                'We analyze your nutrition history, lifestyle, lab tests, and injuries to tailor every detail.',
              icon: HeartPulse,
            },
            {
              step: '03',
              titleAr: '٣. الجزء السحري (استلام خطتك)',
              titleEn: '3. The Magic Blueprint',
              descAr:
                'استلم برنامجك الشامل من دايت بوصفات مصورة وتمرين (جيم أو بيت) ومكملات بعد عرضه على طبيب مختص.',
              descEn:
                'Receive your custom meal plan, video workouts, and supplement guide reviewed by a physician.',
              icon: Sparkles,
            },
            {
              step: '04',
              titleAr: '٤. المتابعة اليومية (إنت مش لوحدك)',
              titleEn: '4. Daily Coaching & Support',
              descAr:
                'معاك خطوة بخطوة على الواتساب والتطبيق، حتى لو لخبطت يوم هنعرفك ازاي تعوض وتكمل لحد ما توصل لحلمك.',
              descEn:
                'Daily WhatsApp check-ins, video form corrections, and mindset support until you hit your goal.',
              icon: MessageCircle,
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md transition dark:border-slate-800 dark:bg-[#121623]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-[#D4AF37]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-2xl font-black text-slate-200 dark:text-slate-800">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {isAr ? item.descAr : item.descEn}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. TRANSFORMATION STORIES ("شركاؤنا حققوا أفضل نسخة من نفسهم") */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="rounded-full bg-emerald-500/15 px-3.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              {isAr ? 'قصص نجاح حقيقية' : 'REAL CLIENT RESULTS'}
            </span>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              {isAr
                ? 'شركاؤنا حققوا أفضل نسخة من نفسهم.. مش بس شكل جسمهم!'
                : 'Real People, Real Science, Life-Changing Results'}
            </h2>
          </div>
          <a
            href="#coaching-packages"
            className="text-xs font-extrabold text-amber-600 hover:underline dark:text-[#D4AF37]"
          >
            {isAr ? 'اعرف قصصهم، الآن دورك — ابدأ قصتك ←' : 'Now it is your turn — Start today →'}
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TRANSFORMATIONS.map((tr, i) => (
            <motion.div
              key={tr.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-[#121623]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                    {isAr ? tr.resultBadgeAr : tr.resultBadgeEn}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {isAr ? tr.durationAr : tr.durationEn}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-3 text-center text-xs dark:bg-slate-900">
                  <div>
                    <span className="text-slate-500">{isAr ? 'قبل' : 'Before'}</span>
                    <p className="font-mono font-black text-rose-500">{tr.beforeWeight}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{isAr ? 'بعد' : 'After'}</span>
                    <p className="font-mono font-black text-emerald-500">{tr.afterWeight}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{isAr ? 'نسبة الدهون' : 'Body Fat'}</span>
                    <p className="font-mono font-black text-amber-600 dark:text-[#D4AF37]">
                      {tr.bodyFatDrop}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  &ldquo;{isAr ? tr.quoteAr : tr.quoteEn}&rdquo;
                </p>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {isAr ? tr.nameAr : tr.nameEn}
                </p>
                <p className="text-xs text-slate-500">{isAr ? tr.roleAr : tr.roleEn}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. COACHING PACKAGES & COMPARISON TABLE ("برامج الاشتراك والمقارنة") */}
      <section id="coaching-packages" className="space-y-8 scroll-mt-20">
        <div className="text-center">
          <span className="rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-extrabold text-amber-700 dark:text-[#D4AF37]">
            {isAr ? 'خصم 50% لفترة محدودة' : 'LIMITED TIME 50% LAUNCH DISCOUNT'}
          </span>
          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-4xl">
            {isAr ? 'اختر برنامج الاشتراك الأنسب لهدفك' : 'Choose Your Transformation Package'}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-slate-600 dark:text-slate-400">
            {isAr
              ? 'جميع الباقات تشمل خطة تغذية مفصلة، برنامج تدريبي مشروح بالفيديو، وتفعيل فوري لحسابك على تطبيق المتدرب.'
              : 'All packages include tailored nutrition, video workout programs, and instant access to the Member App.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {COACHING_TIERS.map((tier) => (
            <motion.div
              key={tier.id}
              whileHover={{ y: -8 }}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 shadow-lg transition ${
                tier.popular
                  ? 'border-2 border-[#D4AF37] bg-gradient-to-b from-amber-50/70 to-white dark:from-[#1A1F33] dark:to-[#121623]'
                  : 'border-slate-200/90 bg-white dark:border-slate-800 dark:bg-[#121623]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-3 py-0.5 text-[11px] font-extrabold text-white"
                    style={{ backgroundColor: tier.accentColor }}
                  >
                    {isAr ? tier.badgeAr : tier.badgeEn}
                  </span>
                  <span className="text-[11px] font-bold text-rose-500">
                    {isAr ? `متبقي ${tier.spotsLeft} أماكن فقط` : `Only ${tier.spotsLeft} spots left`}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                  {isAr ? tier.nameAr : tier.nameEn}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? tier.subtitleAr : tier.subtitleEn}
                </p>

                <div className="mt-4 flex items-baseline gap-2 border-y border-slate-100 py-4 dark:border-slate-800">
                  <span className="font-mono text-sm text-slate-400 line-through">
                    {tier.oldPriceEgp.toLocaleString()} EGP
                  </span>
                  <span className="font-mono text-3xl font-black text-slate-900 dark:text-white">
                    {tier.priceEgp.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    EGP / {isAr ? tier.durationAr : tier.durationEn}
                  </span>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {(isAr ? tier.featuresAr : tier.featuresEn).map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: tier.accentColor }}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTierForCheckout(tier)}
                className="mt-6 w-full rounded-2xl py-3.5 text-xs font-black text-slate-950 shadow-md transition hover:brightness-110"
                style={{ backgroundColor: tier.popular ? '#D4AF37' : '#F59E0B' }}
              >
                {isAr ? `اشترك الآن في ${tier.nameAr}` : `Subscribe to ${tier.nameEn}`}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table ("المقارنة بين البرامج") */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md dark:border-slate-800 dark:bg-[#121623]">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/70">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {isAr ? 'جدول المقارنة التفصيلي بين البرامج' : 'Detailed Program Comparison Matrix'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3.5 text-start">{isAr ? 'المميزات' : 'Feature'}</th>
                  <th className="px-4 py-3.5 text-center">Fit Core</th>
                  <th className="px-4 py-3.5 text-center">Smart PRIME</th>
                  <th className="px-4 py-3.5 text-center text-amber-600 dark:text-[#D4AF37]">
                    Titan Elite Pro
                  </th>
                  <th className="px-4 py-3.5 text-center">Golden MAX VIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                {[
                  {
                    featAr: 'تحديث النظام الغذائي المخصص',
                    featEn: 'Custom Diet Plan Updates',
                    c1: 'كل 15 يوم',
                    c2: 'كل 30 يوم + وصفات فيديو',
                    c3: 'كل 10 أيام',
                    c4: 'تحديث لحظي مفتوح',
                  },
                  {
                    featAr: 'متابعة الواتساب مع الكوتش',
                    featEn: 'WhatsApp Coaching Response',
                    c1: '24–48 ساعة',
                    c2: 'مرتين أسبوعياً + لايف',
                    c3: 'متابعة يومية (أولوية)',
                    c4: 'متابعة شخصية مع مؤسس المنصة',
                  },
                  {
                    featAr: 'اجتماعات زوم ومكالمات مباشرة',
                    featEn: 'Live Zoom & Phone Check-ins',
                    c1: '—',
                    c2: 'Triple Care كل 10 أيام',
                    c3: '4 اجتماعات زوم شهرياً',
                    c4: 'زوم أسبوعي + مكالمات تليفونية',
                  },
                  {
                    featAr: 'إشراف طبي وعلاج طبيعي للإصابات',
                    featEn: 'Medical & Physical Therapy Care',
                    c1: '✓',
                    c2: '✓',
                    c3: '✓ شامل مراجعة التحاليل',
                    c4: '✓ كونسلتو طبي كامل',
                  },
                ].map((row) => (
                  <tr key={row.featEn}>
                    <td className="px-4 py-3.5 font-extrabold text-slate-900 dark:text-white">
                      {isAr ? row.featAr : row.featEn}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-300">{row.c1}</td>
                    <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-300">{row.c2}</td>
                    <td className="px-4 py-3.5 text-center font-extrabold text-amber-600 dark:text-[#D4AF37]">
                      {row.c3}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {row.c4}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE FREE CALORIE & MACRO CALCULATOR ("حاسبة السعرات الحرارية المجانية") */}
      <section
        id="free-calorie-calculator"
        data-testid="free-calorie-calculator"
        className="scroll-mt-20 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#121623] sm:p-10"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              <Calculator className="h-3.5 w-3.5" />
              {isAr ? 'أداة علمية مجانية 100%' : 'FREE SCIENTIFIC BMR & MACRO CALCULATOR'}
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {isAr
                ? 'حاسبة السعرات الحرارية والماكروز المجانية'
                : 'Calculate Your Exact Daily Calories & Macros'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isAr
                ? 'لو حاسس إنك بتقلل أكلك وبرضه مفيش نتائج ملموسة، احسب احتياج جسمك الحقيقي من السعرات والبروتين والنشويات والدهون الصحية الآن بمرجعية علمية.'
                : 'Enter your body metrics below to compute your exact Mifflin-St Jeor TDEE, protein, carbs, fats, and hydration targets.'}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'النوع' : 'Gender'}
                </label>
                <select
                  value={calcGender}
                  onChange={(e) => setCalcGender(e.target.value as 'MALE' | 'FEMALE')}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="MALE">{isAr ? 'ذكر' : 'Male'}</option>
                  <option value="FEMALE">{isAr ? 'أنثى' : 'Female'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'السن (سنة)' : 'Age (Years)'}
                </label>
                <input
                  type="number"
                  value={calcAge}
                  onChange={(e) => setCalcAge(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الوزن الحالي (كجم)' : 'Weight (kg)'}
                </label>
                <input
                  type="number"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الطول (سم)' : 'Height (cm)'}
                </label>
                <input
                  type="number"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'معدل النشاط' : 'Activity Level'}
                </label>
                <select
                  value={calcActivity}
                  onChange={(e) => setCalcActivity(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value={1.2}>{isAr ? 'خامل (عمل مكتبي)' : 'Sedentary'}</option>
                  <option value={1.375}>{isAr ? 'نشاط خفيف (١-٢ يوم تمرين)' : 'Light (1-2 days)'}</option>
                  <option value={1.55}>{isAr ? 'نشاط متوسط (٣-٥ أيام تمرين)' : 'Moderate (3-5 days)'}</option>
                  <option value={1.725}>{isAr ? 'نشاط عالي (٦ أيام تمرين)' : 'Active (6 days)'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'هدفك الحالي' : 'Primary Goal'}
                </label>
                <select
                  value={calcGoal}
                  onChange={(e) => setCalcGoal(e.target.value as 'CUT' | 'MAINTAIN' | 'BULK')}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="CUT">{isAr ? 'خسارة دهون وتنشيف' : 'Fat Loss / Cutting'}</option>
                  <option value="MAINTAIN">{isAr ? 'ثبات الوزن وتحسين الأداء' : 'Body Recomp / Maintain'}</option>
                  <option value="BULK">{isAr ? 'زيادة كتلة عضلية صافية' : 'Lean Muscle Bulk'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calculated Result Card */}
          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-slate-900 via-[#151A2C] to-slate-950 p-6 text-white lg:col-span-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
                {isAr ? 'نتيجتك العلمية اليومية المقترحة' : 'YOUR PERSONALIZED DAILY TARGETS'}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-black text-[#D4AF37]">
                  {targetCalories.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  {isAr ? 'سعرة حرارية / يومياً (kcal/day)' : 'kcal / day'}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white/10 p-3">
                  <span className="text-slate-300">{isAr ? 'البروتين اليومي' : 'Daily Protein'}</span>
                  <p className="mt-1 font-mono text-lg font-black text-emerald-400">
                    {targetProteinG}g
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <span className="text-slate-300">{isAr ? 'النشويات المحسوبة' : 'Smart Carbs'}</span>
                  <p className="mt-1 font-mono text-lg font-black text-amber-300">
                    {targetCarbsG}g
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <span className="text-slate-300">{isAr ? 'الدهون الصحية' : 'Healthy Fats'}</span>
                  <p className="mt-1 font-mono text-lg font-black text-rose-300">{targetFatsG}g</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <span className="text-slate-300">{isAr ? 'احتياج المياه' : 'Water Intake'}</span>
                  <p className="mt-1 font-mono text-lg font-black text-sky-300">
                    {targetWaterLiters} Liters
                  </p>
                </div>
              </div>
            </div>

            <a
              href="#coaching-packages"
              className="mt-6 block w-full rounded-xl bg-[#D4AF37] py-3 text-center text-xs font-black text-slate-950"
            >
              {isAr
                ? 'استلم جدول وجبات مفصل بهذه السعرات الآن ←'
                : 'Get a Custom Meal Plan For These Macros →'}
            </a>
          </div>
        </div>
      </section>

      {/* 6. HEALTHY RECIPES & MYTH VS TRUTH ("وصفات شهية" + "الحقيقة أو الدايت؟") */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Healthy Recipes */}
        <div className="space-y-4 lg:col-span-5">
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-700 dark:text-[#D4AF37]">
            {isAr ? 'وصفات شهية بدون حرمان' : 'MACRO-FRIENDLY RECIPES'}
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {isAr
              ? 'الأكل الصحي اللي جسمك محتاجه من غير ما تتنازل عن الطعم!'
              : 'Delicious High-Protein Meals Ready in Minutes'}
          </h3>

          <div className="space-y-3">
            {HEALTHY_RECIPES.map((rcp) => (
              <div
                key={rcp.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#121623]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                    {isAr ? rcp.tagAr : rcp.tagEn}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    {isAr ? rcp.prepAr : rcp.prepEn}
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">
                  {isAr ? rcp.titleAr : rcp.titleEn}
                </h4>
                <div className="mt-3 flex items-center gap-3 font-mono text-xs">
                  <span className="font-bold text-amber-600 dark:text-[#D4AF37]">{rcp.kcal} kcal</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Protein: {rcp.proteinG}g
                  </span>
                  <span className="text-slate-500">Carbs: {rcp.carbsG}g</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Myth vs Truth Accordion ("الحقيقة أو الدايت؟") */}
        <div className="space-y-4 lg:col-span-7">
          <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-extrabold text-sky-700 dark:text-sky-300">
            {isAr ? 'تصحيح المفاهيم العلمية' : 'SCIENCE VS. DIET MYTHS'}
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {isAr
              ? 'الحقيقة أو الدايت؟ إجابات علمية على أشهر الخرافات'
              : 'Truth or Diet Myth? Scientific Answers'}
          </h3>

          <div className="space-y-2.5">
            {MYTH_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={faq.qEn}
                  className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-[#121623]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between px-5 py-4 text-start text-xs font-extrabold text-slate-900 dark:text-white sm:text-sm"
                  >
                    <span>{isAr ? faq.qAr : faq.qEn}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#D4AF37]' : 'text-slate-400'
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 px-5 py-3.5 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300"
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

      {/* 7. FREE E-BOOK LEAD MAGNET & SAAS WHITE-LABEL BANNER */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Free E-book */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700 dark:text-[#D4AF37]">
            <BookOpen className="h-4 w-4" />
            {isAr ? 'هدية مجانية لزوار المنصة' : 'FREE TRAINING E-BOOK'}
          </div>
          <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
            {isAr
              ? 'وفرنالك كتاب "الدليل الشامل لاحتراف التمرين بدون إصابات" مجاناً!'
              : 'Download "The Complete Injury-Free Hypertrophy Guide" For Free'}
          </h3>
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              value={ebookEmail}
              onChange={(e) => setEbookEmail(e.target.value)}
              placeholder={isAr ? 'أدخل بريدك الإلكتروني لاستلام الكتاب...' : 'Enter your email...'}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => {
                showToast(
                  isAr
                    ? '📘 تم إرسال كتاب الدليل الشامل لاحتراف التمرين إلى بريدك الإلكتروني!'
                    : '📘 Sent the Injury-Free Training E-Book to your inbox!',
                );
                setEbookEmail('');
              }}
              className="rounded-xl bg-[#D4AF37] px-5 py-2.5 text-xs font-black text-slate-950"
            >
              {isAr ? 'احصل عليه مجاناً' : 'Send E-Book'}
            </button>
          </div>
        </div>

        {/* Are you a Gym Owner or Online Coach? Get this SaaS Platform! */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-300 bg-slate-900 p-6 text-white sm:p-8">
          <div>
            <span className="rounded-full bg-[#D4AF37]/20 px-3 py-1 text-[11px] font-extrabold text-[#F3E5AB]">
              {isAr ? 'لأصحاب الجيمات ومدربي الأونلاين (B2B SaaS)' : 'FOR GYM OWNERS & ONLINE COACHES'}
            </span>
            <h3 className="mt-2 text-lg font-black">
              {isAr
                ? 'هل أنت صاحب جيم أو كوتش أونلاين؟ احصل على نسختك الخاصة من هذه المنصة باسمك وشعارك!'
                : 'Own a Gym or Coaching Brand? Launch Your White-Label SaaS Platform in 60 Seconds'}
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              {isAr
                ? 'امتلك صفحة هبوط للمتدربين + تطبيق موبايل باسمك + نظام بوابات QR + تحصيل فوري وإنستاباي.'
                : 'Get your own public coaching storefront, member PWA, QR turnstile engine, and Egypt payment gateways.'}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSwitchToSaaSPricing}
              className="rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-black text-slate-950"
            >
              {isAr ? 'استعرض باقات شراء المنصة للأندية والمدربين ←' : 'View SaaS Licensing & White-Label Plans →'}
            </button>
            <button
              type="button"
              onClick={onSwitchToDashboard}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white"
            >
              {isAr ? 'تجربة لوحة تحكم الإدارة' : 'Explore Admin ERP'}
            </button>
          </div>
        </div>
      </div>

      {/* Instant Trainee Subscription & Payment Modal */}
      {selectedTierForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <span className="text-xs font-extrabold text-amber-600 dark:text-[#D4AF37]">
                  {isAr ? 'تفعيل فوري للاشتراك' : 'INSTANT ONLINE ENROLLMENT'}
                </span>
                <h3 className="text-lg font-black">
                  {isAr ? selectedTierForCheckout.nameAr : selectedTierForCheckout.nameEn}
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedTierForCheckout(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubscription} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold">
                  {isAr ? 'اسم المشترك بالكامل' : 'Your Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={subscriberName}
                  onChange={(e) => setSubscriberName(e.target.value)}
                  placeholder={isAr ? 'مثال: محمد طارق' : 'e.g. Mohamed Tarek'}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold">
                  {isAr ? 'رقم الواتساب للمتابعة اليومية (+20)' : 'WhatsApp Number (+20)'}
                </label>
                <input
                  type="text"
                  required
                  value={subscriberPhone}
                  onChange={(e) => setSubscriberPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold">
                  {isAr ? 'هدفك من الاشتراك' : 'Your Primary Fitness Goal'}
                </label>
                <input
                  type="text"
                  value={subscriberGoal}
                  onChange={(e) => setSubscriberGoal(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold">
                  {isAr ? 'اختر وسيلة الدفع' : 'Select Payment Method'}
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'INSTAPAY', label: 'InstaPay (إنستاباي)' },
                      { id: 'PAYMOB_CARD', label: 'Visa / MasterCard (Paymob)' },
                      { id: 'VODAFONE_CASH', label: 'Vodafone Cash (فودافون كاش)' },
                      { id: 'FAWRY', label: 'Fawry Pay (فوري)' },
                    ] as const
                  ).map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`rounded-xl border px-3 py-2 text-xs font-extrabold ${
                        selectedGateway === gw.id
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-amber-900 dark:text-[#F3E5AB]'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {gw.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 text-xs dark:bg-slate-900">
                <div className="flex justify-between font-bold">
                  <span>{isAr ? 'إجمالي الباقة بعد الخصم:' : 'Package Total:'}</span>
                  <span className="font-mono text-base font-black text-amber-600 dark:text-[#D4AF37]">
                    {selectedTierForCheckout.priceEgp.toLocaleString()} EGP
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#D4AF37] py-3.5 text-xs font-black text-slate-950 shadow-lg"
              >
                {isAr
                  ? 'إتمام الدفع وتفعيل حسابك واستمارة التاريخ الصحي فوراً'
                  : 'Complete Payment & Unlock Onboarding Form'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
