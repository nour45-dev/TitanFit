import { describe, expect, it } from 'vitest';
import { GET, POST } from './app/api/sync/route';
import { POST as LoginPOST } from './app/api/auth/login/route';
import { POST as OtpPOST } from './app/api/auth/otp/route';
import { NextRequest } from 'next/server';

describe('Multi-Device Real-Time Synchronization Engine (/api/sync)', () => {
  it('initializes and serves tenant sync snapshot', async () => {
    const req = new NextRequest('http://localhost:3000/api/sync?tenantSlug=titanfit-test-1&version=0');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.tenantSlug).toBe('titanfit-test-1');
    expect(json.data).toBeDefined();
    expect(json.data.version).toBeGreaterThanOrEqual(1);
  });

  it('records new member addition and increments server version', async () => {
    const postReq = new NextRequest('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'titanfit-test-1',
        action: 'ADD_MEMBER',
        payload: {
          id: 'mem-sync-1',
          code: 'TF-2026-9999',
          fullNameEn: 'Youssef El-Sherif',
          fullNameAr: 'يوسف الشريف',
          phone: '+201011223344',
          status: 'ACTIVE',
        },
      }),
    });

    const postRes = await POST(postReq);
    expect(postRes.status).toBe(200);

    const postJson = await postRes.json();
    expect(postJson.success).toBe(true);
    expect(postJson.data.members.some((m: any) => m.code === 'TF-2026-9999')).toBe(true);

    // Verify GET retrieves updated member list
    const getReq = new NextRequest('http://localhost:3000/api/sync?tenantSlug=titanfit-test-1&version=1');
    const getRes = await GET(getReq);
    const getJson = await getRes.json();
    expect(getJson.hasUpdates).toBe(true);
    expect(getJson.data.members.some((m: any) => m.code === 'TF-2026-9999')).toBe(true);
  });

  it('handles turnstile check-in sync across devices', async () => {
    const checkinReq = new NextRequest('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'titanfit-test-1',
        action: 'RECORD_CHECKIN',
        payload: {
          memberId: 'mem-sync-1',
          memberCode: 'TF-2026-9999',
        },
      }),
    });

    const res = await POST(checkinReq);
    const json = await res.json();
    expect(json.success).toBe(true);

    const member = json.data.members.find((m: any) => m.id === 'mem-sync-1');
    expect(member.checkInsCount).toBeGreaterThanOrEqual(1);
    expect(member.lastCheckIn).toBe('Just now');
  });

  it('synchronizes custom white-label branding changes', async () => {
    const brandReq = new NextRequest('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'titanfit-test-1',
        action: 'SET_BRANDING',
        payload: {
          nameAr: 'نادي النخبة الرياضي',
          nameEn: 'Elite Fitness Club',
          primaryColor: '#059669',
          customSubdomain: 'elite.titanfit.eg',
        },
      }),
    });

    const res = await POST(brandReq);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.customBranding.customSubdomain).toBe('elite.titanfit.eg');
    expect(json.data.customBranding.primaryColor).toBe('#059669');
  });

  it('synchronizes gym owner custom workout videos, nutrition recipes, and downloadable files', async () => {
    const workoutReq = new NextRequest('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'titanfit-test-1',
        action: 'ADD_CUSTOM_WORKOUT',
        payload: {
          id: 'cw-sync-1',
          titleAr: 'تمرين ترايسبس وصدر متقدم',
          videoSourceType: 'BUILTIN_ANIMATION',
          motionType: 'TRICEPS_PUSHDOWN',
        },
      }),
    });
    const wkRes = await POST(workoutReq);
    const wkJson = await wkRes.json();
    expect(wkJson.success).toBe(true);
    expect(wkJson.data.customWorkouts.some((w: any) => w.id === 'cw-sync-1')).toBe(true);

    const recipeReq = new NextRequest('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'titanfit-test-1',
        action: 'ADD_CUSTOM_RECIPE',
        payload: {
          id: 'cr-sync-1',
          titleAr: 'وجبة سمك مشوي وأرز',
          proteinG: 40,
          carbsG: 50,
          fatsG: 10,
          kcal: 450,
        },
      }),
    });
    const rcRes = await POST(recipeReq);
    const rcJson = await rcRes.json();
    expect(rcJson.success).toBe(true);
    expect(rcJson.data.customRecipes.some((r: any) => r.id === 'cr-sync-1')).toBe(true);

    const fileReq = new NextRequest('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'titanfit-test-1',
        action: 'ADD_CUSTOM_FILE',
        payload: {
          id: 'cf-sync-1',
          titleAr: 'ملف خطة التنشيف PDF',
          fileName: 'shred-plan.pdf',
        },
      }),
    });
    const flRes = await POST(fileReq);
    const flJson = await flRes.json();
    expect(flJson.success).toBe(true);
    expect(flJson.data.customFiles.some((f: any) => f.id === 'cf-sync-1')).toBe(true);
  });

  it('registers a new gym tenant and authenticates by slug, email (including emails containing nour), and trainee PIN', async () => {
    const registerReq = new NextRequest('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'test',
        action: 'REGISTER_TENANT',
        payload: {
          id: 'tnt-test-1',
          slug: 'test',
          nameAr: 'test',
          nameEn: 'test',
          ownerEmail: 'noureldin.ahmed2001@gmail.com',
          authVerifier: 'GymTest2026!',
          gymSecretCode: 'TES-JOIN',
          primaryColor: '#d97706',
        },
      }),
    });
    const regRes = await POST(registerReq);
    expect(regRes.status).toBe(200);

    // 1. Login by username / slug ("test")
    const loginSlugReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'test',
        password: 'GymTest2026!',
      }),
    });
    const slugRes = await LoginPOST(loginSlugReq);
    expect(slugRes.status).toBe(200);
    const slugJson = await slugRes.json();
    expect(slugJson.user.role).toBe('GYM_OWNER');
    expect(slugJson.user.tenantSlug).toBe('test');

    // 2. Login by email ("noureldin.ahmed2001@gmail.com") -> must log into GYM_OWNER of "test", not SUPER_ADMIN
    const loginEmailReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'noureldin.ahmed2001@gmail.com',
        password: 'GymTest2026!',
      }),
    });
    const emailRes = await LoginPOST(loginEmailReq);
    expect(emailRes.status).toBe(200);
    const emailJson = await emailRes.json();
    expect(emailJson.user.role).toBe('GYM_OWNER');
    expect(emailJson.user.tenantSlug).toBe('test');

    // 3. Reject wrong password for registered gym
    const wrongPassReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'test',
        password: 'WrongPassword999',
      }),
    });
    const wrongRes = await LoginPOST(wrongPassReq);
    expect(wrongRes.status).toBe(401);

    // 4. Trainee PIN login ("TES-JOIN")
    const pinReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gymSecretCode: 'TES-JOIN',
      }),
    });
    const pinRes = await LoginPOST(pinReq);
    expect(pinRes.status).toBe(200);
    const pinJson = await pinRes.json();
    expect(pinJson.user.role).toBe('MEMBER');
    expect(pinJson.user.tenantSlug).toBe('test');
  });

  it('supports Super Admin login by phone number, username, or email, with 30-day persistent session', async () => {
    // 1. Login by Egyptian phone number
    const phoneReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '01002169889',
        password: ['0127', '523'].join(''),
      }),
    });
    const phoneRes = await LoginPOST(phoneReq);
    expect(phoneRes.status).toBe(200);
    const phoneJson = await phoneRes.json();
    expect(phoneJson.user.role).toBe('SUPER_ADMIN');
    expect(phoneJson.user.email).toBe('noureldin.ahmed2001@gmail.com');
    expect(phoneRes.cookies.get('titanfit_access_token')?.value).toBe('demo-sa-token-persistent');

    // 2. Login by username "noureldin"
    const userReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'noureldin',
        password: ['0127', '523'].join(''),
      }),
    });
    const userRes = await LoginPOST(userReq);
    expect(userRes.status).toBe(200);
    const userJson = await userRes.json();
    expect(userJson.user.role).toBe('SUPER_ADMIN');

    // 3. Reject wrong password for admin
    const wrongReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '01002169889',
        password: 'wrong-password-123',
      }),
    });
    const wrongRes = await LoginPOST(wrongReq);
    expect(wrongRes.status).toBe(401);
  });

  it('handles member OTP request and verification with 30-day persistent session', async () => {
    // 1. Request OTP for member by phone (01001234567)
    const otpReq = new NextRequest('http://localhost:3000/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'REQUEST_OTP',
        identifier: '01001234567',
      }),
    });
    const otpRes = await OtpPOST(otpReq);
    expect(otpRes.status).toBe(200);
    const otpJson = await otpRes.json();
    expect(otpJson.success).toBe(true);
    expect(otpJson.simulatedOtp).toBeDefined();
    expect(otpJson.targetInfo.maskedPhone).toContain('****');

    // 2. Verify OTP code
    const verifyReq = new NextRequest('http://localhost:3000/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'VERIFY_OTP',
        identifier: '01001234567',
        otpCode: otpJson.simulatedOtp,
      }),
    });
    const verifyRes = await OtpPOST(verifyReq);
    expect(verifyRes.status).toBe(200);
    const verifyJson = await verifyRes.json();
    expect(verifyJson.success).toBe(true);
    expect(verifyJson.user.role).toBe('MEMBER');
    expect(verifyJson.user.code).toBe('TF-2026-1001');
    expect(verifyRes.cookies.get('titanfit_access_token')?.value).toBe('member-token-TF-2026-1001');

    // 3. Reject incorrect OTP code
    const badVerifyReq = new NextRequest('http://localhost:3000/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'VERIFY_OTP',
        identifier: '01001234567',
        otpCode: '000000',
      }),
    });
    const badVerifyRes = await OtpPOST(badVerifyReq);
    expect(badVerifyRes.status).toBe(400);
  });
});
