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
  Flame,
  HeartPulse,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Timer,
  Utensils,
  Video,
  Zap,
} from 'lucide-react';
import { usePlatformStore } from '../../lib/platform-store';

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
  videoPreviewUrl: string;
  ptSafetyTipAr: string;
  ptSafetyTipEn: string;
  exercises: Array<{
    nameAr: string;
    nameEn: string;
    sets: number;
    reps: string;
    restSec: number;
    targetMuscleAr: string;
    targetMuscleEn: string;
    cuesAr: string;
    cuesEn: string;
  }>;
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
    videoPreviewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-out-his-chest-in-the-gym-43567-large.mp4',
    ptSafetyTipAr:
      'حافظ على ضم لوحي الكتف للخلف (Scapular Retraction) أثناء البنش بريس لحماية مفصل الكتف الأمامي من أي التهاب.',
    ptSafetyTipEn:
      'Keep your shoulder blades retracted and depressed during pressing movements to protect your rotator cuff.',
    exercises: [
      {
        nameAr: '١. تجميع دمبل على البنش العالي (Incline Dumbbell Press)',
        nameEn: '1. Incline Dumbbell Chest Press (30° Angle)',
        sets: 4,
        reps: '10 - 12 عدّة',
        restSec: 75,
        targetMuscleAr: 'الصدر العلوي والكتف الأمامي',
        targetMuscleEn: 'Upper Pectorals & Anterior Delts',
        cuesAr: 'انزل بالدمبل ببطء في ٣ ثوانٍ بزاوية ٤٥ درجة للكوع واطلع بقوة.',
        cuesEn: 'Lower slowly for 3 seconds with a 45° elbow tuck and press explosively.',
      },
      {
        nameAr: '٢. تفتيح بالكابل للصدر السفلي والوسط (Cable Chest Fly)',
        nameEn: '2. Seated Dual Cable Chest Fly',
        sets: 3,
        reps: '12 - 15 عدّة',
        restSec: 60,
        targetMuscleAr: 'منتصف الصدر والألياف الداخلية',
        targetMuscleEn: 'Mid-Chest & Inner Striations',
        cuesAr: 'اثبت ثانية كاملة في قمة الانقباض (Peak Contraction) أمام الصدر.',
        cuesEn: 'Hold for 1 full second at peak contraction in front of your sternum.',
      },
      {
        nameAr: '٣. رفرفة جانبي بالدمبل للكتف (Dumbbell Lateral Raises)',
        nameEn: '3. Controlled Lateral Raises',
        sets: 4,
        reps: '15 عدّة',
        restSec: 60,
        targetMuscleAr: 'الكتف الجانبي (لإعطاء شكل الـ V-Taper)',
        targetMuscleEn: 'Medial Deltoid (V-Taper Width)',
        cuesAr: 'ارفع بكوعك وليس بمعصمك مع ميل بسيط للأمام.',
        cuesEn: 'Lead with your elbows slightly in the scapular plane.',
      },
      {
        nameAr: '٤. دفع الحبل للترايسبس على الكابل (Rope Triceps Pushdown)',
        nameEn: '4. Cable Rope Triceps Pushdown',
        sets: 3,
        reps: '12 - 15 عدّة',
        restSec: 60,
        targetMuscleAr: 'عضلة الترايسبس الثلاثية بالكامل',
        targetMuscleEn: 'Lateral & Long Head Triceps',
        cuesAr: 'ثبت كوعك بجانب جسمك تماماً وافتح الحبل في آخر الحركة.',
        cuesEn: 'Lock elbows at your sides and flare the rope apart at the bottom.',
      },
    ],
  },
  {
    id: 'w-home-hiit-burn',
    titleAr: 'تمرين حرق الدهون في البيت بدون أي أدوات (20 دقيقة HIIT)',
    titleEn: '20-Min Zero-Equipment Home Fat Burner HIIT',
    categoryAr: 'تمرين منزلي • حرق دهون سريع',
    categoryEn: 'Home Workout • Rapid Fat Loss',
    levelAr: 'مناسب للمبتدئين والجميع',
    levelEn: 'All Levels / Beginner Friendly',
    durationMin: 20,
    kcalBurn: 290,
    coachAr: 'كابتن مريم القاضي',
    coachEn: 'Coach Mariam El-Kady',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    videoPreviewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-in-a-gym-43554-large.mp4',
    ptSafetyTipAr:
      'انزل على مشط القدم بهدوء أثناء القفز أو استبدل القفز بخطوات سريعة لو عندك خشونة في الركبة.',
    ptSafetyTipEn:
      'Land softly on the balls of your feet, or switch to low-impact stepping if you have knee sensitivity.',
    exercises: [
      {
        nameAr: '١. سكوات بوزن الجسم مع نبضة سفلية (Pulse Bodyweight Squats)',
        nameEn: '1. Pulse Bodyweight Squats',
        sets: 4,
        reps: '40 ثانية عمل',
        restSec: 20,
        targetMuscleAr: 'الأفخاذ الأمامية والأرداف وحرق السعرات',
        targetMuscleEn: 'Quads, Glutes & Metabolic Burn',
        cuesAr: 'ظهرك مفرود تماماً والوزن موزع على كعب القدم.',
        cuesEn: 'Keep chest proud and drive through your heels.',
      },
      {
        nameAr: '٢. ضغط معدل أو كامل (Push-Ups / Knee Push-Ups)',
        nameEn: '2. Standard or Knee Push-Ups',
        sets: 4,
        reps: '12 - 15 عدّة',
        restSec: 30,
        targetMuscleAr: 'الصدر والذراعين وشد الجذع',
        targetMuscleEn: 'Chest, Arms & Core Stability',
        cuesAr: 'شد عضلات البطن كأنها لوح مستقيم أثناء النزول والصعود.',
        cuesEn: 'Brace your abs tight so your hips never sag.',
      },
      {
        nameAr: '٣. متسلق الجبال السريع (Mountain Climbers)',
        nameEn: '3. Controlled Mountain Climbers',
        sets: 4,
        reps: '35 ثانية عمل',
        restSec: 25,
        targetMuscleAr: 'عضلات البطن السفلية ورفع معدل الحرق',
        targetMuscleEn: 'Lower Abs & Cardio Conditioning',
        cuesAr: 'كتفك فوق كف إيدك مباشرة واسحب ركبتك باتجاه الصدر.',
        cuesEn: 'Keep shoulders stacked directly over wrists and drive knees fast.',
      },
      {
        nameAr: '٤. تمرين البلانك الثابت (Core Plank Hold)',
        nameEn: '4. Isometric Forearm Plank',
        sets: 3,
        reps: '45 ثانية ثبات',
        restSec: 30,
        targetMuscleAr: 'الحزام البطني بالكامل وأسفل الظهر',
        targetMuscleEn: 'Deep Transverse Abdominis & Core',
        cuesAr: 'تنفس بانتظام ولا تحبس نفسك أثناء الثبات.',
        cuesEn: 'Breathe steadily through your nose while squeezing glutes and abs.',
      },
    ],
  },
  {
    id: 'w-back-posture',
    titleAr: 'تمرين الظهر وعلاج انحناء الأكتاف وآلام الرقبة (إشراف طبي)',
    titleEn: 'Back Width & Posture Correction Protocol (PT Supervised)',
    categoryAr: 'علاج طبيعي وتقوية الظهر',
    categoryEn: 'Posture & Back Strength',
    levelAr: 'جميع المستويات (ممتاز لموظفي المكاتب)',
    levelEn: 'All Levels (Desk Workers)',
    durationMin: 40,
    kcalBurn: 320,
    coachAr: 'د. طارق منصور (استشاري العلاج الطبيعي)',
    coachEn: 'Dr. Tarek Mansour (Physical Therapist)',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=80',
    videoPreviewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-training-his-back-in-the-gym-43569-large.mp4',
    ptSafetyTipAr:
      'ابدأ كل سحبة بتحريك لوح الكتف أولاً قبل ثني الكوع؛ ده السر لعلاج التحدب وتكبير مجنص الظهر بدون شد في الرقبة.',
    ptSafetyTipEn:
      'Initiate every pull by depressing your scapula before bending your elbows to eliminate neck tension.',
    exercises: [
      {
        nameAr: '١. سحب عالي واسع للصدر (Wide-Grip Lat Pulldown)',
        nameEn: '1. Wide-Grip Front Lat Pulldown',
        sets: 4,
        reps: '12 عدّة',
        restSec: 60,
        targetMuscleAr: 'عضلات المجنص (Lats) لعرض الظهر',
        targetMuscleEn: 'Latissimus Dorsi Width',
        cuesAr: 'اسحب البار لأعلى الصدر مع فتح الصدر للأمام.',
        cuesEn: 'Pull the bar to your upper chest while keeping your sternum lifted.',
      },
      {
        nameAr: '٢. سحب أرضي ضيق (Seated Cable Row)',
        nameEn: '2. Seated Neutral-Grip Cable Row',
        sets: 4,
        reps: '12 عدّة',
        restSec: 60,
        targetMuscleAr: 'منتصف الظهر وعضلات المعينات (Rhomboids)',
        targetMuscleEn: 'Mid-Back Thickness & Rhomboids',
        cuesAr: 'اعصر لوحي الكتف في الخلف لمدة ثانيتين في كل عدّة.',
        cuesEn: 'Squeeze your shoulder blades together for 2 seconds on every rep.',
      },
      {
        nameAr: '٣. سحب الحبل للوجه والكتف الخلفي (Face Pulls)',
        nameEn: '3. External Rotation Rope Face Pulls',
        sets: 4,
        reps: '15 عدّة',
        restSec: 45,
        targetMuscleAr: 'الكتف الخلفي وتصحيح استقامة الظهر والرقبة',
        targetMuscleEn: 'Rear Delts & Rotator Cuff Posture',
        cuesAr: 'اسحب الحبل باتجاه الجبهة مع لف الذراع للخارج.',
        cuesEn: 'Pull towards your forehead and externally rotate your thumbs back.',
      },
    ],
  },
  {
    id: 'w-legs-glutes',
    titleAr: 'تمرين الأرجل ونحت الجزء السفلي والبطن (Lower Body Sculpt)',
    titleEn: 'Lower Body, Glutes & Core Sculpt Workout',
    categoryAr: 'تقوية الأرجل ونحت البطن',
    categoryEn: 'Legs, Glutes & Core',
    levelAr: 'متوسط',
    levelEn: 'Intermediate',
    durationMin: 45,
    kcalBurn: 430,
    coachAr: 'كابتن سارة المنياوي',
    coachEn: 'Coach Sara El-Miniawy',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=80',
    videoPreviewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-lunges-with-dumbbells-43558-large.mp4',
    ptSafetyTipAr:
      'تأكد إن اتجاه الركبة ماشي في نفس اتجاه مشط القدم أثناء السكوات والطعن (Lunges) لحماية الغضروف الهلالي.',
    ptSafetyTipEn:
      'Ensure your knees track directly in line with your second toe during squats and lunges.',
    exercises: [
      {
        nameAr: '١. جوبلت سكوات بالدمبل (Dumbbell Goblet Squat)',
        nameEn: '1. Deep Dumbbell Goblet Squat',
        sets: 4,
        reps: '12 عدّة',
        restSec: 75,
        targetMuscleAr: 'الأفخاذ الأمامية والأرداف',
        targetMuscleEn: 'Quadriceps & Gluteus Maximus',
        cuesAr: 'امسك الدمبل أمام صدرك وانزل بعمق مريح مع ثبات الكعبين.',
        cuesEn: 'Hold the dumbbell close to your chest and sit deep between your hips.',
      },
      {
        nameAr: '٢. ديدليفت روماني بالدمبل للخلفيات (Romanian Deadlift)',
        nameEn: '2. Dumbbell Romanian Deadlift (RDL)',
        sets: 4,
        reps: '10 - 12 عدّة',
        restSec: 75,
        targetMuscleAr: 'العضلة الخلفية للفخذ (Hamstrings) والأرداف',
        targetMuscleEn: 'Hamstrings & Glutes',
        cuesAr: 'ارجع بالحوض للخلف مع ثنية بسيطة في الركبة وظهر مستقيم تماماً.',
        cuesEn: 'Hinge hips straight back while sliding dumbbells along your shins.',
      },
      {
        nameAr: '٣. طعن ثابت بالدمبل (Bulgarian / Static Lunges)',
        nameEn: '3. Dumbbell Split Squats / Lunges',
        sets: 3,
        reps: '10 عدّات لكل رجل',
        restSec: 60,
        targetMuscleAr: 'تناسق الرجلين وشد الأرداف',
        targetMuscleEn: 'Unilateral Leg Balance & Glutes',
        cuesAr: 'ميل بسيط بالجذع للأمام لزيادة التركيز على الأرداف.',
        cuesEn: 'Lean your torso slightly forward to maximize glute recruitment.',
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
  {
    id: 'diet-2000-recomp',
    nameAr: 'نظام ١٩٥٠ سعرة — إعادة تشكيل الجسم (Body Recomp)',
    nameEn: '1,950 kcal Body Recomposition (Lose Fat + Build Muscle)',
    badgeAr: 'خسارة دهون + بناء عضل معاً',
    badgeEn: 'BODY RECOMPOSITION',
    targetKcal: 1950,
    proteinG: 165,
    carbsG: 195,
    fatsG: 56,
    waterLiters: 3.6,
    bestForAr: 'مصمم لمن يتمرن مقاومة ٣-٥ أيام أسبوعياً ويريد شد الجسم وبناء عضل مع حرق الدهون.',
    bestForEn: 'Designed for lifters training 3–5x/week to build lean muscle while dropping fat.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    meals: [
      {
        timeAr: '٨:٣٠ صباحاً — وجبة الفطار المتكاملة',
        timeEn: '08:30 AM — Muscle-Building Breakfast',
        titleAr: 'بان كيك الشوفان بالبيض والجبن القريش والعسل',
        titleEn: 'High-Protein Oat Pancakes & Cottage Cheese',
        kcal: 510,
        proteinG: 38,
        itemsAr: [
          '٦٠ جرام شوفان + ٣ بيضات كاملة + رشة فانيليا وقرفة في طاسة غير لاصقة',
          '١٠٠ جرام جبنة قريش أو جبنة ملح خفيف بجانب الوجبة',
          'ملعقة صغيرة عسل نحل طبيعي + نصف ثمرة موز',
        ],
        itemsEn: [
          '60g oats blended with 3 whole eggs & cinnamon',
          '100g cottage cheese on the side',
          '1 tsp raw honey + half sliced banana',
        ],
        economicAltAr: 'بديل اقتصادي: ٣ بيضات أومليت + رغيف بلدي كامل + قطعة جبنة قريش.',
        economicAltEn: 'Budget Swap: 3-egg omelette + 1 whole baladi flatbread + cottage cheese.',
      },
      {
        timeAr: '١:٣٠ ظهراً — وجبة قبل التمرين (Pre-Workout Fuel)',
        timeEn: '01:30 PM — Pre-Workout Carb & Protein Load',
        titleAr: 'بطاطا حلوة مشوية بالقرفة مع صدور الديك الرومي أو البيض',
        titleEn: 'Baked Sweet Potato with Smoked Turkey / Egg Whites',
        kcal: 410,
        proteinG: 32,
        itemsAr: [
          '٢٠٠ جرام بطاطا حلوة مشوية (كارب معقد يمدك بطاقة جبارة طوال التمرين)',
          '١٠٠ جرام صدور رومي مدخن أو ٤ بياض بيض مسلوق',
          'حفنة لوز نيء (١٥ جرام — حوالي ١٢ حبة)',
        ],
        itemsEn: [
          '200g baked sweet potato with cinnamon',
          '100g smoked turkey breast or 4 egg whites',
          '15g raw almonds (approx. 12 almonds)',
        ],
        economicAltAr: 'بديل اقتصادي: ٢٠٠ جرام بطاطس مسلوقة أو بطاطا + ٢ بيضة مسلوقة + ١٠ حبات سوداني.',
        economicAltEn: 'Budget Swap: 200g boiled potato/sweet potato + 2 boiled eggs.',
      },
      {
        timeAr: '٥:٠٠ مساءً — وجبة بعد التمرين (الغداء)',
        timeEn: '05:00 PM — Anabolic Post-Workout Lunch',
        titleAr: 'ستيك لحم بقري صافي أو صدور دجاج مع الأرز والسلطة',
        titleEn: 'Lean Sirloin Steak or Chicken Breast with Rice',
        kcal: 640,
        proteinG: 60,
        itemsAr: [
          '٢٢٠ جرام لحم بقري أحمر مشوي (أو ٢٥٠ جرام صدور دجاج)',
          '١٨٠ جرام أرز أبيض أو بسمتي مطهو (حوالي ٩ ملاعق كبيرة)',
          'طبق سلطة خضراء كبير بملعقة زيت زيتون بكر',
        ],
        itemsEn: [
          '220g lean grilled beef steak or 250g chicken breast',
          '180g cooked rice (approx. 9 tbsp)',
          'Mixed salad with 1 tbsp extra-virgin olive oil',
        ],
        economicAltAr: 'بديل اقتصادي: ٢٥٠ جرام صدور دجاج أو سمك مشوي + ٩ ملاعق أرز أو مكرونة.',
        economicAltEn: 'Budget Swap: 250g chicken breast or grilled fish + 9 tbsp rice/pasta.',
      },
      {
        timeAr: '٩:٣٠ مساءً — وجبة العشاء بطيئة الامتصاص',
        timeEn: '09:30 PM — Overnight Recovery Dinner',
        titleAr: 'جبنة قريش بالزبادي اليوناني والخضروات الورقية',
        titleEn: 'Casein-Rich Cottage Cheese & Greek Yogurt Bowl',
        kcal: 390,
        proteinG: 35,
        itemsAr: [
          '١٥٠ جرام جبنة قريش (غنية ببروتين الكازين الذي يغذي العضلات أثناء النوم)',
          '١ علبة زبادي يوناني سادة + ملعقة بذور شيا أو زيت زيتون',
          'نصف رغيف بلدي + خيار وطماطم',
        ],
        itemsEn: [
          '150g cottage cheese (slow-digesting casein protein)',
          '1 cup Greek yogurt + 1 tsp chia seeds',
          'Half baladi flatbread + cucumber & tomatoes',
        ],
        economicAltAr: 'بديل اقتصادي: ٢٠٠ جرام جبنة قريش بزيت الزيتون + نصف رغيف بلدي.',
        economicAltEn: 'Budget Swap: 200g cottage cheese with olive oil + half baladi bread.',
      },
    ],
  },
  {
    id: 'diet-2600-bulk',
    nameAr: 'نظام ٢٦٠٠ سعرة — ضخامة عضلية صافية (Clean Bulk)',
    nameEn: '2,600 kcal Lean Mass & Clean Bulk Blueprint',
    badgeAr: 'للنحافة وزيادة الكتلة العضلية',
    badgeEn: 'LEAN MUSCLE BULK',
    targetKcal: 2600,
    proteinG: 190,
    carbsG: 310,
    fatsG: 68,
    waterLiters: 4.0,
    bestForAr: 'لزيادة الوزن والكتلة العضلية الصافية بدون تخزين دهون في منطقة البطن.',
    bestForEn: 'For hardgainers looking to pack on lean muscle mass without belly fat.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    meals: [
      {
        timeAr: '٨:٠٠ صباحاً — فطار الضخامة',
        timeEn: '08:00 AM — High-Calorie Clean Breakfast',
        titleAr: 'شوفان بالحليب وزبدة الفول السوداني + ٣ بيضات كاملة',
        titleEn: 'Peanut Butter Banana Oats + 3 Whole Eggs',
        kcal: 740,
        proteinG: 44,
        itemsAr: [
          '٨٠ جرام شوفان مطهو في كوب حليب كامل الدسم + ثمرة موز + ملعقة كبيرة زبدة فول سوداني',
          '٣ بيضات كاملة مسلوقة أو أومليت بجانب الشوفان',
        ],
        itemsEn: [
          '80g oats cooked in 1 cup whole milk + 1 banana + 1 tbsp peanut butter',
          '3 whole eggs on the side',
        ],
        economicAltAr: 'بديل اقتصادي: بليلة باللبن والعسل والسوداني + ٣ بيضات مسلوقة.',
        economicAltEn: 'Budget Swap: Whole wheat belila with milk, honey & peanuts + 3 eggs.',
      },
      {
        timeAr: '١:٠٠ ظهراً — وجبة وسط اليوم',
        timeEn: '01:00 PM — Mid-Day Muscle Meal',
        titleAr: 'مكرونة بالدجاج المفروم أو شاورما الدجاج المنزلية',
        titleEn: 'Whole-Wheat Pasta with Chicken Breast Strips',
        kcal: 680,
        proteinG: 52,
        itemsAr: [
          '١٨٠ جرام صدور دجاج مقطعة شاورما بالفلفل والبصل',
          '٢٠٠ جرام مكرونة مسلوقة بصلصة طماطم طبيعية',
          'طبق سلطة خضراء',
        ],
        itemsEn: [
          '180g chicken breast shawarma strips',
          '200g cooked pasta with homemade tomato sauce',
          'Green salad bowl',
        ],
        economicAltAr: 'بديل اقتصادي: كشري بيتي محسوب (عدس بجبّة + أرز + حمص) + ١٥٠ جرام صدور دجاج.',
        economicAltEn: 'Budget Swap: Homemade high-protein lentil & rice bowl + 150g chicken.',
      },
      {
        timeAr: '٥:٣٠ مساءً — وجبة بعد التمرين',
        timeEn: '05:30 PM — Post-Workout Recovery Feast',
        titleAr: 'أرز بسمتي مع صدور الدجاج والبطاطس المشوية',
        titleEn: 'Chicken Breast, Basmati Rice & Roasted Potatoes',
        kcal: 720,
        proteinG: 58,
        itemsAr: [
          '٢٢٠ جرام صدور أو أوراك دجاج مخبوزة في الفرن',
          '٢٠٠ جرام أرز + ١٠٠ جرام بطاطس مشوية',
          'خضار سوتيه بملعقة زيت زيتون',
        ],
        itemsEn: [
          '220g roasted chicken breast or thighs',
          '200g cooked rice + 100g roasted potato wedges',
          'Sautéed vegetables with 1 tbsp olive oil',
        ],
        economicAltAr: 'بديل اقتصادي: ربع فرخة مشوية + طبق أرز متوسط + بطاطس فرن.',
        economicAltEn: 'Budget Swap: Quarter roasted chicken + medium rice plate + baked potato.',
      },
      {
        timeAr: '١٠:٠٠ مساءً — سموذي وعشاء ما قبل النوم',
        timeEn: '10:00 PM — Pre-Bed Mass Shake & Cottage Cheese',
        titleAr: 'جبنة قريش بالمكسرات + كوب حليب بالتمر',
        titleEn: 'Cottage Cheese, Nuts & Milk Date Shake',
        kcal: 460,
        proteinG: 36,
        itemsAr: [
          '١٥٠ جرام جبنة قريش + رغيف بلدي أسمر',
          'كوب حليب دافئ + ٣ تمرات + ملعقة فول سوداني',
        ],
        itemsEn: [
          '150g cottage cheese + 1 whole-grain flatbread',
          '1 cup warm milk + 3 dates + 1 tbsp peanuts',
        ],
        economicAltAr: 'بديل اقتصادي: ١٥٠ جرام جبنة قريش + كوب لبن بالتمر.',
        economicAltEn: 'Budget Swap: 150g cottage cheese + milk with 3 dates.',
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
    <div data-testid="panel-free-trial-hub" className="mx-auto max-w-7xl space-y-14 pb-20">
      {/* TOP BANNER — WELCOME TO THE FREE EXPERIENCE */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-l from-emerald-50 via-white to-amber-50 p-8 shadow-sm sm:p-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100/80 px-4 py-1 text-xs font-extrabold text-emerald-800">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              {isAr
                ? '🎁 هدية مجانية لكل زائر — بدون تسجيل بطاقة بنكية'
                : '🎁 100% FREE EXPERIENCE FOR VISITORS — NO CARD REQUIRED'}
            </span>
            <h1 className="text-2xl font-black text-slate-900 sm:text-4xl">
              {isAr
                ? 'جرب بنفسك دلوقتي: اتمرن معانا بالفيديو + استلم نظامك الغذائي المجاني!'
                : 'Try It Free Right Now: Interactive Video Workouts + Full Meal Plans!'}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              {isAr
                ? 'عشان تتأكد من جودة المتابعة العلمية في منصتنا قبل ما تشترك، جهزنالك ٤ حصص تدريبية كاملة بالفيديو تحت إشراف أطباء علاج طبيعي + ٣ أنظمة غذائية محسوبة بالجرامات والبدائل الاقتصادية تقدر تبدأ بيها فوراً من النهاردة!'
                : 'Experience our scientific coaching quality firsthand: pick a video-guided workout below, log your sets with our live rest timer, and grab a complete macro-calculated meal plan.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onSubscribeClick}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-[#D4AF37] px-6 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:scale-[1.02]"
            >
              <Zap className="h-4 w-4" />
              {isAr ? 'اشترك في المتابعة الشخصية الكاملة' : 'Upgrade to 1-on-1 Coaching'}
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
            >
              {isAr ? '← العودة للصفحة الرئيسية' : '← Back to Main Storefront'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* SECTION 1: INTERACTIVE VIDEO WORKOUTS & LIVE TRAINER */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-700">
              <Video className="h-4 w-4" />
              {isAr ? 'القسم الأول: التمارين التفاعلية بالفيديو' : 'PART 1: INTERACTIVE VIDEO WORKOUTS'}
            </span>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              {isAr
                ? 'اختر تمرينك وابدأ التمرين التفاعلي الآن خطوة بخطوة'
                : 'Pick Your Workout & Train Live Step-by-Step'}
            </h2>
          </div>

          {/* Live Workout Session Stats Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-2 border-e border-slate-200 pe-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-[10px] font-bold text-slate-500">
                  {isAr ? 'المجموعات المكتملة' : 'Completed Sets'}
                </p>
                <p className="font-mono text-sm font-black text-slate-900">{totalCompletedSets} Sets</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-e border-slate-200 pe-3">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-500">
                  {isAr ? 'السعرات المحروقة الآن' : 'Live Burned Kcal'}
                </p>
                <p className="font-mono text-sm font-black text-orange-600">
                  {estimatedKcalBurnedLive} kcal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-[10px] font-bold text-slate-500">
                  {isAr ? 'تايمر الراحة بين المجموعات' : 'Rest Timer'}
                </p>
                <p className="font-mono text-sm font-black text-amber-700">
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
                whileHover={{ y: -4 }}
                onClick={() => setSelectedWorkoutId(workout.id)}
                className={`group flex flex-col overflow-hidden rounded-2xl border text-start transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-amber-300 shadow-sm'
                }`}
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={workout.thumbnailUrl}
                    alt={isAr ? workout.titleAr : workout.titleEn}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-3 start-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-slate-900 shadow">
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
                    <h3 className="text-sm font-black text-slate-900">
                      {isAr ? workout.titleAr : workout.titleEn}
                    </h3>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      {isAr ? workout.coachAr : workout.coachEn}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-[11px] font-bold text-emerald-700">
                      {isAr ? workout.levelAr : workout.levelEn}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700">
                      <Play className="h-3.5 w-3.5 fill-amber-600" />
                      {isAr ? 'افتح التمرين' : 'Start'}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Active Video Player + Interactive Exercise Checklist */}
        <div className="grid grid-cols-1 gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-md lg:grid-cols-12 sm:p-8">
          {/* Video Player Column */}
          <div className="space-y-4 lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg">
              <video
                key={activeWorkout.videoPreviewUrl}
                src={activeWorkout.videoPreviewUrl}
                poster={activeWorkout.thumbnailUrl}
                controls
                loop
                muted
                playsInline
                className="aspect-video w-full object-cover"
              />
              <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 text-xs text-white">
                <span className="flex items-center gap-2 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {isAr ? 'فيديو شرح الأداء الصحيح خطوة بخطوة' : 'HD Exercise Form Demonstration'}
                </span>
                <span className="font-mono text-[11px] text-amber-300">
                  {activeWorkout.durationMin} MIN • {activeWorkout.kcalBurn} KCAL
                </span>
              </div>
            </div>

            {/* Physical Therapist Safety Note */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {isAr
                  ? '💡 توجيه طبي من دكتور العلاج الطبيعي (لتجنب الإصابة):'
                  : '💡 Physical Therapist Form & Safety Note:'}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-emerald-800">
                {isAr ? activeWorkout.ptSafetyTipAr : activeWorkout.ptSafetyTipEn}
              </p>
            </div>
          </div>

          {/* Interactive Exercise Set Tracker Column */}
          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {isAr ? activeWorkout.titleAr : activeWorkout.titleEn}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'اضغط على "أتممت مجموعة" بعد كل مجموعة ليحسب لك النظام السعرات المحروقة ويشغل تايمر الراحة تلقائياً'
                    : 'Click "Complete Set" after each set to trigger your automatic rest timer and track calories'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {activeWorkout.exercises.map((ex) => {
                const key = `${activeWorkout.id}-${ex.nameEn}`;
                const doneSets = completedExercises[key] ?? 0;
                const isFullyDone = doneSets >= ex.sets;

                return (
                  <div
                    key={ex.nameEn}
                    className={`rounded-2xl border p-4 transition ${
                      isFullyDone
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">
                            {isAr ? ex.nameAr : ex.nameEn}
                          </h4>
                          {isFullyDone && (
                            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                              {isAr ? 'مكتمل ✓' : 'Done ✓'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-amber-700">
                          {isAr ? 'العضلة المستهدفة: ' : 'Target: '}
                          {isAr ? ex.targetMuscleAr : ex.targetMuscleEn}
                        </p>
                        <p className="text-xs text-slate-600">
                          {isAr ? ex.cuesAr : ex.cuesEn}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                          <span className="rounded-lg bg-white px-2.5 py-1 border border-slate-200">
                            {ex.sets} {isAr ? 'مجموعات' : 'Sets'} × {ex.reps}
                          </span>
                          <span className="rounded-lg bg-amber-100/80 px-2.5 py-1 text-amber-900">
                            {isAr ? `راحة ${ex.restSec}ث` : `Rest ${ex.restSec}s`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {Array.from({ length: ex.sets }).map((_, idx) => (
                              <span
                                key={idx}
                                className={`h-2.5 w-6 rounded-full transition ${
                                  idx < doneSets ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCompleteSet(ex.nameEn, ex.sets, ex.restSec)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition ${
                              isFullyDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950'
                            }`}
                          >
                            {isFullyDone
                              ? isAr
                                ? `تم بالكامل (${doneSets}/${ex.sets})`
                                : `Completed (${doneSets}/${ex.sets})`
                              : isAr
                                ? `+ أتممت مجموعة (${doneSets}/${ex.sets})`
                                : `+ Complete Set (${doneSets}/${ex.sets})`}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              <Utensils className="h-4 w-4" />
              {isAr
                ? 'القسم الثاني: أنظمة غذائية مجانية محسوبة بالجرامات والبدائل'
                : 'PART 2: FREE COMPLETE NUTRITION & MEAL PLANS'}
            </span>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              {isAr
                ? 'اختر هدفك واستلم جدولك الغذائي اليومي الكامل مجاناً'
                : 'Select Your Goal & Get Your Complete Daily Meal Plan'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEconomicSwaps(!showEconomicSwaps)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100"
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
            >
              <Copy className="h-3.5 w-3.5" />
              {isAr ? 'نسخ النظام الغذائي بالكامل' : 'Copy Meal Plan'}
            </button>
          </div>
        </div>

        {/* 3 Diet Plan Selector Tabs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FREE_DIET_BLUEPRINTS.map((diet) => {
            const isSelected = diet.id === activeDiet.id;
            return (
              <button
                key={diet.id}
                type="button"
                onClick={() => setSelectedDietId(diet.id)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-start transition ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-emerald-300 shadow-sm'
                }`}
              >
                <img
                  src={diet.coverImageUrl}
                  alt={isAr ? diet.nameAr : diet.nameEn}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
                <div className="space-y-1">
                  <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    {isAr ? diet.badgeAr : diet.badgeEn}
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    {isAr ? diet.nameAr : diet.nameEn}
                  </h3>
                  <p className="font-mono text-xs font-extrabold text-amber-700">
                    {diet.targetKcal} kcal • {diet.proteinG}g Protein
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Diet Plan Detailed Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {isAr ? activeDiet.nameAr : activeDiet.nameEn}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {isAr ? activeDiet.bestForAr : activeDiet.bestForEn}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-center">
                <p className="text-[10px] font-bold text-amber-800">
                  {isAr ? 'إجمالي السعرات' : 'Total Calories'}
                </p>
                <p className="font-mono text-base font-black text-slate-900">
                  {activeDiet.targetKcal} kcal
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
                <p className="text-[10px] font-bold text-emerald-800">
                  {isAr ? 'البروتين اليومي' : 'Protein'}
                </p>
                <p className="font-mono text-base font-black text-emerald-700">
                  {activeDiet.proteinG}g
                </p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-center">
                <p className="text-[10px] font-bold text-sky-800">
                  {isAr ? 'النشويات الذكية' : 'Smart Carbs'}
                </p>
                <p className="font-mono text-base font-black text-sky-700">
                  {activeDiet.carbsG}g
                </p>
              </div>
              <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-2 text-center">
                <p className="text-[10px] font-bold text-purple-800">
                  {isAr ? 'شرب المياه' : 'Daily Water'}
                </p>
                <p className="font-mono text-base font-black text-purple-700">
                  {activeDiet.waterLiters} L
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {activeDiet.meals.map((meal, index) => (
              <div
                key={meal.titleEn}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold text-amber-900">
                      {isAr ? meal.timeAr : meal.timeEn}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-emerald-700">
                      {meal.kcal} kcal • {meal.proteinG}g Protein
                    </span>
                  </div>

                  <h4 className="mt-3 text-base font-black text-slate-900">
                    {index + 1}. {isAr ? meal.titleAr : meal.titleEn}
                  </h4>

                  <ul className="mt-3 space-y-2 text-xs text-slate-700">
                    {(isAr ? meal.itemsAr : meal.itemsEn).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {showEconomicSwaps && (
                  <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs font-bold text-amber-950">
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
