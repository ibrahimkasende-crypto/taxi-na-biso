import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Administration', template: '%s · Admin Taxi Na Biso' },
  description: 'Console opérateur — dispatch, chauffeurs et conformité',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
