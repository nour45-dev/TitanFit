'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Apple,
  Award,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Droplets,
  Dumbbell,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Flame,
  Globe,
  Lock,
  MessageCircle,
  MessageSquare,
  Palette,
  Phone,
  Plus,
  QrCode,
  Scale,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { LogoPicker } from '../logo-picker';
import { ExerciseMotionCard, type ExerciseMotionItem } from '../exercise-motion-card';
import { BuiltInWorkoutVideoPlayer } from '../builtin-workout-video-player';
import {
  type StaffMemberItem,
  type TenantSaaSItem,
  type WorkoutLogEntry,
  usePlatformStore,
} from '../../lib/platform-store';

const PWA_EXERCISE_MOTION_MAP: Record<string, ExerciseMotionItem> = {
  'Barbell Bench Press': {
    id: 'pwa-bench',
    motionType: 'BENCH_PRESS',
    nameAr: 'ضغط صدر مستوي بالبار (Barbell Bench Press)',
    nameEn: 'Flat Barbell Bench Press',
    targetMuscleAr: 'عضلة الصدر بالكامل',
    targetMuscleEn: 'Pectoralis Major',
    secondaryMuscleAr: 'الترايسبس والكتف الأمامي',
    secondaryMuscleEn: 'Triceps & Anterior Delts',
    sets: 4,
    reps: '8 - 10 reps',
    restSec: 90,
    cuesAr: 'المس الصدر مع ثبات القدمين وادفع بقوة للأعلى بتوقيت 3-1-1.',
    cuesEn: 'Touch chest with control and explode upwards with solid leg drive.',
  },
  'Barbell Back Squat': {
    id: 'pwa-squat',
    motionType: 'BARBELL_SQUAT',
    nameAr: 'سكوات خلفي بالبار (Barbell Back Squat)',
    nameEn: 'Olympic Barbell Back Squat',
    targetMuscleAr: 'عضلات الفخذ الأمامية (الكوادس)',
    targetMuscleEn: 'Quadriceps Femoris',
    secondaryMuscleAr: 'المؤخرة والقطنية',
    secondaryMuscleEn: 'Glutes & Lower Back',
    sets: 4,
    reps: '8 - 10 reps',
    restSec: 120,
    cuesAr: 'انزل لعمق متوازي مع الأرض وادفع بكعبيك للأعلى مع ثبات الصدر مرفوعاً.',
    cuesEn: 'Descend to parallel, drive through heels keeping an upright posture.',
  },
  'Romanian Deadlift (RDL)': {
    id: 'pwa-rdl',
    motionType: 'ROMANIAN_DEADLIFT',
    nameAr: 'ديدليفت روماني (Romanian Deadlift RDL)',
    nameEn: 'Barbell Romanian Deadlift',
    targetMuscleAr: 'الفخذ الخلفي والمؤخرة',
    targetMuscleEn: 'Hamstrings & Glutes',
    secondaryMuscleAr: 'أسفل الظهر وعضلات الجذع',
    secondaryMuscleEn: 'Lower Back & Core',
    sets: 4,
    reps: '10 - 12 reps',
    restSec: 90,
    cuesAr: 'ارجع بالحوض للخلف مع شد أوتار الركبة وانحناء طفيف بالركبتين.',
    cuesEn: 'Hinge hips backward feeling full hamstring tension with slight knee soft bend.',
  },
  'Strict Overhead Press': {
    id: 'pwa-ohp',
    motionType: 'INCLINE_PRESS',
    nameAr: 'ضغط أكتاف عالي (Overhead / Incline Press)',
    nameEn: 'Strict Overhead / Incline Press',
    targetMuscleAr: 'الكتف الأمامي والعلوي',
    targetMuscleEn: 'Anterior & Lateral Delts',
    secondaryMuscleAr: 'الترايسبس وأعلى الصدر',
    secondaryMuscleEn: 'Triceps & Upper Chest',
    sets: 3,
    reps: '10 - 12 reps',
    restSec: 75,
    cuesAr: 'اثبت الجذع واضغط للأعلى باستقامة كاملة دون تقوس مفرط بالظهر.',
    cuesEn: 'Brace core and press vertically without hyperextending lumbar spine.',
  },
  'Lat Pulldown': {
    id: 'pwa-lat',
    motionType: 'LAT_PULLDOWN',
    nameAr: 'سحب عالي للضهر (Wide-Grip Lat Pulldown)',
    nameEn: 'Wide-Grip Lat Pulldown',
    targetMuscleAr: 'عضلة الظهر العريضة (المجنص)',
    targetMuscleEn: 'Latissimus Dorsi',
    secondaryMuscleAr: 'البايسبس',
    secondaryMuscleEn: 'Biceps Brachii',
    sets: 4,
    reps: '10 - 12 reps',
    restSec: 75,
    cuesAr: 'اسحب لأعلى الصدر مع ثبات الكتفين للخلف والأسفل.',
    cuesEn: 'Pull to clavicle with retracted scapulae and pause at chest.',
  },
  'Cable Rope Triceps Pushdown': {
    id: 'pwa-tri',
    motionType: 'TRICEPS_PUSHDOWN',
    nameAr: 'بوش داون ترايسبس حبل (Triceps Pushdown)',
    nameEn: 'Cable Rope Triceps Pushdown',
    targetMuscleAr: 'عضلة الترايسبس الثلاثية',
    targetMuscleEn: 'Triceps Brachii',
    secondaryMuscleAr: 'الساعدين',
    secondaryMuscleEn: 'Forearms',
    sets: 3,
    reps: '12 - 15 reps',
    restSec: 60,
    cuesAr: 'ثبت الكوعين بجانب جسمك وافتح الحبل في أسفل الحركة.',
    cuesEn: 'Lock elbows tightly at sides and spread rope apart at lockout.',
  },
};

