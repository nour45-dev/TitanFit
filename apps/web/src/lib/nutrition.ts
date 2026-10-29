/**
 * TitanFit nutrition engine.
 * - Calorie / macro calculator (Mifflin-St Jeor + activity factor + goal adjustment, with safety floors)
 * - Ingredient database (values per 100 g, raw weights unless noted)
 * - Recipes whose calories/macros are COMPUTED from their ingredients (never typed by hand)
 * - Portion scaling so a recipe can be matched to a target calorie budget
 */

export type Gender = 'MALE' | 'FEMALE';
export type Goal = 'CUT' | 'MAINTAIN' | 'BULK';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER';

export interface CalcInput {
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: number;
  goal: Goal;
}

export interface Macros {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

export interface NutritionTargets extends Macros {
  bmr: number;
  tdee: number;
  fiberG: number;
  waterL: number;
  bmi: number;
  bmiLabelAr: string;
  bmiLabelEn: string;
  adjustmentKcal: number;
  flooredForSafety: boolean;
}

export const ACTIVITY_LEVELS: Array<{ value: number; ar: string; en: string }> = [
  { value: 1.2, ar: 'خامل (عمل مكتبي بدون تمرين)', en: 'Sedentary (desk job, no exercise)' },
  { value: 1.375, ar: 'نشاط خفيف (تمرين 1–3 أيام أسبوعياً)', en: 'Light (exercise 1–3 days/week)' },
  { value: 1.55, ar: 'نشاط متوسط (تمرين 3–5 أيام أسبوعياً)', en: 'Moderate (exercise 3–5 days/week)' },
  { value: 1.725, ar: 'نشاط عالٍ (تمرين 6–7 أيام أسبوعياً)', en: 'High (exercise 6–7 days/week)' },
  { value: 1.9, ar: 'نشاط شديد (رياضي محترف أو عمل بدني شاق)', en: 'Very high (athlete / physical job)' },
];

const clamp = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

/** Keeps inputs inside physiologically meaningful ranges so results are never absurd. */
export function sanitizeCalcInput(i: CalcInput): CalcInput {
  return {
    gender: i.gender,
    age: Math.round(clamp(i.age, 14, 90)),
    weightKg: clamp(i.weightKg, 30, 250),
    heightCm: clamp(i.heightCm, 120, 230),
    activity: i.activity,
    goal: i.goal,
  };
}

export function calcNutrition(raw: CalcInput): NutritionTargets {
  const i = sanitizeCalcInput(raw);

  // Mifflin-St Jeor (the most validated predictive equation for healthy adults)
  const bmr =
    10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age + (i.gender === 'MALE' ? 5 : -161);
  const tdee = bmr * i.activity;

  // Goal adjustment as a percentage of TDEE (scales with the person, not a flat number)
  const factor = i.goal === 'CUT' ? 0.8 : i.goal === 'BULK' ? 1.1 : 1;
  let kcal = tdee * factor;

  // Safety floor: never prescribe below the common clinical minimum or 90% of BMR
  const clinicalFloor = i.gender === 'MALE' ? 1500 : 1200;
  const floor = Math.max(clinicalFloor, bmr * 0.9);
  let flooredForSafety = false;
  if (i.goal === 'CUT' && kcal < floor) {
    kcal = floor;
    flooredForSafety = true;
  }
  kcal = Math.round(kcal);

  // Protein by body weight (g/kg), capped at 35% of calories
  const proteinPerKg = i.goal === 'CUT' ? 2.2 : i.goal === 'BULK' ? 2.0 : 1.8;
  let proteinG = Math.round(i.weightKg * proteinPerKg);
  proteinG = Math.min(proteinG, Math.round((kcal * 0.35) / 4));

  // Fat: 0.8–0.9 g/kg but never below 20% of calories (hormonal health)
  const fatPerKg = i.goal === 'CUT' ? 0.8 : 0.9;
  let fatsG = Math.round(i.weightKg * fatPerKg);
  fatsG = Math.max(fatsG, Math.round((kcal * 0.2) / 9));

  // Carbs: whatever calories remain
  const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatsG * 9) / 4));

  const heightM = i.heightCm / 100;
  const bmi = Math.round((i.weightKg / (heightM * heightM)) * 10) / 10;
  const [bmiLabelAr, bmiLabelEn] =
    bmi < 18.5
      ? ['نحافة', 'Underweight']
      : bmi < 25
        ? ['وزن طبيعي', 'Healthy weight']
        : bmi < 30
          ? ['زيادة وزن', 'Overweight']
          : ['سمنة', 'Obesity'];

  return {
    kcal,
    proteinG,
    carbsG,
    fatsG,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    fiberG: Math.round((14 * kcal) / 1000),
    waterL: Math.round((i.weightKg * 0.035 + (i.activity >= 1.725 ? 0.5 : 0)) * 10) / 10,
    bmi,
    bmiLabelAr,
    bmiLabelEn,
    adjustmentKcal: kcal - Math.round(tdee),
    flooredForSafety,
  };
}

