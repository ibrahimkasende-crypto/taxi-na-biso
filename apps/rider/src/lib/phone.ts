import { brand } from '../config/brand';

export type PhoneParseResult =
  | { ok: true; phone: string }
  | { ok: false; error: string };

const INVALID = 'Entrez les 9 chiffres de votre numéro après +243.';

/**
 * Normalise un numéro RDC vers E.164 (+243XXXXXXXXX).
 *
 * Accepté : 0810000001, 810000001, +243810000001 → +243810000001
 * Refusé : +2430810000001, 2430810000001, trop court, lettres
 */
export function parseCdPhone(raw: string): PhoneParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'Saisissez votre numéro de téléphone.' };
  }

  if (/[^\d+\s-]/.test(trimmed) || (trimmed.match(/\+/g) ?? []).length > 1) {
    return { ok: false, error: INVALID };
  }
  if (trimmed.includes('+') && !trimmed.startsWith('+')) {
    return { ok: false, error: INVALID };
  }

  const compact = trimmed.replace(/[\s-]/g, '');
  const digits = compact.replace(/\D/g, '');

  if (digits.startsWith('2430')) {
    return { ok: false, error: INVALID };
  }

  let national: string;
  if (digits.startsWith('243')) {
    national = digits.slice(3);
  } else if (digits.startsWith('0')) {
    national = digits.slice(1);
  } else {
    national = digits;
  }

  if (national.startsWith('0') || !/^\d{9}$/.test(national)) {
    return { ok: false, error: INVALID };
  }

  return { ok: true, phone: `${brand.callingCode}${national}` };
}