export function MemberPwaPortalView() {
  const {
    locale,
    members,
    staff,
    workoutLogs,
    chatMessages,
    customWorkouts,
    customRecipes,
    customFiles,
    logWorkoutSet,
    sendChatMessage,
    assignMemberTrainer,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const [activePwaTab, setActivePwaTab] = useState<
    'WORKOUT_3D' | 'NUTRITION' | 'COACH_CHAT' | 'TRAINERS' | 'FILES' | 'GATE_PASS'
  >('WORKOUT_3D');

  const currentMember = members[0]!;
  const assignedCoach =
    staff.find((s) => s.id === currentMember?.assignedTrainerId) ||
    staff.find((s) => s.nameAr === currentMember?.assignedTrainerAr) ||
    staff[0];

  const [selectedPwaWorkoutId, setSelectedPwaWorkoutId] = useState<string>(
    customWorkouts[0]?.id || '',
  );
  const activePwaWorkout =
    customWorkouts.find((w) => w.id === selectedPwaWorkoutId) ?? customWorkouts[0] ?? null;

  const [qrCountdown, setQrCountdown] = useState(28);
  const [qrWindowHash, setQrWindowHash] = useState('9F4A2C8E');
  const [exerciseEn, setExerciseEn] = useState('Barbell Bench Press');
  const [weightKg, setWeightKg] = useState(115);
  const [reps, setReps] = useState(5);
  const [sets, setSets] = useState(4);
  const [latestPrBanner, setLatestPrBanner] = useState<WorkoutLogEntry | null>(null);

  // Body & Nutrition state
  const [bodyWeightKg, setBodyWeightKg] = useState(82.4);
  const [heightCm, setHeightCm] = useState(181);
  const [waterMl, setWaterMl] = useState(2400);
  const [calories, setCalories] = useState(2350);
  const [proteinG, setProteinG] = useState(192);
  const [restSeconds, setRestSeconds] = useState(0);
  const [chatInput, setChatInput] = useState('');

  // Auto-scroll chat ref
  const chatBottomRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          setQrWindowHash(Math.random().toString(16).slice(2, 10).toUpperCase());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (restSeconds <= 0) return;
    const t = setTimeout(() => setRestSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restSeconds]);

  const bmi = Math.round((bodyWeightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;

  const handleLogSet = () => {
    const entry = logWorkoutSet(exerciseEn, exerciseEn, weightKg, reps, sets);
    setLatestPrBanner(entry);
    setRestSeconds(90);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim(), 'MEMBER');
    setChatInput('');
  };

  // Filter workouts and files targeted to this member or to all
  const memberWorkouts = customWorkouts.filter(
    (w) => !w.targetMemberId || w.targetMemberId === currentMember.id,
  );
  const memberFiles = customFiles.filter(
    (f) => !f.targetMemberId || f.targetMemberId === currentMember.id,
  );

  return (
    <div data-testid="panel-member-pwa" className="space-y-6">
      {/* Top Member App Header Banner */}
      <div className="rounded-3xl border border-amber-300/60 bg-gradient-to-r from-amber-50 via-slate-50 to-amber-100/50 p-6 text-slate-900 shadow-sm dark:border-[#D4AF37]/40 dark:bg-gradient-to-r dark:from-[#14192B] dark:via-[#191F36] dark:to-[#211B11] dark:text-white">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] font-mono text-xl font-black text-slate-950 shadow-md">
              {currentMember.avatarInitials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-black text-amber-800 dark:bg-[#D4AF37]/20 dark:text-[#F3E5AB]">
                  <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                  {isAr ? 'تطبيق المتدرب الذكي (Member App)' : 'MEMBER PWA PORTAL'}
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                  🔥 {currentMember.streakDays} {isAr ? 'يوم التزام' : 'Days Streak'}
                </span>
              </div>
              <h1 className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
                {isAr
                  ? `أهلاً بك، ${currentMember.fullNameAr}`
                  : `Welcome back, ${currentMember.fullNameEn}`}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {isAr
                  ? `${currentMember.planNameAr} • تنتهي في ${currentMember.endDate} • كود العضو: ${currentMember.code}`
                  : `${currentMember.planNameEn} • Valid until ${currentMember.endDate} • Code: ${currentMember.code}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-center shadow-2xs dark:border-white/15 dark:bg-black/40">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {isAr ? 'مؤشر الكتلة BMI' : 'Current BMI'}
              </span>
              <p className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                {bmi}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-center shadow-2xs dark:border-white/15 dark:bg-black/40">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {isAr ? 'نقاط الإنجاز XP' : 'Member XP'}
              </span>
              <p className="font-mono text-lg font-black text-[#D4AF37]">
                {currentMember.points.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Member App Tabbed Navigation Bar */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200/80 pt-4 dark:border-white/10">
          <button
            type="button"
            data-testid="pwa-tab-workout"
            onClick={() => setActivePwaTab('WORKOUT_3D')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
              activePwaTab === 'WORKOUT_3D'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Dumbbell className="h-4 w-4" />
            {isAr ? '🏋️‍♂️ خطتي واستوديو التمارين' : 'Workout & 3D Studio'}
          </button>

          <button
            type="button"
            data-testid="pwa-tab-nutrition"
            onClick={() => setActivePwaTab('NUTRITION')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
              activePwaTab === 'NUTRITION'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Flame className="h-4 w-4 text-orange-500" />
            {isAr ? '🥗 التغذية والماكروز' : 'Macros & Nutrition'}
          </button>

          <button
            type="button"
            data-testid="pwa-tab-coach"
            onClick={() => setActivePwaTab('COACH_CHAT')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
              activePwaTab === 'COACH_CHAT'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            {isAr ? `💬 كابتني والمحادثة (${assignedCoach?.nameAr || 'المدرب'})` : 'My Coach & Live Chat'}
          </button>

          <button
            type="button"
            data-testid="pwa-tab-trainers"
            onClick={() => setActivePwaTab('TRAINERS')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
              activePwaTab === 'TRAINERS'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Users className="h-4 w-4" />
            {isAr ? '👥 قائمة مدربي الجيم' : 'Gym Trainers'}
          </button>

          <button
            type="button"
            data-testid="pwa-tab-files"
            onClick={() => setActivePwaTab('FILES')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
              activePwaTab === 'FILES'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <FileText className="h-4 w-4 text-sky-500" />
            {isAr
              ? `📁 فيديوهاتي وملفاتي (${memberWorkouts.length + memberFiles.length})`
              : `Assigned Media (${memberWorkouts.length + memberFiles.length})`}
          </button>

          <button
            type="button"
            data-testid="pwa-tab-gate"
            onClick={() => setActivePwaTab('GATE_PASS')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
              activePwaTab === 'GATE_PASS'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <QrCode className="h-4 w-4" />
            {isAr ? '💳 بطاقة الدخول الذكية' : 'Smart Gate Pass'}
          </button>
        </div>
      </div>

      {/* Tab 1: Workout Plan & 3D Motion Studio */}
      {activePwaTab === 'WORKOUT_3D' && (
        <div data-testid="pwa-tab-workout-content" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: 3D Motion Card + Dynamic Exercise Details */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121623]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    🏋️‍♂️ {isAr ? 'المحاكي الحركي والتشريحي ثلاثي الأبعاد' : '3D Motion & Biomechanics Studio'}
                  </span>
                  <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                    {isAr ? 'مسار الحركة، العضلات المستهدفة، وتعليمات السلامة' : 'Dynamic Movement Path, Target Muscles & Form Cues'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="pwa-exercise-select" className="sr-only">
                    {isAr ? 'اختر التمرين' : 'Select Exercise'}
                  </label>
                  <select
                    id="pwa-exercise-select"
                    value={exerciseEn}
                    onChange={(e) => setExerciseEn(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="Barbell Bench Press">Barbell Bench Press (ضغط صدر مستوي بالبار)</option>
                    <option value="Barbell Back Squat">Barbell Back Squat (سكوات خلفي بالبار)</option>
                    <option value="Romanian Deadlift (RDL)">Romanian Deadlift (ديدليفت روماني RDL)</option>
                    <option value="Strict Overhead Press">Strict Overhead Press (ضغط كتف بالبار)</option>
                    <option value="Lat Pulldown">Wide-Grip Lat Pulldown (سحب عالي للظهر)</option>
                    <option value="Cable Rope Triceps Pushdown">Cable Rope Triceps Pushdown (بوش داون ترايسبس حبل)</option>
                  </select>
                </div>
              </div>

              {PWA_EXERCISE_MOTION_MAP[exerciseEn] && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
                  <ExerciseMotionCard
                    exercise={PWA_EXERCISE_MOTION_MAP[exerciseEn]!}
                    locale={isAr ? 'ar' : 'en'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Col: 1RM PR Calculator, Workout Logger & Rest Timer */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121623]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? 'مسجل التمارين وحاسبة الأرقام (Epley 1RM)' : '1RM PR Logger'}
                </h3>
                <Dumbbell className="h-5 w-5 text-amber-500" />
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="pwa-weight-input" className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {isAr ? 'الوزن (كجم)' : 'Weight (kg)'}
                    </label>
                    <input
                      id="pwa-weight-input"
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-bold text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="pwa-reps-input" className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {isAr ? 'العدات' : 'Reps'}
                    </label>
                    <input
                      id="pwa-reps-input"
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-bold text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="pwa-sets-input" className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {isAr ? 'المجموعات' : 'Sets'}
                    </label>
                    <input
                      id="pwa-sets-input"
                      type="number"
                      value={sets}
                      onChange={(e) => setSets(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-bold text-slate-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  data-testid="log-workout-set-btn"
                  onClick={handleLogSet}
                  className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400"
                >
                  {isAr ? 'تسجيل المجموعة وحساب 1RM' : 'Log Set & Calculate 1RM'}
                </button>

                {latestPrBanner && (
                  <div
                    data-testid="pr-notification-msg"
                    className="rounded-xl border border-amber-400 bg-amber-50 p-3 text-xs font-extrabold text-amber-950 dark:border-amber-500/50 dark:bg-amber-500/20 dark:text-amber-200"
                  >
                    🏆 {isAr ? 'رقم قياسي جديد (PR)!' : 'NEW PERSONAL RECORD!'} {latestPrBanner.exerciseEn}: 1RM {isAr ? 'تقديري' : 'est.'} {latestPrBanner.estimated1RmKg} {isAr ? 'كجم' : 'kg'} ({latestPrBanner.weightKg}kg × {latestPrBanner.reps})
                  </div>
                )}

                {/* Rest Timer */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Timer className="h-4 w-4 text-amber-500" />
                    <span>{isAr ? 'مؤقت الراحة:' : 'Rest Timer:'}</span>
                    <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                      {restSeconds}s
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[60, 90, 120].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setRestSeconds(sec)}
                        className="rounded-lg bg-slate-200 px-2 py-1 font-mono text-[11px] font-bold text-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Logs List */}
                <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isAr ? 'سجل مجموعات اليوم:' : 'Today Sets Log:'}
                  </span>
                  {workoutLogs.slice(0, 3).map((wk) => (
                    <div
                      key={wk.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {isAr ? wk.exerciseAr : wk.exerciseEn}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {wk.sets} sets × {wk.reps} reps @ {wk.weightKg}kg
                        </p>
                      </div>
                      <div className="text-end">
                        <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
                          1RM: {wk.estimated1RmKg}kg
                        </span>
                        {wk.isNewPr && (
                          <span className="ms-1.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                            PR
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Nutrition, Macros & Hydration */}
      {activePwaTab === 'NUTRITION' && (
        <div data-testid="pwa-tab-nutrition-content" className="space-y-6">
          {/* Top Nutrition & Hydration Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#121623]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'السعرات الحرارية اليومية' : 'Daily Calories'}
                </span>
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-2 font-mono text-2xl font-black text-slate-900 dark:text-white">{calories}</p>
              <p className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {isAr ? 'المستهدف: 2,600 سعرة / يوم' : 'Target: 2,600 kcal / day'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#121623]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'البروتين المستهدف' : 'Target Protein'}
                </span>
                <Apple className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="mt-2 font-mono text-2xl font-black text-amber-600 dark:text-amber-400">{proteinG}g</p>
              <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                {isAr ? 'الهدف: 200 جم (2.2 جم لكل كجم)' : 'Goal: 200g (2.2g/kg bodyweight)'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#121623]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'شرب المياه والترطيب' : 'Hydration Tracker'}
                </span>
                <Droplets className="h-5 w-5 text-sky-500" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="font-mono text-2xl font-black text-sky-600 dark:text-sky-400">{waterMl} ml</p>
                <button
                  type="button"
                  onClick={() => setWaterMl((w) => w + 250)}
                  className="rounded-lg bg-sky-500/20 px-2.5 py-1 text-xs font-black text-sky-700 hover:bg-sky-500/30 dark:text-sky-300"
                >
                  +250ml 💧
                </button>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                {isAr ? 'الهدف الأدنى: 3,500 مل' : 'Min Goal: 3,500 ml'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#121623]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'الوزن وكتلة الجسم (BMI)' : 'Body Weight & BMI'}
                </span>
                <Scale className="h-5 w-5 text-purple-500" />
              </div>
              <p className="mt-2 font-mono text-2xl font-black text-purple-600 dark:text-purple-400">{bodyWeightKg} kg</p>
              <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                BMI: {bmi} ({bmi < 25 ? (isAr ? 'وزن مثالي' : 'Normal') : (isAr ? 'زيادة عضلية' : 'Athletic Overweight')})
              </p>
            </div>
          </div>

          {/* Recipes from Club */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121623] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                  🥗 {isAr ? 'الوصفات والوجبات الصحية الموصى بها لك' : 'Healthy Macro Recipes'}
                </span>
                <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  {isAr ? 'وجبات محسوبة السعرات والماكروز مجهزة من أخصائي النادي' : 'Club Nutritionist Approved Meals'}
                </h3>
              </div>
              <Utensils className="h-6 w-6 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {customRecipes.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={r.imageUrl}
                      alt={isAr ? r.titleAr : r.titleEn}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                    <div>
                      <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">
                        {r.mealType}
                      </span>
                      <h4 className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                        {isAr ? r.titleAr : r.titleEn}
                      </h4>
                      <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="text-slate-600 dark:text-slate-300">🔥 {r.kcal} kcal</span>
                        <span className="text-amber-600 dark:text-amber-400">🍗 {r.proteinG}g بروتين</span>
                        <span className="text-sky-600 dark:text-sky-400">🍚 {r.carbsG}g كارب</span>
                        <span className="text-emerald-600 dark:text-emerald-400">🥑 {r.fatsG}g دهون</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: My Coach & Live High-Contrast Chat */}
      {activePwaTab === 'COACH_CHAT' && (
        <div data-testid="pwa-tab-chat-content" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Coach Profile Card */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121623]">
              <div className="flex items-center gap-4">
                <img
                  src={assignedCoach?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={isAr ? assignedCoach?.nameAr : assignedCoach?.nameEn}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-500/40"
                />
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-black text-emerald-700 dark:text-emerald-400">
                    ● {isAr ? 'متصل الآن للمتابعة' : 'Online Coach'}
                  </span>
                  <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {isAr ? assignedCoach?.nameAr : assignedCoach?.nameEn}
                  </h3>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {isAr ? assignedCoach?.specialtyAr : assignedCoach?.specialtyEn}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {isAr ? assignedCoach?.bioAr : assignedCoach?.bioEn}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-200 py-3 text-center dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400">{isAr ? 'التقييم' : 'Rating'}</span>
                  <p className="font-mono text-sm font-black text-amber-500">⭐ {assignedCoach?.rating || 4.9}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">{isAr ? 'المتدربين النشطين' : 'Active Trainees'}</span>
                  <p className="font-mono text-sm font-black text-slate-900 dark:text-white">{assignedCoach?.activeClients || 24}</p>
                </div>
              </div>

              {/* Direct WhatsApp and Phone Call Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${(assignedCoach?.whatsappNumber || '01002169889').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white shadow-sm hover:bg-emerald-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  {isAr ? 'واتساب مباشر' : 'WhatsApp'}
                </a>
                <a
                  href={`tel:${assignedCoach?.phone || '01002169889'}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-xs font-black text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  <Phone className="h-4 w-4 text-amber-500" />
                  {isAr ? 'اتصال هاتفي' : 'Call'}
                </a>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setActivePwaTab('TRAINERS')}
                  className="w-full rounded-xl border border-dashed border-amber-400/80 bg-amber-50/50 py-2 text-xs font-black text-amber-800 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
                >
                  {isAr ? '🔄 تغيير المدرب أو استعراض باقي المدربين' : 'Switch or Browse Trainers'}
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messenger with High Contrast Light/Dark Theme */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121623] lg:col-span-2">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {isAr
                        ? `محادثة خاصة ومشفرة مع ${assignedCoach?.nameAr || 'المدرب الشخصي'}`
                        : `Private Encrypted Chat with ${assignedCoach?.nameEn || 'Coach'}`}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr
                        ? 'محادثة مخصصة لك فقط مع إجابات ذكية فورية على استفساراتك'
                        : 'Dedicated private session with instant smart assistant support'}
                    </p>
                  </div>
                </div>
                <MessageSquare className="h-5 w-5 text-amber-500" />
              </div>

              {/* Quick Prompt Chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  {
                    ar: 'عايز أزود وزني في البنش ومحتاج نصيحة تكنيك',
                    en: 'Tips to increase my bench press weight?',
                  },
                  {
                    ar: 'إيه أفضل وجبة بعد التمرين لبناء العضلات؟',
                    en: 'Best post-workout meal for muscle synthesis?',
                  },
                  {
                    ar: 'عندي إرهاق خفيف في الركبة، هل ألعب رجلين؟',
                    en: 'Slight knee fatigue, should I train legs?',
                  },
                  {
                    ar: 'محتاج مراجعة على سعراتي والماكروز اليوم',
                    en: 'Review my daily macros and calorie budget',
                  },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sendChatMessage(isAr ? chip.ar : chip.en, 'MEMBER');
                    }}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-500/50 dark:hover:bg-amber-500/10 dark:hover:text-amber-200"
                  >
                    💬 {isAr ? chip.ar : chip.en}
                  </button>
                ))}
              </div>

              {/* Messages Container with Crisp Contrast in Light & Dark */}
              <div className="mt-4 max-h-[380px] space-y-3 overflow-y-auto pe-1">
                {chatMessages.map((msg) => {
                  const isMember = msg.senderRole === 'MEMBER';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMember ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs shadow-xs ${
                          isMember
                            ? 'border border-amber-300 bg-amber-100 text-amber-950 font-bold dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-100'
                            : 'border border-slate-300 bg-slate-100 text-slate-900 font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-extrabold opacity-80">
                          <span>{isAr ? msg.senderNameAr : msg.senderNameEn}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {isAr ? msg.textAr : msg.textEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isAr ? 'اكتب استفسارك أو سؤالك للكابتن هنا...' : 'Type a message to your coach...'}
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                aria-label={isAr ? 'إرسال الرسالة للمدرب' : 'Send message to coach'}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400"
              >
                <span>{isAr ? 'إرسال' : 'Send'}</span>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Gym Trainers Directory & Selection */}
      {activePwaTab === 'TRAINERS' && (
        <div data-testid="pwa-tab-trainers-content" className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121623]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                  👥 {isAr ? 'طاقم التدريب المعتمد في ناديك' : 'CERTIFIED GYM TRAINERS'}
                </span>
                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'اختر مدربك الخاص وتواصل معه مباشرة عبر الواتساب أو المكالمات'
                    : 'Select Your Personal Coach & Connect Instantly'}
                </h2>
              </div>
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-300">
                {staff.length} {isAr ? 'مدربين معتمدين' : 'Certified Coaches'}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {staff.map((coach) => {
                const isSelected = coach.id === assignedCoach?.id;
                return (
                  <div
                    key={coach.id}
                    className={`flex flex-col justify-between rounded-3xl border p-5 transition ${
                      isSelected
                        ? 'border-2 border-emerald-500 bg-emerald-50/30 shadow-md dark:border-emerald-500/80 dark:bg-emerald-950/15'
                        : 'border-slate-200 bg-white hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <img
                          src={coach.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={isAr ? coach.nameAr : coach.nameEn}
                          className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-500/30"
                        />
                        <div>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">
                              <Check className="h-3 w-3" />
                              {isAr ? 'مدربك الحالي' : 'Current Coach'}
                            </span>
                          )}
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {isAr ? coach.nameAr : coach.nameEn}
                          </h3>
                          <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            {isAr ? coach.specialtyAr : coach.specialtyEn}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {isAr ? coach.bioAr : coach.bioEn}
                      </p>

                      <div className="mt-3 flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>⭐ {coach.rating || 4.9}</span>
                        <span>•</span>
                        <span>{coach.activeClients || 20} {isAr ? 'متدرب' : 'Trainees'}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {coach.ptSessionRateEgp} {isAr ? 'ج.م/حصة PT' : 'EGP/session'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`https://wa.me/${(coach.whatsappNumber || '01002169889').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-500"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          {isAr ? 'واتساب' : 'WhatsApp'}
                        </a>
                        <a
                          href={`tel:${coach.phone}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-black text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <Phone className="h-3.5 w-3.5 text-amber-500" />
                          {isAr ? 'اتصال' : 'Call'}
                        </a>
                      </div>

                      {isSelected ? (
                        <button
                          type="button"
                          onClick={() => setActivePwaTab('COACH_CHAT')}
                          className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white hover:bg-emerald-500"
                        >
                          💬 {isAr ? 'فتح المحادثة الفورية مع الكابتن' : 'Open Coach Chat'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            assignMemberTrainer(currentMember.id, coach.id);
                          }}
                          className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 shadow-sm hover:bg-amber-400"
                        >
                          ✨ {isAr ? 'اختيار هذا المدرب كمدربي الخاص' : 'Select as My Coach'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Targeted Media, Videos & Downloadable Files */}
      {activePwaTab === 'FILES' && (
        <div data-testid="pwa-tab-files-content" className="space-y-6">
          <div
            data-testid="pwa-coach-media-library"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121623] sm:p-8 space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  📁 {isAr ? 'الفيديوهات والملفات الخاصة بك' : 'YOUR ASSIGNED MEDIA & FILES'}
                </span>
                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'الفيديوهات التدريبية والملفات المرفوعة لك من الكابتن وإدارة الجيم'
                    : 'Targeted Workout Videos & Uploaded Club Files'}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {memberWorkouts.map((cw) => (
                  <button
                    key={cw.id}
                    type="button"
                    onClick={() => setSelectedPwaWorkoutId(cw.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition ${
                      activePwaWorkout?.id === cw.id
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <span>{isAr ? cw.titleAr : cw.titleEn}</span>
                    {cw.targetMemberId && (
                      <span className="rounded bg-amber-400/30 px-1 text-[10px] font-black text-amber-950 dark:text-amber-200">
                        {isAr ? 'خاص' : 'Private'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player */}
            {activePwaWorkout ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-300">
                    {activePwaWorkout.targetMemberId
                      ? (isAr ? `🔒 فيديو مخصص لك خصيصاً من: ${activePwaWorkout.coachAr}` : '🔒 Assigned specifically to you')
                      : (isAr ? '🌐 فيديو عام لجميع متدربي النادي' : '🌐 General club video')}
                  </span>
                </div>
                <BuiltInWorkoutVideoPlayer
                  titleAr={activePwaWorkout.titleAr}
                  titleEn={activePwaWorkout.titleEn}
                  coachAr={activePwaWorkout.coachAr}
                  coachEn={activePwaWorkout.coachEn}
                  motionType={activePwaWorkout.motionType}
                  targetMuscleAr={activePwaWorkout.targetMuscleAr}
                  targetMuscleEn={activePwaWorkout.targetMuscleEn}
                  sets={activePwaWorkout.sets}
                  reps={activePwaWorkout.reps}
                  restSec={activePwaWorkout.restSec}
                  safetyTipAr={activePwaWorkout.safetyTipAr}
                  safetyTipEn={activePwaWorkout.safetyTipEn}
                  thumbnailUrl={activePwaWorkout.thumbnailUrl}
                  videoSourceType={activePwaWorkout.videoSourceType}
                  videoUrl={activePwaWorkout.videoUrl}
                  isAr={isAr}
                />
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">
                {isAr ? 'لا توجد فيديوهات مخصصة حالياً.' : 'No videos assigned yet.'}
              </p>
            )}

            {/* Downloadable Documents & Files */}
            <div className="border-t border-slate-200 pt-6 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  📄 {isAr ? 'الملفات التدريبية والأنظمة المرفوعة للتحميل (PDFs / Guides):' : 'Training PDFs & Files:'}
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  {memberFiles.length} {isAr ? 'ملف متاح' : 'Files available'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {memberFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">
                            {isAr ? f.titleAr : f.titleEn}
                          </h4>
                          {f.targetMemberId && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-800 dark:text-amber-200">
                              {isAr ? '🔒 مخصص لك' : 'Private'}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                          {f.category} • {f.fileSizeLabel}
                        </p>
                      </div>
                    </div>
                    <a
                      href={f.fileUrl}
                      download={f.fileName}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white hover:bg-emerald-500 shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {isAr ? 'تحميل' : 'Download'}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Smart Gate Pass & Branch Leaderboard */}
      {activePwaTab === 'GATE_PASS' && (
        <div data-testid="pwa-tab-gate-content" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Rotating Digital QR Pass */}
          <div className="rounded-3xl border border-amber-300 bg-white p-6 text-center shadow-md dark:border-amber-500/40 dark:bg-[#121623]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>{isAr ? 'بطاقة الدخول الذكية للبوابة' : 'ROTATING GATE PASS'}</span>
              <span className="font-mono text-emerald-500">HMAC-SHA256</span>
            </div>

            <div className="mx-auto my-6 flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 border-amber-500 bg-white p-4 text-slate-950 shadow-xl">
              <QrCode className="h-32 w-32 text-slate-950" />
              <span className="mt-1 font-mono text-[11px] font-extrabold tracking-widest">
                TF:{qrWindowHash}
              </span>
            </div>

            <p className="font-mono text-xs font-bold text-amber-800 dark:text-amber-200">
              TITANFIT:v1:titanfit-egypt:{currentMember.code}:{qrWindowHash}
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-amber-500 transition-all duration-1000"
                style={{ width: `${(qrCountdown / 30) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? `يتغير الرمز المشفر تلقائياً خلال ${qrCountdown} ثانية لمنع مشاركة الصور`
                : `Anti-screenshot token rotates in ${qrCountdown}s`}
            </p>
          </div>

          {/* Branch Leaderboard */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121623]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAr ? 'لوحة متصدري الفرع (Leaderboard)' : 'Branch Consistency Leaderboard'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'الأكثر التزاماً بالحضور والتمارين هذا الأسبوع' : 'Top consistency streaks this week'}
                </p>
              </div>
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>

            <div className="mt-4 space-y-2.5">
              {members.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {isAr ? m.fullNameAr : m.fullNameEn}
                      </span>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        🔥 {m.streakDays} {isAr ? 'يوم التزام متواصل' : 'days streak'}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                    {m.points.toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export function ReportsAnalyticsView() {
  const { locale, invoices, members, branches, showToast } = usePlatformStore();
  const isAr = locale === 'ar';

  const handleExportCsv = () => {
    const headers = ['InvoiceNumber,MemberName,Plan,Method,SubtotalEGP,VATEGP,TotalEGP,Status'];
    const rows = invoices.map(
      (i) =>
        `${i.invoiceNumber},"${i.memberNameEn}","${i.planNameEn}",${i.method},${i.subtotalEgp},${i.vatEgp},${i.totalEgp},${i.status}`,
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TitanFit-Financial-Report-2026.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      isAr
        ? 'تم تصدير التقرير المالي بصيغة CSV/Excel بنجاح!'
        : 'Downloaded TitanFit-Financial-Report-2026.csv!',
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {isAr
              ? 'التقارير المالية، معدلات الاحتفاظ بالأعضاء، وتصدير Excel / CSV'
              : 'Executive Financial, Retention & Attendance BI Reports'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'تحليل الإيرادات حسب بوابة الدفع والفرع مع إمكانية التصدير المباشر للمحاسبين والضرائب'
              : 'Granular revenue attribution by payment gateway, branch P&L, and cohort retention'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-extrabold text-slate-950"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isAr ? 'تصدير التقرير المالي (CSV / Excel)' : 'Export Financial Ledger (CSV)'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {isAr ? 'توزيع التحصيل حسب بوابة الدفع' : 'Revenue by Payment Gateway'}
          </h3>
          <div className="mt-4 space-y-3 text-xs">
            {[
              { name: 'InstaPay Egypt (إنستاباي)', pct: 42, amount: '353,850 EGP' },
              { name: 'Paymob Card (بطاقات بنكية)', pct: 31, amount: '261,175 EGP' },
              { name: 'Vodafone Cash & Fawry', pct: 16, amount: '134,800 EGP' },
              { name: 'Cash at Reception (نقدي)', pct: 11, amount: '92,675 EGP' },
            ].map((g) => (
              <div key={g.name}>
                <div className="flex justify-between font-bold text-slate-200">
                  <span>{g.name}</span>
                  <span className="font-mono text-[#D4AF37]">{g.amount}</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {isAr ? 'أداء الفروع وصافي الربحية' : 'Branch Revenue Breakdown'}
          </h3>
          <div className="mt-4 space-y-3 text-xs">
            {branches.map((b, i) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-3"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{isAr ? b.nameAr : b.nameEn}</p>
                  <p className="text-slate-400">{isAr ? b.managerAr : b.managerEn}</p>
                </div>
                <span className="font-mono font-extrabold text-emerald-400">
                  {(420000 - i * 95000).toLocaleString()} EGP
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {isAr ? 'مؤشرات الاحتفاظ والتجديد (Cohort Retention)' : 'Member Retention & LTV Metrics'}
          </h3>
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-xl bg-slate-900/70 p-3">
              <span className="text-slate-400">
                {isAr ? 'معدل التجديد التلقائي للباقات السنوية' : 'Annual Plan Renewal Rate'}
              </span>
              <p className="mt-1 font-mono text-xl font-extrabold text-emerald-400">88.4%</p>
            </div>
            <div className="rounded-xl bg-slate-900/70 p-3">
              <span className="text-slate-400">
                {isAr ? 'متوسط القيمة الدائمة للعضو (LTV)' : 'Average Member Lifetime Value (LTV)'}
              </span>
              <p className="mt-1 font-mono text-xl font-extrabold text-[#D4AF37]">22,400 EGP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TenantSettingsView() {
  const {
    locale,
    branches,
    brandAccentHex,
    setBrandAccentHex,
    showToast,
    activeTenantCustom,
    updateTenantBranding,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {isAr
            ? 'إعدادات النادي، الفروع، الهوية البصرية، والضرائب المصرية'
            : 'Club Settings, Multi-Branch Setup, White-Label Branding & Tax'}
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {isAr
            ? 'تخصيص ألوان الهوية البصرية للمستأجر، مواعيد عمل الفروع، وقوالب رسائل واتساب التلقائية'
            : 'Customize tenant white-label theme tokens, branch working hours, Egypt 14% VAT, and WhatsApp templates'}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6" data-testid="settings-logo-card">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          {isAr ? 'شعار ناديك' : 'Your Gym Logo'}
        </h3>
        {activeTenantCustom ? (
          <>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? `اختر صورة الشعار من جهازك لتظهر في أعلى منصة "${activeTenantCustom.nameAr}" ولدى متدربيك.`
                : `Pick your logo from your device — it appears across "${activeTenantCustom.nameEn}" and for your members.`}
            </p>
            <LogoPicker
              value={activeTenantCustom.logoUrl && activeTenantCustom.logoUrl !== '/brand/logo.png' ? activeTenantCustom.logoUrl : ''}
              onChange={(url) => {
                updateTenantBranding(activeTenantCustom.id, { logoUrl: url || '/brand/logo.png' });
                showToast(
                  url
                    ? isAr
                      ? 'تم تحديث شعار النادي بنجاح'
                      : 'Gym logo updated'
                    : isAr
                      ? 'تمت إزالة الشعار والعودة للشعار الافتراضي'
                      : 'Logo removed — default restored',
                );
              }}
              isAr={isAr}
              testId="settings-logo"
              fallbackLabel={isAr ? 'الافتراضي' : 'Default'}
            />
          </>
        ) : (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'يتم تحديد شعار كل نادٍ من حساب صاحب النادي، أو من لوحة المنصة عند إنشاء النادي.'
              : 'Each gym logo is set from the gym owner account, or when the gym is created from the platform console.'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isAr ? 'تخصيص الهوية البصرية (White-Label Theme)' : 'White-Label Brand Tokens'}
            </h3>
            <Palette className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { name: 'Titan Championship Gold', hex: '#D4AF37' },
              { name: 'Emerald Athletic', hex: '#10B981' },
              { name: 'Electric Cobalt', hex: '#3B82F6' },
              { name: 'Crimson Power', hex: '#F43F5E' },
            ].map((col) => (
              <button
                key={col.hex}
                type="button"
                onClick={() => {
                  setBrandAccentHex(col.hex);
                  showToast(
                    isAr
                      ? `تم تحديث لون الهوية البصرية إلى ${col.name}`
                      : `Updated tenant brand token to ${col.name}`,
                  );
                }}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${
                  brandAccentHex === col.hex
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-slate-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: col.hex }} />
                {col.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#121623] p-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {isAr ? 'الفروع المسجلة ومواعيد العمل' : 'Configured Club Branches'}
          </h3>
          <div className="mt-4 space-y-3">
            {branches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{isAr ? b.nameAr : b.nameEn}</p>
                  <p className="text-slate-400">
                    {isAr ? b.addressAr : b.addressEn} • {b.workingHours}
                  </p>
                </div>
                <span className="font-mono text-emerald-400">{b.phone}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminConsoleView() {
  const {
    locale,
    tenants,
    auditLogs,
    impersonatedTenant,
    setImpersonatedTenant,
    addTenant,
    toggleTenantStatus,
    deleteTenant,
    login,
    showToast,
  } = usePlatformStore();
  const isAr = locale === 'ar';

  const [showAddTenant, setShowAddTenant] = useState(false);
  const [deletingTenantId, setDeletingTenantId] = useState<string | null>(null);
  const [createdTenantCredentials, setCreatedTenantCredentials] = useState<TenantSaaSItem | null>(null);

  // Form states
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('pass123');
  const [gymSecretCodeInput, setGymSecretCodeInput] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#059669');
  const [planTier, setPlanTier] = useState<TenantSaaSItem['planTier']>('PRO');
  const [cityEn, setCityEn] = useState('New Cairo, Egypt');

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameAr.trim()) return;
    const finalSlug = slug.trim() || (nameEn || nameAr).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalLogo = logoUrl.trim() || '/brand/logo.png';
    const finalEmail = ownerEmail.trim() || `owner@${finalSlug}.eg`;

    const newTenant = addTenant(
      nameEn || nameAr,
      nameAr || nameEn,
      finalEmail,
      planTier,
      cityEn,
      password,
      finalLogo,
      primaryColor,
      finalSlug,
      gymSecretCodeInput,
    );

    setCreatedTenantCredentials(newTenant);
    setShowAddTenant(false);
    setNameAr('');
    setNameEn('');
    setSlug('');
    setOwnerEmail('');
    setGymSecretCodeInput('');
    setLogoUrl('');
  };

  const copyCredentials = (ten: TenantSaaSItem) => {
    const text = `🎉 بيانات تفعيل منصتك الخاصة (${ten.nameAr}):\n🌐 الرابط: https://titanfit.app/${ten.slug}\n📧 اسم مستخدم المالك: ${ten.ownerEmail}\n🔑 كلمة مرور المالك: [تم إرسالها في رسالة SMS خاصة]\n🏷️ كود دخول المتدربين السري: ${ten.gymSecretCode}\n🚀 يمكنك تسجيل الدخول الآن وإدارة ناديك ومتدربيك بالكامل!`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(isAr ? 'تم نسخ بيانات الاعتماد لمشاركتها مع العميل!' : 'Copied credentials to clipboard!');
  };

  return (
    <div data-testid="panel-super-admin" className="space-y-6">
      {impersonatedTenant && (
        <div
          data-testid="impersonation-banner"
          className="flex items-center justify-between rounded-2xl border border-amber-500/60 bg-amber-500/15 px-6 py-4 text-xs font-extrabold text-amber-900 dark:text-amber-200"
        >
          <span>
            🛡️ AUDITED IMPERSONATION ACTIVE — Viewing tenant &quot;{impersonatedTenant}&quot; (Logged in
            immutable audit_logs)
          </span>
          <button
            type="button"
            onClick={() => setImpersonatedTenant(null)}
            className="rounded-lg bg-amber-500 px-3 py-1 font-black text-slate-950"
          >
            {isAr ? 'إنهاء جلسة الدعم' : 'Exit Impersonation'}
          </button>
        </div>
      )}

      {/* Created Tenant Success Card Alert */}
      {createdTenantCredentials && (
        <div className="theme-card relative overflow-hidden rounded-3xl border-2 border-emerald-500 bg-emerald-500/10 p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={createdTenantCredentials.logoUrl}
                alt={createdTenantCredentials.nameAr}
                className="h-16 w-16 rounded-2xl border-2 border-emerald-500 object-cover bg-white"
              />
              <div>
                <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                  {isAr ? 'تم تفعيل العميل الجديد بنجاح' : 'TENANT ONBOARDED'}
                </span>
                <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  {isAr ? createdTenantCredentials.nameAr : createdTenantCredentials.nameEn}
                </h3>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-300">
                  {isAr ? 'الرابط: ' : 'URL: '} https://titanfit.app/{createdTenantCredentials.slug} •{' '}
                  {createdTenantCredentials.ownerEmail}  • 🏷️ كود المتدربين: <span className="font-black text-emerald-600 dark:text-emerald-400">{createdTenantCredentials.gymSecretCode}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyCredentials(createdTenantCredentials)}
                className="rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700"
              >
                {isAr ? '📋 نسخ بيانات الدخول للواتساب' : 'Copy Credentials'}
              </button>
              <button
                type="button"
                onClick={() => {
                  login(createdTenantCredentials.ownerEmail);
                  setCreatedTenantCredentials(null);
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800 dark:bg-slate-800"
              >
                {isAr ? '🚀 تسجيل الدخول الآن بحسابه' : 'Login as this Tenant'}
              </button>
              <button
                type="button"
                onClick={() => setCreatedTenantCredentials(null)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="theme-card flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {isAr
              ? 'لوحة مالك المنصة (Super Admin SaaS Multi-Tenant Control Plane)'
              : 'Super Admin SaaS Control Plane & Immutable Audit Explorer'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'إضافة عملاء جدد (White-Label)، تعيين الشعارات وكلمات المرور، وإدارة الاشتراكات'
              : 'Onboard gym/coach tenants, assign custom logos & passwords, and manage SaaS tiers'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddTenant(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-black text-slate-950 shadow-md transition hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          {isAr ? '+ إضافة نادي / مستأجر جديد (White-Label)' : '+ Onboard New Gym Tenant'}
        </button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {tenants.map((ten, idx) => (
          <div
            key={ten.id}
            className="theme-card flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-amber-500/15 px-2.5 py-0.5 font-mono text-xs font-extrabold text-amber-700 dark:text-amber-400">
                  {ten.planTier}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                    ten.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : ten.status === 'TRIAL'
                        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {ten.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {ten.logoUrl ? (
                  <img
                    src={ten.logoUrl}
                    alt={ten.nameAr}
                    className="h-12 w-12 rounded-xl object-cover border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-black">
                    TF
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isAr ? ten.nameAr : ten.nameEn}
                  </h3>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    /{ten.slug} • {ten.cityAr || ten.cityEn}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <p>📧 {ten.ownerEmail}</p>
                <p className="mt-1">🔑 {isAr ? 'كلمة المرور: [مُشفرة بالسيرفر]' : 'Password: [Server-Encrypted]'}</p>
                <p className="mt-1 font-bold text-emerald-700 dark:text-emerald-400">
                  🏷️ {isAr ? 'كود المتدربين السري:' : 'Gym PIN:'} <span className="underline">{ten.gymSecretCode || 'TF-JOIN'}</span>
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <div>
                  <span className="text-slate-400">{isAr ? 'الفروع' : 'Branches'}</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{ten.branchesCount}</p>
                </div>
                <div>
                  <span className="text-slate-400">{isAr ? 'الأعضاء' : 'Members'}</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{ten.activeMembersCount}</p>
                </div>
                <div>
                  <span className="text-slate-400">MRR</span>
                  <p className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
                    {(ten.mrrEgp / 1000).toFixed(0)}k EGP
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                data-testid={idx === 0 ? 'impersonate-btn-titanfit-cairo' : undefined}
                onClick={() => setImpersonatedTenant(ten.slug)}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-black text-slate-950 shadow-xs hover:from-amber-400 hover:to-amber-500"
              >
                {isAr ? 'دخول دعم مسجل (Impersonate)' : 'Audited Impersonate'}
              </button>
              <button
                type="button"
                onClick={() => copyCredentials(ten)}
                title={isAr ? 'نسخ بيانات الدخول' : 'Copy Credentials'}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeletingTenantId(ten.id)}
                title={isAr ? 'حذف النادي / إلغاء العقد' : 'Delete Tenant'}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Immutable Audit Logs Table */}
      <div className="theme-card overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isAr
                ? 'سجل التدقيق الأمني غير القابل للتعديل (Append-Only Audit Log)'
                : 'Append-Only Security Audit Log (trg_audit_logs_immutable)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? 'محمي بواسطة Trigger في PostgreSQL يمنع أي عملية UPDATE أو DELETE'
                : 'Protected by PostgreSQL BEFORE UPDATE OR DELETE trigger'}
            </p>
          </div>
          <span className="rounded-lg bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            FORCE RLS + IMMUTABLE
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 text-start">{isAr ? 'التوقيت' : 'Timestamp'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'المستخدم والدور' : 'Actor / Role'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'الحدث الأمني' : 'Action'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'التفاصيل' : 'Target Resource'}</th>
                <th className="px-4 py-3 text-start">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
              {auditLogs.map((aud) => (
                <tr key={aud.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono">{aud.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 dark:text-white">{aud.actorEmail}</span>{' '}
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-800 dark:bg-slate-800 dark:text-amber-400">
                      {aud.actorRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {aud.action}
                  </td>
                  <td className="px-4 py-3">{aud.target}</td>
                  <td className="px-4 py-3 font-mono">{aud.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal with White-Label Logo & Password */}
      {showAddTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="theme-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAr ? 'إضافة نادي / كوتش جديد للمنصة (White-Label SaaS)' : 'Onboard New Gym / Coach Tenant'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'إنشاء مساحة معزولة بهوية بصرية وشعار وبيانات دخول خاصة' : 'Provision isolated space with custom branding'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTenant(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'اسم النادي / الكوتش (بالعربية)' : 'Gym Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: باور جيم المعادي' : 'Power Gym Maadi'}
                    value={nameAr}
                    onChange={(e) => {
                      setNameAr(e.target.value);
                      if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'اسم النادي (بالإنجليزية)' : 'Gym Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Power Gym"
                    value={nameEn}
                    onChange={(e) => {
                      setNameEn(e.target.value);
                      if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'الرابط المخصص (Slug)' : 'Tenant Slug'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. power-gym"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'الباقة (SaaS Tier)' : 'Subscription Tier'}
                  </label>
                  <select
                    value={planTier}
                    onChange={(e) => setPlanTier(e.target.value as typeof planTier)}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="STARTER">{isAr ? 'STARTER (مدرب فردي)' : 'STARTER (Coach)'}</option>
                    <option value="PRO">{isAr ? 'PRO (نادي متوسط)' : 'PRO (Medium Gym)'}</option>
                    <option value="ENTERPRISE">{isAr ? 'ENTERPRISE (سلسلة أندية)' : 'ENTERPRISE (Multi-Branch)'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'اسم المستخدم / الإيميل للمالك' : 'Owner Email / Username'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@gym.eg"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'كلمة المرور الخاصة به' : 'Owner Password'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. gym2026"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الرقم السري لدخول المتدربين (Gym PIN Code)' : 'Gym Trainee PIN Code'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? "مثال: TF-XXXXXXXXXX (أو اتركه فارغاً لإنشائه تلقائياً)" : "e.g. TF-XXXXXXXXXX (or leave blank to auto-generate)"}
                  value={gymSecretCodeInput}
                  onChange={(e) => setGymSecretCodeInput(e.target.value.toUpperCase())}
                  className="theme-input mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono uppercase text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'شعار النادي (اختر من جهازك)' : 'Gym Logo (pick from your device)'}
                </label>
                <LogoPicker value={logoUrl} onChange={setLogoUrl} isAr={isAr} testId="add-tenant-logo" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'لون الهوية البصرية الرئيسية' : 'Brand Primary Color'}
                </label>
                <div className="mt-1.5 flex gap-2">
                  {[
                    { name: 'Gold', hex: '#D97706' },
                    { name: 'Emerald', hex: '#059669' },
                    { name: 'Blue', hex: '#2563EB' },
                    { name: 'Purple', hex: '#7C3AED' },
                    { name: 'Crimson', hex: '#E11D48' },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setPrimaryColor(c.hex)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-bold ${
                        primaryColor === c.hex
                          ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-800'
                          : 'border-slate-200'
                      }`}
                    >
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTenant(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-black text-slate-950 shadow-md"
                >
                  {isAr ? 'إنشاء العميل وإصدار بيانات الدخول' : 'Create Tenant & Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Tenant Confirmation Modal */}
      {deletingTenantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-white p-6 text-slate-900 shadow-2xl dark:border-rose-500/40 dark:bg-[#121623] dark:text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? 'تأكيد حذف النادي / المستأجر' : 'Confirm Gym Tenant Deletion'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'هل أنت متأكد من حذف هذا النادي نهائياً من المنصة وإلغاء حسابه؟'
                    : 'Are you sure you want to permanently remove this gym tenant?'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingTenantId(null)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTenant(deletingTenantId);
                  setDeletingTenantId(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-rose-700"
              >
                {isAr ? 'نعم، احذف النادي' : 'Yes, Delete Gym'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

