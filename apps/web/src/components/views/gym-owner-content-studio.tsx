'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Download,
  Dumbbell,
  FileText,
  Flame,
  FolderUp,
  Link2,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Utensils,
  Video,
} from 'lucide-react';
import {
  usePlatformStore,
  type CustomClubFileItem,
  type CustomNutritionRecipeItem,
  type CustomWorkoutVideoItem,
} from '../../lib/platform-store';
import { BuiltInWorkoutVideoPlayer } from '../builtin-workout-video-player';

function normalizeVideoUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  // Convert standard YouTube watch URLs or youtu.be links into embed URLs
  const ytMatch =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/) ||
    trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`;
  }
  return trimmed;
}

export function GymOwnerContentStudioView() {
  const {
    locale,
    currentUser,
    customWorkouts,
    customRecipes,
    customFiles,
    addCustomWorkout,
    deleteCustomWorkout,
    addCustomRecipe,
    deleteCustomRecipe,
    addCustomFile,
    deleteCustomFile,
    setActiveSection,
  } = usePlatformStore();

  const isAr = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'WORKOUTS' | 'RECIPES' | 'FILES'>('WORKOUTS');
  const [previewWorkoutId, setPreviewWorkoutId] = useState<string>(
    customWorkouts[0]?.id || '',
  );

  // --- Form 1: New Workout Video State ---
  const [wkTitleAr, setWkTitleAr] = useState('');
  const [wkTitleEn, setWkTitleEn] = useState('');
  const [wkCategoryAr, setWkCategoryAr] = useState('دفع علوي (Push)');
  const [wkSourceType, setWkSourceType] =
    useState<CustomWorkoutVideoItem['videoSourceType']>('BUILTIN_ANIMATION');
  const [wkVideoUrl, setWkVideoUrl] = useState('');
  const [wkThumbnailUrl, setWkThumbnailUrl] = useState(
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85',
  );
  const [wkMotionType, setWkMotionType] =
    useState<CustomWorkoutVideoItem['motionType']>('BENCH_PRESS');
  const [wkTargetMuscleAr, setWkTargetMuscleAr] = useState('الصدر الأوسط والعلوي والترايسبس');
  const [wkSets, setWkSets] = useState<number>(4);
  const [wkReps, setWkReps] = useState<string>('10 - 12');
  const [wkRestSec, setWkRestSec] = useState<number>(75);
  const [wkSafetyTipAr, setWkSafetyTipAr] = useState(
    'حافظ على ثبات لوحي الكتف وتحكم في النزول لمدة ٣ ثوانٍ.',
  );
  const [uploadedVideoFileName, setUploadedVideoFileName] = useState<string>('');

  // --- Form 2: New Nutrition Recipe State ---
  const [rcTitleAr, setRcTitleAr] = useState('');
  const [rcMealType, setRcMealType] = useState<CustomNutritionRecipeItem['mealType']>('LUNCH');
  const [rcImageUrl, setRcImageUrl] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=85',
  );
  const [rcProteinG, setRcProteinG] = useState<number>(45);
  const [rcCarbsG, setRcCarbsG] = useState<number>(50);
  const [rcFatsG, setRcFatsG] = useState<number>(12);
  const [rcPrepMin, setRcPrepMin] = useState<number>(20);
  const [rcIngredientsText, setRcIngredientsText] = useState(
    '200 جم صدور دجاج مشوية\n150 جم أرز بسمتي مسلوق\nطبق سلطة خضراء بالليمون',
  );
  const [rcStepsText, setRcStepsText] = useState(
    'تبل الدجاج بالليمون والثوم واشوه على الجريل.\nقدم الدجاج مع الأرز المسلوق والسلطة.',
  );
  const [rcEconomicAltAr, setRcEconomicAltAr] = useState(
    'بديل اقتصادي: علبة تونة مصفاة أو 200 جم سمك بلطي مشوي + بطاطس مسلوقة.',
  );

  // --- Form 3: New Club File / PDF State ---
  const [flTitleAr, setFlTitleAr] = useState('');
  const [flCategory, setFlCategory] = useState<CustomClubFileItem['category']>('WORKOUT_PDF');
  const [flDescriptionAr, setFlDescriptionAr] = useState('');
  const [flFileName, setFlFileName] = useState('');
  const [flFileSizeLabel, setFlFileSizeLabel] = useState('450 KB');
  const [flFileUrl, setFlFileUrl] = useState('');
  const [flFileType, setFlFileType] = useState('application/pdf');

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedVideoFileName(file.name);
    // Use URL.createObjectURL for instant smooth playback of large video files, or DataURL if small
    if (file.size <= 3 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setWkVideoUrl(reader.result);
          setWkSourceType('UPLOADED_FILE');
        }
      };
      reader.readAsDataURL(file);
    } else {
      const blobUrl = URL.createObjectURL(file);
      setWkVideoUrl(blobUrl);
      setWkSourceType('UPLOADED_FILE');
    }
  };

  const handleThumbnailUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClubDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFlFileName(file.name);
    setFlFileType(file.type || 'application/pdf');
    const kb = Math.max(1, Math.round(file.size / 1024));
    setFlFileSizeLabel(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
    if (file.size <= 4 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFlFileUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFlFileUrl(URL.createObjectURL(file));
    }
  };

  const handleAddWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wkTitleAr.trim()) return;
    const finalUrl =
      wkSourceType === 'VIDEO_URL' ? normalizeVideoUrl(wkVideoUrl) : wkVideoUrl;

    const created = addCustomWorkout({
      titleAr: wkTitleAr.trim(),
      titleEn: wkTitleEn.trim() || wkTitleAr.trim(),
      categoryAr: wkCategoryAr,
      categoryEn: wkCategoryAr,
      levelAr: 'جميع المستويات',
      levelEn: 'All Levels',
      durationMin: 35,
      kcalBurn: 340,
      coachAr: currentUser?.name || 'كابتن النادي',
      coachEn: currentUser?.name || 'Club Head Coach',
      videoSourceType: wkSourceType,
      videoUrl: finalUrl,
      thumbnailUrl: wkThumbnailUrl,
      motionType: wkMotionType,
      targetMuscleAr: wkTargetMuscleAr,
      targetMuscleEn: wkTargetMuscleAr,
      sets: Number(wkSets) || 4,
      reps: wkReps || '10 - 12',
      restSec: Number(wkRestSec) || 75,
      safetyTipAr: wkSafetyTipAr,
      safetyTipEn: wkSafetyTipAr,
      daySplit: 'PUSH',
    });

    setPreviewWorkoutId(created.id);
    setWkTitleAr('');
    setWkTitleEn('');
    setWkVideoUrl('');
    setUploadedVideoFileName('');
  };

  const handleAddRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rcTitleAr.trim()) return;
    const ingredients = rcIngredientsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const steps = rcStepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    addCustomRecipe({
      titleAr: rcTitleAr.trim(),
      titleEn: rcTitleAr.trim(),
      mealType: rcMealType,
      imageUrl: rcImageUrl,
      proteinG: Number(rcProteinG) || 30,
      carbsG: Number(rcCarbsG) || 40,
      fatsG: Number(rcFatsG) || 10,
      prepMin: Number(rcPrepMin) || 15,
      ingredientsAr: ingredients.length > 0 ? ingredients : ['مكونات صحية محسوبة بالجرام'],
      ingredientsEn: ingredients.length > 0 ? ingredients : ['Macro-balanced ingredients'],
      stepsAr: steps.length > 0 ? steps : ['تحضير صحي بدون دهون مهدرجة'],
      stepsEn: steps.length > 0 ? steps : ['Healthy preparation'],
      economicAltAr: rcEconomicAltAr,
      economicAltEn: rcEconomicAltAr,
    });

    setRcTitleAr('');
  };

  const handleAddFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flTitleAr.trim()) return;
    addCustomFile({
      titleAr: flTitleAr.trim(),
      titleEn: flTitleAr.trim(),
      category: flCategory,
      descriptionAr:
        flDescriptionAr.trim() ||
        'ملف إرشادي وجدول تدريبي/غذائي مرفوع من إدارة الجيم للمتدربين.',
      descriptionEn:
        flDescriptionAr.trim() || 'Club training & nutrition guide uploaded by gym management.',
      fileName: flFileName || `${flTitleAr.trim().replace(/\s+/g, '-')}.html`,
      fileSizeLabel: flFileSizeLabel || '350 KB',
      fileUrl: flFileUrl || '#builtin-club-guide',
      fileType: flFileType,
      uploadedBy: currentUser?.name || 'مالك الجيم',
    });

    setFlTitleAr('');
    setFlDescriptionAr('');
    setFlFileName('');
    setFlFileUrl('');
  };

  const previewWorkout =
    customWorkouts.find((w) => w.id === previewWorkoutId) ?? customWorkouts[0] ?? null;

  const autoCalculatedRecipeKcal = Math.round(
    (Number(rcProteinG) || 0) * 4 +
      (Number(rcCarbsG) || 0) * 4 +
      (Number(rcFatsG) || 0) * 9,
  );

  return (
    <div data-testid="gym-owner-content-studio-view" className="space-y-8 pb-16">
      {/* Studio Header Banner */}
      <div className="theme-card rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {isAr
                ? 'استوديو محتوى الجيم والكابتن (فيديوهات • روابط • وصفات • ملفات PDF)'
                : 'GYM OWNER CONTENT & MEDIA STUDIO'}
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              {isAr
                ? 'ارفع فيديوهات التمارين والوصفات الغذائية والملفات لمتدربيك بضغطة زر'
                : 'Upload Workout Videos, Healthy Recipes & PDF Guides for Your Members'}
            </h1>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
              {isAr
                ? 'أي فيديو تمرين (سواء ملف فيديو من جهازك، أو رابط يوتيوب، أو فيديو تشريحي متحرك مدمج) أو وصفة غذائية أو ملف PDF ترفعه هنا يظهر فوراً لجميع المتدربين في صفحة التدريب المجاني وفي تطبيق المتدرب (Member App)!'
                : 'Everything you publish here—uploaded MP4 videos, YouTube links, built-in animated exercises, macro-verified recipes, and downloadable PDFs—syncs immediately to the Free Training Hub and Member App.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('FREE_TRIAL_HUB')}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-xs hover:bg-emerald-500"
            >
              <Play className="h-4 w-4 fill-current" />
              {isAr ? 'معاينة في صفحة التدريب المجاني' : 'Preview in Free Hub'}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('MEMBER_PWA')}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              {isAr ? 'معاينة في تطبيق المتدرب' : 'Preview in Member App'}
            </button>
          </div>
        </div>

        {/* 3 Studio Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            data-testid="studio-tab-workouts"
            onClick={() => setActiveTab('WORKOUTS')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition ${
              activeTab === 'WORKOUTS'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Video className="h-4 w-4" />
            {isAr
              ? `🎬 فيديوهات التمارين والروابط (${customWorkouts.length})`
              : `🎬 Workout Videos (${customWorkouts.length})`}
          </button>

          <button
            type="button"
            data-testid="studio-tab-recipes"
            onClick={() => setActiveTab('RECIPES')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition ${
              activeTab === 'RECIPES'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Utensils className="h-4 w-4" />
            {isAr
              ? `🥗 الوصفات والأنظمة الغذائية (${customRecipes.length})`
              : `🥗 Nutrition Recipes (${customRecipes.length})`}
          </button>

          <button
            type="button"
            data-testid="studio-tab-files"
            onClick={() => setActiveTab('FILES')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition ${
              activeTab === 'FILES'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <FolderUp className="h-4 w-4" />
            {isAr
              ? `📄 ملفات الجيم وجداول الـ PDF (${customFiles.length})`
              : `📄 Downloadable Files (${customFiles.length})`}
          </button>
        </div>
      </div>

      {/* TAB 1: WORKOUT VIDEOS & LINKS MANAGEMENT */}
      {activeTab === 'WORKOUTS' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 5 Cols: Add / Upload Workout Video Form */}
          <form
            onSubmit={handleAddWorkoutSubmit}
            data-testid="add-custom-workout-form"
            className="theme-card space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5"
          >
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isAr ? '➕ إضافة أو رفع فيديو تمرين جديد' : '➕ Add / Upload Workout Video'}
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'عنوان التمرين (بالعربية) *' : 'Workout Title *'}
              </label>
              <input
                type="text"
                required
                data-testid="input-workout-title-ar"
                placeholder={
                  isAr
                    ? 'مثال: تمرين تفتيح صدر بالكابل + شرح الزاوية الصحيحة'
                    : 'e.g., Incline Dumbbell Press Masterclass'
                }
                value={wkTitleAr}
                onChange={(e) => setWkTitleAr(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Video Source Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'نوع الفيديو ومصدر التشغيل' : 'Video Source Type'}
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'BUILTIN_ANIMATION' as const,
                    labelAr: '🎬 فيديو متحرك مدمج',
                    labelEn: '🎬 Built-in Animation',
                  },
                  {
                    id: 'VIDEO_URL' as const,
                    labelAr: '🔗 رابط فيديو / يوتيوب',
                    labelEn: '🔗 YouTube / URL',
                  },
                  {
                    id: 'UPLOADED_FILE' as const,
                    labelAr: '📤 رفع ملف فيديو MP4',
                    labelEn: '📤 Upload MP4 File',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setWkSourceType(opt.id)}
                    className={`rounded-xl border px-2.5 py-2 text-[11px] font-black transition ${
                      wkSourceType === opt.id
                        ? 'border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {isAr ? opt.labelAr : opt.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {wkSourceType === 'VIDEO_URL' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr
                    ? 'رابط الفيديو (YouTube أو رابط MP4 مباشر)'
                    : 'Video URL (YouTube or direct MP4)'}
                </label>
                <input
                  type="url"
                  data-testid="input-workout-video-url"
                  placeholder="https://www.youtube.com/watch?v=... أو https://.../video.mp4"
                  value={wkVideoUrl}
                  onChange={(e) => setWkVideoUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            )}

            {wkSourceType === 'UPLOADED_FILE' && (
              <div className="rounded-2xl border border-dashed border-amber-500/50 bg-amber-500/5 p-4">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 text-center">
                  <Upload className="h-6 w-6 text-amber-500" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {uploadedVideoFileName
                      ? `✅ تم اختيار الملف: ${uploadedVideoFileName}`
                      : isAr
                        ? 'اضغط هنا لرفع ملف فيديو (MP4 / WebM) من جهازك'
                        : 'Click to upload MP4 / WebM video file'}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Biomechanical Motion Selector (Always available as built-in animated companion!) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الحركة التشريحية المدمجة' : 'Animated Biomechanical Motion'}
                </label>
                <select
                  value={wkMotionType}
                  onChange={(e) =>
                    setWkMotionType(e.target.value as CustomWorkoutVideoItem['motionType'])
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="BENCH_PRESS">ضغط صدر بالبار (Bench Press)</option>
                  <option value="INCLINE_PRESS">ضغط صدر عالي بالدمبل (Incline Press)</option>
                  <option value="CABLE_FLY">تفتيح صدر بالكابل (Cable Fly)</option>
                  <option value="LATERAL_RAISE">رفرفة كتف جانبي (Lateral Raise)</option>
                  <option value="TRICEPS_PUSHDOWN">ترايسبس بالحبل (Triceps Pushdown)</option>
                  <option value="LAT_PULLDOWN">سحب مجنص عالي (Lat Pulldown)</option>
                  <option value="BARBELL_ROW">تجديف ظهر بالبار (Barbell Row)</option>
                  <option value="BICEPS_CURL">بايسبس تبادل (Biceps Curl)</option>
                  <option value="BARBELL_SQUAT">سكوات خلفي بالبار (Barbell Squat)</option>
                  <option value="ROMANIAN_DEADLIFT">ديدليفت روماني (Romanian Deadlift)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'القسم العضلي' : 'Category'}
                </label>
                <input
                  type="text"
                  value={wkCategoryAr}
                  onChange={(e) => setWkCategoryAr(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'العضلات المستهدفة بدقة' : 'Target Muscles'}
              </label>
              <input
                type="text"
                value={wkTargetMuscleAr}
                onChange={(e) => setWkTargetMuscleAr(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {isAr ? 'المجموعات' : 'Sets'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={wkSets}
                  onChange={(e) => setWkSets(Number(e.target.value) || 4)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs font-black text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {isAr ? 'العدات' : 'Reps'}
                </label>
                <input
                  type="text"
                  value={wkReps}
                  onChange={(e) => setWkReps(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs font-black text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {isAr ? 'الراحة (ثانية)' : 'Rest (sec)'}
                </label>
                <input
                  type="number"
                  min={15}
                  max={300}
                  value={wkRestSec}
                  onChange={(e) => setWkRestSec(Number(e.target.value) || 60)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs font-black text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'صورة غلاف التمرين (رابط أو رفع من جهازك)' : 'Cover Image'}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={wkThumbnailUrl}
                  onChange={(e) => setWkThumbnailUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <label className="shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  📷 {isAr ? 'صورة' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e, setWkThumbnailUrl)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'نصيحة الأداء الصحيح وتجنب الإصابة' : 'Coach Form & Safety Tip'}
              </label>
              <textarea
                rows={2}
                value={wkSafetyTipAr}
                onChange={(e) => setWkSafetyTipAr(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              data-testid="submit-custom-workout-btn"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3.5 text-xs font-black text-slate-950 shadow-sm transition hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              {isAr
                ? 'نشر فيديو التمرين للمتدربين الآن'
                : 'Publish Workout Video to Hub'}
            </button>
          </form>

          {/* Right 7 Cols: Live Preview Player + List of Published Videos */}
          <div className="space-y-6 lg:col-span-7">
            {previewWorkout && (
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 dark:text-slate-400">
                  🎬 {isAr ? 'معاينة حية لمشغل الفيديو كما يظهر للمتدرب:' : 'Live Trainee Video Player Preview:'}
                </p>
                <BuiltInWorkoutVideoPlayer
                  titleAr={previewWorkout.titleAr}
                  titleEn={previewWorkout.titleEn}
                  coachAr={previewWorkout.coachAr}
                  coachEn={previewWorkout.coachEn}
                  motionType={previewWorkout.motionType}
                  targetMuscleAr={previewWorkout.targetMuscleAr}
                  targetMuscleEn={previewWorkout.targetMuscleEn}
                  sets={previewWorkout.sets}
                  reps={previewWorkout.reps}
                  restSec={previewWorkout.restSec}
                  safetyTipAr={previewWorkout.safetyTipAr}
                  safetyTipEn={previewWorkout.safetyTipEn}
                  thumbnailUrl={previewWorkout.thumbnailUrl}
                  videoSourceType={previewWorkout.videoSourceType}
                  videoUrl={previewWorkout.videoUrl}
                  isAr={isAr}
                />
              </div>
            )}

            <div className="theme-card rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isAr
                  ? `قائمة فيديوهات التمارين المنشورة (${customWorkouts.length})`
                  : `Published Workout Videos (${customWorkouts.length})`}
              </h3>
              <div className="mt-4 space-y-3">
                {customWorkouts.map((cw) => (
                  <div
                    key={cw.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={cw.thumbnailUrl}
                        alt={cw.titleAr}
                        className="h-14 w-20 shrink-0 rounded-xl object-cover"
                      />
                      <div>
                        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
                          {cw.videoSourceType === 'BUILTIN_ANIMATION'
                            ? isAr
                              ? 'فيديو متحرك مدمج'
                              : 'Built-in Animation'
                            : cw.videoSourceType === 'UPLOADED_FILE'
                              ? isAr
                                ? 'ملف فيديو مرفوع'
                                : 'Uploaded MP4'
                              : isAr
                                ? 'رابط يوتيوب/فيديو'
                                : 'Video Link'}
                        </span>
                        <h4 className="mt-1 text-xs font-black text-slate-900 dark:text-white">
                          {isAr ? cw.titleAr : cw.titleEn}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {cw.sets} Sets × {cw.reps} • Rest {cw.restSec}s
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewWorkoutId(cw.id)}
                        className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800"
                      >
                        {isAr ? 'معاينة' : 'Preview'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomWorkout(cw.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
                        title={isAr ? 'حذف التمرين' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HEALTHY NUTRITION RECIPES & DIET PLANS */}
      {activeTab === 'RECIPES' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleAddRecipeSubmit}
            data-testid="add-custom-recipe-form"
            className="theme-card space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5"
          >
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isAr ? '🥗 إضافة وصفة غذائية أو وجبة محسوبة' : '🥗 Add Healthy Nutrition Recipe'}
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'اسم الوجبة / الوصفة الصحية *' : 'Recipe Title *'}
              </label>
              <input
                type="text"
                required
                data-testid="input-recipe-title-ar"
                placeholder={
                  isAr
                    ? 'مثال: شيش طاووق مشوي بالزبادي مع أرز بسمتي وخضار'
                    : 'e.g., Grilled Chicken Skewers with Rice'
                }
                value={rcTitleAr}
                onChange={(e) => setRcTitleAr(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'توقيت الوجبة' : 'Meal Type'}
                </label>
                <select
                  value={rcMealType}
                  onChange={(e) =>
                    setRcMealType(e.target.value as CustomNutritionRecipeItem['mealType'])
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="BREAKFAST">{isAr ? 'فطور صباحي' : 'Breakfast'}</option>
                  <option value="LUNCH">{isAr ? 'غداء رئيسي' : 'Lunch'}</option>
                  <option value="DINNER">{isAr ? 'عشاء خفيف' : 'Dinner'}</option>
                  <option value="SNACK">{isAr ? 'سناك طاقة / قبل التمرين' : 'Snack'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'وقت التحضير (دقيقة)' : 'Prep Time (min)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={rcPrepMin}
                  onChange={(e) => setRcPrepMin(Number(e.target.value) || 15)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs font-black text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Macros with Live Unified Calorie Equation (4P + 4C + 9F) */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                  {isAr ? 'الماكروز (حساب السعرات الموحد 4P + 4C + 9F):' : 'Macros (Unified 4P+4C+9F):'}
                </span>
                <span className="font-mono text-sm font-black text-emerald-700 dark:text-emerald-300">
                  ≈ {autoCalculatedRecipeKcal} kcal
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {isAr ? 'بروتين (جم)' : 'Protein (g)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={rcProteinG}
                    onChange={(e) => setRcProteinG(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs font-black text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {isAr ? 'نشويات (جم)' : 'Carbs (g)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={rcCarbsG}
                    onChange={(e) => setRcCarbsG(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs font-black text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {isAr ? 'دهون صحية (جم)' : 'Fats (g)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={150}
                    value={rcFatsG}
                    onChange={(e) => setRcFatsG(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs font-black text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'صورة الطبق (رابط أو رفع من جهازك)' : 'Dish Photo'}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={rcImageUrl}
                  onChange={(e) => setRcImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <label className="shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  📷 {isAr ? 'صورة' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e, setRcImageUrl)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'المكونات بالجرام (كل مكون في سطر)' : 'Ingredients (one per line)'}
              </label>
              <textarea
                rows={3}
                value={rcIngredientsText}
                onChange={(e) => setRcIngredientsText(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'البديل الاقتصادي للمتدربين' : 'Egyptian Budget Swap'}
              </label>
              <input
                type="text"
                value={rcEconomicAltAr}
                onChange={(e) => setRcEconomicAltAr(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              data-testid="submit-custom-recipe-btn"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              {isAr ? 'إضافة الوصفة الغذائية للمتدربين الآن' : 'Publish Nutrition Recipe'}
            </button>
          </form>

          {/* Right 7 Cols: Recipes Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {customRecipes.map((r) => (
              <div
                key={r.id}
                className="theme-card flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-900">
                    <img
                      src={r.imageUrl}
                      alt={r.titleAr}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-2.5 start-2.5 rounded-lg bg-slate-950/85 px-2.5 py-1 font-mono text-xs font-black text-emerald-400">
                      ≈ {r.kcal} kcal • {r.proteinG}g P / {r.carbsG}g C / {r.fatsG}g F
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-black text-slate-900 dark:text-white">
                    {isAr ? r.titleAr : r.titleEn}
                  </h3>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {(isAr ? r.ingredientsAr : r.ingredientsEn).map((ing, idx) => (
                      <li key={idx}>• {ing}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    ⏱️ {r.prepMin} {isAr ? 'دقيقة تحضير' : 'min prep'}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteCustomRecipe(r.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {isAr ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: UPLOADABLE CLUB FILES, PDFS & WORKOUT SHEETS */}
      {activeTab === 'FILES' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleAddFileSubmit}
            data-testid="add-custom-file-form"
            className="theme-card space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5"
          >
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isAr ? '📄 رفع ملف جديد أو جدول PDF للمتدربين' : '📄 Upload Club File / PDF Guide'}
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'عنوان الملف أو الدليل *' : 'File Title *'}
              </label>
              <input
                type="text"
                required
                data-testid="input-file-title-ar"
                placeholder={
                  isAr
                    ? 'مثال: جدول تمارين التنشيف المنزلي (PDF) + قائمة المشتريات'
                    : 'e.g., 8-Week Shred Workout & Grocery Sheet (PDF)'
                }
                value={flTitleAr}
                onChange={(e) => setFlTitleAr(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'تصنيف الملف' : 'File Category'}
              </label>
              <select
                value={flCategory}
                onChange={(e) =>
                  setFlCategory(e.target.value as CustomClubFileItem['category'])
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="WORKOUT_PDF">{isAr ? 'جدول تدريبي (Workout PDF)' : 'Workout PDF'}</option>
                <option value="DIET_PDF">{isAr ? 'نظام غذائي وبدائل (Diet PDF)' : 'Diet PDF'}</option>
                <option value="GUIDE">{isAr ? 'دليل شامل للمتدربين (Guide)' : 'Coaching Guide'}</option>
                <option value="VIDEO_PACK">{isAr ? 'حقيبة فيديوهات أو روابط' : 'Video Pack'}</option>
              </select>
            </div>

            <div className="rounded-2xl border border-dashed border-sky-500/50 bg-sky-500/5 p-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 text-center">
                <FolderUp className="h-6 w-6 text-sky-500" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {flFileName
                    ? `✅ تم إرفاق الملف: ${flFileName} (${flFileSizeLabel})`
                    : isAr
                      ? 'اضغط هنا لرفع ملف (PDF / Word / صورة / جدول) من جهازك'
                      : 'Click to upload PDF / Doc / Image from your device'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.html,.txt"
                  onChange={handleClubDocUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr
                  ? 'أو ضع رابط مباشر للملف (Google Drive / PDF Link - اختياري)'
                  : 'Or paste direct file link (optional)'}
              </label>
              <input
                type="text"
                placeholder="https://drive.google.com/..."
                value={flFileUrl}
                onChange={(e) => setFlFileUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'وصف مختصر لما يحتويه الملف' : 'File Description'}
              </label>
              <textarea
                rows={2}
                value={flDescriptionAr}
                onChange={(e) => setFlDescriptionAr(e.target.value)}
                placeholder={
                  isAr
                    ? 'اشرح للمتدرب كيف يستفيد من هذا الملف بعد تحميله...'
                    : 'Describe how members should use this file...'
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              data-testid="submit-custom-file-btn"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3.5 text-xs font-black text-white shadow-sm transition hover:bg-sky-500"
            >
              <Upload className="h-4 w-4" />
              {isAr ? 'رفع الملف وإتاحته لتحميل المتدربين' : 'Upload File for Members'}
            </button>
          </form>

          {/* Right 7 Cols: Uploaded Files List */}
          <div className="space-y-4 lg:col-span-7">
            {customFiles.map((file) => (
              <div
                key={file.id}
                className="theme-card flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {file.category}
                    </span>
                    <h3 className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                      {isAr ? file.titleAr : file.titleEn}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {isAr ? file.descriptionAr : file.descriptionEn}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">
                      {file.fileName} • {file.fileSizeLabel} • {file.uploadedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => deleteCustomFile(file.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isAr ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
