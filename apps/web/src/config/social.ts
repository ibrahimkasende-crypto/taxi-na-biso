import { officialWhatsAppUrl } from '@/lib/whatsapp';

/** Comptes officiels uniquement. `href: null` = non publié, pas de faux profil. */
export const socialLinks = {
  facebook: { label: 'Facebook', href: null as string | null },
  instagram: { label: 'Instagram', href: null as string | null },
  tiktok: { label: 'TikTok', href: null as string | null },
} as const;

export function footerWhatsAppUrl(): string {
  return officialWhatsAppUrl('Bonjour TAXI NA BISO 👋\nJe souhaite obtenir des informations sur vos services.');
}
