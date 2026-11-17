'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Timer,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Dumbbell,
  Flame,
  Zap,
  Activity,
  Info,
  Layers,
  HeartPulse,
} from 'lucide-react';

export type ExerciseMotionType =
  | 'INCLINE_PRESS'
  | 'BENCH_PRESS'
  | 'CABLE_FLY'
  | 'LATERAL_RAISE'
  | 'TRICEPS_PUSHDOWN'
  | 'BICEPS_CURL'
  | 'LAT_PULLDOWN'
  | 'BARBELL_ROW'
  | 'BARBELL_SQUAT'
  | 'ROMANIAN_DEADLIFT';

export interface ExerciseMotionItem {
  id: string;
  motionType: ExerciseMotionType;
  nameAr: string;
  nameEn: string;
  targetMuscleAr: string;
  targetMuscleEn: string;
  secondaryMuscleAr?: string;
  secondaryMuscleEn?: string;
  sets: number;
  reps: string;
  restSec: number;
  cuesAr: string;
  cuesEn: string;
  tempo?: string;
  difficultyAr?: string;
  difficultyEn?: string;
}

export interface BodyImpactInfo {
  muscleRegion: 'CHEST' | 'BACK' | 'LEGS' | 'SHOULDERS' | 'ARMS';
  primaryTarget: { nameAr: string; nameEn: string; activationPct: number; color: string };
  secondaryTargets: Array<{ nameAr: string; nameEn: string; activationPct: number; color: string }>;
  bodyBenefitsAr: string[];
  bodyBenefitsEn: string[];
  postureImpactAr: string;
  postureImpactEn: string;
  dailyFunctionalBenefitAr: string;
  dailyFunctionalBenefitEn: string;
}

