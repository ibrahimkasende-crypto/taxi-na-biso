'use client';

import { useEffect, useState } from 'react';

import { showAdminToast } from '@/components/admin/AdminShell';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function ProfilPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setEmail(data.user.email ?? '');
      const { data: profile } = await supabase.from('users').select('display_name, phone').eq('id', data.user.id).maybeSingle();
      const row = profile as { display_name?: string | null; phone?: string | null } | null;
      setName(row?.display_name ?? 'Admin');
      setPhone(row?.phone ?? '');
    })();
  }, []);

  async function save() {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { error } = await supabase.from('users').update({ display_name: name, phone }).eq('id', data.user.id);
    showAdminToast(error ? 'Impossible d’enregistrer.' : 'Profil mis à jour');
  }

  return (
    <div className="max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/admin/admin-avatar.jpeg" alt="" className="h-20 w-20 rounded-full object-cover" />
      <h1 className="text-2xl font-bold">Profil</h1>
      <p className="text-sm text-muted">Rôle : Administrateur</p>
      <label className="block text-sm">Nom
        <input className="mt-1 min-h-11 w-full rounded-xl border px-3" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm">Téléphone
        <input className="mt-1 min-h-11 w-full rounded-xl border px-3" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <p className="text-sm">{email}</p>
      <button type="button" className="rounded-xl bg-navy px-4 py-2 text-white" onClick={() => void save()}>
        Enregistrer
      </button>
    </div>
  );
}
