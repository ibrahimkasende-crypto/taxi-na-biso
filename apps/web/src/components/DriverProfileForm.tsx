'use client';

import { useState } from 'react';

import { getSupabaseBrowser } from '@/lib/supabase-browser';

export function DriverProfileForm({
  driverId,
  initialName,
  initialLicence,
}: {
  driverId: string;
  initialName: string | null;
  initialLicence: string | null;
}) {
  const [name, setName] = useState(initialName ?? '');
  const [licence, setLicence] = useState(initialLicence ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function save(): Promise<void> {
    setBusy(true);
    setError(null);
    setOk(false);
    const supabase = getSupabaseBrowser();
    try {
      const u = await supabase.from('users').update({ display_name: name.trim() }).eq('id', driverId);
      if (u.error) throw u.error;
      const p = await supabase.from('driver_profiles').update({ licence_number: licence.trim() }).eq('user_id', driverId);
      if (p.error) throw p.error;
      setOk(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <label className="block text-sm">
        Nom affiché
        <input className="mt-1 min-h-11 w-full rounded-xl border px-3" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm">
        Numéro de permis
        <input className="mt-1 min-h-11 w-full rounded-xl border px-3" value={licence} onChange={(e) => setLicence(e.target.value)} />
      </label>
      <button type="button" disabled={busy} onClick={() => void save()} className="min-h-12 w-full rounded-xl bg-brand font-semibold text-white disabled:opacity-50">
        Enregistrer
      </button>
      {ok ? <p className="text-sm text-success">Profil mis à jour.</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