export const EXERCISE_BODY_IMPACT_MAP: Record<ExerciseMotionType, BodyImpactInfo> = {
  BENCH_PRESS: {
    muscleRegion: 'CHEST',
    primaryTarget: { nameAr: 'عضلة الصدر الرئيسية (Pectoralis Major)', nameEn: 'Pectoralis Major (Mid & Lower Chest)', activationPct: 96, color: '#EF4444' },
    secondaryTargets: [
      { nameAr: 'عضلة الترايسبس الخلفية للذراع', nameEn: 'Triceps Brachii', activationPct: 78, color: '#F59E0B' },
      { nameAr: 'الكتف الأمامي (Anterior Deltoid)', nameEn: 'Anterior Deltoid', activationPct: 72, color: '#38BDF8' },
    ],
    bodyBenefitsAr: [
      'يمنح الصدر حجماً وضخامة عضلية واضحة ومظهراً رياضياً مشدوداً.',
      'يقوي عضلات الدفع العلوية ويزيد القدرة على حمل ودفع الأشياء الثقيلة.',
      'يحسن كثافة عظام القفص الصدري ومفاصل الكتف والكوع.',
    ],
    bodyBenefitsEn: [
      'Builds maximum upper-body pushing power and dense chest musculature.',
      'Strengthens shoulder and elbow joint stability against strain.',
      'Accelerates metabolic calorie burn through compound multi-joint recruitment.',
    ],
    postureImpactAr: 'يوازن عضلات الجزء العلوي عند دمجه مع تمارين السحب لمنع استدارة الكتفين.',
    postureImpactEn: 'Firms chest wall and balances anterior chain when paired with back rows.',
    dailyFunctionalBenefitAr: 'يسهل أي نشاط يتطلب دفع الأبواب أو الأثاث أو رفع الأشياء للأمام.',
    dailyFunctionalBenefitEn: 'Improves everyday pushing power, sports performance, and self-defense posture.',
  },
  INCLINE_PRESS: {
    muscleRegion: 'CHEST',
    primaryTarget: { nameAr: 'الصدر العلوي (Clavicular Head)', nameEn: 'Upper Pectorals (Clavicular Head)', activationPct: 94, color: '#EF4444' },
    secondaryTargets: [
      { nameAr: 'الكتف الأمامي (Anterior Delts)', nameEn: 'Anterior Deltoids', activationPct: 82, color: '#F59E0B' },
      { nameAr: 'الترايسبس الثلاثية (Triceps)', nameEn: 'Triceps Brachii', activationPct: 68, color: '#38BDF8' },
    ],
    bodyBenefitsAr: [
      'يملأ الفراغ أسفل عظمة الترقوة ليعطي الصدر مظهراً مرفوعاً وممتلئاً حتى مع ارتداء الملابس.',
      'يقلل الضغط على مفصل الكتف مقارنة بالبنش المستوي بزاوية 30 درجة.',
      'يبني التناسق الهندسي للصدر العلوي والرقبة.',
    ],
    bodyBenefitsEn: [
      'Fills upper-chest fibers creating an athletic, high-armor chest profile.',
      'Safer glenohumeral pressing angle preserving the rotator cuff.',
      'Enhances shoulder vertical power output.',
    ],
    postureImpactAr: 'يرفع عضلات الصدر ويمنع ترهل الألياف العلوية.',
    postureImpactEn: 'Elevates pectoral insertion line for a prominent muscular silhouette.',
    dailyFunctionalBenefitAr: 'رفع الأغراض الثقيلة للأرفف العالية وحمل الأطفال أو الحقائب.',
    dailyFunctionalBenefitEn: 'Lifting objects to high shelves and overhead luggage loading.',
  },
  CABLE_FLY: {
    muscleRegion: 'CHEST',
    primaryTarget: { nameAr: 'منتصف الصدر والألياف الداخلية', nameEn: 'Inner Sternal Pectoral Fibers', activationPct: 92, color: '#EF4444' },
    secondaryTargets: [
      { nameAr: 'الكتف الأمامي والأوتار الصدرية', nameEn: 'Anterior Delts & Tendons', activationPct: 58, color: '#F59E0B' },
      { nameAr: 'عضلة المنشارية الأمامية (Serratus)', nameEn: 'Serratus Anterior', activationPct: 45, color: '#38BDF8' },
    ],
    bodyBenefitsAr: [
      'يمنح الصدر تقسيماً وتشريحاً خطياً بارزاً (خط منتصف الصدر).',
      'يوفر شداً مستمراً على الألياف الصدرية في كل درجات زاوية الحركة دون انقطاع.',
      'يساعد في استطالة وتوسيع القفص الصدري وتحسين سعة التنفس.',
    ],
    bodyBenefitsEn: [
      'Provides peak tension at full adduction creating sharp mid-chest striations.',
      'Expands thoracic flexibility and chest muscle fascia.',
      'Zero dead-spots compared to dumbbell flys due to constant cable tension.',
    ],
    postureImpactAr: 'يفرد الألياف الصدرية المشدودة ويحسن مرونة مفصل الكتف.',
    postureImpactEn: 'Elongates pectoral tendons while maintaining constant tension.',
    dailyFunctionalBenefitAr: 'تحسين حركة المعانقة وحمل الأجسام العريضة بكفاءة وثبات.',
    dailyFunctionalBenefitEn: 'Hugging, carrying large boxes, and lateral arm control.',
  },
  BARBELL_SQUAT: {
    muscleRegion: 'LEGS',
    primaryTarget: { nameAr: 'عضلات الفخذ الأمامية (Quadriceps)', nameEn: 'Quadriceps Femoris (4 Heads)', activationPct: 98, color: '#10B981' },
    secondaryTargets: [
      { nameAr: 'عضلات المؤخرة والأرداف (Glutes)', nameEn: 'Gluteus Maximus', activationPct: 90, color: '#F59E0B' },
      { nameAr: 'عضلات الجذع وأسفل الظهر (Core & Lower Back)', nameEn: 'Core & Spinal Erectors', activationPct: 82, color: '#38BDF8' },
    ],
    bodyBenefitsAr: [
      'ملك تمارين بناء القوة: يحفز إفراز هرمون التستوستيرون والنمو لبناء الجسم كاملاً.',
      'يحرق كميات هائلة من السعرات الحرارية والدهون لاستهلاكه أكبر كتلة عضلية بالجسم.',
      'يقوي الركبتين والأربطة الصليبية وأوتار الحوض ويحمي من آلام الشيخوخة.',
    ],
    bodyBenefitsEn: [
      'King of compound exercises: stimulates systemic anabolic hormone production.',
      'Torches maximum calories by engaging the human body’s largest muscle groups.',
      'Fortifies knee cartilage, patellar tendons, and hip bone mineral density.',
    ],
    postureImpactAr: 'يصحح ميل الحوض ويقوي حزام البطن والقطنية لحماية العمود الفقري.',
    postureImpactEn: 'Aligns pelvis and spinal column, building unbreakable foundational posture.',
    dailyFunctionalBenefitAr: 'صعود السلالم بسهولة فائقة، الجري، والوقوف والنهوض دون أي إجهاد.',
    dailyFunctionalBenefitEn: 'Stair climbing, sprinting, sitting-to-standing transitions with zero fatigue.',
  },
  ROMANIAN_DEADLIFT: {
    muscleRegion: 'LEGS',
    primaryTarget: { nameAr: 'عضلات الفخذ الخلفية (Hamstrings)', nameEn: 'Hamstrings & Biceps Femoris', activationPct: 95, color: '#EF4444' },
    secondaryTargets: [
      { nameAr: 'المؤخرة وتقاطع الفخذ الخلفي (Glute-Ham Tie-in)', nameEn: 'Gluteus Maximus & Medius', activationPct: 88, color: '#F59E0B' },
      { nameAr: 'عضلات القطنية وأسفل الظهر (Erector Spinae)', nameEn: 'Lower Back & Spinal Erectors', activationPct: 79, color: '#38BDF8' },
    ],
    bodyBenefitsAr: [
      'يقضي تماماً على ترهل الفخذ الخلفي ويمنحه تقسيماً ومظهراً مشدوداً وقوياً.',
      'أفضل تمرين للوقاية من آلام الديسك والانزلاق الغضروفي بتقوية عضلات الحوض والظهر.',
      'يزيد السرعة الانفجارية في الجري والقفز الرياضي.',
    ],
    bodyBenefitsEn: [
      'Sculpts the posterior chain, eliminating hamstring slack and tightening glutes.',
      'Top evidence-based exercise for lower back pain prevention through hip-hinging.',
      'Dramatically elevates athletic sprint speed and jump takeoff power.',
    ],
    postureImpactAr: 'يمنع تقوس الظهر الأمامي (Kyphosis) ويحافظ على استقامة القامة الشامخة.',
    postureImpactEn: 'Counters anterior pelvic tilt and computer-desk slouching.',
    dailyFunctionalBenefitAr: 'التقاط الأشياء من الأرض بأمان تام وبدون تحميل على فقرات الظهر.',
    dailyFunctionalBenefitEn: 'Safe bending and heavy object lifting from the floor without spinal strain.',
  },
  LAT_PULLDOWN: {
    muscleRegion: 'BACK',
    primaryTarget: { nameAr: 'عضلة الظهر العريضة (Latissimus Dorsi)', nameEn: 'Latissimus Dorsi (Lats)', activationPct: 95, color: '#38BDF8' },
    secondaryTargets: [
      { nameAr: 'عضلات البايسبس الأمامية للذراع', nameEn: 'Biceps Brachii', activationPct: 75, color: '#F59E0B' },
      { nameAr: 'عضلات ما بين لوحي الكتف (Rhomboids)', nameEn: 'Rhomboids & Mid-Traps', activationPct: 70, color: '#10B981' },
    ],
    bodyBenefitsAr: [
      'يمنح الظهر شكل حرف V الشهير (V-Taper) الذي يجعل الخصر يبدو أنحف وأجمل.',
      'يخفف الضغط عن فقرات الرقبة وأعلى الظهر الناتجة عن الجلوس الطويل أمام الشاشات.',
      'يقوي قبضة اليد والذراعين بشكل ملحوظ.',
    ],
    bodyBenefitsEn: [
      'Carves the iconic V-Taper silhouette making waist appear dramatically narrower.',
      'Relieves upper-back and cervical spine tension caused by desk work and smartphone hunching.',
      'Builds crushing pulling strength and forearm grip endurance.',
    ],
    postureImpactAr: 'يسحب الكتفين للخلف ويفتح الصدر لمظهر واثق ومستقيم.',
    postureImpactEn: 'Pulls scapulae downward and backward, instantly curing rounded shoulders.',
    dailyFunctionalBenefitAr: 'التسلق، سحب الأبواب الثقيلة، وحمل الحقائب والمستلزمات لمسافات طويلة.',
    dailyFunctionalBenefitEn: 'Pulling actions, climbing, and carrying heavy groceries easily.',
  },
  BARBELL_ROW: {
    muscleRegion: 'BACK',
    primaryTarget: { nameAr: 'منتصف الظهر والترابيس (Mid-Traps & Rhomboids)', nameEn: 'Mid-Back, Rhomboids & Traps', activationPct: 93, color: '#38BDF8' },
    secondaryTargets: [
      { nameAr: 'عضلة الظهر العريضة (Lats)', nameEn: 'Latissimus Dorsi', activationPct: 85, color: '#10B981' },
      { nameAr: 'القطنية وعضلات التثبيت (Lower Back & Core)', nameEn: 'Spinal Erectors & Core', activationPct: 78, color: '#F59E0B' },
    ],
    bodyBenefitsAr: [
      'يبني سمك وعمق عضلات الظهر ثلاثية الأبعاد وليس فقط العرض.',
      'يقوي عضلات العمود الفقري بالكامل لتتحمل الجهد العالي والعمل البدني.',
      'يزيد ثبات لوح الكتف مما يحمي من إصابات خلع وتمزق أوتار الكتف.',
    ],
    bodyBenefitsEn: [
      'Builds 3D back muscle thickness and density between the shoulder blades.',
      'Strengthens the full spinal kinetic chain for heavy physical stamina.',
      'Stabilizes scapular movement, bulletproofing shoulder joints from impingement.',
    ],
    postureImpactAr: 'يحارب حدبة الظهر ويمنحك وقفة عسكرية مستقيمة وثابتة.',
    postureImpactEn: 'Combats thoracic kyphosis, yielding a proud upright military posture.',
    dailyFunctionalBenefitAr: 'سحب وسحب الأشياء نحوك والسيطرة على الأجسام غير المستقرة.',
    dailyFunctionalBenefitEn: 'Rowing boats, pulling heavy ropes, and moving luggage.',
  },
  LATERAL_RAISE: {
    muscleRegion: 'SHOULDERS',
    primaryTarget: { nameAr: 'عضلة الكتف الجانبية (Lateral Deltoid)', nameEn: 'Lateral / Medial Deltoid Head', activationPct: 96, color: '#F59E0B' },
    secondaryTargets: [
      { nameAr: 'الترابيس العلوية (Upper Trapezius)', nameEn: 'Upper Trapezius', activationPct: 45, color: '#EF4444' },
      { nameAr: 'الساعد ومعصم اليد (Forearm Stabilizers)', nameEn: 'Forearms & Wrist Stabilizers', activationPct: 40, color: '#38BDF8' },
    ],
    bodyBenefitsAr: [
      'التمرين رقم 1 لتعريض الأكتاف ومنح الجسم عرضاً هيبياً واضحاً من الجانبين.',
      'يجعل التيشيرتات والبدلات الرياضية تبدو مفصلة بدقة بفضل كروية الكتف (Boulder Shoulders).',
      'يقوي عضلات التثبيت الجانبية للكتف.',
    ],
    bodyBenefitsEn: [
      'The #1 exercise for shoulder width, sculpting 3D capped "cannonball" deltoids.',
      'Creates instant visual shoulder flare making clothes fit athletic silhouettes.',
      'Strengthens glenohumeral lateral stabilization.',
    ],
    postureImpactAr: 'يبرز عرض الكتفين ويعوض انكماش الجزء العلوي.',
    postureImpactEn: 'Widens shoulder span creating athletic horizontal frame.',
    dailyFunctionalBenefitAr: 'رفع الأذرع جانباً وتناول الأشياء في الأماكن الضيقة بدون إجهاد.',
    dailyFunctionalBenefitEn: 'Lifting and balancing objects outward laterally.',
  },
  TRICEPS_PUSHDOWN: {
    muscleRegion: 'ARMS',
    primaryTarget: { nameAr: 'عضلة الترايسبس الخارجية والطويلة (Triceps Lateral & Long)', nameEn: 'Triceps Brachii (All 3 Heads)', activationPct: 95, color: '#10B981' },
    secondaryTargets: [
      { nameAr: 'عضلات الساعد ومعصم اليد (Forearms)', nameEn: 'Forearm Flexors & Extensors', activationPct: 50, color: '#38BDF8' },
      { nameAr: 'عضلات البطن والجذع لتثبيت الحركة', nameEn: 'Core Stabilizers', activationPct: 35, color: '#F59E0B' },
    ],
    bodyBenefitsAr: [
      'عضلة الترايسبس تشكل 65% من حجم الذراع بالكامل — هذا التمرين يضخم الذراع سريعاً.',
      'يقضي على ترهلات خلف الذراع تماماً ويمنحه شكلاً مشدوداً بشكل حدوة الحصان (Horseshoe Triceps).',
      'يقوي مفصل الكوع وأربطته ويحمي من إصابات لاعبي التنس والأثقال.',
    ],
    bodyBenefitsEn: [
      'Triceps comprise 65% of upper arm mass; this movement delivers rapid arm fullness.',
      'Eliminates arm flab, sculpting the defined horseshoe triceps profile.',
      'Fortifies elbow tendons and protects against tendonitis.',
    ],
    postureImpactAr: 'يشد ألياف الذراع الخلفية ويثبت المعصم.',
    postureImpactEn: 'Firms rear arm line, establishing solid elbow extension balance.',
    dailyFunctionalBenefitAr: 'فرد الذراع بقوة، رمي الكرات، والدفع ضد الأسطح عند النهوض من الكرسي.',
    dailyFunctionalBenefitEn: 'Pushing out of deep armchairs, throwing sports, and lockout power.',
  },
  BICEPS_CURL: {
    muscleRegion: 'ARMS',
    primaryTarget: { nameAr: 'عضلة البايسبس الأمامية (Biceps Brachii & Peak)', nameEn: 'Biceps Brachii (Long & Short Heads)', activationPct: 96, color: '#EF4444' },
    secondaryTargets: [
      { nameAr: 'عضلة البراكياليس العميقة (Brachialis)', nameEn: 'Brachialis (Arm Thickness)', activationPct: 75, color: '#F59E0B' },
      { nameAr: 'عضلات الساعد والقبضة (Forearm Brachioradialis)', nameEn: 'Brachioradialis & Forearms', activationPct: 65, color: '#38BDF8' },
    ],
    bodyBenefitsAr: [
      'يبني قمة البايسبس الشهيرة (Biceps Peak) ويعطي الذراع كروية وبروزاً رياضياً جذاباً.',
      'يقوي مفصل الكوع وأوتار حمل الأوزان للأمام.',
      'يحسن قوة قبضة اليد بشكل كبير.',
    ],
    bodyBenefitsEn: [
      'Maximizes the iconic biceps peak and arm curvature.',
      'Increases bicep thickness via deep brachialis engagement.',
      'Improves crushing grip strength and wrist endurance.',
    ],
    postureImpactAr: 'يوازن عضلات الذراع الأمامية مع الترايسبس لحركة كوع طبيعية.',
    postureImpactEn: 'Balances arm flexors with extensors maintaining elbow joint neutrality.',
    dailyFunctionalBenefitAr: 'حمل الأشياء والمشتريات، حمل الأطفال، وثني الذراع بقوة وسلاسة.',
    dailyFunctionalBenefitEn: 'Carrying grocery bags, holding luggage, and manual lifting.',
  },
};

