'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Compass,
  CreditCard,
  Database,
  Dumbbell,
  Send,
  Sparkles,
  UserPlus,
  Utensils,
  Video,
  X,
} from 'lucide-react';
import { usePlatformStore, type WorkspaceSection } from '../lib/platform-store';

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
  goal: 'CUT' | 'BULK' | 'RECOMP' | null;
  daysPerWeek: number | null;
  place: 'GYM' | 'HOME' | null;
}

const AI_DISCLAIMER_AR =
  '⚠️ ملاحظة: أنا مساعد ذكي (AI Gym & Nutritionist) وممكن أغلط زي أي ذكاء اصطناعي آخر — المعلومات هنا استرشادية ولا تغني عن استشارة الطبيب أو المختص.';
const AI_DISCLAIMER_EN =
  '⚠️ Note: I am an AI Gym & Nutritionist and can make mistakes like any AI — always verify critical health decisions with a qualified professional.';

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
 * Extracts cumulative user context (weight, height, age, goal, training days, home vs gym)
 * from the entire conversation history so follow-up turns work like ChatGPT / Claude.
 */
function extractConversationMemory(history: AssistantReply[], latestQuery: string): ConversationMemory {
  const mem: ConversationMemory = {
    weightKg: null,
    heightCm: null,
    age: null,
    goal: null,
    daysPerWeek: null,
    place: null,
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
 * Quick buttons shown strictly to authenticated Gym Owners / Admins
 */
const OWNER_QUICK_TOPICS: Array<{
  id: string;
  labelAr: string;
  labelEn: string;
  queryAr: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
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
    id: 'database-isolation',
    labelAr: '🔒 عزل الداتابيز الخاصة بناديك (RLS)',
    labelEn: '🔒 Per-gym database isolation (RLS)',
    queryAr: 'اشرحلي إزاي كل صاحب جيم بيكون ليه قاعدة بيانات عملاء خاصة بيه فقط ومعزولة؟',
    icon: Database,
  },
  {
    id: 'payment-gateways',
    labelAr: '💳 بوابات الدفع المصرية والفواتير',
    labelEn: '💳 Egyptian Payment Gateways & VAT',
    queryAr: 'إزاي بتشتغل بوابات الدفع المصرية والفواتير الضريبية في المنصة؟',
    icon: CreditCard,
  },
  {
    id: 'self-plan',
    labelAr: '📅 معاينة خطة الـ ٧ أيام للمتدربين',
    labelEn: '📅 Preview 7-day member workout plan',
    queryAr: 'وريني خطة التدريب المجانية الـ 7 أيام وإزاي المتدرب بيتابع نفسه',
    icon: Dumbbell,
  },
  {
    id: 'calc-macros',
    labelAr: '🥗 حاسبة السعرات والماكروز (4P+4C+9F)',
    labelEn: '🥗 Macro & Calorie Calculator',
    queryAr: 'عايز أحسب سعراتي اليومية والماكروز وأشوف وجبات اقتصادية',
    icon: Utensils,
  },
];

/**
 * Context-Aware Multi-Turn Conversational AI Engine (ChatGPT / Claude Style)
 */
function buildSmartReply(
  query: string,
  history: AssistantReply[],
  isGymOwnerAccount: boolean,
): Omit<AssistantReply, 'id' | 'sender'> {
  const q = normalizeArabicText(query);
  const mem = extractConversationMemory(history, query);

  // =========================================================================
  // 1. GYM OWNER OPERATIONAL QUERIES (Only when logged in as Gym Owner / Admin)
  // =========================================================================
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
        'نظام TitanFit مبني بمعمارية Multi-Tenant مع عزل صارم لبيانات كل جيم (Per-Gym Isolated Database Partition): كل نادي يحصل على معرف مستقل (tenant_id / tenantSlug) محمي على مستوى قاعدة البيانات PostgreSQL بخاصية FORCE ROW LEVEL SECURITY (RLS) بالإضافة إلى عزل مساحة التخزين والمزامنة لكل جيم.',
      textEn:
        'TitanFit uses strict Multi-Tenant Database Isolation: every gym tenant has a dedicated tenant_id enforced by PostgreSQL FORCE ROW LEVEL SECURITY (RLS) policies and isolated tenant state partitions.',
      highlightsAr: [
        'عزل كامل للعملاء: صاحب الجيم (أ) لا يمكنه أبداً رؤية أعضاء أو فواتير أو باقات أو فيديوهات الجيم (ب).',
        'كود انضمام خاص لكل جيم (Gym Secret Code): يدخل به المتدرب مباشرة على تطبيق الجيم الخاص به فقط.',
        'سجل تدقيق أمني غير قابل للحذف (Immutable Audit Log) لكل عملية داخل النادي.',
      ],
      highlightsEn: [
        'Zero cross-tenant data leakage enforced via PostgreSQL RLS policies.',
        'Dedicated Gym Secret Code routes trainees strictly to their own club portal.',
        'Append-only audit trail per tenant.',
      ],
      actionSection: 'SUPER_ADMIN',
      actionLabelAr: '🔒 استعرض لوحة عزل الأندية وقواعد البيانات (SaaS Control Plane)',
      actionLabelEn: '🔒 View Multi-Tenant SaaS & DB Isolation Console',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  if (
    isGymOwnerAccount &&
    (q.includes('دفع') ||
      q.includes('فوري') ||
      q.includes('انستاباي') ||
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
        'Egyptian payment gateways (Paymob Card, Fawry Reference Code, InstaPay IPA, and Cash POS) are integrated in the Billing Cashier with 14% VAT calculation and printable PDF receipts:',
      highlightsAr: [
        'بطاقات بنكية (Paymob): توليد طلب دفع ورابط دفع إلكتروني.',
        'فوري (Fawry): توليد كود مرجعي مكون من ١٠ أرقام صالح لمدة ٤٨ ساعة.',
        'إنستاباي (InstaPay): التحويل على عنوان الدفع اللحظي مع تسجيل رقم المرجع (IPA Reference).',
        'كاش (Cash POS): تحصيل نقدي فوري في الاستقبال مع طباعة إيصال PDF.',
      ],
      highlightsEn: [
        'Paymob Card checkout token generation.',
        'Fawry 10-digit reference code generation.',
        'InstaPay IPA reference verification.',
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
        'اضغط على أيقونة التعديل أو الحذف بجانب أي عضو أو باقة أو مكمل غذائي لإدارته بالكامل.',
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
  // 2. NATURAL GREETINGS & SMALL TALK (ChatGPT / Claude Human-like Warmth)
  // =========================================================================
  const isPureGreeting =
    /^(السلام عليكم|سلام عليكم|وعليكم السلام|اهلا|مرحبا|صباح الخير|مساء الخير|ازيك|عامل ايه|اخبارك|هاي|هلا|يا كابتن|كابتن|hello|hi|hey)/.test(
      q,
    ) && q.split(/\s+/).length <= 7;

  if (isPureGreeting) {
    const hasالسلام = q.includes('سلام');
    return {
      textAr: hasالسلام
        ? 'وعليكم السلام ورحمة الله وبركاته! أهلاً وسهلاً بك يا بطل، نورتني 🤝✨ أنا معاك كمدربك الشخصي وأخصائي التغذية الرياضية. احكيلي عنك: وزنك وطولك كام تقريباً؟ وهدفك الحالي إيه (تخسيس وحرق دهون، ولا زيادة عضل وتضخيم، ولا شد الجسم واللياقة)؟'
        : 'أهلاً وسهلاً بك يا بطل! أنا بخير الحمد لله وجاهز أساعدك توصل لأفضل فورمة 💪🥗. قولي وزنك وطولك كام تقريباً، وهدفك إيه الفترة دي عشان أفصل لك خطة تدريب وتغذية على مقاسك بالظبط؟',
      textEn:
        'Peace and blessings be upon you! Welcome champion 🤝✨ I am here as your personal trainer and sports nutritionist. Tell me your approximate weight, height, and current goal (fat loss, muscle building, or body recomposition) so I can design a custom plan just for you!',
      highlightsAr: [
        'لو هدفك تخسيس: قولي مثلاً «وزني 95 كيلو وعايز أخس» وهحسبلك سعراتك ووجباتك فوراً.',
        'لو عايز جدول متكامل: قولي بتتمرن كام يوم في الأسبوع (في الجيم أو البيت) وهرتبلك خطة واضحة خطوة بخطوة.',
      ],
      highlightsEn: [
        'For fat loss: Tell me e.g. "I weigh 95kg and want to lose fat" for exact macros and meals.',
        'For a structured split: Tell me how many days you can train (Gym or Home) for a complete roadmap.',
      ],
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // Thanks / Appreciation
  if (/^(شكرا|متشكر|تسلم|ربنا يباركلك|جزاك الله|الله يكرمك|عاش|ممتاز|حلو اوي|تمام شكرا|thanks|thank you)/.test(q) && q.split(/\s+/).length <= 6) {
    const wText = mem.weightKg ? ` لوزنك (${mem.weightKg} كجم)` : '';
    return {
      textAr: `العفو يا بطل، على الرحب والسعة دايماً! 🙌💪 أهم حاجة الاستمرارية وعدم الاستعجال. أنا مسجل عندي تفاصيلك${wText}، ولو احتجت في أي وقت نعدل أكلات في الدايت، أو نشوف بدائل تمارين، أو تسأل عن مكملات، ابعتلي فوراً!`,
      textEn: `You're very welcome champion! 🙌💪 Consistency is everything. Anytime you want to swap a meal, adjust an exercise, or ask about recovery, just message me!`,
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 3. FOLLOW-UP OR DIRECT REQUEST FOR A "CLEAR COMPLETE PLAN / ROADMAP"
  //    (e.g., "طب قولي خطة واضحة وكويسه", "عايز خطة كاملة", "امشي ازاي", "جدول واضح")
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
    q.includes('clear plan') ||
    q.includes('roadmap');

  if (asksForClearPlan) {
    const w = mem.weightKg || 90;
    const isCutting = mem.goal !== 'BULK'; // Default to fat-loss/recomp if user previously asked to lose weight or didn't specify bulk
    const days = mem.daysPerWeek || 4;
    const isHome = mem.place === 'HOME';

    if (isCutting) {
      const targetWeight8Wks = Math.max(55, w - 7);
      const proteinG = Math.round(w * 2.0);
      const fatsG = Math.round(w * 0.75);
      const rawKcal = Math.round(w * 23.5);
      const carbsG = Math.max(90, Math.round((rawKcal - (proteinG * 4 + fatsG * 9)) / 4));
      const exactKcal = proteinG * 4 + carbsG * 4 + fatsG * 9;

      return {
        textAr: mem.weightKg
          ? `عيوني يا بطل! بما إنك قولتلي إن وزنك **${w} كجم** وهدفك تنزل دهون بصحة ومن غير ترهلات، دي **خطتك الواضحة المتكاملة لمدة 8 أسابيع** (تغذية + تمرين ${isHome ? 'منزلي' : 'جيم'} ${days} أيام + كارديو ومتابعة) عشان تنزل من **${w} كجم إلى ${targetWeight8Wks} كجم** صافي دهون:`
          : `عيوني يا بطل! دي **خطة واضحة ومتكاملة خطوة بخطوة لمدة 8 أسابيع** (تجمع بين التغذية المحسوبة + تمرين المقاومة + الكارديو الذكي) عشان تشوف فرق حقيقي في مقاساتك وشكل جسمك من أول شهر:`,
        textEn: `Here is your complete, step-by-step **8-Week Transformation Blueprint** tailored for ${w}kg (${exactKcal} kcal/day, ${days} days/week training + cardio):`,
        highlightsAr: [
          `🎯 الهدف الرقمي (8 أسابيع): نزول صحي بمعدل 0.8 إلى 1 كجم دهون أسبوعياً (إجمالي -7 إلى -8 كجم دهون صافية) مع شد العضلات ومحيط الوسط.`,
          `🥗 ١. خطة الأكل اليومية الثابتة (${exactKcal} سعرة — ${proteinG}g بروتين • ${carbsG}g كارب • ${fatsG}g دهون):\n   • الفطور (9 ص): 3 بيضات مسلوقة + 100 جم جبن قريش + نصف رغيف بلدي أسمر + خيار وورقيات.\n   • الغداء (3 م): 200 جم صدور دجاج أو سمك مشوي + 150 جم أرز مسلوق (6 ملاعق) + طبق سلطة خضراء كبير.\n   • سناك (6 م): ثمرة تفاح أو جوافة + كوب زبادي يوناني أو 15 حبة لوز.\n   • العشاء (9 م): علبة تونة مصفاة بالليمون أو 150 جم جبن قريش + بيضة مسلوقة.`,
          isHome
            ? `🏋️‍♂️ ٢. جدول التمرين المنزلي (${days} أيام أسبوعياً):\n   • السبت (علوي دفع): ضغط على الأرض أو الحائط 4×12 + ضغط أكتاف بالدمبل أو زجاجات مياه 4×15 + ترايسبس على الكرسي 3×12.\n   • الأحد (سفلي وبطن): سكوات بوزن الجسم 4×15 + طعن ثابت (Lunges) 3×12 + بلانك 3×45 ثانية.\n   • الثلاثاء (سحب وظهر): تجديف بالدمبل أو حبل المقاومة 4×12 + بايسبس تبادل 3×15.\n   • الخميس (حرق شامل HIIT): 20 دقيقة تمارين هوائية متقطعة (مشية سريعة + نط حبل خفيف).`
            : `🏋️‍♂️ ٢. جدول تمرين الجيم (${days} أيام مقاومة + 20 دقيقة كارديو بعد التمرين):\n   • اليوم الأول (سبت — دفع: صدر وكتف وترايسبس): بنش مستوي 4×10 + ضغط دمبل عالي 3×12 + رفرفة كتف جانبي 4×15 + ترايسبس حبل 3×12 + 20 دقيقة مشي بميل (Incline Treadmill).\n   • اليوم الثاني (أحد — سحب: ظهر وبايسبس): سحب عالي واسع 4×10 + تجديف بار أو ماكينة 4×10 + سحب أرضي ضيق 3×12 + بايسبس دمبل 3×12.\n   • الاثنين: راحة من الجيم (اكتفِ بـ 8,000 خطوة مشي خفيف).\n   • اليوم الثالث (ثلاثاء — أرجل وبطن لحرق مضاعف): سكوات أو Leg Press 4×10 + ديدليفت روماني للخلفية 3×12 + أمامي وخلفي ماكينة 3×15 + بلانك للبطن 3×45 ثانية.\n   • اليوم الرابع (أربعاء — علوي شامل لحرق الدهون): تمرين شامل للصدر والظهر والكتف بوزن متوسط وراحة 60 ثانية بين المجموعات + 20 دقيقة عجلة أو مشي سريع.`,
          `💧 ٣. الـ 3 عادات اليومية التي تضمن النتيجة:\n   • اشرب ${Math.max(3.5, Math.round(w * 0.04 * 10) / 10)} لتر مياه يومياً (كوبين قبل كل وجبة).\n   • نم 7 إلى 8 ساعات ليلاً (لأن قلة النوم ترفع هرمون الكورتيزول وتحبس المياه).\n   • اوزن نفسك مرة واحدة فقط كل يوم سبت صباحاً على الريق وقيس محيط الوسط بالمازورة.`,
        ],
        highlightsEn: [
          `🎯 8-Week Target: Drop from ${w}kg to ${targetWeight8Wks}kg (~0.8-1kg pure fat/week) while preserving lean muscle.`,
          `🥗 Daily Nutrition (${exactKcal} kcal — ${proteinG}g P / ${carbsG}g C / ${fatsG}g F): 3 eggs + 100g cottage cheese breakfast, 200g chicken/fish + 150g rice lunch, Greek yogurt snack, tuna/cottage cheese dinner.`,
          `🏋️‍♂️ ${days}-Day Training Split: Day 1 Push + 20m Incline Walk, Day 2 Pull + Core, Day 3 Rest (8k steps), Day 4 Legs & Glutes, Day 5 Upper Body Metabolic Conditioning.`,
          `💧 Daily Rules: Drink ${Math.max(3.5, Math.round(w * 0.04 * 10) / 10)}L water, hit 8,000 steps, and weigh in once a week on Saturday morning.`,
        ],
        followUpAr:
          '💡 إيه رأيك في الخطة دي؟ لو فيه أكلة مش بتحبها في الفطور أو الغداء، أو لو عايز نعدل مواعيد التمرين حسب شغلك، قولي وهنعدلها مع بعض حالاً!',
        followUpEn:
          '💡 How does this plan look to you? Tell me if you want to swap any food or adjust the training days to fit your schedule!',
        ...(isGymOwnerAccount
          ? {
              actionSection: 'FREE_TRIAL_HUB' as WorkspaceSection,
              actionLabelAr: '📅 افتح جدول الـ ٧ أيام التفاعلي ومسجل المتابعة',
              actionLabelEn: '📅 Open Interactive 7-Day Roadmap & Tracker',
            }
          : {}),
        disclaimerAr: AI_DISCLAIMER_AR,
        disclaimerEn: AI_DISCLAIMER_EN,
      };
    } else {
      // BULK / MUSCLE GAIN COMPLETE PLAN
      const targetWeight8Wks = w + 4;
      const proteinG = Math.round(w * 2.0);
      const fatsG = Math.round(w * 1.0);
      const rawKcal = Math.round(w * 34);
      const carbsG = Math.max(220, Math.round((rawKcal - (proteinG * 4 + fatsG * 9)) / 4));
      const exactKcal = proteinG * 4 + carbsG * 4 + fatsG * 9;

      return {
        textAr: `عيوني يا بطل! بما إن هدفك **بناء عضل صافي وتضخيم نظيف (Lean Bulk)** لوزن **${w} كجم**، دي **خطتك المتكاملة لمدة 8 أسابيع** للوصول إلى **${targetWeight8Wks} كجم** عضل صافي بدون دهون زائدة:`,
        textEn: `Here is your complete **8-Week Lean Bulking Blueprint** for ${w}kg (${exactKcal} kcal/day):`,
        highlightsAr: [
          `🥗 ١. فائض السعرات النظيف (${exactKcal} سعرة — ${proteinG}g بروتين • ${carbsG}g كارب • ${fatsG}g دهون):\n   • الفطور: 4 بيضات + 80 جم شوفان بالحليب والموز + ملعقة زبدة فول سوداني.\n   • الغداء: 200 جم صدور دجاج أو لحم بقري صافي + 250 جم أرز أو مكرونة + سلطة.\n   • وجبة قبل التمرين: ثمرة موز + 50 جم شوفان أو بطاطا حلوة + قهوة سادة.\n   • العشاء: 150 جم جبن قريش أو علبة تونة + رغيف بلدي + زيت زيتون.`,
          `🏋️‍♂️ ٢. جدول التدرج في الأحمال (Push / Pull / Legs — 4 إلى 5 أيام):\n   • ركّز على الحركات المركبة (السكوات، البنش بريس، السحب العالي، التجديف بالبار، الرفعة الرومانية) في نطاق 8 إلى 10 عدات مع زيادة الوزن تدريجياً كل أسبوع.`,
          `⚡ ٣. الاستشفاء والمكملات: 5 جم كرياتين مونوهيدرات يومياً + شرب 4 لتر مياه + نوم 8 ساعات ليلاً.`,
        ],
        highlightsEn: [
          `🥗 Lean Surplus (${exactKcal} kcal — ${proteinG}g P / ${carbsG}g C / ${fatsG}g F).`,
          `🏋️‍♂️ Progressive Overload PPL Split focusing on compound lifts in the 8–10 rep range.`,
          `⚡ Recovery: 5g Creatine Monohydrate daily + 4L water + 8 hours sleep.`,
        ],
        followUpAr: '💡 تحب أفصل لك أوزان وعدات كل يوم تمرين بالتفصيل؟',
        followUpEn: '💡 Would you like me to break down the exact sets and reps for each workout day?',
        disclaimerAr: AI_DISCLAIMER_AR,
        disclaimerEn: AI_DISCLAIMER_EN,
      };
    }
  }

  // =========================================================================
  // 4. FOOD SWAPS / ECONOMIC DIET / SPECIFIC MEAL QUESTIONS
  // =========================================================================
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
    const w = mem.weightKg || 85;
    return {
      textAr: `ولا يهمك خالص يا بطل! أهم ميزة في التغذية الذكية إننا بنبدل أي أكلة مش بتحبها ببديل يعطيك **نفس جرامات البروتين والسعرات بالظبط** لوزنك (${w} كجم) وبأقل تكلفة:`,
      textEn: `No problem at all! Here are exact gram-for-gram protein and carb swaps tailored for your ${w}kg plan:`,
      highlightsAr: [
        '🔄 بدائل البروتين في الغداء (كل بديل = حوالي 45 جم بروتين صافي):\n   • 200 جم صدور دجاج مشوية = 250 جم سمك بلطي أو ماكريل مشوي = 200 جم كبدة دجاج أو بقري = 220 جم لحم قليل الدهن = علبة ونصف تونة مصفاة.',
        '🔄 بدائل الفطور والعشاء (لو مش بتحب الجبن القريش أو البيض):\n   • 150 جم جبن قريش = كوب زبادي يوناني + 2 بيضة مسلوقة = 6 ملاعق فول مدمس بالليمون والكمون بدون زيت غزير + بيضتين = 100 جم شوفان بالحليب.',
        '🔄 بدائل النشويات الصحية (كل بديل = حوالي 40 جم كاربوهيدرات):\n   • 150 جم أرز مسلوق (6 ملاعق) = 200 جم بطاطس أو بطاطا مسلوقة/مشوية بالفرن = نصف رغيف بلدي أسمر = 55 جم شوفان جاف.',
      ],
      highlightsEn: [
        '🔄 Lunch Protein Swaps (~45g Protein): 200g chicken breast = 250g grilled tilapia = 200g liver = 1.5 drained tuna tins.',
        '🔄 Breakfast/Dinner Swaps: 150g cottage cheese = Greek yogurt + 2 eggs = 6 tbsp fava beans (foul) + 2 eggs.',
        '🔄 Carb Swaps (~40g Carbs): 150g cooked rice = 200g baked potato/sweet potato = half whole-wheat baladi loaf = 55g oats.',
      ],
      followUpAr: '💡 قولي إيه أكتر أكلات بتحبها في يومك وهركبلك منها ٣ وجبات مشبعة على مزاجك!',
      followUpEn: '💡 Tell me your favorite everyday foods and I will build your 3 daily meals around them!',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 5. WEIGHT LOSS / CUTTING / CALORIE & MACRO STATEMENT (e.g. "بص وزني 95 كيلو وعايز اخس اعمل ايه")
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
    q.includes('نظام غذائي') ||
    q.includes('وزني') ||
    q.includes('cut') ||
    q.includes('diet')
  ) {
    const w = mem.weightKg || 85;
    const targetGoalWeight = Math.max(55, w - 10);
    const proteinG = Math.round(w * 2.0);
    const fatsG = Math.round(w * 0.75);
    const rawKcal = Math.round(w * 23.5);
    const carbsG = Math.max(90, Math.round((rawKcal - (proteinG * 4 + fatsG * 9)) / 4));
    const exactKcal = proteinG * 4 + carbsG * 4 + fatsG * 9;

    return {
      textAr: `أهلاً بك يا بطل! خطوة ممتازة إنك قررت تبدأ صح 💪🔥. لوزن **${w} كجم**، عشان تنزل دهون صافية وتوصل لـ **${targetGoalWeight} كجم** خلال 10 إلى 12 أسبوع **بدون حرمان أو ترهلات أو فقدان عضل**، محتاجين نمشي على عجز سعرات ذكي ومحسوب بمعادلة (4P + 4C + 9F) وهو **${exactKcal} سعرة حرارية يومياً**:`,
      textEn: `Great decision champion! 💪🔥 At **${w}kg**, to drop pure fat and reach **${targetGoalWeight}kg** safely in 10–12 weeks without muscle loss or hunger, your optimal daily target is **${exactKcal} kcal**:`,
      highlightsAr: [
        `📊 تقسيمة الماكروز اليومية لوزن ${w} كجم:\n   • البروتين: ${proteinG} جم يومياً (${proteinG * 4} كالوري) — أهم عنصر عشان يشبعك ويحمي عضلاتك.\n   • الكاربوهيدرات: ${carbsG} جم يومياً (${carbsG * 4} كالوري) — طاقة لتمرينك وتركيزك.\n   • الدهون الصحية: ${fatsG} جم يومياً (${fatsG * 9} كالوري) — لضبط الهرمونات ومعدل الحرق.`,
        `🍳 الفطور المقترح: 3 بيضات مسلوقة + 100 جم جبن قريش + نصف رغيف بلدي أسمر أو 40 جم شوفان + خيار وطماطم.`,
        `🍗 الغداء المقترح: 200 جم صدور دجاج مشوية (أو 250 جم سمك بلطي مشوي كبديل اقتصادي) + 150 جم أرز مسلوق + طبق سلطة خضراء.`,
        `🥗 العشاء المقترح: علبة تونة مصفاة من الزيت أو 150 جم جبن قريش بزيت الزيتون + ثمرة بطاطا حلوة مشوية أو كوب زبادي.`,
      ],
      highlightsEn: [
        `📊 Daily Macros for ${w}kg: ${proteinG}g Protein • ${carbsG}g Carbs • ${fatsG}g Healthy Fats (${exactKcal} kcal).`,
        `🍳 Breakfast: 3 boiled eggs + 100g cottage cheese + half whole-wheat baladi bread or 40g oats.`,
        `🍗 Lunch: 200g grilled chicken breast (or 250g grilled tilapia) + 150g cooked rice + green salad.`,
        `🥗 Dinner: Drained tuna tin or 150g cottage cheese + roasted sweet potato or Greek yogurt.`,
      ],
      followUpAr:
        `💡 تحب أحطلك دلوقتي **خطة واضحة وجدول تمارين أسبوعي** مخصص لوزن ${w} كجم؟ (اكتبلي مثلاً: «طب قولي خطة واضحة وكويسه» أو قولي بتتمرن كام يوم في الأسبوع!)`,
      followUpEn:
        `💡 Would you like me to build your **complete weekly workout & cardio roadmap** for ${w}kg next? Just ask "Give me a clear plan"!`,
      ...(isGymOwnerAccount
        ? {
            actionSection: 'PUBLIC_STOREFRONT' as WorkspaceSection,
            actionScrollId: 'free-calorie-calculator',
            actionLabelAr: '🥗 افتح حاسبة السعرات ومخطط الوجبات',
            actionLabelEn: '🥗 Open Macro Calculator & Meal Planner',
          }
        : {}),
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 6. WORKOUT SPLITS & SPECIFIC MUSCLE GROUP QUERIES
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
    q.includes('workout') ||
    q.includes('gym') ||
    q.includes('muscle')
  ) {
    const wContext = mem.weightKg ? ` (مخصص لوزنك ${mem.weightKg} كجم${mem.goal === 'CUT' ? ' مع رفع معدل حرق الدهون' : ''})` : '';
    return {
      textAr: `بصفتي مدربك الذكي (AI Gym Coach) 🏋️‍♂️: ده جدول التمارين العلمي${wContext} بنظام (Push / Pull / Legs) مع تطبيق التدرج في الأحمال وإيقاع عدات منضبط (٣ ثوانٍ نزول سلبي • ١ ثانية ثبات • ١ ثانية دفع):`,
      textEn: `As your AI Gym Coach 🏋️‍♂️: Here is your structured Push / Pull / Legs (PPL) program with controlled 3-1-1 tempo and progressive overload:`,
      highlightsAr: [
        '🔥 يوم الدفع (Push — صدر وكتف وترايسبس): ضغط بار بنش مستوي (٤×٨-١٠) + ضغط دمبل عالي ٣٠ درجة (٤×١٠) + تفتيح كابل (٣×١٢) + رفرفة كتف جانبي (٤×١٥) + دفع حبل ترايسبس (٣×١٢).',
        '💪 يوم السحب (Pull — ظهر وبايسبس): سحب مجنص عالي واسع (٤×١٠) + تجديف بالبار الحر أو الماكينة (٤×٨-١٠) + سحب أرضي ضيق (٣×١٢) + تبادل دمبل بايسبس (٣×١٢).',
        '🦵 يوم الأرجل (Legs — سفلي وبطن): سكوات بالبار أو Leg Press (٤×١٠) + ديدليفت روماني للخلفية (٤×١٠) + سمانة وبطن بلانك (٣×٤٥ ثانية).',
        mem.goal === 'CUT'
          ? '🏃‍♂️ إضافة حرق الدهون: أضف ٢٠ دقيقة مشي سريع بميل (Incline 10% • Speed 5) بعد تمرين الحديد مباشرة لحرق الدهون المخزنة.'
          : '😴 نصيحة الاستشفاء: استرح ٦٠ إلى ٩٠ ثانية بين المجموعات، ونم ٧-٨ ساعات ليلاً لأن العضلات تنمو أثناء النوم.',
      ],
      highlightsEn: [
        '🔥 Push Day (Chest/Shoulders/Triceps): Barbell Bench Press (4x8-10), Incline DB Press (4x10), Cable Fly (3x12), Lateral Raises (4x15), Triceps Pushdown (3x12).',
        '💪 Pull Day (Back/Biceps): Wide Lat Pulldown (4x10), Barbell/Machine Row (4x8-10), Seated Cable Row (3x12), DB Biceps Curl (3x12).',
        '🦵 Leg Day (Quads/Hamstrings/Core): Squat or Leg Press (4x10), Romanian Deadlift (4x10), Calf Raises & Plank (3x45s).',
      ],
      followUpAr: '💡 تحب أقولك بدائل أي تمرين لو بتتمرن في البيت بالدمبل، أو لو عندك أي ألم في الركبة أو الكتف؟',
      followUpEn: '💡 Want home dumbbell alternatives or joint-friendly modifications for knees or shoulders?',
      ...(isGymOwnerAccount
        ? {
            actionSection: 'FREE_TRIAL_HUB' as WorkspaceSection,
            actionLabelAr: '🎬 افتح صالة التمارين وخطة الـ ٧ أيام',
            actionLabelEn: '🎬 Open 7-Day Workout Studio',
          }
        : {}),
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 7. SUPPLEMENTS, INJURIES, JOINT PAIN & RECOVERY QUERIES
  // =========================================================================
  if (
    q.includes('مكمل') ||
    q.includes('كرياتين') ||
    q.includes('واي') ||
    q.includes('بروتين بودر') ||
    q.includes('حارق') ||
    q.includes('حوارق') ||
    q.includes('اصاب') ||
    q.includes('وجع') ||
    q.includes('الم') ||
    q.includes('ركب') ||
    q.includes('قطنيه') ||
    q.includes('creatine') ||
    q.includes('whey')
  ) {
    return {
      textAr:
        'سؤال مهم جداً يا بطل ⚡! خليني أوضحلك الحقيقة العلمية بدون مبالغات تجارية بخصوص المكملات وحماية المفاصل:',
      textEn:
        'Great question ⚡! Here is the science-based truth on supplements and joint-safe training:',
      highlightsAr: [
        '١. الكرياتين مونوهيدرات (Creatine Monohydrate): أفضل مكمل مدروس علمياً (٥ جرام يومياً مع شرب ٣.٥ لتر مياه)؛ بيزود القوة والتحمل العضلي ومناسب للتضخيم والتنشيف.',
        '٢. الواي بروتين (Whey Protein): مجرد أكل مجفف سريع الامتصاص؛ لو بتقفل احتياجك اليومي من الدجاج والبيض والجبن القريش والسمك، مش هتحتاجه إطلاقاً.',
        '٣. حوارق الدهون (Fat Burners): ٩٥٪ منها مجرد كافيين عالي؛ فنجان قهوة سادة قبل التمرين بـ ٣٠ دقيقة مع التزامك بعجز السعرات أقوى وآمن بمراحل!',
        '٤. لو عندك ألم في الركبة أو الكتف: استبدل السكوات الحر بـ Box Squat أو Leg Press بزاوية مريحة، وفي تمارين الصدر خلّي كوعك بزاوية ٤٥ درجة للداخل مش ٩٠ درجة مفتوحة.',
      ],
      highlightsEn: [
        '1. Creatine Monohydrate: 5g daily with 3.5L water boosts ATP strength and muscle fullness.',
        '2. Whey Protein: Only needed if you cannot hit your daily protein target from whole foods.',
        '3. Fat Burners: Mostly overpriced caffeine — black coffee 30m pre-workout + calorie deficit works best.',
        '4. Joint Safety: Tuck elbows to 45° on presses and use controlled tempos to protect shoulders and knees.',
      ],
      followUpAr: '💡 قولي لو بتحس بأي إجهاد في تمرين معين وهقولك البديل التشريحي الآمن ليه فوراً!',
      followUpEn: '💡 Let me know if any specific movement causes discomfort and I will give you a joint-safe alternative!',
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // =========================================================================
  // 8. CONTEXT-AWARE CONVERSATIONAL FALLBACK (Uses Memory if Available!)
  // =========================================================================
  if (mem.weightKg) {
    return {
      textAr: `أنا معاك يا بطل ومسجل عندي إن وزنك **${mem.weightKg} كجم**${mem.goal === 'CUT' ? ' وهدفك **حرق الدهون والتنشيف**' : mem.goal === 'BULK' ? ' وهدفك **زيادة العضلات**' : ''}! 🤖💪 قولي حابب نركز على إيه دلوقتي بالظبط؟`,
      textEn: `I'm right here with you and have your profile noted (**${mem.weightKg}kg**)! What should we focus on next?`,
      highlightsAr: [
        `اكتب «طب قولي خطة واضحة وكويسه» عشان أطلعلك خطة الـ 8 أسابيع الكاملة (تمرين + دايت + كارديو) لوزن ${mem.weightKg} كجم.`,
        'اكتب «عايز بدائل اقتصادية للأكل» لو حابب نبدل أي وجبة بأكلات بتحبها من البيت.',
        'اكتب «بتمرن في البيت» أو عدد أيام تمرينك (مثلاً: ٣ أيام أو ٤ أيام) عشان أظبطلك الجدول عليها.',
      ],
      highlightsEn: [
        `Type "Give me a clear plan" for your complete 8-week workout, cardio & meal blueprint for ${mem.weightKg}kg.`,
        'Type "Food swaps" to customize your meals with budget-friendly options.',
        'Tell me how many days you train (or if you train at home) to tailor your split.',
      ],
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  return {
    textAr: isGymOwnerAccount
      ? 'أهلاً بك يا كابتن في المساعد الذكي (AI Gym & Nutritionist + دليل لوحة الجيم)! تقدر تسألني أي سؤال في التمارين والتغذية وحساب السعرات، أو تستخدم أزرار التحكم الخاصة بصاحب الجيم بالأسفل للوصول الفوري لأي قسم في منصتك.'
      : 'أهلاً بك يا بطل! أنا مدربك الذكي وأخصائي التغذية الرياضية (AI Gym & Nutritionist) 🤖💪🥗. بتكلم معاك زي مدربك الشخصي بالظبط — قولي وزنك وطولك وهدفك وهفصل لك خطة كاملة وتمارين ودايت على مقاسك!',
    textEn: isGymOwnerAccount
      ? 'Welcome Coach! Ask me any training or nutrition question, or use your Gym Owner quick buttons below to jump directly to any club management tool.'
      : 'Hi champion! I am your conversational AI Gym Coach & Sports Nutritionist 🤖💪🥗. Share your weight, height, and goal and I will build a personalized plan and adapt it with you step by step!',
    highlightsAr: [
      'جرب تكتبلي: «وزني 95 كيلو وعايز أخس اعمل إيه؟» وبعدها اكتبلي «طب قولي خطة واضحة وكويسه».',
      'أو اسألني عن: بدائل الأكل الاقتصادية، جدول تمارين الجيم أو البيت، أو المكملات وتجنب الإصابات.',
    ],
    highlightsEn: [
      'Try typing: "I weigh 95kg and want to lose fat" and then follow up with "Give me a clear plan".',
      'Ask about budget food swaps, gym/home workout splits, or injury prevention.',
    ],
    disclaimerAr: AI_DISCLAIMER_AR,
    disclaimerEn: AI_DISCLAIMER_EN,
  };
}

export function SmartAiAssistantWidget() {
  const { locale, setActiveSection, showToast, isAuthenticated, activeRole } = usePlatformStore();
  const isAr = locale === 'ar';

  // Buttons and quick navigation are shown ONLY when logged in as a Gym Owner / Admin
  const isGymOwnerAccount =
    isAuthenticated &&
    (activeRole === 'GYM_OWNER' || activeRole === 'SUPER_ADMIN' || activeRole === 'BRANCH_MANAGER');

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<AssistantReply[]>([
    {
      id: 'welcome-ai',
      sender: 'AI',
      textAr:
        'أهلاً بك يا بطل! أنا مدربك الذكي وأخصائي التغذية الرياضية بالذكاء الاصطناعي (AI Gym & Nutritionist) 🤖💪🥗. احكيلي عن هدفك ووزنك أو اسألني أي سؤال في التمارين والدايت ونتناقش مع بعض خطوة بخطوة!',
      textEn:
        'Welcome champion! I am your conversational AI Gym Coach & Sports Nutritionist 🤖💪🥗. Tell me your weight and goal or ask any training/diet question and we will plan it together step by step!',
      highlightsAr: [
        'بفهم كلامك وبفتكر تفاصيلك طول المحادثة: قولي وزنك وهدفك، واسألني بعدها عن الخطة أو بدائل الأكل أو التمرين.',
      ],
      highlightsEn: [
        'I remember your context throughout our chat: share your weight & goal, then ask follow-up questions naturally.',
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

  const handleSendQuery = (customQuery?: string) => {
    const text = (customQuery ?? inputText).trim();
    if (!text) return;

    const userMsg: AssistantReply = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      textAr: text,
      textEn: text,
    };

    const replyData = buildSmartReply(text, messages, isGymOwnerAccount);
    const aiMsg: AssistantReply = {
      id: `ai-${Date.now() + 1}`,
      sender: 'AI',
      ...replyData,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    if (!customQuery) setInputText('');
  };

  const handleExecuteNavigation = (msg: AssistantReply) => {
    if (!isGymOwnerAccount) return;
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
      {/* Floating Launcher Pill in Bottom Corner */}
      <div className="fixed bottom-5 end-5 z-50 flex flex-col items-end gap-2">
        <motion.button
          type="button"
          data-testid="smart-ai-assistant-launcher"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-full border border-amber-400/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-3 text-xs font-black text-white shadow-2xl ring-2 ring-amber-500/30 transition hover:ring-amber-400 dark:from-amber-500 dark:via-[#D4AF37] dark:to-amber-500 dark:text-slate-950"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-slate-950 dark:bg-slate-950 dark:text-amber-400">
            <Bot className="h-4 w-4" />
          </span>
          <div className="text-start">
            <p className="text-xs font-black leading-none">
              {isAr ? 'مدربك الذكي وأخصائي التغذية (AI)' : 'AI Gym & Nutrition Coach'}
            </p>
            <p className="mt-0.5 text-[10px] font-bold text-amber-300 dark:text-slate-800">
              {isAr
                ? isGymOwnerAccount
                  ? 'وضع صاحب الجيم + توجيه سريع ✨'
                  : 'محادثة ذكية فورية ✨'
                : isGymOwnerAccount
                  ? 'Gym Owner Mode + Quick Actions ✨'
                  : 'Conversational AI Coach ✨'}
            </p>
          </div>
        </motion.button>
      </div>

      {/* Interactive Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-testid="smart-ai-assistant-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 end-4 z-50 flex h-[610px] max-h-[85vh] w-[92vw] max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0B0F19] sm:end-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-3.5 text-white dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">
                      {isAr
                        ? 'المدرب الذكي وأخصائي التغذية (AI Gym)'
                        : 'TitanFit AI Gym & Nutritionist'}
                    </h3>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-300">
                    <span>
                      {isAr
                        ? isGymOwnerAccount
                          ? 'وضع مالك النادي مفعل'
                          : 'ذاكرة محادثة تفاعلية ذكية'
                        : isGymOwnerAccount
                          ? 'Gym Owner Mode Active'
                          : 'Context-Aware AI Coach'}
                    </span>
                    {activeMemory.weightKg && (
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
                    <p className="whitespace-pre-line">{isAr ? msg.textAr : msg.textEn}</p>

                    {msg.highlightsAr && msg.highlightsAr.length > 0 && (
                      <ul className="mt-2.5 space-y-2 border-t border-slate-100 pt-2.5 text-[11px] font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                        {(isAr ? msg.highlightsAr : msg.highlightsEn || msg.highlightsAr).map(
                          (h, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 whitespace-pre-line leading-relaxed">
                              <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-500" />
                              <span>{h}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    )}

                    {(msg.followUpAr || msg.followUpEn) && (
                      <p className="mt-2.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                        {isAr ? msg.followUpAr : msg.followUpEn}
                      </p>
                    )}

                    {/* Action Buttons strictly visible ONLY to authenticated Gym Owners / Admins */}
                    {isGymOwnerAccount && msg.actionSection && (
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

                    {/* Subtle AI Disclaimer Note at bottom of AI reply */}
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

              {/* Quick Topic Buttons ONLY visible for authenticated Gym Owners / Admins */}
              {isGymOwnerAccount && (
                <div data-testid="ai-owner-quick-buttons" className="pt-1">
                  <p className="mb-2 text-[11px] font-black text-slate-500 dark:text-slate-400">
                    👑 {isAr ? 'أزرار التحكم السريع لصاحب الجيم:' : 'Gym Owner Quick Control Buttons:'}
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
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs transition hover:border-amber-400 hover:bg-amber-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-500/50"
                        >
                          <Icon className="h-3.5 w-3.5 text-amber-500" />
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
                  isAr
                    ? 'اكتب رسالتك بحرية (مثال: وزني 95 وعايز أخس / قولي خطة واضحة)...'
                    : 'Chat naturally (e.g., I weigh 95kg and want to lose fat / Give me a clear plan)...'
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
