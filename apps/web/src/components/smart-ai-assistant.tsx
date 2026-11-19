'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bot,
  Building2,
  Compass,
  CreditCard,
  Crown,
  Database,
  Dumbbell,
  HeartPulse,
  Lock,
  Send,
  Sparkles,
  UserPlus,
  Utensils,
  Video,
  X,
} from 'lucide-react';
import {
  usePlatformStore,
  SAAS_SUBSCRIPTION_PLANS,
  type WorkspaceSection,
  type MemberItem,
  type PlanItem,
  type InvoiceItem,
  type ClassSessionItem,
  type StaffMemberItem,
  type BranchItem,
} from '../lib/platform-store';

interface AssistantReply {
  id: string;
  sender: 'AI' | 'USER';
  textAr: string;
  textEn: string;
  actionSection?: WorkspaceSection;
  actionScrollId?: string;
  actionLabelAr?: string;
  actionLabelEn?: string;
  highlightsAr?: string[];
  highlightsEn?: string[];
  followUpAr?: string;
  followUpEn?: string;
  disclaimerAr?: string;
  disclaimerEn?: string;
}

interface ConversationMemory {
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  gender: 'MALE' | 'FEMALE' | null;
  goal: 'CUT' | 'BULK' | 'RECOMP' | null;
  daysPerWeek: number | null;
  place: 'GYM' | 'HOME' | null;
  activityLevel: 'SEDENTARY' | 'MODERATE' | 'ACTIVE' | null;
}

interface LivePlatformContext {
  gymNameAr: string;
  gymNameEn: string;
  members: MemberItem[];
  plans: PlanItem[];
  invoices: InvoiceItem[];
  classes: ClassSessionItem[];
  staff: StaffMemberItem[];
  branches: BranchItem[];
  customWorkoutsCount: number;
  customRecipesCount: number;
}

const AI_DISCLAIMER_AR =
  '⚠️ ملاحظة: أنا مساعد ذكي (AI Gym Coach & Clinical Nutritionist) وممكن أغلط زي أي ذكاء اصطناعي آخر — المعلومات هنا استرشادية ولا تغني عن استشارة الطبيب أو المختص.';
const AI_DISCLAIMER_EN =
  '⚠️ Note: I am an AI Gym Coach & Nutritionist and can make mistakes like any AI — always verify critical health decisions with a qualified professional.';

/**
 * Normalize Eastern Arabic digits (٠-٩) to Western digits (0-9) and unify Arabic characters
 */
function normalizeArabicText(raw: string): string {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  let out = raw;
  for (let i = 0; i < 10; i++) {
    out = out.replace(new RegExp(arabicDigits.charAt(i), 'g'), String(i));
  }
  return out
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();
}

/**
 * Extracts cumulative user context (weight, height, age, gender, goal, training days, home vs gym)
 * from the entire conversation history so follow-up turns work like ChatGPT / Claude.
 */
function extractConversationMemory(history: AssistantReply[], latestQuery: string): ConversationMemory {
  const mem: ConversationMemory = {
    weightKg: null,
    heightCm: null,
    age: null,
    gender: null,
    goal: null,
    daysPerWeek: null,
    place: null,
    activityLevel: null,
  };

  const userTexts = [
    ...history.filter((m) => m.sender === 'USER').map((m) => m.textAr),
    latestQuery,
  ];

  for (const raw of userTexts) {
    const t = normalizeArabicText(raw);

    // Weight extraction (e.g., "وزني 95", "95 كيلو", "95kg", "95 كجم")
    const explicitWeight =
      t.match(/(?:وزني|وزن)\s*(\d{2,3})/) ||
      t.match(/(\d{2,3})\s*(?:كيلو|كجم|كغ|kg)/);
    if (explicitWeight) {
      const w = Number(explicitWeight[1]);
      if (w >= 35 && w <= 220) mem.weightKg = w;
    }

    // Height extraction (e.g., "طولي 175", "175 سم", "175cm")
    const explicitHeight =
      t.match(/(?:طولي|طول)\s*(\d{3})/) ||
      t.match(/(\d{3})\s*(?:سم|سنتي|cm)/);
    if (explicitHeight) {
      const h = Number(explicitHeight[1]);
      if (h >= 130 && h <= 225) mem.heightCm = h;
    }

    // Age extraction (e.g., "سني 25", "عمري 28", "25 سنه")
    const explicitAge =
      t.match(/(?:سني|عمري)\s*(\d{2})/) ||
      t.match(/(\d{2})\s*(?:سنه|عام)/);
    if (explicitAge) {
      const a = Number(explicitAge[1]);
      if (a >= 14 && a <= 85) mem.age = a;
    }

    // Gender extraction
    if (t.includes('بنت') || t.includes('انثي') || t.includes('سيده') || t.includes('female') || t.includes('woman')) {
      mem.gender = 'FEMALE';
    } else if (t.includes('شاب') || t.includes('رجل') || t.includes('ذكر') || t.includes('male')) {
      mem.gender = 'MALE';
    }

    // Goal extraction
    if (
      t.includes('اخس') ||
      t.includes('تخسيس') ||
      t.includes('تنشيف') ||
      t.includes('حرق') ||
      t.includes('دهون') ||
      t.includes('كرش') ||
      t.includes('انزل وزن') ||
      t.includes('وزني زايد') ||
      t.includes('خساره') ||
      t.includes('cut') ||
      t.includes('lose')
    ) {
      mem.goal = 'CUT';
    } else if (
      t.includes('تضخيم') ||
      t.includes('ضخامه') ||
      t.includes('ازيد') ||
      t.includes('زياده وزن') ||
      t.includes('نحافه') ||
      t.includes('رفيع') ||
      t.includes('بناء عضل') ||
      t.includes('bulk') ||
      t.includes('gain')
    ) {
      mem.goal = 'BULK';
    } else if (t.includes('نحت') || t.includes('شد الجسم') || t.includes('recomp')) {
      mem.goal = 'RECOMP';
    }

    // Training days per week (e.g. "3 ايام", "4 ايام")
    const daysMatch = t.match(/([2-6])\s*(?:ايام|يوم|days)/);
    if (daysMatch) {
      mem.daysPerWeek = Number(daysMatch[1]);
    }

    // Place (Home vs Gym)
    if (t.includes('في البيت') || t.includes('منزل') || t.includes('بدون جيم') || t.includes('home')) {
      mem.place = 'HOME';
    } else if (t.includes('في الجيم') || t.includes('نادي') || t.includes('gym')) {
      mem.place = 'GYM';
    }
  }

  return mem;
}

/**
 * Calculates scientific Mifflin-St Jeor BMR & TDEE + exact Macro split (4P + 4C + 9F)
 */
function calculateScientificMacros(mem: ConversationMemory) {
  const w = mem.weightKg || 82;
  const h = mem.heightCm || 174;
  const age = mem.age || 27;
  const isFemale = mem.gender === 'FEMALE';

  // Mifflin-St Jeor Equation
  const bmr = Math.round(10 * w + 6.25 * h - 5 * age + (isFemale ? -161 : 5));
  const multiplier = mem.daysPerWeek && mem.daysPerWeek >= 5 ? 1.6 : mem.daysPerWeek && mem.daysPerWeek >= 3 ? 1.48 : 1.38;
  const tdee = Math.round(bmr * multiplier);

  const goal = mem.goal || 'CUT';
  let targetKcal = tdee;
  if (goal === 'CUT') targetKcal = Math.max(1350, tdee - 500);
  else if (goal === 'BULK') targetKcal = tdee + 380;
  else targetKcal = tdee - 150;

  const proteinG = Math.round(w * (goal === 'CUT' ? 2.1 : goal === 'BULK' ? 2.0 : 2.1));
  const fatsG = Math.round(w * (goal === 'CUT' ? 0.75 : 0.9));
  const carbsG = Math.max(85, Math.round((targetKcal - (proteinG * 4 + fatsG * 9)) / 4));
  const exactKcal = proteinG * 4 + carbsG * 4 + fatsG * 9;

  return { w, h, age, bmr, tdee, exactKcal, proteinG, carbsG, fatsG, goal };
}

/**
 * Quick topic chips categorized for Trainees & Coaches
 */
const TRAINEE_COACH_TOPICS: Array<{
  id: string;
  category: 'COACH' | 'NUTRITION';
  labelAr: string;
  labelEn: string;
  queryAr: string;
}> = [
  {
    id: 'full-plan-8w',
    category: 'COACH',
    labelAr: '🔥 خطة 8 أسابيع كاملة (تمرين + دايت)',
    labelEn: '🔥 Complete 8-Week Transformation Plan',
    queryAr: 'عايز خطة واضحة وكاملة لمدة 8 أسابيع للتمرين والدايت والكاردو',
  },
  {
    id: 'ppl-split',
    category: 'COACH',
    labelAr: '🏋️‍♂️ جدول Push / Pull / Legs بالعدات والراحة',
    labelEn: '🏋️‍♂️ Pro Push / Pull / Legs Split',
    queryAr: 'اعمل لي جدول تمارين Push Pull Legs كامل بالمجموعات والعدات وفترات الراحة',
  },
  {
    id: 'joint-injury',
    category: 'COACH',
    labelAr: '🦴 بدائل آمنة للركبة وأسفل الظهر والكتف',
    labelEn: '🦴 Joint-Safe Injury Substitutions',
    queryAr: 'عندي ألم في الركبة أو القطنية أو الكتف، إيه البدائل التشريحية الآمنة في التمرين؟',
  },
  {
    id: 'macros-diet',
    category: 'NUTRITION',
    labelAr: '🥗 حساب BMR/TDEE وجدول 4 وجبات بالميزان',
    labelEn: '🥗 BMR/TDEE & 4-Meal Egyptian Diet',
    queryAr: 'احسب لي سعراتي والماكروز بمعادلة Mifflin-St Jeor مع جدول 4 وجبات مصرية بالجرامات',
  },
  {
    id: 'food-swaps',
    category: 'NUTRITION',
    labelAr: '🔄 بدائل الأكل الاقتصادية (بروتين وكارب)',
    labelEn: '🔄 Budget-Friendly Food Swaps',
    queryAr: 'إيه بدائل البروتين والنشويات الاقتصادية بنفس الجرامات والسعرات؟',
  },
  {
    id: 'supplements-guide',
    category: 'NUTRITION',
    labelAr: '⚡ دليل المكملات (كرياتين + واي + فيتامينات)',
    labelEn: '⚡ Evidence-Based Supplement Protocol',
    queryAr: 'اشرح لي جرعات ومواعيد الكرياتين والواي بروتين والكافيين والفيتامينات علمياً',
  },
];

const OWNER_QUICK_TOPICS: Array<{
  id: string;
  labelAr: string;
  labelEn: string;
  queryAr: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'live-gym-report',
    labelAr: '📊 ملخص الجيم اللحظي (الأعضاء والإيرادات)',
    labelEn: '📊 Live Gym Summary (Members & Revenue)',
    queryAr: 'اعرض لي تقرير وملخص الجيم اللحظي وعدد المشتركين والفواتير والمدربين',
    icon: BarChart3,
  },
  {
    id: 'platform-full-guide',
    labelAr: '🧭 شرح كل أقسام المنصة بالتفصيل',
    labelEn: '🧭 Full Platform Capabilities Guide',
    queryAr: 'اشرح لي كل أقسام وإمكانيات المنصة بالتفصيل وإزاي أستفيد منها كمدرب أو صاحب جيم',
    icon: Compass,
  },
  {
    id: 'branches-guide',
    labelAr: '🏢 إضافة وإدارة فروع الجيم الخاصة بي',
    labelEn: '🏢 Create & Manage My Gym Branches',
    queryAr: 'إزاي أضيف فروع الجيم الخاصة بيا وأتحكم في كل فرع؟',
    icon: Building2,
  },
  {
    id: 'upload-media',
    labelAr: '🎬 رفع فيديو تمرين أو وصفة أو ملف PDF',
    labelEn: '🎬 Upload videos, recipes & PDFs',
    queryAr: 'إزاي أرفع فيديو تمرين أو وصفة غذائية أو ملف PDF للمتدربين؟',
    icon: Video,
  },
  {
    id: 'add-member-qr',
    labelAr: '👤 إضافة متدرب واستخراج الباسورد والـ QR',
    labelEn: '👤 Add member & generate QR + password',
    queryAr: 'إزاي أضيف متدرب جديد في الجيم وأطلعله الباسورد والـ QR Code الخاص بيه؟',
    icon: UserPlus,
  },
  {
    id: 'payment-gateways',
    labelAr: '💳 بوابات الدفع المصرية والفواتير',
    labelEn: '💳 Egyptian Payment Gateways & VAT',
    queryAr: 'إزاي بتشتغل بوابات الدفع المصرية والفواتير الضريبية في المنصة؟',
    icon: CreditCard,
  },
];

/**
 * Quick topic chips strictly for Public / Free Visitors (Specific limited tasks)
 */
const FREE_VISITOR_TOPICS: Array<{
  id: string;
  labelAr: string;
  labelEn: string;
  queryAr: string;
}> = [
  {
    id: 'visitor-plans',
    labelAr: '💎 مقارنة الباقات والفرق بين Starter و Pro + AI',
    labelEn: '💎 Compare Starter vs Pro + AI Plans',
    queryAr: 'إيه الفرق بين باقة Starter وباقة Pro + AI وباقة Enterprise والأسعار؟',
  },
  {
    id: 'visitor-quick-kcal',
    labelAr: '🥗 تقدير سريع لسعراتي اليومية',
    labelEn: '🥗 Quick Calorie Estimate',
    queryAr: 'عايز تقدير سريع لسعراتي اليومية',
  },
  {
    id: 'visitor-free-trial',
    labelAr: '🎁 افتح خطة الـ ٧ أيام المجانية',
    labelEn: '🎁 Explore Free 7-Day Trial Hub',
    queryAr: 'إزاي أجرب التمارين والدايت المجاني الـ 7 أيام في المنصة؟',
  },
  {
    id: 'visitor-subscribe',
    labelAr: '💳 طريقة الاشتراك والدفع (إنستاباي / فودافون كاش)',
    labelEn: '💳 How to Subscribe via InstaPay / Vodafone Cash',
    queryAr: 'إزاي أشترك في المنصة وأدفع عبر إنستاباي أو فودافون كاش؟',
  },
];

/**
 * Scoped Free Visitor AI Engine (Specific public tasks only — Pro Coaching,
 * Clinical Nutritionist Meal Plans, Injury Rehab & Live CRM remain exclusive to Pro/Enterprise)
 */
