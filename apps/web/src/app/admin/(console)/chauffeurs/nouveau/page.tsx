'use client';

import { useState } from 'react';

import { showAdminToast } from '@/components/admin/AdminShell';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function NouveauChauffeurPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await bookingDb(getSupabaseBrowser()).from('users').select('id, role, display_name, email').eq('email', email.trim().toLowerCase()).maybeSingle();
    const row = data as { id: string; role: string; display_name: string | null; email: string | null } | null;
    if (!row) {
      setMsg('Aucun compte Auth avec cet e-mail. Le chauffeur doit d’abord s’inscrire sur /chauffeur/inscription.');
      return;
    }
    showAdminToast(`Compte trouvé : ${row.display_name || row.email}`);
    window.location.href = `/admin/chauffeurs/${row.id}`;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-3 rounded-2xl bg-white p-6 shadow-card">
      <h1 className="text-2xl font-bold">Ajouter un chauffeur</h1>
      <p className="text-sm text-muted">Nous ne créons pas de compte Auth depuis le navigateur. Reliez un e-mail déjà inscrit.</p>
      <input className="min-h-11 w-full rounded-xl border px-3" type="email" placeholder="e-mail du chauffeur" value={email} onChange={(e) => setEmail(e.target.value)} required />
      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
      <button type="submit" className="min-h-11 rounded-xl bg-taxi px-4 font-semibold text-navy">
        Rechercher
      </button>
    </form>
  );
}
