import { adminHome as adminHomeUrl, adminLoginUrl as adminLoginHref, adminUrl } from './urls';

export type AppRole =
  | 'rider'
  | 'driver'
  | 'dispatcher'
  | 'admin'
  | 'operator_owner'
  | 'support';

export function canAccessClient(role: string | null | undefined): boolean {
  return role === 'rider';
}

export function canAccessDriver(role: string | null | undefined): boolean {
  return role === 'driver';
}

export function isStaffRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'operator_owner' || role === 'dispatcher' || role === 'support';
}

export function canAccessStaff(role: string | null | undefined): boolean {
  return isStaffRole(role);
}

export function adminAppUrl(): string {
  return adminUrl();
}

export function adminHome(): string {
  return adminHomeUrl();
}

export function adminLoginUrl(): string {
  return adminLoginHref();
}

export function homeForRole(role: string | null | undefined): string {
  if (role === 'driver') return '/chauffeur';
  if (role === 'rider') return '/client';
  if (isStaffRole(role)) return adminHome();
  return '/connexion';
}