/* ------------------------------------------------------------------ */
/* Ingredient database — per 100 g (USDA-style reference values)       */
/* ------------------------------------------------------------------ */

interface Nutrient {
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export const INGREDIENTS: Record<string, Nutrient & { ar: string; en: string }> = {
  chicken: { ar: 'صدور دجاج (نيئة)', en: 'Chicken breast (raw)', kcal: 120, p: 22.5, c: 0, f: 2.6 },
  beef: { ar: 'لحم بقري قليل الدهن (نيء)', en: 'Lean beef (raw)', kcal: 135, p: 21, c: 0, f: 5 },
  tilapia: { ar: 'سمك بلطي (نيء)', en: 'Tilapia (raw)', kcal: 96, p: 20, c: 0, f: 1.7 },
  liver: { ar: 'كبدة دجاج (نيئة)', en: 'Chicken liver (raw)', kcal: 119, p: 17, c: 0.7, f: 4.8 },
  tuna: { ar: 'تونة معلبة بالماء (مصفاة)', en: 'Canned tuna in water', kcal: 116, p: 26, c: 0, f: 0.8 },
  egg: { ar: 'بيض كامل', en: 'Whole egg', kcal: 143, p: 12.6, c: 0.7, f: 9.5 },
  eggwhite: { ar: 'بياض بيض', en: 'Egg whites', kcal: 52, p: 10.9, c: 0.7, f: 0.2 },
  cottage: { ar: 'جبنة قريش قليلة الدسم', en: 'Low-fat cottage cheese', kcal: 72, p: 12, c: 2.7, f: 1 },
  yogurt: { ar: 'زبادي يوناني خالي الدسم', en: 'Fat-free Greek yogurt', kcal: 59, p: 10, c: 3.6, f: 0.4 },
  milk: { ar: 'لبن خالي الدسم', en: 'Skim milk', kcal: 34, p: 3.4, c: 5, f: 0.1 },
  oats: { ar: 'شوفان (جاف)', en: 'Rolled oats (dry)', kcal: 380, p: 13, c: 67, f: 7 },
  rice: { ar: 'أرز أبيض (نيء)', en: 'White rice (raw)', kcal: 360, p: 7, c: 79, f: 0.6 },
  pasta: { ar: 'مكرونة قمح كامل (جافة)', en: 'Whole-wheat pasta (dry)', kcal: 355, p: 13, c: 72, f: 2.5 },
  baladi: { ar: 'عيش بلدي', en: 'Baladi bread', kcal: 270, p: 9, c: 55, f: 1.5 },
  fava: { ar: 'فول مدمس (مطبوخ)', en: 'Cooked fava beans', kcal: 110, p: 7.6, c: 19.6, f: 0.4 },
  chickpeas: { ar: 'حمص (مطبوخ)', en: 'Cooked chickpeas', kcal: 164, p: 8.9, c: 27, f: 2.6 },
  lentils: { ar: 'عدس أصفر (جاف)', en: 'Yellow lentils (dry)', kcal: 352, p: 25, c: 63, f: 1.1 },
  potato: { ar: 'بطاطس', en: 'Potato', kcal: 77, p: 2, c: 17, f: 0.1 },
  sweetpotato: { ar: 'بطاطا', en: 'Sweet potato', kcal: 86, p: 1.6, c: 20, f: 0.1 },
  banana: { ar: 'موز', en: 'Banana', kcal: 89, p: 1.1, c: 23, f: 0.3 },
  dates: { ar: 'تمر', en: 'Dates', kcal: 282, p: 2.5, c: 75, f: 0.4 },
  almonds: { ar: 'لوز', en: 'Almonds', kcal: 579, p: 21, c: 22, f: 50 },
  peanutbutter: { ar: 'زبدة فول سوداني', en: 'Peanut butter', kcal: 588, p: 25, c: 20, f: 50 },
  oliveoil: { ar: 'زيت زيتون', en: 'Olive oil', kcal: 884, p: 0, c: 0, f: 100 },
  tomato: { ar: 'طماطم', en: 'Tomato', kcal: 18, p: 0.9, c: 3.9, f: 0.2 },
  cucumber: { ar: 'خيار', en: 'Cucumber', kcal: 15, p: 0.7, c: 3.6, f: 0.1 },
  onion: { ar: 'بصل', en: 'Onion', kcal: 40, p: 1.1, c: 9.3, f: 0.1 },
  lettuce: { ar: 'خس', en: 'Lettuce', kcal: 15, p: 1.4, c: 2.9, f: 0.2 },
  broccoli: { ar: 'بروكلي', en: 'Broccoli', kcal: 34, p: 2.8, c: 7, f: 0.4 },
  zucchini: { ar: 'كوسة', en: 'Zucchini', kcal: 17, p: 1.2, c: 3.1, f: 0.3 },
};

export interface RecipeIngredient {
  key: keyof typeof INGREDIENTS;
  grams: number;
  /** Friendly household measure shown next to the grams, e.g. "حبتين". */
  noteAr?: string;
  noteEn?: string;
}

export interface Recipe {
  id: string;
  meal: MealType;
  emoji: string;
  titleAr: string;
  titleEn: string;
  prepMin: number;
  cookMin: number;
  servings: 1;
  ingredients: RecipeIngredient[];
  stepsAr: string[];
  stepsEn: string[];
  tipAr: string;
  tipEn: string;
}

export const MEAL_LABELS: Record<MealType, { ar: string; en: string; emoji: string; share: number }> = {
  BREAKFAST: { ar: 'الفطار', en: 'Breakfast', emoji: '🍳', share: 0.25 },
  LUNCH: { ar: 'الغداء', en: 'Lunch', emoji: '🍗', share: 0.35 },
  SNACK: { ar: 'سناك', en: 'Snack', emoji: '🥜', share: 0.15 },
  DINNER: { ar: 'العشاء', en: 'Dinner', emoji: '🥗', share: 0.25 },
};

export const MEAL_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];

