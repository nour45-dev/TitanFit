import {
  INGREDIENTS,
  MEAL_LABELS,
  MEAL_ORDER,
  macrosOf,
  type MealType,
  type NutritionTargets,
  type Recipe,
  type RecipeIngredient,
  type ScaledRecipe,
} from './nutrition';
import { buildPdfBlob, downloadBlob, type PdfBlock } from './pdf-builder';

const WHATSAPP = '+20 155 994 9271';

/* ------------------------------------------------------------------ */
/* E-BOOK — Arabic, right-to-left                                       */
/* ------------------------------------------------------------------ */

export function ebookBlocks(email: string): PdfBlock[] {
  return [
    {
      t: 'title',
      text: 'الدليل الشامل لاحتراف التمرين والتغذية بدون إصابات',
      sub: `أُعد خصيصاً لـ: ${email || 'رياضي TitanFit'}  •  فريق العلاج الطبيعي والتغذية الرياضية`,
    },
    {
      t: 'p',
      text: 'هذا الدليل يلخّص الأساسيات العلمية التي يحتاجها أي متدرب لبناء العضلات وحرق الدهون بأمان، بدون إصابات وبدون حرمان. اقرأه مرة كاملة، ثم ارجع لأي فصل عند الحاجة.',
    },
    {
      t: 'stats',
      items: [
        { value: '5', label: 'فصول' },
        { value: '3-4', label: 'أيام تدريب' },
        { value: '1.8-2.2', label: 'جم بروتين/كجم' },
        { value: '7-9', label: 'ساعات نوم' },
      ],
    },

    { t: 'h1', text: 'الفصل الأول: حماية المفاصل والتكنيك الصحيح' },
    { t: 'p', text: 'أغلب الإصابات سببها الوزن الزائد مع تكنيك سيئ، وليس التمرين نفسه. التزم بالقواعد التالية في كل حصة:' },
    { t: 'li', text: 'ابدأ دائماً بإحماء 8–10 دقائق: 5 دقائق كارديو خفيف ثم تمارين حركية للمفاصل التي ستعمل عليها.' },
    { t: 'li', text: 'أدِّ أول مجموعتين من كل تمرين بوزن خفيف (50% تقريباً) لتهيئة العضلة والمفصل قبل الأوزان الثقيلة.' },
    { t: 'li', text: 'تحكّم في الوزن أثناء النزول (حوالي 2–3 ثوانٍ) ولا تترك الوزن يسقط ولا تستخدم الزخم.' },
    { t: 'li', text: 'حافظ على استقامة العمود الفقري في السكوات والديدلفت والتجديف؛ إذا استدار ظهرك فالوزن أثقل مما يجب.' },
    { t: 'li', text: 'لا تقفل المفاصل بالكامل في نهاية الحركة (الركبة والكوع) وحافظ على ثني بسيط.' },
    { t: 'li', text: 'الألم الحاد أو الوخز أو الألم في المفصل = توقّف فوراً. أما حرقان العضلة المعتاد فهو طبيعي.' },
    { t: 'h2', text: 'متى تستشير طبيب علاج طبيعي؟' },
    { t: 'p', text: 'إذا استمر الألم أكثر من 72 ساعة، أو صاحبه تورم أو تنميل أو ضعف في الحركة، فاستشر مختصاً قبل إكمال التدريب.' },

    { t: 'h1', text: 'الفصل الثاني: جدول Push / Pull / Legs لـ 4 أيام' },
    { t: 'p', text: 'تقسيم متوازن يعطي كل عضلة تكراراً مرتين أسبوعياً تقريباً، مع راحة كافية للتعافي:' },
    {
      t: 'table',
      head: ['اليوم', 'التركيز', 'التمارين الأساسية'],
      widths: [1.2, 1.4, 4],
      rows: [
        ['اليوم 1 — Push', 'صدر • كتف • ترايسبس', 'بنش برس 4×8 • ضغط دمبل مائل 3×10 • ضغط كتف 3×10 • رفرفة جانبية 3×15 • ترايسبس بالكابل 3×12'],
        ['اليوم 2 — Pull', 'ظهر • باي سبس', 'سحب علوي 4×10 • تجديف بار 4×8 • سحب أرضي 3×12 • فيس بول 3×15 • باي سبس بار 3×10'],
        ['اليوم 3 — راحة', 'تعافٍ نشط', 'مشي 30–40 دقيقة + تمارين مرونة وإطالة'],
        ['اليوم 4 — Legs', 'أرجل • بطن', 'سكوات 4×8 • ضغط أرجل 3×12 • رومانيان ديدلفت 3×10 • ثني أرجل 3×12 • سمانة 4×15 • بلانك 3×45 ثانية'],
      ],
    },
    { t: 'h2', text: 'قاعدة التدرّج في الأحمال (Progressive Overload)' },
    { t: 'p', text: 'عندما تؤدي كل التكرارات المستهدفة بتكنيك سليم في جميع المجموعات، زِد الوزن بمقدار 2.5%–5% في الحصة التالية. التقدم الصغير والمستمر أهم من القفزات الكبيرة.' },

    { t: 'h1', text: 'الفصل الثالث: حساب السعرات والماكروز' },
    { t: 'p', text: 'خطوات بسيطة لتحديد احتياجك اليومي:' },
    { t: 'num', n: 1, text: 'احسب معدل الأيض الأساسي (BMR) بمعادلة Mifflin-St Jeor: للرجال = 10×الوزن + 6.25×الطول − 5×العمر + 5، وللسيدات = 10×الوزن + 6.25×الطول − 5×العمر − 161.' },
    { t: 'num', n: 2, text: 'اضرب النتيجة في معامل النشاط (1.2 خامل — 1.375 خفيف — 1.55 متوسط — 1.725 عالٍ) لتحصل على سعرات الثبات.' },
    { t: 'num', n: 3, text: 'للتنشيف اطرح حوالي 20% من سعرات الثبات، وللتضخيم أضف حوالي 10%. لا تنزل أبداً عن 1500 سعر للرجال و1200 للسيدات بدون إشراف.' },
    { t: 'num', n: 4, text: 'البروتين: 1.8–2.2 جم لكل كجم من وزن الجسم. الدهون: 0.8–1 جم لكل كجم. الباقي من السعرات كربوهيدرات.' },
    { t: 'p', text: 'تذكّر: كل 1 جم بروتين = 4 سعرات، 1 جم كربوهيدرات = 4 سعرات، 1 جم دهون = 9 سعرات. استخدم حاسبة السعرات في موقعنا لتحصل على أرقامك بدقة.' },

    { t: 'h1', text: 'الفصل الرابع: بدائل بروتين مصرية اقتصادية' },
    {
      t: 'table',
      head: ['المصدر', 'الكمية', 'بروتين (جم)', 'سعرات'],
      widths: [3, 1.6, 1.4, 1.2],
      rows: [
        ['جبنة قريش قليلة الدسم', '150 جم', '18', '108'],
        ['بيض كامل', '2 حبة (100 جم)', '13', '143'],
        ['تونة معلبة بالماء', '120 جم', '31', '139'],
        ['كبدة دجاج (نيئة)', '200 جم', '34', '238'],
        ['صدور دجاج (نيئة)', '200 جم', '45', '240'],
        ['فول مدمس مطبوخ', '200 جم', '15', '220'],
        ['عدس أصفر (جاف)', '70 جم', '18', '246'],
        ['سمك بلطي (نيء)', '250 جم', '50', '240'],
      ],
    },
    { t: 'p', text: 'اجمع بين مصدرين نباتي وحيواني على مدار اليوم لتغطية الأحماض الأمينية، وتجنّب الاعتماد على المكملات إذا كانت ميزانيتك محدودة؛ الأكل الطبيعي يكفي.' },

    { t: 'h1', text: 'الفصل الخامس: التعافي والنوم والترطيب' },
    { t: 'li', text: 'نم 7–9 ساعات يومياً؛ فيها تُبنى العضلات وتُنظَّم هرمونات الشهية.' },
    { t: 'li', text: 'اشرب حوالي 35 مل ماء لكل كجم من وزنك يومياً، وزِد الكمية في التمرين والجو الحار.' },
    { t: 'li', text: 'خذ يوم راحة كاملاً على الأقل أسبوعياً، وأسبوع تخفيف (Deload) بأوزان أخف كل 6–8 أسابيع.' },
    { t: 'li', text: 'أضف 5–10 دقائق إطالة بعد التمرين، وتناول وجبة تحتوي على بروتين وكربوهيدرات خلال ساعتين بعد التدريب.' },
    { t: 'li', text: 'تابع وزنك ومقاسك أسبوعياً وليس يومياً، وقيّم التقدم كل 3–4 أسابيع قبل تغيير الخطة.' },

    {
      t: 'note',
      text: 'تنبيه طبي: هذا الدليل للتثقيف العام ولا يغني عن استشارة الطبيب. إذا كان لديك مرض مزمن أو إصابة سابقة أو كنتِ حاملاً/مرضعة فاستشر طبيبك قبل بدء أي برنامج تدريب أو نظام غذائي.',
    },
    { t: 'p', text: `للمتابعة الشخصية والاستفسارات تواصل مع كابتن نور الدين على واتساب: ${WHATSAPP}`, muted: true },
  ];
}

