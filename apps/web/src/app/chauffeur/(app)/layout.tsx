import { DriverShell } from '@/components/DriverShell';
import { requireDriver } from '@/lib/session';

export default async function DriverAppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireDriver();
  return <DriverShell name={profile.display_name ?? profile.email}>{children}</DriverShell>;
}
