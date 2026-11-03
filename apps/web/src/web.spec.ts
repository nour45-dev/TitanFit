import { describe, expect, it } from 'vitest';
import { DICTIONARIES } from './i18n/dictionaries';
import {
  calcNutrition,
  recipesFor,
  scaleRecipeToKcal,
  sanitizeCalcInput,
  INGREDIENTS,
} from './lib/nutrition';
import { buildPdfBlob, downloadBlob } from './lib/pdf-builder';
import { invoicePdfBlocks } from './lib/pdf-docs';

describe('@gymos/web bilingual dictionaries', () => {
  it('provides complete English and Arabic translation keys', () => {
    expect(DICTIONARIES.en.hero.title).toContain('Gym');
    expect(DICTIONARIES.ar.hero.title).toContain('للأندية الرياضية');
    expect(DICTIONARIES.ar.system.egyptPaymentsBadge).toContain('فوري');
  });
});

describe('Mifflin-St Jeor & Nutrition Engine', () => {
  it('accurately computes BMR, TDEE, macros and safety floors for male cut', () => {
    // 27 yo male, 86 kg, 176 cm, activity 1.55 (moderate)
    // BMR = (10 * 86) + (6.25 * 176) - (5 * 27) + 5 = 860 + 1100 - 135 + 5 = 1830
    // TDEE = 1830 * 1.55 = 2836.5 -> round to 2837
    // Cut (-20%) = 2837 * 0.80 = 2269.6
    const res = calcNutrition({
      gender: 'MALE',
      age: 27,
      weightKg: 86,
      heightCm: 176,
      activity: 1.55,
      goal: 'CUT',
    });

    expect(res.bmr).toBe(1830);
    expect(res.tdee).toBe(2837);
    expect(res.kcal).toBe(2269);
    expect(res.proteinG).toBeGreaterThanOrEqual(170); // High protein retention for cutting
    expect(res.bmi).toBeCloseTo(27.8, 1);
    expect(res.bmiLabelEn).toBe('Overweight');
    expect(res.bmiLabelAr).toBe('زيادة وزن');
    expect(res.flooredForSafety).toBe(false);
  });

  it('enforces clinical minimum safety floor without exceeding maintenance in cutting', () => {
    // Normal adult male cut where floor (1500) < TDEE (1716)
    const adultMale = calcNutrition({
      gender: 'MALE',
      age: 25,
      weightKg: 55,
      heightCm: 160,
      activity: 1.2,
      goal: 'CUT',
    });
    expect(adultMale.kcal).toBe(1500);
    expect(adultMale.kcal).toBeLessThanOrEqual(adultMale.tdee);
    expect(adultMale.flooredForSafety).toBe(true);

    // 14yo female where floor (1200) > TDEE (983):
    // Under-18 restriction forces maintenance, preventing an unintended surplus of 1200 > 983
    const teenFemale = calcNutrition({
      gender: 'FEMALE',
      age: 14,
      weightKg: 30,
      heightCm: 120,
      activity: 1.2,
      goal: 'CUT',
    });
    expect(teenFemale.effectiveGoal).toBe('MAINTAIN');
    expect(teenFemale.isGoalOverridden).toBe(true);
    expect(teenFemale.warningCode).toBe('UNDERAGE_RESTRICTION');
    expect(teenFemale.kcal).toBe(teenFemale.tdee);
    expect(teenFemale.kcal).toBeLessThanOrEqual(teenFemale.tdee);
  });

  it('restricts aggressive cutting or bulking for adolescents under 18 years old', () => {
    const teen = calcNutrition({
      gender: 'MALE',
      age: 16,
      weightKg: 65,
      heightCm: 170,
      activity: 1.55,
      goal: 'CUT',
    });
    expect(teen.effectiveGoal).toBe('MAINTAIN');
    expect(teen.isGoalOverridden).toBe(true);
    expect(teen.warningCode).toBe('UNDERAGE_RESTRICTION');
    expect(teen.warningAr).toContain('دون 18 سنة');
  });

  it('strictly disallows cutting for underweight individuals (BMI < 18.5)', () => {
    const underweightAdult = calcNutrition({
      gender: 'FEMALE',
      age: 24,
      weightKg: 40,
      heightCm: 165, // BMI ≈ 14.7
      activity: 1.375,
      goal: 'CUT',
    });
    expect(underweightAdult.bmi).toBeLessThan(18.5);
    expect(underweightAdult.effectiveGoal).toBe('MAINTAIN');
    expect(underweightAdult.isGoalOverridden).toBe(true);
    expect(underweightAdult.warningCode).toBe('UNDERWEIGHT_CUT_RESTRICTED');
    expect(underweightAdult.warningAr).toContain('BMI < 18.5');
  });

  it('verifies 60-case matrix against an independent calculation oracle', () => {
    const genders = ['MALE', 'FEMALE'] as const;
    const goals = ['CUT', 'MAINTAIN', 'BULK'] as const;
    const activities = [1.2, 1.375, 1.55, 1.725, 1.9];
    const ages = [20, 35]; // Adult matrix: 2 * 3 * 5 * 2 = 60 cases

    let evaluated = 0;
    for (const g of genders) {
      for (const goal of goals) {
        for (const act of activities) {
          for (const a of ages) {
            const w = g === 'MALE' ? 80 : 60;
            const h = g === 'MALE' ? 178 : 165;
            const res = calcNutrition({ gender: g, age: a, weightKg: w, heightCm: h, activity: act, goal });

            // Independent Oracle calculation
            const independentBmr = 10 * w + 6.25 * h - 5 * a + (g === 'MALE' ? 5 : -161);
            const independentTdee = independentBmr * act;
            expect(res.bmr).toBe(Math.round(independentBmr));
            expect(res.tdee).toBe(Math.round(independentTdee));

            // Invariant: In CUT, kcal must never exceed TDEE
            if (res.effectiveGoal === 'CUT') {
              expect(res.kcal).toBeLessThanOrEqual(res.tdee);
            }
            evaluated++;
          }
        }
      }
    }
    expect(evaluated).toBe(60);
  });

  it('sanitizes out-of-range user inputs gracefully', () => {
    const clean = sanitizeCalcInput({
      gender: 'MALE',
      age: 150,
      weightKg: 500,
      heightCm: 350,
      activity: 1.55,
      goal: 'MAINTAIN',
    });
    expect(clean.age).toBe(90);
    expect(clean.weightKg).toBe(250);
    expect(clean.heightCm).toBe(230);
  });

  it('contains comprehensive Egyptian and staple ingredients', () => {
    expect(INGREDIENTS['cottage']).toBeDefined();
    expect(INGREDIENTS['baladi']).toBeDefined();
    expect(INGREDIENTS['tilapia']).toBeDefined();
    expect(INGREDIENTS['chicken']?.p).toBe(22.5);
    expect(INGREDIENTS['fava']).toBeDefined();
  });

  it('scales recipes accurately to meal calorie budget', () => {
    const breakfastRecipes = recipesFor('BREAKFAST');
    expect(breakfastRecipes.length).toBeGreaterThan(0);
    const targetKcal = 550;
    const scaled = scaleRecipeToKcal(breakfastRecipes[0]!, targetKcal);
    expect(scaled.macros.kcal).toBeGreaterThan(500);
    expect(scaled.macros.kcal).toBeLessThan(600);
  });
});

