'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Bot,
  Compass,
  CreditCard,
  Database,
  Dumbbell,
  HelpCircle,
  MessageSquarePlus,
  Send,
  ShieldCheck,
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
}

const QUICK_TOPICS: Array<{
  id: string;
  labelAr: string;
  labelEn: string;
  queryAr: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'upload-media',
    labelAr: '🎬 إزاي أرفع فيديو تمرين أو وصفة أو ملف PDF؟',
    labelEn: '🎬 How to upload videos, recipes & PDFs?',
    queryAr: 'إزاي أرفع فيديو تمرين أو وصفة غذائية أو ملف PDF للمتدربين؟',
    icon: Video,
  },
  {
    id: 'self-plan',
    labelAr: '📅 عايز خطة تدريب مجانية ٧ أيام وأتابع نفسي',
    labelEn: '📅 Free 7-day workout plan & self-tracker',
    queryAr: 'وريني خطة التدريب المجانية الـ 7 أيام وإزاي أتابع وزني ومياهي بنفسي',
    icon: Dumbbell,
  },
  {
    id: 'database-isolation',
    labelAr: '🔒 إزاي كل جيم ليه داتابيز عملاء معزولة؟',
    labelEn: '🔒 How does per-gym database isolation work?',
    queryAr: 'اشرحلي إزاي كل صاحب جيم بيكون ليه قاعدة بيانات عملاء خاصة بيه فقط ومعزولة؟',
    icon: Database,
  },
  {
    id: 'payment-gateways',
    labelAr: '💳 وسائل الدفع (Paymob / فوري / إنستاباي)',
    labelEn: '💳 Payment Gateways (Paymob / Fawry / InstaPay)',
    queryAr: 'إزاي بتشتغل بوابات الدفع المصرية والفواتير الضريبية في المنصة؟',
    icon: CreditCard,
  },
  {
    id: 'add-member-qr',
    labelAr: '👤 إضافة متدرب جديد واستخراج باسورد و QR',
    labelEn: '👤 Register member & generate QR + password',
    queryAr: 'إزاي أضيف متدرب جديد في الجيم وأطلعله الباسورد والـ QR Code الخاص بيه؟',
    icon: UserPlus,
  },
  {
    id: 'calc-macros',
    labelAr: '🥗 حاسبة السعرات والماكروز (4P + 4C + 9F)',
    labelEn: '🥗 Macro & Calorie Calculator',
    queryAr: 'عايز أحسب سعراتي اليومية والماكروز وأشوف وجبات اقتصادية',
    icon: Utensils,
  },
];

