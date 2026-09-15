'use client';

import { useEffect, useState } from 'react';

import { fleetCategories } from '@/config/fleet';
import { bookingDb } from '@/lib/booking-db';
import { showAdminToast } from '@/components/admin/AdminShell';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const OP = '00000000-0000-0000-0000-000000000001';

export function ParametresView() {
  const [tab, setTab] = useState<'entreprise' | 'reservation' | 'tarifs' | 'notifications' | 'compte'>('entreprise');
  const [name, setName] = useState('TAXI NA BISO');
  const [phone, setPhone] = useState('+243974543860');
  const [email, setEmail] = useState('hello@taxinabiso.com');
  const [rates, setRates] = useState<Record<string, { hourly_usd: number; daily_usd: number }>>({});

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    supabase.from('operators').select('name, support_phone, contact_email').eq('id', OP).maybeSingle().then(({ data }) => {
      const o = data as { name?: string; support_phone?: string | null; contact_email?: string | null } | null;
      if (o?.name) setName(o.name);
      if (o?.support_phone) setPhone(o.support_phone);
      if (o?.contact_email) setEmail(o.contact_email);
    });
    supabase.from('fleet_rates').select('category, hourly_usd, daily_usd').then(({ data }) => {
      const map: Record<string, { hourly_usd: number; daily_usd: number }> = {};
      for (const r of (data as { category: string; hourly_usd: number; daily_usd: number }[]) ?? []) {
        map[r.category] = { hourly_usd: Number(r.hourly_usd), daily_usd: Number(r.daily_usd) };
      }
      setRates(map);
    });
  }, []);

  async function saveCompany() {
    const { error } = await bookingDb(getSupabaseBrowser())
      .from('operators')
      .update({ name, support_phone: phone, contact_email: email })
      .eq('id', OP);
    showAdminToast(error ? 'Impossible d’enregistrer.' : 'Entreprise mise à jour');
  }

  async function saveRates() {
    const supabase = bookingDb(getSupabaseBrowser());
    for (const c of fleetCategories) {
      const r = rates[c.id] ?? { hourly_usd: c.hourlyUsd, daily_usd: c.dailyUsd };
      const { error } = await supabase.from('fleet_rates').upsert({
        operator_id: OP,
        category: c.id,
        hourly_usd: r.hourly_usd,
        daily_usd: r.daily_usd,
      });
      if (error) {
        showAdminToast('Impossible d’enregistrer les tarifs.');
        return;
      }
    }
    showAdminToast('Tarif modifié');
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['entreprise', 'Entreprise'],
            ['reservation', 'Réservation'],
            ['tarifs', 'Tarifs'],
            ['notifications', 'Notifications'],
            ['compte', 'Compte'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`rounded-full px-3 py-1.5 text-sm ${tab === id ? 'bg-taxi text-navy' : 'bg-white'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'entreprise' ? (
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-card">
          <label className="block text-sm">Nom
            <input className="mt-1 min-h-11 w-full rounded-xl border px-3" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <p className="text-sm text-muted">Localisation : Kinshasa, RDC</p>
          <label className="block text-sm">WhatsApp
            <input className="mt-1 min-h-11 w-full rounded-xl border px-3" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="block text-sm">E-mail
            <input className="mt-1 min-h-11 w-full rounded-xl border px-3" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="button" className="rounded-xl bg-navy px-4 py-2 text-white" onClick={() => void saveCompany()}>
            Enregistrer
          </button>
        </div>
      ) : null}
      {tab === 'reservation' ? (
        <div className="rounded-2xl bg-white p-5 text-sm shadow-card">
          <p>Les demandes publiques créent une fiche dans Demandes, avec tarif lu depuis cette page.</p>
          <p className="mt-2 text-muted">WhatsApp officiel : +243974543860 — distinct du numéro du client.</p>
        </div>
      ) : null}
      {tab === 'notifications' ? (
        <div className="rounded-2xl bg-white p-5 text-sm shadow-card">
          <p>Une notification est créée à chaque nouvelle demande. Utilisez la cloche pour tout marquer comme lu.</p>
        </div>
      ) : null}
      {tab === 'tarifs' ? (
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-card">
          {fleetCategories.map((c) => (
            <div key={c.id} className="grid grid-cols-3 items-center gap-2 text-sm">
              <span className="font-medium">{c.label}</span>
              <input
                type="number"
                className="min-h-11 rounded-xl border px-2"
                value={rates[c.id]?.hourly_usd ?? c.hourlyUsd}
                onChange={(e) =>
                  setRates((prev) => ({
                    ...prev,
                    [c.id]: { hourly_usd: Number(e.target.value), daily_usd: prev[c.id]?.daily_usd ?? c.dailyUsd },
                  }))
                }
              />
              <input
                type="number"
                className="min-h-11 rounded-xl border px-2"
                value={rates[c.id]?.daily_usd ?? c.dailyUsd}
                onChange={(e) =>
                  setRates((prev) => ({
                    ...prev,
                    [c.id]: { hourly_usd: prev[c.id]?.hourly_usd ?? c.hourlyUsd, daily_usd: Number(e.target.value) },
                  }))
                }
              />
            </div>
          ))}
          <p className="text-xs text-muted">Colonne 2 : $ / heure · colonne 3 : $ / journée. Le site public lit les mêmes tarifs.</p>
          <button type="button" className="rounded-xl bg-navy px-4 py-2 text-white" onClick={() => void saveRates()}>
            Enregistrer les tarifs
          </button>
        </div>
      ) : null}
      {tab === 'compte' ? (
        <p className="rounded-2xl bg-white p-5 text-sm shadow-card">
          Compte Admin : <strong>admin@taxinabiso.com</strong>. Modifiez le profil dans{' '}
          <a className="underline" href="/admin/profil">Profil</a>.
        </p>
      ) : null}
    </div>
  );
}
