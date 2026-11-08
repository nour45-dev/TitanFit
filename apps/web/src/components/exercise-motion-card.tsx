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
    switch (motionType) {
      case 'BENCH_PRESS':
      case 'INCLINE_PRESS': {
        const isIncline = motionType === 'INCLINE_PRESS';
        return (
          <svg viewBox="0 0 280 200" className="w-full h-full select-none overflow-visible">
            <defs>
              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="45%" stopColor="#FDBA74" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
              <linearGradient id="tankGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="50%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="goldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="45%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
              <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.98" />
                <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>
              <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 3D Studio Perspective Floor Grid & Shadow */}
            <path d="M 20 182 L 260 182 M 45 172 L 235 172" stroke="#334155" strokeWidth="0.7" opacity="0.35" strokeDasharray="4 4" />
            <ellipse cx="140" cy="180" rx="95" ry="11" fill="#000000" opacity="0.26" />

            {/* Heavy Duty Gym Bench with 3D Metallic Frame */}
            <g transform={isIncline ? 'rotate(-16 70 120)' : ''}>
              <rect x="50" y="125" width="145" height="14" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="2" />
              <rect x="52" y="122" width="141" height="5" rx="2" fill="#D4AF37" opacity="0.75" />
              {/* Bench Steel Legs */}
              <path d="M 65 139 L 55 178" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
              <path d="M 175 139 L 185 178" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
            </g>

            {/* Realistic Muscular Athlete - Lying Down */}
            <path d="M 175 128 Q 195 135 205 160 L 205 178" stroke="#0F172A" strokeWidth="14" strokeLinecap="round" fill="none" />
            <ellipse cx="205" cy="178" rx="11" ry="5.5" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1" />

            {/* Athlete Torso with 3D Compression Singlet */}
            <path
              d={isIncline ? 'M 75 110 Q 115 100 150 115 L 145 135 L 75 125 Z' : 'M 75 115 Q 115 110 155 115 L 150 135 L 75 135 Z'}
              fill="url(#tankGrad)"
              stroke="#D4AF37"
              strokeWidth="1.5"
            />

            {/* Realistic Sculpted Head & Hair with Gold Headband */}
            <circle cx="70" cy="108" r="16" fill="url(#skinGrad)" />
            <path d="M 58 102 Q 68 85 82 98 Q 78 106 72 104 Z" fill="#0F172A" />
            <path d="M 60 104 Q 72 98 84 104" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
            <circle cx="74" cy="107" r="2" fill="#0F172A" />
            <path d="M 71 103 L 77 104" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 68 116 Q 76 118 82 112" stroke="#C2410C" strokeWidth="1.4" fill="none" />

            {/* Target Activated Pectorals Heatmap Zone (Glowing 3D Striated Chest) */}
            <motion.ellipse
              cx="118"
              cy="110"
              rx="19"
              ry="13"
              fill="url(#targetGlow)"
              filter="url(#glowFilter)"
              animate={
                isPlaying
                  ? {
                      scale: [1, 1.38, 1],
                      opacity: [0.5, 0.98, 0.5],
                    }
                  : {}
              }
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Anatomical Muscle Striation Fibers */}
            <path d="M 106 112 Q 118 119 130 112" stroke="#EF4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 109 108 Q 118 114 127 108" stroke="#FCA5A5" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.85" />

            {/* Biomechanical Moving Barbell & Sculpted 3D Arms */}
            <motion.g
              animate={
                isPlaying
                  ? {
                      y: [0, -38, 0],
                      x: isIncline ? [0, -6, 0] : [0, 0, 0],
                    }
                  : {}
              }
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Muscular Biceps / Triceps & Forearms with Vascular Definition */}
              <path
                d="M 100 114 Q 106 90 118 68"
                stroke="url(#skinGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 102 110 Q 108 92 117 72"
                stroke="#FED7AA"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
              {/* Titan Wrist Wraps */}
              <rect x="113" y="62" width="10" height="7" rx="2" fill="#D4AF37" />
              {/* Hands Gripping Bar */}
              <circle cx="118" cy="65" r="5" fill="#FDBA74" />

            {/* Olympic Steel Barbell with Textured Knurling */}
            <line x1="45" y1="65" x2="215" y2="65" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
            <line x1="45" y1="63" x2="215" y2="63" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Chrome Barbell Collars */}
            <rect x="62" y="57" width="6" height="16" rx="2" fill="#94A3B8" />
            <rect x="192" y="57" width="6" height="16" rx="2" fill="#94A3B8" />

            {/* Embossed 20 KG Golden Bumper Plates */}
            <rect x="52" y="38" width="11" height="54" rx="4" fill="url(#goldPlate)" stroke="#78350F" strokeWidth="1.5" />
            <rect x="197" y="38" width="11" height="54" rx="4" fill="url(#goldPlate)" stroke="#78350F" strokeWidth="1.5" />
            <text x="57" y="68" fontSize="7" fontWeight="bold" fill="#78350F" textAnchor="middle" transform="rotate(-90 57 68)">
              20 KG
            </text>
            <text x="202" y="68" fontSize="7" fontWeight="bold" fill="#78350F" textAnchor="middle" transform="rotate(90 202 68)">
              20 KG
            </text>
          </motion.g>

          {/* Visual Target Activation Radar Callout Pin (علامة العضلة المستهدفة) */}
          <g transform="translate(118, 110)">
            <motion.circle
              r="7"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              animate={isPlaying ? { scale: [1, 2.2], opacity: [1, 0] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <circle r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Connector Line to Callout Pill */}
            <path d="M 0 0 L 25 -28 L 85 -28" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <g transform="translate(25, -39)">
              <rect width="80" height="20" rx="6" fill="#0F172A" stroke="#EF4444" strokeWidth="1.2" />
              <text x="40" y="13" fill="#FEE2E2" fontSize="9" fontWeight="900" textAnchor="middle">
                {isAr ? '🔥 الصدر: +96% تنشيط' : '🔥 Chest: +96% Act.'}
              </text>
            </g>
          </g>
        </svg>
      );
    }

    case 'BARBELL_SQUAT': {
      return (
        <svg viewBox="0 0 280 200" className="w-full h-full select-none overflow-visible">
          <defs>
            <linearGradient id="squatGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <radialGradient id="quadGlowRadar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#059669" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Floor & Platform */}
          <rect x="30" y="180" width="220" height="8" rx="4" fill="#334155" />
          <ellipse cx="140" cy="180" rx="80" ry="8" fill="#000000" opacity="0.2" />

          {/* Athletic Training Shoes on Platform */}
          <ellipse cx="112" cy="178" rx="14" ry="6" fill="#D4AF37" stroke="#0F172A" strokeWidth="1.5" />
          <ellipse cx="168" cy="178" rx="14" ry="6" fill="#D4AF37" stroke="#0F172A" strokeWidth="1.5" />

          {/* Dynamic Lifter Body: Olympic Squatting Down & Driving Up */}
          <motion.g
            animate={
              isPlaying
                ? {
                    y: [0, 32, 0],
                  }
                : {}
            }
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Muscular Calves & Shins */}
            <path d="M 112 175 L 105 135" stroke="#FDBA74" strokeWidth="12" strokeLinecap="round" />
            <path d="M 168 175 L 175 135" stroke="#FDBA74" strokeWidth="12" strokeLinecap="round" />

            {/* Powerful Quadriceps & Glutes */}
            <path d="M 105 135 L 126 95" stroke="#FDBA74" strokeWidth="14" strokeLinecap="round" />
            <path d="M 175 135 L 154 95" stroke="#FDBA74" strokeWidth="14" strokeLinecap="round" />

            {/* Targeted Quadriceps Heatmap Glow (الفخذ الأمامي) */}
            <motion.ellipse
              cx="140"
              cy="115"
              rx="28"
              ry="18"
              fill="url(#quadGlowRadar)"
              animate={
                isPlaying
                  ? {
                      scale: [1, 1.4, 1],
                      opacity: [0.4, 0.95, 0.4],
                    }
                  : {}
              }
              transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Gym Shorts with Gold Side Stripe */}
            <path d="M 120 95 L 160 95 L 168 122 L 140 120 L 112 122 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.5" />
            <line x1="122" y1="95" x2="114" y2="122" stroke="#D4AF37" strokeWidth="2.5" />
            <line x1="158" y1="95" x2="166" y2="122" stroke="#D4AF37" strokeWidth="2.5" />

            {/* Muscular Core & Chest (TitanFit Tank Top) */}
            <path d="M 125 95 L 155 95 L 158 55 L 122 55 Z" fill="#1E293B" stroke="#D4AF37" strokeWidth="1.5" />
            {/* Abs Contour */}
            <line x1="140" y1="68" x2="140" y2="90" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

            {/* Cartoon Champion Head with Focused Expression */}
            <circle cx="140" cy="40" r="14" fill="#FDBA74" />
            {/* Modern Hair & Headband */}
            <path d="M 128 34 Q 140 20 152 34 Q 146 42 140 40 Z" fill="#1E1B4B" />
            <path d="M 128 36 Q 140 33 152 36" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
            {/* Eyes & Fierce Focus */}
            <circle cx="136" cy="40" r="1.8" fill="#0F172A" />
            <circle cx="144" cy="40" r="1.8" fill="#0F172A" />
            <path d="M 137 46 Q 140 48 143 46" stroke="#0F172A" strokeWidth="1.2" fill="none" />

            {/* Arms Gripping Barbell on Traps */}
            <path d="M 122 58 L 105 48 L 114 46" stroke="#FDBA74" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 158 58 L 175 48 L 166 46" stroke="#FDBA74" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Olympic Barbell Rested Across Trapezius */}
            <line x1="40" y1="46" x2="240" y2="46" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
            <line x1="40" y1="44" x2="240" y2="44" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Heavy Gold Plates */}
            <rect x="52" y="22" width="12" height="48" rx="4" fill="url(#squatGold)" stroke="#78350F" strokeWidth="1.5" />
            <rect x="216" y="22" width="12" height="48" rx="4" fill="url(#squatGold)" stroke="#78350F" strokeWidth="1.5" />
          </motion.g>

          {/* Visual Target Radar Callout Pin (علامة الفخذ الأمامي) */}
          <g transform="translate(140, 115)">
            <motion.circle
              r="8"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              animate={isPlaying ? { scale: [1, 2.3], opacity: [1, 0] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <circle r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M 0 0 L 35 -35 L 90 -35" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <g transform="translate(35, -46)">
              <rect width="84" height="20" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1.2" />
              <text x="42" y="13" fill="#D1FAE5" fontSize="9" fontWeight="900" textAnchor="middle">
                {isAr ? '⚡ الفخذ: +98% بناء' : '⚡ Quads: +98% Act.'}
              </text>
            </g>
          </g>
        </svg>
      );
    }

    case 'ROMANIAN_DEADLIFT': {
      return (
        <svg viewBox="0 0 280 200" className="w-full h-full select-none overflow-visible">
          <defs>
            <radialGradient id="hamGlowRadar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#DC2626" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Floor & Platform */}
          <rect x="30" y="180" width="220" height="8" rx="4" fill="#334155" />
          <ellipse cx="140" cy="180" rx="80" ry="8" fill="#000000" opacity="0.2" />

          {/* Athletic Shoes */}
          <ellipse cx="125" cy="178" rx="14" ry="6" fill="#D4AF37" stroke="#0F172A" strokeWidth="1.5" />

          {/* Fixed Lower Leg & Soft Knees */}
          <path d="M 125 175 L 120 128" stroke="#FDBA74" strokeWidth="13" strokeLinecap="round" />

          {/* Hamstring Muscle Activation Heatmap Glow */}
          <motion.ellipse
            cx="112"
            cy="110"
            rx="18"
            ry="24"
            fill="url(#hamGlowRadar)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.45, 1],
                    opacity: [0.35, 0.95, 0.35],
                  }
                : {}
            }
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Hinging Upper Body: Hips Push Backwards, Torso Tilts Forward */}
          <motion.g
            animate={
              isPlaying
                ? {
                    rotate: [0, 48, 0],
                  }
                : {}
            }
            style={{ transformOrigin: '110px 100px' }}
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Muscular Hamstrings & Glutes */}
            <path d="M 120 128 L 108 100" stroke="#FDBA74" strokeWidth="14" strokeLinecap="round" />
            {/* Gym Shorts */}
            <path d="M 108 100 L 102 75 L 128 85 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.5" />

            {/* Straight Neutral Spine Torso */}
            <path d="M 102 75 L 102 38 L 122 42 L 120 80 Z" fill="#1E293B" stroke="#D4AF37" strokeWidth="1.5" />

            {/* Cartoon Athlete Head with Eyeline Forward */}
            <circle cx="106" cy="24" r="13" fill="#FDBA74" />
            <path d="M 96 18 Q 106 8 116 18 Q 112 26 106 24 Z" fill="#1E1B4B" />
            <path d="M 96 20 Q 106 18 116 20" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="102" cy="24" r="1.8" fill="#0F172A" />

            {/* Arms Hanging Straight Down Holding Olympic Bar */}
            <path d="M 112 48 L 132 88" stroke="#FDBA74" strokeWidth="9" strokeLinecap="round" />
            <circle cx="132" cy="88" r="5" fill="#D4AF37" />

            {/* Barbell Sliding Close to Shins */}
            <line x1="90" y1="88" x2="174" y2="88" stroke="#CBD5E1" strokeWidth="5.5" strokeLinecap="round" />
            <rect x="82" y="70" width="10" height="36" rx="3" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
            <rect x="172" y="70" width="10" height="36" rx="3" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
          </motion.g>

          {/* Visual Target Radar Callout Pin (علامة الفخذ الخلفي) */}
          <g transform="translate(112, 110)">
            <motion.circle
              r="8"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              animate={isPlaying ? { scale: [1, 2.3], opacity: [1, 0] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <circle r="4" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M 0 0 L -35 -30 L -90 -30" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <g transform="translate(-105, -41)">
              <rect width="90" height="20" rx="6" fill="#0F172A" stroke="#EF4444" strokeWidth="1.2" />
              <text x="45" y="13" fill="#FEE2E2" fontSize="9" fontWeight="900" textAnchor="middle">
                {isAr ? '🔥 فخذ خلفي: +95%' : '🔥 Hamstrings: 95%'}
              </text>
            </g>
          </g>
        </svg>
      );
    }

    case 'LAT_PULLDOWN':
    case 'BARBELL_ROW': {
      return (
        <svg viewBox="0 0 280 200" className="w-full h-full select-none overflow-visible">
          <defs>
            <radialGradient id="latGlowRadar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#0284C7" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Cable Pulldown Tower Frame */}
          <path d="M 60 180 L 60 22 L 220 22 L 220 180" stroke="#334155" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="140" cy="22" r="8" fill="#64748B" stroke="#0F172A" strokeWidth="2" />

          {/* Seated Bench Pad */}
          <rect x="100" y="130" width="80" height="12" rx="4" fill="#1E293B" stroke="#D4AF37" strokeWidth="1.5" />
          <line x1="140" y1="142" x2="140" y2="180" stroke="#475569" strokeWidth="8" strokeLinecap="round" />

          {/* Athlete Seated Back View - Iconic V-Taper Figure */}
          <path d="M 125 142 L 115 180" stroke="#0F172A" strokeWidth="12" strokeLinecap="round" />
          <path d="M 155 142 L 165 180" stroke="#0F172A" strokeWidth="12" strokeLinecap="round" />

          {/* Broad Shoulders & V-Taper Torso Back */}
          <path d="M 110 88 L 170 88 L 155 132 L 125 132 Z" fill="#1E293B" stroke="#D4AF37" strokeWidth="1.5" />

          {/* Latissimus Dorsi Wing Expansion Heatmap Glow (المجنص) */}
          <motion.ellipse
            cx="140"
            cy="104"
            rx="32"
            ry="18"
            fill="url(#latGlowRadar)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.45, 1],
                    opacity: [0.35, 0.95, 0.35],
                  }
                : {}
            }
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Back Muscular Striations (Rhomboids & Traps) */}
          <path d="M 125 96 Q 140 102 155 96" stroke="#38BDF8" strokeWidth="2" fill="none" />
          <path d="M 128 108 Q 140 114 152 108" stroke="#38BDF8" strokeWidth="2" fill="none" />

          {/* Athlete Head Back Profile with Headband */}
          <circle cx="140" cy="65" r="14" fill="#FDBA74" />
          <path d="M 126 62 Q 140 50 154 62 Q 146 72 134 72 Z" fill="#1E1B4B" />
          <path d="M 127 65 Q 140 60 153 65" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />

          {/* Dynamic Pulldown Bar & Gripping Arms */}
          <motion.g
            animate={
              isPlaying
                ? {
                    y: [0, 32, 0],
                  }
                : {}
            }
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Cable Line */}
            <line x1="140" y1="22" x2="140" y2="48" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3 3" />
            {/* Ergonomic Curved Wide Grip Lat Bar */}
            <path d="M 75 56 Q 140 44 205 56" stroke="#D4AF37" strokeWidth="6" fill="none" strokeLinecap="round" />
            <circle cx="75" cy="56" r="4" fill="#94A3B8" />
            <circle cx="205" cy="56" r="4" fill="#94A3B8" />

            {/* Muscular Arms Gripping Wide Handles */}
            <path d="M 114 88 L 92 60" stroke="#FDBA74" strokeWidth="10" strokeLinecap="round" />
            <path d="M 166 88 L 188 60" stroke="#FDBA74" strokeWidth="10" strokeLinecap="round" />
            <circle cx="92" cy="60" r="5" fill="#D4AF37" />
            <circle cx="188" cy="60" r="5" fill="#D4AF37" />
          </motion.g>

          {/* Visual Target Radar Callout Pin (علامة المجنص) */}
          <g transform="translate(140, 104)">
            <motion.circle
              r="8"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
              animate={isPlaying ? { scale: [1, 2.3], opacity: [1, 0] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <circle r="4" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M 0 0 L 35 -30 L 90 -30" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <g transform="translate(35, -41)">
              <rect width="84" height="20" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
              <text x="42" y="13" fill="#E0F2FE" fontSize="9" fontWeight="900" textAnchor="middle">
                {isAr ? '⚡ المجنص: +95% عرض' : '⚡ Lats: +95% Width'}
              </text>
            </g>
          </g>
        </svg>
      );
    }

    case 'LATERAL_RAISE': {
      return (
        <svg viewBox="0 0 280 200" className="w-full h-full select-none overflow-visible">
          <defs>
            <radialGradient id="deltGlowRadar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#D97706" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F59E0B" strokeWidth="0" />
            </radialGradient>
          </defs>

          {/* Floor */}
          <rect x="30" y="180" width="220" height="8" rx="4" fill="#334155" />
          <ellipse cx="140" cy="180" rx="70" ry="7" fill="#000000" opacity="0.2" />

          {/* Standing Legs & Athletic Shorts */}
          <line x1="128" y1="125" x2="124" y2="178" stroke="#FDBA74" strokeWidth="12" strokeLinecap="round" />
          <line x1="152" y1="125" x2="156" y2="178" stroke="#FDBA74" strokeWidth="12" strokeLinecap="round" />
          <path d="M 118 95 L 162 95 L 158 128 L 122 128 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.5" />

          {/* Athletic Torso with TitanFit Singlet */}
          <path d="M 122 62 L 158 62 L 160 95 L 120 95 Z" fill="#1E293B" stroke="#D4AF37" strokeWidth="1.5" />

          {/* Head & Gold Headband */}
          <circle cx="140" cy="46" r="14" fill="#FDBA74" />
          <path d="M 128 40 Q 140 28 152 40 Q 146 50 134 48 Z" fill="#1E1B4B" />
          <path d="M 128 42 Q 140 38 152 42" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
          <circle cx="136" cy="46" r="1.8" fill="#0F172A" />
          <circle cx="144" cy="46" r="1.8" fill="#0F172A" />

          {/* Dual Lateral Deltoids Heatmap Glow (الأكتاف الجانبية) */}
          <motion.circle
            cx="115"
            cy="65"
            r="16"
            fill="url(#deltGlowRadar)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.45, 1],
                    opacity: [0.35, 0.95, 0.35],
                  }
                : {}
            }
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="165"
            cy="65"
            r="16"
            fill="url(#deltGlowRadar)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.45, 1],
                    opacity: [0.35, 0.95, 0.35],
                  }
                : {}
            }
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Left Arm Raising Outward with Dumbbell */}
          <motion.g
            animate={
              isPlaying
                ? {
                    rotate: [0, -72, 0],
                  }
                : {}
            }
            style={{ transformOrigin: '120px 65px' }}
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M 120 65 L 95 115" stroke="#FDBA74" strokeWidth="10" strokeLinecap="round" />
            <circle cx="95" cy="115" r="4.5" fill="#D4AF37" />
            {/* Hex Dumbbell */}
            <rect x="86" y="108" width="18" height="14" rx="3" fill="#334155" stroke="#D4AF37" strokeWidth="1.2" />
          </motion.g>

          {/* Right Arm Raising Outward with Dumbbell */}
          <motion.g
            animate={
              isPlaying
                ? {
                    rotate: [0, 72, 0],
                  }
                : {}
            }
            style={{ transformOrigin: '160px 65px' }}
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M 160 65 L 185 115" stroke="#FDBA74" strokeWidth="10" strokeLinecap="round" />
            <circle cx="185" cy="115" r="4.5" fill="#D4AF37" />
            {/* Hex Dumbbell */}
            <rect x="176" y="108" width="18" height="14" rx="3" fill="#334155" stroke="#D4AF37" strokeWidth="1.2" />
          </motion.g>

          {/* Target Callout Radar Pin */}
          <g transform="translate(165, 65)">
            <motion.circle
              r="7"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              animate={isPlaying ? { scale: [1, 2.2], opacity: [1, 0] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <circle r="3.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M 0 0 L 25 -25 L 75 -25" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <g transform="translate(25, -36)">
              <rect width="80" height="20" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.2" />
              <text x="40" y="13" fill="#FEF3C7" fontSize="9" fontWeight="900" textAnchor="middle">
                {isAr ? '⚡ الكتف: +96% عرض' : '⚡ Delts: +96% Width'}
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
      return (
        <svg viewBox="0 0 280 200" className="w-full h-full select-none overflow-visible">
          <defs>
            <radialGradient id="armGlowRadar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isBiceps ? '#EF4444' : '#10B981'} stopOpacity="0.95" />
              <stop offset="70%" stopColor={isBiceps ? '#DC2626' : '#059669'} stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Floor */}
          <rect x="30" y="180" width="220" height="8" rx="4" fill="#334155" />
          <ellipse cx="140" cy="180" rx="70" ry="7" fill="#000000" opacity="0.2" />

          {/* Standing Legs Profile */}
          <line x1="125" y1="125" x2="120" y2="178" stroke="#FDBA74" strokeWidth="12" strokeLinecap="round" />
          <line x1="140" y1="125" x2="145" y2="178" stroke="#FDBA74" strokeWidth="12" strokeLinecap="round" />
          <path d="M 115 95 L 145 95 L 142 128 L 118 128 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.5" />

          {/* Athletic Torso Profile */}
          <path d="M 118 60 L 144 60 L 142 95 L 115 95 Z" fill="#1E293B" stroke="#D4AF37" strokeWidth="1.5" />

          {/* Head & Headband */}
          <circle cx="130" cy="45" r="14" fill="#FDBA74" />
          <path d="M 118 40 Q 130 28 142 40 Q 138 48 126 48 Z" fill="#1E1B4B" />
          <path d="M 118 42 Q 130 38 142 42" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
          <circle cx="135" cy="45" r="1.8" fill="#0F172A" />

          {/* Pinned Upper Arm */}
          <path d="M 136 65 L 144 95" stroke="#FDBA74" strokeWidth="12" strokeLinecap="round" />

          {/* Muscle Peak Heatmap Glow */}
          <motion.circle
            cx="140"
            cy="84"
            r="16"
            fill="url(#armGlowRadar)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.45, 1],
                    opacity: [0.35, 0.95, 0.35],
                  }
                : {}
            }
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Forearm Curling Up or Pushing Down */}
          <motion.g
            animate={
              isPlaying
                ? {
                    rotate: isBiceps ? [0, -85, 0] : [0, 68, 0],
                  }
                : {}
            }
            style={{ transformOrigin: '144px 95px' }}
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M 144 95 L 158 135" stroke="#FDBA74" strokeWidth="10" strokeLinecap="round" />
            <circle cx="158" cy="135" r="5" fill="#D4AF37" />

            {/* Gear: Cable Rope or Olympic Curl Barbell */}
            {isBiceps ? (
              <g transform="translate(158, 135)">
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
                <circle cx="-15" cy="0" r="8" fill="#F59E0B" />
                <circle cx="15" cy="0" r="8" fill="#F59E0B" />
              </g>
            ) : (
              <g transform="translate(158, 135)">
                <path d="M 0 0 L -8 18 M 0 0 L 8 18" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
                <circle cx="-8" cy="18" r="3.5" fill="#0F172A" />
                <circle cx="8" cy="18" r="3.5" fill="#0F172A" />
              </g>
            )}
          </motion.g>

          {/* Cable Top Wire for Pushdown */}
          {!isBiceps && (
            <line x1="155" y1="20" x2="155" y2="70" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3 3" />
          )}

          {/* Callout Radar Pin */}
          <g transform="translate(140, 84)">
            <motion.circle
              r="7"
              fill="none"
              stroke={isBiceps ? '#EF4444' : '#10B981'}
              strokeWidth="2"
              animate={isPlaying ? { scale: [1, 2.2], opacity: [1, 0] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <circle r="3.5" fill={isBiceps ? '#EF4444' : '#10B981'} stroke="#FFFFFF" strokeWidth="1.5" />
            <path
              d="M 0 0 L 30 -25 L 80 -25"
              stroke={isBiceps ? '#EF4444' : '#10B981'}
              strokeWidth="1.5"
              strokeDasharray="3 2"
              fill="none"
            />
            <g transform="translate(30, -36)">
              <rect width="84" height="20" rx="6" fill="#0F172A" stroke={isBiceps ? '#EF4444' : '#10B981'} strokeWidth="1.2" />
              <text x="42" y="13" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle">
                {isBiceps
                  ? isAr ? '🔥 بايسبس: +96% ضخامة' : '🔥 Biceps: +96% Peak'
                  : isAr ? '⚡ ترايسبس: +95% شد' : '⚡ Triceps: +95% Lock'}
              </text>
            </g>
          </g>
        </svg>
      );
    }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden rounded-xl">
      {/* 3D Studio Spotlight & Biomechanical Grid Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(212,175,55,0.22), transparent 65%), linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 18px 18px, 18px 18px',
        }}
      />

      {/* Top Biomechanical Joint ROM & 3D Vector Badge */}
      <div className="relative z-10 flex w-full items-center justify-between px-2.5 pt-1.5 text-[10px] font-black">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-amber-300 border border-amber-500/30 shadow-sm">
          <Sparkles className="h-2.5 w-2.5 text-amber-400" />
          {isAr ? 'محاكاة تشريحية 3D واقعية' : '3D Anatomical Biomechanics'}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-emerald-300 border border-emerald-500/30 font-mono">
          ∠ ROM 95° • {impact.primaryTarget.activationPct}% EMG
        </span>
      </div>

      {/* Main 3D-Shaded Exercise SVG Stage */}
      <div className="relative z-10 flex-1 w-full min-h-0 flex items-center justify-center">
        {renderExerciseSvg()}
      </div>

      {/* Bottom Live EMG Muscle Fiber Activation Bar */}
      <div className="relative z-10 w-full px-2.5 pb-1.5">
        <div className="flex items-center justify-between rounded-lg bg-slate-900/90 px-2.5 py-1 border border-slate-700/80 text-[10px] text-white backdrop-blur-sm">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className="h-2 w-2 rounded-full shrink-0 animate-pulse"
              style={{ backgroundColor: impact.primaryTarget.color }}
            />
            <span className="font-bold text-slate-200 truncate">
              {isAr ? impact.primaryTarget.nameAr : impact.primaryTarget.nameEn}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
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
            <span className="font-mono font-black text-amber-400">
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
            <span>{isAr ? 'حركة كرتونية تفاعلية' : 'Cartoon Motion'}</span>
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
              {/* Visual Cartoon Character Column */}
              <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900 md:col-span-5">
                {/* Visual SVG Cartoon Character Canvas */}
                <div className="my-1 h-44 w-full max-w-[260px] flex items-center justify-center">
                  <CartoonAthleteVisualCanvas
                    motionType={exercise.motionType}
                    isPlaying={isPlaying}
                    speedMultiplier={speed}
                    isAr={isAr}
                  />
                </div>

                {/* Biomechanical Cadence Tempo Indicator (3s Down -> 1s Hold -> 1s Up) */}
                <div className="mt-2 flex w-full flex-col gap-1.5 rounded-xl border border-slate-200 bg-white/80 p-2.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>{isAr ? 'إيقاع الحركة الذكي (Tempo)' : 'Cadence Tempo'}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {activePhase === 'ECCENTRIC'
                        ? isAr ? 'نزول هادئ' : 'Lowering'
                        : activePhase === 'HOLD'
                          ? isAr ? 'ثبات وانقباض' : 'Peak Hold'
                          : isAr ? 'دفع انفجاري' : 'Explosion'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px] font-extrabold">
                    <span
                      className={`rounded-lg py-1 transition ${
                        activePhase === 'ECCENTRIC'
                          ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {isAr ? '١. نزول 3ث' : '1. Eccentric 3s'}
                    </span>
                    <span
                      className={`rounded-lg py-1 transition ${
                        activePhase === 'HOLD'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {isAr ? '٢. ثبات 1ث' : '2. Hold 1s'}
                    </span>
                    <span
                      className={`rounded-lg py-1 transition ${
                        activePhase === 'CONCENTRIC'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {isAr ? '٣. صعود 1ث' : '3. Drive 1s'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Exercise Description, Target Badges & Execution Controls */}
              <div className="flex flex-col justify-between space-y-3 md:col-span-7">
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
