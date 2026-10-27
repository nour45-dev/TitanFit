import { expect, test } from '@playwright/test';

test.describe('TitanFit (Rooted Performance) — Complete Phases 0–6 E2E Suite (Arabic RTL + Pure White Light Mode + Free Trial Hub + SaaS Super Admin Login)', () => {
  test('GET /api/health returns 200 OK', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.service).toBe('gymos-web');
  });

  test('verifies Arabic RTL & White Light Mode by default, Diet & Cheat Storefront, Free Video Workouts Hub, and Super Admin Authentication into all 6 ERP phases', async ({
    page,
  }) => {
    await page.goto('/');

    const rootShell = page.getByTestId('gymos-root-shell');
    await expect(rootShell).toHaveAttribute('dir', 'rtl');
    await expect(rootShell).toHaveAttribute('data-theme', 'light');

    await expect(page.getByTestId('brand-app-name')).toHaveText('TitanFit');
    await expect(page.getByTestId('brand-logo-img')).toHaveAttribute('src', '/brand/logo.png');

    // 1. Public Storefront (Diet & Cheat style) opens by default in Arabic RTL
    await expect(page.getByTestId('panel-public-storefront')).toBeVisible();
    await expect(page.getByTestId('free-calorie-calculator')).toBeVisible();

    // 2. Open Free Trial Video Workouts & Meal Plans Hub
    await page.getByTestId('open-free-trial-hub-btn').click();
    await expect(page.getByTestId('panel-free-trial-hub')).toBeVisible();

    // 3. Authenticate as SaaS Super Admin (Email + Password)
    await page.getByTestId('open-login-modal-btn').click();
    await page.getByTestId('login-email-input').fill('admin@titanfit.com');
    await page.getByTestId('login-password-input').fill('admin123');
    await page.getByTestId('login-submit-btn').click();

    // Switch to English LTR to verify English copy across ERP phases
    await page.getByTestId('locale-toggle-btn').click();
    await expect(rootShell).toHaveAttribute('dir', 'ltr');

    // Phase 1: Executive Overview
    await page.getByTestId('nav-tab-ADMIN_OVERVIEW').click();
    await expect(page.getByTestId('panel-admin-overview')).toBeVisible();

    // Phase 2: Members & Egypt Billing
    await page.getByTestId('nav-tab-MEMBERS_BILLING').click();
    await expect(page.getByTestId('panel-members-billing')).toBeVisible();
    await page.getByTestId('issue-invoice-btn').click();
    await expect(page.getByTestId('invoice-status-msg')).toContainText('INV-2026-');

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

    // Switch back to Arabic (RTL) and verify Executive Overview & Dark Mode toggle
    await page.getByTestId('locale-toggle-btn').click();
    await expect(rootShell).toHaveAttribute('dir', 'rtl');
    await page.getByTestId('nav-tab-ADMIN_OVERVIEW').click();
    await expect(page.getByTestId('hero-heading')).toContainText('للأندية الرياضية');

    await page.getByTestId('theme-toggle-btn').click();
    await expect(rootShell).toHaveAttribute('data-theme', 'dark');
  });
});
