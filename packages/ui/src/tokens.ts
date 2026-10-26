/**
 * GymOS Multi-Tenant Design System Tokens
 * Stored as structured tokens and CSS Custom Properties so each tenant (gym)
 * can dynamically re-brand primary/accent colors while preserving WCAG 2.1 AA contrast.
 */

export interface TenantThemeOverride {
  readonly primaryHex?: string;
  readonly accentHex?: string;
  readonly borderRadiusRem?: string;
}

export const DESIGN_TOKENS = {
  colors: {
    brand: {
      primary: '#10B981', // Emerald 500 — Energetic Fitness Core
      primaryHover: '#059669', // Emerald 600
      primaryForeground: '#022C22', // Deep Emerald Contrast
      accent: '#F59E0B', // Amber 500 — Streaks, PRs & Highlights
      accentHover: '#D97706', // Amber 600
      accentForeground: '#451A03',
    },
    dark: {
      background: '#090D16', // Deep Obsidian Slate
      surface: '#111827', // Elevated Card Surface
      surfaceElevated: '#1F2937', // Glass/Modal Surface
      border: '#1E293B',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
    },
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceElevated: '#F1F5F9',
      border: '#E2E8F0',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#64748B',
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
    },
  },
  typography: {
    fontFamilies: {
      latin: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      arabic: "'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    scale: {
      xs: { fontSize: '0.75rem', lineHeight: '1.125rem' },
      sm: { fontSize: '0.875rem', lineHeight: '1.375rem' },
      base: { fontSize: '1rem', lineHeight: '1.625rem' },
      lg: { fontSize: '1.125rem', lineHeight: '1.75rem' },
      xl: { fontSize: '1.25rem', lineHeight: '1.875rem' },
      '2xl': { fontSize: '1.5rem', lineHeight: '2.125rem' },
      '3xl': { fontSize: '1.875rem', lineHeight: '2.375rem' },
      '4xl': { fontSize: '2.25rem', lineHeight: '2.75rem' },
    },
  },
  spacing: {
    touchTargetMinPx: 44, // WCAG 2.1 AA / Mobile PWA minimum tap target
    cardPadding: '1.5rem',
    sectionGap: '2rem',
  },
  radii: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    full: '9999px',
  },
  shadows: {
    cardDark: '0 10px 30px -10px rgba(0, 0, 0, 0.55)',
    cardLight: '0 4px 20px -4px rgba(15, 23, 42, 0.08)',
    glowPrimary: '0 0 24px rgba(16, 185, 129, 0.28)',
  },
  motion: {
    fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '240ms cubic-bezier(0.16, 1, 0.3, 1)',
    spring: { stiffness: 320, damping: 26 },
  },
} as const;

/**
 * Generates inline CSS custom properties for a tenant's branding override.
 */
export function buildTenantCssVariables(override?: TenantThemeOverride): Record<string, string> {
  return {
    '--gymos-primary': override?.primaryHex || DESIGN_TOKENS.colors.brand.primary,
    '--gymos-accent': override?.accentHex || DESIGN_TOKENS.colors.brand.accent,
    '--gymos-radius': override?.borderRadiusRem || DESIGN_TOKENS.radii.lg,
  };
}