function buildSmartReply(query: string): Omit<AssistantReply, 'id' | 'sender'> {
  const q = query.toLowerCase();

  if (
    q.includes('فيديو') ||
    q.includes('وصف') ||
    q.includes('ملف') ||
    q.includes('pdf') ||
    q.includes('ارفع') ||
    q.includes('أرفع') ||
    q.includes('upload') ||
    q.includes('recipe')
  ) {
    return {
      textAr:
        'تقدر ترفع فيديوهات التمارين (ملف MP4 من جهازك أو رابط يوتيوب أو حركة تشريحية ثلاثية الأبعاد) + الوصفات الغذائية المحسوبة + ملفات الـ PDF من خلال قسم «استوديو رفع الفيديوهات والوصفات والملفات». أي حاجة بتنشرها هناك بتظهر فوراً لكل متدربينك في صفحة التدريب وتطبيق المتدرب!',
      textEn:
        'You can upload MP4 workout videos, YouTube links, 3D anatomical animations, macro-verified recipes, and PDF guides directly in the Gym Owner Media Studio. Everything syncs immediately to the Member App and Free Hub.',
      highlightsAr: [
        'تبويب ١ (فيديوهات التمارين): ارفع ملف فيديو أو ضع رابط يوتيوب أو اختر حركة تشريحية 3D وحدد المجموعات والعدات.',
        'تبويب ٢ (الوصفات الغذائية): اكتب البروتين والنشويات والدهون وسيحسب النظام السعرات تلقائياً بمعادلة (4P + 4C + 9F).',
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
    };
  }

  if (
    q.includes('داتابيز') ||
    q.includes('قاعدة') ||
    q.includes('عزل') ||
    q.includes('معزول') ||
    q.includes('خاص بيه') ||
    q.includes('database') ||
    q.includes('tenant') ||
    q.includes('rls')
  ) {
    return {
      textAr:
        'نظام TitanFit مبني بمعمارية Multi-Tenant مع عزل صارم لبيانات كل جيم (Per-Gym Isolated Database Partition): كل نادي يحصل على معرف مستقل (tenant_id / tenantSlug) محمي على مستوى قاعدة البيانات PostgreSQL بخاصية FORCE ROW LEVEL SECURITY (RLS) بالإضافة إلى عزل مساحة التخزين والمزامنة لكل جيم.',
      textEn:
        'TitanFit uses strict Multi-Tenant Database Isolation: every gym tenant has a dedicated tenant_id enforced by PostgreSQL FORCE ROW LEVEL SECURITY (RLS) policies and isolated tenant state partitions.',
      highlightsAr: [
        'عزل كامل للعملاء: صاحب الجيم (أ) لا يمكنه أبداً رؤية أعضاء أو فواتير أو باقات أو فيديوهات الجيم (ب).',
        'كود انضمام خاص لكل جيم (Gym Secret Code): مثل TF-JOIN يدخل به المتدرب مباشرة على تطبيق الجيم الخاص به فقط.',
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
    };
  }

  if (
    q.includes('دفع') ||
    q.includes('فوري') ||
    q.includes('انستاباي') ||
    q.includes('إنستاباي') ||
    q.includes('بايموب') ||
    q.includes('paymob') ||
    q.includes('fawry') ||
    q.includes('فاتور') ||
    q.includes('payment')
  ) {
    return {
      textAr:
        'بوابات الدفع المصرية مربوطة بالكامل في قسم «تحصيل الفواتير والمدفوعات» مع حساب ضريبة القيمة المضافة (14% VAT) وتوليد بصمة تحقق مشفرة (HMAC-SHA256) وإصدار فاتورة PDF رسمية قابلة للطباعة:',
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
    };
  }

  if (
    q.includes('عضو') ||
    q.includes('متدرب جديد') ||
    q.includes('باسورد') ||
    q.includes('امسح') ||
    q.includes('حذف') ||
    q.includes('qr') ||
    q.includes('member')
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
    };
  }

  if (
    q.includes('سعر') ||
    q.includes('كالوري') ||
    q.includes('ماكرو') ||
    q.includes('وجب') ||
    q.includes('دايت') ||
    q.includes('تغذية') ||
    q.includes('calorie') ||
    q.includes('diet')
  ) {
    return {
      textAr:
        'حاسبة السعرات الذكية بتشتغل بمعادلة Mifflin-St Jeor العلمية، وكل وجبة في المنصة محسوبة بمعادلة الماكروز الموحدة (4 × جرام بروتين + 4 × جرام كارب + 9 × جرام دهون) مع بدائل اقتصادية من البيت المصري.',
      textEn:
        'Our scientific Mifflin-St Jeor calculator computes your exact TDEE and macro split using unified calorie math (4P + 4C + 9F) with Egyptian budget food swaps.',
      highlightsAr: [
        'أدخل وزنك وطولك وسنك ومستوى نشاطك لتستلم سعراتك والماكروز فوراً.',
        'بدّل بين هدف التنشيف (Cut) أو الثبات أو الضخامة العضلية (Lean Bulk).',
      ],
      highlightsEn: [
        'Enter weight, height, age, and activity level for instant macro targets.',
        'Switch between Fat Loss, Maintenance, and Lean Muscle Gain.',
      ],
      actionSection: 'PUBLIC_STOREFRONT',
      actionScrollId: 'free-calorie-calculator',
      actionLabelAr: '🥗 انتقل إلى حاسبة السعرات ومخطط الوجبات الآن',
      actionLabelEn: '🥗 Jump to Macro Calculator & Meal Planner',
    };
  }

  if (
    q.includes('خطة') ||
    q.includes('مجاني') ||
    q.includes('اتابع') ||
    q.includes('أتابع') ||
    q.includes('7 أيام') ||
    q.includes('٧ أيام') ||
    q.includes('تمرين') ||
    q.includes('free') ||
    q.includes('workout')
  ) {
    return {
      textAr:
        'جهزنالك في قسم «التدريب المجاني والخطة الذاتية» جدول تدريب أسبوعي واضح لـ ٧ أيام (دفع Push • سحب Pull • استشفاء • أرجل Legs • علوي شامل • كارديو HIIT • راحة) مع استوديو فيديو تشريحي مدمج ولوحة متابعة ذاتية لتسجيل وزنك وأكواب المياه ووجباتك يومياً!',
      textEn:
        'Our Free Self-Coaching Hub gives you a structured 7-day weekly split roadmap, a built-in 3D anatomical video studio with rep counter, and a personal daily weight/water/meal tracker.',
      highlightsAr: [
        'اختر أي يوم من أيام الأسبوع السبعة واضغط «سجّل إتمام هذا اليوم».',
        'شغّل الفيديو التشريحي المدمج بسرعة 0.5x أو 1x وتابع إيقاع الحركة (٣ ثوانٍ نزول • ١ ثانية ثبات • ١ ثانية دفع).',
      ],
      highlightsEn: [
        'Select any day in the 7-day roadmap and check off completed workouts.',
        'Train with the built-in 3-1-1 tempo animated video player.',
      ],
      actionSection: 'FREE_TRIAL_HUB',
      actionLabelAr: '🎁 افتح خطة الـ ٧ أيام واستوديو الفيديو المجاني الآن',
      actionLabelEn: '🎁 Open Free 7-Day Plan & Video Studio',
    };
  }

  return {
    textAr:
      'أهلاً بك في المساعد الذكي لمنصة TitanFit! أقدر أساعدك في أي استفسار أو أوجهك فوراً لأي شاشة في النظام: سواء كنت متدرباً تريد خطة تدريب مجانية وحساب سعراتك، أو صاحب جيم تريد رفع فيديوهات ووصفات وملفات PDF، أو إدارة المشتركين والـ QR، أو معرفة تفاصيل عزل قواعد البيانات وبوابات الدفع المصرية.',
    textEn:
      'Welcome to the TitanFit Smart AI Assistant! Ask me anything or click any quick button below to jump directly to workouts, macro calculator, gym owner video/recipe/PDF uploads, CRM & QR passes, or multi-tenant database & payment gateways.',
    highlightsAr: [
      'اضغط على أي سؤال سريع بالأسفل أو اكتب طلبك وسأفتح لك الصفحة المطلوبة بضغطة زر!',
    ],
    highlightsEn: [
      'Click any topic chip below or type what you need and I will guide you right there!',
    ],
    actionSection: 'FREE_TRIAL_HUB',
    actionLabelAr: '🎬 استكشف استوديو التمارين والخطة المجانية',
    actionLabelEn: '🎬 Explore Free Workout Studio & Plan',
  };
}

export function SmartAiAssistantWidget() {
  const { locale, setActiveSection, showToast } = usePlatformStore();
  const isAr = locale === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<AssistantReply[]>([
    {
      id: 'welcome-ai',
      sender: 'AI',
      textAr:
        'مرحباً بك! أنا المساعد الذكي لمنصة TitanFit 🤖✨. لو فيه أي حاجة مش واضحة أو عايز توصل لأي أداة (رفع فيديوهات ووصفات الجيم، خطة التدريب الذاتي الـ ٧ أيام، إضافة متدرب بالـ QR، عزل قواعد البيانات، أو بوابات الدفع المصرية) اسألني أو اضغط على الأزرار السريعة وهوديك ليها فوراً!',
      textEn:
        'Hi! I am your TitanFit Smart AI Coach & Platform Guide 🤖✨. Ask me anything about self-coaching, uploading gym videos/recipes/PDFs, multi-tenant database isolation, or payment gateways—and I will take you right there!',
      highlightsAr: [
        'توجيه فوري لأي تاب أو أداة داخل المنصة بضغطة زر.',
        'شرح كامل لخصائص المتدرب ولوحة مالك الجيم وعزل قواعد البيانات.',
      ],
      highlightsEn: [
        'One-click navigation to any tab or feature.',
        'Complete guidance for Trainees, Gym Owners, and SaaS Admins.',
      ],
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

    const replyData = buildSmartReply(text);
    const aiMsg: AssistantReply = {
      id: `ai-${Date.now() + 1}`,
      sender: 'AI',
      ...replyData,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    if (!customQuery) setInputText('');
  };

  const handleExecuteNavigation = (msg: AssistantReply) => {
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
              {isAr ? 'المساعد الذكي ودليل المنصة' : 'Smart AI Coach & Guide'}
            </p>
            <p className="mt-0.5 text-[10px] font-bold text-amber-300 dark:text-slate-800">
              {isAr ? 'اسألني أو اطلب أي صفحة فوراً ✨' : 'Ask & Navigate Instantly ✨'}
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
            className="fixed bottom-20 end-4 z-50 flex h-[560px] max-h-[82vh] w-[92vw] max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0B0F19] sm:end-6"
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
                      {isAr ? 'مساعد TitanFit الذكي' : 'TitanFit Smart AI Guide'}
                    </h3>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAr
                      ? 'يرد على استفساراتك ويوجهك لأي أداة في المنصة بضغطة زر'
                      : 'Answers questions & navigates you to any feature'}
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
                    className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
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

                    {msg.actionSection && (
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
                  </div>
                </div>
              ))}

              {/* Quick Topic Suggestion Chips */}
              <div className="pt-1">
                <p className="mb-2 text-[11px] font-black text-slate-500 dark:text-slate-400">
                  💡 {isAr ? 'اختر سؤالك أو اضغط للتوجيه الفوري:' : 'Quick Questions & Guided Navigation:'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TOPICS.map((topic) => {
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
                    ? 'اكتب سؤالك هنا (مثال: إزاي أرفع فيديو أو أضيف متدرب؟)...'
                    : 'Ask anything (e.g., how to upload videos or add a member)...'
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
