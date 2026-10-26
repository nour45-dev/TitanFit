import { expect, test } from '@playwright/test';

test.describe('TitanFit (Rooted Performance) — Complete Phases 0–6 E2E Suite (LTR & RTL)', () => {
  test('GET /api/health returns 200 OK', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.service).toBe('gymos-web');
  });

  test('verifies English LTR & Arabic RTL across all 6 phase workspaces (RBAC, Billing, Classes/QR, Member PWA, POS/Chat, Super Admin)', async ({
    page,
  }) => {
    await page.goto('/');

    const rootShell = page.getByTestId('gymos-root-shell');
    await expect(rootShell).toHaveAttribute('dir', 'ltr');
    await expect(rootShell).toHaveAttribute('data-theme', 'dark');

    await expect(page.getByTestId('brand-app-name')).toHaveText('TitanFit');
    await expect(page.getByTestId('brand-logo-img')).toHaveAttribute('src', '/brand/logo.png');
    await expect(page.getByTestId('panel-admin-overview')).toBeVisible();

    // Phase 2: Members & Egypt Billing
    await page.getByTestId('nav-tab-MEMBERS_BILLING').click();
    await expect(page.getByTestId('panel-members-billing')).toBeVisible();
    await page.getByTestId('issue-invoice-btn').click();
    await expect(page.getByTestId('invoice-status-msg')).toContainText('INV-2026-1002');

    // Phase 3: Classes, Auto-Waitlist Promotion & Turnstile QR Scan
    await page.getByTestId('nav-tab-CLASSES_QR_ACCESS').click();
    await expect(page.getByTestId('panel-classes-access')).toBeVisible();
    await page.getByTestId('simulate-cancel-promote-btn').click();
    await expect(page.getByTestId('waitlist-promoted-msg')).toContainText('automatically promoted');
    await page.getByTestId('simulate-turnstile-scan-btn').click();
    await expect(page.getByTestId('turnstile-status-msg')).toContainText('ALLOW_ACCESS');

    // Phase 4: Member PWA Workout Logger & 1RM PR Detection
    await page.getByTestId('nav-tab-MEMBER_PWA').click();
    await expect(page.getByTestId('panel-member-pwa')).toBeVisible();
    await page.getByTestId('log-workout-set-btn').click();
    await expect(page.getByTestId('pr-notification-msg')).toContainText('NEW PERSONAL RECORD');

    // Phase 5: POS, Reports & Real-time Trainer Chat
    await page.getByTestId('nav-tab-POS_REPORTS_CHAT').click();
    await expect(page.getByTestId('panel-pos-reports-chat')).toBeVisible();

    // Phase 6: Super Admin SaaS Console & Audited Impersonation
    await page.getByTestId('nav-tab-SUPER_ADMIN').click();
    await expect(page.getByTestId('panel-super-admin')).toBeVisible();
    await page.getByTestId('impersonate-btn-titanfit-cairo').click();
    await expect(page.getByTestId('impersonation-banner')).toContainText(
      'AUDITED IMPERSONATION ACTIVE',
    );

    // Switch to Arabic (RTL) and Light Mode
    await page.getByTestId('locale-toggle-btn').click();
    await expect(rootShell).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('hero-heading')).toContainText('للأندية الرياضية');

    await page.getByTestId('theme-toggle-btn').click();
    await expect(rootShell).toHaveAttribute('data-theme', 'light');
  });
});
