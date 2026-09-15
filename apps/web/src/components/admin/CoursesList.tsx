'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState, Skeleton, StatusPill } from '@/components/admin/AdminUi';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type Trip = {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  requested_at: string;
  rider_id: string;
  driver_id: string | null;
  estimated_fare_cents: number | null;
  final_fare_cents: number | null;
};

const FILTERS: { id: string; label: string; statuses?: string[] }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'scheduled', label: 'Planifiées', statuses: ['scheduled'] },
  { id: 'running', label: 'En cours', statuses: ['requested', 'assigned', 'driver_en_route', 'arrived_at_pickup', 'in_progress'] },
  { id: 'done', label: 'Terminées', statuses: ['completed'] },
  { id: 'cancelled', label: 'Annulées', statuses: ['cancelled', 'no_show'] },
];

export function CoursesList() {
  const [rows, setRows] = useState<Trip[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    async function load() {
      const { data } = await supabase
        .from('trips')
        .select('id, status, pickup_address, dropoff_address, requested_at, rider_id, driver_id, estimated_fare_cents, final_fare_cents')
        .order('requested_at', { ascending: false })
        .limit(80);
      const trips = (data as Trip[]) ?? [];
      setRows(trips);
      const ids = Array.from(new Set(trips.flatMap((t) => [t.rider_id, t.driver_id].filter(Boolean)))) as string[];
      if (ids.length) {
        const users = await supabase.from('users').select('id, display_name').in('id', ids);
        const map: Record<string, string> = {};
        for (const u of (users.data as { id: string; display_name: string | null }[]) ?? []) map[u.id] = u.display_name || '—';
        setNames(map);
      }
      setLoading(false);
    }
    void load();
  }, []);

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    if (!f?.statuses) return rows;
    return rows.filter((r) => f.statuses!.includes(r.status));
  }, [rows, filter]);

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link href="/admin/courses/nouvelle" className="rounded-xl bg-taxi px-4 py-2 text-sm font-semibold text-navy">
          + Nouvelle course
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${filter === f.id ? 'bg-taxi text-navy' : 'bg-white'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <EmptyState>Aucune course dans ce filtre.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Chauffeur</th>
                <th className="px-4 py-3">Trajet</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link href={`/admin/courses/${t.id}`} className="font-semibold hover:underline">
                      {t.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{names[t.rider_id] ?? '—'}</td>
                  <td className="px-4 py-3">{t.driver_id ? names[t.driver_id] ?? '—' : '—'}</td>
                  <td className="px-4 py-3">{t.pickup_address} → {t.dropoff_address}</td>
                  <td className="px-4 py-3">{new Date(t.requested_at).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3">{t.final_fare_cents || t.estimated_fare_cents ? `${Math.round((t.final_fare_cents || t.estimated_fare_cents || 0) / 100)} $` : '—'}</td>
                  <td className="px-4 py-3"><StatusPill status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
