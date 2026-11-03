'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Copy,
  Dumbbell,
  ExternalLink,
  Flame,
  HeartPulse,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
  Utensils,
  Video,
  Volume2,
  Zap,
} from 'lucide-react';
import { usePlatformStore } from '../../lib/platform-store';
import { ExerciseMotionCard, type ExerciseMotionItem } from '../exercise-motion-card';

interface FreeVideoWorkout {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  levelAr: string;
  levelEn: string;
  durationMin: number;
  kcalBurn: number;
  coachAr: string;
  coachEn: string;
  thumbnailUrl: string;
  youtubeId: string;
  directVideoUrl: string;
  ptSafetyTipAr: string;
  ptSafetyTipEn: string;
  exercises: ExerciseMotionItem[];
}

interface FreeDietBlueprint {
  id: string;
  nameAr: string;
  nameEn: string;
  badgeAr: string;
  badgeEn: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  waterLiters: number;
  bestForAr: string;
  bestForEn: string;
  coverImageUrl: string;
  meals: Array<{
    timeAr: string;
    timeEn: string;
    titleAr: string;
    titleEn: string;
    kcal: number;
    proteinG: number;
    itemsAr: string[];
    itemsEn: string[];
    economicAltAr: string;
    economicAltEn: string;
  }>;
}

