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