export const RECIPES: Recipe[] = [
  {
    id: 'oats-banana-yogurt',
    meal: 'BREAKFAST',
    emoji: '🥣',
    titleAr: 'شوفان بالموز والزبادي اليوناني',
    titleEn: 'Banana Greek-Yogurt Oats',
    prepMin: 5,
    cookMin: 5,
    servings: 1,
    ingredients: [
      { key: 'oats', grams: 60, noteAr: '٦ ملاعق كبيرة تقريباً', noteEn: '≈ 6 tbsp' },
      { key: 'milk', grams: 150, noteAr: '٣/٤ كوب', noteEn: '≈ 3/4 cup' },
      { key: 'banana', grams: 100, noteAr: 'موزة متوسطة', noteEn: '1 medium' },
      { key: 'yogurt', grams: 120, noteAr: '٤ ملاعق كبيرة', noteEn: '≈ 4 tbsp' },
      { key: 'almonds', grams: 10, noteAr: '٨ حبات', noteEn: '≈ 8 nuts' },
    ],
    stepsAr: [
      'ضع الشوفان واللبن في وعاء صغير وسخّنهما على نار هادئة 3–4 دقائق مع التقليب حتى يتماسك القوام.',
      'ارفع الوعاء من على النار واتركه دقيقة ليبرد قليلاً.',
      'قطّع الموز إلى شرائح وضع نصفه فوق الشوفان وهرس النصف الآخر وقلّبه داخل الشوفان لتحلية طبيعية.',
      'أضف الزبادي اليوناني فوق الشوفان ثم زيّن باللوز المفروم.',
      'قدّمه دافئاً أو بارداً حسب رغبتك.',
    ],
    stepsEn: [
      'Warm the oats and milk in a small pot over low heat for 3–4 minutes, stirring until thick.',
      'Remove from heat and let it cool for a minute.',
      'Slice the banana; place half on top and mash the other half into the oats for natural sweetness.',
      'Top with the Greek yogurt and chopped almonds.',
      'Serve warm or cold.',
    ],
    tipAr: 'حضّره في الليلة السابقة وضعه في الثلاجة (Overnight Oats) ليكون جاهزاً صباحاً.',
    tipEn: 'Prepare it the night before and refrigerate (overnight oats) for a grab-and-go breakfast.',
  },
  {
    id: 'veggie-omelette-baladi',
    meal: 'BREAKFAST',
    emoji: '🍳',
    titleAr: 'أومليت البيض بالخضار مع عيش بلدي',
    titleEn: 'Veggie Omelette with Baladi Bread',
    prepMin: 5,
    cookMin: 8,
    servings: 1,
    ingredients: [
      { key: 'egg', grams: 100, noteAr: 'بيضتان', noteEn: '2 eggs' },
      { key: 'eggwhite', grams: 100, noteAr: '٣ بياض بيض', noteEn: '≈ 3 whites' },
      { key: 'tomato', grams: 80, noteAr: 'حبة صغيرة', noteEn: '1 small' },
      { key: 'onion', grams: 30, noteAr: 'ربع بصلة', noteEn: '1/4 onion' },
      { key: 'oliveoil', grams: 5, noteAr: 'ملعقة صغيرة', noteEn: '1 tsp' },
      { key: 'baladi', grams: 60, noteAr: 'نصف رغيف', noteEn: '1/2 loaf' },
    ],
    stepsAr: [
      'قطّع الطماطم والبصل مكعبات صغيرة جداً.',
      'اخفق البيض مع بياض البيض وقليل من الملح والفلفل الأسود في وعاء.',
      'سخّن زيت الزيتون في مقلاة غير لاصقة على نار متوسطة وقلّب البصل دقيقة حتى يذبل.',
      'أضف الطماطم وقلّب دقيقة ثم اسكب خليط البيض.',
      'اتركه 2–3 دقائق حتى يتماسك القاع، اطوه نصفين وقلبه ثانية واحدة لتمام النضج.',
      'قدّمه مع العيش البلدي.',
    ],
    stepsEn: [
      'Dice the tomato and onion very small.',
      'Whisk the eggs and egg whites with salt and black pepper.',
      'Heat the olive oil in a non-stick pan over medium heat and sauté the onion for 1 minute.',
      'Add the tomato for 1 minute, then pour in the egg mixture.',
      'Cook 2–3 minutes until the base sets, fold in half and flip for a few seconds.',
      'Serve with baladi bread.',
    ],
    tipAr: 'بياض البيض يرفع البروتين ويخفض السعرات دون زيادة الدهون.',
    tipEn: 'Egg whites raise protein while keeping calories and fat low.',
  },
  {
    id: 'fava-egg',
    meal: 'BREAKFAST',
    emoji: '🫘',
    titleAr: 'فول مدمس بزيت الزيتون مع بيضة مسلوقة',
    titleEn: 'Fava Beans with Olive Oil & Boiled Egg',
    prepMin: 5,
    cookMin: 10,
    servings: 1,
    ingredients: [
      { key: 'fava', grams: 200, noteAr: 'حوالي ١ كوب', noteEn: '≈ 1 cup' },
      { key: 'egg', grams: 50, noteAr: 'بيضة', noteEn: '1 egg' },
      { key: 'oliveoil', grams: 8, noteAr: 'ملعقة صغيرة ونصف', noteEn: '1½ tsp' },
      { key: 'baladi', grams: 60, noteAr: 'نصف رغيف', noteEn: '1/2 loaf' },
      { key: 'tomato', grams: 50, noteAr: 'نصف حبة', noteEn: '1/2 tomato' },
    ],
    stepsAr: [
      'اسلق البيضة في ماء يغلي 9 دقائق ثم ضعها في ماء بارد وقشّرها.',
      'سخّن الفول المدمس في قدر صغير مع رشة كمون وملح وقليل من الماء.',
      'اسكب الفول في طبق، أضف الطماطم المقطعة وزيت الزيتون وعصير نصف ليمونة.',
      'قطّع البيضة وضعها فوق الفول وقدّمه مع العيش البلدي.',
    ],
    stepsEn: [
      'Boil the egg for 9 minutes, cool in cold water and peel.',
      'Warm the fava beans in a small pot with cumin, salt and a splash of water.',
      'Transfer to a plate; add diced tomato, olive oil and juice of half a lemon.',
      'Slice the egg on top and serve with baladi bread.',
    ],
    tipAr: 'الفول مع الخبز البلدي يقدّم بروتيناً نباتياً كاملاً وشبعاً طويلاً.',
    tipEn: 'Fava with baladi bread forms a complete plant protein and keeps you full for hours.',
  },
  {
    id: 'grilled-chicken-rice',
    meal: 'LUNCH',
    emoji: '🍗',
    titleAr: 'صدور دجاج مشوية مع أرز وسلطة',
    titleEn: 'Grilled Chicken, Rice & Salad',
    prepMin: 10,
    cookMin: 25,
    servings: 1,
    ingredients: [
      { key: 'chicken', grams: 200, noteAr: 'صدر دجاج متوسط', noteEn: '1 medium breast' },
      { key: 'rice', grams: 80, noteAr: '١/٣ كوب نيء', noteEn: '≈ 1/3 cup raw' },
      { key: 'oliveoil', grams: 8, noteAr: 'ملعقة صغيرة ونصف', noteEn: '1½ tsp' },
      { key: 'cucumber', grams: 100, noteAr: '١ خيارة', noteEn: '1 cucumber' },
      { key: 'tomato', grams: 100, noteAr: '١ حبة', noteEn: '1 tomato' },
      { key: 'lettuce', grams: 40, noteAr: 'حفنة', noteEn: 'a handful' },
    ],
    stepsAr: [
      'تبّل الدجاج بالملح والفلفل الأسود والكمون والبابريكا وعصير ليمونة، واتركه 15 دقيقة على الأقل.',
      'اغسل الأرز جيداً وضعه في قدر مع ضعف حجمه ماء وقليل من الملح، وقلّل النار بعد الغليان واتركه 15 دقيقة حتى ينضج.',
      'سخّن مقلاة الجريل (أو الشواية) وادهنها بنصف كمية الزيت، واشوِ الدجاج 6–7 دقائق من كل جانب حتى يصل إلى الداخل نضجاً كاملاً.',
      'قطّع الخيار والطماطم والخس ثم تبّلهم بباقي زيت الزيتون وعصير الليمون والملح.',
      'قدّم الدجاج مقطعاً شرائح بجانب الأرز والسلطة.',
    ],
    stepsEn: [
      'Season the chicken with salt, pepper, cumin, paprika and lemon juice; rest at least 15 minutes.',
      'Rinse the rice, place in a pot with twice its volume of water and a pinch of salt; simmer on low 15 minutes.',
      'Heat a grill pan, brush with half the oil and grill the chicken 6–7 minutes per side until cooked through.',
      'Chop the cucumber, tomato and lettuce and dress with the remaining oil, lemon and salt.',
      'Slice the chicken and serve beside the rice and salad.',
    ],
    tipAr: 'استخدم ميزان مطبخ وزن الدجاج نيئاً؛ الأرقام الغذائية محسوبة على الوزن النيء.',
    tipEn: 'Weigh the chicken raw with a kitchen scale; nutrition values are based on raw weights.',
  },
  {
    id: 'kofta-sweetpotato',
    meal: 'LUNCH',
    emoji: '🥩',
    titleAr: 'كفتة لحم قليلة الدهن مع بطاطا مشوية',
    titleEn: 'Lean Beef Kofta with Baked Sweet Potato',
    prepMin: 15,
    cookMin: 30,
    servings: 1,
    ingredients: [
      { key: 'beef', grams: 180, noteAr: 'لحم مفروم قليل الدهن', noteEn: 'lean minced beef' },
      { key: 'onion', grams: 30, noteAr: 'ربع بصلة مبشورة', noteEn: '1/4 onion, grated' },
      { key: 'sweetpotato', grams: 220, noteAr: 'حبة متوسطة', noteEn: '1 medium' },
      { key: 'oliveoil', grams: 6, noteAr: 'ملعقة صغيرة', noteEn: '1 tsp' },
      { key: 'tomato', grams: 100, noteAr: 'حبة', noteEn: '1 tomato' },
    ],
    stepsAr: [
      'سخّن الفرن على 200 درجة مئوية.',
      'قطّع البطاطا مكعبات كبيرة وقلّبها مع نصف الزيت والملح ورشة قرفة، وضعها في الفرن 25–30 دقيقة.',
      'اخلط اللحم المفروم مع البصل المبشور والبقدونس المفروم والملح والفلفل والبهارات.',
      'شكّل الخليط أصابع كفتة واشوِها على مقلاة جريل أو في الفرن 10–12 دقيقة مع التقليب.',
      'قدّم الكفتة مع البطاطا المشوية والطماطم الطازجة.',
    ],
    stepsEn: [
      'Preheat the oven to 200 °C.',
      'Cube the sweet potato, toss with half the oil, salt and a pinch of cinnamon; bake 25–30 minutes.',
      'Mix the minced beef with grated onion, chopped parsley, salt, pepper and spices.',
      'Shape into kofta fingers and grill or bake 10–12 minutes, turning once.',
      'Serve with the roasted sweet potato and fresh tomato.',
    ],
    tipAr: 'اختر لحماً مفروماً لا تتجاوز نسبة الدهن فيه 7% للحفاظ على السعرات.',
    tipEn: 'Choose minced beef with 7% fat or less to keep calories in check.',
  },
  {
    id: 'tilapia-rice-veg',
    meal: 'LUNCH',
    emoji: '🐟',
    titleAr: 'سمك بلطي مشوي مع أرز وكوسة سوتيه',
    titleEn: 'Grilled Tilapia, Rice & Sautéed Zucchini',
    prepMin: 10,
    cookMin: 25,
    servings: 1,
    ingredients: [
      { key: 'tilapia', grams: 250, noteAr: 'سمكة صغيرة أو فيليه', noteEn: '1 small fish / fillet' },
      { key: 'rice', grams: 80, noteAr: '١/٣ كوب نيء', noteEn: '≈ 1/3 cup raw' },
      { key: 'zucchini', grams: 150, noteAr: '٢ كوسة صغيرة', noteEn: '2 small' },
      { key: 'oliveoil', grams: 8, noteAr: 'ملعقة صغيرة ونصف', noteEn: '1½ tsp' },
    ],
    stepsAr: [
      'نظّف السمك وتبّله بالملح والكمون والثوم المهروس وعصير الليمون واتركه 20 دقيقة.',
      'اسلق الأرز مع ضعف حجمه ماء وقليل من الملح على نار هادئة 15 دقيقة.',
      'اشوِ السمك في الفرن على 210 درجة 15–18 دقيقة أو على الجريل 6–7 دقائق من كل جهة.',
      'قطّع الكوسة شرائح وقلّبها في مقلاة بزيت الزيتون 4–5 دقائق حتى تذبل قليلاً.',
      'قدّم السمك مع الأرز والكوسة وشرائح الليمون.',
    ],
    stepsEn: [
      'Clean the fish and season with salt, cumin, crushed garlic and lemon juice; rest 20 minutes.',
      'Cook the rice with twice its volume of water and salt on low heat for 15 minutes.',
      'Bake the fish at 210 °C for 15–18 minutes or grill 6–7 minutes per side.',
      'Slice the zucchini and sauté in olive oil 4–5 minutes until just tender.',
      'Serve the fish with rice, zucchini and lemon wedges.',
    ],
    tipAr: 'السمك مصدر ممتاز للبروتين قليل الدهن؛ احرص على تناوله مرتين أسبوعياً.',
    tipEn: 'Fish is a superb lean protein — aim to eat it twice a week.',
  },
  {
    id: 'tuna-pasta-broccoli',
    meal: 'LUNCH',
    emoji: '🍝',
    titleAr: 'مكرونة قمح كامل بالتونة والبروكلي',
    titleEn: 'Whole-Wheat Tuna & Broccoli Pasta',
    prepMin: 8,
    cookMin: 12,
    servings: 1,
    ingredients: [
      { key: 'pasta', grams: 80, noteAr: 'حوالي ١ كوب جاف', noteEn: '≈ 1 cup dry' },
      { key: 'tuna', grams: 120, noteAr: 'علبة تونة صغيرة', noteEn: '1 small can' },
      { key: 'broccoli', grams: 120, noteAr: 'كوب زهور', noteEn: '1 cup florets' },
      { key: 'oliveoil', grams: 8, noteAr: 'ملعقة صغيرة ونصف', noteEn: '1½ tsp' },
      { key: 'tomato', grams: 80, noteAr: 'حبة صغيرة', noteEn: '1 small' },
    ],
    stepsAr: [
      'اسلق المكرونة في ماء مملح حسب التعليمات (8–10 دقائق)، وأضف البروكلي في آخر 3 دقائق.',
      'صفّي المكرونة والبروكلي واحتفظ بربع كوب من ماء السلق.',
      'سخّن الزيت في مقلاة وأضف الثوم المفروم والطماطم المقطعة دقيقتين.',
      'أضف التونة المصفاة والمكرونة والبروكلي وقليلاً من ماء السلق وقلّب دقيقة.',
      'تبّل بالملح والفلفل الأسود وعصير الليمون وقدّمها فوراً.',
    ],
    stepsEn: [
      'Boil the pasta in salted water per package time (8–10 min), adding the broccoli in the last 3 minutes.',
      'Drain, reserving 1/4 cup of the cooking water.',
      'Heat the oil in a pan; cook minced garlic and diced tomato for 2 minutes.',
      'Add the drained tuna, pasta, broccoli and a splash of cooking water; toss for 1 minute.',
      'Season with salt, pepper and lemon juice and serve immediately.',
    ],
    tipAr: 'المكرونة بالقمح الكامل أعلى في الألياف وتمنح شبعاً أطول.',
    tipEn: 'Whole-wheat pasta is higher in fibre and more filling.',
  },
  {
    id: 'cottage-veg-baladi',
    meal: 'SNACK',
    emoji: '🥒',
    titleAr: 'جبنة قريش بالخيار والطماطم مع عيش بلدي',
    titleEn: 'Cottage Cheese, Cucumber & Baladi Bread',
    prepMin: 5,
    cookMin: 0,
    servings: 1,
    ingredients: [
      { key: 'cottage', grams: 150, noteAr: '٥ ملاعق كبيرة', noteEn: '≈ 5 tbsp' },
      { key: 'cucumber', grams: 100, noteAr: '١ خيارة', noteEn: '1 cucumber' },
      { key: 'tomato', grams: 80, noteAr: 'حبة صغيرة', noteEn: '1 small' },
      { key: 'baladi', grams: 50, noteAr: 'ثلث رغيف', noteEn: '1/3 loaf' },
      { key: 'oliveoil', grams: 3, noteAr: 'نصف ملعقة صغيرة', noteEn: '1/2 tsp' },
    ],
    stepsAr: [
      'قطّع الخيار والطماطم مكعبات صغيرة.',
      'اخلط الجبنة القريش مع الخضار ونعناع مفروم وقليل من الملح والفلفل.',
      'أضف زيت الزيتون وقدّمها مع العيش البلدي المحمّص.',
    ],
    stepsEn: [
      'Dice the cucumber and tomato.',
      'Mix the cottage cheese with the vegetables, chopped mint, salt and pepper.',
      'Drizzle with olive oil and serve with toasted baladi bread.',
    ],
    tipAr: 'سناك غني بالكازين (بروتين بطيء الهضم) ممتاز قبل النوم.',
    tipEn: 'Rich in casein (slow-digesting protein) — great before bed.',
  },
  {
    id: 'yogurt-dates-almonds',
    meal: 'SNACK',
    emoji: '🥛',
    titleAr: 'زبادي يوناني بالتمر واللوز',
    titleEn: 'Greek Yogurt with Dates & Almonds',
    prepMin: 3,
    cookMin: 0,
    servings: 1,
    ingredients: [
      { key: 'yogurt', grams: 200, noteAr: 'علبة صغيرة', noteEn: '1 small tub' },
      { key: 'dates', grams: 30, noteAr: '٣ حبات', noteEn: '3 dates' },
      { key: 'almonds', grams: 15, noteAr: '١٢ حبة', noteEn: '≈ 12 nuts' },
    ],
    stepsAr: [
      'انزع نوى التمر وقطّعه قطعاً صغيرة.',
      'ضع الزبادي في وعاء وأضف التمر واللوز المفروم.',
      'رشّ قليلاً من القرفة وقدّمه بارداً.',
    ],
    stepsEn: [
      'Pit and chop the dates.',
      'Place the yogurt in a bowl and top with dates and chopped almonds.',
      'Sprinkle cinnamon and serve chilled.',
    ],
    tipAr: 'مناسب بعد التمرين لتعويض الكربوهيدرات والبروتين.',
    tipEn: 'A great post-workout snack for carbs and protein.',
  },
  {
    id: 'pb-banana-sandwich',
    meal: 'SNACK',
    emoji: '🍌',
    titleAr: 'ساندويتش زبدة فول سوداني وموز',
    titleEn: 'Peanut Butter & Banana Sandwich',
    prepMin: 3,
    cookMin: 0,
    servings: 1,
    ingredients: [
      { key: 'baladi', grams: 60, noteAr: 'نصف رغيف', noteEn: '1/2 loaf' },
      { key: 'peanutbutter', grams: 20, noteAr: 'ملعقة كبيرة', noteEn: '1 tbsp' },
      { key: 'banana', grams: 100, noteAr: 'موزة متوسطة', noteEn: '1 medium' },
    ],
    stepsAr: [
      'افتح نصف رغيف العيش البلدي وحمّصه قليلاً.',
      'افرد زبدة الفول السوداني على الوجهين.',
      'ضع شرائح الموز وأغلق الساندويتش وقدّمه.',
    ],
    stepsEn: [
      'Open the half loaf of baladi bread and toast lightly.',
      'Spread peanut butter on both sides.',
      'Add banana slices, close and serve.',
    ],
    tipAr: 'اختر زبدة فول سوداني طبيعية بدون سكر مضاف.',
    tipEn: 'Choose natural peanut butter with no added sugar.',
  },
  {
    id: 'tuna-chickpea-salad',
    meal: 'DINNER',
    emoji: '🥗',
    titleAr: 'سلطة التونة بالحمص',
    titleEn: 'Tuna & Chickpea Salad',
    prepMin: 10,
    cookMin: 0,
    servings: 1,
    ingredients: [
      { key: 'tuna', grams: 130, noteAr: 'علبة تونة', noteEn: '1 can' },
      { key: 'chickpeas', grams: 120, noteAr: '٣/٤ كوب مطبوخ', noteEn: '≈ 3/4 cup cooked' },
      { key: 'cucumber', grams: 100, noteAr: '١ خيارة', noteEn: '1 cucumber' },
      { key: 'tomato', grams: 100, noteAr: '١ حبة', noteEn: '1 tomato' },
      { key: 'lettuce', grams: 50, noteAr: 'حفنة', noteEn: 'a handful' },
      { key: 'oliveoil', grams: 8, noteAr: 'ملعقة صغيرة ونصف', noteEn: '1½ tsp' },
    ],
    stepsAr: [
      'صفّي التونة والحمص جيداً.',
      'قطّع الخيار والطماطم والخس في وعاء كبير.',
      'أضف التونة والحمص وقلّب برفق.',
      'تبّل بزيت الزيتون وعصير ليمونة وملح وفلفل أسود وقدّمها طازجة.',
    ],
    stepsEn: [
      'Drain the tuna and chickpeas.',
      'Chop the cucumber, tomato and lettuce into a large bowl.',
      'Add the tuna and chickpeas and toss gently.',
      'Dress with olive oil, lemon juice, salt and black pepper; serve fresh.',
    ],
    tipAr: 'وجبة عشاء خفيفة غنية بالبروتين والألياف دون تسخين أي شيء.',
    tipEn: 'A light, high-protein, high-fibre dinner with zero cooking.',
  },
  {
    id: 'lentil-soup',
    meal: 'DINNER',
    emoji: '🍲',
    titleAr: 'شوربة العدس مع جبنة قريش',
    titleEn: 'Lentil Soup with Cottage Cheese',
    prepMin: 10,
    cookMin: 30,
    servings: 1,
    ingredients: [
      { key: 'lentils', grams: 70, noteAr: '١/٣ كوب جاف', noteEn: '≈ 1/3 cup dry' },
      { key: 'onion', grams: 40, noteAr: 'نصف بصلة', noteEn: '1/2 onion' },
      { key: 'oliveoil', grams: 6, noteAr: 'ملعقة صغيرة', noteEn: '1 tsp' },
      { key: 'baladi', grams: 50, noteAr: 'ثلث رغيف', noteEn: '1/3 loaf' },
      { key: 'cottage', grams: 100, noteAr: '٣ ملاعق كبيرة', noteEn: '≈ 3 tbsp' },
    ],
    stepsAr: [
      'اغسل العدس جيداً.',
      'حمّر البصل المفروم في زيت الزيتون في قدر حتى يصبح ذهبياً.',
      'أضف العدس وكمية ماء تغطيه بثلاثة أضعاف وقليلاً من الكمون والملح.',
      'اتركه على نار هادئة 25–30 دقيقة حتى يتهرأ العدس، ثم اهرسه بالمضرب الكهربائي.',
      'قدّم الشوربة مع عصير الليمون والعيش المحمّص والجبنة القريش بجانبها.',
    ],
    stepsEn: [
      'Rinse the lentils well.',
      'Brown the chopped onion in olive oil in a pot until golden.',
      'Add the lentils, three times their volume of water, cumin and salt.',
      'Simmer 25–30 minutes until soft, then blend smooth.',
      'Serve with lemon juice, toasted bread and the cottage cheese on the side.',
    ],
    tipAr: 'يمكن تحضير كمية كبيرة وتجميدها في أكياس فردية.',
    tipEn: 'Make a big batch and freeze in single portions.',
  },
  {
    id: 'liver-onion-potato',
    meal: 'DINNER',
    emoji: '🍳',
    titleAr: 'كبدة دجاج بالبصل مع بطاطس مشوية',
    titleEn: 'Chicken Liver with Onions & Roasted Potato',
    prepMin: 10,
    cookMin: 20,
    servings: 1,
    ingredients: [
      { key: 'liver', grams: 200, noteAr: 'حوالي ١٢ قطعة', noteEn: '≈ 12 pieces' },
      { key: 'onion', grams: 80, noteAr: 'بصلة صغيرة', noteEn: '1 small' },
      { key: 'potato', grams: 150, noteAr: 'حبة متوسطة', noteEn: '1 medium' },
      { key: 'oliveoil', grams: 8, noteAr: 'ملعقة صغيرة ونصف', noteEn: '1½ tsp' },
    ],
    stepsAr: [
      'قطّع البطاطس مكعبات وتبّلها بنصف الزيت والملح، وضعها في الفرن على 200 درجة 20–25 دقيقة.',
      'نظّف الكبدة جيداً وأزل أي أغشية، واغسلها وجففها.',
      'حمّر البصل المقطع شرائح في باقي الزيت حتى يذبل.',
      'أضف الكبدة وقلّب على نار عالية 5–6 دقائق حتى تنضج تماماً (لا يبقى بها لون وردي).',
      'تبّل بالكمون والملح والفلفل وعصير الليمون وقدّمها مع البطاطس.',
    ],
    stepsEn: [
      'Cube the potato, toss with half the oil and salt and roast at 200 °C for 20–25 minutes.',
      'Trim the liver, rinse and pat dry.',
      'Sauté the sliced onion in the remaining oil until soft.',
      'Add the liver and cook over high heat 5–6 minutes until fully cooked (no pink left).',
      'Season with cumin, salt, pepper and lemon juice; serve with the potatoes.',
    ],
    tipAr: 'الكبدة غنية بالحديد وفيتامين A، يكفي تناولها مرة أسبوعياً.',
    tipEn: 'Liver is rich in iron and vitamin A — once a week is plenty.',
  },
];

