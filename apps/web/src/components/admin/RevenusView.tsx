'use client';

import { useEffect, useState } from 'react';

import { EmptyState, KpiCard, Skeleton, StatusPill } from '@/components/admin/AdminUi';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type Pay = {
  id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  trip_id: string;
  rider_id: string;
};

export function RevenusView() {
  const [rows, setRows] = useState<Pay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void bookingDb(getSupabaseBrowser())
      .from('payments')
      .select('id, amount_cents, status, created_at, trip_id, rider_id')
      .order('created_at', { ascending: false })
      .limit(40)
      .then(({ data }) => {
        setRows((data as Pay[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <Skeleton className="h-64" />;
  const paid = rows.filter((r) => r.status === 'captured' || r.status === 'succeeded' || r.status === 'paid');
  const pending = rows.filter((r) => r.status === 'pending' || r.status === 'authorized');
  const sum = (list: Pay[]) => Math.round(list.reduce((s, r) => s + r.amount_cents, 0) / 100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Revenus</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Payés (extrait)" value={`${sum(paid)} $`} />
        <KpiCard label="En attente" value={`${sum(pending)} $`} />
        <KpiCard label="Transactions" value={rows.length} />
      </div>
      {rows.length === 0 ? (
        <EmptyState>Aucune transaction enregistrée. Les tarifs TAXI NA BISO restent à l’heure et à la journée.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">{r.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{r.trip_id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{Math.round(r.amount_cents / 100)} $</td>
                  <td className="px-4 py-3">{new Date(r.created_at).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