const FREE_VIDEO_WORKOUTS: FreeVideoWorkout[] = [
  {
    id: 'w-push-hypertrophy',
    titleAr: 'تمرين الضخامة العضلية للصدر والكتف والترايسبس (Push Day)',
    titleEn: 'Chest, Shoulders & Triceps Hypertrophy (Push Day)',
    categoryAr: 'تمارين الجيم • بناء عضل',
    categoryEn: 'Gym Workout • Hypertrophy',
    levelAr: 'متوسط / متقدم',
    levelEn: 'Intermediate / Pro',
    durationMin: 45,
    kcalBurn: 380,
    coachAr: 'كابتن عمر الشناوي + د. كريم (علاج طبيعي)',
    coachEn: 'Capt. Omar El-Shenawy + Dr. Karim (PT)',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    youtubeId: 'rT7DgCr-3pg',
    directVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    ptSafetyTipAr:
      'حافظ على ضم لوحي الكتف للخلف (Scapular Retraction) أثناء البنش بريس لحماية مفصل الكتف الأمامي من أي التهاب.',
    ptSafetyTipEn:
      'Keep your shoulder blades retracted and depressed during pressing movements to protect your rotator cuff.',
    exercises: [
      {
        id: 'push-ex-1',
        motionType: 'INCLINE_PRESS',
        nameAr: '١. تجميع دمبل على البنش العالي (Incline Dumbbell Press)',
        nameEn: '1. Incline Dumbbell Chest Press (30° Angle)',
        sets: 4,
        reps: '10 - 12 عدّة',
        restSec: 75,
        targetMuscleAr: 'الصدر العلوي والكتف الأمامي',
        targetMuscleEn: 'Upper Pectorals & Anterior Delts',
        secondaryMuscleAr: 'الترايسبس والكتف الجانبي',
        secondaryMuscleEn: 'Triceps & Medial Delts',
        cuesAr: 'انزل بالدمبل ببطء في ٣ ثوانٍ بزاوية ٤٥ درجة للكوع واطلع بقوة مع الحفاظ على تقوس أسفل الظهر الطبيعي.',
        cuesEn: 'Lower slowly for 3 seconds with a 45° elbow tuck and press explosively with natural arch.',
      },
      {
        id: 'push-ex-2',
        motionType: 'CABLE_FLY',
        nameAr: '٢. تفتيح بالكابل للصدر السفلي والوسط (Cable Chest Fly)',
        nameEn: '2. Seated Dual Cable Chest Fly',
        sets: 3,
        reps: '12 - 15 عدّة',
        restSec: 60,
        targetMuscleAr: 'منتصف الصدر والألياف الداخلية',
        targetMuscleEn: 'Mid-Chest & Sternal Fibers',
        secondaryMuscleAr: 'الكتف الأمامي',
        secondaryMuscleEn: 'Anterior Deltoid',
        cuesAr: 'اثبت ثانية كاملة في قمة الانقباض (Peak Contraction) أمام الصدر دون تلامس المقابض.',
        cuesEn: 'Hold for 1 full second at peak contraction in front of your sternum without banging handles.',
      },
      {
        id: 'push-ex-3',
        motionType: 'LATERAL_RAISE',
        nameAr: '٣. رفرفة جانبي بالدمبل للكتف (Dumbbell Lateral Raises)',
        nameEn: '3. Controlled Lateral Raises',
        sets: 4,
        reps: '15 عدّة',
        restSec: 60,
        targetMuscleAr: 'الكتف الجانبي (لإعطاء شكل الـ V-Taper)',
        targetMuscleEn: 'Medial Deltoid (V-Taper Width)',
        secondaryMuscleAr: 'الترابيس العليا',
        secondaryMuscleEn: 'Upper Trapezius',
        cuesAr: 'ارفع بكوعك وليس بمعصمك مع ميل بسيط للأمام لحماية مفصل الروتاتور كاف.',
        cuesEn: 'Lead with your elbows slightly in the scapular plane without swinging your torso.',
      },
      {
        id: 'push-ex-4',
        motionType: 'TRICEPS_PUSHDOWN',
        nameAr: '٤. دفع الحبل للترايسبس على الكابل (Rope Triceps Pushdown)',
        nameEn: '4. Cable Rope Triceps Pushdown',
        sets: 3,
        reps: '12 - 15 عدّة',
        restSec: 60,
        targetMuscleAr: 'عضلة الترايسبس الثلاثية بالكامل',
        targetMuscleEn: 'Lateral & Long Head Triceps',
        secondaryMuscleAr: 'الساعد ومعصم اليد',
        secondaryMuscleEn: 'Forearms & Wrist Stabilizers',
        cuesAr: 'ثبت كوعك بجانب جسمك تماماً وافتح الحبل في آخر الحركة لعزل الرأس الخارجي.',
        cuesEn: 'Lock elbows at your sides and flare the rope apart at lockout for peak pump.',
      },
    ],
  },
  {
    id: 'w-pull-back-biceps',
    titleAr: 'تمرين سحب الضهر والبايسبس الكامل (Pull Day)',
    titleEn: 'Back Width, Thickness & Biceps Peak (Pull Day)',
    categoryAr: 'تمارين الجيم • بناء عضل',
    categoryEn: 'Gym Workout • Pull Strength',
    levelAr: 'متوسط',
    levelEn: 'Intermediate',
    durationMin: 50,
    kcalBurn: 410,
    coachAr: 'كابتن محمود رضا + د. هبة (إصابات ملاعب)',
    coachEn: 'Capt. Mahmoud Reda + Dr. Heba (Sports PT)',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80',
    youtubeId: 'eGo4IYlbE5g',
    directVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    ptSafetyTipAr:
      'اسحب بكوعك باتجاه الحوض وافرد ضهرك تماماً لتجنب إجهاد الفقرات القطنية في حركات التجديف.',
    ptSafetyTipEn:
      'Drive with your elbows towards your hip pockets to bias the lats and protect your lower spine.',
    exercises: [
      {
        id: 'pull-ex-1',
        motionType: 'LAT_PULLDOWN',
        nameAr: '١. سحب عالي بالبار للضهر (Wide-Grip Lat Pulldown)',
        nameEn: '1. Wide-Grip Lat Pulldown',
        sets: 4,
        reps: '10 - 12 عدّة',
        restSec: 75,
        targetMuscleAr: 'المجنص وعضلة الظهر العريضة',
        targetMuscleEn: 'Latissimus Dorsi & Teres Major',
        secondaryMuscleAr: 'البايسبس وعضلات اللوح',
        secondaryMuscleEn: 'Biceps & Rhomboids',
        cuesAr: 'اسحب البار حتى أعلى صدرك مع إرجاع الكتفين للخلف والأسفل بدون انحناء الظهر.',
        cuesEn: 'Pull the bar to your clavicle with proud chest and full stretch at the top.',
      },
      {
        id: 'pull-ex-2',
        motionType: 'BARBELL_ROW',
        nameAr: '٢. تجديف بالبار الحر لسمك الضهر (Bent-Over Barbell Row)',
        nameEn: '2. Bent-Over Barbell Row (Pendlay Style)',
        sets: 4,
        reps: '8 - 10 عدّات',
        restSec: 90,
        targetMuscleAr: 'منتصف الظهر والترابيس الوسطى',
        targetMuscleEn: 'Rhomboids & Mid-Traps Thickness',
        secondaryMuscleAr: 'القطنية والمؤخرة',
        secondaryMuscleEn: 'Erector Spinae & Glutes',
        cuesAr: 'اثبت بزاوية ٤٥ درجة واسحب البار لأسفل البطن مع الحفاظ على عمود فقري محايد.',
        cuesEn: 'Hinge at hips to 45°, pull bar to navel keeping your core fully braced.',
      },
      {
        id: 'pull-ex-3',
        motionType: 'BICEPS_CURL',
        nameAr: '٣. كيرل واقف بالبار للبايسبس (Standing Barbell Curl)',
        nameEn: '3. Standing Barbell Biceps Curl',
        sets: 3,
        reps: '12 عدّة',
        restSec: 60,
        targetMuscleAr: 'البايسبس ورأسي الذراع',
        targetMuscleEn: 'Biceps Brachii & Brachialis',
        secondaryMuscleAr: 'الساعد ومعصم اليد',
        secondaryMuscleEn: 'Forearm Flexors',
        cuesAr: 'ثبت كوعك جانب وسطك بدون تأرجح الجسم واعتصر الباي في أعلى نقطة.',
        cuesEn: 'Keep elbows strictly pinned to ribs with zero torso swing.',
      },
    ],
  },
  {
    id: 'w-legs-lower',
    titleAr: 'تمرين الأرجل الخلفية والأمامية وقوة الجذع (Leg Day)',
    titleEn: 'Legs, Quads, Hamstrings & Core Power (Leg Day)',
    categoryAr: 'تمارين الجيم • قوة وتحمل',
    categoryEn: 'Gym Workout • Lower Body',
    levelAr: 'متقدم',
    levelEn: 'Advanced',
    durationMin: 55,
    kcalBurn: 490,
    coachAr: 'كابتن أحمد سامي (بطل كمال أجسام)',
    coachEn: 'Capt. Ahmed Samy (Powerlifter & Coach)',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=80',
    youtubeId: 'bEv6CCg2BC8',
    directVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    ptSafetyTipAr:
      'ثبت ركبتيك في مسار مشط القدم، واكتم نفسك داخل بطنك (Valsalva Maneuver) قبل النزول.',
    ptSafetyTipEn:
      'Track knees inline with toes, breathe deeply into your belly and brace your core prior to descent.',
    exercises: [
      {
        id: 'leg-ex-1',
        motionType: 'BARBELL_SQUAT',
        nameAr: '١. سكوات خلفي بالبار الأوليمبي (Barbell Back Squat)',
        nameEn: '1. Olympic Barbell Back Squat (Parallel Depth)',
        sets: 4,
        reps: '8 - 10 عدّات',
        restSec: 120,
        targetMuscleAr: 'عضلات الفخذ الأمامية (الكوادس)',
        targetMuscleEn: 'Quadriceps Femoris',
        secondaryMuscleAr: 'المؤخرة والقطنية وعضلات الجذع',
        secondaryMuscleEn: 'Gluteus Maximus & Spinal Erectors',
        cuesAr: 'انزل لعمق متوازي مع الأرض وادفع الأرض بكعبيك للأعلى مع ثبات الصدر مرفوعاً.',
        cuesEn: 'Descend to parallel, drive through your heels while maintaining an upright chest.',
      },
      {
        id: 'leg-ex-2',
        motionType: 'ROMANIAN_DEADLIFT',
        nameAr: '٢. ديدليفت روماني للهامسترنج (Romanian Deadlift RDL)',
        nameEn: '2. Barbell Romanian Deadlift (RDL)',
        sets: 4,
        reps: '10 - 12 عدّة',
        restSec: 90,
        targetMuscleAr: 'عضلات الفخذ الخلفية والمؤخرة',
        targetMuscleEn: 'Hamstrings & Glute-Ham Tie-in',
        secondaryMuscleAr: 'أسفل الظهر ومحيط الجذع',
        secondaryMuscleEn: 'Lower Back & Core Stabilizers',
        cuesAr: 'ارجع بمفصل الحوض للخلف كأنك تغلق باباً بمؤخرتك دون ثني الركبتين بعمق.',
        cuesEn: 'Push hips backward as if touching a wall behind you with slight knee bend.',
      },
    ],
  },
  {
    id: 'w-chest-strength',
    titleAr: 'تمرين زيادة القوة لبنش بريس الصدر (Power Chest)',
    titleEn: 'Flat Barbell Bench Press & Power Focus',
    categoryAr: 'تمارين القوة • أرقام قياسية',
    categoryEn: 'Strength & Powerlifting',
    levelAr: 'متوسط / متقدم',
    levelEn: 'Intermediate / Pro',
    durationMin: 40,
    kcalBurn: 350,
    coachAr: 'كابتن يوسف الصاوي (مدرب رفع أثقال)',
    coachEn: 'Capt. Youssef El-Sawy (Strength Coach)',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    youtubeId: '4Y2ZdHCOXok',
    directVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    ptSafetyTipAr:
      'لا ترفع مؤخرتك عن البنش أبداً أثناء الدفع للحفاظ على استقرار الحوض والعمود الفقري.',
    ptSafetyTipEn:
      'Keep glutes glued to the bench throughout the lift to ensure strict mechanical power transfer.',
    exercises: [
      {
        id: 'bench-ex-1',
        motionType: 'BENCH_PRESS',
        nameAr: '١. بنش بريس مستوي بالبار (Flat Barbell Bench Press)',
        nameEn: '1. Competition Flat Barbell Bench Press',
        sets: 5,
        reps: '5 - 6 عدّات (قوة)',
        restSec: 120,
        targetMuscleAr: 'عضلة الصدر بالكامل (Pectoralis Major)',
        targetMuscleEn: 'Pectoralis Major (Mid & Lower Head)',
        secondaryMuscleAr: 'الترايسبس والكتف الأمامي',
        secondaryMuscleEn: 'Triceps Brachii & Anterior Delts',
        cuesAr: 'المس منتصف الصدر بلطف واطلع بانفجارية مع تثبيت القدمين بالأرض تماماً.',
        cuesEn: 'Touch sternum with control, then explode upward driving legs firmly into the floor.',
      },
      {
        id: 'bench-ex-2',
        motionType: 'INCLINE_PRESS',
        nameAr: '٢. تجميع دمبل عالي ضخامة (Incline DB Press)',
        nameEn: '2. Incline Dumbbell Press (Upper Chest)',
        sets: 3,
        reps: '10 - 12 عدّة',
        restSec: 75,
        targetMuscleAr: 'الصدر العلوي',
        targetMuscleEn: 'Clavicular Head Pectorals',
        secondaryMuscleAr: 'الكتف الأمامي والترايسبس',
        secondaryMuscleEn: 'Anterior Delts & Triceps',
        cuesAr: 'تحكم كامل في مسار الدمبل مع تمدد كامل لألياف الصدر في أسفل النقطة.',
        cuesEn: 'Deep stretch at the bottom, maintain steady rhythm with full pectoral contraction.',
      },
      {
        id: 'bench-ex-3',
        motionType: 'TRICEPS_PUSHDOWN',
        nameAr: '٣. بوش داون ترايسبس حبل (Heavy Cable Pushdown)',
        nameEn: '3. Heavy Rope Triceps Pushdown',
        sets: 4,
        reps: '12 عدّة',
        restSec: 60,
        targetMuscleAr: 'عضلة الترايسبس الخارجية والوسطى',
        targetMuscleEn: 'Triceps Lateral & Medial Heads',
        secondaryMuscleAr: 'عضلات الساعد',
        secondaryMuscleEn: 'Forearms',
        cuesAr: 'افرد ذراعيك بالكامل مع الحفاظ على استقامة الجذع والرقبة.',
        cuesEn: 'Full extension at the bottom with locked torso.',
      },
    ],
  },
];

