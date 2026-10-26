import { z } from 'zod';

/**
 * Granular Permission-Based RBAC Definitions (Roles -> Permissions)
 * Endpoints NEVER check hardcoded role names; they check these permissions.
 */
export const PERMISSIONS = [
  // Platform Super Admin
  'platform:tenants:read',
  'platform:tenants:manage',
  'platform:plans:manage',
  'platform:impersonate',
  'platform:analytics:read',

  // Tenant & Branch Administration
  'tenant:settings:read',
  'tenant:settings:manage',
  'branches:read',
  'branches:manage',
  'staff:read',
  'staff:manage',
  'roles:manage',
  'audit_logs:read',

  // Members & Health
  'members:read',
  'members:create',
  'members:update',
  'members:delete',
  'members:health:read',
  'members:health:write',

  // Subscriptions & Plans
  'plans:read',
  'plans:manage',
  'subscriptions:read',
  'subscriptions:create',
  'subscriptions:freeze',
  'subscriptions:cancel',
  'subscriptions:override_price',

  // Payments & Invoices
  'payments:read',
  'payments:collect',
  'payments:verify_instapay',
  'payments:refund',
  'invoices:read',
  'invoices:export',

  // Classes & Bookings
  'classes:read',
  'classes:manage',
  'bookings:read',
  'bookings:manage',
  'bookings:self',

  // Attendance & Access Control
  'attendance:read',
  'attendance:scan_qr',
  'attendance:manual_checkin',
  'attendance:override_block',

  // Workouts, Nutrition & Progress
  'workouts:read',
  'workouts:manage',
  'workouts:log_self',
  'nutrition:read',
  'nutrition:manage',
  'progress:self',

  // POS & Reports
  'pos:sell',
  'pos:inventory:manage',
  'reports:financial:read',
  'reports:attendance:read',
  'reports:export',
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number];

export const PermissionSchema = z.enum(PERMISSIONS);

export const SYSTEM_ROLE_KEYS = [
  'SUPER_ADMIN',
  'GYM_OWNER',
  'BRANCH_MANAGER',
  'RECEPTIONIST',
  'TRAINER',
  'MEMBER',
] as const;

export type SystemRoleKey = (typeof SYSTEM_ROLE_KEYS)[number];