export async function downloadEbookPdf(email: string): Promise<void> {
  const blob = await buildPdfBlob(ebookBlocks(email), {
    dir: 'rtl',
    brand: 'TitanFit — الدليل الشامل',
    footer: 'TitanFit Performance',
    title: 'TitanFit Injury-Free Training and Nutrition Guide',
  });
  downloadBlob(blob, 'TitanFit_Training_Nutrition_Guide_AR.pdf');
}

/* ------------------------------------------------------------------ */
/* Recipe & meal plan documents                                         */
/* ------------------------------------------------------------------ */

function ingredientRows(ings: RecipeIngredient[], isAr: boolean): string[][] {
  return ings.map((ing) => {
    const n = INGREDIENTS[ing.key]!;
    const k = ing.grams / 100;
    return [
      isAr ? n.ar : n.en,
      `${ing.grams} ${isAr ? 'جم' : 'g'}`,
      String(Math.round(n.kcal * k)),
      (n.p * k).toFixed(1),
    ];
  });
}

export function recipeBlocks(s: ScaledRecipe, isAr: boolean, targets?: NutritionTargets): PdfBlock[] {
  const r = s.recipe;
  const m = s.macros;
  const meal = MEAL_LABELS[r.meal];
  const head = isAr ? ['المكوّن', 'الكمية', 'سعرات', 'بروتين'] : ['Ingredient', 'Amount', 'kcal', 'Protein'];
  const blocks: PdfBlock[] = [
    {
      t: 'title',
      text: isAr ? r.titleAr : r.titleEn,
      sub: isAr
        ? `${meal.ar}  •  التحضير ${r.prepMin} د  •  الطهي ${r.cookMin} د  •  حصة واحدة`
        : `${meal.en}  •  Prep ${r.prepMin} min  •  Cook ${r.cookMin} min  •  1 serving`,
    },
    {
      t: 'stats',
      items: [
        { value: String(m.kcal), label: isAr ? 'سعرات' : 'kcal' },
        { value: `${m.proteinG} ${isAr ? 'جم' : 'g'}`, label: isAr ? 'بروتين' : 'Protein' },
        { value: `${m.carbsG} ${isAr ? 'جم' : 'g'}`, label: isAr ? 'كربوهيدرات' : 'Carbs' },
        { value: `${m.fatsG} ${isAr ? 'جم' : 'g'}`, label: isAr ? 'دهون' : 'Fats' },
      ],
    },
  ];
  if (targets) {
    blocks.push({
      t: 'p',
      muted: true,
      text: isAr
        ? `تم ضبط الكميات لتناسب هدفك اليومي (${targets.kcal} سعر).`
        : `Portions were adjusted to match your daily target (${targets.kcal} kcal).`,
    });
  }
  blocks.push(
    { t: 'h1', text: isAr ? 'المكونات' : 'Ingredients' },
    { t: 'table', head, rows: ingredientRows(s.ingredients, isAr), widths: [3.2, 1.4, 1, 1] },
    { t: 'h1', text: isAr ? 'طريقة التحضير' : 'Preparation' },
  );
  (isAr ? r.stepsAr : r.stepsEn).forEach((st, i) => blocks.push({ t: 'num', n: i + 1, text: st }));
  blocks.push(
    { t: 'h2', text: isAr ? 'نصيحة' : 'Tip' },
    { t: 'p', text: isAr ? r.tipAr : r.tipEn },
    {
      t: 'p',
      muted: true,
      text: isAr
        ? 'الأوزان محسوبة على الخام ما لم يُذكر غير ذلك. القيم الغذائية تقديرية وقد تختلف قليلاً حسب الماركة وطريقة الطهي.'
        : 'Weights are raw unless stated. Nutrition values are estimates and may vary slightly by brand and cooking method.',
    },
  );
  return blocks;
}