const FREE_DIET_BLUEPRINTS: FreeDietBlueprint[] = [
  {
    id: 'diet-1500-cut',
    nameAr: 'نظام ١٥٠٠ سعرة — تنشيف وحرق دهون سريع بدون حرمان',
    nameEn: '1,500 kcal Rapid Fat-Loss & Shred Blueprint',
    badgeAr: 'الأكثر طلباً للتخسيس',
    badgeEn: 'MOST POPULAR FOR FAT LOSS',
    targetKcal: 1500,
    proteinG: 135,
    carbsG: 130,
    fatsG: 45,
    waterLiters: 3.2,
    bestForAr: 'مثالي لخسارة 1 إلى 1.5 كجم دهون أسبوعياً مع شبع كامل طوال اليوم.',
    bestForEn: 'Ideal for dropping 1–1.5 kg of pure fat weekly while staying full.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    meals: [
      {
        timeAr: '٩:٠٠ صباحاً — وجبة الفطار المشبعة',
        timeEn: '09:00 AM — High-Satiety Breakfast',
        titleAr: 'أومليت البروتين والخضار بالجبن القريش والتوست الأسمر',
        titleEn: 'Cottage Cheese Veggie Omelette & Whole-Grain Toast',
        kcal: 380,
        proteinG: 32,
        itemsAr: [
          '٢ بيضة كاملة + ٢ بياض بيض مخفوق مع فلفل ألوان وبصل وبقدونس',
          '١٠٠ جرام جبنة قريش بزيت الزيتون والزعتر (ملعقة صغيرة زيت زيتون)',
          '٢ شريحة توست بني أو نصف رغيف بلدي ردة (٥٠ جرام)',
          'طبق خيار وخس وجرجير مفتوح',
        ],
        itemsEn: [
          '2 whole eggs + 2 egg whites scrambled with bell peppers & spinach',
          '100g cottage cheese drizzled with 1 tsp olive oil & oregano',
          '2 slices whole-grain toast or 50g baladi flatbread',
          'Unlimited cucumber, lettuce & arugula',
        ],
        economicAltAr: 'بديل اقتصادي: ٤ ملاعق فول مدمس بدون زيت + ٢ بيضة مسلوقة + نصف رغيف بلدي.',
        economicAltEn: 'Budget Swap: 4 tbsp fava beans (foul) + 2 boiled eggs + half baladi bread.',
      },
      {
        timeAr: '٢:٠٠ ظهراً — سناك قبل التمرين (طاقة وتركيز)',
        timeEn: '02:00 PM — Pre-Workout Energy Snack',
        titleAr: 'زبادي يوناني بالشوفان والتفاح والقرفة',
        titleEn: 'Greek Yogurt Bowl with Oats, Apple & Cinnamon',
        kcal: 240,
        proteinG: 18,
        itemsAr: [
          '١ علبة زبادي يوناني لايت (أو زبادي بلدي منزوع الدسم)',
          '٣٠ جرام شوفان مطحون + رشة قرفة لتنظيم سكر الدم',
          '١ ثمرة تفاح أخضر أو موزة متوسطة قبل التمرين بـ ٤٥ دقيقة',
          'فنجان قهوة سادة بدون سكر (لرفع الحرق والتركيز)',
        ],
        itemsEn: [
          '1 cup Greek yogurt (low-fat)',
          '30g rolled oats + cinnamon',
          '1 green apple or medium banana 45 mins pre-workout',
          'Black coffee / espresso (optional)',
        ],
        economicAltAr: 'بديل اقتصادي: كوب لبن رايب أو زبادي عادي + ثمرة موز + ١٠ حبات فول سوداني.',
        economicAltEn: 'Budget Swap: 1 cup plain yogurt + 1 banana + 10 roasted peanuts.',
      },
      {
        timeAr: '٥:٣٠ مساءً — وجبة الغداء الرئيسية (بعد التمرين)',
        timeEn: '05:30 PM — Post-Workout High-Protein Lunch',
        titleAr: 'صدور دجاج مشوية بالليمون والأعشاب مع الأرز البسمتي',
        titleEn: 'Lemon-Herb Grilled Chicken Breast & Basmati Rice',
        kcal: 560,
        proteinG: 55,
        itemsAr: [
          '٢٢٠ جرام صدور دجاج مشوية أو في الإيرفراير بتتبيلة الزبادي والليمون',
          '١٢٠ جرام أرز بسمتي أو مصري مسلوق بطريقة صحية (حوالي ٦ ملاعق كبيرة)',
          'طبق سلطة خضراء كبير + خضار سوتيه (كوسة، بروكلي، جزر)',
        ],
        itemsEn: [
          '220g grilled chicken breast (measured cooked)',
          '120g cooked basmati or Egyptian rice (approx. 6 tbsp)',
          'Large mixed green salad + steamed broccoli & zucchini',
        ],
        economicAltAr: 'بديل اقتصادي: ٢ سمكة بلطي مشوية كبيرة أو ٢٠٠ جرام كبدة دجاج مشوية + ٦ ملاعق أرز.',
        economicAltEn: 'Budget Swap: 2 large grilled tilapia fish or 200g chicken livers + 6 tbsp rice.',
      },
      {
        timeAr: '٩:٣٠ مساءً — وجبة العشاء الخفيفة',
        timeEn: '09:30 PM — Lean Recovery Dinner',
        titleAr: 'سلطة التونة أو الجبن القريش بالليمون والكمون',
        titleEn: 'Lean Tuna or Cottage Cheese Salad Bowl',
        kcal: 320,
        proteinG: 30,
        itemsAr: [
          'علبة تونة مصفاة تماماً من الزيت ومغسولة بالخل والليمون (أو ١٥٠ جرام جبنة قريش)',
          'طماطم، خيار، فلفل أخضر، بصل أحمر، وعصير ليمون',
          '١ شريحة توست أسمر أو ٢ توست سن مشبع',
        ],
        itemsEn: [
          '1 can water-packed tuna drained (or 150g cottage cheese)',
          'Diced tomatoes, cucumber, bell peppers & fresh lemon juice',
          '1 slice whole-grain toast',
        ],
        economicAltAr: 'بديل اقتصادي: ١٥٠ جرام جبنة قريش بالطماطم والخيار + بيضة مسلوقة.',
        economicAltEn: 'Budget Swap: 150g cottage cheese salad + 1 hard-boiled egg.',
      },
    ],
  },
];