/**
 * High-definition Cartoon Athletic Character Visual Engine
 * Renders charming 2D/3D-styled athlete with real biomechanics, headband, training tank, shorts & gym gear
 */
export function CartoonAthleteVisualCanvas({
  motionType,
  isPlaying,
  speedMultiplier = 1,
  isAr = true,
}: {
  motionType: ExerciseMotionType;
  isPlaying: boolean;
  speedMultiplier?: number;
  isAr?: boolean;
}) {
  const baseDuration = 3.2 / speedMultiplier;
  const impact = EXERCISE_BODY_IMPACT_MAP[motionType] ?? EXERCISE_BODY_IMPACT_MAP.BENCH_PRESS;

  const renderExerciseSvg = () => {
    const sharedDefs = (
      <defs>
        {/* 3D Sculpted Anatomical Mannequin Shading (MuscleWiki / 3D Studio Style) */}
        <linearGradient id="proBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="45%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="proLimbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="proHeadGrad" x1="25%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="55%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="proChromeBar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="45%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="proGoldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <radialGradient id="proMuscleGlowRed" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#DC2626" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="proMuscleGlowGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#D97706" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="proMuscleGlowEmerald" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#059669" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="proMuscleGlowCyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#0284C7" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </radialGradient>
        <filter id="proGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    );

    switch (motionType) {
      case 'BENCH_PRESS':
      case 'INCLINE_PRESS': {
        const isIncline = motionType === 'INCLINE_PRESS';
        return (
          <svg viewBox="0 0 280 200" className="h-full w-full select-none overflow-visible">
            {sharedDefs}

            {/* 3D Studio Floor & Contact Shadow */}
            <ellipse cx="135" cy="182" rx="102" ry="9" fill="#000000" opacity="0.45" />
            <line x1="20" y1="182" x2="260" y2="182" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

            {/* Heavy-Duty Steel Bench */}
            <g transform={isIncline ? 'rotate(-16 78 126)' : ''}>
              <rect x="48" y="128" width="142" height="12" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
              <rect x="52" y="125" width="134" height="4" rx="2" fill="#D4AF37" opacity="0.8" />
              <path d="M 68 140 L 58 180 M 170 140 L 180 180" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* Planted Lower Leg & Training Shoe */}
            <path d="M 168 128 Q 196 132 204 156 L 207 177 L 195 177 L 190 156 Q 182 140 162 136 Z" fill="url(#proLimbGrad)" stroke="#64748B" strokeWidth="0.8" />
            <path d="M 193 176 L 218 176 Q 222 181 215 182 L 192 182 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />

            {/* Sculpted Anatomical Torso & Neck */}
            <g transform={isIncline ? 'rotate(-16 78 126)' : ''}>
              <path
                d="M 80 112 Q 112 103 145 113 L 168 118 L 166 131 L 80 128 Z"
                fill="url(#proBodyGrad)"
                stroke="#94A3B8"
                strokeWidth="0.8"
              />
              {/* Sculpted Head & Jawline Silhouette (No Cartoon Face) */}
              <path d="M 68 110 C 60 105, 58 93, 68 90 C 78 88, 84 96, 82 106 L 78 113 Z" fill="url(#proHeadGrad)" stroke="#94A3B8" strokeWidth="0.7" />
              <path d="M 76 111 L 86 114 L 84 123 L 75 120 Z" fill="url(#proLimbGrad)" />

              {/* Activated Pectoral Muscle Fibers */}
              <motion.ellipse
                cx="116"
                cy="111"
                rx="19"
                ry="12"
                fill="url(#proMuscleGlowRed)"
                filter="url(#proGlowFilter)"
                animate={isPlaying ? { scale: [1, 1.32, 1], opacity: [0.45, 0.95, 0.45] } : {}}
                transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
              />
              <path d="M 103 108 Q 116 116 129 109 M 106 113 Q 117 119 127 114" stroke="#FCA5A5" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </g>

            {/* Trajectory Guide Dashed Line */}
            <line x1="118" y1="36" x2="118" y2="92" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />

            {/* Biomechanical Arms & Olympic Barbell */}
            <motion.g
              animate={
                isPlaying
                  ? { y: [0, -38, 0], x: isIncline ? [0, -6, 0] : [0, 0, 0] }
                  : {}
              }
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Sculpted Tapered Upper Arm & Forearm */}
              <path
                d="M 102 112 Q 95 94 108 82 L 116 64 L 123 66 L 116 86 Q 108 98 112 114 Z"
                fill="url(#proLimbGrad)"
                stroke="#CBD5E1"
                strokeWidth="0.8"
              />
              <circle cx="110" cy="85" r="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
              {/* Wrist Wrap & Hand Grip */}
              <rect x="113" y="61" width="11" height="6" rx="2" fill="#D4AF37" />

              {/* Chrome Barbell & 3D Beveled Plates */}
              <rect x="46" y="61" width="166" height="5" rx="2.5" fill="url(#proChromeBar)" />
              <rect x="64" y="54" width="5" height="19" rx="1.5" fill="#94A3B8" />
              <rect x="190" y="54" width="5" height="19" rx="1.5" fill="#94A3B8" />
              <rect x="52" y="38" width="11" height="50" rx="3" fill="url(#proGoldPlate)" stroke="#FEF08A" strokeWidth="0.8" />
              <rect x="196" y="38" width="11" height="50" rx="3" fill="url(#proGoldPlate)" stroke="#FEF08A" strokeWidth="0.8" />
            </motion.g>

            {/* Target Muscle Callout Pin */}
            <g transform="translate(118, 108)">
              <motion.circle r="6" fill="none" stroke="#EF4444" strokeWidth="1.5" animate={isPlaying ? { scale: [1, 2.1], opacity: [1, 0] } : {}} transition={{ duration: 1.6, repeat: Infinity }} />
              <circle r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M 0 0 L 24 -22 L 96 -22" stroke="#EF4444" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
              <g transform="translate(24, -33)">
                <rect width="84" height="19" rx="5" fill="#0F172A" stroke="#EF4444" strokeWidth="1" />
                <text x="42" y="12.5" fill="#FEE2E2" fontSize="8.5" fontWeight="900" textAnchor="middle">
                  {isAr ? 'الصدر: 96% EMG' : 'Chest: 96% EMG'}
                </text>
              </g>
            </g>
          </svg>
        );
      }

      case 'BARBELL_SQUAT': {
        return (
          <svg viewBox="0 0 280 200" className="h-full w-full select-none overflow-visible">
            {sharedDefs}
            <ellipse cx="140" cy="182" rx="82" ry="8" fill="#000000" opacity="0.45" />
            <line x1="25" y1="182" x2="255" y2="182" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

            {/* Squat Rack Uprights */}
            <line x1="68" y1="24" x2="68" y2="182" stroke="#334155" strokeWidth="4" />
            <line x1="212" y1="24" x2="212" y2="182" stroke="#334155" strokeWidth="4" />

            {/* Planted Squat Shoes */}
            <path d="M 98 176 L 122 176 L 124 182 L 96 182 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />
            <path d="M 158 176 L 182 176 L 184 182 L 156 182 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />

            <motion.g
              animate={isPlaying ? { y: [0, 32, 0] } : {}}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Sculpted Calves & Tapered Quads */}
              <path d="M 106 176 L 100 138 L 112 138 L 116 176 Z" fill="url(#proLimbGrad)" stroke="#64748B" strokeWidth="0.7" />
              <path d="M 164 176 L 168 138 L 180 138 L 174 176 Z" fill="url(#proLimbGrad)" stroke="#64748B" strokeWidth="0.7" />
              <path d="M 100 138 Q 108 112 122 96 L 136 98 L 114 138 Z" fill="url(#proLimbGrad)" stroke="#94A3B8" strokeWidth="0.8" />
              <path d="M 180 138 Q 172 112 158 96 L 144 98 L 166 138 Z" fill="url(#proLimbGrad)" stroke="#94A3B8" strokeWidth="0.8" />

              {/* Quad Activation Glow & Fibers */}
              <motion.ellipse
                cx="140"
                cy="118"
                rx="30"
                ry="16"
                fill="url(#proMuscleGlowEmerald)"
                filter="url(#proGlowFilter)"
                animate={isPlaying ? { scale: [1, 1.32, 1], opacity: [0.4, 0.95, 0.4] } : {}}
                transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Athletic Shorts & V-Tapered Torso */}
              <path d="M 118 94 L 162 94 L 168 118 L 140 115 L 112 118 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.2" />
              <path d="M 122 94 L 116 54 Q 140 48 164 54 L 158 94 Z" fill="url(#proBodyGrad)" stroke="#94A3B8" strokeWidth="0.8" />
              <path d="M 130 62 Q 140 66 150 62 M 133 74 L 147 74 M 134 83 L 146 83" stroke="#1E293B" strokeWidth="1.4" fill="none" />

              {/* Sculpted Head & Neck */}
              <rect x="135" y="45" width="10" height="9" rx="3" fill="url(#proLimbGrad)" />
              <ellipse cx="140" cy="34" rx="10" ry="12.5" fill="url(#proHeadGrad)" stroke="#94A3B8" strokeWidth="0.8" />

              {/* Arms Gripping Barbell */}
              <path d="M 116 55 L 98 48 L 108 42" stroke="url(#proLimbGrad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M 164 55 L 182 48 L 172 42" stroke="url(#proLimbGrad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />

              {/* Olympic Barbell & Plates */}
              <rect x="44" y="42" width="192" height="5" rx="2.5" fill="url(#proChromeBar)" />
              <rect x="52" y="21" width="11" height="47" rx="3" fill="url(#proGoldPlate)" stroke="#FEF08A" strokeWidth="0.8" />
              <rect x="217" y="21" width="11" height="47" rx="3" fill="url(#proGoldPlate)" stroke="#FEF08A" strokeWidth="0.8" />
            </motion.g>

            {/* Target Pin */}
            <g transform="translate(115, 118)">
              <motion.circle r="6" fill="none" stroke="#10B981" strokeWidth="1.5" animate={isPlaying ? { scale: [1, 2.1], opacity: [1, 0] } : {}} transition={{ duration: 1.6, repeat: Infinity }} />
              <circle r="3" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M 0 0 L -24 -24 L -85 -24" stroke="#10B981" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
              <g transform="translate(-96, -35)">
                <rect width="78" height="19" rx="5" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
                <text x="39" y="12.5" fill="#D1FAE5" fontSize="8.5" fontWeight="900" textAnchor="middle">
                  {isAr ? 'الفخذ: 98% EMG' : 'Quads: 98% EMG'}
                </text>
              </g>
            </g>
          </svg>
        );
      }

      case 'ROMANIAN_DEADLIFT': {
        return (
          <svg viewBox="0 0 280 200" className="h-full w-full select-none overflow-visible">
            {sharedDefs}
            <ellipse cx="140" cy="182" rx="82" ry="8" fill="#000000" opacity="0.45" />
            <line x1="25" y1="182" x2="255" y2="182" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

            {/* Fixed Lower Leg & Shoe */}
            <path d="M 118 176 L 138 176 L 142 182 L 116 182 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />
            <path d="M 120 176 L 115 130 L 128 130 L 132 176 Z" fill="url(#proLimbGrad)" stroke="#64748B" strokeWidth="0.7" />

            {/* Hamstring Glow */}
            <motion.ellipse
              cx="113"
              cy="114"
              rx="16"
              ry="22"
              fill="url(#proMuscleGlowRed)"
              filter="url(#proGlowFilter)"
              animate={isPlaying ? { scale: [1, 1.32, 1], opacity: [0.4, 0.95, 0.4] } : {}}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Hinging Athlete Body */}
            <motion.g
              animate={isPlaying ? { rotate: [0, 48, 0] } : {}}
              style={{ transformOrigin: '112px 102px' }}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M 115 130 Q 106 115 104 100 L 120 100 L 128 130 Z" fill="url(#proLimbGrad)" stroke="#94A3B8" strokeWidth="0.7" />
              <path d="M 103 102 L 101 76 L 125 84 L 122 104 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.2" />
              <path d="M 101 78 L 104 38 L 124 41 L 124 84 Z" fill="url(#proBodyGrad)" stroke="#94A3B8" strokeWidth="0.8" />
              {/* Sculpted Profile Head */}
              <path d="M 107 37 C 102 32, 102 20, 111 19 C 120 18, 124 27, 120 36 Z" fill="url(#proHeadGrad)" stroke="#94A3B8" strokeWidth="0.7" />
              {/* Arm & Barbell */}
              <path d="M 114 48 L 132 90" stroke="url(#proLimbGrad)" strokeWidth="8.5" strokeLinecap="round" />
              <rect x="86" y="88" width="94" height="5" rx="2.5" fill="url(#proChromeBar)" />
              <rect x="82" y="70" width="10" height="40" rx="3" fill="url(#proGoldPlate)" stroke="#FEF08A" strokeWidth="0.8" />
              <rect x="172" y="70" width="10" height="40" rx="3" fill="url(#proGoldPlate)" stroke="#FEF08A" strokeWidth="0.8" />
            </motion.g>

            <g transform="translate(112, 112)">
              <motion.circle r="6" fill="none" stroke="#EF4444" strokeWidth="1.5" animate={isPlaying ? { scale: [1, 2.1], opacity: [1, 0] } : {}} transition={{ duration: 1.6, repeat: Infinity }} />
              <circle r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M 0 0 L -26 -24 L -88 -24" stroke="#EF4444" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
              <g transform="translate(-96, -35)">
                <rect width="82" height="19" rx="5" fill="#0F172A" stroke="#EF4444" strokeWidth="1" />
                <text x="41" y="12.5" fill="#FEE2E2" fontSize="8.5" fontWeight="900" textAnchor="middle">
                  {isAr ? 'خلفيات: 95% EMG' : 'Hams: 95% EMG'}
                </text>
              </g>
            </g>
          </svg>
        );
      }

      case 'LAT_PULLDOWN':
      case 'BARBELL_ROW': {
        return (
          <svg viewBox="0 0 280 200" className="h-full w-full select-none overflow-visible">
            {sharedDefs}
            {/* Cable Pulldown Frame */}
            <path d="M 60 182 L 60 20 L 220 20 L 220 182" stroke="#334155" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <circle cx="140" cy="20" r="7" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
            <rect x="98" y="132" width="84" height="10" rx="3" fill="#1E293B" stroke="#D4AF37" strokeWidth="1.2" />
            <line x1="140" y1="142" x2="140" y2="182" stroke="#475569" strokeWidth="7" strokeLinecap="round" />

            {/* Athlete Seated Back View (Anatomical V-Taper) */}
            <path d="M 122 142 L 114 180 L 124 180 L 132 142 Z" fill="url(#proLimbGrad)" />
            <path d="M 158 142 L 166 180 L 156 180 L 148 142 Z" fill="url(#proLimbGrad)" />
            <path d="M 106 84 Q 140 76 174 84 L 156 132 L 124 132 Z" fill="url(#proBodyGrad)" stroke="#94A3B8" strokeWidth="0.8" />

            {/* Latissimus Dorsi Glow & Muscle Fibers */}
            <motion.ellipse
              cx="140"
              cy="102"
              rx="30"
              ry="16"
              fill="url(#proMuscleGlowCyan)"
              filter="url(#proGlowFilter)"
              animate={isPlaying ? { scale: [1, 1.32, 1], opacity: [0.4, 0.95, 0.4] } : {}}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            />
            <path d="M 120 94 Q 140 103 160 94 M 124 106 Q 140 114 156 106" stroke="#7DD3FC" strokeWidth="1.4" fill="none" strokeLinecap="round" />

            {/* Sculpted Head Back & Traps */}
            <path d="M 125 82 Q 140 72 155 82 Z" fill="url(#proLimbGrad)" />
            <ellipse cx="140" cy="64" rx="10" ry="12" fill="url(#proHeadGrad)" stroke="#94A3B8" strokeWidth="0.8" />

            {/* Dynamic Pulldown Bar & Tapered Arms */}
            <motion.g
              animate={isPlaying ? { y: [0, 32, 0] } : {}}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            >
              <line x1="140" y1="20" x2="140" y2="48" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 2" />
              <path d="M 74 56 Q 140 42 206 56" stroke="url(#proChromeBar)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M 108 86 L 90 58" stroke="url(#proLimbGrad)" strokeWidth="8.5" strokeLinecap="round" />
              <path d="M 172 86 L 190 58" stroke="url(#proLimbGrad)" strokeWidth="8.5" strokeLinecap="round" />
              <circle cx="90" cy="58" r="4" fill="#D4AF37" />
              <circle cx="190" cy="58" r="4" fill="#D4AF37" />
            </motion.g>

            <g transform="translate(140, 102)">
              <motion.circle r="6" fill="none" stroke="#38BDF8" strokeWidth="1.5" animate={isPlaying ? { scale: [1, 2.1], opacity: [1, 0] } : {}} transition={{ duration: 1.6, repeat: Infinity }} />
              <circle r="3" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M 0 0 L 28 -26 L 94 -26" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
              <g transform="translate(28, -37)">
                <rect width="84" height="19" rx="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
                <text x="42" y="12.5" fill="#E0F2FE" fontSize="8.5" fontWeight="900" textAnchor="middle">
                  {isAr ? 'المجنص: 95% EMG' : 'Lats: 95% EMG'}
                </text>
              </g>
            </g>
          </svg>
        );
      }

      case 'LATERAL_RAISE': {
        return (
          <svg viewBox="0 0 280 200" className="h-full w-full select-none overflow-visible">
            {sharedDefs}
            {/* Studio Floor & Contact Shadow */}
            <ellipse cx="140" cy="182" rx="75" ry="7" fill="#000000" opacity="0.45" />
            <line x1="25" y1="182" x2="255" y2="182" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

            {/* Anatomically Tapered Standing Legs & Shoes */}
            <path d="M 122 126 Q 118 148 122 177 L 130 177 L 135 126 Z" fill="url(#proLimbGrad)" stroke="#64748B" strokeWidth="0.7" />
            <path d="M 158 126 Q 162 148 158 177 L 150 177 L 145 126 Z" fill="url(#proLimbGrad)" stroke="#64748B" strokeWidth="0.7" />
            <path d="M 116 177 L 132 177 L 133 182 L 114 182 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />
            <path d="M 148 177 L 164 177 L 166 182 L 147 182 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />

            {/* Athletic Compression Shorts */}
            <path d="M 120 100 L 160 100 L 162 130 L 142 126 L 138 126 L 118 130 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.2" />

            {/* Sculpted V-Taper Anatomical Torso (Traps, Chest, Abs) */}
            <path d="M 116 62 Q 140 54 164 62 L 157 101 L 123 101 Z" fill="url(#proBodyGrad)" stroke="#94A3B8" strokeWidth="0.8" />
            <path d="M 124 68 Q 132 74 139 69 M 141 69 Q 148 74 156 68" stroke="#1E293B" strokeWidth="1.5" fill="none" />
            <path d="M 134 79 L 146 79 M 135 87 L 145 87 M 140 76 L 140 94" stroke="#1E293B" strokeWidth="1.2" opacity="0.8" />

            {/* Sculpted Neck, Traps & Head Silhouette (No Cartoon Eyes/Headband) */}
            <path d="M 126 59 Q 140 51 154 59 L 146 53 L 134 53 Z" fill="url(#proLimbGrad)" />
            <rect x="135.5" y="45" width="9" height="9" rx="3" fill="url(#proLimbGrad)" />
            <ellipse cx="140" cy="34" rx="9.5" ry="12" fill="url(#proHeadGrad)" stroke="#94A3B8" strokeWidth="0.8" />

            {/* Motion Arc Trajectory Guides */}
            <path d="M 92 115 A 55 55 0 0 1 70 68" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.5" />
            <path d="M 188 115 A 55 55 0 0 0 210 68" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.5" />

            {/* Dual Lateral Deltoid Muscle Fibers & Glow */}
            <motion.ellipse
              cx="114"
              cy="65"
              rx="13"
              ry="14"
              fill="url(#proMuscleGlowGold)"
              filter="url(#proGlowFilter)"
              animate={isPlaying ? { scale: [1, 1.35, 1], opacity: [0.4, 0.95, 0.4] } : {}}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.ellipse
              cx="166"
              cy="65"
              rx="13"
              ry="14"
              fill="url(#proMuscleGlowGold)"
              filter="url(#proGlowFilter)"
              animate={isPlaying ? { scale: [1, 1.35, 1], opacity: [0.4, 0.95, 0.4] } : {}}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Left Tapered Arm & 3D Hex Dumbbell */}
            <motion.g
              animate={isPlaying ? { rotate: [0, -74, 0] } : {}}
              style={{ transformOrigin: '117px 64px' }}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M 114 61 Q 104 82 95 113 L 101 115 Q 112 88 121 67 Z" fill="url(#proLimbGrad)" stroke="#CBD5E1" strokeWidth="0.7" />
              <rect x="86" y="110" width="18" height="12" rx="3" fill="#1E293B" stroke="#D4AF37" strokeWidth="1.2" />
              <rect x="92" y="112" width="6" height="8" rx="1" fill="#94A3B8" />
            </motion.g>

            {/* Right Tapered Arm & 3D Hex Dumbbell */}
            <motion.g
              animate={isPlaying ? { rotate: [0, 74, 0] } : {}}
              style={{ transformOrigin: '163px 64px' }}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M 166 61 Q 176 82 185 113 L 179 115 Q 168 88 159 67 Z" fill="url(#proLimbGrad)" stroke="#CBD5E1" strokeWidth="0.7" />
              <rect x="176" y="110" width="18" height="12" rx="3" fill="#1E293B" stroke="#D4AF37" strokeWidth="1.2" />
              <rect x="182" y="112" width="6" height="8" rx="1" fill="#94A3B8" />
            </motion.g>

            {/* Callout Pin */}
            <g transform="translate(166, 64)">
              <motion.circle r="6" fill="none" stroke="#F59E0B" strokeWidth="1.5" animate={isPlaying ? { scale: [1, 2.1], opacity: [1, 0] } : {}} transition={{ duration: 1.6, repeat: Infinity }} />
              <circle r="3" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M 0 0 L 22 -22 L 88 -22" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
              <g transform="translate(22, -33)">
                <rect width="80" height="19" rx="5" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
                <text x="40" y="12.5" fill="#FEF3C7" fontSize="8.5" fontWeight="900" textAnchor="middle">
                  {isAr ? 'الكتف: 96% EMG' : 'Delts: 96% EMG'}
                </text>
              </g>
            </g>
          </svg>
        );
      }

      case 'TRICEPS_PUSHDOWN':
      case 'BICEPS_CURL':
      default: {
        const isBiceps = motionType === 'BICEPS_CURL';
        const pinColor = isBiceps ? '#EF4444' : '#10B981';
        return (
          <svg viewBox="0 0 280 200" className="h-full w-full select-none overflow-visible">
            {sharedDefs}
            {/* Floor & Shadow */}
            <ellipse cx="135" cy="182" rx="74" ry="7" fill="#000000" opacity="0.45" />
            <line x1="25" y1="182" x2="255" y2="182" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

            {/* Cable Pulley Column for Pushdown */}
            {!isBiceps && (
              <>
                <line x1="178" y1="18" x2="178" y2="182" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="154" y1="18" x2="178" y2="18" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                <circle cx="154" cy="20" r="5" fill="#64748B" stroke="#94A3B8" strokeWidth="1" />
                <line x1="154" y1="24" x2="154" y2="112" stroke="#CBD5E1" strokeWidth="1.8" strokeDasharray="3 2" opacity="0.7" />
              </>
            )}

            {/* Anatomically Tapered Standing Profile Legs & Shoes */}
            <path d="M 114 126 Q 112 150 116 177 L 125 177 L 127 126 Z" fill="url(#proLimbGrad)" stroke="#64748B" strokeWidth="0.7" />
            <path d="M 131 126 Q 134 150 137 177 L 146 177 L 143 126 Z" fill="url(#proLimbGrad)" stroke="#64748B" strokeWidth="0.7" />
            <path d="M 114 177 L 130 177 L 132 182 L 112 182 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />
            <path d="M 134 177 L 152 177 L 154 182 L 133 182 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />

            {/* Athletic Shorts & Profile V-Torso */}
            <path d="M 112 96 L 144 96 L 146 128 L 112 128 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.2" />
            <path d="M 114 58 Q 130 54 143 60 L 143 97 L 113 97 Z" fill="url(#proBodyGrad)" stroke="#94A3B8" strokeWidth="0.8" />

            {/* Sculpted Profile Head & Neck (No Cartoon Face) */}
            <rect x="123" y="47" width="8.5" height="9" rx="2.5" fill="url(#proLimbGrad)" />
            <path d="M 122 48 C 117 42, 118 25, 128 24 C 138 23, 141 34, 138 44 L 131 49 Z" fill="url(#proHeadGrad)" stroke="#94A3B8" strokeWidth="0.8" />

            {/* Pinned Upper Arm + Activated Biceps/Triceps Glow */}
            <path d="M 131 61 Q 142 75 142 96 L 132 97 Q 130 78 126 64 Z" fill="url(#proLimbGrad)" stroke="#CBD5E1" strokeWidth="0.7" />
            <motion.ellipse
              cx="136"
              cy="80"
              rx="12"
              ry="16"
              fill={isBiceps ? 'url(#proMuscleGlowRed)' : 'url(#proMuscleGlowEmerald)'}
              filter="url(#proGlowFilter)"
              animate={isPlaying ? { scale: [1, 1.32, 1], opacity: [0.4, 0.95, 0.4] } : {}}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Joint Pivot Ring at Elbow */}
            <circle cx="137" cy="96" r="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />

            {/* Articulated Forearm + Cable Rope or Barbell */}
            <motion.g
              animate={isPlaying ? { rotate: isBiceps ? [0, -86, 0] : [0, 68, 0] } : {}}
              style={{ transformOrigin: '137px 96px' }}
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M 134 95 Q 146 112 156 132 L 150 135 Q 139 117 131 99 Z" fill="url(#proLimbGrad)" stroke="#CBD5E1" strokeWidth="0.7" />
              <circle cx="153" cy="133" r="4" fill="#D4AF37" />
              {isBiceps ? (
                <g transform="translate(153, 133)">
                  <rect x="-15" y="-2" width="30" height="4" rx="2" fill="url(#proChromeBar)" />
                  <circle cx="-15" cy="0" r="7" fill="url(#proGoldPlate)" />
                  <circle cx="15" cy="0" r="7" fill="url(#proGoldPlate)" />
                </g>
              ) : (
                <g transform="translate(153, 133)">
                  <path d="M 0 0 L -7 16 M 0 0 L 7 16" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="-7" cy="16" r="3.5" fill="#0F172A" stroke="#94A3B8" strokeWidth="0.8" />
                  <circle cx="7" cy="16" r="3.5" fill="#0F172A" stroke="#94A3B8" strokeWidth="0.8" />
                </g>
              )}
            </motion.g>

            {/* Target Pin */}
            <g transform="translate(136, 80)">
              <motion.circle r="6" fill="none" stroke={pinColor} strokeWidth="1.5" animate={isPlaying ? { scale: [1, 2.1], opacity: [1, 0] } : {}} transition={{ duration: 1.6, repeat: Infinity }} />
              <circle r="3" fill={pinColor} stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M 0 0 L -26 -24 L -94 -24" stroke={pinColor} strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
              <g transform="translate(-105, -35)">
                <rect width="84" height="19" rx="5" fill="#0F172A" stroke={pinColor} strokeWidth="1" />
                <text x="42" y="12.5" fill="#FFFFFF" fontSize="8.5" fontWeight="900" textAnchor="middle">
                  {isBiceps
                    ? isAr ? 'بايسبس: 96% EMG' : 'Biceps: 96% EMG'
                    : isAr ? 'ترايسبس: 95% EMG' : 'Triceps: 95% EMG'}
                </text>
              </g>
            </g>
          </svg>
        );
      }
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-[#0D1424] to-slate-950 p-2.5 text-white shadow-inner">
      {/* Pro 3D Studio Spotlight & Biomechanical Grid Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 25%, rgba(212,175,55,0.22), transparent 60%), radial-gradient(circle at 50% 85%, rgba(16,185,129,0.12), transparent 55%), linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 100% 100%, 20px 20px, 20px 20px',
        }}
      />

      {/* Top Biomechanical Joint ROM & 3D Studio HUD */}
      <div className="relative z-10 flex w-full items-center justify-between gap-1.5 text-[9.5px] font-black">
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-amber-500/40 bg-slate-900/90 px-2 py-0.5 text-amber-300 shadow-sm">
          <Sparkles className="h-2.5 w-2.5 shrink-0 text-amber-400" />
          <span>{isAr ? 'استوديو 3D تشريحي' : '3D Biomechanics'}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-emerald-500/40 bg-slate-900/90 px-2 py-0.5 font-mono text-emerald-300">
          ∠ ROM 95° • {impact.primaryTarget.activationPct}% EMG
        </span>
      </div>

      {/* Main 3D-Shaded Exercise SVG Stage */}
      <div className="relative z-10 my-1 flex min-h-0 w-full flex-1 items-center justify-center px-1">
        {renderExerciseSvg()}
      </div>

      {/* Bottom Live EMG Muscle Fiber Activation Bar */}
      <div className="relative z-10 w-full pt-1">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-700/80 bg-slate-900/95 px-2.5 py-1.5 text-[10px] text-white backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full animate-pulse"
              style={{ backgroundColor: impact.primaryTarget.color }}
            />
            <span className="truncate font-bold text-slate-100">
              {isAr ? impact.primaryTarget.nameAr : impact.primaryTarget.nameEn}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-800 sm:w-14">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: impact.primaryTarget.color }}
                animate={
                  isPlaying
                    ? { width: ['45%', `${impact.primaryTarget.activationPct}%`, '45%'] }
                    : { width: `${impact.primaryTarget.activationPct}%` }
                }
                transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <span className="font-mono text-[10px] font-black text-amber-400">
              {impact.primaryTarget.activationPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Anatomical Body Heatmap & Impact Breakdown
 * Shows human body silhouette highlighting the exact muscles activated by this exercise
 */
function BodyAnatomyImpactView({
  impact,
  isAr,
}: {
  impact: BodyImpactInfo;
  isAr: boolean;
}) {
  const isChest = impact.muscleRegion === 'CHEST';
  const isBack = impact.muscleRegion === 'BACK';
  const isLegs = impact.muscleRegion === 'LEGS';
  const isShoulders = impact.muscleRegion === 'SHOULDERS';
  const isArms = impact.muscleRegion === 'ARMS';

  return (
    <div className="space-y-4">
      {/* Visual Human Silhouette Heatmap Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        {/* Anatomical Silhouette Graphic */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-3 dark:bg-slate-950 md:col-span-4 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
            {isAr ? 'خريطة الاستهداف التشريحي المباشر' : 'Live Anatomy Heatmap'}
          </span>
          <svg viewBox="0 0 120 180" className="w-28 h-40">
            <defs>
              <filter id="bodyGlow">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Base Human Silhouette Silhouette */}
            {/* Head & Neck */}
            <circle cx="60" cy="22" r="10" fill="#94A3B8" opacity="0.4" />
            <rect x="57" y="32" width="6" height="6" rx="2" fill="#94A3B8" opacity="0.4" />

            {/* Shoulders */}
            <path
              d="M 38 42 Q 60 36 82 42 L 80 52 L 40 52 Z"
              fill={isShoulders ? '#F59E0B' : '#94A3B8'}
              opacity={isShoulders ? 0.95 : 0.35}
              filter={isShoulders ? 'url(#bodyGlow)' : undefined}
            />

            {/* Pectorals / Chest Zone */}
            <path
              d="M 44 48 Q 60 48 76 48 L 74 65 Q 60 70 46 65 Z"
              fill={isChest ? '#EF4444' : '#94A3B8'}
              opacity={isChest ? 0.95 : 0.35}
              filter={isChest ? 'url(#bodyGlow)' : undefined}
            />

            {/* Upper Back / Lats Wings Zone */}
            <path
              d="M 40 52 L 48 75 L 72 75 L 80 52 Z"
              fill={isBack ? '#38BDF8' : '#94A3B8'}
              opacity={isBack ? 0.95 : 0.35}
              filter={isBack ? 'url(#bodyGlow)' : undefined}
            />

            {/* Arms / Biceps & Triceps Zone */}
            <path
              d="M 36 48 L 28 85 L 34 85 L 42 54 Z"
              fill={isArms ? '#10B981' : '#94A3B8'}
              opacity={isArms ? 0.95 : 0.35}
              filter={isArms ? 'url(#bodyGlow)' : undefined}
            />
            <path
              d="M 84 48 L 92 85 L 86 85 L 78 54 Z"
              fill={isArms ? '#10B981' : '#94A3B8'}
              opacity={isArms ? 0.95 : 0.35}
              filter={isArms ? 'url(#bodyGlow)' : undefined}
            />

            {/* Abs / Core */}
            <path d="M 49 68 L 71 68 L 68 95 L 52 95 Z" fill="#64748B" opacity="0.4" />

            {/* Pelvis & Hips */}
            <path d="M 48 95 L 72 95 L 76 110 L 44 110 Z" fill="#64748B" opacity="0.4" />

            {/* Legs / Quads & Hamstrings Zone */}
            <path
              d="M 46 110 L 44 145 L 56 145 L 58 110 Z"
              fill={isLegs ? '#10B981' : '#94A3B8'}
              opacity={isLegs ? 0.95 : 0.35}
              filter={isLegs ? 'url(#bodyGlow)' : undefined}
            />
            <path
              d="M 74 110 L 76 145 L 64 145 L 62 110 Z"
              fill={isLegs ? '#10B981' : '#94A3B8'}
              opacity={isLegs ? 0.95 : 0.35}
              filter={isLegs ? 'url(#bodyGlow)' : undefined}
            />

            {/* Calves & Feet */}
            <path d="M 44 146 L 46 172 L 54 172 L 56 146 Z" fill="#64748B" opacity="0.4" />
            <path d="M 76 146 L 74 172 L 66 172 L 64 146 Z" fill="#64748B" opacity="0.4" />
          </svg>

          <span className="mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-black text-white" style={{ backgroundColor: impact.primaryTarget.color }}>
            {isAr ? 'المنطقة الأكثر استفادة' : 'Primary Target Zone'}
          </span>
        </div>

        {/* Muscle Activation Percentages */}
        <div className="space-y-3 md:col-span-8 flex flex-col justify-center">
          <div>
            <div className="flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                <Flame className="h-4 w-4 text-rose-500" />
                <span>{isAr ? impact.primaryTarget.nameAr : impact.primaryTarget.nameEn}</span>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {impact.primaryTarget.activationPct}%
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${impact.primaryTarget.activationPct}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: impact.primaryTarget.color }}
              />
            </div>
          </div>

          {impact.secondaryTargets.map((sec, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-amber-500" />
                  <span>{isAr ? sec.nameAr : sec.nameEn}</span>
                </span>
                <span className="font-mono">{sec.activationPct}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sec.activationPct}%` }}
                  transition={{ duration: 0.8, delay: 0.1 * (idx + 1) }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: sec.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulleted Real-World Body Benefits */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-[#121623]">
        <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
          <HeartPulse className="h-4 w-4 text-[#D4AF37]" />
          <span>{isAr ? 'كيف يفيد هذا التمرين شكل وصحة جسمك بالضبط؟' : 'Exact Physical & Health Transformation:'}</span>
        </h4>
        <ul className="mt-2.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          {(isAr ? impact.bodyBenefitsAr : impact.bodyBenefitsEn).map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Daily Life Function & Posture Benefit Pill */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900">
            <span className="font-bold text-slate-900 dark:text-white">
              {isAr ? '💡 في حياتك اليومية: ' : '💡 Daily Life: '}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {isAr ? impact.dailyFunctionalBenefitAr : impact.dailyFunctionalBenefitEn}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900">
            <span className="font-bold text-slate-900 dark:text-white">
              {isAr ? '🧍 القوام واستقامة الظهر: ' : '🧍 Posture & Spine: '}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {isAr ? impact.postureImpactAr : impact.postureImpactEn}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Standalone Exercise Motion Card Component
 */
export function ExerciseMotionCard({
  exercise,
  isAr: isArProp,
  locale = 'ar',
  doneSets = 0,
  onCompleteSet,
}: {
  exercise: ExerciseMotionItem;
  isAr?: boolean;
  locale?: string;
  doneSets?: number;
  onCompleteSet?: () => void;
}) {
  const isAr = isArProp !== undefined ? isArProp : locale === 'ar';
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'CARTOON' | 'ANATOMY'>('CARTOON');
  const [activePhase, setActivePhase] = useState<'ECCENTRIC' | 'HOLD' | 'CONCENTRIC'>('ECCENTRIC');

  const isFullyDone = doneSets >= exercise.sets;
  const impact = EXERCISE_BODY_IMPACT_MAP[exercise.motionType] ?? EXERCISE_BODY_IMPACT_MAP.BENCH_PRESS;

  // Real-time repetition cadence phase loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActivePhase((prev) => {
        if (prev === 'ECCENTRIC') return 'HOLD';
        if (prev === 'HOLD') return 'CONCENTRIC';
        return 'ECCENTRIC';
      });
    }, 1100 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border transition shadow-sm ${
        isFullyDone
          ? 'border-emerald-500/50 bg-emerald-500/5 dark:border-emerald-500/40 dark:bg-emerald-500/10'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#121623] dark:hover:border-slate-700'
      }`}
    >
      {/* Top Header Mode Tabs: [Cartoon Motion] vs [Anatomy Impact] */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('CARTOON')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
              activeTab === 'CARTOON'
                ? 'bg-slate-950 text-white shadow-xs dark:bg-[#D4AF37] dark:text-slate-950'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            <span>{isAr ? 'محاكاة التمرين 3D' : '3D Motion Studio'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ANATOMY')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
              activeTab === 'ANATOMY'
                ? 'bg-slate-950 text-white shadow-xs dark:bg-[#D4AF37] dark:text-slate-950'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            <span>{isAr ? 'خريطة عضلات الجسم المستفيدة' : 'Body Impact & Anatomy'}</span>
          </button>
        </div>

        {/* Speed & Pause Controls (Active on Cartoon Tab) */}
        {activeTab === 'CARTOON' && (
          <div className="flex items-center gap-1.5">
            {[1, 0.5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                  speed === s
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="ms-1 rounded-full p-1 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
              title={isPlaying ? (isAr ? 'إيقاف الحركة' : 'Pause') : isAr ? 'تشغيل الحركة' : 'Play'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {activeTab === 'CARTOON' ? (
            <motion.div
              key="cartoon"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-5"
            >
              {/* Visual 3D Biomechanical Studio Column */}
              <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-2.5 dark:border-slate-800 md:col-span-6">
                {/* High-Definition 3D Exercise Stage */}
                <div className="h-56 w-full flex items-center justify-center sm:h-60">
                  <CartoonAthleteVisualCanvas
                    motionType={exercise.motionType}
                    isPlaying={isPlaying}
                    speedMultiplier={speed}
                    isAr={isAr}
                  />
                </div>

                {/* Biomechanical Cadence Tempo Indicator (3s Down -> 1s Hold -> 1s Up) */}
                <div className="mt-2 flex w-full flex-col gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-white">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-300">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Timer className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
                      <span>{isAr ? 'إيقاع الحركة (Tempo)' : 'Cadence Tempo'}</span>
                    </span>
                    <span className="whitespace-nowrap font-mono text-[10px] text-emerald-400">
                      {activePhase === 'ECCENTRIC'
                        ? isAr ? 'نزول هادئ' : 'Lowering'
                        : activePhase === 'HOLD'
                          ? isAr ? 'ثبات وانقباض' : 'Peak Hold'
                          : isAr ? 'دفع انفجاري' : 'Explosion'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center font-mono text-[9.5px] font-extrabold">
                    <span
                      className={`whitespace-nowrap rounded-lg px-1 py-1 transition ${
                        activePhase === 'ECCENTRIC'
                          ? 'bg-sky-500/20 text-sky-300 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {isAr ? '١. نزول ٣ث' : '1. Down 3s'}
                    </span>
                    <span
                      className={`whitespace-nowrap rounded-lg px-1 py-1 transition ${
                        activePhase === 'HOLD'
                          ? 'bg-amber-500/20 text-amber-300 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {isAr ? '٢. ثبات ١ث' : '2. Hold 1s'}
                    </span>
                    <span
                      className={`whitespace-nowrap rounded-lg px-1 py-1 transition ${
                        activePhase === 'CONCENTRIC'
                          ? 'bg-emerald-500/20 text-emerald-300 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {isAr ? '٣. صعود ١ث' : '3. Drive 1s'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Exercise Description, Target Badges & Execution Controls */}
              <div className="flex flex-col justify-between space-y-3 md:col-span-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {isAr ? exercise.nameAr : exercise.nameEn}
                    </h3>
                    {isFullyDone && (
                      <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white">
                        {isAr ? 'أنهيت التمرين ✓' : 'Completed ✓'}
                      </span>
                    )}
                  </div>

                  {/* Highlighted Target Muscle Badges with Direct Body Impact Callout */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-lg bg-rose-500/15 px-2.5 py-1 font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-rose-500" />
                      <span>{isAr ? 'العضلة المستفيدة: ' : 'Target: '}</span>
                      <strong className="font-black">{isAr ? exercise.targetMuscleAr : exercise.targetMuscleEn}</strong>
                    </span>
                    {exercise.secondaryMuscleAr && (
                      <span className="rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 font-bold">
                        {isAr ? 'المساعدة: ' : 'Secondary: '}
                        {isAr ? exercise.secondaryMuscleAr : exercise.secondaryMuscleEn}
                      </span>
                    )}
                  </div>

                  {/* Form Cues & Safety Guideline */}
                  <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800/80 dark:bg-slate-900/50">
                    <p className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? 'تعليمات الأداء السليم وتفادي الإصابات:' : 'Pro Execution Form Cue:'}</span>
                    </p>
                    <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                      {isAr ? exercise.cuesAr : exercise.cuesEn}
                    </p>
                  </div>
                </div>

                {/* Sets, Reps & Rest Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                    <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {exercise.sets} {isAr ? 'مجموعات' : 'Sets'} × {exercise.reps}
                    </span>
                    <span className="rounded-xl bg-amber-500/15 px-3 py-1.5 text-amber-800 dark:text-amber-300">
                      <Timer className="inline h-3.5 w-3.5 me-1 text-[#D4AF37]" />
                      {isAr ? `راحة: ${exercise.restSec} ثانية` : `Rest: ${exercise.restSec}s`}
                    </span>
                  </div>

                  {/* Set Progression & Complete Set Button */}
                  {onCompleteSet && (
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {Array.from({ length: exercise.sets }).map((_, idx) => (
                          <span
                            key={idx}
                            className={`h-2.5 w-5 rounded-full transition ${
                              idx < doneSets ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={onCompleteSet}
                        className={`rounded-xl px-4 py-2 text-xs font-extrabold transition shadow-xs ${
                          isFullyDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-500'
                        }`}
                      >
                        {isFullyDone
                          ? isAr
                            ? `تم بالكامل (${doneSets}/${exercise.sets})`
                            : `Completed (${doneSets}/${exercise.sets})`
                          : isAr
                            ? `+ أتممت مجموعة (${doneSets}/${exercise.sets})`
                            : `+ Complete Set (${doneSets}/${exercise.sets})`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="anatomy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <BodyAnatomyImpactView impact={impact} isAr={isAr} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
