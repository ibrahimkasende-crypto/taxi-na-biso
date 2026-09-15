'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { EmptyState, KpiCard, Skeleton, StatusPill } from '@/components/admin/AdminUi';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type Driver = {
  user_id: string;
  status: string;
  licence_number: string | null;
  last_known_vehicle_id: string | null;
  users: { display_name: string | null; phone: string | null } | null;
};

export function ChauffeursList() {
  const [rows, setRows] = useState<Driver[]>([]);
  const [online, setOnline] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    async function load() {
      const [d, st, trips] = await Promise.all([
        supabase.from('driver_profiles').select('user_id, status, licence_number, last_known_vehicle_id, users(display_name, phone)'),
        supabase.from('driver_status').select('driver_id, status').is('ended_at', null),
        supabase.from('trips').select('driver_id').in('status', ['assigned', 'driver_en_route', 'arrived_at_pickup', 'in_progress']),
      ]);
      setRows(((d.data as unknown) as Driver[]) ?? []);
      setOnline(
        new Set(
          ((st.data as { driver_id: string; status: string }[]) ?? [])
            .filter((s) => s.status !== 'offline')
            .map((s) => s.driver_id),
        ),
      );
      setBusy(new Set(((trips.data as { driver_id: string | null }[]) ?? []).map((t) => t.driver_id).filter(Boolean) as string[]));
      setLoading(false);
    }
    void load();
  }, []);

  const filtered = rows.filter((r) => {
    const n = `${r.users?.display_name ?? ''} ${r.users?.phone ?? ''}`.toLowerCase();
    return n.includes(q.toLowerCase());
  });

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Chauffeurs</h1>
        <Link href="/admin/chauffeurs/nouveau" className="rounded-xl bg-taxi px-4 py-2 text-sm font-semibold text-navy">
          + Ajouter un chauffeur
        </Link>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <KpiCard label="Total" value={rows.length} />
        <KpiCard label="En ligne" value={online.size} />
        <KpiCard label="En course" value={busy.size} />
        <KpiCard label="Hors ligne" value={Math.max(0, rows.length - online.size)} />
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher"
        className="mb-4 min-h-11 w-full max-w-sm rounded-xl border px-3"
      />
      {filtered.length === 0 ? (
        <EmptyState>Aucun chauffeur.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Permis</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const live = busy.has(d.user_id) ? 'in_progress' : online.has(d.user_id) ? 'online' : d.status === 'suspended' ? 'suspended' : 'offline';
                return (
                  <tr key={d.user_id} className="border-t">
                    <td className="px-4 py-3">
                      <Link href={`/admin/chauffeurs/${d.user_id}`} className="flex items-center gap-2 font-medium hover:underline">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/admin/driver-avatar.png" alt="" className="h-8 w-8 rounded-full object-cover" />
                        {d.users?.display_name ?? 'Chauffeur'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{d.users?.phone ?? '—'}</td>
                    <td className="px-4 py-3">{d.licence_number ?? '—'}</td>
                    <td className="px-4 py-3"><StatusPill status={live} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
