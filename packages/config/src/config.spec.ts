import { describe, expect, it } from 'vitest';
import {
  getLocaleDirection,
  getPlatformConfig,
  validateApiEnv,
  validateWebEnv,
} from './index.js';

describe('@gymos/config', () => {
  it('returns default TitanFit (Rooted Performance) brand configuration when env is empty', () => {
    const cfg = getPlatformConfig({});
    expect(cfg.appName).toBe('TitanFit');
    expect(cfg.brandSubtitle).toBe('ROOTED PERFORMANCE');
    expect(cfg.logoPath).toBe('/brand/logo.png');
    expect(cfg.defaultCurrency).toBe('EGP');
    expect(cfg.defaultLocale).toBe('en');
    expect(cfg.defaultTimezone).toBe('Africa/Cairo');
    expect(cfg.themeDefaults.memberAppDefaultMode).toBe('dark');
  });

  it('allows overriding platform brand name, locale, and currency via single config', () => {
    const cfg = getPlatformConfig({
      NEXT_PUBLIC_APP_NAME: 'PharaohFit',
      NEXT_PUBLIC_DEFAULT_LOCALE: 'ar',
      NEXT_PUBLIC_DEFAULT_CURRENCY: 'SAR',
    });
    expect(cfg.appName).toBe('PharaohFit');
    expect(cfg.defaultLocale).toBe('ar');
    expect(cfg.defaultCurrency).toBe('SAR');
    expect(cfg.tagline.ar).toContain('PharaohFit');
  });

  it('resolves RTL and LTR directions accurately', () => {
    expect(getLocaleDirection('ar')).toBe('rtl');
    expect(getLocaleDirection('en')).toBe('ltr');
  });

  it('validates complete API environment variables and rejects weak secrets', () => {
    const validEnv = {
      DATABASE_URL: 'postgresql://gymos_app:secret@localhost:5432/gymos',
      REDIS_URL: 'redis://localhost:6379',
      JWT_ACCESS_SECRET: 'a'.repeat(64),
      JWT_REFRESH_SECRET: 'b'.repeat(64),
      COOKIE_SECRET: 'c'.repeat(64),
      HEALTH_DATA_ENCRYPTION_KEY: '0123456789abcdef'.repeat(4),
      QR_HMAC_MASTER_SECRET: 'd'.repeat(64),
    };
    const parsed = validateApiEnv(validEnv);
    expect(parsed.API_PORT).toBe(4000);
    expect(parsed.STORAGE_FORCE_PATH_STYLE).toBe(true);

    expect(() =>
      validateApiEnv({
        ...validEnv,
        JWT_ACCESS_SECRET: 'too_short',
      }),
    ).toThrow(/JWT_ACCESS_SECRET/);
  });

  it('validates Web environment configuration', () => {
    const web = validateWebEnv({});
    expect(web.NEXT_PUBLIC_API_URL).toBe('http://localhost:4000/api/v1');
  });
});
