'use client';

import React, { useState } from 'react';
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
  Zap,
} from 'lucide-react';
import { usePlatformStore } from '../../lib/platform-store';

interface TransformationStory {
  id: string;
  nameAr: string;
  nameEn: string;
  age: number;
  roleAr: string;
  roleEn: string;
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
  photoUrl: string;
}

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
  spotsLeft: number;
  popular?: boolean;
  accentColor: string;
  featuresAr: string[];
  featuresEn: string[];
}

const TRANSFORMATION_STORIES: TransformationStory[] = [
  {
    id: 'tr-1',
    nameAr: 'م. أحمد عبد اللطيف',
    nameEn: 'Eng. Ahmed Abdellatif',
    age: 32,
    roleAr: 'مهندس برمجيات — التجمع الخامس',
    roleEn: 'Software Engineer — New Cairo',
    durationAr: '١٢ أسبوع متابعة',
    durationEn: '12 Weeks',
    weightBeforeKg: 108,
    weightAfterKg: 84,
    bodyFatBefore: '29%',
    bodyFatAfter: '12%',
    badgeAr: '-24 كجم دهون صافية + بناء عضل',
    badgeEn: '-24 kg Fat Loss + Lean Muscle',
    photoUrl:
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    quoteAr:
      'كنت فاكر إن الدايت يعني حرمان وجوع، لكن مع وصفات الفيديو المحسوبة بالماكروز والمتابعة اليومية على الواتساب خسيت ٢٤ كيلو بدون أي ترهلات وبأكل كل اللي بحبه!',
    quoteEn:
      'I thought dieting meant starving, but with macro-balanced recipes and daily WhatsApp coaching I dropped 24kg with zero loose skin!',
  },
  {
    id: 'tr-2',
    nameAr: 'د. سارة المنياوي',
    nameEn: 'Dr. Sara El-Miniawy',
    age: 28,
    roleAr: 'طبيبة أسنان — الشيخ زايد',
    roleEn: 'Dentist — Sheikh Zayed',
    durationAr: '١٠ أسابيع متابعة',
    durationEn: '10 Weeks',
    weightBeforeKg: 79,
    weightAfterKg: 63,
    bodyFatBefore: '31%',
    bodyFatAfter: '18%',
    badgeAr: '-16 كجم ونحت القوام بالكامل',
    badgeEn: '-16 kg & Complete Body Recomp',
    photoUrl:
      'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=800&q=80',
    quoteAr:
      'وقتي في العيادة كان ضيق جداً، بس الوصفات السريعة اللي بتتحضر في ٢٠ دقيقة وتمارين البيت المصورة بالفيديو تحت إشراف دكتور علاج طبيعي غيرت حياتي وثقتي بنفسي ١٨٠ درجة.',
    quoteEn:
      'My clinic schedule was hectic, but the 20-minute recipes and structured 45-minute workouts completely transformed my energy and physique.',
  },
  {
    id: 'tr-3',
    nameAr: 'كابتن كريم فؤاد',
    nameEn: 'Karim Fouad',
    age: 25,
    roleAr: 'رائد أعمال — المعادي',
    roleEn: 'Entrepreneur — Maadi',
    durationAr: '١٦ أسبوع متابعة',
    durationEn: '16 Weeks',
    weightBeforeKg: 66,
    weightAfterKg: 77,
    bodyFatBefore: '16%',
    bodyFatAfter: '10%',
    badgeAr: '+11 كجم ضخامة عضلية صافية',
    badgeEn: '+11 kg Pure Muscular Hypertrophy',
    photoUrl:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    quoteAr:
      'كنت بعاني من النحافة وإصابة قديمة في الكتف. فريق العلاج الطبيعي والتغذية صمملي برنامج ضخامة عضلية زادني ١١ كيلو عضل صافي بدون أي ألم في المفاصل!',
    quoteEn:
      'With physical therapy supervision and progressive overload tracking, I gained 11kg of lean mass pain-free.',
  },
];

