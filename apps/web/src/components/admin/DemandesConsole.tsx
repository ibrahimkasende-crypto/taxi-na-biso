'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { fleetCategoryById } from '@/config/fleet';
import { bookingDb } from '@/lib/booking-db';
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

const STATUS: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
};

export function DemandesList() {
  const [rows, setRows] = useState<BookingRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  const pending = useMemo(() => rows.filter((r) => r.status === 'pending').length, [rows]);

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Demandes de courses</h1>
          <p className="text-sm text-muted">{pending} en attente</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f6f8fa] text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Référence</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Trajet</th>
              <th className="px-3 py-2">Quand</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-3 font-medium">{r.reference}</td>
                <td className="px-3 py-3">
                  {r.customer_name}
                  <div className="text-xs text-muted">{r.customer_phone}</div>
                </td>
                <td className="px-3 py-3">
                  {r.pickup_label} → {r.dropoff_label}
                </td>
                <td className="px-3 py-3 text-xs">
                  {new Date(r.scheduled_for).toLocaleString('fr-FR')}
                  <div className="text-muted">{timeAgo(r.created_at)}</div>
                </td>
                <td className="px-3 py-3">{fleetCategoryById(r.category).label}</td>
                <td className="px-3 py-3">{STATUS[r.status]}</td>
                <td className="px-3 py-3">
                  <Link href={`/admin/demandes/${r.id}`} className="text-brand">
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DemandeDetail({ id }: { id: string }) {
  const [row, setRow] = useState<BookingRequestRow | null>(null);
  const [reason, setReason] = useState('Aucun chauffeur disponible');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = bookingDb(getSupabaseBrowser());
    const { data } = await supabase.from('booking_requests').select('*').eq('id', id).maybeSingle();
    setRow(data as BookingRequestRow | null);
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function approve() {
    setBusy(true);
    setError(null);
    const { error: err } = await bookingDb(getSupabaseBrowser()).rpc('approve_booking_request', { p_id: id });
    setBusy(false);
    setConfirm(null);
    if (err) setError('Impossible d’approuver cette demande.');
    else await load();
  }

  async function reject() {
    setBusy(true);
    setError(null);
    const { error: err } = await bookingDb(getSupabaseBrowser()).rpc('reject_booking_request', { p_id: id, p_reason: reason });
    setBusy(false);
    setConfirm(null);
    if (err) setError('Impossible de refuser cette demande.');
    else await load();
  }

  if (!row) return <p className="text-sm text-muted">Chargement…</p>;
  const cat = fleetCategoryById(row.category);
  const map = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${row.pickup_lat}%2C${row.pickup_lng}%3B${row.dropoff_lat}%2C${row.dropoff_lng}`;

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/admin/demandes" className="text-sm text-brand">
        ← Demandes
      </Link>
      <h1 className="text-2xl font-semibold">{row.reference}</h1>
      <p className="text-sm text-muted">{STATUS[row.status]} · {timeAgo(row.created_at)}</p>
      <div className="rounded-xl border bg-white p-5 text-sm">
        <p><strong>Client</strong> {row.customer_name}</p>
        <p className="mt-1"><strong>Téléphone</strong> {row.customer_phone}</p>
        <p className="mt-1"><strong>Départ</strong> {row.pickup_label}</p>
        <p className="mt-1"><strong>Destination</strong> {row.dropoff_label}</p>
        <p className="mt-1"><strong>Date / heure</strong> {new Date(row.scheduled_for).toLocaleString('fr-FR')}</p>
        <p className="mt-1"><strong>Catégorie</strong> {cat.label} ({cat.hourlyUsd} $/h · {cat.dailyUsd} $/j)</p>
        {row.reject_reason ? <p className="mt-1"><strong>Motif</strong> {row.reject_reason}</p> : null}
      </div>
      <a href={map} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border bg-white">
        <iframe
          title="Aperçu du trajet"
          className="h-56 w-full"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${row.pickup_lng-0.05}%2C${row.pickup_lat-0.05}%2C${row.dropoff_lng+0.05}%2C${row.dropoff_lat+0.05}&layer=mapnik&marker=${row.pickup_lat}%2C${row.pickup_lng}`}
        />
      </a>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        {row.status === 'pending' ? (
          <>
            <button type="button" className="btn-primary" disabled={busy} onClick={() => setConfirm('approve')}>
              Approuver
            </button>
            <button type="button" className="rounded-xl border px-4 py-2 text-sm" disabled={busy} onClick={() => setConfirm('reject')}>
              Refuser
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="rounded-xl border px-4 py-2 text-sm"
          onClick={() =>
            openWhatsApp(
              whatsAppUrl(
                row.customer_phone,
                `Bonjour ${row.customer_name}, nous vous contactons concernant votre demande TAXI NA BISO ${row.reference}.`,
              ),
            )
          }
        >
          Contacter sur WhatsApp
        </button>
        {row.trip_id ? (
          <Link href="/admin/dispatch" className="rounded-xl border px-4 py-2 text-sm">
            Dispatch
          </Link>
        ) : null}
      </div>
      {confirm === 'approve' ? (
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p>Approuver cette demande de course ?</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn-primary" disabled={busy} onClick={() => void approve()}>
              Confirmer
            </button>
            <button type="button" onClick={() => setConfirm(null)}>Annuler</button>
          </div>
        </div>
      ) : null}
      {confirm === 'reject' ? (
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p>Motif du refus</p>
          <select className="mt-2 min-h-11 w-full rounded-lg border px-2" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>Zone non desservie</option>
            <option>Aucun chauffeur disponible</option>
            <option>Informations insuffisantes</option>
            <option>Autre</option>
          </select>
          <div className="mt-3 flex gap-2">
            <button type="button" className="rounded-xl bg-ink px-4 py-2 text-white" disabled={busy} onClick={() => void reject()}>
              Refuser
            </button>
            <button type="button" onClick={() => setConfirm(null)}>Annuler</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'À l’instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const h = Math.round(mins / 60);
  return `Il y a ${h} h`;
}
