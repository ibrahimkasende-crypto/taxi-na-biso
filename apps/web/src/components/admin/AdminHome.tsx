'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Car, ClipboardList, Users, Wallet } from 'lucide-react';

import { ActivityTimeline } from '@/components/admin/ActivityTimeline';
import { RevenueBarChart, StatusDonutChart } from '@/components/admin/AdminCharts';
import { DashboardMapPanel } from '@/components/admin/DashboardMapPanel';
import { RecentRequestsPanel } from '@/components/admin/RecentRequestsPanel';
import { AdminModal, EmptyState, KpiCard, Skeleton } from '@/components/admin/AdminUi';
import { showAdminToast } from '@/components/admin/AdminShell';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { BookingRequestRow } from '@/components/admin/DemandesConsole';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

type StatusCounts = { pending: number; approved: number; rejected: number };

export function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<BookingRequestRow[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ pending: 0, approved: 0, rejected: 0 });
  const [trips, setTrips] = useState<{ status: string; estimated_fare_cents: number | null; created_at: string; completed_at: string | null }[]>([]);
  const [clients, setClients] = useState(0);
  const [confirm, setConfirm] = useState<{ id: string; kind: 'approve' | 'reject' } | null>(null);
  const [reason, setReason] = useState('Aucun chauffeur disponible');
  const [activity, setActivity] = useState<{ id: string; title: string; body: string | null; created_at: string }[]>([]);

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    async function load() {
      const [req, allStatuses, tripRes, clientRes, act] = await Promise.all([
        supabase.from('booking_requests').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('booking_requests').select('status'),
        supabase.from('trips').select('status, estimated_fare_cents, created_at, completed_at').limit(200),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'rider').eq('is_active', true),
        supabase.from('admin_notifications').select('id, title, body, created_at').order('created_at', { ascending: false }).limit(6),
      ]);
      setRows((req.data as BookingRequestRow[]) ?? []);
      const statuses = (allStatuses.data as { status: string }[]) ?? [];
      setStatusCounts({
        pending: statuses.filter((s) => s.status === 'pending').length,
        approved: statuses.filter((s) => s.status === 'approved').length,
        rejected: statuses.filter((s) => s.status === 'rejected').length,
      });
      setTrips((tripRes.data as typeof trips) ?? []);
      setClients(clientRes.count ?? 0);
      setActivity((act.data as typeof activity) ?? []);
      setLoading(false);
    }
    void load();
    const ch = supabase
      .channel('admin-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notifications' }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, []);

  const inProgress = trips.filter((t) => ['assigned', 'driver_en_route', 'arrived_at_pickup', 'in_progress'].includes(t.status)).length;
  const today = new Date().toDateString();
  const revenueToday = trips
    .filter((t) => t.status === 'completed' && t.completed_at && new Date(t.completed_at).toDateString() === today)
    .reduce((s, t) => s + (t.estimated_fare_cents ?? 0), 0);

  const statusDist = useMemo(
    () => ({
      pending: statusCounts.pending,
      approved: statusCounts.approved,
      rejected: statusCounts.rejected,
      running: inProgress,
      done: trips.filter((t) => t.status === 'completed').length,
    }),
    [statusCounts, trips, inProgress],
  );

  const bars = useMemo(() => {
    const now = new Date();
    return DAYS.map((label, i) => {
      const d = new Date(now);
      const day = (now.getDay() + 6) % 7;
      d.setDate(now.getDate() - day + i);
      const key = d.toDateString();
      const cents = trips
        .filter((t) => t.status === 'completed' && t.completed_at && new Date(t.completed_at).toDateString() === key)
        .reduce((s, t) => s + (t.estimated_fare_cents ?? 0), 0);
      return { label, value: Math.round(cents / 100) };
    });
  }, [trips]);

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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Bonjour Admin</h1>
          <p className="mt-0.5 text-sm text-muted">Gérez facilement toutes les activités de TAXI NA BISO.</p>
          <p className="mt-0.5 text-xs capitalize text-muted">{dateLabel}</p>
        </div>
        <Link href="/admin/courses/nouvelle" className="inline-flex min-h-10 items-center rounded-xl bg-taxi px-4 text-sm font-semibold text-navy">
          + Nouvelle course
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Demandes en attente"
          value={statusCounts.pending}
          href="/admin/demandes"
          icon={ClipboardList}
          iconClassName="bg-violet-100 text-violet-700"
        />
        <KpiCard
          label="Courses en cours"
          value={inProgress}
          href="/admin/courses"
          icon={Car}
          iconClassName="bg-emerald-100 text-emerald-700"
        />
        <KpiCard
          label="Revenus du jour"
          value={revenueToday > 0 ? `${Math.round(revenueToday / 100)} $` : '—'}
          hint="Selon courses terminées"
          href="/admin/revenus"
          icon={Wallet}
          iconClassName="bg-amber-100 text-amber-700"
        />
        <KpiCard
          label="Clients actifs"
          value={clients}
          href="/admin/clients"
          icon={Users}
          iconClassName="bg-slate-200 text-slate-700"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <section className="rounded-2xl bg-white p-3 shadow-card sm:p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold sm:text-base">Demandes de courses récentes</h2>
            <Link href="/admin/demandes" className="text-xs text-muted hover:text-navy">
              Tout voir
            </Link>
          </div>
          {rows.length === 0 ? (
            <EmptyState>Aucune demande pour le moment.</EmptyState>
          ) : (
            <RecentRequestsPanel
              rows={rows}
              onApprove={(id) => setConfirm({ id, kind: 'approve' })}
              onReject={(id) => setConfirm({ id, kind: 'reject' })}
            />
          )}
        </section>
        <DashboardMapPanel rows={rows} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-3 shadow-card sm:p-4">
          <h2 className="mb-3 text-sm font-semibold">Répartition des statuts</h2>
          <StatusDonutChart
            slices={[
              { key: 'pending', label: 'En attente', value: statusDist.pending },
              { key: 'approved', label: 'Approuvées', value: statusDist.approved },
              { key: 'running', label: 'En cours', value: statusDist.running },
              { key: 'done', label: 'Terminées', value: statusDist.done },
              { key: 'rejected', label: 'Refusées', value: statusDist.rejected },
            ]}
          />
        </section>
        <section className="rounded-2xl bg-white p-3 shadow-card sm:p-4">
          <h2 className="mb-3 text-sm font-semibold">Revenus 7 derniers jours</h2>
          <RevenueBarChart bars={bars} />
        </section>
        <section className="rounded-2xl bg-white p-3 shadow-card sm:p-4">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted" aria-hidden />
            <h2 className="text-sm font-semibold">Activité récente</h2>
          </div>
          <ActivityTimeline items={activity} />
        </section>
      </div>

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
