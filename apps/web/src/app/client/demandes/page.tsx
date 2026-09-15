import Link from 'next/link';

import { bookingDb } from '@/lib/booking-db';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireRider } from '@/lib/session';
import { fleetCategoryById } from '@/config/fleet';

const STATUS: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
};

export default async function ClientDemandesPage() {
  const profile = await requireRider();
  const supabase = bookingDb(await getSupabaseServer());
  const { data } = await supabase
    .from('booking_requests')
    .select('id, reference, pickup_label, dropoff_label, scheduled_for, category, status, created_at, trip_id')
    .eq('rider_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(30);

  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mes demandes</h1>
      {rows.length === 0 ? (
        <p className="text-muted">Aucune demande pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl bg-white p-4 shadow-card">
              <p className="text-sm text-brand">{r.reference}</p>
              <p className="font-medium">
                {r.pickup_label} → {r.dropoff_label}
              </p>
              <p className="text-sm text-muted">
                {STATUS[r.status] ?? r.status} · {fleetCategoryById(r.category).label} ·{' '}
                {new Date(r.scheduled_for).toLocaleString('fr-FR')}
              </p>
              {r.trip_id ? (
                <Link href={`/client/course/${r.trip_id}`} className="mt-2 inline-block text-sm text-brand">
                  Suivre la course
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
