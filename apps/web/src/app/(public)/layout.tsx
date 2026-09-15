import { SiteFooter, SiteHeader } from '@/components/SiteChrome';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-x-clip">{children}</main>
      <SiteFooter />
    </>
  );
}
