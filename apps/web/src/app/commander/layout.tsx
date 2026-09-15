import { SiteFooter, SiteHeader } from '@/components/SiteChrome';

export default function CommanderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
