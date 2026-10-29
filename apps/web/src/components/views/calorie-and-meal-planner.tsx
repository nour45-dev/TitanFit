'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calculator, ChevronDown, Clock, Download, Droplets, Flame, Gift } from 'lucide-react';
import { usePlatformStore } from '../../lib/platform-store';
import {
  ACTIVITY_LEVELS,
  INGREDIENTS,
  MEAL_LABELS,
  MEAL_ORDER,
  calcNutrition,
  mealBudget,
  recipesFor,
  sanitizeCalcInput,
  scaleRecipeToKcal,
  type Gender,
  type Goal,
  type MealType,
} from '../../lib/nutrition';
import { downloadDayPlanPdf, downloadRecipePdf } from '../../lib/pdf-docs';

const inputCls =
  'mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none';

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export function CalorieAndMealPlanner({ onOpenFreeTrialHub }: { onOpenFreeTrialHub?: () => void }) {
  const { locale, showToast } = usePlatformStore();
  const isAr = locale === 'ar';
  const g = isAr ? 'جم' : 'g';

  const [gender, setGender] = useState<Gender>('MALE');
  const [age, setAge] = useState('27');
  const [weight, setWeight] = useState('86');
  const [height, setHeight] = useState('176');
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState<Goal>('CUT');

  const [picked, setPicked] = useState<Record<MealType, string>>(() => ({
    BREAKFAST: recipesFor('BREAKFAST')[0]!.id,
    LUNCH: recipesFor('LUNCH')[0]!.id,
    SNACK: recipesFor('SNACK')[0]!.id,
    DINNER: recipesFor('DINNER')[0]!.id,
  }));
  const [open, setOpen] = useState<MealType | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const rawInput = {
    gender,
    age: Number(age),
    weightKg: Number(weight),
    heightCm: Number(height),
    activity,
    goal,
  };
  const clean = sanitizeCalcInput(rawInput);
  const adjusted =
    clean.age !== Number(age) || clean.weightKg !== Number(weight) || clean.heightCm !== Number(height);
  const t = useMemo(() => calcNutrition(rawInput), [gender, age, weight, height, activity, goal]); // eslint-disable-line react-hooks/exhaustive-deps

  const plan = MEAL_ORDER.map((meal) => {
    const recipe = recipesFor(meal).find((r) => r.id === picked[meal]) ?? recipesFor(meal)[0]!;
    return { meal, scaled: scaleRecipeToKcal(recipe, mealBudget(t, meal)) };
  });
  const planKcal = plan.reduce((a, x) => a + x.scaled.macros.kcal, 0);
  const planProtein = plan.reduce((a, x) => a + x.scaled.macros.proteinG, 0);
  const diffPct = pct(Math.abs(planKcal - t.kcal), t.kcal);

  const run = async (key: string, fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
      showToast(isAr ? '✅ تم تنزيل ملف PDF بنجاح' : '✅ PDF downloaded successfully');
    } catch {
      showToast(isAr ? 'تعذّر إنشاء الملف. حدّث الصفحة وحاول مرة أخرى.' : 'Could not create the file. Refresh and try again.');
    } finally {
      setBusy(null);
    }
  };

  const goalLabel =
    goal === 'CUT'
      ? isAr ? 'تنشيف (−20% من سعرات الثبات)' : 'Fat loss (−20% of maintenance)'
      : goal === 'BULK'
        ? isAr ? 'تضخيم (+10% من سعرات الثبات)' : 'Muscle gain (+10% of maintenance)'
        : isAr ? 'ثبات الوزن' : 'Maintain weight';

  return (
    <>
      {/* ======================= CALCULATOR ======================= */}
      <section
        id="free-calorie-calculator"
        data-testid="free-calorie-calculator"
        className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold text-slate-800">
              <Calculator className="h-3.5 w-3.5 text-amber-500" />
              {isAr ? 'أداة علمية مجانية 100%' : 'FREE SCIENTIFIC CALCULATOR'}
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              {isAr ? 'احسب سعراتك وماكروزك بدقة' : 'Calculate Your Exact Calories & Macros'}
            </h2>
            <p className="text-xs leading-relaxed text-slate-600">
              {isAr
                ? 'نستخدم معادلة Mifflin-St Jeor (الأدق للأصحاء) مع معامل النشاط، ثم نضبط الهدف كنسبة من احتياجك. أدخل بياناتك وستتحدث النتائج والوجبات فوراً.'
                : 'We use the Mifflin-St Jeor equation with your activity factor and set your goal as a percentage of your needs. Results and meals update instantly.'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">{isAr ? 'النوع' : 'Gender'}</label>
                <select
                  data-testid="calc-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className={inputCls}
                >
                  <option value="MALE">{isAr ? 'ذكر' : 'Male'}</option>
                  <option value="FEMALE">{isAr ? 'أنثى' : 'Female'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">{isAr ? 'السن (سنة)' : 'Age (years)'}</label>
                <input
                  data-testid="calc-age"
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">{isAr ? 'الوزن (كجم)' : 'Weight (kg)'}</label>
                <input
                  data-testid="calc-weight"
                  type="number"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">{isAr ? 'الطول (سم)' : 'Height (cm)'}</label>
                <input
                  data-testid="calc-height"
                  type="number"
                  inputMode="numeric"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">{isAr ? 'مستوى النشاط' : 'Activity level'}</label>
                <select
                  data-testid="calc-activity"
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className={inputCls}
                >
                  {ACTIVITY_LEVELS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {isAr ? a.ar : a.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">{isAr ? 'هدفك' : 'Your goal'}</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {(
                  [
                    ['CUT', isAr ? 'تنشيف' : 'Cut'],
                    ['MAINTAIN', isAr ? 'ثبات' : 'Maintain'],
                    ['BULK', isAr ? 'تضخيم' : 'Bulk'],
                  ] as Array<[Goal, string]>
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    data-testid={`calc-goal-${val}`}
                    onClick={() => setGoal(val)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-black transition ${
                      goal === val
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {adjusted && (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
                {isAr
                  ? `تم ضبط القيم تلقائياً لنطاق منطقي: السن ${clean.age} • الوزن ${clean.weightKg} كجم • الطول ${clean.heightCm} سم.`
                  : `Values were adjusted to a realistic range: age ${clean.age} • ${clean.weightKg} kg • ${clean.heightCm} cm.`}
              </p>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-xl sm:p-7" data-testid="calc-results">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold text-slate-400">{goalLabel}</p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span data-testid="calc-result-kcal" className="font-mono text-5xl font-black tracking-tight text-amber-400">
                      {t.kcal.toLocaleString('en-US')}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{isAr ? 'سعر حراري / يوم' : 'kcal / day'}</span>
                  </p>
                </div>
                <Flame className="h-8 w-8 shrink-0 text-amber-400" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { v: t.bmr.toLocaleString('en-US'), l: isAr ? 'الأيض الأساسي BMR' : 'BMR' },
                  { v: t.tdee.toLocaleString('en-US'), l: isAr ? 'سعرات الثبات TDEE' : 'Maintenance' },
                  { v: `${t.bmi}`, l: `BMI • ${isAr ? t.bmiLabelAr : t.bmiLabelEn}` },
                ].map((c) => (
                  <div key={c.l} className="rounded-xl bg-white/5 px-2 py-2.5">
                    <p className="font-mono text-sm font-black text-white">{c.v}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{c.l}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { l: isAr ? 'بروتين' : 'Protein', gr: t.proteinG, kc: t.proteinG * 4, c: 'bg-emerald-400' },
                  { l: isAr ? 'كربوهيدرات' : 'Carbs', gr: t.carbsG, kc: t.carbsG * 4, c: 'bg-sky-400' },
                  { l: isAr ? 'دهون' : 'Fats', gr: t.fatsG, kc: t.fatsG * 9, c: 'bg-amber-400' },
                ].map((m) => (
                  <div key={m.l}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200">{m.l}</span>
                      <span className="font-mono text-white">
                        {m.gr} {g} <span className="text-slate-400">({pct(m.kc, t.kcal)}%)</span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${m.c}`} style={{ width: `${Math.min(100, pct(m.kc, t.kcal))}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
                  <Droplets className="h-4 w-4 text-sky-400" />
                  <span>
                    {t.waterL} {isAr ? 'لتر ماء' : 'L water'}
                  </span>
                </div>
                <div className="rounded-xl bg-white/5 px-3 py-2.5">
                  {t.fiberG} {g} {isAr ? 'ألياف' : 'fibre'}
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
                {t.flooredForSafety
                  ? isAr
                    ? '⚠️ تم رفع السعرات للحد الأدنى الآمن حتى لا يكون العجز مبالغاً فيه. لا تنزل عنه دون إشراف طبي.'
                    : '⚠️ Calories were raised to the minimum safe level so the deficit is not excessive. Do not go lower without medical supervision.'
                  : t.adjustmentKcal === 0
                    ? isAr ? 'هذا هو احتياجك للحفاظ على وزنك الحالي.' : 'This is what you need to maintain your current weight.'
                    : isAr
                      ? `الفرق عن سعرات الثبات: ${t.adjustmentKcal > 0 ? '+' : ''}${t.adjustmentKcal} سعر يومياً.`
                      : `Difference vs maintenance: ${t.adjustmentKcal > 0 ? '+' : ''}${t.adjustmentKcal} kcal/day.`}{' '}
                {isAr
                  ? 'النتائج تقديرية للأصحاء ولا تغني عن استشارة مختص.'
                  : 'Results are estimates for healthy adults and not medical advice.'}
              </p>
            </div>

            {onOpenFreeTrialHub && (
              <button
                type="button"
                onClick={onOpenFreeTrialHub}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-800 transition hover:bg-slate-50"
              >
                <Gift className="h-4 w-4 text-amber-500" />
                {isAr ? 'جرّب التمارين بالفيديو والأنظمة الغذائية المجانية ←' : 'Try the free video workouts & meal plans →'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ======================= MEAL PLANNER ======================= */}
      <section id="recipes-section" data-testid="meal-planner" className="scroll-mt-24 space-y-6">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            {isAr ? 'وصفات مبنية على سعراتك' : 'RECIPES BUILT ON YOUR CALORIES'}
          </span>
          <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            {isAr ? `وجباتك اليوم — ${t.kcal.toLocaleString('en-US')} سعر` : `Your meals today — ${t.kcal.toLocaleString('en-US')} kcal`}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            {isAr
              ? 'كل وصفة تُضبط كمياتها تلقائياً لتناسب حصة الوجبة من سعراتك (فطار 25% • غداء 35% • سناك 15% • عشاء 25%). اختر الطبق الذي يعجبك، افتح التفاصيل وطريقة التحضير، أو نزّلها PDF.'
              : 'Each recipe is auto-scaled to its share of your calories (breakfast 25% • lunch 35% • snack 15% • dinner 25%). Pick a dish, open the details & method, or download it as PDF.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {plan.map(({ meal, scaled }) => {
            const label = MEAL_LABELS[meal];
            const isOpen = open === meal;
            const r = scaled.recipe;
            return (
              <div
                key={meal}
                data-testid={`meal-slot-${meal}`}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-2xs sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-800">
                    <span>{label.emoji}</span>
                    {isAr ? label.ar : label.en}
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      • {mealBudget(t, meal)} kcal
                    </span>
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {recipesFor(meal).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`meal-pick-${opt.id}`}
                      onClick={() => setPicked((p) => ({ ...p, [meal]: opt.id }))}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                        picked[meal] === opt.id
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {opt.emoji} {isAr ? opt.titleAr : opt.titleEn}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                    {r.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black leading-snug text-slate-900">{isAr ? r.titleAr : r.titleEn}</h3>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Clock className="h-3 w-3 text-amber-500" />
                      {isAr
                        ? `تحضير ${r.prepMin} د${r.cookMin ? ` • طهي ${r.cookMin} د` : ''}`
                        : `Prep ${r.prepMin} min${r.cookMin ? ` • Cook ${r.cookMin} min` : ''}`}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl bg-slate-950 px-1 py-2 text-white">
                    <p data-testid={`meal-kcal-${meal}`} className="font-mono text-sm font-black text-amber-400">
                      {scaled.macros.kcal}
                    </p>
                    <p className="text-[9px] font-semibold text-slate-400">kcal</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-1 py-2">
                    <p className="font-mono text-sm font-black text-emerald-600">{scaled.macros.proteinG}</p>
                    <p className="text-[9px] font-semibold text-slate-500">{isAr ? 'بروتين' : 'Protein'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-1 py-2">
                    <p className="font-mono text-sm font-black text-sky-600">{scaled.macros.carbsG}</p>
                    <p className="text-[9px] font-semibold text-slate-500">{isAr ? 'كارب' : 'Carbs'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-1 py-2">
                    <p className="font-mono text-sm font-black text-amber-600">{scaled.macros.fatsG}</p>
                    <p className="text-[9px] font-semibold text-slate-500">{isAr ? 'دهون' : 'Fats'}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    data-testid={`meal-details-btn-${meal}`}
                    onClick={() => setOpen(isOpen ? null : meal)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-black text-slate-800 transition hover:bg-slate-50"
                  >
                    {isAr ? 'المكونات وطريقة التحضير' : 'Ingredients & method'}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    type="button"
                    data-testid={`meal-pdf-btn-${meal}`}
                    disabled={busy !== null}
                    onClick={() => run(`r-${meal}`, () => downloadRecipePdf(scaled, isAr, t))}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {busy === `r-${meal}` ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : isAr ? 'تنزيل PDF' : 'Download PDF'}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                      data-testid={`meal-details-${meal}`}
                    >
                      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 text-xs">
                        <div>
                          <h4 className="font-black text-slate-900">{isAr ? 'المكونات (حصة واحدة)' : 'Ingredients (1 serving)'}</h4>
                          <ul className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-100">
                            {scaled.ingredients.map((ing) => {
                              const n = INGREDIENTS[ing.key]!;
                              return (
                                <li key={ing.key} className="flex items-center justify-between gap-2 px-3 py-2">
                                  <span className="font-semibold text-slate-800">{isAr ? n.ar : n.en}</span>
                                  <span className="font-mono text-[11px] font-bold text-slate-600">
                                    {ing.grams} {g} • {Math.round((n.kcal * ing.grams) / 100)} kcal
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900">{isAr ? 'طريقة التحضير' : 'Method'}</h4>
                          <ol className="mt-2 space-y-2">
                            {(isAr ? r.stepsAr : r.stepsEn).map((s, i) => (
                              <li key={i} className="flex gap-2.5 leading-relaxed text-slate-700">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">
                                  {i + 1}
                                </span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <p className="rounded-xl bg-amber-50 px-3 py-2 font-semibold leading-relaxed text-amber-900">
                          💡 {isAr ? r.tipAr : r.tipEn}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-bold text-slate-700">
            <p>
              {isAr ? 'إجمالي خطة اليوم:' : 'Plan total:'}{' '}
              <span data-testid="plan-total-kcal" className="font-mono text-base font-black text-slate-900">
                {planKcal.toLocaleString('en-US')}
              </span>{' '}
              kcal • {planProtein} {g} {isAr ? 'بروتين' : 'protein'}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
              {isAr
                ? `الفرق عن هدفك ${diffPct}% فقط (تقريب الكميات لأقرب 5 جم)`
                : `Only ${diffPct}% away from your target (portions rounded to the nearest 5 g)`}
            </p>
          </div>
          <button
            type="button"
            data-testid="dayplan-pdf-btn"
            disabled={busy !== null}
            onClick={() => run('day', () => downloadDayPlanPdf(t, plan, isAr))}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            <Download className="h-4 w-4 text-amber-400" />
            {busy === 'day'
              ? isAr ? 'جاري الإنشاء...' : 'Creating...'
              : isAr ? 'تنزيل خطة اليوم كاملة PDF (بالمكونات والتحضير)' : 'Download full-day plan PDF (with method)'}
          </button>
        </div>
      </section>
    </>
  );
}
