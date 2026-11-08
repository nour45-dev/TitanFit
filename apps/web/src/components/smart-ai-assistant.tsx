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
  disclaimerAr?: string;
  disclaimerEn?: string;
}

const AI_DISCLAIMER_AR =
  '⚠️ ملاحظة هامة: أنا مساعد ذكي (AI Gym & Nutritionist) وممكن أغلط زي أي ذكاء اصطناعي آخر. المعلومات هنا استرشادية للتدريب والتغذية ولا تغني عن مراجعة الطبيب أو المختص.';
const AI_DISCLAIMER_EN =
  '⚠️ Important Note: I am an AI Gym & Nutrition assistant and can make mistakes like any AI. Always verify critical training or dietary decisions with a qualified professional.';

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
 * Smart AI Gym Coach & Sports Nutritionist Engine (for Regular Users & Trainees)
 * Also answers Gym Owner operational queries when isGymOwnerAccount is true.
 */
function buildSmartReply(
  query: string,
  isGymOwnerAccount: boolean,
): Omit<AssistantReply, 'id' | 'sender'> {
  const q = query.trim().toLowerCase();

  // Check if user mentioned a weight in kg (e.g., "80 كيلو" or "80kg" or "وزني 90")
  const weightMatch = q.match(/(\d{2,3})\s*(?:كجم|كيلو|kg)?/);
  const detectedWeightKg = weightMatch ? Number(weightMatch[1]) : null;

  // 1. Gym Owner Operational Queries (Only return navigation actions if isGymOwnerAccount is true)
  if (
    isGymOwnerAccount &&
    (q.includes('فيديو') ||
      q.includes('ملف') ||
      q.includes('pdf') ||
      q.includes('ارفع') ||
      q.includes('أرفع') ||
      q.includes('upload'))
  ) {
    return {
      textAr:
        'بصفتك صاحب الجيم، تقدر ترفع فيديوهات التمارين (ملف MP4 من جهازك أو رابط يوتيوب أو حركة تشريحية ثلاثية الأبعاد 3D) + الوصفات الغذائية المحسوبة + ملفات الـ PDF من قسم «استوديو رفع الفيديوهات والوصفات والملفات». أي محتوى بترفعُه هناك بيظهر فوراً لمتدربين ناديك فقط!',
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
      q.includes('قاعدة') ||
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
      q.includes('إنستاباي') ||
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

  // 2. AI Sports Nutritionist: Fat Loss / Cutting / Calorie & Macro Calculation
  if (
    q.includes('تنشيف') ||
    q.includes('تخسيس') ||
    q.includes('دهون') ||
    q.includes('اخس') ||
    q.includes('أخس') ||
    q.includes('سعر') ||
    q.includes('كالوري') ||
    q.includes('ماكرو') ||
    q.includes('دايت') ||
    q.includes('نظام غذائي') ||
    q.includes('تغذية') ||
    q.includes('وجب') ||
    q.includes('بروتين') ||
    q.includes('cut') ||
    q.includes('diet') ||
    q.includes('calorie')
  ) {
    const w = detectedWeightKg && detectedWeightKg >= 40 && detectedWeightKg <= 200 ? detectedWeightKg : 80;
    const proteinG = Math.round(w * 2.0);
    const fatsG = Math.round(w * 0.8);
    const targetKcal = Math.round(w * 24);
    const carbsG = Math.max(80, Math.round((targetKcal - (proteinG * 4 + fatsG * 9)) / 4));
    const exactKcal = proteinG * 4 + carbsG * 4 + fatsG * 9;

    return {
      textAr: `بصفتي أخصائي التغذية الرياضية بالذكاء الاصطناعي (AI Nutritionist) 🥗: لو هدفك حرق الدهون مع الحفاظ على الكتلة العضلية (لوزن تقريبي ${w} كجم)، فأنت تحتاج حوالي ${exactKcal} سعرة حرارية يومياً محسوبة بمعادلة الماكروز الدقيقة (4P + 4C + 9F):`,
      textEn: `As your AI Sports Nutritionist 🥗: For lean fat loss at ~${w}kg body weight, your target daily intake is ~${exactKcal} kcal (using 4P + 4C + 9F macro math):`,
      highlightsAr: [
        `الاحتياج اليومي الموصى به: ${proteinG} جم بروتين (${proteinG * 4} كالوري) • ${carbsG} جم كاربوهيدرات (${carbsG * 4} كالوري) • ${fatsG} جم دهون صحية (${fatsG * 9} كالوري).`,
        'الفطور المقترح: ٣ بيضات مسلوقة + ١٠٠ جم جبن قريش + نصف رغيف بلدي أسمر أو ٤٠ جم شوفان + خيار وطماطم.',
        'الغداء المقترح: ٢٠٠ جم صدور دجاج مشوية (أو ٢٥٠ جم سمك بلطي مشوي كبديل اقتصادي) + ١٥٠ جم أرز مسلوق + طبق سلطة خضراء.',
        'العشاء المقترح: علبة تونة مصفاة من الزيت أو ١٥٠ جم جبن قريش بزيت الزيتون + ثمرة بطاطا حلوة مشوية.',
      ],
      highlightsEn: [
        `Daily Macros: ${proteinG}g Protein • ${carbsG}g Carbs • ${fatsG}g Healthy Fats (~${exactKcal} kcal).`,
        'Breakfast: 3 boiled eggs + 100g cottage cheese + 40g oats or whole-wheat baladi bread.',
        'Lunch: 200g grilled chicken breast (or 250g grilled tilapia) + 150g basmati rice + green salad.',
        'Dinner: Drained tuna tin or 150g cottage cheese + roasted sweet potato.',
      ],
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

  // 3. AI Gym Coach: Muscle Building / Bulking / Workout Splits (Chest, Back, Legs, PPL)
  if (
    q.includes('تمرين') ||
    q.includes('تمارين') ||
    q.includes('جدول') ||
    q.includes('عضل') ||
    q.includes('تضخيم') ||
    q.includes('ضخامة') ||
    q.includes('صدر') ||
    q.includes('ظهر') ||
    q.includes('رجل') ||
    q.includes('أرجل') ||
    q.includes('كتف') ||
    q.includes('ذراع') ||
    q.includes('باي') ||
    q.includes('تراي') ||
    q.includes('خطة') ||
    q.includes('workout') ||
    q.includes('gym') ||
    q.includes('muscle')
  ) {
    return {
      textAr:
        'بصفتي مدربك الذكي (AI Gym Coach) 🏋️‍♂️: أفضل نظام علمي لبناء العضلات والقوة بدون إجهاد للجهاز العصبي هو نظام (Push / Pull / Legs) مع تطبيق مبدأ التدرج في الأحمال (Progressive Overload) وإيقاع عدات منضبط (٣ ثوانٍ نزول سلبي • ١ ثانية ثبات • ١ ثانية دفع):',
      textEn:
        'As your AI Gym Coach 🏋️‍♂️: The gold-standard hypertrophy split is Push / Pull / Legs (PPL) using controlled 3-1-1 tempo and progressive overload:',
      highlightsAr: [
        'يوم الدفع (Push — صدر وكتف وترايسبس): ضغط بار بنش مستوي (٤×٨-١٠) + ضغط دمبل عالي ٣٠ درجة (٤×١٠) + تفتيح كابل (٣×١٢) + رفرفة كتف جانبي (٤×١٥) + دفع حبل ترايسبس (٣×١٢).',
        'يوم السحب (Pull — ظهر وبايسبس): سحب مجنص عالي واسع (٤×١٠) + تجديف بالبار الحر (٤×٨-١٠) + تبادل دمبل بايسبس (٣×١٢).',
        'يوم الأرجل (Legs — سفلي وبطن): سكوات بالبار الحر (٤×٨) + ديدليفت روماني للخلفية (٤×١٠) + سمانة وبطن.',
        'نصيحة ذهبية: استرح من ٦٠ إلى ٩٠ ثانية بين المجموعات، ونم ٧-٨ ساعات ليلاً لأن العضلات تنمو أثناء النوم والاستشفاء.',
      ],
      highlightsEn: [
        'Push Day (Chest/Shoulders/Triceps): Barbell Bench Press (4x8-10), Incline Dumbbell Press (4x10), Cable Fly (3x12), Lateral Raises (4x15), Triceps Pushdown (3x12).',
        'Pull Day (Back/Biceps): Lat Pulldown (4x10), Barbell Row (4x8-10), Dumbbell Biceps Curl (3x12).',
        'Leg Day (Quads/Hamstrings/Glutes): Barbell Squat (4x8), Romanian Deadlift (4x10), Calf Raises & Core.',
        'Recovery rule: Rest 60–90s between sets and sleep 7–8 hours for optimal muscle protein synthesis.',
      ],
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

  // 4. Supplements, Hydration & Recovery Queries
  if (
    q.includes('مكمل') ||
    q.includes('كرياتين') ||
    q.includes('واي') ||
    q.includes('بروتين بودر') ||
    q.includes('مياه') ||
    q.includes('نوم') ||
    q.includes('اصاب') ||
    q.includes('إصاب') ||
    q.includes('وجع') ||
    q.includes('creatine') ||
    q.includes('whey')
  ) {
    return {
      textAr:
        'بصفتي مستشارك الرياضي والغذائي الذكي (AI Gym & Nutritionist) ⚡: المكملات الغذائية هي مكمل للنظام الغذائي وليست بديلاً عن الأكل الطبيعي، وأهم ٣ عناصر مثبتة علمياً هي:',
      textEn:
        'As your AI Gym & Nutritionist ⚡: Supplements complement whole foods rather than replacing them. Here are the top evidence-based essentials:',
      highlightsAr: [
        'الكرياتين مونوهيدرات (Creatine Monohydrate): ٥ جرام يومياً مع شرب ٣ إلى ٤ لتر مياه؛ يزيد القوة الانفجارية والامتلاء العضلي.',
        'الواي بروتين (Whey Protein): سكوب واحد بعد التمرين فقط إذا لم تستطع تغطية احتياجك اليومي من البروتين من الدجاج والبيض والسمك والجبن القريش.',
        'الإحماء وتجنب الإصابات: ابدأ دائماً بـ ٥-١٠ دقائق إحماء مفصلي ومجموعتين بوزن خفيف قبل الأوزان الثقيلة.',
      ],
      highlightsEn: [
        'Creatine Monohydrate: 5g daily with 3–4L of water to boost ATP strength and cell hydration.',
        'Whey Protein: Convenient post-workout option if whole-food protein targets are not met.',
        'Injury Prevention: Always perform 5–10 minutes of dynamic joint mobility and 2 warm-up sets.',
      ],
      disclaimerAr: AI_DISCLAIMER_AR,
      disclaimerEn: AI_DISCLAIMER_EN,
    };
  }

  // 5. Default Smart AI Gym & Nutritionist Reply
  return {
    textAr: isGymOwnerAccount
      ? 'أهلاً بك يا كابتن في المساعد الذكي (AI Gym & Nutritionist + دليل لوحة الجيم)! تقدر تسألني أي سؤال في التمارين والتغذية وحساب السعرات، أو تستخدم أزرار التحكم الخاصة بصاحب الجيم بالأسفل للوصول الفوري لأي قسم في منصتك.'
      : 'أهلاً بك! أنا مدربك الذكي وأخصائي التغذية الرياضية بالذكاء الاصطناعي (AI Gym & Nutritionist) 🤖💪🥗. اكتب لي هدفك (تنشيف، تضخيم، وزنك وطولك، أو العضلة التي تريد تمرينها، أو ميزانية أكلك) وسأصمم لك فوراً جدول تمارين ونظاماً غذائياً محسوب السعرات والماكروز!',
    textEn: isGymOwnerAccount
      ? 'Welcome Coach! Ask me any training or nutrition question, or use your Gym Owner quick buttons below to jump directly to any club management tool.'
      : 'Hi! I am your AI Gym Coach & Sports Nutritionist 🤖💪🥗. Tell me your goal (fat loss, muscle gain, your weight/height, target muscle, or budget) and I will craft a tailored workout and macro meal plan for you!',
    highlightsAr: [
      'مثال ١: اكتب «عايز نظام غذائي للتنشيف وزني 85 كيلو مع بدائل اقتصادية».',
      'مثال ٢: اكتب «عايز جدول تمارين صدر وظهر وأرجل لبناء العضل».',
      'مثال ٣: اكتب «إيه أفضل مكملات وإزاي أتجنب الإصابات في الجيم؟».',
    ],
    highlightsEn: [
      'Example 1: Type "Give me a fat loss meal plan for 85kg with budget foods".',
      'Example 2: Type "Build me a Push Pull Legs workout routine".',
      'Example 3: Type "How much creatine and water do I need daily?".',
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
        'مرحباً بك! أنا مدربك الذكي وأخصائي التغذية الرياضية بالذكاء الاصطناعي (AI Gym & Nutritionist) 🤖💪🥗. اسألني عن أي تمرين، جدول تدريبي، حساب سعرات وماكروز، أو بدائل وجبات اقتصادية وسأرد عليك فوراً!',
      textEn:
        'Welcome! I am your AI Gym Coach & Sports Nutritionist 🤖💪🥗. Ask me about any exercise, workout split, macro calculation, or meal plan and I will answer right away!',
      highlightsAr: [
        'اسألني عن: جداول التمارين (Push / Pull / Legs)، التنشيف، التضخيم، أو حساب السعرات.',
        'اكتب وزنك وهدفك وسأحسب لك البروتين والكارب والدهون والوجبات المناسبة.',
      ],
      highlightsEn: [
        'Ask me about workout splits, fat loss, muscle hypertrophy, or macro math.',
        'Share your weight and goal for a customized daily meal & training guide.',
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

  const handleSendQuery = (customQuery?: string) => {
    const text = (customQuery ?? inputText).trim();
    if (!text) return;

    const userMsg: AssistantReply = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      textAr: text,
      textEn: text,
    };

    const replyData = buildSmartReply(text, isGymOwnerAccount);
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
                  : 'اسألني في التمارين والدايت ✨'
                : isGymOwnerAccount
                  ? 'Gym Owner Mode + Quick Actions ✨'
                  : 'Ask Workouts & Nutrition ✨'}
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
            className="fixed bottom-20 end-4 z-50 flex h-[590px] max-h-[84vh] w-[92vw] max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0B0F19] sm:end-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-4 text-white dark:border-slate-800">
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
                  <p className="text-[11px] text-slate-300">
                    {isAr
                      ? isGymOwnerAccount
                        ? 'وضع مالك النادي مفعل: إجابات ذكية + أزرار تحكم سريع'
                        : 'مدرب ذكي وأخصائي تغذية يرد على استفساراتك'
                      : isGymOwnerAccount
                        ? 'Gym Owner Mode: AI Answers + Quick Navigation'
                        : 'Smart AI Personal Trainer & Sports Nutritionist'}
                  </p>
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
                    className={`max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                      msg.sender === 'USER'
                        ? 'bg-amber-500 font-black text-slate-950'
                        : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    <p>{isAr ? msg.textAr : msg.textEn}</p>

                    {msg.highlightsAr && msg.highlightsAr.length > 0 && (
                      <ul className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2 text-[11px] font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300">
                        {(isAr ? msg.highlightsAr : msg.highlightsEn || msg.highlightsAr).map(
                          (h, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                              <span>{h}</span>
                            </li>
                          ),
                        )}
                      </ul>
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

                    {/* Mandatory AI Disclaimer inside every AI reply */}
                    {msg.sender === 'AI' && (
                      <div
                        data-testid="ai-reply-disclaimer"
                        className="mt-3 flex items-start gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50/80 px-2.5 py-2 text-[10px] font-bold text-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
                      >
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
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
                    ? 'اسأل مدربك الذكي أو أخصائي التغذية (مثال: نظام تنشيف 85 كجم)...'
                    : 'Ask your AI Gym Coach & Nutritionist (e.g., fat loss plan for 85kg)...'
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