export function FreeTrialWorkoutsAndDietsView({
  onSubscribeClick,
  onBackToHome,
}: {
  onSubscribeClick: () => void;
  onBackToHome: () => void;
}) {
  const { locale, showToast } = usePlatformStore();
  const isAr = locale === 'ar';

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(FREE_VIDEO_WORKOUTS[0]!.id);
  const [selectedDietId, setSelectedDietId] = useState<string>(FREE_DIET_BLUEPRINTS[0]!.id);
  const [completedExercises, setCompletedExercises] = useState<Record<string, number>>({});
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [showEconomicSwaps, setShowEconomicSwaps] = useState<boolean>(true);

  const activeWorkout =
    FREE_VIDEO_WORKOUTS.find((w) => w.id === selectedWorkoutId) ?? FREE_VIDEO_WORKOUTS[0]!;
  const activeDiet =
    FREE_DIET_BLUEPRINTS.find((d) => d.id === selectedDietId) ?? FREE_DIET_BLUEPRINTS[0]!;

  useEffect(() => {
    if (restSecondsLeft <= 0) return;
    const t = setInterval(() => {
      setRestSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [restSecondsLeft]);

  const totalCompletedSets = Object.values(completedExercises).reduce((a, b) => a + b, 0);
  const estimatedKcalBurnedLive = Math.round(totalCompletedSets * 24);

  const handleCompleteSet = (exerciseName: string, maxSets: number, restSec: number) => {
    const key = `${activeWorkout.id}-${exerciseName}`;
    const current = completedExercises[key] ?? 0;
    if (current < maxSets) {
      const next = current + 1;
      setCompletedExercises((prev) => ({ ...prev, [key]: next }));
      setRestSecondsLeft(restSec);
      showToast(
        isAr
          ? `💪 عاش يا بطل! أتممت المجموعة ${next}/${maxSets} — بدأ تايمر الراحة (${restSec} ثانية)`
          : `💪 Great set! Completed ${next}/${maxSets} — Rest timer started (${restSec}s)`,
      );
    } else {
      showToast(
        isAr
          ? '🎉 أنهيت كل مجموعات هذا التمرين بنجاح! انتقل للتمرين التالي.'
          : '🎉 All sets completed for this exercise! Move to the next one.',
      );
    }
  };

  const handleCopyDietPlan = () => {
    const text = activeDiet.meals
      .map((m) => `${isAr ? m.timeAr : m.timeEn}: ${isAr ? m.titleAr : m.titleEn}`)
      .join('\n');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(
      isAr
        ? `✅ تم نسخ "${activeDiet.nameAr}" بالكامل! يمكنك لصقه في واتساب أو ملاحظاتك.`
        : `✅ Copied "${activeDiet.nameEn}" to your clipboard!`,
    );
  };

  return (
    <div data-testid="panel-free-trial-hub" className="mx-auto max-w-7xl space-y-12 pb-20">
      {/* TOP BANNER — WELCOME TO THE FREE EXPERIENCE */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:p-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {isAr
                  ? '🎁 هدية مجانية لكل زائر — فيديوهات تدريبية وأنظمة غذائية كاملة'
                  : '🎁 100% FREE EXPERIENCE FOR VISITORS — NO CARD REQUIRED'}
              </span>
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-4xl">
              {isAr
                ? 'جرب بنفسك الآن: شاهد فيديوهات التمارين + استلم نظامك الغذائي المجاني!'
                : 'Try It Free Right Now: Interactive Video Workouts + Full Meal Plans!'}
            </h1>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
              {isAr
                ? 'عشان تتأكد من جودة المتابعة العلمية في منصتنا قبل ما تشترك، جهزنالك ٤ حصص تدريبية كاملة بالفيديو تحت إشراف أطباء علاج طبيعي + ٣ أنظمة غذائية محسوبة بالجرامات والبدائل الاقتصادية تقدر تبدأ بيها فوراً من النهاردة!'
                : 'Experience our scientific coaching quality firsthand: pick a video-guided workout below, log your sets with our live rest timer, and grab a complete macro-calculated meal plan.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onSubscribeClick}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white shadow-xs transition hover:bg-slate-850 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
            >
              <Zap className="h-4 w-4 text-amber-400 dark:text-slate-950" />
              <span>{isAr ? 'اشترك في المتابعة الشخصية الكاملة' : 'Upgrade to 1-on-1 Coaching'}</span>
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>{isAr ? '← العودة للصفحة الرئيسية' : '← Back to Main Storefront'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* SECTION 1: INTERACTIVE VIDEO WORKOUTS & LIVE TRAINER */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Video className="h-4 w-4" />
              {isAr ? 'القسم الأول: التمارين التفاعلية بالفيديو' : 'PART 1: INTERACTIVE VIDEO WORKOUTS'}
            </span>
            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              {isAr
                ? 'اختر تمرينك وشاهد الفيديو وتدرب خطوة بخطوة'
                : 'Pick Your Workout & Train Live Step-by-Step'}
            </h2>
          </div>

          {/* Live Workout Session Stats Bar */}
          <div className="theme-card flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-e border-slate-200 pe-3 dark:border-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'المجموعات المكتملة' : 'Completed Sets'}
                </p>
                <p className="font-mono text-sm font-black text-slate-900 dark:text-white">
                  {totalCompletedSets} Sets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-e border-slate-200 pe-3 dark:border-slate-800">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'السعرات المحروقة' : 'Live Burned Kcal'}
                </p>
                <p className="font-mono text-sm font-black text-orange-600 dark:text-orange-400">
                  {estimatedKcalBurnedLive} kcal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'تايمر الراحة' : 'Rest Timer'}
                </p>
                <p className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                  {restSecondsLeft > 0
                    ? `${restSecondsLeft} ${isAr ? 'ثانية متبقية' : 'sec left'}`
                    : isAr
                      ? 'جاهز للمجموعة!'
                      : 'Ready!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Video Workout Selector Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FREE_VIDEO_WORKOUTS.map((workout) => {
            const isSelected = workout.id === activeWorkout.id;
            return (
              <motion.button
                key={workout.id}
                type="button"
                whileHover={{ y: -3 }}
                onClick={() => setSelectedWorkoutId(workout.id)}
                className={`theme-card group flex flex-col overflow-hidden rounded-2xl border text-start transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-md'
                    : 'border-slate-200 hover:border-amber-400 shadow-sm dark:border-slate-800'
                }`}
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                  <img
                    src={workout.thumbnailUrl}
                    alt={isAr ? workout.titleAr : workout.titleEn}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <span className="absolute top-3 start-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-xs">
                    {isAr ? workout.categoryAr : workout.categoryEn}
                  </span>
                  <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-white">
                    <span className="flex items-center gap-1 text-xs font-extrabold">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      {workout.durationMin} {isAr ? 'دقيقة' : 'm'}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-extrabold text-amber-300">
                      <Flame className="h-3.5 w-3.5" />
                      {workout.kcalBurn} kcal
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {isAr ? workout.titleAr : workout.titleEn}
                    </h3>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {isAr ? workout.coachAr : workout.coachEn}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {isAr ? workout.levelAr : workout.levelEn}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400">
                      <Play className="h-3.5 w-3.5 fill-current" />
                      {isAr ? 'شاهد وتمرن' : 'Watch'}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Active Video Player + Interactive Exercise Checklist */}
        <div className="theme-card grid grid-cols-1 gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-12 sm:p-8">
          {/* Video Player Column */}
          <div className="space-y-4 lg:col-span-6">
            <div className="flex items-center justify-between pb-1">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {isAr ? 'مشغل الفيديو فائق الدقة (YouTube 1080p HD)' : 'Ultra HD Video Masterclass (1080p)'}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                {isAr ? 'بث مباشر فائق السرعة' : 'High-Speed Stream'}
              </span>
            </div>

            {/* Video Container (YouTube HD embed) */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg dark:border-slate-800">
              <div className="video-responsive-container">
                <iframe
                  key={activeWorkout.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${activeWorkout.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                  title={isAr ? activeWorkout.titleAr : activeWorkout.titleEn}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 text-xs text-white">
                <span className="font-bold text-slate-300">
                  {isAr ? activeWorkout.titleAr : activeWorkout.titleEn}
                </span>
                <span className="font-mono text-[11px] text-amber-400">
                  {activeWorkout.durationMin} MIN • {activeWorkout.kcalBurn} KCAL
                </span>
              </div>
            </div>

            {/* Physical Therapist Safety Note */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                {isAr
                  ? '💡 توجيه طبي من دكتور العلاج الطبيعي (لتجنب الإصابة):'
                  : '💡 Physical Therapist Form & Safety Note:'}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                {isAr ? activeWorkout.ptSafetyTipAr : activeWorkout.ptSafetyTipEn}
              </p>
            </div>
          </div>

          {/* Interactive Exercise Set Tracker Column */}
          <div className="space-y-4 lg:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAr ? 'تمارين الحصة التدريبية وتتبع المجموعات' : 'Session Exercises & Set Tracker'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'اضغط على "+ أتممت مجموعة" ليحسب لك النظام السعرات المحروقة ويشغل تايمر الراحة تلقائياً'
                    : 'Click "+ Complete Set" after each set to trigger rest countdown and track burn'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {activeWorkout.exercises.map((ex) => {
                const key = `${activeWorkout.id}-${ex.nameEn}`;
                const doneSets = completedExercises[key] ?? 0;

                return (
                  <ExerciseMotionCard
                    key={ex.id || ex.nameEn}
                    exercise={ex}
                    locale={isAr ? 'ar' : 'en'}
                    doneSets={doneSets}
                    onCompleteSet={() => handleCompleteSet(ex.nameEn, ex.sets, ex.restSec)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FREE READY-TO-USE DIET & MEAL PLANS */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Utensils className="h-4 w-4" />
              {isAr
                ? 'القسم الثاني: أنظمة غذائية مجانية محسوبة بالجرامات والبدائل'
                : 'PART 2: FREE COMPLETE NUTRITION & MEAL PLANS'}
            </span>
            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              {isAr
                ? 'اختر هدفك واستلم جدولك الغذائي اليومي الكامل مجاناً'
                : 'Select Your Goal & Get Your Complete Daily Meal Plan'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEconomicSwaps(!showEconomicSwaps)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-extrabold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {showEconomicSwaps
                ? isAr
                  ? 'إخفاء البدائل الاقتصادية المصرية'
                  : 'Hide Economic Food Swaps'
                : isAr
                  ? 'إظهار البدائل الاقتصادية المصرية'
                  : 'Show Economic Food Swaps'}
            </button>
            <button
              type="button"
              onClick={handleCopyDietPlan}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <Copy className="h-3.5 w-3.5" />
              {isAr ? 'نسخ النظام الغذائي بالكامل' : 'Copy Meal Plan'}
            </button>
          </div>
        </div>

        {/* 3 Diet Plan Selector Tabs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FREE_DIET_BLUEPRINTS.map((diet) => {
            const isSelected = diet.id === activeDiet.id;
            return (
              <button
                key={diet.id}
                type="button"
                onClick={() => setSelectedDietId(diet.id)}
                className={`theme-card flex items-center gap-4 rounded-2xl border p-4 text-start transition ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-md'
                    : 'border-slate-200 hover:border-emerald-400 shadow-sm dark:border-slate-800'
                }`}
              >
                <img
                  src={diet.coverImageUrl}
                  alt={isAr ? diet.nameAr : diet.nameEn}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
                <div className="space-y-1">
                  <span className="inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                    {isAr ? diet.badgeAr : diet.badgeEn}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {isAr ? diet.nameAr : diet.nameEn}
                  </h3>
                  <p className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    {diet.targetKcal} kcal • {diet.proteinG}g Protein
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Diet Plan Detailed Breakdown */}
        <div className="theme-card rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {isAr ? activeDiet.nameAr : activeDiet.nameEn}
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {isAr ? activeDiet.bestForAr : activeDiet.bestForEn}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center">
                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  {isAr ? 'إجمالي السعرات' : 'Total Calories'}
                </p>
                <p className="font-mono text-base font-black text-slate-900 dark:text-white">
                  {activeDiet.targetKcal} kcal
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-center">
                <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  {isAr ? 'البروتين اليومي' : 'Protein'}
                </p>
                <p className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                  {activeDiet.proteinG}g
                </p>
              </div>
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-center">
                <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300">
                  {isAr ? 'النشويات الذكية' : 'Smart Carbs'}
                </p>
                <p className="font-mono text-base font-black text-sky-600 dark:text-sky-400">
                  {activeDiet.carbsG}g
                </p>
              </div>
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-center">
                <p className="text-[10px] font-bold text-purple-800 dark:text-purple-300">
                  {isAr ? 'شرب المياه' : 'Daily Water'}
                </p>
                <p className="font-mono text-base font-black text-purple-600 dark:text-purple-400">
                  {activeDiet.waterLiters} L
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {activeDiet.meals.map((meal, index) => (
              <div
                key={meal.titleEn}
                className="theme-surface flex flex-col justify-between rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-extrabold text-amber-800 dark:text-amber-300">
                      {isAr ? meal.timeAr : meal.timeEn}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {meal.kcal} kcal • {meal.proteinG}g Protein
                    </span>
                  </div>

                  <h4 className="mt-3 text-base font-black text-slate-900 dark:text-white">
                    {index + 1}. {isAr ? meal.titleAr : meal.titleEn}
                  </h4>

                  <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {(isAr ? meal.itemsAr : meal.itemsEn).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {showEconomicSwaps && (
                  <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-bold text-amber-900 dark:text-amber-300">
                    🔄 {isAr ? meal.economicAltAr : meal.economicAltEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