/* ------------------------------------------------------------------ */
/* Computation helpers                                                 */
/* ------------------------------------------------------------------ */

export function macrosOf(ingredients: RecipeIngredient[]): Macros {
  let kcal = 0;
  let p = 0;
  let c = 0;
  let f = 0;
  for (const ing of ingredients) {
    const n = INGREDIENTS[ing.key];
    if (!n) continue;
    const k = ing.grams / 100;
    kcal += n.kcal * k;
    p += n.p * k;
    c += n.c * k;
    f += n.f * k;
  }
  return {
    kcal: Math.round(kcal),
    proteinG: Math.round(p),
    carbsG: Math.round(c),
    fatsG: Math.round(f),
  };
}

export interface ScaledRecipe {
  recipe: Recipe;
  factor: number;
  ingredients: RecipeIngredient[];
  macros: Macros;
}

const roundGrams = (g: number) => Math.max(5, Math.round(g / 5) * 5);

/** Scales a recipe so that its calories land as close as possible to the target. */
export function scaleRecipeToKcal(recipe: Recipe, targetKcal: number): ScaledRecipe {
  const base = macrosOf(recipe.ingredients).kcal || 1;
  const factor = Math.min(2.5, Math.max(0.4, targetKcal / base));
  const ingredients = recipe.ingredients.map((i) => ({
    ...i,
    grams: roundGrams(i.grams * factor),
    noteAr: undefined,
    noteEn: undefined,
  }));
  return { recipe, factor, ingredients, macros: macrosOf(ingredients) };
}

export function recipesFor(meal: MealType): Recipe[] {
  return RECIPES.filter((r) => r.meal === meal);
}

export function mealBudget(targets: Macros, meal: MealType): number {
  return Math.round(targets.kcal * MEAL_LABELS[meal].share);
}
