import { describe, expect, it } from 'vitest';
import { DICTIONARIES } from './i18n/dictionaries';

describe('@gymos/web bilingual dictionaries', () => {
  it('provides complete English and Arabic translation keys', () => {
    expect(DICTIONARIES.en.hero.title).toContain('Gym');
    expect(DICTIONARIES.ar.hero.title).toContain('للأندية الرياضية');
    expect(DICTIONARIES.ar.system.egyptPaymentsBadge).toContain('فوري');
  });
});
