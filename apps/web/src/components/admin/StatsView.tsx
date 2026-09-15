'use client';

import { useEffect, useState } from 'react';

import { KpiCard, Skeleton } from '@/components/admin/AdminUi';
import { fleetCategoryById } from '@/config/fleet';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export function StatsView() {
  const [loading, setLoading] = useState(true);
  const [req, setReq] = useState<{ category: string; status: string }[]>([]);
  const [trips, setTrips] = useState<{ status: string }[]>([]);

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    Promise.all([
      supabase.from('booking_requests').select('category, status'),
      supabase.from('trips').select('status'),
    ]).then(([a, b]) => {
      setReq((a.data as typeof req) ?? []);
      setTrips((b.data as typeof trips) ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Skeleton className="h-64" />;
  const completed = trips.filter((t) => t.status === 'completed').length;
  const cats: Record<string, number> = {};
  for (const r of req) cats[r.category] = (cats[r.category] ?? 0) + 1;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Statistiques</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        <KpiCard label="Demandes" value={req.length} />
        <KpiCard label="Courses" value={trips.length} />
        <KpiCard label="Terminées" value={completed} />
        <KpiCard label="Taux de complétion" value={trips.length ? `${Math.round((completed / trips.length) * 100)} %` : '—'} />
      </div>
      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h2 className="mb-3 font-semibold">Catégories les plus demandées</h2>
        <ul className="space-y-2 text-sm">
          {Object.entries(cats)
            .sort((a, b) => b[1] - a[1])
            .map(([id, n]) => (
              <li key={id} className="flex justify-between">
                <span>{fleetCategoryById(id).label}</span>
                <span className="font-semibold">{n}</span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
