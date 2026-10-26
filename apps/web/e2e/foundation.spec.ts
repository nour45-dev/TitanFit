import { expect, test } from '@playwright/test';

test.describe('GymOS Phase 0 — Bilingual RTL/LTR, Theme & Health E2E', () => {
  test('GET /api/health returns 200 OK', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.service).toBe('gymos-web');
  });

  test('renders English LTR by default and flips seamlessly to Arabic RTL and Light/Dark themes', async ({
    page,
  }) => {
    await page.goto('/');

    const rootShell = page.getByTestId('gymos-root-shell');
    await expect(rootShell).toHaveAttribute('dir', 'ltr');
    await expect(rootShell).toHaveAttribute('data-theme', 'dark');

    await expect(page.getByTestId('brand-app-name')).toHaveText('TitanFit');
    await expect(page.getByTestId('brand-logo-img')).toHaveAttribute('src', '/brand/logo.png');
    await expect(page.getByTestId('hero-heading')).toContainText('Modern Multi-Branch Gyms');

    // Switch to Arabic (RTL)
    await page.getByTestId('locale-toggle-btn').click();
    await expect(rootShell).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('hero-heading')).toContainText('للأندية الرياضية');

    // Switch to Light mode
    await page.getByTestId('theme-toggle-btn').click();
    await expect(rootShell).toHaveAttribute('data-theme', 'light');
  });
});