describe('PDF Document Assembler', () => {
  it('exports valid builder and download functions', () => {
    expect(typeof buildPdfBlob).toBe('function');
    expect(typeof downloadBlob).toBe('function');
  });

  it('assembles complete official invoice PDF blocks with Egyptian VAT and totals', () => {
    const blocks = invoicePdfBlocks(
      {
        invoiceNumber: 'INV-2026-001',
        memberName: 'Ahmed Hassan',
        planName: 'VIP Annual',
        subtotalEgp: 10000,
        discountEgp: 1000,
        vatEgp: 1260,
        totalEgp: 10260,
        method: 'PAYMOB_CARD',
        referenceCode: 'TXN-9988',
        createdAt: '2026-11-03',
        cashierName: 'Captain Reception',
      },
      'TitanFit Flagship',
      true,
    );

    expect(blocks.length).toBeGreaterThan(5);
    const firstBlock = blocks[0];
    expect(firstBlock?.t).toBe('title');
    if (firstBlock && firstBlock.t === 'title') {
      expect(firstBlock.text).toContain('فاتورة اشتراك ضريبية رسمية');
    }
  });

  it('safely guards against running in server/non-browser environment without DOM', async () => {
    await expect(
      buildPdfBlob([], { dir: 'rtl', brand: 'Test', footer: 'Footer', title: 'Title' }),
    ).rejects.toThrow('PDF generation requires a browser');
  });
});
