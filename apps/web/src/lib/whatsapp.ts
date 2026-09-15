import { WHATSAPP_E164 } from '@/config/fleet';

export function whatsAppUrl(phoneDigits: string, message: string): string {
  const digits = phoneDigits.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function officialWhatsAppUrl(message: string): string {
  return whatsAppUrl(WHATSAPP_E164, message);
}

export function openWhatsApp(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
