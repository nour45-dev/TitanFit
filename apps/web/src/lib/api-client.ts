/**
 * Typed API Client for TitanFit Web Application
 * Handles authentication, session management, and server communication.
 */

export interface LoginCredentials {
  identifier?: string;
  email?: string;
  password?: string;
  tenantSlug?: string;
  gymSecretCode?: string;
  matchedTenant?: {
    id?: string;
    slug: string;
    nameEn: string;
    nameAr: string;
    ownerEmail: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  matchedMember?: {
    id: string;
    code: string;
    email: string;
    fullNameEn: string;
    fullNameAr: string;
    tenantSlug?: string;
  };
}

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantSlug: string;
  logoUrl?: string;
  primaryColor?: string;
  permissions?: string[];
}

export interface LoginResult {
  success: boolean;
  user?: AuthSessionUser;
  tenant?: any;
  message?: string;
}

const API_TIMEOUT_MS = 10000;

export async function apiLogin(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network connection failed',
    };
  }
}

export async function apiLogout(): Promise<{ success: boolean }> {
  try {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    return await res.json();
  } catch {
    return { success: true };
  }
}

export async function apiRequestOtp(identifier: string, matchedMember?: any): Promise<{
  success: boolean;
  message?: string;
  targetInfo?: {
    memberName: string;
    memberCode: string;
    maskedPhone: string;
    maskedEmail: string;
  };
  simulatedOtp?: string;
  demoBackupOtp?: string;
}> {
  try {
    const res = await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REQUEST_OTP', identifier, matchedMember }),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'OTP request failed',
    };
  }
}

export async function apiVerifyOtp(identifier: string, otpCode: string): Promise<{
  success: boolean;
  message?: string;
  user?: AuthSessionUser;
}> {
  try {
    const res = await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'VERIFY_OTP', identifier, otpCode }),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'OTP verification failed',
    };
  }
}

export async function apiGetMe(): Promise<{ success: boolean; user?: AuthSessionUser }> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { success: false };
    }
    const data = await res.json();
    return { success: true, user: data.user };
  } catch {
    return { success: false };
  }
}

export async function apiRevokeSessions(): Promise<{ success: boolean; revokedCount?: number }> {
  try {
    const res = await fetch('/api/auth/sessions/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    const data = await res.json();
    return data;
  } catch {
    return { success: false };
  }
}

export interface SyncActionPayload {
  tenantSlug: string;
  action:
    | 'INIT_STATE'
    | 'ADD_MEMBER'
    | 'UPDATE_MEMBER'
    | 'DELETE_MEMBER'
    | 'ADD_PLAN'
    | 'UPDATE_PLAN'
    | 'DELETE_PLAN'
    | 'RECORD_CHECKIN'
    | 'RECORD_SALE'
    | 'SET_BRANDING'
    | 'ADD_CUSTOM_WORKOUT'
    | 'UPDATE_CUSTOM_WORKOUT'
    | 'DELETE_CUSTOM_WORKOUT'
    | 'ADD_CUSTOM_RECIPE'
    | 'UPDATE_CUSTOM_RECIPE'
    | 'DELETE_CUSTOM_RECIPE'
    | 'ADD_CUSTOM_FILE'
    | 'DELETE_CUSTOM_FILE'
    | 'REGISTER_TENANT'
    | 'DELETE_TENANT';
  payload: any;
}

export async function apiFetchSyncState(tenantSlug: string, version = 0) {
  try {
    const res = await fetch(`/api/sync?tenantSlug=${encodeURIComponent(tenantSlug)}&version=${version}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiPushSyncAction(action: SyncActionPayload) {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}


export interface CheckoutPayload {
  tenantSlug?: string;
  memberId: string;
  memberNameAr: string;
  memberNameEn: string;
  planId: string;
  planNameAr: string;
  planNameEn: string;
  amountEgp: number;
  paymentProvider: 'PAYMOB_CARD' | 'FAWRY' | 'INSTAPAY' | 'CASH';
  phone: string;
  instaPayReference?: string;
}

export async function apiProcessCheckout(payload: CheckoutPayload) {
  try {
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
