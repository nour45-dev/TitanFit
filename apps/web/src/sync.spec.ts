import { describe, expect, it } from 'vitest';
import { GET, POST } from './app/api/sync/route';
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
});