export interface DayPlanMeal {
  meal: MealType;
  scaled: ScaledRecipe;
}

export function dayPlanBlocks(targets: NutritionTargets, meals: DayPlanMeal[], isAr: boolean): PdfBlock[] {
  const total = meals.reduce(
    (a, x) => ({
      kcal: a.kcal + x.scaled.macros.kcal,
      proteinG: a.proteinG + x.scaled.macros.proteinG,
      carbsG: a.carbsG + x.scaled.macros.carbsG,
      fatsG: a.fatsG + x.scaled.macros.fatsG,
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatsG: 0 },
  );
  const g = isAr ? 'جم' : 'g';
  const blocks: PdfBlock[] = [
    {
      t: 'title',
      text: isAr ? 'خطة وجباتك اليومية' : 'Your Daily Meal Plan',
      sub: isAr
        ? `مبنية على ${targets.kcal} سعر حراري يومياً  •  TitanFit`
        : `Built on ${targets.kcal} kcal per day  •  TitanFit`,
    },
    { t: 'h2', text: isAr ? 'هدفك اليومي' : 'Your daily target' },
    {
      t: 'stats',
      items: [
        { value: String(targets.kcal), label: isAr ? 'سعرات' : 'kcal' },
        { value: `${targets.proteinG} ${g}`, label: isAr ? 'بروتين' : 'Protein' },
        { value: `${targets.carbsG} ${g}`, label: isAr ? 'كربوهيدرات' : 'Carbs' },
        { value: `${targets.fatsG} ${g}`, label: isAr ? 'دهون' : 'Fats' },
      ],
    },
    {
      t: 'table',
      head: isAr ? ['الوجبة', 'الطبق', 'سعرات', 'بروتين'] : ['Meal', 'Dish', 'kcal', 'Protein'],
      widths: [1.2, 3.6, 1, 1],
      rows: [
        ...meals.map((x) => [
          isAr ? MEAL_LABELS[x.meal].ar : MEAL_LABELS[x.meal].en,
          isAr ? x.scaled.recipe.titleAr : x.scaled.recipe.titleEn,
          String(x.scaled.macros.kcal),
          `${x.scaled.macros.proteinG} ${g}`,
        ]),
        [isAr ? 'الإجمالي' : 'Total', '', String(total.kcal), `${total.proteinG} ${g}`],
      ],
    },
  ];
  for (const x of meals) {
    const r: Recipe = x.scaled.recipe;
    blocks.push(
      { t: 'pagebreak' },
      { t: 'h1', text: `${isAr ? MEAL_LABELS[x.meal].ar : MEAL_LABELS[x.meal].en}: ${isAr ? r.titleAr : r.titleEn}` },
      {
        t: 'stats',
        items: [
          { value: String(x.scaled.macros.kcal), label: isAr ? 'سعرات' : 'kcal' },
          { value: `${x.scaled.macros.proteinG} ${g}`, label: isAr ? 'بروتين' : 'Protein' },
          { value: `${x.scaled.macros.carbsG} ${g}`, label: isAr ? 'كربوهيدرات' : 'Carbs' },
          { value: `${x.scaled.macros.fatsG} ${g}`, label: isAr ? 'دهون' : 'Fats' },
        ],
      },
      { t: 'h2', text: isAr ? 'المكونات' : 'Ingredients' },
      {
        t: 'table',
        head: isAr ? ['المكوّن', 'الكمية', 'سعرات', 'بروتين'] : ['Ingredient', 'Amount', 'kcal', 'Protein'],
        rows: ingredientRows(x.scaled.ingredients, isAr),
        widths: [3.2, 1.4, 1, 1],
      },
      { t: 'h2', text: isAr ? 'طريقة التحضير' : 'Preparation' },
    );
    (isAr ? r.stepsAr : r.stepsEn).forEach((st, i) => blocks.push({ t: 'num', n: i + 1, text: st }));
  }
  blocks.push(
    { t: 'gap', h: 12 },
    {
      t: 'note',
      text: isAr
        ? 'تنبيه: الأرقام تقديرية للأشخاص الأصحاء. استشر طبيباً أو أخصائي تغذية إذا كان لديك مرض مزمن أو حمل أو أي حالة طبية خاصة.'
        : 'Note: Figures are estimates for healthy adults. Consult a doctor or dietitian if you have a medical condition or are pregnant.',
    },
  );
  return blocks;
}

export async function downloadRecipePdf(s: ScaledRecipe, isAr: boolean, targets?: NutritionTargets): Promise<void> {
  const blob = await buildPdfBlob(recipeBlocks(s, isAr, targets), {
    dir: isAr ? 'rtl' : 'ltr',
    brand: isAr ? 'TitanFit — وصفات صحية' : 'TitanFit — Healthy Recipes',
    footer: 'TitanFit Performance',
    title: `TitanFit Recipe ${s.recipe.id}`,
  });
  downloadBlob(blob, `TitanFit_Recipe_${s.recipe.id}.pdf`);
}

export async function downloadDayPlanPdf(
  targets: NutritionTargets,
  meals: DayPlanMeal[],
  isAr: boolean,
): Promise<void> {
  const blob = await buildPdfBlob(dayPlanBlocks(targets, meals, isAr), {
    dir: isAr ? 'rtl' : 'ltr',
    brand: isAr ? 'TitanFit — خطة وجبات يومية' : 'TitanFit — Daily Meal Plan',
    footer: 'TitanFit Performance',
    title: 'TitanFit Daily Meal Plan',
  });
  downloadBlob(blob, `TitanFit_Daily_Meal_Plan_${targets.kcal}kcal.pdf`);
}

export { MEAL_ORDER, macrosOf };
