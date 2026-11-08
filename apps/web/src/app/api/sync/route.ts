import { NextRequest, NextResponse } from 'next/server';

interface SyncStoreState {
  version: number;
  lastUpdated: string;
  members: any[];
  plans: any[];
  attendance: any[];
  sales: any[];
  customBranding: Record<string, any>;
  customWorkouts: any[];
  customRecipes: any[];
  customFiles: any[];
}

// Global in-memory cache for multi-device sync per tenant (persists across requests during server runtime)
const tenantSyncCache = new Map<string, SyncStoreState>();

function getOrCreateTenantState(tenantSlug: string): SyncStoreState {
  let state = tenantSyncCache.get(tenantSlug);
  if (!state) {
    state = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      members: [],
      plans: [],
      attendance: [],
      sales: [],
      customBranding: {},
      customWorkouts: [],
      customRecipes: [],
      customFiles: [],
    };
    tenantSyncCache.set(tenantSlug, state);
  }
  return state;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get('tenantSlug') || 'titanfit-cairo';
    const clientVersion = parseInt(searchParams.get('version') || '0', 10);

    const state = getOrCreateTenantState(tenantSlug);

    return NextResponse.json({
      success: true,
      tenantSlug,
      hasUpdates: state.version > clientVersion,
      data: state,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Sync fetch failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantSlug = (body.tenantSlug || 'titanfit-cairo').trim();
    const action = body.action as string;
    const payload = body.payload;

    const state = getOrCreateTenantState(tenantSlug);

    switch (action) {
      case 'INIT_STATE':
        if (state.members.length === 0 && Array.isArray(payload.members)) {
          state.members = payload.members;
        }
        if (state.plans.length === 0 && Array.isArray(payload.plans)) {
          state.plans = payload.plans;
        }
        if (state.attendance.length === 0 && Array.isArray(payload.attendance)) {
          state.attendance = payload.attendance;
        }
        if (state.sales.length === 0 && Array.isArray(payload.sales)) {
          state.sales = payload.sales;
        }
        if (state.customWorkouts.length === 0 && Array.isArray(payload.customWorkouts)) {
          state.customWorkouts = payload.customWorkouts;
        }
        if (state.customRecipes.length === 0 && Array.isArray(payload.customRecipes)) {
          state.customRecipes = payload.customRecipes;
        }
        if (state.customFiles.length === 0 && Array.isArray(payload.customFiles)) {
          state.customFiles = payload.customFiles;
        }
        break;

      case 'ADD_MEMBER':
        if (payload?.id) {
          const exists = state.members.some((m) => m.id === payload.id || m.code === payload.code);
          if (!exists) {
            state.members.unshift(payload);
          }
        }
        break;

      case 'UPDATE_MEMBER':
        if (payload?.id) {
          state.members = state.members.map((m) => (m.id === payload.id ? { ...m, ...payload } : m));
        }
        break;

      case 'DELETE_MEMBER':
        if (payload?.memberId) {
          state.members = state.members.filter((m) => m.id !== payload.memberId);
        }
        break;

      case 'ADD_PLAN':
        if (payload?.id) {
          const exists = state.plans.some((p) => p.id === payload.id);
          if (!exists) {
            state.plans.push(payload);
          }
        }
        break;

      case 'UPDATE_PLAN':
        if (payload?.planId) {
          state.plans = state.plans.map((p) => (p.id === payload.planId ? { ...p, ...payload.updates } : p));
        }
        break;

      case 'DELETE_PLAN':
        if (payload?.planId) {
          state.plans = state.plans.filter((p) => p.id !== payload.planId);
        }
        break;

      case 'RECORD_CHECKIN':
        if (payload) {
          state.attendance.unshift(payload);
          if (payload.memberId) {
            state.members = state.members.map((m) =>
              m.id === payload.memberId || m.code === payload.memberCode
                ? { ...m, checkInsCount: (m.checkInsCount || 0) + 1, lastCheckIn: 'Just now' }
                : m
            );
          }
        }
        break;

      case 'RECORD_SALE':
        if (payload?.id) {
          state.sales.unshift(payload);
        }
        break;

      case 'SET_BRANDING':
        if (payload) {
          state.customBranding = { ...state.customBranding, ...payload };
        }
        break;

      case 'ADD_CUSTOM_WORKOUT':
        if (payload?.id) {
          const exists = state.customWorkouts.some((w) => w.id === payload.id);
          if (!exists) {
            state.customWorkouts.unshift(payload);
          }
        }
        break;

      case 'UPDATE_CUSTOM_WORKOUT':
        if (payload?.id) {
          state.customWorkouts = state.customWorkouts.map((w) =>
            w.id === payload.id ? { ...w, ...payload.updates } : w
          );
        }
        break;

      case 'DELETE_CUSTOM_WORKOUT':
        if (payload?.id) {
          state.customWorkouts = state.customWorkouts.filter((w) => w.id !== payload.id);
        }
        break;

      case 'ADD_CUSTOM_RECIPE':
        if (payload?.id) {
          const exists = state.customRecipes.some((r) => r.id === payload.id);
          if (!exists) {
            state.customRecipes.unshift(payload);
          }
        }
        break;

      case 'UPDATE_CUSTOM_RECIPE':
        if (payload?.id) {
          state.customRecipes = state.customRecipes.map((r) =>
            r.id === payload.id ? { ...r, ...payload.updates } : r
          );
        }
        break;

      case 'DELETE_CUSTOM_RECIPE':
        if (payload?.id) {
          state.customRecipes = state.customRecipes.filter((r) => r.id !== payload.id);
        }
        break;

      case 'ADD_CUSTOM_FILE':
        if (payload?.id) {
          const exists = state.customFiles.some((f) => f.id === payload.id);
          if (!exists) {
            state.customFiles.unshift(payload);
          }
        }
        break;

      case 'DELETE_CUSTOM_FILE':
        if (payload?.id) {
          state.customFiles = state.customFiles.filter((f) => f.id !== payload.id);
        }
        break;

      default:
        break;
    }

    state.version += 1;
    state.lastUpdated = new Date().toISOString();

    return NextResponse.json({
      success: true,
      tenantSlug,
      version: state.version,
      lastUpdated: state.lastUpdated,
      data: state,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Sync action failed' },
      { status: 500 }
    );
  }
}
