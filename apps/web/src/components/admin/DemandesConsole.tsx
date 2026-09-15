'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { AdminModal, EmptyState, KpiCard, Skeleton, StatusPill } from '@/components/admin/AdminUi';
import { showAdminToast } from '@/components/admin/AdminShell';
import { KinshasaMap } from '@/components/KinshasaMap';
import { fleetCategories, fleetCategoryById } from '@/config/fleet';
import { bookingDb } from '@/lib/booking-db';
import { timeAgoFr } from '@/lib/admin-format';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { openWhatsApp, whatsAppUrl } from '@/lib/whatsapp';

export type BookingRequestRow = {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  pickup_label: string;
  dropoff_label: string;
  scheduled_for: string;
  is_now: boolean;
  category: string;
  hourly_rate_usd: number | null;
  daily_rate_usd: number | null;
  status: 'pending' | 'approved' | 'rejected';
  reject_reason: string | null;
  created_at: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  trip_id: string | null;
};

const FILTERS = [
  { id: 'all', label: 'Toutes' },
  { id: 'pending', label: 'En attente' },
  { id: 'approved', label: 'Approuvées' },
  { id: 'rejected', label: 'Refusées' },
] as const;

export function DemandesList() {
  const [rows, setRows] = useState<BookingRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    async function load() {
      const { data } = await supabase
        .from('booking_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(80);
      setRows((data as BookingRequestRow[]) ?? []);
      setLoading(false);
    }
    void load();
    const channel = supabase
      .channel('booking_requests_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, () => {
        void load();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const pending = rows.filter((r) => r.status === 'pending').length;
  const today = new Date().toDateString();
  const approvedToday = rows.filter((r) => r.status === 'approved' && new Date(r.created_at).toDateString() === today).length;
  const rejected = rows.filter((r) => r.status === 'rejected').length;

  const visible = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (category && r.category !== category) return false;
      if (date && !r.scheduled_for.startsWith(date)) return false;
      const hay = `${r.reference} ${r.customer_name} ${r.customer_phone} ${r.pickup_label} ${r.dropoff_label}`.toLowerCase();
      if (q.trim() && !hay.includes(q.trim().toLowerCase())) return false;
      return true;
    });
  }, [rows, filter, q, date, category]);

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Demandes de courses</h1>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KpiCard label="En attente" value={pending} />
        <KpiCard label="Approuvées aujourd’hui" value={approvedToday} />
        <KpiCard label="Refusées" value={rejected} />
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
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher"
          className="min-h-11 rounded-xl border px-3"
          aria-label="Rechercher une demande"
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="min-h-11 rounded-xl border px-3" aria-label="Filtrer par date" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="min-h-11 rounded-xl border px-3" aria-label="Filtrer par catégorie">
          <option value="">Toutes les catégories</option>
          {fleetCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      {visible.length === 0 ? (
        <EmptyState>Aucune demande dans ce filtre.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-3">Référence</th>
                <th className="px-3 py-3">Client</th>
                <th className="px-3 py-3">Téléphone</th>
                <th className="px-3 py-3">Départ</th>
                <th className="px-3 py-3">Destination</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Heure</th>
                <th className="px-3 py-3">Catégorie</th>
                <th className="px-3 py-3">Statut</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const when = new Date(r.scheduled_for);
                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-3">
                      <Link href={`/admin/demandes/${r.id}`} className="font-semibold hover:underline">
                        {r.reference}
                      </Link>
                    </td>
                    <td className="px-3 py-3">{r.customer_name}</td>
                    <td className="px-3 py-3">{r.customer_phone}</td>
                    <td className="px-3 py-3">{r.pickup_label}</td>
                    <td className="px-3 py-3">{r.dropoff_label}</td>
                    <td className="px-3 py-3">{when.toLocaleDateString('fr-FR')}</td>
                    <td className="px-3 py-3">{when.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-3 py-3">{fleetCategoryById(r.category).label}</td>
                    <td className="px-3 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/admin/demandes/${r.id}`} className="text-sm underline">
                        Voir
                      </Link>
                    </td>
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

export function DemandeDetail({ id }: { id: string }) {
  const [row, setRow] = useState<BookingRequestRow | null>(null);
  const [reason, setReason] = useState('Aucun chauffeur disponible');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = bookingDb(getSupabaseBrowser());
    const { data } = await supabase.from('booking_requests').select('*').eq('id', id).maybeSingle();
    setRow(data as BookingRequestRow | null);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = bookingDb(getSupabaseBrowser());
      const { data } = await supabase.from('booking_requests').select('*').eq('id', id).maybeSingle();
      if (!cancelled) setRow(data as BookingRequestRow | null);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function approve() {
    setBusy(true);
    setError(null);
    const { error: err } = await bookingDb(getSupabaseBrowser()).rpc('approve_booking_request', { p_id: id });
    setBusy(false);
    setConfirm(null);
    if (err) {
      setError('Impossible d’approuver cette demande.');
      showAdminToast('Impossible d’approuver cette demande.');
    } else {
      showAdminToast('Course approuvée');
      await load();
    }
  }

  async function reject() {
    setBusy(true);
    setError(null);
    const text = reason === 'Autre' ? comment.trim() || 'Autre' : reason;
    const { error: err } = await bookingDb(getSupabaseBrowser()).rpc('reject_booking_request', { p_id: id, p_reason: text });
    setBusy(false);
    setConfirm(null);
    if (err) {
      setError('Impossible de refuser cette demande.');
      showAdminToast('Impossible de refuser cette demande.');
    } else {
      showAdminToast('Demande refusée');
      await load();
    }
  }

  if (!row) return <Skeleton className="h-64" />;
  const cat = fleetCategoryById(row.category);
  const when = new Date(row.scheduled_for);

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/admin/demandes" className="text-sm text-muted">
        ← Demandes
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{row.reference}</h1>
          <p className="text-sm text-muted">Créée {timeAgoFr(row.created_at)}</p>
        </div>
        <StatusPill status={row.status} />
      </div>
      <div className="rounded-2xl bg-white p-5 text-sm shadow-card">
        <p>
          <strong>Client</strong> {row.customer_name}
        </p>
        <p className="mt-1">
          <strong>Téléphone</strong> {row.customer_phone}
        </p>
        <p className="mt-1">
          <strong>Départ</strong> {row.pickup_label}
        </p>
        <p className="mt-1">
          <strong>Destination</strong> {row.dropoff_label}
        </p>
        <p className="mt-1">
          <strong>Date demandée</strong> {when.toLocaleDateString('fr-FR')}
        </p>
        <p className="mt-1">
          <strong>Heure</strong> {when.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="mt-1">
          <strong>Catégorie</strong> {cat.label}
        </p>
        <p className="mt-1">
          <strong>Tarif de référence</strong> {row.hourly_rate_usd ?? cat.hourlyUsd} $ / heure · {row.daily_rate_usd ?? cat.dailyUsd} $ / journée
        </p>
        {row.reject_reason ? (
          <p className="mt-1">
            <strong>Motif</strong> {row.reject_reason}
          </p>
        ) : null}
      </div>
      <div className="h-56 overflow-hidden rounded-2xl bg-white shadow-card">
        <KinshasaMap pickup={{ lat: row.pickup_lat, lng: row.pickup_lng }} dropoff={{ lat: row.dropoff_lat, lng: row.dropoff_lng }} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        {row.status === 'pending' ? (
          <>
            <button type="button" className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white" disabled={busy} onClick={() => setConfirm('approve')}>
              Approuver
            </button>
            <button type="button" className="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white" disabled={busy} onClick={() => setConfirm('reject')}>
              Refuser
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="min-h-11 rounded-xl border px-4 text-sm"
          onClick={() =>
            openWhatsApp(
              whatsAppUrl(
                row.customer_phone,
                `Bonjour ${row.customer_name},\n\nNous vous contactons concernant votre demande TAXI NA BISO ${row.reference}.`,
              ),
            )
          }
        >
          Contacter le client sur WhatsApp
        </button>
        {row.trip_id ? (
          <Link href={`/admin/courses/${row.trip_id}`} className="min-h-11 rounded-xl border px-4 py-2 text-sm">
            Voir la course
          </Link>
        ) : null}
      </div>
      {confirm === 'approve' ? (
        <AdminModal title="Approuver cette demande ?" onClose={() => setConfirm(null)}>
          <p className="text-sm text-muted">La course passera ensuite à l’attribution chauffeur.</p>
          <div className="mt-4 flex gap-2">
            <button type="button" className="min-h-11 flex-1 rounded-xl bg-navy text-white" disabled={busy} onClick={() => void approve()}>
              Confirmer
            </button>
            <button type="button" className="min-h-11 flex-1 rounded-xl border" onClick={() => setConfirm(null)}>
              Annuler
            </button>
          </div>
        </AdminModal>
      ) : null}
      {confirm === 'reject' ? (
        <AdminModal title="Motif du refus" onClose={() => setConfirm(null)}>
          <select className="min-h-11 w-full rounded-xl border px-3" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>Aucun chauffeur disponible</option>
            <option>Zone non desservie</option>
            <option>Informations insuffisantes</option>
            <option>Autre</option>
          </select>
          {reason === 'Autre' ? (
            <textarea className="mt-2 w-full rounded-xl border px-3 py-2" rows={3} placeholder="Commentaire" value={comment} onChange={(e) => setComment(e.target.value)} />
          ) : null}
          <div className="mt-4 flex gap-2">
            <button type="button" className="min-h-11 flex-1 rounded-xl bg-red-600 text-white" disabled={busy} onClick={() => void reject()}>
              Refuser
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
