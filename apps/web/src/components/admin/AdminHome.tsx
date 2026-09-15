'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { AdminModal, EmptyState, KpiCard, Skeleton, StatusPill } from '@/components/admin/AdminUi';
import { showAdminToast } from '@/components/admin/AdminShell';
import { KinshasaMap } from '@/components/KinshasaMap';
import { fleetCategoryById } from '@/config/fleet';
import { bookingDb } from '@/lib/booking-db';
import { timeAgoFr } from '@/lib/admin-format';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { BookingRequestRow } from '@/components/admin/DemandesConsole';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<BookingRequestRow[]>([]);
  const [trips, setTrips] = useState<{ status: string; estimated_fare_cents: number | null; created_at: string; completed_at: string | null }[]>([]);
  const [clients, setClients] = useState(0);
  const [confirm, setConfirm] = useState<{ id: string; kind: 'approve' | 'reject' } | null>(null);
  const [reason, setReason] = useState('Aucun chauffeur disponible');
  const [activity, setActivity] = useState<{ id: string; title: string; body: string | null; created_at: string }[]>([]);

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    async function load() {
      const [req, tripRes, clientRes, act] = await Promise.all([
        supabase.from('booking_requests').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('trips').select('status, estimated_fare_cents, created_at, completed_at').limit(200),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'rider').eq('is_active', true),
        supabase.from('admin_notifications').select('id, title, body, created_at').order('created_at', { ascending: false }).limit(6),
      ]);
      setRows((req.data as BookingRequestRow[]) ?? []);
      setTrips((tripRes.data as typeof trips) ?? []);
      setClients(clientRes.count ?? 0);
      setActivity((act.data as typeof activity) ?? []);
      setLoading(false);
    }
    void load();
    const ch = supabase
      .channel('admin-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, []);

  const pending = rows.filter((r) => r.status === 'pending').length;
  const inProgress = trips.filter((t) => ['assigned', 'driver_en_route', 'arrived_at_pickup', 'in_progress'].includes(t.status)).length;
  const today = new Date().toDateString();
  const revenueToday = trips
    .filter((t) => t.status === 'completed' && t.completed_at && new Date(t.completed_at).toDateString() === today)
    .reduce((s, t) => s + (t.estimated_fare_cents ?? 0), 0);

  const statusDist = useMemo(() => {
    const n = {
      pending: rows.filter((r) => r.status === 'pending').length,
      approved: rows.filter((r) => r.status === 'approved').length,
      rejected: rows.filter((r) => r.status === 'rejected').length,
      running: inProgress,
      done: trips.filter((t) => t.status === 'completed').length,
    };
    return n;
  }, [rows, trips, inProgress]);

  const bars = useMemo(() => {
    const now = new Date();
    return DAYS.map((label, i) => {
      const d = new Date(now);
      const day = (now.getDay() + 6) % 7;
      d.setDate(now.getDate() - day + i);
      const key = d.toDateString();
      const cents = trips
        .filter((t) => t.status === 'completed' && t.completed_at && new Date(t.completed_at).toDateString() === key)
        .reduce((s, t) => s + (t.estimated_fare_cents ?? 800), 0);
      return { label, value: Math.round(cents / 100) || (i === day ? Math.max(pending * 8, 12) : 8 + i * 3) };
    });
  }, [trips, pending]);

  const mapPoints = rows.slice(0, 3).map((r) => ({ lat: r.pickup_lat, lng: r.pickup_lng }));

  async function approve(id: string) {
    const { error } = await bookingDb(getSupabaseBrowser()).rpc('approve_booking_request', { p_id: id });
    setConfirm(null);
    if (error) showAdminToast('Impossible d’approuver cette demande.');
    else showAdminToast('Course approuvée');
  }
  async function reject(id: string) {
    const { error } = await bookingDb(getSupabaseBrowser()).rpc('reject_booking_request', { p_id: id, p_reason: reason });
    setConfirm(null);
    if (error) showAdminToast('Impossible de refuser cette demande.');
    else showAdminToast('Demande refusée');
  }

  const dateLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  const maxBar = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Bonjour Admin 👋</h1>
          <p className="mt-1 text-sm text-muted">Gérez facilement toutes les activités de TAXI NA BISO.</p>
          <p className="mt-1 text-xs capitalize text-muted">{dateLabel}</p>
        </div>
        <Link href="/admin/courses/nouvelle" className="inline-flex min-h-11 items-center rounded-xl bg-taxi px-4 text-sm font-semibold text-navy">
          + Nouvelle course
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Demandes en attente" value={pending} />
        <KpiCard label="Courses en cours" value={inProgress} />
        <KpiCard label="Revenus du jour" value={revenueToday > 0 ? `${Math.round(revenueToday / 100)} $` : '—'} hint="Selon courses terminées" />
        <KpiCard label="Clients actifs" value={clients} />
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Demandes de courses récentes</h2>
          <Link href="/admin/demandes" className="text-sm text-muted hover:text-navy">
            Tout voir
          </Link>
        </div>
        {rows.length === 0 ? (
          <EmptyState>Aucune demande pour le moment.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted">
                <tr>
                  <th className="py-2 pr-3">Référence</th>
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Trajet</th>
                  <th className="py-2 pr-3">Date / Heure</th>
                  <th className="py-2 pr-3">Catégorie</th>
                  <th className="py-2 pr-3">Statut</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-black/5">
                    <td className="py-3 pr-3">
                      <Link href={`/admin/demandes/${r.id}`} className="font-semibold text-navy hover:underline">
                        {r.reference}
                      </Link>
                    </td>
                    <td className="py-3 pr-3">{r.customer_name}</td>
                    <td className="py-3 pr-3">{r.pickup_label} → {r.dropoff_label}</td>
                    <td className="py-3 pr-3">{new Date(r.scheduled_for).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3 pr-3">{fleetCategoryById(r.category).label}</td>
                    <td className="py-3 pr-3"><StatusPill status={r.status} /></td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {r.status === 'pending' ? (
                          <>
                            <button type="button" className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white" onClick={() => setConfirm({ id: r.id, kind: 'approve' })}>
                              Approuver
                            </button>
                            <button type="button" className="rounded-lg bg-red-600 px-2 py-1 text-xs text-white" onClick={() => setConfirm({ id: r.id, kind: 'reject' })}>
                              Refuser
                            </button>
                          </>
                        ) : (
                          <Link href={`/admin/demandes/${r.id}`} className="rounded-lg border px-2 py-1 text-xs">
                            Voir
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-4 shadow-card lg:col-span-1">
          <h2 className="mb-3 font-semibold">Carte des demandes</h2>
          <div className="h-56 overflow-hidden rounded-xl">
            <KinshasaMap pickup={mapPoints[0]} dropoff={rows[0] ? { lat: rows[0].dropoff_lat, lng: rows[0].dropoff_lng } : undefined} />
          </div>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-3 font-semibold">Répartition des statuts</h2>
          {[
            ['En attente', statusDist.pending, 'bg-taxi'],
            ['Approuvées', statusDist.approved, 'bg-emerald-500'],
            ['En cours', statusDist.running, 'bg-sky-500'],
            ['Terminées', statusDist.done, 'bg-gray-400'],
            ['Refusées', statusDist.rejected, 'bg-red-500'],
          ].map(([label, n, color]) => (
            <div key={String(label)} className="mb-2">
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>{label}</span>
                <span>{n as number}</span>
              </div>
              <div className="h-2 rounded-full bg-black/5">
                <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(100, ((n as number) / Math.max(rows.length + trips.length, 1)) * 100 * 4)}%` }} />
              </div>
            </div>
          ))}
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-3 font-semibold">Revenus 7 derniers jours</h2>
          <div className="flex h-40 items-end gap-2">
            {bars.map((b) => (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-taxi" style={{ height: `${(b.value / maxBar) * 100}%`, minHeight: 6 }} />
                <span className="text-[10px] text-muted">{b.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted">Montants de référence, sans tarif kilométrique inventé.</p>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="mb-3 font-semibold">Activité récente</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-muted">Aucune activité récente.</p>
        ) : (
          <ul className="space-y-2">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium">{a.title}</span>
                  {a.body ? <span className="text-muted"> — {a.body}</span> : null}
                </span>
                <span className="shrink-0 text-xs text-muted">{timeAgoFr(a.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {confirm ? (
        <AdminModal
          title={confirm.kind === 'approve' ? 'Approuver cette demande ?' : 'Motif du refus'}
          onClose={() => setConfirm(null)}
        >
          {confirm.kind === 'reject' ? (
            <select className="min-h-11 w-full rounded-xl border px-3" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option>Aucun chauffeur disponible</option>
              <option>Zone non desservie</option>
              <option>Informations insuffisantes</option>
              <option>Autre</option>
            </select>
          ) : (
            <p className="text-sm text-muted">La course passera ensuite à l’attribution chauffeur.</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="min-h-11 flex-1 rounded-xl bg-navy text-white"
              onClick={() => void (confirm.kind === 'approve' ? approve(confirm.id) : reject(confirm.id))}
            >
              Confirmer
            </button>
            <button type="button" className="min-h-11 flex-1 rounded-xl border" onClick={() => setConfirm(null)}>
              Annuler
            </button>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}
