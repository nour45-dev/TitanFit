import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const formatterCache = new Map<string, Intl.NumberFormat>();

/**
 * Locale-aware currency formatter (defaults to EGP and respects ar-EG / en-EG).
 * Converts minor units (piastres/cents) to formatted major currency display.
 */
export function formatMoneyMinor(
  amountMinor: number,
  currency: string = 'EGP',
  locale: 'en' | 'ar' = 'en',
): string {
  const major = amountMinor / 100;
  const hasFraction = major % 1 !== 0;
  const intlLocale = locale === 'ar' ? 'ar-EG' : 'en-EG';
  const cacheKey = `${intlLocale}:${currency}:${hasFraction ? '2' : '0'}`;

  let formatter = formatterCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    });
    formatterCache.set(cacheKey, formatter);
  }
  return formatter.format(major);
}