function buildPublicFreeVisitorReply(
  query: string,
  history: AssistantReply[],
): Omit<AssistantReply, 'id' | 'sender'> {
  const q = normalizeArabicText(query);
  const mem = extractConversationMemory(history, query);

  // Greeting for Free Visitor AI
  const isPureGreeting =
    /^(السلام عليكم|سلام عليكم|وعليكم السلام|اهلا|مرحبا|صباح الخير|مساء الخير|ازيك|عامل ايه|اخبارك|هاي|هلا|hello|hi|hey)/.test(
      q,
    ) && q.split(/\s+/).length <= 7;

  if (isPureGreeting) {
    return {
      textAr:
        'أهلاً بك في **المساعد المجاني للزوار (TitanFit Free AI)** 👋✨!\nأنا هنا لمساعدتك في **مهام محددة للزوار**: شرح باقات المنصة، إعطاؤك تقدير مبدئي سريع للسعرات، وتوجيهك للتجربة المجانية الـ ٧ أيام. (أما **كوتش الجيم المحترف + أخصائي التغذية بالجرامات + بدائل الإصابات** فهي متاحة حصرياً للمشتركين في باقة **Pro + AI** والأحدث!).',
      textEn:
        'Welcome to **TitanFit Free Visitor AI** 👋✨! I handle specific visitor tasks: explaining plans & pricing, quick calorie estimates, and guiding you to our Free 7-Day Trial. (Full Pro Gym Coach, gram-measured meal plans & injury rehab are unlocked in **Pro + AI**!).',
      highlightsAr: [
        '💎 **مقارنة الباقات:** اسألني عن الفرق بين باقة Starter (950 ج.م بدون AI) وباقة Pro + AI (1,950 ج.م شاملة الذكاء الاصطناعي الكامل).',
        '🥗 **تقدير سريع للسعرات:** قولي وزنك فقط وهقولك تقدير سعراتك اليومية التقريبي.',
        '🎁 **التجربة المجانية:** تقدر تستكشف قسم «جرب مجاناً» (٧ أيام تمارين وأنظمة مجانية).',
      ],
      highlightsEn: [
        '💎 Compare Plans: Starter (950 EGP, no AI) vs Pro + AI (1,950 EGP, full AI Coach & Nutritionist).',
        '🥗 Quick Calorie Estimate: Share your weight for a quick daily estimate.',
        '🎁 Free 7-Day Trial: Explore our free starter workout & diet hub.',
      ],
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // Task 1: Plans, Pricing, AI differences & Subscription
  if (
    q.includes('باقه') ||
    q.includes('باقات') ||
    q.includes('سعر') && (q.includes('اشتراك') || q.includes('باقه') || q.includes('starter') || q.includes('pro')) ||
    q.includes('starter') ||
    q.includes('pro') ||
    q.includes('enterprise') ||
    q.includes('انستاباي') ||
    q.includes('فودافون') ||
    q.includes('اشترك') ||
    q.includes('دفع')
  ) {
    return {
      textAr:
        '💎 **مقارنة باقات منصة TitanFit وطريقة الاشتراك:**\nنقدم ٣ باقات شهرية وسنوية مرنة للأندية والمدربين (الدفع عبر إنستاباي أو فودافون كاش على الرقم `01002169889` مع مراجعة الإيصال وتفعيل الحساب فوراً):',
      textEn:
        '💎 **TitanFit SaaS Plans & Subscription Guide:**\nWe offer 3 tiers (payable via InstaPay or Vodafone Cash to `01002169889`):',
      highlightsAr: [
        '1️⃣ **باقة البداية (Starter — 950 ج.م/شهر):** مثالية للجيم الصغير (حتى 150 مشترك و 2 مدربين) — إدارة الأعضاء بالـ QR والباقات والفواتير **بدون الذكاء الاصطناعي (No AI)**.',
        '2️⃣ **باقة النمو الاحترافي (Pro + AI — 1,950 ج.م/شهر — الأكثر طلباً):** حتى 600 مشترك و 8 مدربين + **تفعيل كامل للذكاء الاصطناعي (كوتش جيم محترف + أخصائي تغذية بالجرامات + خبير المنصة والـ CRM)** + الحصص وبوابات الدخول والعمولات.',
        '3️⃣ **باقة النخبة (Enterprise — 3,450 ج.م/شهر):** مشتركين ومدربين غير محدودين + **باقة AI الكاملة + VIP** + تطبيق المتدرب White-Label + تقارير BI واستوديو الفيديو.',
        '🏢 **ملاحظة الفروع:** كل جيم مشترك يضيف ويدير فروعه الخاصة به فقط من الإعدادات.',
      ],
      highlightsEn: [
        '1️⃣ **Starter (950 EGP/mo):** Up to 150 members & 2 trainers, core CRM & billing, No AI.',
        '2️⃣ **Pro + AI (1,950 EGP/mo):** Up to 600 members & 8 trainers + Full Pro AI Coach, Sports Nutritionist & Live CRM AI.',
        '3️⃣ **Enterprise (3,450 EGP/mo):** Unlimited scale + Full VIP AI Suite + White-Label PWA.',
      ],
      actionSection: 'PUBLIC_STOREFRONT',
      actionScrollId: 'saas-pricing-section',
      actionLabelAr: '💎 انتقل لجدول الباقات واختر باقتك الآن',
      actionLabelEn: '💎 View Pricing Plans & Subscribe Now',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // Task 2: Free 7-Day Trial Hub guide
  if (
    q.includes('مجاني') ||
    q.includes('7 ايام') ||
    q.includes('٧ ايام') ||
    q.includes('تجربه') ||
    q.includes('free trial')
  ) {
    return {
      textAr:
        '🎁 **التجربة المجانية (خطة الـ ٧ أيام):**\nيمكنك الآن تجربة ٧ أيام كاملة من الفيديوهات التدريبية والأنظمة الغذائية العامة مجاناً داخل قسم **«تمارين فيديو وأنظمة مجانية»** قبل الاشتراك!',
      textEn:
        '🎁 **Free 7-Day Trial Hub:**\nYou can explore 7 days of starter workout videos and general nutrition templates right away!',
      highlightsAr: [
        '🎬 فيديوهات تمارين مشروحة بالحركة التشريحية.',
        '🧮 حاسبة السعرات المجانية في الصفحة الرئيسية.',
        '🔒 للحصول على خطط مخصصة بالجرامات ومتابعة كوتش AI شخصي 24/7، اشترك في باقة **Pro + AI**.',
      ],
      actionSection: 'FREE_TRIAL_HUB',
      actionLabelAr: '🎁 افتح قسم التجربة المجانية (٧ أيام) الآن',
      actionLabelEn: '🎁 Open Free 7-Day Trial Hub Now',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // Task 3: Quick basic calorie estimate (WITHOUT Pro meal plans / swaps / macros breakdown)
  if (
    mem.weightKg ||
    q.includes('سعر') ||
    q.includes('كالوري') ||
    q.includes('وزني') ||
    q.includes('اخس') ||
    q.includes('تخسيس')
  ) {
    const w = mem.weightKg || 80;
    const estCut = Math.round(w * 23);
    const estMaint = Math.round(w * 30);
    return {
      textAr: `🥗 **تقدير مبدئي سريع للزوار (لوزن ~${w} كجم):**\n• سعرات الثبات التقريبية: **~${estMaint} سعرة/يوم**\n• سعرات النزول التقريبية: **~${estCut} سعرة/يوم**`,
      textEn: `🥗 **Quick Visitor Estimate (~${w}kg):** Maintenance ~${estMaint} kcal/day | Fat-loss ~${estCut} kcal/day.`,
      highlightsAr: [
        '💡 يمكنك استخدام **حاسبة السعرات المجانية** أسفل الصفحة لحساب وزنك وطولك بالتفصيل.',
        '🔒 **مميزات باقة Pro + AI فقط:** حساب Mifflin-St Jeor الدقيق، جدول ٤-٥ وجبات مصرية بالجرامات، بدائل الأكل الاقتصادية، وجدول تمرين Push/Pull/Legs كامل مع بدائل إصابات المفاصل!',
      ],
      highlightsEn: [
        '💡 Use our free on-page Calorie Calculator for your exact stats.',
        '🔒 Pro + AI Exclusive: Gram-accurate 4-5 meal Egyptian diet plans, budget food swaps, and full Pro Gym Coach splits.',
      ],
      actionSection: 'PUBLIC_STOREFRONT',
      actionScrollId: 'saas-pricing-section',
      actionLabelAr: '👑 اشترك في باقة Pro + AI لتفعيل أخصائي التغذية الكامل',
      actionLabelEn: '👑 Upgrade to Pro + AI for Full Nutritionist',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // Pro-Only Gate for advanced coaching, diet tables, injuries, supplements, or live CRM
  const asksProOnly =
    q.includes('خطه') ||
    q.includes('جدول') ||
    q.includes('تمرين') ||
    q.includes('تمارين') ||
    q.includes('دايت') ||
    q.includes('وجب') ||
    q.includes('بديل') ||
    q.includes('اصاب') ||
    q.includes('ركب') ||
    q.includes('قطنيه') ||
    q.includes('مكمل') ||
    q.includes('كرياتين') ||
    q.includes('تقرير') ||
    q.includes('مشترك') ||
    q.includes('workout') ||
    q.includes('diet') ||
    q.includes('plan');

  if (asksProOnly) {
    return {
      textAr:
        '🔒 **هذه الميزة متقدمة وحصرية لنسخة الذكاء الاصطناعي الاحترافية (Pro + AI) والأحدث!**\nأنت تستخدم الآن **المساعد المجاني للزوار** والمخصص فقط لـ:\n1) شرح باقات المنصة وطريقة الاشتراك\n2) تقدير مبدئي سريع للسعرات\n3) توجيهك للتجربة المجانية الـ ٧ أيام.',
      textEn:
        '🔒 **This advanced capability is exclusive to the Pro + AI and Enterprise editions!**\nThe Free Visitor AI is scoped to platform pricing tour, quick calorie estimates, and Free 7-Day Trial guidance.',
      highlightsAr: [
        '🏋️‍♂️ **متاح في Pro + AI:** تصميم جداول التمارين الكاملة (PPL / Upper-Lower) + بدائل إصابات الركبة والظهر والكتف.',
        '🥗 **متاح في Pro + AI:** جداول ٤-٥ وجبات مصرية بالجرامات + بدائل الأكل الاقتصادية + بروتوكول المكملات.',
        '📊 **متاح في Pro + AI:** تحليل بيانات الجيم لحظياً والبحث عن المشتركين والتوجيه الذكي لكل أقسام المنصة.',
      ],
      actionSection: 'PUBLIC_STOREFRONT',
      actionScrollId: 'saas-pricing-section',
      actionLabelAr: '⚡ فعّل النسخة الاحترافية الآن مع باقة Pro + AI',
      actionLabelEn: '⚡ Unlock Pro + AI Now',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  return {
    textAr:
      '👋 أهلاً بك في **المساعد المجاني للزوار (TitanFit Free AI)**!\nمهامي هنا محددة لمساعدتك في التعرف على المنصة قبل الاشتراك:',
    textEn:
      '👋 Welcome to **TitanFit Free Visitor AI**! Here are the specific visitor tasks I can help you with:',
    highlightsAr: [
      '💎 اسألني عن **الفرق بين باقة Starter و Pro + AI و Enterprise** والأسعار.',
      '🥗 اكتبلي **وزنك** عشان أديلك تقدير مبدئي سريع للسعرات.',
      '💳 اسألني عن **طريقة الاشتراك والدفع عبر إنستاباي وفودافون كاش**.',
      '👑 ملاحظة: الكوتش الذكي المتكامل وأخصائي التغذية بالجرامات متاحان حصرياً في باقة **Pro + AI** والأحدث.',
    ],
    actionSection: 'PUBLIC_STOREFRONT',
    actionScrollId: 'saas-pricing-section',
    actionLabelAr: '💎 استعرض باقات Pro + AI الآن',
    actionLabelEn: '💎 View Pro + AI Plans',
    disclaimerAr: AI_DISCLAIMER_AR,
    disclaimerEn: AI_DISCLAIMER_EN,
  };
}

/**
 * Context-Aware Multi-Turn Conversational AI Engine (Pro Gym Coach + Clinical Nutritionist + Live Platform Intelligence)
 */
function buildSmartReply(
  query: string,
  history: AssistantReply[],
  isGymOwnerAccount: boolean,
  liveCtx: LivePlatformContext,
): Omit<AssistantReply, 'id' | 'sender'> {
  const q = normalizeArabicText(query);
  const mem = extractConversationMemory(history, query);

  // =========================================================================
  // 0. LIVE GYM DATA & MEMBER LOOKUP (Understands live store state in detail!)
  // =========================================================================
  const matchedMember = liveCtx.members.find((m) => {
    const nameAr = normalizeArabicText(m.fullNameAr);
    const nameEn = normalizeArabicText(m.fullNameEn);
    const code = normalizeArabicText(m.code);
    return (
      (nameAr.length > 3 && q.includes(nameAr)) ||
      (nameEn.length > 3 && q.includes(nameEn)) ||
      (code.length > 3 && q.includes(code))
    );
  });

  if (matchedMember && isGymOwnerAccount) {
    const medicalSummary = [matchedMember.medicalConditions, matchedMember.injuries]
      .filter((x) => x && x !== 'None' && x !== 'لا يوجد')
      .join(' • ');
    return {
      textAr: `📋 **بيانات المشترك في قاعدة بيانات ${liveCtx.gymNameAr}:**\n• الاسم: **${matchedMember.fullNameAr}** (${matchedMember.code})\n• الباقة: **${matchedMember.planNameAr}** — الحالة: **${matchedMember.status === 'ACTIVE' ? 'نشط ✅' : matchedMember.status === 'FROZEN' ? 'مجمد ❄️' : 'منتهي ⚠️'}**\n• تاريخ الانتهاء: **${matchedMember.endDate}** (أيام التجميد المتبقية: ${matchedMember.freezeDaysRemaining} يوم)\n• الهاتف: ${matchedMember.phone}\n• الملاحظات الطبية والإصابات: ${medicalSummary || 'لا توجد موانع طبية مسجلة'}`,
      textEn: `📋 **Live Member Profile (${liveCtx.gymNameEn}):**\n• Name: **${matchedMember.fullNameEn}** (${matchedMember.code})\n• Plan: **${matchedMember.planNameEn}** — Status: **${matchedMember.status}**\n• End Date: **${matchedMember.endDate}**`,
      highlightsAr: [
        `💡 نصيحة الكوتش الذكي لهذا المتدرب: ${
          medicalSummary
            ? `انتبه للملاحظة الطبية (${medicalSummary}) وتجنب التحميل المباشر على المفصل المصاب.`
            : 'المتدرب جاهز لتطبيق التدرج في الأحمال (Progressive Overload) ومتابعة القياسات أسبوعياً.'
        }`,
        matchedMember.status === 'EXPIRING_SOON' || matchedMember.status === 'EXPIRED'
          ? '⚠️ تنبيه CRM: اشتراك هذا العضو ينتهي قريباً أو منتهي! يفضل التواصل معه لتجديد الباقة.'
          : '✅ اشتراك العضو ساري ومنتظم.',
      ],
      actionSection: 'MEMBERS',
      actionLabelAr: '👥 فتح ملف المتدرب الكامل في إدارة الأعضاء (CRM)',
      actionLabelEn: '👥 Open Member Profile in CRM',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  if (
    isGymOwnerAccount &&
    (q.includes('تقرير الجيم') ||
      q.includes('ملخص الجيم') ||
      q.includes('ملخص النادي') ||
      q.includes('احصائيات') ||
      q.includes('كام مشترك') ||
      q.includes('عدد المشتركين') ||
      q.includes('ايرادات') ||
      q.includes('live summary'))
  ) {
    const activeMembers = liveCtx.members.filter((m) => m.status === 'ACTIVE').length;
    const frozenMembers = liveCtx.members.filter((m) => m.status === 'FROZEN').length;
    const expiredMembers = liveCtx.members.filter((m) => m.status === 'EXPIRED' || m.status === 'EXPIRING_SOON').length;
    const paidRevenue = liveCtx.invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((acc, inv) => acc + inv.totalEgp, 0);
    const branchesList =
      liveCtx.branches.length > 0
        ? liveCtx.branches.map((b) => b.nameAr).join(' ، ')
        : 'لم تضف فروعاً فرعية بعد (تعمل حالياً بالمركز الرئيسي — يمكنك إضافة فروعك من الإعدادات)';

    return {
      textAr: `📊 **التقرير اللحظي المباشر لناديك (${liveCtx.gymNameAr}):**\nأنا متصل مباشرة بقاعدة بيانات ناديك المعزولة، ودي أحدث الأرقام اللحظية عندك دلوقتي:`,
      textEn: `📊 **Live Operational Intelligence for ${liveCtx.gymNameEn}:**`,
      highlightsAr: [
        `👥 إجمالي المشتركين المسجلين: **${liveCtx.members.length} مشترك** (${activeMembers} نشط ✅ • ${frozenMembers} مجمد ❄️ • ${expiredMembers} يحتاج تجديد ⚠️).`,
        `💰 إجمالي الفواتير المحصلة (شامل الضريبة): **${paidRevenue.toLocaleString('en-US')} ج.م** عبر (${liveCtx.invoices.length} فاتورة مسجلة).`,
        `🏷️ باقات العضوية المفعلة: **${liveCtx.plans.length} باقات** | 🏋️‍♂️ الحصص التدريبية بجدول الحجز: **${liveCtx.classes.length} حصص** | 👨‍🏫 طاقم المدربين: **${liveCtx.staff.length} مدربين**.`,
        `🏢 فروع ناديك الخاصة: **${liveCtx.branches.length} فرع** (${branchesList}).`,
        `🎬 مكتبة ناديك التدريبية: **${liveCtx.customWorkoutsCount} فيديو تمرين** و **${liveCtx.customRecipesCount} وصفة غذائية محسوبة الماكروز**.`,
      ],
      highlightsEn: [
        `👥 Total Members: ${liveCtx.members.length} (${activeMembers} Active, ${frozenMembers} Frozen, ${expiredMembers} Expiring/Expired).`,
        `💰 Total Collected Revenue: ${paidRevenue.toLocaleString('en-US')} EGP across ${liveCtx.invoices.length} invoices.`,
        `🏢 Custom Gym Branches: ${liveCtx.branches.length} branches.`,
      ],
      followUpAr:
        '💡 تقدر تكتبلي اسم أي مشترك عندك أو كود العضوية بتاعه وهطلعلك ملفه الطبي وحالة اشتراكه فوراً!',
      followUpEn:
        '💡 Type any member name or member code to inspect their live profile and medical notes!',
      actionSection: 'OVERVIEW',
      actionLabelAr: '📊 الذهاب إلى لوحة القيادة الرئيسية للجيم',
      actionLabelEn: '📊 Go to Gym Executive Dashboard',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 1. FULL PLATFORM GUIDE & BRANCH MANAGEMENT QUERIES
  // =========================================================================
  if (
    q.includes('كل اقسام المنصه') ||
    q.includes('امكانيات المنصه') ||
    q.includes('فاهم كل حاجه') ||
    q.includes('اشرح لي المنصه') ||
    q.includes('دليل المنصه') ||
    q.includes('platform guide')
  ) {
    return {
      textAr:
        'أنا مبرمج ومربوط بكل تفصيلة وركن داخل منصة **TitanFit GymOS** 🧭🤖! سواء كنت **صاحب جيم / كوتش** أو **متدرب مشترك**، ده دليلك الشامل لكل أقسام المنصة وإزاي تستخدمها بأقصى احترافية:',
      textEn:
        'I am deeply integrated with every module of **TitanFit GymOS** 🧭🤖! Here is the complete breakdown of all platform sections:',
      highlightsAr: [
        '1️⃣ **لوحة القيادة (Overview) + التقارير (BI Reports):** متابعة الإيرادات اللحظية، صافي الربح، معدل الاحتفاظ بالمشتركين (Retention)، وأداء كل فرع.',
        '2️⃣ **إدارة المشتركين والملف الطبي (Members CRM):** تسجيل الأعضاء، توليد كود العضوية والباسورد ورمز QR تلقائياً، تجميد الاشتراكات (Freeze)، وتوثيق الإصابات والملاحظات الطبية.',
        '3️⃣ **باقات الجيم والمدفوعات (Subscriptions & Cashier):** إنشاء باقات ناديك (شهري / ٣ شهور / سنوي / PT) وتحصيل الفواتير عبر (إنستاباي، فودافون كاش، فوري، Paymob، أو كاش) مع ضريبة 14% VAT وإيصال PDF.',
        '4️⃣ **بوابات الدخول الذكية (Access Control) + الحصص (Classes):** مسح QR Code المشفر لمنع مشاركة الكارت (Anti-Passback)، وإدارة جدول الحصص الجماعية وقوائم الانتظار (Waitlists).',
        '5️⃣ **شؤون المدربين والعمولات (Staff & Trainers) + كاشير المكملات (POS):** حساب عمولات الكباتن والـ PT، وبيع المكملات والمشروبات مع خصم المخزون تلقائياً.',
        '6️⃣ **استوديو المحتوى (Content Library) + بوابة المتدرب (Member PWA):** رفع فيديوهات التمارين والوصفات الغذائية وملفات PDF، ومتابعة المتدرب لأوزانه (1RM PRs) والتحدث مع الكوتش شات لحظي.',
        '7️⃣ **إعدادات النادي والفروع المخصصة (Settings & Custom Branches):** كل جيم مشترك بيقدر يضيف فروعه الخاصة بيه فقط، ويخصص شعاره وألوانه وكود الجيم السري.',
      ],
      highlightsEn: [
        '1️⃣ Overview & BI Reports: Real-time MRR, retention cohorts, and revenue analytics.',
        '2️⃣ Members CRM & Medical Vault: Instant QR pass generation, freeze management, and injury tracking.',
        '3️⃣ Subscriptions & Egypt Cashier: InstaPay, Vodafone Cash, Fawry, Paymob, and 14% VAT PDF receipts.',
        '4️⃣ Access Control, Group Classes, Trainer Commissions, Supplement POS, Content Studio, Member PWA & Custom Branches.',
      ],
      followUpAr: '💡 قولي اسم أي قسم عايز تفتحه أو تسأل عن تفصيلة جواه وهوديك ليه بضغطة زر!',
      followUpEn: '💡 Ask about any specific module and I will guide you right to it!',
      ...(isGymOwnerAccount
        ? {
            actionSection: 'OVERVIEW' as WorkspaceSection,
            actionLabelAr: '🚀 افتح لوحة التحكم الشاملة الآن',
            actionLabelEn: '🚀 Open Main Dashboard Now',
          }
        : {}),
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  if (
    q.includes('فرع') ||
    q.includes('فروع') ||
    q.includes('اضيف فرع') ||
    q.includes('فروعي') ||
    q.includes('branch')
  ) {
    return {
      textAr:
        '🏢 **نظام الفروع المستقل لكل جيم (Per-Gym Custom Branches):**\nلما بتشترك في المنصة، ناديك بيبدأ نظيف تماماً بدون أي فروع وهمية! أنت كصاحب الجيم اللي بتضيف فروعك الحقيقية الخاصة بناديك فقط من قسم **«إعدادات النادي والفروع»**، وتقدر تضيف أو تعدل أو تحذف أي فرع في أي وقت.',
      textEn:
        '🏢 **Per-Gym Custom Branch Management:**\nEvery subscribed gym starts clean with zero pre-filled demo branches. You create, edit, and manage your own exclusive club branches in **Tenant Settings**.',
      highlightsAr: [
        'اضغط على «إعدادات النادي والباقة (Settings)» ثم انزل لقسم «إدارة فروع ناديك الخاصة».',
        'اضغط «+ إضافة فرع جديد لناديك» واكتب اسم الفرع، المدينة، العنوان، التليفون، ومواعيد العمل.',
        'بمجرد إضافة فرعك، هيظهر فوراً في القائمة الجانبية وفي شاشات تسجيل المشتركين وبوابات الدخول الخاصة بناديك فقط!',
      ],
      highlightsEn: [
        'Open Settings -> Custom Gym Branches Manager.',
        'Click "+ Add New Branch" to register your branch name, city, phone, and operating hours.',
        'Your branches are strictly isolated to your gym tenant.',
      ],
      actionSection: 'SETTINGS',
      actionLabelAr: '🏢 افتح إعدادات النادي لإضافة وإدارة فروعك الخاصة',
      actionLabelEn: '🏢 Open Settings to Manage Your Gym Branches',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  if (
    isGymOwnerAccount &&
    (q.includes('فيديو') ||
      q.includes('ملف') ||
      q.includes('pdf') ||
      q.includes('ارفع') ||
      q.includes('upload'))
  ) {
    return {
      textAr:
        'أهلاً بك يا كابتن! بصفتك صاحب الجيم، تقدر ترفع فيديوهات التمارين (ملف MP4 من جهازك أو رابط يوتيوب أو حركة تشريحية ثلاثية الأبعاد 3D) + الوصفات الغذائية المحسوبة + ملفات الـ PDF من قسم «استوديو رفع الفيديوهات والوصفات والملفات». أي محتوى بترفعُه هناك بيظهر فوراً لمتدربين ناديك فقط!',
      textEn:
        'As a Gym Owner, you can upload MP4 workout videos, YouTube links, 3D anatomical animations, macro-verified recipes, and PDF guides in the Gym Owner Media Studio.',
      highlightsAr: [
        'تبويب ١ (فيديوهات التمارين): ارفع ملف فيديو أو رابط يوتيوب أو اختر حركة تشريحية 3D وحدد المجموعات والعدات.',
        'تبويب ٢ (الوصفات الغذائية): اكتب البروتين والكارب والدهون وسيحسب النظام السعرات تلقائياً بمعادلة (4P + 4C + 9F).',
        'تبويب ٣ (ملفات الـ PDF): ارفع جداولك التدريبية والغذائية ليحملها المتدرب بضغطة زر.',
      ],
      highlightsEn: [
        'Tab 1: Upload MP4 video, paste YouTube URL, or select 3D biomechanical animation.',
        'Tab 2: Add recipes with automatic 4P + 4C + 9F calorie calculation.',
        'Tab 3: Upload downloadable PDF sheets and guides for trainees.',
      ],
      actionSection: 'CONTENT_LIBRARY',
      actionLabelAr: '🚀 افتح استوديو رفع الفيديوهات والوصفات والملفات الآن',
      actionLabelEn: '🚀 Open Media & Content Studio Now',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  if (
    isGymOwnerAccount &&
    (q.includes('داتابيز') ||
      q.includes('قاعده') ||
      q.includes('عزل') ||
      q.includes('معزول') ||
      q.includes('خاص بيه') ||
      q.includes('database') ||
      q.includes('tenant') ||
      q.includes('rls'))
  ) {
    return {
      textAr:
        'نظام TitanFit مبني بمعمارية Multi-Tenant مع عزل صارم لبيانات كل جيم (Per-Gym Isolated Database Partition): كل نادي يحصل على معرف مستقل (tenant_id / tenantSlug) محمي على مستوى قاعدة البيانات PostgreSQL بخاصية FORCE ROW LEVEL SECURITY (RLS) بالإضافة إلى عزل الفروع والأعضاء والفواتير لكل جيم، مع إمكانية دخول مالك المنصة (Super Admin) للدعم الفني وحل أي مشكلة.',
      textEn:
        'TitanFit uses strict Multi-Tenant Database Isolation: every gym tenant has a dedicated tenant_id enforced by PostgreSQL FORCE ROW LEVEL SECURITY (RLS) policies and isolated tenant state partitions.',
      highlightsAr: [
        'عزل كامل للعملاء والفروع: صاحب الجيم (أ) لا يمكنه أبداً رؤية أعضاء أو فروع أو فواتير أو باقات الجيم (ب).',
        'كود انضمام خاص لكل جيم (Gym Secret Code): يدخل به المتدرب مباشرة على تطبيق الجيم الخاص به فقط.',
        'دعم فني مباشر من مالك المنصة (Super Admin Support Access) لحل أي مشكلة داخل الجيم بضغطة زر.',
      ],
      highlightsEn: [
        'Zero cross-tenant data leakage enforced via PostgreSQL RLS policies.',
        'Dedicated Gym Secret Code routes trainees strictly to their own club portal.',
        'Direct Super Admin support access mode for troubleshooting.',
      ],
      actionSection: 'SETTINGS',
      actionLabelAr: '🔒 استعرض إعدادات العزل والفرع الخاص بناديك',
      actionLabelEn: '🔒 View Tenant Isolation & Club Settings',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  if (
    isGymOwnerAccount &&
    (q.includes('دفع') ||
      q.includes('فوري') ||
      q.includes('انستاباي') ||
      q.includes('فودافون') ||
      q.includes('بايموب') ||
      q.includes('paymob') ||
      q.includes('fawry') ||
      q.includes('فاتور') ||
      q.includes('payment'))
  ) {
    return {
      textAr:
        'بوابات الدفع المصرية مربوطة في قسم «تحصيل الفواتير والمدفوعات» مع حساب ضريبة القيمة المضافة (14% VAT) وتوليد بصمة تحقق مشفرة (HMAC-SHA256) وإصدار فاتورة PDF قابلة للطباعة:',
      textEn:
        'Egyptian payment gateways (Paymob Card, Fawry Reference Code, InstaPay IPA, Vodafone Cash, and Cash POS) are integrated in the Billing Cashier with 14% VAT calculation and printable PDF receipts:',
      highlightsAr: [
        'إنستاباي وفودافون كاش (InstaPay & Vodafone Cash): التحويل اللحظي مع فحص ومراجعة رقم المرجع وصورة الإيصال.',
        'بطاقات بنكية (Paymob) وفوري (Fawry): توليد طلب دفع أو كود مرجعي مكون من ١٠ أرقام.',
        'كاش (Cash POS): تحصيل نقدي فوري في الاستقبال مع طباعة إيصال PDF ضريبي.',
      ],
      highlightsEn: [
        'InstaPay & Vodafone Cash receipt & reference verification.',
        'Paymob Card & Fawry 10-digit reference code generation.',
        'Instant PDF tax invoice generation.',
      ],
      actionSection: 'PAYMENTS',
      actionLabelAr: '💳 افتح خزينة المدفوعات وبوابات الدفع المصرية الآن',
      actionLabelEn: '💳 Open Payments & Egypt Gateways Cashier',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  if (
    isGymOwnerAccount &&
    (q.includes('عضو') ||
      q.includes('متدرب جديد') ||
      q.includes('باسورد') ||
      q.includes('امسح') ||
      q.includes('حذف') ||
      q.includes('qr') ||
      q.includes('member'))
  ) {
    return {
      textAr:
        'من قسم «المتدربون والملف الطبي (CRM)» تقدر تضيف أي متدرب جديد، وبمجرد إضافته بيظهرلك كارت اعتماده فيه: كود العضوية، الباسورد المؤقت بتاعه، ورمز الـ QR Code المشفر عشان يقدر يدخل بيه من بوابة الجيم أو يفتح تطبيق المتدرب! وتقدر كمان تعدل بياناته أو تجمد اشتراكه أو تحذفه.',
      textEn:
        'In the Members CRM view, registering a new member immediately generates their Member Code, Temporary Password, and Rotating QR Pass. You can also edit, freeze, or delete any member.',
      highlightsAr: [
        'اضغط «+ تسجيل عضو جديد» لإنشاء الحساب واستلام الباسورد والـ QR فوراً.',
        'اضغط على أيقونة التعديل أو التجميد أو الحذف بجانب أي عضو لإدارته بالكامل.',
      ],
      highlightsEn: [
        'Click "+ Register Member" to generate credentials and QR pass.',
        'Full Edit, Freeze, and Delete controls on every member row.',
      ],
      actionSection: 'MEMBERS',
      actionLabelAr: '👥 افتح إدارة المتدربين واستخراج الـ QR والباسورد',
      actionLabelEn: '👥 Open Members CRM & QR Generator',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 2. NATURAL GREETINGS & SMALL TALK
  // =========================================================================
  const isPureGreeting =
    /^(السلام عليكم|سلام عليكم|وعليكم السلام|اهلا|مرحبا|صباح الخير|مساء الخير|ازيك|عامل ايه|اخبارك|هاي|هلا|يا كابتن|كابتن|hello|hi|hey)/.test(
      q,
    ) && q.split(/\s+/).length <= 7;

  if (isPureGreeting) {
    const hasSalaam = q.includes('سلام');
    return {
      textAr: hasSalaam
        ? 'وعليكم السلام ورحمة الله وبركاته! أهلاً وسهلاً بك يا بطل، نورتني 🤝✨ أنا معاك كمدربك الشخصي في الجيم (Pro Gym Coach) وأخصائي التغذية الرياضية والعلاجية (Clinical & Sports Nutritionist). احكيلي عنك: وزنك وطولك وسنك كام؟ وهدفك الحالي إيه (تنشيف وحرق دهون، ولا تضخيم عضل صافي، ولا علاج إصابة ولياقة)؟'
        : 'أهلاً وسهلاً بك يا بطل! أنا جاهز أساعدك ككوتش جيم محترف وأخصائي تغذية رياضية 💪🥗. قولي وزنك وطولك وسنك وهدفك إيه الفترة دي عشان أحسبلك سعراتك بمعادلة Mifflin-St Jeor وأفصل لك جدول تمارين ووجبات بالجرامات!',
      textEn:
        'Welcome champion 🤝✨ I am here as your Pro Gym Coach and Clinical & Sports Nutritionist. Tell me your weight, height, age, and goal so I can calculate your exact Mifflin-St Jeor macros and design your training split!',
      highlightsAr: [
        '🏋️‍♂️ **كوتش الجيم:** تصميم جداول Push/Pull/Legs و Upper/Lower و Full Body مع تحديد المجموعات والعدات والراحة والـ Tempo وبدائل الإصابات.',
        '🥗 **أخصائي التغذية:** حساب BMR و TDEE والماكروز (4P+4C+9F) وتصميم جداول 4–5 وجبات مصرية بالجرامات وبدائل اقتصادية.',
        '🧭 **خبير المنصة:** فاهم كل صفحة وأداة في المنصة لخدمة المتدرب والمدرب وصاحب الجيم.',
      ],
      highlightsEn: [
        '🏋️‍♂️ Pro Gym Coach: Complete training splits, tempo, RPE, and joint-safe injury modifications.',
        '🥗 Sports Nutritionist: Exact Mifflin-St Jeor BMR/TDEE, macro splits, and Egyptian meal plans in grams.',
        '🧭 Platform Expert: Deep knowledge of every module in TitanFit GymOS.',
      ],
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  if (
    /^(شكرا|متشكر|تسلم|ربنا يباركلك|جزاك الله|الله يكرمك|عاش|ممتاز|حلو اوي|تمام شكرا|thanks|thank you)/.test(q) &&
    q.split(/\s+/).length <= 6
  ) {
    const wText = mem.weightKg ? ` لوزنك (${mem.weightKg} كجم)` : '';
    return {
      textAr: `العفو يا بطل، تحت أمرك دايماً ككوتش جيم وأخصائي تغذية معاك خطوة بخطوة! 🙌💪 أنا مسجل عندي تفاصيلك${wText}، وفي أي وقت تحب نعدل وجبة، أو نبدل تمرين عشان مفاصلك، أو تراجع أوزانك، ابعتلي فوراً!`,
      textEn: `You're very welcome champion! 🙌💪 Anytime you want to swap a meal, modify an exercise for your joints, or adjust your macros, just ask!`,
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 3. COMPLETE 8-WEEK TRANSFORMATION PLAN / ROADMAP
  // =========================================================================
  const asksForClearPlan =
    q.includes('خطه') ||
    q.includes('جدول واضح') ||
    q.includes('امشي ازاي') ||
    q.includes('ابدا ازاي') ||
    q.includes('برنامج كامل') ||
    q.includes('نظام كامل') ||
    q.includes('واضحه وكويسه') ||
    q.includes('قولي اعمل ايه بالظبط') ||
    q.includes('8 اسابيع') ||
    q.includes('clear plan') ||
    q.includes('roadmap');

  if (asksForClearPlan) {
    const calc = calculateScientificMacros(mem);
    const days = mem.daysPerWeek || 4;
    const isHome = mem.place === 'HOME';

    if (calc.goal !== 'BULK') {
      const targetWeight8Wks = Math.max(52, calc.w - 7);
      return {
        textAr: `عيوني يا بطل! بصفتي **كوتش الجيم وأخصائي التغذية الخاص بك**، دي **خطتك العلمية المتكاملة لمدة 8 أسابيع** لوزن **${calc.w} كجم** (معدل الحرق الأساسي BMR: **${calc.bmr}** سعرة • إجمالي الحرق اليومي TDEE: **${calc.tdee}** سعرة • سعرات التنشيف المستهدفة: **${calc.exactKcal} سعرة/يوم**) للنزول الصحي إلى **${targetWeight8Wks} كجم** دهون صافية مع الحفاظ الكامل على الكتلة العضلية:`,
        textEn: `Here is your complete **8-Week Coach & Nutritionist Blueprint** tailored for ${calc.w}kg (BMR: ${calc.bmr} kcal • TDEE: ${calc.tdee} kcal • Target: ${calc.exactKcal} kcal/day):`,
        highlightsAr: [
          `🥗 **١. النظام الغذائي اليومي بالجرامات (${calc.exactKcal} سعرة — ${calc.proteinG}g بروتين • ${calc.carbsG}g كارب • ${calc.fatsG}g دهون صحية):**\n   • **الوجبة ١ (الفطور 9:00 ص):** 3 بيضات كاملة مسلوقة + 120 جم جبن قريش بزيت الزيتون والكمون + نصف رغيف بلدي أسمر (50 جم) + خيار وجرجير.\n   • **الوجبة ٢ (سناك قبل التمرين 1:30 م):** ثمرة موز متوسطة أو تفاحة + قهوة سادة بدون سكر (لرفع الأداء وحرق الدهون).\n   • **الوجبة ٣ (الغداء بعد التمرين 4:30 م):** 220 جم صدور دجاج مشوية (أو 250 جم سمك مشوي) + 150 جم أرز بسمتي أو مصري مسلوق (6 ملاعق) + طبق سلطة خضراء كبير بليمون.\n   • **الوجبة ٤ (العشاء 9:00 م):** علبة تونة مصفاة ومغسولة بالخل والليمون (أو 150 جم جبن قريش + بيضة) + كوب زبادي يوناني.`,
          isHome
            ? `🏋️‍♂️ **٢. جدول التمرين المنزلي الاحترافي (${days} أيام أسبوعياً — إيقاع 3-1-1):**\n   • **اليوم ١ (دفع علوي):** ضغط أرضي (Push-ups) 4×12-15 + ضغط أكتاف بالدمبل 4×12 + رفرفة جانبي 4×15 + غطس ترايسبس على الكرسي 3×15.\n   • **اليوم ٢ (سفلي وبطن):** البلغاري سكوات (Bulgarian Split Squat) 4×10 لكل رجل + سكوات بوزن الجسم 4×20 + كوبري المؤخرة والخلفيات (Glute Bridge) 4×15 + بلانك 3×60 ثانية.\n   • **اليوم ٣ (سحب وظهر):** تجديف بالدمبل أو حبل المقاومة 4×12 + بول أوفر بالدمبل 3×12 + تبادل بايسبس 4×12.\n   • **اليوم ٤ (حرق شامل HIIT):** 20 دقيقة (40 ثانية حركة سريعة + 20 ثانية راحة).`
            : `🏋️‍♂️ **٢. جدول تمرين الجيم الاحترافي (${days} أيام حديد + كارديو ذكي):**\n   • **اليوم ١ (سبت — Push صدر وكتف وتراي):** ضغط بار مستوي 4×8-10 + ضغط دمبل عالي 30 درجة 4×10 + تفتيح كابل 3×12-15 + ضغط أكتاف دمبل 3×10 + رفرفة جانبي كابل 4×15 + دفع حبل ترايسبس 4×12.\n   • **اليوم ٢ (أحد — Pull ظهر وبايسبس وكتف خلفي):** سحب عالي واسع (Lat Pulldown) 4×10 + تجديف بالبار المسند (Chest-Supported Row) 4×8-10 + سحب أرضي ضيق 3×12 + Face Pulls للكتف الخلفي 4×15 + تبادل دمبل بايسبس 3×12.\n   • **اليوم ٣ (ثلاثاء — Legs أرجل شاملة وبطن):** سكوات أو هاك سكوات 4×8-10 + ديدليفت روماني للخلفيات (RDL) 4×10 + دفع أرجل (Leg Press) 3×12 + رفرفة أمامي وخلفي ماكينة 3×15 + سمانة 4×15.\n   • **اليوم ٤ (خميس — Upper Hypertrophy علوي شامل):** تجميع لأفضل تمارين الصدر والظهر والذراعين بوزن متوسط وراحة 60 ثانية لضخ الدم وحرق السعرات.`,
          `🏃‍♂️ **٣. بروتوكول الكارديو والترطيب والاستشفاء:**\n   • **الكارديو:** 20 دقيقة مشي على المشاية بميل (Incline 10-12% • سرعة 4.8-5.5) بعد تمرين الحديد مباشرة، مع تحقيق 8,000 خطوة يومياً.\n   • **المياه والنوم:** اشرب **${Math.max(3.5, Math.round(calc.w * 0.04 * 10) / 10)} لتر مياه** يومياً، ونم 7.5 إلى 8 ساعات ليلاً لضبط هرمون اللبتين والكورتيزول.`,
        ],
        highlightsEn: [
          `🥗 **1. Daily Nutrition (${calc.exactKcal} kcal — ${calc.proteinG}g P / ${calc.carbsG}g C / ${calc.fatsG}g F):** 4 structured high-protein meals measured in grams.`,
          `🏋️‍♂️ **2. ${days}-Day Pro Training Split:** Compound movements at RPE 8-9 with 3-1-1 tempo + isolation finishers.`,
          `🏃‍♂️ **3. Cardio & Recovery:** 20 mins post-workout Incline Walk (10% incline, 5 km/h) + ${Math.max(3.5, Math.round(calc.w * 0.04 * 10) / 10)}L water/day.`,
        ],
        followUpAr:
          '💡 كوتش معاك: لو عندك أي إصابة في مفصل معين، أو مش بتحب صنف أكل في الجدول، قولي وهعدلهولك فوراً بالجرامات!',
        followUpEn:
          '💡 Let me know if you have any joint discomfort or want to swap any meal item!',
        disclaimerAr: AI_DISCLAIMER_AR,
        disclaimerEn: AI_DISCLAIMER_EN,
      };
    } else {
      const targetWeight8Wks = calc.w + 4;
      return {
        textAr: `عيوني يا بطل! دي **خطة الضخامة العضلية الصافية (Lean Bulking Blueprint) لمدة 8 أسابيع** لوزن **${calc.w} كجم** (سعرات الثبات TDEE: **${calc.tdee}** • سعرات التضخيم المحسوبة: **${calc.exactKcal} سعرة/يوم**) لزيادة **3 إلى 4 كجم عضل صافي** بأقل نسبة دهون ممكنة:`,
        textEn: `Here is your **8-Week Lean Bulking Blueprint** for ${calc.w}kg (${calc.exactKcal} kcal/day):`,
        highlightsAr: [
          `🥗 **١. جدول الـ 5 وجبات للتضخيم النظيف (${calc.exactKcal} سعرة — ${calc.proteinG}g بروتين • ${calc.carbsG}g كارب • ${calc.fatsG}g دهون):**\n   • **الوجبة ١ (الفطور):** 4 بيضات كاملة + 80 جم شوفان بالحليب كامل الدسم + موزة + ملعقة زبدة فول سوداني طبيعية (20 جم).\n   • **الوجبة ٢ (سناك):** 150 جم جبن قريش أو زبادي يوناني + حفنة مكسرات + رغيف بلدي.\n   • **الوجبة ٣ (قبل التمرين بـ 90 دقيقة):** 150 جم بطاطا حلوة مشوية أو أرز + 100 جم صدور دجاج + قهوة سادة.\n   • **الوجبة ٤ (الغداء بعد التمرين):** 220 جم صدور دجاج أو لحم بقري صافي + 250 جم أرز مطهو + سلطة وزيت زيتون.\n   • **الوجبة ٥ (العشاء قبل النوم):** علبة تونة أو 150 جم جبن قريش (كازين طبيعي بطيء الامتصاص لبناء العضل أثناء النوم).`,
          `🏋️‍♂️ **٢. قانون التدرج في الأحمال (Progressive Overload):**\n   • سجل أوزانك كل أسبوع في تطبيق المتدرب (Member PWA)، وحاول تزود 1.25 إلى 2.5 كجم أو عدة إلى عدتين بنفس الوزن كل أسبوع في التمارين المركبة (Bench, Squat, Row, RDL, Overhead Press).`,
          `⚡ **٣. مثلث الاستشفاء العضلي:** 5 جم كرياتين مونوهيدرات يومياً بعد الغداء + 4 لتر مياه + 8 ساعات نوم عميق.`,
        ],
        highlightsEn: [
          `🥗 5-Meal Lean Surplus (${calc.exactKcal} kcal — ${calc.proteinG}g P / ${calc.carbsG}g C / ${calc.fatsG}g F).`,
          `🏋️‍♂️ Progressive Overload tracking weekly 1RM PRs in the Member PWA.`,
          `⚡ Recovery: 5g Creatine Monohydrate daily + 4L water + 8h sleep.`,
        ],
        followUpAr: '💡 تحب أفصل لك جدول تمارين 5 أيام (Push / Pull / Legs / Upper / Lower) للتضخيم؟',
        followUpEn: '💡 Want me to break down the 5-day PPL + Upper/Lower hypertrophy split?',
        disclaimerAr: AI_DISCLAIMER_AR,
        disclaimerEn: AI_DISCLAIMER_EN,
      };
    }
  }

  // =========================================================================
  // 4. JOINT INJURIES, BIOMECHANICAL SUBSTITUTIONS & REHAB (Real Gym Coach!)
  // =========================================================================
  if (
    q.includes('اصاب') ||
    q.includes('وجع') ||
    q.includes('الم') ||
    q.includes('ركب') ||
    q.includes('قطنيه') ||
    q.includes('ضهر') ||
    q.includes('غضروف') ||
    q.includes('عرق النسا') ||
    q.includes('كتف') ||
    q.includes('كوع') ||
    q.includes('رسغ') ||
    q.includes('خشونه') ||
    q.includes('injury') ||
    q.includes('pain')
  ) {
    return {
      textAr:
        'بصفتي **كوتش الجيم المختص بالميكانيكا الحيوية (Biomechanics)** 🦴🏋️‍♂️: القاعدة الذهبية في الجيم هي **«نتمرن حوالين الإصابة مش فوق الإصابة — Train Around Pain, Never Through Joint Pain»**. دي البدائل التشريحية الآمنة لكل مفصل عشان تكمل تمرينك وتبني عضل بأمان تام:',
      textEn:
        'As your Biomechanics Gym Coach 🦴🏋️‍♂️: Never train through sharp joint pain. Here are the exact joint-safe exercise substitutions:',
      highlightsAr: [
        '🦵 **لو عندك ألم أو خشونة في الركبة (Knee Pain):**\n   • ❌ تجنب مؤقتاً: السكوات الحر العميق بالبار، والـ Walking Lunges، والـ Leg Extension بمدى كامل ثقيل.\n   • ✅ البديل الآمن: **Box Squat** (الجلوس على صندوق بزاوية 90 درجة)، و **Leg Press مع وضع القدمين لأعلى المنصة** (لتقليل الحمل على الركبة وتحويله للخلفيات والمؤخرة)، و **Romanian Deadlift (RDL)**، و **Wall Sit** الثابت لتقوية الأربطة.',
        '🔙 **لو عندك ألم أسفل الظهر / القطنية / الديسك (Lower Back & Sciatica):**\n   • ❌ تجنب تماماً: الرفعة الميتة التقليدية من الأرض (Conventional Deadlift)، وتجديف البار الحر بالانحناء (Bent-Over Barbell Row)، والـ Sit-ups التقليدية للبطن.\n   • ✅ البديل الآمن: **Chest-Supported Row** (التجديف والبطن مسنودة على الدكة — صفر تحميل على القطنية!)، و **Lat Pulldown**، وللأرجل العب **Belt Squat أو Leg Press بدون تقوس أسفل الظهر**، وللبطن العب **Plank و Deadbug و Pallof Press**.',
        '💪 **لو عندك ألم في الكتف أو أوتار الكفة المدورة (Shoulder Impingement):**\n   • ❌ تجنب: البار المسطح للرقبة، والضغط خلف الرقبة نهائياً، والرفرفة الجانبي بوزن ثقيل مع لف الإبهام لأسفل.\n   • ✅ البديل الآمن: **الضغط بالدمبل بقبضة محايدة (Neutral Grip / الكفين متقابلين)** أو زاوية كوع 45 درجة للداخل، و **Floor Press**، والرفرفة بالكابل في مستوى لوح الكتف (**Scapular Plane — 30 درجة للأمام**)، مع عمل إحماء **External Rotation & Face Pulls** قبل أي تمرين علوي.',
        '🤛 **لو عندك ألم في الكوع أو الرسغ (Elbow / Wrist Tendonitis):**\n   • استبدل البار المستقيم بـ **EZ-Bar المتعرج** أو **الدمبل بقبضة المطرقة (Hammer Grip)** لتخفيف الالتواء على الساعد والكوع.',
      ],
      highlightsEn: [
        '🦵 Knee Pain: Swap deep free squats for Box Squats, high-foot-placement Leg Press, and Romanian Deadlifts.',
        '🔙 Lower Back / Disc Pain: Swap Bent-Over Barbell Rows and Deadlifts for Chest-Supported Rows, Lat Pulldowns, and Deadbugs.',
        '💪 Shoulder Pain: Use Neutral-Grip Dumbbell Presses (elbows tucked 45°) and Scapular-Plane Lateral Raises.',
        '🤛 Wrist/Elbow Pain: Swap straight bars for EZ-Curl Bars and Hammer-Grip Dumbbells.',
      ],
      followUpAr:
        '💡 قولي أنهي مفصل بالظبط اللي بيوجعك، وفي أنهي حركة بتحس بالألم عشان أعدلك يوم التمرين بتاعك بالكامل!',
      followUpEn:
        '💡 Tell me exactly which joint bothers you and during which movement so I can customize your session!',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 5. FOOD SWAPS / ECONOMIC EGYPTIAN DIET / RAMADAN & INTERMITTENT FASTING
  // =========================================================================
  if (
    q.includes('صيام') ||
    q.includes('متقطع') ||
    q.includes('رمضان') ||
    q.includes('fasting')
  ) {
    const calc = calculateScientificMacros(mem);
    return {
      textAr: `بصفتي **أخصائي التغذية الرياضية** 🥗⏰: نظام **الصيام المتقطع (16/8 Intermittent Fasting)** ممتاز جداً لضبط مقاومة الإنسولين ورفع هرمون النمو وحرق الدهون العنيدة! لوزنك (**${calc.w} كجم** — **${calc.exactKcal} سعرة**)، دي أفضل تقسيمة مواعيد ووجبات:`,
      textEn: `As your Sports Nutritionist 🥗⏰: Here is your **16/8 Intermittent Fasting Protocol** tailored for ${calc.w}kg (${calc.exactKcal} kcal):`,
      highlightsAr: [
        '⏰ **فترة الصيام (16 ساعة — مثلاً من 10 مساءً حتى 2 ظهراً):** مسموح فيها المياه بكثرة، القهوة السادة، الشاي الأخضر، والينسون بدون سكر أو حليب.',
        `🍳 **الوجبة الأولى — كسر الصيام (2:00 ظهراً):** ابدأ بالبروتين والألياف أولاً لمنع ارتفاع سكر الدم: 3 بيضات مسلوقة + 150 جم جبن قريش + طبق سلطة خضراء + نصف رغيف بلدي.`,
        `🏋️‍♂️ **التمرين (5:00 أو 6:00 مساءً):** في قمة النشاط بعد هضم الوجبة الأولى + فنجان قهوة سادة قبل التمرين بـ 30 دقيقة.`,
        `🍗 **الوجبة الثانية — وجبة البناء الكبرى بعد التمرين (7:30 مساءً):** 220 جم صدور دجاج أو سمك مشوي + 150 جم أرز أو بطاطس بالفرن + خضار سوتيه.`,
        `🥣 **الوجبة الثالثة — قبل غلق نافذة الأكل (9:45 مساءً):** كوب زبادي يوناني أو علبة تونة مصفاة + 15 حبة لوز أو ثمرة فاكهة.`,
      ],
      highlightsEn: [
        '⏰ 16h Fasting Window (10 PM – 2 PM): Water, black coffee, green tea (zero calories).',
        '🍳 Meal 1 (2:00 PM): 3 boiled eggs + 150g cottage cheese + salad + half baladi loaf.',
        '🍗 Meal 2 Post-Workout (7:30 PM): 220g grilled chicken/fish + 150g rice + veggies.',
        '🥣 Meal 3 Closing Window (9:45 PM): Greek yogurt or tuna + 15 almonds.',
      ],
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  if (
    q.includes('بديل') ||
    q.includes('بدائل') ||
    q.includes('مبحبش') ||
    q.includes('مش بحب') ||
    q.includes('اقتصادي') ||
    q.includes('رخيص') ||
    q.includes('ميزانيه') ||
    q.includes('سمك') ||
    q.includes('قريش') ||
    q.includes('فراخ') ||
    q.includes('تونه') ||
    q.includes('بيض')
  ) {
    const w = mem.weightKg || 82;
    return {
      textAr: `بصفتي **أخصائي التغذية الرياضية** 🥗⚖️: أهم قاعدة في الدايت الناجح هي **المرونة وتبديل الأصناف بنفس القيمة الغذائية (Iso-Caloric & Iso-Protein Swaps)** لوزنك (${w} كجم) وبأقل ميزانية متاحة في البيت المصري:`,
      textEn: `As your Sports Nutritionist 🥗⚖️: Here are exact gram-for-gram protein, carb, and fat equivalents for your ${w}kg plan:`,
      highlightsAr: [
        '🥩 **جدول بدائل البروتين الحيواني (كل بديل يعطيك ~45 جم بروتين صافي):**\n   • 200 جم صدور دجاج (وزن نيء) = 250 جم سمك بلطي أو بوري أو ماكريل مشوي = 200 جم كبدة بقري أو دجاج = 220 جم لحم بقري أحمر = علبة ونصف تونة مصفاة ومغسولة بالخل.',
        '🥚 **جدول بدائل الفطور والعشاء والاقتصادي (~25-30 جم بروتين):**\n   • 200 جم جبن قريش = 3 بيضات كاملة + بياض بيضتين = كوب زبادي يوناني كبير + بيضتين = 6 ملاعق فول مدمس + 2 بيضة مسلوقة + سلطة = 150 جم عدس مطبوخ مع أرز (بروتين نباتي متكامل الأحماض الأمينية).',
        '🍚 **جدول بدائل الكاربوهيدرات المعقدة (كل بديل يعطيك ~40 جم كارب صافي):**\n   • 150 جم أرز مطهو (6 ملاعق) = 150 جم مكرونة مسلوقة = 200 جم بطاطس أو بطاطا حلوة مشوية/مسلوقة = نصف رغيف بلدي أسمر (65 جم) = 60 جم شوفان جاف.',
        '🥑 **جدول بدائل الدهون الصحية (~10 جم دهون صحية):**\n   • ملعقة كبيرة زيت زيتون بكر (10 مل) = 15 حبة لوز نيء = ملعقة ممسوحة زبدة فول سوداني طبيعية (18 جم) = صفار بيضتين.',
      ],
      highlightsEn: [
        '🥩 45g Protein Swaps: 200g chicken breast = 250g grilled tilapia = 200g liver = 220g lean beef = 1.5 tuna tins.',
        '🥚 25-30g Breakfast/Dinner Swaps: 200g cottage cheese = 3 whole eggs + 2 whites = 6 tbsp fava beans + 2 eggs.',
        '🍚 40g Complex Carb Swaps: 150g cooked rice = 200g baked potato/sweet potato = half baladi loaf = 60g oats.',
      ],
      followUpAr: '💡 قولي إيه الأكلات المتوفرة عندك في البيت النهاردة وهوزنلك منها وجباتك بالجرام!',
      followUpEn: '💡 Tell me what foods you have at home today and I will portion your meals in grams!',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 6. NUTRITIONIST MODE: BMR/TDEE, CUTTING, BULKING & MACRO CALCULATIONS
  // =========================================================================
  if (
    q.includes('اخس') ||
    q.includes('تخسيس') ||
    q.includes('تنشيف') ||
    q.includes('دهون') ||
    q.includes('كرش') ||
    q.includes('انزل وزن') ||
    q.includes('سعر') ||
    q.includes('كالوري') ||
    q.includes('ماكرو') ||
    q.includes('دايت') ||
    q.includes('تغذيه') ||
    q.includes('نظام غذائي') ||
    q.includes('وزني') ||
    q.includes('bmr') ||
    q.includes('tdee') ||
    q.includes('mifflin') ||
    q.includes('cut') ||
    q.includes('diet')
  ) {
    const calc = calculateScientificMacros(mem);
    const targetGoalWeight = calc.goal === 'BULK' ? calc.w + 5 : Math.max(52, calc.w - 9);

    return {
      textAr: `بصفتي **أخصائي التغذية الرياضية والعلاجية** 🥗🧬: حسبت لك أرقامك الدقيقة بمعادلة **Mifflin-St Jeor العلمية** لوزن **${calc.w} كجم** وطول **${calc.h} سم** وسن **${calc.age} سنة**:\n• **معدل الحرق الأساسي وقت الراحة (BMR):** ${calc.bmr} سعرة/يوم\n• **إجمالي استهلاك الطاقة اليومي (TDEE):** ${calc.tdee} سعرة/يوم\n• **سعراتك المستهدفة (${calc.goal === 'BULK' ? 'تضخيم عضلي نظيف' : 'حرق دهون وتنشيف بدون ترهلات'}):** **${calc.exactKcal} سعرة حرارية يومياً** للوصول إلى **${targetGoalWeight} كجم**:`,
      textEn: `As your Clinical & Sports Nutritionist 🥗🧬: Using the **Mifflin-St Jeor equation** for **${calc.w}kg, ${calc.h}cm, age ${calc.age}**:\n• **BMR:** ${calc.bmr} kcal/day | **TDEE:** ${calc.tdee} kcal/day\n• **Target Intake:** **${calc.exactKcal} kcal/day**`,
      highlightsAr: [
        `📊 **توزيع الماكروز اليومي بمعادلة (4P + 4C + 9F = ${calc.exactKcal} kcal):**\n   • **البروتين:** ${calc.proteinG} جم يومياً (${calc.proteinG * 4} كالوري) — لبناء وحماية الألياف العضلية ورفع الشبع الحراري (TEF).\n   • **الكاربوهيدرات:** ${calc.carbsG} جم يومياً (${calc.carbsG * 4} كالوري) — لملء مخازن الجليكوجين في العضلات.\n   • **الدهون الصحية:** ${calc.fatsG} جم يومياً (${calc.fatsG * 9} كالوري) — لدعم التستوستيرون والهرمونات وصحة المفاصل.`,
        `🍳 **الوجبة ١ (الفطور — 32 جم بروتين):** 3 بيضات مسلوقة + 100 جم جبن قريش + نصف رغيف بلدي أسمر أو 50 جم شوفان + خيار وطماطم.`,
        `🍎 **الوجبة ٢ (سناك ذكي — 15 جم بروتين):** كوب زبادي يوناني + ثمرة تفاح أو جوافة + 10 حبات لوز نيء.`,
        `🍗 **الوجبة ٣ (الغداء بعد التمرين — 52 جم بروتين):** 220 جم صدور دجاج مشوية أو بالفرن (أو 250 جم سمك مشوي) + ${calc.goal === 'BULK' ? '220' : '150'} جم أرز مسلوق + طبق سلطة خضراء كبير.`,
        `🥗 **الوجبة ٤ (العشاء — 30 جم بروتين):** علبة تونة مصفاة بالليمون أو 150 جم جبن قريش بزيت الزيتون + خضار ورقي.`,
      ],
      highlightsEn: [
        `📊 Daily Macros (${calc.exactKcal} kcal): ${calc.proteinG}g Protein • ${calc.carbsG}g Carbs • ${calc.fatsG}g Healthy Fats.`,
        `🍳 Meal 1: 3 boiled eggs + 100g cottage cheese + half whole-wheat baladi loaf or 50g oats.`,
        `🍎 Meal 2: Greek yogurt + apple + 10 raw almonds.`,
        `🍗 Meal 3: 220g grilled chicken breast (or 250g tilapia) + ${calc.goal === 'BULK' ? '220g' : '150g'} cooked rice + salad.`,
        `🥗 Meal 4: Drained tuna tin or 150g cottage cheese with olive oil & greens.`,
      ],
      followUpAr:
        `💡 اكتبلي **«طب قولي خطة واضحة وكويسه»** عشان أربطلك الدايت ده بجدول تمارين أسبوعي كامل لوزن ${calc.w} كجم، أو قولي وزنك وطولك وسنك بالظبط لو حابب نحدث الحسبة!`,
      followUpEn:
        `💡 Type **"Give me a clear plan"** to pair this diet with a complete weekly workout split for ${calc.w}kg!`,
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 7. PRO GYM COACH MODE: WORKOUT SPLITS & MUSCLE-SPECIFIC PROGRAMMING
  // =========================================================================
  if (
    q.includes('تمرين') ||
    q.includes('تمارين') ||
    q.includes('جدول') ||
    q.includes('عضل') ||
    q.includes('تضخيم') ||
    q.includes('ضخامه') ||
    q.includes('صدر') ||
    q.includes('ظهر') ||
    q.includes('رجل') ||
    q.includes('ارجل') ||
    q.includes('كتف') ||
    q.includes('ذراع') ||
    q.includes('باي') ||
    q.includes('تراي') ||
    q.includes('بطن') ||
    q.includes('push') ||
    q.includes('pull') ||
    q.includes('legs') ||
    q.includes('upper') ||
    q.includes('workout') ||
    q.includes('gym') ||
    q.includes('muscle')
  ) {
    // Check if asking for a specific muscle group
    if (q.includes('صدر') || q.includes('chest')) {
      return {
        textAr:
          'بصفتي **كوتش الجيم الخاص بك** 🏋️‍♂️🔥: لتفجير عضلة **الصدر (Pectoralis Major — العلوي والأوسط والسفلي)**، السر مش في الأوزان العشوائية، السر في **تثبيت لوحي الكتف للخلف (Scapular Retraction)** ونزول الكوع بزاوية 45 درجة. دي التمرينة الاحترافية الكاملة:',
        textEn:
          'As your Pro Gym Coach 🏋️‍♂️🔥: Here is the biomechanically optimal **Complete Chest Hypertrophy Session**:',
        highlightsAr: [
          '1️⃣ **ضغط دمبل على دكة مائلة 30 درجة (Incline Dumbbell Press):** 4 مجموعات × 8–10 عدات (راحة 120 ثانية) — يركز على الصدر العلوي ويعطي امتلاء قوي تحت الترقوة.',
          '2️⃣ **ضغط بار مستوي أو ماكينة Chest Press:** 4 مجموعات × 8–10 عدات (إيقاع 3 ثوانٍ نزول سلبي و1 ثانية دفع).',
          '3️⃣ **تفتيح بالكابل من أسفل لأعلى (Low-to-High Cable Fly):** 3 مجموعات × 12–15 عدة مع ثبات ثانية في قمة الانقباض.',
          '4️⃣ **متوازي للصدر السفلي (Chest Dips بميل خفيف للأمام) أو High-to-Low Cable:** 3 مجموعات × 10–12 عدة.',
        ],
        followUpAr: '💡 تحب أقولك تمارين الترايسبس أو الكتف اللي تلعبها مع الصدر في نفس اليوم؟',
        disclaimerAr: AI_DISCLAIMER_AR,
        disclaimerEn: AI_DISCLAIMER_EN,
      };
    }

    if (q.includes('ظهر') || q.includes('مجنص') || q.includes('back')) {
      return {
        textAr:
          'بصفتي **كوتش الجيم الخاص بك** 🏋️‍♂️💪: لبناء **ظهر عريض وسميك على شكل حرف V (Lats, Traps & Rhomboids)**، اسحب بكوعك مش ببايسبس إيدك! دي التمرينة المتكاملة للعرض والسمك:',
        textEn:
          'As your Pro Gym Coach 🏋️‍♂️💪: Here is the complete **Back Width & Thickness Session**:',
        highlightsAr: [
          '1️⃣ **سحب عالي واسع للأمام (Wide-Grip Lat Pulldown):** 4 مجموعات × 10–12 عدة — لعرض المجنص العلوي.',
          '2️⃣ **تجديف بالبار أو ماكينة مسنود الصدر (Chest-Supported T-Bar / Machine Row):** 4 مجموعات × 8–10 عدات — لسمك وسط الظهر بدون إجهاد القطنية.',
          '3️⃣ **سحب كابل أرضي بقبضة ضيقة (Seated Neutral-Grip Cable Row):** 3 مجموعات × 10–12 عدة مع فرد الكتف للأمام في السلبية وعصر اللوحين في الإيجابية.',
          '4️⃣ **بول أوفر بالحبل على الكابل (Straight-Arm Cable Pulldown):** 3 مجموعات × 15 عدة لعزل المجنص وضخ الدم في الختام.',
        ],
        followUpAr: '💡 تحب أضيفلك عليها تمرينتين بايسبس وكتف خلفي عشان نقفل يوم السحب (Pull Day)؟',
        disclaimerAr: AI_DISCLAIMER_AR,
        disclaimerEn: AI_DISCLAIMER_EN,
      };
    }

    const wContext = mem.weightKg
      ? ` (مفصل لوزنك ${mem.weightKg} كجم${mem.goal === 'CUT' ? ' مع رفع كثافة الحرق' : ''})`
      : '';
    return {
      textAr: `بصفتي **كوتش الجيم المحترف (Pro Gym Coach)** 🏋️‍♂️: ده جدول التمارين العلمي${wContext} بنظام **(Push / Pull / Legs)** مع تطبيق قواعد الضخامة الحديثة: **الشدة RPE 8-9** (تترك عدة أو عدتين في التانك)، **إيقاع 3-1-1** (٣ ثوانٍ نزول سلبي • ١ ثانية ثبات • ١ ثانية دفع)، والراحة من **90 إلى 120 ثانية** في التمارين المركبة:`,
      textEn: `As your Pro Gym Coach 🏋️‍♂️: Here is your structured **Push / Pull / Legs (PPL)** program with 3-1-1 tempo, RPE 8-9 intensity, and progressive overload:`,
      highlightsAr: [
        '🔥 **يوم ١ — الدفع (Push: صدر + كتف أمامي وجانبي + ترايسبس):**\n   • ضغط بار أو دمبل مستوي (4×8-10) + ضغط دمبل عالي 30° (4×10) + تفتيح كابل أو الفراشة (3×12-15) + ضغط أكتاف بالدمبل جالساً (3×10) + رفرفة كتف جانبي بالكابل أو الدمبل (4×15) + دفع حبل ترايسبس وفرنساوي (4×12).',
        '💪 **يوم ٢ — السحب (Pull: ظهر عرض وسمك + كتف خلفي + بايسبس):**\n   • سحب مجنص عالي واسع (4×10) + تجديف ماكينة مسنود الصدر أو بار (4×8-10) + سحب كابل أرضي ضيق (3×12) + Face Pulls للكتف الخلفي وصحة الكفة المدورة (4×15) + تبادل بايسبس بالدمبل + شاكوش (4×10-12).',
        '🦵 **يوم ٣ — الأرجل والبطن (Legs & Core: أمامية + خلفية + سمانة + بطن):**\n   • سكوات بالبار أو Hack Squat (4×8-10) + ديدليفت روماني للخلفية والمؤخرة RDL (4×10) + دفع أرجل Leg Press (3×12) + رفرفة أمامي وخلفي ماكينة (3×12-15) + سمانة واقف (4×15) + بلانك ورفع أرجل للبطن (3 مجموعات).',
        '🔄 **بروتوكول الإحماء والتدرج (Warm-up & Progressive Overload):**\n   • قبل أول تمرين مركب، العب 5 دقائق تهيئة مفاصل + مجموعتين إحماء بـ 50% ثم 75% من وزنك الأساسي (بدون إجهاد) قبل الدخول في المجموعات الفعلية.',
      ],
      highlightsEn: [
        '🔥 Push Day (Chest/Shoulders/Triceps): Bench Press (4x8-10), Incline DB Press (4x10), Cable Fly (3x12-15), Overhead DB Press (3x10), Lateral Raises (4x15), Triceps Pushdown (4x12).',
        '💪 Pull Day (Back/Rear Delts/Biceps): Wide Lat Pulldown (4x10), Chest-Supported Row (4x8-10), Seated Cable Row (3x12), Face Pulls (4x15), Biceps Curls & Hammer Curls (4x12).',
        '🦵 Leg Day (Quads/Hamstrings/Calves/Core): Squat/Hack Squat (4x8-10), Romanian Deadlift (4x10), Leg Press (3x12), Leg Extensions & Curls (3x15), Calf Raises (4x15) & Core.',
      ],
      followUpAr:
        '💡 قولي بتقدر تنزل الجيم كام يوم في الأسبوع (3 أو 4 أو 5 أو 6 أيام)؟ أو لو حابب جدول Upper / Lower أو Full Body أفصلهولك حالاً!',
      followUpEn:
        '💡 Tell me how many days per week you can train (3, 4, 5, or 6 days), or ask for an Upper/Lower or Full Body split!',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 8. EVIDENCE-BASED SUPPLEMENT PROTOCOLS
  // =========================================================================
  if (
    q.includes('مكمل') ||
    q.includes('كرياتين') ||
    q.includes('واي') ||
    q.includes('بروتين بودر') ||
    q.includes('حارق') ||
    q.includes('حوارق') ||
    q.includes('اوميجا') ||
    q.includes('فيتامين') ||
    q.includes('كافيين') ||
    q.includes('creatine') ||
    q.includes('whey') ||
    q.includes('supplement')
  ) {
    return {
      textAr:
        'بصفتي **أخصائي التغذية الرياضية** ⚡🧪: ده الدليل العلمي الموثق للمكملات الغذائية (الجرعات، المواعيد، وما يستحق أموالك فعلاً بدون تسويق وهمي):',
      textEn:
        'As your Sports Nutritionist ⚡🧪: Here is the evidence-based supplement protocol (dosages, timing, and clinical efficacy):',
      highlightsAr: [
        '1️⃣ **الكرياتين مونوهيدرات (Creatine Monohydrate — رقم ١ علمياً):**\n   • **الجرعة:** 5 جرام يومياً بشكل ثابت (بدون الحاجة لفترة تحميل Loading) بعد وجبة تحتوي على كارب وبروتين.\n   • **الفائدة:** يزيد مخزون الـ ATP في العضلات، يرفع القوة والأوزان بنسبة 10-15%، ويسحب المياه **داخل** الخلية العضلية وليس تحت الجلد (ممتاز في التنشيف والتضخيم مع شرب 3.5–4 لتر مياه).',
        '2️⃣ **الواي بروتين (Whey Protein Isolate / Concentrate):**\n   • **الجرعة:** سكوب واحد (يعطي ~24-27 جم بروتين) بعد التمرين أو في الشوفان صباحاً **فقط إذا لم تستطع إكمال احتياجك من الطعام الطبيعي** (الدجاج، السمك، البيض، الجبن القريش).',
        '3️⃣ **الكافيين / القهوة قبل التمرين (Pre-Workout Ergogenic Aid):**\n   • **الجرعة:** 150 إلى 200 مجم كافيين (كوب قهوة إسبريسو دبل أو أمريكانو سادة) قبل التمرين بـ 30 إلى 45 دقيقة يرفع التركيز العصبي ويقلل الإحساس بالتعب (وأنظف وأوفر من حوارق الدهون التجارية!).',
        '4️⃣ **أساسيات الصحة والاستشفاء والهرمونات (Health & Recovery Stack):**\n   • **فيتامين D3:** (2000–5000 وحدة دولية يومياً بعد الغداء) + **أوميجا 3 (Omega-3 EPA/DHA):** (1000–2000 مجم يومياً لتقليل التهاب المفاصل) + **ماغنسيوم جلايسينات (Magnesium Glycinate 300-400mg):** قبل النوم بـ 60 دقيقة لاسترخاء العضلات وجودة النوم.',
      ],
      highlightsEn: [
        '1️⃣ Creatine Monohydrate: 5g daily post-meal (no loading needed) with 3.5L+ water.',
        '2️⃣ Whey Protein: 1 scoop (25g protein) strictly as a convenient food equivalent when needed.',
        '3️⃣ Pre-Workout Caffeine: 150-200mg (black coffee) 30-45m before training.',
        '4️⃣ Health Stack: Vitamin D3 + Omega-3 + Magnesium Glycinate before bed.',
      ],
      followUpAr: '💡 تحب أراجع معاك أي مكمل معين معروض عليك قبل ما تشتريه؟',
      followUpEn: '💡 Want me to evaluate any specific supplement product before you buy it?',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 9. CONTEXT-AWARE CONVERSATIONAL FALLBACK
  // =========================================================================
  if (mem.weightKg) {
    const calc = calculateScientificMacros(mem);
    return {
      textAr: `أنا معاك يا بطل ومسجل عندي ملفك الشخصي: الوزن **${mem.weightKg} كجم** (سعراتك المستهدفة: **${calc.exactKcal} سعرة** • **${calc.proteinG}g** بروتين) 🤖💪🥗! قولي حابب نركز على إيه دلوقتي؟`,
      textEn: `I have your profile saved (**${mem.weightKg}kg** — Target: **${calc.exactKcal} kcal** & **${calc.proteinG}g** protein)! What should we focus on next?`,
      highlightsAr: [
        `🔥 اكتب «عايز خطة واضحة لمدة 8 أسابيع» لتستلم جدول الـ 4 وجبات بالجرامات + جدول التمارين لوزن ${mem.weightKg} كجم.`,
        '🦴 اكتب «عندي ألم في الركبة / القطنية / الكتف» لو محتاج بدائل تمارين آمنة لمفاصلك.',
        '🔄 اكتب «عايز بدائل اقتصادية للأكل» لتبديل أي صنف بأكلات من البيت بنفس الجرامات.',
      ],
      highlightsEn: [
        `🔥 Ask for your "Complete 8-week plan" tailored for ${mem.weightKg}kg.`,
        '🦴 Ask for joint-safe exercise alternatives for knees, lower back, or shoulders.',
        '🔄 Ask for budget-friendly food swaps in grams.',
      ],
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  return {
    textAr: isGymOwnerAccount
      ? `أهلاً بك يا كابتن في المساعد الذكي الاحترافي لنادي **${liveCtx.gymNameAr}** 🤖💪🥗!\nأنا شغال معاك في **٣ أدوار متكاملة**:\n1️⃣ **كوتش جيم محترف:** تصميم جداول التمارين (PPL / Upper-Lower / Full Body)، ضبط الـ Tempo والـ RPE، وبدائل الإصابات للمفاصل.\n2️⃣ **أخصائي تغذية رياضية وعلاجية:** حساب BMR/TDEE بمعادلة Mifflin-St Jeor، الماكروز (4P+4C+9F)، وجداول الوجبات بالجرامات وبدائلها.\n3️⃣ **خبير المنصة وإدارة الجيم:** متصل بقاعدة بيانات ناديك (${liveCtx.members.length} مشترك مسجل) وفاهم كل صفحة في المنصة!`
      : 'أهلاً بك يا بطل! أنا **مدربك الشخصي في الجيم (Pro Gym Coach)** و**أخصائي التغذية الرياضية والعلاجية (Clinical & Sports Nutritionist)** 🤖💪🥗. اكتبلي وزنك وطولك وسنك وهدفك، وهفصل لك جدول تمارين ووجبات بالجرامات وبدائل آمنة لمفاصلك خطوة بخطوة!',
    textEn: isGymOwnerAccount
      ? `Welcome Coach to your Pro AI Suite for **${liveCtx.gymNameEn}**! I act as your Pro Gym Coach, Clinical & Sports Nutritionist, and Live Platform Operations Assistant (${liveCtx.members.length} members tracked).`
      : 'Hi champion! I am your Pro AI Gym Coach & Clinical Sports Nutritionist 🤖💪🥗. Tell me your weight, height, age, and goal for an exact Mifflin-St Jeor meal plan and workout split!',
    highlightsAr: [
      '🏋️‍♂️ جرب تكتبلي: «وزني 90 وطولي 178 وسني 26 وعايز أنشف وأبني عضل».',
      '🥗 أو اضغط على أي زر من الأزرار السريعة بالأسفل لاختبار قدرات كوتش الجيم وأخصائي التغذية وخبير المنصة!',
    ],
    highlightsEn: [
      '🏋️‍♂️ Try typing: "I weigh 90kg, height 178cm, age 26, and want to cut fat and build muscle".',
      '🥗 Or click any quick action chip below!',
    ],
    disclaimerAr: AI_DISCLAIMER_AR,
    disclaimerEn: AI_DISCLAIMER_EN,
  };
}

function renderFormattedAiText(text: string): React.ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return segments.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-black text-slate-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-[11px] font-bold text-amber-800 dark:bg-slate-800 dark:text-amber-300"
          dir="ltr"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function SmartAiAssistantWidget() {
  const {
    locale,
    setActiveSection,
    showToast,
    isAuthenticated,
    activeRole,
    isAiAllowed,
    activePlanConfig,
    activeTenantCustom,
    members,
    plans,
    invoices,
    classes,
    staff,
    branches,
    customWorkouts,
    customRecipes,
  } = usePlatformStore();
  const isAr = locale === 'ar';
  const proPlanPriceEgp =
    SAAS_SUBSCRIPTION_PLANS.find((p) => p.id === 'PRO')?.monthlyPriceEgp || 1950;

  const isGymOwnerAccount =
    isAuthenticated &&
    (activeRole === 'GYM_OWNER' || activeRole === 'SUPER_ADMIN' || activeRole === 'BRANCH_MANAGER');
  const isMemberAccount = isAuthenticated && activeRole === 'MEMBER';

  // 4 distinct AI contexts:
  // 1) isFreeVisitorMode (!isAuthenticated): Scoped Free Visitor AI
  // 2) isMemberAccount && isAiAllowed: Pure Personal Member AI (Coach & Nutritionist ONLY — NO Pro/Elite/SaaS options)
  // 3) Starter Locked: Owner sees SaaS Pro upgrade gate; Member sees clean "Contact your club" notice (no SaaS pricing!)
  // 4) Full Owner/Admin Pro AI: Coach + Nutritionist + Live Platform & CRM
  const isFreeVisitorMode = !isAuthenticated;
  const isProAiEnabled = isAuthenticated && (activeRole === 'SUPER_ADMIN' || isAiAllowed);
  const canUseAi = isFreeVisitorMode || isProAiEnabled;

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeQuickTab, setActiveQuickTab] = useState<'COACH_NUTRITION' | 'PLATFORM'>('COACH_NUTRITION');
  const [messages, setMessages] = useState<AssistantReply[]>([
    {
      id: 'welcome-ai',
      sender: 'AI',
      textAr: isFreeVisitorMode
        ? 'أهلاً بك في **المساعد المجاني للزوار (TitanFit Free AI)** 👋✨!\nأنا هنا لمساعدتك في **مهام محددة للزوار**: شرح باقات المنصة، إعطاؤك تقدير مبدئي سريع للسعرات، وتوجيهك للتجربة المجانية الـ ٧ أيام. (أما **كوتش الجيم المحترف + أخصائي التغذية بالجرامات + بدائل الإصابات** فهي متاحة حصرياً في باقة **Pro + AI** والأحدث!).'
        : isMemberAccount
          ? 'أهلاً بك يا بطل! أنا **كوتش التمرين وأخصائي التغذية الخاص بك** 🤖💪🥗.\nاحكيلي عن وزنك وطولك وهدفك، وهفصل لك جدول تمارين ووجبات بالجرامات وبدائل آمنة لأي إصابة خطوة بخطوة!'
          : 'أهلاً بك يا بطل! أنا **كوتش الجيم المحترف (Pro Gym Coach)** و**أخصائي التغذية الرياضية والعلاجية (Sports Nutritionist)** و**خبير المنصة الذكي** 🤖💪🥗.\nاحكيلي عن وزنك وطولك وهدفك، أو اسألني عن أي تمرين، بديل إصابة، جدول دايت بالجرامات، أو أي أداة داخل المنصة!',
      textEn: isFreeVisitorMode
        ? 'Welcome to **TitanFit Free Visitor AI** 👋✨! I handle specific visitor tasks: explaining plans & pricing, quick calorie estimates, and guiding you to the Free 7-Day Trial.'
        : isMemberAccount
          ? 'Welcome champion! I am your **Personal AI Gym Coach & Sports Nutritionist** 🤖💪🥗. Share your weight, height, and goal for custom workouts, gram-accurate meal plans, and joint-safe exercises!'
          : 'Welcome champion! I am your **Pro AI Gym Coach**, **Clinical & Sports Nutritionist**, and **Platform Expert** 🤖💪🥗. Share your weight, height, and goal or ask about workouts, injury swaps, macro meal plans, or any platform feature!',
      highlightsAr: isFreeVisitorMode
        ? [
            '💎 **مقارنة الباقات:** الفرق بين Starter (بدون AI) و Pro + AI و Enterprise.',
            '🥗 **تقدير سريع للسعرات:** قولي وزنك فقط لحساب السعرات التقريبية.',
            '🎁 **التجربة المجانية:** جرب خطة الـ ٧ أيام المجانية قبل الاشتراك.',
          ]
        : isMemberAccount
          ? [
              '🏋️‍♂️ **كوتشك الشخصي:** جداول Push/Pull/Legs و Upper/Lower وبدائل إصابات الركبة والظهر والكتف.',
              '🥗 **أخصائي تغذيتك:** حساب BMR/TDEE وجداول وجبات مصرية بالجرامات وبدائلها الاقتصادية.',
            ]
          : [
              '🏋️‍♂️ **كوتش جيم كامل:** جداول Push/Pull/Legs و Upper/Lower وبدائل إصابات الركبة والظهر والكتف.',
              '🥗 **أخصائي تغذية دقيق:** حساب BMR/TDEE بمعادلة Mifflin-St Jeor وجداول وجبات مصرية بالجرامات.',
              '📊 **فاهم المنصة بالكامل:** مربوط ببيانات ناديك ويشرح ويوجهك لكل قسم بضغطة زر.',
            ],
      highlightsEn: isFreeVisitorMode
        ? [
            '💎 Compare Plans: Starter (No AI) vs Pro + AI vs Enterprise.',
            '🥗 Quick Calorie Estimate: Share your weight for a quick daily estimate.',
            '🎁 Free 7-Day Trial: Explore free starter workouts & diets.',
          ]
        : isMemberAccount
          ? [
              '🏋️‍♂️ Personal Gym Coach: Splits, tempo, RPE, and joint-safe injury substitutions.',
              '🥗 Personal Nutritionist: Mifflin-St Jeor BMR/TDEE & gram-accurate meal plans.',
            ]
          : [
              '🏋️‍♂️ Full Pro Gym Coach: Splits, tempo, RPE, and joint-safe injury substitutions.',
              '🥗 Clinical Sports Nutritionist: Mifflin-St Jeor BMR/TDEE & gram-accurate Egyptian meal plans.',
              '📊 Full Platform Intelligence: Connected to live gym CRM data and all platform sections.',
            ],
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const activeMemory = extractConversationMemory(messages, '');

  const liveCtx: LivePlatformContext = {
    gymNameAr: activeTenantCustom?.nameAr || 'TitanFit',
    gymNameEn: activeTenantCustom?.nameEn || 'TitanFit',
    members,
    plans,
    invoices,
    classes,
    staff,
    branches,
    customWorkoutsCount: customWorkouts.length,
    customRecipesCount: customRecipes.length,
  };

  const handleSendQuery = (customQuery?: string) => {
    if (!canUseAi) return;
    const text = (customQuery ?? inputText).trim();
    if (!text) return;

    const userMsg: AssistantReply = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      textAr: text,
      textEn: text,
    };

    const replyData = isFreeVisitorMode
      ? buildPublicFreeVisitorReply(text, messages)
      : buildSmartReply(text, messages, isGymOwnerAccount, liveCtx);
    const aiMsg: AssistantReply = {
      id: `ai-${Date.now() + 1}`,
      sender: 'AI',
      ...replyData,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    if (!customQuery) setInputText('');
  };

  const handleExecuteNavigation = (msg: AssistantReply) => {
    if (!isGymOwnerAccount && !isFreeVisitorMode) return;
    if (msg.actionSection) {
      setActiveSection(msg.actionSection);
      if (msg.actionScrollId) {
        setTimeout(() => {
          document.getElementById(msg.actionScrollId!)?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      showToast(
        isAr
          ? `🤖 تم توجيهك بواسطة المساعد الذكي إلى: ${msg.actionLabelAr || msg.actionSection}`
          : `🤖 Smart Assistant navigated you to: ${msg.actionLabelEn || msg.actionSection}`,
      );
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Pill in Bottom Corner (Compact on Mobile, Rich on Tablet/Desktop) */}
      <div className="fixed bottom-4 end-3 z-50 flex flex-col items-end gap-2 sm:bottom-5 sm:end-5">
        <motion.button
          type="button"
          data-testid="smart-ai-assistant-launcher"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen((o) => !o)}
          className={`flex items-center gap-2 rounded-full border px-3 py-2.5 text-xs font-black shadow-2xl transition sm:gap-2.5 sm:px-4 sm:py-3 ${
            canUseAi
              ? 'border-amber-400/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white ring-2 ring-amber-500/30 hover:ring-amber-400 dark:from-amber-500 dark:via-[#D4AF37] dark:to-amber-500 dark:text-slate-950'
              : 'border-slate-700 bg-slate-900/95 text-slate-200 ring-2 ring-slate-700/50 hover:border-amber-500/50'
          }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              canUseAi
                ? 'bg-amber-500 text-slate-950 dark:bg-slate-950 dark:text-amber-400'
                : 'bg-slate-800 text-amber-400'
            }`}
          >
            {canUseAi ? <Bot className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
          </span>
          <div className="text-start">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-black leading-none sm:text-xs">
                {isFreeVisitorMode
                  ? isAr
                    ? 'مساعد الزوار (AI مجاني)'
                    : 'Free Visitor AI'
                  : isMemberAccount
                    ? isAr
                      ? 'كوتش التمرين والتغذية (AI)'
                      : 'Personal Coach & Diet AI'
                    : isAr
                      ? 'كوتش الجيم وأخصائي التغذية (AI Pro)'
                      : 'AI Gym Coach & Nutritionist'}
              </p>
              {!canUseAi && !isMemberAccount && (
                <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400 border border-amber-500/40">
                  PRO
                </span>
              )}
              {isFreeVisitorMode && (
                <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-300 border border-emerald-500/40">
                  FREE
                </span>
              )}
            </div>
            <p className="mt-0.5 hidden text-[10px] font-bold text-amber-300 dark:text-slate-800 sm:block">
              {!canUseAi
                ? isMemberAccount
                  ? isAr
                    ? '🔒 غير مفعل حالياً في ناديك'
                    : '🔒 Not enabled by your club'
                  : isAr
                    ? '🔒 متاح في باقة Pro و Enterprise — اضغط للترقية'
                    : '🔒 Available in Pro & Enterprise — Click to Upgrade'
                : isFreeVisitorMode
                  ? isAr
                    ? 'مهام الزوار: الباقات + السعرات السريعة ✨'
                    : 'Visitor Tasks: Plans + Quick Estimates ✨'
                  : isMemberAccount
                    ? isAr
                      ? 'مدربك الشخصي وأخصائي التغذية الخاص بك ✨'
                      : 'Your Personal Coach & Sports Nutritionist ✨'
                    : isAr
                      ? isGymOwnerAccount
                        ? 'كوتش جيم + أخصائي تغذية + خبير المنصة ✨'
                        : 'كوتش جيم + أخصائي تغذية ذكي فوري ✨'
                      : 'Pro Coach + Nutritionist + Platform AI ✨'}
            </p>
          </div>
        </motion.button>
      </div>

      {/* Interactive Drawer / Modal (Responsive across Mobile, Tablet & Desktop) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-testid="smart-ai-assistant-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-18 start-2.5 end-2.5 z-50 flex h-[78dvh] max-h-[85dvh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0B0F19] sm:start-auto sm:bottom-20 sm:end-6 sm:h-[640px] sm:w-[430px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-3 text-white dark:border-slate-800 sm:px-5 sm:py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md sm:h-10 sm:w-10">
                  {canUseAi ? <Bot className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-xs font-black text-white sm:text-sm">
                      {isFreeVisitorMode
                        ? isAr
                          ? 'المساعد المجاني للزوار (AI)'
                          : 'TitanFit Free Visitor AI'
                        : isMemberAccount
                          ? isAr
                            ? 'كوتش التمرين والتغذية الشخصي (AI)'
                            : 'Personal Coach & Nutrition AI'
                          : isAr
                            ? 'كوتش الجيم وأخصائي التغذية (AI Pro)'
                            : 'TitanFit AI Coach & Nutritionist'}
                    </h3>
                    {isFreeVisitorMode ? (
                      <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-300 border border-emerald-500/40">
                        {isAr ? 'مهام محددة' : 'Visitor Edition'}
                      </span>
                    ) : canUseAi ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    ) : !isMemberAccount ? (
                      <span className="rounded-md bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-black text-rose-300 border border-rose-500/40">
                        {isAr ? 'مغلق في Starter' : 'Locked in Starter'}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-300">
                    <span>
                      {!canUseAi
                        ? isMemberAccount
                          ? isAr
                            ? 'تواصل مع إدارة ناديك لتفعيل المساعد الذكي'
                            : 'Contact your gym management to enable AI'
                          : isAr
                            ? 'حصرياً في باقة Pro و Enterprise'
                            : 'Exclusive to Pro & Enterprise Plans'
                        : isFreeVisitorMode
                          ? isAr
                            ? 'النسخة الاحترافية الكاملة متاحة في باقة Pro + AI'
                            : 'Full Pro AI Coach unlocked in Pro + AI'
                          : isMemberAccount
                            ? isAr
                              ? 'مدربك الشخصي وأخصائي التغذية الخاص بك في الجيم'
                              : 'Your personal gym coach & sports nutritionist'
                            : isAr
                              ? 'مدرب جيم + أخصائي تغذية + خبير المنصة'
                              : 'Gym Coach + Nutritionist + Platform Guide'}
                    </span>
                    {canUseAi && activeMemory.weightKg && (
                      <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                        {activeMemory.weightKg}kg{' '}
                        {activeMemory.goal === 'CUT'
                          ? '• تنشيف'
                          : activeMemory.goal === 'BULK'
                            ? '• تضخيم'
                            : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* IF NOT ALLOWED -> MEMBER SEES CLEAN CLUB NOTICE; OWNER SEES PRO UPGRADE GATE */}
            {!canUseAi ? (
              isMemberAccount ? (
                <div
                  data-testid="ai-member-disabled-notice"
                  className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-center text-white"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    <Lock className="h-7 w-7" />
                  </div>
                  <h4 className="mt-4 text-base font-black text-white">
                    {isAr
                      ? 'المساعد الذكي الشخصي غير مفعل في ناديك حالياً'
                      : 'Personal AI Coach is currently disabled by your gym'}
                  </h4>
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-300">
                    {isAr
                      ? 'يرجى التواصل مع إدارة ناديك أو مدربك الشخصي لمتابعة جدول التمرين والنظام الغذائي الخاص بك.'
                      : 'Please contact your gym management or personal trainer for your training and nutrition plan.'}
                  </p>
                </div>
              ) : (
              <div
                data-testid="ai-starter-paywall-gate"
                className="flex flex-1 flex-col justify-between overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-white"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3.5 py-1.5 text-xs font-black text-amber-300">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <span>
                      {isAr
                        ? `باقتك الحالية: ${activePlanConfig.nameAr} (بدون AI)`
                        : `Current Plan: ${activePlanConfig.nameEn} (No AI)`}
                    </span>
                  </div>

                  <h4 className="text-lg font-black leading-snug text-white">
                    {isAr
                      ? '🤖 فعّل الذكاء الاصطناعي المتكامل لناديك ومتدربيك مع باقة النمو الاحترافي (Pro + AI)!'
                      : '🤖 Unlock Full AI Gym Coach & Nutritionist with the Pro Plan!'}
                  </h4>

                  <p className="text-xs leading-relaxed text-slate-300">
                    {isAr
                      ? 'باقة البداية (Starter) لا تتضمن تشغيل المساعد الذكي (AI). عند الترقية إلى باقة Pro أو Enterprise، يعمل المساعد الذكي كفريق كامل داخل ناديك على مدار ٢٤ ساعة:'
                      : 'The Starter plan does not include AI. Upgrade to Pro or Enterprise to unlock 24/7 AI Coaching & Nutrition:'}
                  </p>

                  <div className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Dumbbell className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <div>
                        <p className="font-black text-amber-300">
                          {isAr ? '١. كوتش جيم محترف للمتدرب والمدرب:' : '1. Pro AI Gym Coach:'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-300">
                          {isAr
                            ? 'تصميم جداول Push/Pull/Legs و Upper/Lower، تحديد المجموعات والعدات والـ Tempo، وتقديم بدائل تشريحية آمنة لإصابات الركبة وأسفل الظهر والكتف.'
                            : 'Complete workout splits, sets/reps/tempo, and biomechanical injury substitutions.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 border-t border-slate-800 pt-2.5">
                      <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <div>
                        <p className="font-black text-emerald-300">
                          {isAr ? '٢. أخصائي تغذية رياضية وعلاجية:' : '2. Clinical & Sports Nutritionist:'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-300">
                          {isAr
                            ? 'حساب BMR و TDEE بمعادلة Mifflin-St Jeor، وتقسيم الماكروز (4P+4C+9F) مع جداول ٤-٥ وجبات مصرية بالجرامات وبدائل الأكل الاقتصادية والمكملات.'
                            : 'Exact Mifflin-St Jeor BMR/TDEE, macro splits, and gram-measured Egyptian meal plans.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 border-t border-slate-800 pt-2.5">
                      <Activity className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                      <div>
                        <p className="font-black text-sky-300">
                          {isAr ? '٣. خبير المنصة وتحليل بيانات الجيم لحظياً:' : '3. Live Platform & CRM Intelligence:'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-300">
                          {isAr
                            ? 'فاهم كل تفصيلة في المنصة، يقرأ إحصائيات ناديك، يبحث عن أي مشترك بالاسم أو الكود، ويوجهك لأي قسم بضغطة زر.'
                            : 'Connected to your live club CRM data and guides you through every module.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    data-testid="ai-upgrade-to-pro-btn"
                    onClick={() => {
                      setActiveSection('SETTINGS');
                      setIsOpen(false);
                      showToast(
                        isAr
                          ? '👑 اختر باقة النمو الاحترافي (Pro + AI) لتفعيل الذكاء الاصطناعي الكامل فوراً!'
                          : '👑 Select the Pro + AI plan to activate full AI features!',
                      );
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-500 px-4 py-3.5 text-xs font-black text-slate-950 shadow-xl transition hover:brightness-110"
                  >
                    <Crown className="h-4 w-4" />
                    <span>
                      {isAr
                        ? `⚡ ترقية باقتك إلى Pro + AI (${proPlanPriceEgp.toLocaleString('en-US')} ج.م/شهر)`
                        : `⚡ Upgrade to Pro + AI (${proPlanPriceEgp} EGP/mo)`}
                    </span>
                  </button>
                </div>
              </div>
              )
            ) : (
              <>
                {/* Role / Mode Quick Switcher Bar */}
                {isFreeVisitorMode ? (
                  <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                    <span>
                      {isAr
                        ? '✨ نسخة الزوار المجانية: الباقات + السعرات السريعة + التجربة المجانية'
                        : '✨ Free Visitor Edition: Plans + Quick Calories + Free Trial'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-1.5 border-b border-slate-200 bg-slate-100/90 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900/90">
                    <button
                      type="button"
                      onClick={() => setActiveQuickTab('COACH_NUTRITION')}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-black transition ${
                        activeQuickTab === 'COACH_NUTRITION'
                          ? 'bg-amber-500 text-slate-950 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <HeartPulse className="h-3.5 w-3.5" />
                      <span>
                        {isAr ? '🏋️‍♂️ كوتش الجيم وأخصائي التغذية' : '🏋️‍♂️ Coach & Nutritionist'}
                      </span>
                    </button>
                    {isGymOwnerAccount && (
                      <button
                        type="button"
                        onClick={() => setActiveQuickTab('PLATFORM')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-black transition ${
                          activeQuickTab === 'PLATFORM'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Compass className="h-3.5 w-3.5" />
                        <span>
                          {isAr ? '📊 خبير المنصة وبيانات الجيم' : '📊 Platform & Live CRM'}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* Messages Stream */}
                <div
                  ref={scrollRef}
                  className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-950/60"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'USER' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[94%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                          msg.sender === 'USER'
                            ? 'bg-amber-500 font-black text-slate-950'
                            : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                        }`}
                      >
                        <p className="whitespace-pre-line">
                          {renderFormattedAiText(isAr ? msg.textAr : msg.textEn)}
                        </p>

                        {msg.highlightsAr && msg.highlightsAr.length > 0 && (
                          <ul className="mt-2.5 space-y-2 border-t border-slate-100 pt-2.5 text-[11px] font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                            {(isAr ? msg.highlightsAr : msg.highlightsEn || msg.highlightsAr).map(
                              (h, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-1.5 whitespace-pre-line leading-relaxed"
                                >
                                  <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-500" />
                                  <span>{renderFormattedAiText(h)}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        )}

                        {(msg.followUpAr || msg.followUpEn) && (
                          <p className="mt-2.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                            {renderFormattedAiText((isAr ? msg.followUpAr : msg.followUpEn) || '')}
                          </p>
                        )}

                        {(isGymOwnerAccount || isFreeVisitorMode) && msg.actionSection && (
                          <button
                            type="button"
                            data-testid={`ai-navigate-btn-${msg.actionSection}`}
                            onClick={() => handleExecuteNavigation(msg)}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-emerald-500"
                          >
                            <Compass className="h-4 w-4" />
                            <span>{isAr ? msg.actionLabelAr : msg.actionLabelEn}</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {msg.sender === 'AI' && (
                          <div
                            data-testid="ai-reply-disclaimer"
                            className="mt-2.5 flex items-center gap-1.5 border-t border-slate-100 pt-2 text-[10px] font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400"
                          >
                            <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />
                            <span>
                              {isAr
                                ? msg.disclaimerAr || AI_DISCLAIMER_AR
                                : msg.disclaimerEn || AI_DISCLAIMER_EN}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Quick Topic Chips based on Tier & activeQuickTab */}
                  {isFreeVisitorMode ? (
                    <div data-testid="ai-free-visitor-topics" className="pt-1">
                      <p className="mb-2 text-[11px] font-black text-slate-500 dark:text-slate-400">
                        ✨{' '}
                        {isAr
                          ? 'مهام مساعد الزوار المجاني (النسخة الاحترافية متاحة في Pro + AI):'
                          : 'Free Visitor AI Tasks (Full AI Coach unlocked in Pro + AI):'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {FREE_VISITOR_TOPICS.map((topic) => (
                          <button
                            key={topic.id}
                            type="button"
                            data-testid={`ai-visitor-topic-${topic.id}`}
                            onClick={() => handleSendQuery(topic.queryAr)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs transition hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500/50"
                          >
                            <span>{isAr ? topic.labelAr : topic.labelEn}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    activeQuickTab === 'COACH_NUTRITION' && (
                      <div data-testid="ai-coach-nutrition-topics" className="pt-1">
                        <p className="mb-2 text-[11px] font-black text-slate-500 dark:text-slate-400">
                          🏋️‍♂️🥗{' '}
                          {isAr
                            ? 'استشارات فورية للمتدرب والمدرب (كوتش جيم + أخصائي تغذية):'
                            : 'Instant Coach & Sports Nutritionist Prompts:'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {TRAINEE_COACH_TOPICS.map((topic) => (
                            <button
                              key={topic.id}
                              type="button"
                              data-testid={`ai-coach-topic-${topic.id}`}
                              onClick={() => handleSendQuery(topic.queryAr)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs transition hover:border-amber-400 hover:bg-amber-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-500/50"
                            >
                              <span>{isAr ? topic.labelAr : topic.labelEn}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  {isGymOwnerAccount && activeQuickTab === 'PLATFORM' && (
                    <div data-testid="ai-owner-quick-buttons" className="pt-1">
                      <p className="mb-2 text-[11px] font-black text-slate-500 dark:text-slate-400">
                        👑{' '}
                        {isAr
                          ? 'تحكم ذكي وتقارير لحظية لصاحب الجيم والمدرب:'
                          : 'Gym Owner Live CRM & Platform Controls:'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {OWNER_QUICK_TOPICS.map((topic) => {
                          const Icon = topic.icon;
                          return (
                            <button
                              key={topic.id}
                              type="button"
                              data-testid={`ai-topic-${topic.id}`}
                              onClick={() => handleSendQuery(topic.queryAr)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs transition hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500/50"
                            >
                              <Icon className="h-3.5 w-3.5 text-emerald-500" />
                              <span>{isAr ? topic.labelAr : topic.labelEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Persistent AI Disclaimer Footer */}
                <div
                  data-testid="ai-footer-disclaimer"
                  className="border-t border-amber-500/20 bg-amber-50/90 px-3.5 py-1.5 text-center text-[10px] font-bold text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                >
                  {isAr
                    ? '⚠️ تنبيه: هذا المساعد الذكي (AI) قد يخطئ كأي ذكاء اصطناعي آخر — استشر المختص دائماً.'
                    : '⚠️ Note: This AI assistant can make mistakes like any AI — always consult a specialist.'}
                </div>

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendQuery();
                  }}
                  className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <input
                    type="text"
                    data-testid="smart-ai-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isFreeVisitorMode
                        ? isAr
                          ? 'اسأل عن الباقات، حاسبة السعرات السريعة، أو التجربة المجانية...'
                          : 'Ask about SaaS plans, quick calorie calculator, or the 7-day free trial...'
                        : isMemberAccount
                          ? isAr
                            ? 'اسأل الكوتش عن تمرينك، السعرات، أو نظامك الغذائي...'
                            : 'Ask your Coach about workouts, macros, or nutrition...'
                          : isAr
                            ? 'اسأل الكوتش أو أخصائي التغذية أو اكتب اسم مشترك/تقرير الجيم...'
                            : 'Ask the Gym Coach, Nutritionist, or look up a member/gym report...'
                    }
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    data-testid="smart-ai-send-btn"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-xs transition hover:bg-amber-400"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
