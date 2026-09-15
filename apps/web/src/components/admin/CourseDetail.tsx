'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminModal, Skeleton, StatusPill } from '@/components/admin/AdminUi';
import { showAdminToast } from '@/components/admin/AdminShell';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const STEPS = [
  { id: 'requested', label: 'Demande reçue' },
  { id: 'approved', label: 'Approuvée' },
  { id: 'assigned', label: 'Chauffeur attribué' },
  { id: 'driver_en_route', label: 'Chauffeur en route' },
  { id: 'arrived_at_pickup', label: 'Client récupéré' },
  { id: 'in_progress', label: 'Course en cours' },
  { id: 'completed', label: 'Terminée' },
];

export function CourseDetail({ id }: { id: string }) {
  const [trip, setTrip] = useState<Record<string, unknown> | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [drivers, setDrivers] = useState<{ id: string; name: string; online: boolean }[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);
  const [pick, setPick] = useState('');

  async function load() {
    const supabase = bookingDb(getSupabaseBrowser());
    const { data } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
    setTrip((data as Record<string, unknown>) ?? null);
    if (data) {
      const t = data as { rider_id: string; driver_id: string | null };
      const ids = [t.rider_id, t.driver_id].filter(Boolean) as string[];
      const users = await supabase.from('users').select('id, display_name').in('id', ids);
      const map: Record<string, string> = {};
      for (const u of (users.data as { id: string; display_name: string | null }[]) ?? []) map[u.id] = u.display_name || '—';
      setNames(map);
    }
    const [profiles, status] = await Promise.all([
      supabase.from('driver_profiles').select('user_id, status').eq('status', 'approved'),
      supabase.from('driver_status').select('driver_id, status').is('ended_at', null),
    ]);
    const online = new Set(
      ((status.data as { driver_id: string; status: string }[]) ?? []).filter((s) => s.status !== 'offline').map((s) => s.driver_id),
    );
    const ids = ((profiles.data as { user_id: string }[]) ?? []).map((p) => p.user_id);
    const du = ids.length ? await supabase.from('users').select('id, display_name').in('id', ids) : { data: [] };
    setDrivers(
      ((du.data as { id: string; display_name: string | null }[]) ?? []).map((u) => ({
        id: u.id,
        name: u.display_name || 'Chauffeur',
        online: online.has(u.id),
      })),
    );
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = bookingDb(getSupabaseBrowser());
      const { data } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
      if (cancelled) return;
      setTrip((data as Record<string, unknown>) ?? null);
      if (data) {
        const t = data as { rider_id: string; driver_id: string | null };
        const ids = [t.rider_id, t.driver_id].filter(Boolean) as string[];
        const users = await supabase.from('users').select('id, display_name').in('id', ids);
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const u of (users.data as { id: string; display_name: string | null }[]) ?? []) map[u.id] = u.display_name || '—';
        setNames(map);
      }
      const [profiles, status] = await Promise.all([
        supabase.from('driver_profiles').select('user_id, status').eq('status', 'approved'),
        supabase.from('driver_status').select('driver_id, status').is('ended_at', null),
      ]);
      if (cancelled) return;
      const online = new Set(
        ((status.data as { driver_id: string; status: string }[]) ?? []).filter((s) => s.status !== 'offline').map((s) => s.driver_id),
      );
      const ids = ((profiles.data as { user_id: string }[]) ?? []).map((p) => p.user_id);
      const du = ids.length ? await supabase.from('users').select('id, display_name').in('id', ids) : { data: [] };
      if (cancelled) return;
      setDrivers(
        ((du.data as { id: string; display_name: string | null }[]) ?? []).map((u) => ({
          id: u.id,
          name: u.display_name || 'Chauffeur',
          online: online.has(u.id),
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!trip) return <Skeleton className="h-64" />;

  const status = String(trip.status);
  const reached = new Set<string>([status]);
  if (['assigned', 'driver_en_route', 'arrived_at_pickup', 'in_progress', 'completed'].includes(status)) reached.add('approved');
  if (status !== 'requested' && status !== 'scheduled') reached.add('requested');

  async function assign(force = false) {
    const { data, error } = await bookingDb(getSupabaseBrowser()).rpc('admin_assign_trip', {
      p_trip_id: id,
      p_driver_id: pick,
      p_force: force,
    });
    if (error) {
      showAdminToast('Impossible d’attribuer ce chauffeur.');
      return;
    }
    const res = data as { ok?: boolean; warning?: string };
    if (res?.ok === false && res.warning && !force) {
      setWarn(res.warning);
      return;
    }
    showAdminToast('Chauffeur attribué');
    setAssignOpen(false);
    setWarn(null);
    await load();
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/admin/courses" className="text-sm text-muted">
        ← Courses
      </Link>
      <h1 className="text-2xl font-bold">{String(trip.id).slice(0, 8).toUpperCase()}</h1>
      <StatusPill status={status} />
      <div className="rounded-2xl bg-white p-5 shadow-card text-sm">
        <p><strong>Client</strong> {names[String(trip.rider_id)] ?? '—'}</p>
        <p className="mt-1"><strong>Chauffeur</strong> {trip.driver_id ? names[String(trip.driver_id)] ?? '—' : 'Non attribué'}</p>
        <p className="mt-1"><strong>Départ</strong> {String(trip.pickup_address)}</p>
        <p className="mt-1"><strong>Destination</strong> {String(trip.dropoff_address)}</p>
        <p className="mt-1"><strong>Date</strong> {new Date(String(trip.requested_at)).toLocaleString('fr-FR')}</p>
      </div>
      <ol className="rounded-2xl bg-white p-5 shadow-card">
        {STEPS.map((s) => (
          <li key={s.id} className={`mb-2 text-sm ${reached.has(s.id) || status === s.id ? 'font-semibold text-navy' : 'text-muted'}`}>
            {reached.has(s.id) || status === s.id ? '●' : '○'} {s.label}
          </li>
        ))}
      </ol>
      {['requested', 'scheduled', 'requires_manual_dispatch', 'assigned'].includes(status) ? (
        <button type="button" className="rounded-xl bg-taxi px-4 py-2 font-semibold text-navy" onClick={() => setAssignOpen(true)}>
          Attribuer un chauffeur
        </button>
      ) : null}
      {assignOpen ? (
        <AdminModal title="Attribuer un chauffeur" onClose={() => setAssignOpen(false)}>
          <ul className="max-h-64 space-y-2 overflow-auto">
            {drivers.map((d) => (
              <li key={d.id}>
                <label className="flex items-center justify-between rounded-xl border px-3 py-2">
                  <span>
                    {d.name}
                    <span className="ml-2 text-xs text-muted">{d.online ? 'En ligne' : 'Hors ligne'}</span>
                  </span>
                  <input type="radio" name="drv" checked={pick === d.id} onChange={() => setPick(d.id)} />
                </label>
              </li>
            ))}
          </ul>
          {warn ? <p className="mt-2 text-sm text-red-600">{warn} Confirmer malgré tout ?</p> : null}
          <button
            type="button"
            className="mt-3 min-h-11 w-full rounded-xl bg-navy text-white disabled:opacity-50"
            disabled={!pick}
            onClick={() => void assign(Boolean(warn))}
          >
            Confirmer l’attribution
          </button>
        </AdminModal>
      ) : null}
    </div>
  );
}
