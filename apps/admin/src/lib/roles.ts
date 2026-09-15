export function isStaffRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'operator_owner' || role === 'dispatcher' || role === 'support';
}
