import { describe, expect, it } from 'vitest';
import { DESIGN_TOKENS, buildTenantCssVariables, formatMoneyMinor } from './index.js';

describe('@gymos/ui Design System', () => {
  it('enforces WCAG 2.1 AA minimum 44px touch target token', () => {
    expect(DESIGN_TOKENS.spacing.touchTargetMinPx).toBeGreaterThanOrEqual(44);
  });

  it('generates tenant-specific CSS custom variables for white-label re-branding', () => {
    const vars = buildTenantCssVariables({ primaryHex: '#3B82F6', accentHex: '#EC4899' });
    expect(vars['--gymos-primary']).toBe('#3B82F6');
    expect(vars['--gymos-accent']).toBe('#EC4899');
  });

  it('formats EGP minor units (piastres) in English and Arabic locales', () => {
    const enFormatted = formatMoneyMinor(150000, 'EGP', 'en');
    const arFormatted = formatMoneyMinor(150000, 'EGP', 'ar');
    expect(enFormatted).toContain('1,500');
    expect(arFormatted.length).toBeGreaterThan(0);
  }, 15000);
});