const COACHING_TIERS: CoachingTier[] = [
  {
    id: 'tier-fit-core',
    badgeAr: 'بداية ذكية واقتصادية',
    badgeEn: 'SMART START',
    nameAr: 'برنامج فيت كور (Fit Core)',
    nameEn: 'Fit Core Program',
    subtitleAr: 'مثالي للمبتدئين لبناء أساس صحي ورياضي سليم',
    subtitleEn: 'Ideal for beginners building sustainable habits',
    oldPriceEgp: 3200,
    priceEgp: 1650,
    durationAr: '٣ شهور كاملة',
    durationEn: '3 Months',
    spotsLeft: 14,
    accentColor: '#10B981',
    featuresAr: [
      'نظام غذائي مرن ومفصل لهدفك يتغير كل 15 يوم',
      'برنامج تدريبي مشروح بالفيديو (للجيم أو المنزل) تحت إشراف أطباء علاج طبيعي',
      'متابعة على الواتساب مع فريق المتابعة خلال 24-48 ساعة',
      'دخول كامل لتطبيق المتدرب لتسجيل الأوزان والماكروز',
    ],
    featuresEn: [
      'Tailored nutrition plan updated every 15 days',
      'Gym or home workout program supervised by a physical therapist',
      'WhatsApp follow-up within 24–48 hours',
      'Full access to the Member PWA tracker',
    ],
  },
  {
    id: 'tier-smart-prime',
    badgeAr: 'جديد • أماكن محدودة',
    badgeEn: 'NEW • LIMITED SPOTS',
    nameAr: 'باقة سمارت برايم (Smart PRIME)',
    nameEn: 'Smart PRIME Package',
    subtitleAr: 'تغذية بوصفات مصورة + اجتماعات لايف جماعية',
    subtitleEn: 'Complete nutrition, training & live group coaching',
    oldPriceEgp: 4800,
    priceEgp: 2450,
    durationAr: '٣ شهور كاملة',
    durationEn: '3 Months',
    spotsLeft: 9,
    accentColor: '#0284C7',
    featuresAr: [
      'خطة تغذية مرنة بوصفات مصورة بالفيديو تتحدث كل 30 يوم',
      'خطة تدريبية مشروحة بالفيديو مع تصحيح الأداء الحركي',
      'اجتماع لايف جماعي (Triple Care Meeting) لمدة 3 ساعات كل 10 أيام',
      'خطة مكملات غذائية اختيارية + كتب إلكترونية مجانية',
      'اشتراك مجاني في تطبيق المنصة ودخول الفروع',
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
    id: 'tier-medfit-elite',
    badgeAr: 'الأكثر مبيعاً • أفضل قيمة',
    badgeEn: 'MOST POPULAR • BEST VALUE',
    nameAr: 'تيتان إيليت برو (Titan Elite Pro)',
    nameEn: 'Titan Elite Pro',
    subtitleAr: 'متابعة يومية 1-on-1 على الواتساب + إشراف طبي كامل + مكالمات زوم',
    subtitleEn: 'Daily WhatsApp coaching, medical supervision & Zoom calls',
    oldPriceEgp: 7500,
    priceEgp: 4200,
    durationAr: '٣ شهور كاملة',
    durationEn: '3 Months',
    spotsLeft: 5,
    popular: true,
    accentColor: '#D97706',
    featuresAr: [
      'كل مميزات باقة Smart PRIME بالكامل',
      'متابعة يومية فورية على الواتساب مع الكوتش والطبيب المختص (أولوية قصوى)',
      '4 اجتماعات فيديو (Zoom) شهرية لمراجعة التقدم وتعديل الخطة',
      'إشراف طبي شامل ومراجعة التحاليل الطبية وإصابات المفاصل والعمود الفقري',
      'تحديث النظام الغذائي كل 10 أيام حسب استجابة جسمك',
      'دخول مجاني لجميع فروع الجيم وبوابات الـ QR الذكية',
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
    badgeAr: 'VIP كبار الشخصيات',
    badgeEn: 'VIP EXCLUSIVE',
    nameAr: 'جولدن إيليت ماكس (Golden MAX VIP)',
    nameEn: 'Golden Elite MAX',
    subtitleAr: 'متابعة شخصية مباشرة 1-لـ-1 مع مؤسس المنصة وكبير الأطباء',
    subtitleEn: 'Direct 1-on-1 coaching with the Head Coach & Chief Physician',
    oldPriceEgp: 14000,
    priceEgp: 8500,
    durationAr: '٣ شهور كاملة',
    durationEn: '3 Months',
    spotsLeft: 2,
    accentColor: '#7C3AED',
    featuresAr: [
      'متابعة شخصية مباشرة مع مؤسس المنصة وكبير أطباء التغذية والعلاج الطبيعي',
      'مكالمات هاتفية مباشرة واجتماع Zoom خاص أسبوعياً',
      'تغيير فوري ومفتوح للوجبات والتمارين في أي وقت حسب جدول سفرك أو عملك',
      'تصحيح الأداء التدريبي بالفيديو لكل تمرين خطوة بخطوة',
      'كارت الشركاء الذهبي: خصم 40% لك ولـ 5 من أصدقائك أو عائلتك',
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
    imageUrl:
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
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
    tagAr: 'فطار صحي لذيذ بدون حرمان',
    tagEn: 'Sweet Craving Breakfast',
    imageUrl:
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rcp-3',
    titleAr: 'سالمون أو دجاج مشوي مع الأرز البسمتي والأفوكادو',
    titleEn: 'Grilled Protein Bowl with Basmati Rice & Greens',
    prepAr: '٢٥ دقيقة',
    prepEn: '25 Mins',
    kcal: 450,
    proteinG: 48,
    carbsG: 42,
    fatsG: 11,
    tagAr: 'غني بالبروتين والأوميجا',
    tagEn: 'High-Protein Power Bowl',
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
  const [selectedGateway, setSelectedGateway] = useState<
    'INSTAPAY' | 'PAYMOB_CARD' | 'VODAFONE_CASH' | 'FAWRY'
  >('INSTAPAY');
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
    <div data-testid="panel-public-storefront" className="mx-auto max-w-7xl space-y-16 bg-white pb-20 text-slate-900">
      {/* 1. PURE WHITE LUXURY HERO SECTION — DIET & CHEAT HIGH-CONVERSION STYLE */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-bl from-white via-amber-50/40 to-emerald-50/40 p-6 shadow-lg sm:p-12"
      >
        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Right Text Column (in RTL) */}
          <div className="space-y-6 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/80 px-4 py-1.5 text-xs font-extrabold text-amber-900"
            >
              <Sparkles className="h-4 w-4 text-amber-600" />
              {isAr
                ? 'أفضل وقت للبداية كان من سنة.. وتاني أفضل وقت هو الآن!'
                : 'THE BEST TIME TO START WAS A YEAR AGO — THE SECOND BEST TIME IS NOW!'}
            </motion.div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
              {isAr ? (
                <>
                  إنسى نظام الدايت الممل..{' '}
                  <span className="bg-gradient-to-l from-amber-600 to-emerald-600 bg-clip-text text-transparent">
                    وإبني لنفسك نمط حياة صحي
                  </span>{' '}
                  وجسم مثالي بدون حرمان!
                </>
              ) : (
                <>
                  Forget Boring Diets —{' '}
                  <span className="bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
                    Build Your Dream Physique
                  </span>{' '}
                  With Science & Medical Supervision
                </>
              )}
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              {isAr
                ? 'أكثر من +12,500 مشترك غيروا حياتهم بالكامل ووصلوا لشكل جسمهم المثالي من خلال خطط تغذية بوصفات مصورة، برامج تدريبية بالفيديو من الجيم أو البيت تحت إشراف أطباء علاج طبيعي، ومتابعة يومية خطوة بخطوة.'
                : 'Over 12,500+ members transformed their bodies and lives through tailored video-recipe nutrition, physical-therapist-supervised training, and daily 1-on-1 WhatsApp & app coaching.'}
            </p>

            {/* Primary CTA Buttons including the FREE TRIAL WORKOUTS & DIETS Button */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#coaching-packages"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-[#D4AF37] px-7 py-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition hover:scale-[1.02]"
              >
                <Zap className="h-4 w-4" />
                {isAr ? 'اشترك الآن وابدأ التغيير' : 'Subscribe & Start Now'}
              </a>

              {onOpenFreeTrialHub && (
                <button
                  type="button"
                  data-testid="open-free-trial-hub-btn"
                  onClick={onOpenFreeTrialHub}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-6 py-3.5 text-sm font-black text-emerald-900 shadow-sm transition hover:bg-emerald-600 hover:text-white"
                >
                  <Gift className="h-4 w-4 text-emerald-600" />
                  {isAr
                    ? '🎁 جرب مجاناً الآن (تمارين فيديو + أنظمة غذائية)'
                    : '🎁 Try Free Workouts & Meal Plans'}
                </button>
              )}

              <a
                href="#free-calorie-calculator"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-xs font-extrabold text-slate-800 shadow-sm transition hover:border-amber-500"
              >
                <Calculator className="h-4 w-4 text-amber-600" />
                {isAr ? 'حاسبة السعرات المجانية' : 'Free Calorie Calculator'}
              </a>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-200/90 pt-6">
              <div>
                <p className="font-mono text-2xl font-black text-amber-600 sm:text-3xl">+12,500</p>
                <p className="text-xs font-bold text-slate-600">
                  {isAr ? 'قصة نجاح وتحول حقيقي' : 'Verified Transformations'}
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-black text-emerald-600 sm:text-3xl">100%</p>
                <p className="text-xs font-bold text-slate-600">
                  {isAr ? 'تحت إشراف طبي ورياضي' : 'Medical & PT Supervised'}
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-black text-sky-600 sm:text-3xl">24/7</p>
                <p className="text-xs font-bold text-slate-600">
                  {isAr ? 'متابعة واتساب وتطبيق ذكي' : 'WhatsApp & App Support'}
                </p>
              </div>
            </div>
          </div>

          {/* Left Visual Column — White Card with Real Fitness Photo + Before/After Transformation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80"
                  alt="Personal Trainer & Nutrition Coaching"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <span className="absolute top-4 start-4 rounded-full bg-emerald-500 px-3.5 py-1 text-xs font-extrabold text-white shadow">
                  {isAr ? '🔥 نتيجة الأسبوع الموثقة' : '🔥 FEATURED TRANSFORMATION'}
                </span>
                <div className="absolute bottom-3 start-4 end-4 flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm font-black">
                      {isAr ? 'م. أحمد عبد اللطيف' : 'Eng. Ahmed Abdellatif'}
                    </p>
                    <p className="text-[11px] text-amber-300">
                      {isAr ? 'خلال ١٢ أسبوع متابعة في باقة تيتان إيليت' : '12 Weeks on Titan Elite'}
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
                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <div className="border-e border-slate-200 pe-2">
                    <p className="text-[11px] font-bold text-slate-500">
                      {isAr ? 'قبل الاشتراك' : 'Before'}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-black text-rose-600">108 kg</p>
                    <p className="text-[11px] font-semibold text-slate-500">Body Fat: 29%</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-emerald-700">
                      {isAr ? 'بعد ١٢ أسبوع' : 'After 12 Wks'}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-black text-emerald-600">84 kg</p>
                    <p className="text-[11px] font-bold text-emerald-700">Body Fat: 12% (-24kg)</p>
                  </div>
                </div>

                <blockquote className="mt-4 text-xs leading-relaxed font-semibold text-slate-600">
                  {isAr
                    ? '“خسيت ٢٤ كيلو دهون وزدت كتلة عضلية من غير ما أحرم نفسي من الأكل اللي بحبه، والكوتش والدكتور كانوا معايا يوم بيوم على الواتساب!”'
                    : '“Lost 24kg of fat while eating delicious macro-friendly meals with daily doctor & coach check-ins!”'}
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
          className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-white to-amber-50/80 p-6 shadow-md sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Video className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-extrabold text-emerald-800">
                  {isAr ? 'جديد ومجاني ١٠٠٪ لزوار الموقع' : 'NEW & 100% FREE FOR VISITORS'}
                </span>
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                  {isAr
                    ? 'داخل تجرب الأول؟ افتح مكتبة التمارين بالفيديو والأنظمة الغذائية المجانية!'
                    : 'Want to Try First? Open Our Free Video Workouts & Meal Plans Hub!'}
                </h2>
                <p className="text-xs text-slate-600 sm:text-sm">
                  {isAr
                    ? 'شاهد فيديوهات التمارين مع نصائح أطباء العلاج الطبيعي، شغل تايمر التمرين التفاعلي، وحمل ٣ أنظمة غذائية كاملة بالجرامات والبدائل الاقتصادية مجاناً.'
                    : 'Watch HD exercise demos with PT safety cues, use our interactive set & rest timer, and grab 3 complete meal plans for free.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenFreeTrialHub}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
            >
              <Play className="h-4 w-4 fill-white" />
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
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
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
              titleAr: '١. إشترك بسهولة',
              titleEn: '1. Choose & Subscribe',
              descAr:
                'اختر الباقة المناسبة لهدفك وادفع بأمان عبر إنستاباي، فودافون كاش، فوري، أو البطاقة البنكية.',
              descEn:
                'Pick your coaching package and pay securely via InstaPay, Fawry, Vodafone Cash, or Card.',
              icon: CreditCard,
              color: 'text-amber-600 bg-amber-50 border-amber-200',
            },
            {
              step: '02',
              titleAr: '٢. تاريخك الصحي والرياضي',
              titleEn: '2. Deep-Dive Assessment',
              descAr:
                'بنتعرف على تفاصيل يومك، الأكل اللي بتحبه، تحاليلك الطبية، وأي إصابات سابقة عشان نفصل البرنامج عليك.',
              descEn:
                'We analyze your nutrition history, lifestyle, lab tests, and injuries to tailor every detail.',
              icon: HeartPulse,
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            },
            {
              step: '03',
              titleAr: '٣. الجزء السحري (البرنامج المفصل)',
              titleEn: '3. The Magic Blueprint',
              descAr:
                'تستلم على التطبيق خطتك الغذائية بالوصفات المصورة وبرنامجك التدريبي بالفيديو تحت إشراف طبيب علاج طبيعي.',
              descEn:
                'Receive your custom meal plan, video workouts, and supplement guide reviewed by a physician.',
              icon: Sparkles,
              color: 'text-sky-600 bg-sky-50 border-sky-200',
            },
            {
              step: '04',
              titleAr: '٤. المتابعة: إنت مش لوحدك!',
              titleEn: '4. Daily Coaching & Support',
              descAr:
                'متابعة يومية على الواتساب والتطبيق، وتصحيح لأدائك التدريبي بالفيديو ودعم نفسي مستمر لحد ما توصل لهدفك.',
              descEn:
                'Daily WhatsApp check-ins, video form corrections, and mindset support until you hit your goal.',
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

      {/* 4. REAL TRANSFORMATION STORIES WITH PHOTOS ("شركاؤنا حققوا أفضل نسخة من نفسهم") */}
      <section id="transformations-section" className="scroll-mt-24 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
              {isAr ? 'نتائج حقيقية وموثقة بالصور والأرقام' : 'REAL CLIENT RESULTS'}
            </span>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              {isAr
                ? 'شركاؤنا حققوا أفضل نسخة من نفسهم — الدور عليك الآن!'
                : 'Real People, Real Science, Life-Changing Results'}
            </h2>
          </div>
          <a
            href="#coaching-packages"
            className="text-xs font-extrabold text-amber-600 hover:underline"
          >
            {isAr ? 'ابدأ قصتك الخاصة اليوم ←' : 'Now it is your turn — Start today →'}
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={story.photoUrl}
                    alt={isAr ? story.nameAr : story.nameEn}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <span className="absolute top-3 start-3 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-extrabold text-white shadow">
                    {isAr ? story.badgeAr : story.badgeEn}
                  </span>
                  <span className="absolute bottom-3 end-3 rounded-lg bg-white/95 px-2.5 py-1 font-mono text-[11px] font-extrabold text-slate-900">
                    {isAr ? story.durationAr : story.durationEn}
                  </span>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500">
                        {isAr ? 'الوزن السابق' : 'Before'}
                      </span>
                      <p className="font-mono text-base font-black text-rose-600">
                        {story.weightBeforeKg} kg
                      </p>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] font-bold text-emerald-700">
                        {isAr ? 'الوزن الحالي' : 'After'}
                      </span>
                      <p className="font-mono text-base font-black text-emerald-600">
                        {story.weightAfterKg} kg
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500">
                        {isAr ? 'نسبة الدهون' : 'Body Fat'}
                      </span>
                      <p className="font-mono text-xs font-extrabold text-amber-700">
                        {story.bodyFatBefore} ← {story.bodyFatAfter}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-slate-600">
                    “{isAr ? story.quoteAr : story.quoteEn}”
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <p className="text-sm font-extrabold text-slate-900">
                  {isAr ? story.nameAr : story.nameEn} ({story.age} {isAr ? 'سنة' : 'yrs'})
                </p>
                <p className="text-[11px] font-semibold text-slate-500">
                  {isAr ? story.roleAr : story.roleEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. 4 TIERED COACHING PACKAGES + COMPARISON TABLE */}
      <section id="coaching-packages" className="scroll-mt-24 space-y-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100/80 px-3.5 py-1 text-xs font-extrabold text-amber-900">
            <Flame className="h-3.5 w-3.5 text-amber-600" />
            {isAr
              ? 'خصم 50% لفترة محدودة على جميع الباقات'
              : 'LIMITED TIME 50% LAUNCH DISCOUNT'}
          </span>
          <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-4xl">
            {isAr
              ? 'اختر باقة المتابعة المناسبة لهدفك وابدأ اليوم'
              : 'Choose Your Transformation Package'}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs text-slate-600 sm:text-sm">
            {isAr
              ? 'جميع الباقات تشمل خطة تغذية مفصلة، برنامج تدريبي بالفيديو، واشتراك مجاني في تطبيق المتدرب الذكي.'
              : 'All packages include tailored nutrition, video workout programs, and instant access to the Member App.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {COACHING_TIERS.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className={`relative flex flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-xl ${
                tier.popular
                  ? 'border-2 border-amber-500 ring-4 ring-amber-500/15'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-extrabold text-white"
                    style={{ backgroundColor: tier.accentColor }}
                  >
                    {isAr ? tier.badgeAr : tier.badgeEn}
                  </span>
                  <span className="text-[11px] font-bold text-rose-600">
                    {isAr
                      ? `متبقي ${tier.spotsLeft} أماكن فقط`
                      : `Only ${tier.spotsLeft} spots left`}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  {isAr ? tier.nameAr : tier.nameEn}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {isAr ? tier.subtitleAr : tier.subtitleEn}
                </p>

                <div className="mt-4 flex items-baseline gap-2 border-y border-slate-100 py-4">
                  <span className="font-mono text-sm text-slate-400 line-through">
                    {tier.oldPriceEgp.toLocaleString()} EGP
                  </span>
                  <span className="font-mono text-3xl font-black text-slate-900">
                    {tier.priceEgp.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    EGP / {isAr ? tier.durationAr : tier.durationEn}
                  </span>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs text-slate-700">
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
                className={`mt-6 w-full rounded-2xl py-3.5 text-xs font-black transition ${
                  tier.popular
                    ? 'bg-gradient-to-r from-amber-500 to-[#D4AF37] text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-105'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isAr
                  ? `اشترك الآن في ${tier.nameAr}`
                  : `Subscribe to ${tier.nameEn}`}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h3 className="text-sm font-black text-slate-900">
              {isAr
                ? 'جدول المقارنة التفصيلي بين الباقات الأربعة'
                : 'Detailed Program Comparison Matrix'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-slate-600">
                  <th className="px-5 py-3.5 font-extrabold">
                    {isAr ? 'وجه المقارنة' : 'Feature'}
                  </th>
                  <th className="px-4 py-3.5 font-extrabold">Fit Core</th>
                  <th className="px-4 py-3.5 font-extrabold text-sky-700">Smart PRIME</th>
                  <th className="px-4 py-3.5 font-extrabold text-amber-700">Titan Elite Pro</th>
                  <th className="px-4 py-3.5 font-extrabold text-purple-700">Golden MAX VIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-5 py-3 font-bold">
                    {isAr ? 'تحديث الخطة الغذائية' : 'Custom Diet Plan Updates'}
                  </td>
                  <td className="px-4 py-3">كل 15 يوم</td>
                  <td className="px-4 py-3">كل 30 يوم + وصفات فيديو</td>
                  <td className="px-4 py-3 font-bold text-amber-700">كل 10 أيام</td>
                  <td className="px-4 py-3 font-bold text-purple-700">تحديث لحظي مفتوح</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-bold">
                    {isAr ? 'سرعة المتابعة على الواتساب' : 'WhatsApp Coaching Response'}
                  </td>
                  <td className="px-4 py-3">24–48 ساعة</td>
                  <td className="px-4 py-3">مرتين أسبوعياً + لايف</td>
                  <td className="px-4 py-3 font-bold text-amber-700">متابعة يومية (أولوية)</td>
                  <td className="px-4 py-3 font-bold text-purple-700">
                    متابعة شخصية مع مؤسس المنصة
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-bold">
                    {isAr ? 'اجتماعات الفيديو اللايف (Zoom)' : 'Live Zoom & Phone Check-ins'}
                  </td>
                  <td className="px-4 py-3 text-slate-400">—</td>
                  <td className="px-4 py-3">Triple Care كل 10 أيام</td>
                  <td className="px-4 py-3 font-bold text-amber-700">4 اجتماعات زوم شهرياً</td>
                  <td className="px-4 py-3 font-bold text-purple-700">
                    زوم أسبوعي + مكالمات تليفونية
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-bold">
                    {isAr ? 'إشراف طبي وعلاج طبيعي للإصابات' : 'Medical & Physical Therapy Care'}
                  </td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">✓</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">✓</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">✓ شامل مراجعة التحاليل</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">✓ كونسلتو طبي كامل</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE FREE CALORIE & MACRO CALCULATOR ("حاسبة السعرات الحرارية المجانية") */}
      <section
        id="free-calorie-calculator"
        data-testid="free-calorie-calculator"
        className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-10"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-extrabold text-emerald-800">
              <Calculator className="h-3.5 w-3.5 text-emerald-600" />
              {isAr ? 'أداة علمية مجانية 100%' : 'FREE SCIENTIFIC BMR & MACRO CALCULATOR'}
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              {isAr
                ? 'حاسبة السعرات الحرارية والماكروز المجانية'
                : 'Calculate Your Exact Daily Calories & Macros'}
            </h2>
            <p className="text-xs text-slate-600">
              {isAr
                ? 'لو حاسس إنك بتقلل أكلك وبرضه مفيش نتائج ملموسة، احسب احتياج جسمك الحقيقي من السعرات والبروتين والنشويات والدهون الصحية الآن بمرجعية علمية.'
                : 'Enter your body metrics below to compute your exact Mifflin-St Jeor TDEE, protein, carbs, fats, and hydration targets.'}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  {isAr ? 'النوع' : 'Gender'}
                </label>
                <select
                  value={calcGender}
                  onChange={(e) => setCalcGender(e.target.value as 'MALE' | 'FEMALE')}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="MALE">{isAr ? 'ذكر' : 'Male'}</option>
                  <option value="FEMALE">{isAr ? 'أنثى' : 'Female'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  {isAr ? 'السن (سنة)' : 'Age (Years)'}
                </label>
                <input
                  type="number"
                  value={calcAge}
                  onChange={(e) => setCalcAge(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  {isAr ? 'الوزن (كجم)' : 'Weight (kg)'}
                </label>
                <input
                  type="number"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  {isAr ? 'الطول (سم)' : 'Height (cm)'}
                </label>
                <input
                  type="number"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  {isAr ? 'مستوى النشاط' : 'Activity Level'}
                </label>
                <select
                  value={calcActivity}
                  onChange={(e) => setCalcActivity(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value={1.2}>{isAr ? 'مكتبي / خامل' : 'Sedentary'}</option>
                  <option value={1.375}>{isAr ? 'نشاط خفيف (١-٢ يوم)' : 'Light (1-2 days)'}</option>
                  <option value={1.55}>{isAr ? 'متوسط (٣-٥ أيام تمرين)' : 'Moderate (3-5 days)'}</option>
                  <option value={1.725}>{isAr ? 'عالي (٦ أيام تمرين)' : 'Active (6 days)'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  {isAr ? 'هدفك الحالي' : 'Primary Goal'}
                </label>
                <select
                  value={calcGoal}
                  onChange={(e) => setCalcGoal(e.target.value as 'CUT' | 'MAINTAIN' | 'BULK')}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="CUT">{isAr ? 'تنشيف وخسارة دهون' : 'Fat Loss / Cutting'}</option>
                  <option value="MAINTAIN">{isAr ? 'ثبات وإعادة تشكيل (Recomp)' : 'Body Recomp / Maintain'}</option>
                  <option value="BULK">{isAr ? 'ضخامة عضلية صافية' : 'Lean Muscle Bulk'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calculated Output Card — Clean White & Warm Amber */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/50 p-6 lg:col-span-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                {isAr ? 'احتياجك اليومي المحسوب علمياً' : 'YOUR PERSONALIZED DAILY TARGETS'}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-black text-slate-900">
                  {targetCalories.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-700">
                  {isAr ? 'سعرة حرارية / يومياً (kcal)' : 'kcal / day'}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500">
                    {isAr ? 'البروتين اليومي (لبناء العضل)' : 'Daily Protein'}
                  </span>
                  <p className="font-mono text-lg font-black text-emerald-600">{targetProteinG}g</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500">
                    {isAr ? 'النشويات الذكية (للطاقة)' : 'Smart Carbs'}
                  </span>
                  <p className="font-mono text-lg font-black text-amber-600">{targetCarbsG}g</p>
                </div>
                <div className="rounded-xl border border-sky-200 bg-white p-3 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500">
                    {isAr ? 'الدهون الصحية (للهرمونات)' : 'Healthy Fats'}
                  </span>
                  <p className="font-mono text-lg font-black text-sky-600">{targetFatsG}g</p>
                </div>
                <div className="rounded-xl border border-purple-200 bg-white p-3 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500">
                    {isAr ? 'احتياج المياه اليومي' : 'Water Intake'}
                  </span>
                  <p className="font-mono text-lg font-black text-purple-600">
                    {targetWaterLiters} {isAr ? 'لتر' : 'Liters'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {onOpenFreeTrialHub && (
                <button
                  type="button"
                  onClick={onOpenFreeTrialHub}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-center text-xs font-black text-white transition hover:bg-emerald-700"
                >
                  {isAr
                    ? '🥗 استلم جدول وجبات مجاني يناسب سعراتك الآن ←'
                    : '🥗 Grab a Free Meal Plan For These Macros →'}
                </button>
              )}
              <a
                href="#coaching-packages"
                className="block w-full rounded-xl bg-amber-500 py-3 text-center text-xs font-black text-slate-950 transition hover:bg-amber-400"
              >
                {isAr
                  ? 'اشترك لنصمم لك جدولاً خاصاً بهذه الماكروز ←'
                  : 'Get a Custom Meal Plan For These Macros →'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HEALTHY FAST RECIPES WITH PHOTOS + "الحقيقة أو الدايت؟" MYTH VS SCIENCE Q&A */}
      <div id="recipes-section" className="scroll-mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Fast Healthy Recipes with Real Food Photos */}
        <div className="space-y-4 lg:col-span-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
              {isAr ? 'وصفات صحية سريعة بدون حرمان' : 'MACRO-FRIENDLY RECIPES'}
            </span>
            <h3 className="mt-1 text-xl font-black text-slate-900">
              {isAr
                ? 'حضّر وجبات شهية عالية البروتين في دقائق'
                : 'Delicious High-Protein Meals Ready in Minutes'}
            </h3>
          </div>

          <div className="space-y-3">
            {HEALTHY_RECIPES.map((rcp) => (
              <motion.div
                key={rcp.id}
                whileHover={{ x: isAr ? -4 : 4 }}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
              >
                <img
                  src={rcp.imageUrl}
                  alt={isAr ? rcp.titleAr : rcp.titleEn}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      {isAr ? rcp.tagAr : rcp.tagEn}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <Clock className="h-3 w-3 text-amber-600" />
                      {isAr ? rcp.prepAr : rcp.prepEn}
                    </span>
                  </div>
                  <h4 className="mt-1.5 text-sm font-black text-slate-900">
                    {isAr ? rcp.titleAr : rcp.titleEn}
                  </h4>
                  <div className="mt-2 flex gap-3 font-mono text-[11px] font-bold">
                    <span className="text-amber-700">{rcp.kcal} kcal</span>
                    <span className="text-emerald-700">Protein: {rcp.proteinG}g</span>
                    <span className="text-sky-700">Carbs: {rcp.carbsG}g</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* "الحقيقة أو الدايت؟" Interactive Accordion */}
        <div className="space-y-4 lg:col-span-7">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
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
                      className={`h-4 w-4 shrink-0 text-amber-600 transition-transform ${
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
        {/* Free E-Book Lead Magnet */}
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800">
            <BookOpen className="h-4 w-4 text-amber-600" />
            {isAr ? 'هدية مجانية للزوار' : 'FREE TRAINING E-BOOK'}
          </div>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            {isAr
              ? 'حمل مجاناً كتاب "الدليل الشامل لاحتراف التمرين بدون إصابات"'
              : 'Download "The Complete Injury-Free Hypertrophy Guide" For Free'}
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            {isAr
              ? 'أدخل بريدك الإلكتروني ليستقبلك رابط التحميل المباشر مع جدول تمارين مجاني للمبتدئين والمتقدمين.'
              : 'Enter your email to receive the instant PDF guide written by our physical therapy & coaching team.'}
          </p>
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              value={ebookEmail}
              onChange={(e) => setEbookEmail(e.target.value)}
              placeholder={isAr ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900"
            />
            <button
              type="button"
              onClick={() => {
                showToast(
                  isAr
                    ? '📘 تم إرسال كتاب "الدليل الشامل للتمرين بدون إصابات" إلى بريدك الإلكتروني!'
                    : '📘 Sent the Free Hypertrophy & Injury-Prevention E-Book to your email!',
                );
                setEbookEmail('');
              }}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white hover:bg-slate-800"
            >
              {isAr ? 'أرسل لي الكتاب' : 'Send E-Book'}
            </button>
          </div>
        </div>

        {/* B2B SaaS Callout: Are you a Gym Owner or Coach wanting this platform? */}
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            {isAr
              ? 'لأصحاب الجيمات والمدربين (B2B SaaS White-Label)'
              : 'FOR GYM OWNERS & ONLINE COACHES'}
          </div>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            {isAr
              ? 'هل أنت صاحب جيم أو مدرب أونلاين؟ امتلك منصتك الخاصة باسمك وشعارك!'
              : 'Own a Gym or Coaching Brand? Launch Your White-Label SaaS Platform in 60 Seconds'}
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            {isAr
              ? 'احصل على نسخة كاملة بهويتك البصرية (White-Label) تشمل صفحة المتدربين، تطبيق العضو، بوابات الدخول بالـ QR، والربط مع فوري وإنستاباي و Paymob.'
              : 'Get your own public coaching storefront, member PWA, QR turnstile engine, and Egypt payment gateways.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSwitchToSaaSPricing}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700"
            >
              {isAr
                ? 'استعرض باقات شراء المنصة (SaaS) ←'
                : 'View SaaS Licensing & White-Label Plans →'}
            </button>
            <button
              type="button"
              onClick={onSwitchToDashboard}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              {isAr ? 'معاينة لوحة تحكم الإدارة' : 'Explore Admin ERP'}
            </button>
          </div>
        </div>
      </div>

      {/* INSTANT CHECKOUT MODAL FOR VISITORS */}
      {selectedTierForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-extrabold text-amber-600">
                  {isAr ? 'إتمام الاشتراك الفوري وتفعيل التطبيق' : 'INSTANT ENROLLMENT & CHECKOUT'}
                </span>
                <h3 className="text-lg font-black">
                  {isAr ? selectedTierForCheckout.nameAr : selectedTierForCheckout.nameEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTierForCheckout(null)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubscription} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700">
                  {isAr ? 'الاسم بالكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={subscriberName}
                  onChange={(e) => setSubscriberName(e.target.value)}
                  placeholder={isAr ? 'مثال: محمد طارق' : 'e.g. Mohamed Tarek'}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">
                  {isAr ? 'رقم الموبايل (واتساب للمتابعة اليومية)' : 'WhatsApp Phone Number'}
                </label>
                <input
                  type="text"
                  required
                  value={subscriberPhone}
                  onChange={(e) => setSubscriberPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">
                  {isAr ? 'هدفك الأساسي من الاشتراك' : 'Your Transformation Goal'}
                </label>
                <input
                  type="text"
                  value={subscriberGoal}
                  onChange={(e) => setSubscriberGoal(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">
                  {isAr ? 'اختر وسيلة الدفع المفضلة' : 'Select Payment Method'}
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {[
                    { id: 'INSTAPAY', label: 'InstaPay (إنستاباي)' },
                    { id: 'PAYMOB_CARD', label: 'Visa / MasterCard (Paymob)' },
                    { id: 'VODAFONE_CASH', label: 'Vodafone Cash (فودافون كاش)' },
                    { id: 'FAWRY', label: 'Fawry (كود فوري)' },
                  ].map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setSelectedGateway(gw.id as typeof selectedGateway)}
                      className={`rounded-xl border px-3 py-2.5 font-extrabold transition ${
                        selectedGateway === gw.id
                          ? 'border-amber-500 bg-amber-50 text-amber-900'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {gw.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-4">
                <span className="font-bold">
                  {isAr ? 'الإجمالي بعد خصم 50%:' : 'Total After 50% Discount:'}
                </span>
                <span className="font-mono text-xl font-black text-emerald-600">
                  {selectedTierForCheckout.priceEgp.toLocaleString()} EGP
                </span>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-[#D4AF37] py-3.5 text-sm font-black text-slate-950 shadow-lg"
              >
                {isAr
                  ? 'تأكيد الاشتراك وتفعيل حساب المتدرب فوراً'
                  : 'Confirm Subscription & Activate Member App'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
