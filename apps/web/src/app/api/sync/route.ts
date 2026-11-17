import { NextRequest, NextResponse } from 'next/server';
import {
  getServerTenantRegistry,
  registerServerMember,
  registerServerTenant,
  removeServerTenant,
} from '../../../lib/tenant-registry';
import {
  isPostgresConfigured,
  dbGetTenantState,
  dbSaveTenantState,
  dbListTenants,
  dbUpsertTenant,
  dbDeleteTenantBySlug,
  dbUpsertRegisteredMember,
} from '../../../lib/postgres-store';

interface SyncStoreState {
  version: number;
  lastUpdated: string;
  members: any[];
  plans: any[];
  branches: any[];
  invoices: any[];
  classes: any[];
  staff: any[];
  attendance: any[];
  sales: any[];
  customBranding: Record<string, any>;
  customWorkouts: any[];
  customRecipes: any[];
  customFiles: any[];
}

// Global in-memory cache for multi-device sync per tenant (used as fast cache & test fallback)
const tenantSyncCache = new Map<string, SyncStoreState>();

function getOrCreateTenantState(tenantSlug: string): SyncStoreState {
  let state = tenantSyncCache.get(tenantSlug);
  if (!state) {
    state = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      members: [],
      plans: [],
      branches: [],
      invoices: [],
      classes: [],
      staff: [],
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

    let state = getOrCreateTenantState(tenantSlug);
    const registry = getServerTenantRegistry();
    let registeredTenants = Array.from(registry.tenants.values());

    if (isPostgresConfigured()) {
      const pgState = await dbGetTenantState(tenantSlug);
      if (pgState) {
        state = pgState;
        tenantSyncCache.set(tenantSlug, pgState);
      }
      registeredTenants = await dbListTenants();
    }

    return NextResponse.json({
      success: true,
      tenantSlug,
      hasUpdates: state.version > clientVersion,
      data: {
        ...state,
        registeredTenants,
      },
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

    let state = getOrCreateTenantState(tenantSlug);
    if (isPostgresConfigured()) {
      const pgState = await dbGetTenantState(tenantSlug);
      if (pgState) {
        state = pgState;
      }
    }

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
          const memberEntry = {
            id: payload.id,
            code: payload.code || '',
            email: payload.email || '',
            phone: payload.phone || '',
            fullNameEn: payload.fullNameEn || '',
            fullNameAr: payload.fullNameAr || '',
            tempPassword: payload.tempPassword,
            tenantSlug,
          };
          registerServerMember(memberEntry);
          if (isPostgresConfigured()) {
            await dbUpsertRegisteredMember(memberEntry);
          }
        }
        break;

      case 'ADD_BRANCH':
        if (payload?.id) {
          const exists = state.branches.some((b) => b.id === payload.id);
          if (!exists) {
            state.branches.push(payload);
          }
        }
        break;

      case 'UPDATE_BRANCH':
        if (payload?.branchId) {
          state.branches = state.branches.map((b) =>
            b.id === payload.branchId ? { ...b, ...payload.updates } : b,
          );
        }
        break;

      case 'DELETE_BRANCH':
        if (payload?.branchId) {
          state.branches = state.branches.filter((b) => b.id !== payload.branchId);
        }
        break;

      case 'SYNC_GYM_SNAPSHOT':
        if (payload) {
          if (Array.isArray(payload.branches)) state.branches = payload.branches;
          if (Array.isArray(payload.members)) state.members = payload.members;
          if (Array.isArray(payload.plans)) state.plans = payload.plans;
          if (Array.isArray(payload.invoices)) state.invoices = payload.invoices;
          if (Array.isArray(payload.classes)) state.classes = payload.classes;
          if (Array.isArray(payload.staff)) state.staff = payload.staff;
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

      case 'REGISTER_TENANT':
        if (payload?.slug) {
          const tenantPayload = {
            id: payload.id || `ten-${Date.now()}`,
            slug: payload.slug,
            nameEn: payload.nameEn || payload.slug,
            nameAr: payload.nameAr || payload.nameEn || payload.slug,
            ownerUsername: payload.ownerUsername || payload.slug,
            ownerEmail: payload.ownerEmail || `owner@${payload.slug}.eg`,
            ownerPhone: payload.ownerPhone,
            authVerifier: payload.authVerifier,
            gymSecretCode: payload.gymSecretCode || 'TF-JOIN',
            logoUrl: payload.logoUrl || '/brand/logo.png',
            primaryColor: payload.primaryColor || '#059669',
            planTier: payload.planTier || 'PRO',
            billingCycle: payload.billingCycle || 'MONTHLY',
            subscriptionDurationDays: payload.subscriptionDurationDays || 30,
            subscriptionStartedAt: payload.subscriptionStartedAt || new Date().toISOString(),
            subscriptionExpiresAt:
              payload.subscriptionExpiresAt ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: payload.status || 'ACTIVE',
            branchesCount: payload.branchesCount,
            activeMembersCount: payload.activeMembersCount,
            trainersCount: payload.trainersCount,
            mrrEgp: payload.mrrEgp,
            cityEn: payload.cityEn,
            cityAr: payload.cityAr,
          };
          registerServerTenant(tenantPayload);
          if (isPostgresConfigured()) {
            await dbUpsertTenant(tenantPayload);
          }
        }
        break;

      case 'DELETE_TENANT':
        if (payload?.tenantId || payload?.slug) {
          const targetSlug = payload.slug || payload.tenantId;
          removeServerTenant(targetSlug);
          if (isPostgresConfigured() && payload.slug) {
            await dbDeleteTenantBySlug(payload.slug);
          }
        }
        break;

      default:
        break;
    }

    state.version += 1;
    state.lastUpdated = new Date().toISOString();
    tenantSyncCache.set(tenantSlug, state);

    if (isPostgresConfigured() && action !== 'DELETE_TENANT') {
      await dbSaveTenantState(tenantSlug, state);
    }

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
