import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';

export default function CommanderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
