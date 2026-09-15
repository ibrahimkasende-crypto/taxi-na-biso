import { secureStorage } from '../../lib/secure-storage';

export type TrustedContact = {
  id: string;
  name: string;
  phone: string;
};

const KEY = 'taxi_na_biso_trusted_contacts';

export async function readTrustedContacts(): Promise<TrustedContact[]> {
  const raw = await secureStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TrustedContact[]) : [];
  } catch {
    return [];
  }
}

export async function writeTrustedContacts(contacts: TrustedContact[]): Promise<void> {
  await secureStorage.setItem(KEY, JSON.stringify(contacts.slice(0, 8)));
}
