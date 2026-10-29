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

  it('enforces clinical minimum safety floor (never below 1500 kcal for men or 1200 for women)', () => {
    const extremeDeficit = calcNutrition({
      gender: 'MALE',
      age: 25,
      weightKg: 60,
      heightCm: 165,
      activity: 1.2, // sedentary
      goal: 'CUT',
    });
    expect(extremeDeficit.kcal).toBeGreaterThanOrEqual(1500);
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

  it('safely guards against running in server/non-browser environment without DOM', async () => {
    await expect(
      buildPdfBlob([], { dir: 'rtl', brand: 'Test', footer: 'Footer', title: 'Title' }),
    ).rejects.toThrow('PDF generation requires a browser');
  });
});
