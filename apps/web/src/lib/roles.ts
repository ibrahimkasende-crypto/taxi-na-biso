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

export function adminHome(): string {
  return '/admin';
}

export function adminLoginUrl(): string {
  return '/admin/login';
}

export function homeForRole(role: string | null | undefined): string {
  if (role === 'driver') return '/chauffeur';
  if (role === 'rider') return '/client';
  if (isStaffRole(role)) return adminHome();
  return '/connexion';
}
