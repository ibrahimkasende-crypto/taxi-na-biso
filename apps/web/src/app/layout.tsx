import { DM_Sans } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

import { PwaRegister } from '@/components/PwaRegister';
import { brand } from '@/config/brand';
import { siteUrl } from '@/lib/urls';

import './globals.css';

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: brand.appName, template: `%s · ${brand.appName}` },
  description: `${brand.tagline} — déplacements à ${brand.defaultCity}.`,
  applicationName: brand.appName,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/branding/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/branding/favicon.png',
  },
  openGraph: {
    title: brand.appName,
    description: brand.tagline,
    locale: 'fr_CD',
    type: 'website',
    images: [{ url: '/branding/splash-passenger.png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#F04A18',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={sans.variable}>
      <body className={`${sans.className} min-h-screen bg-canvas text-ink antialiased`}>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
