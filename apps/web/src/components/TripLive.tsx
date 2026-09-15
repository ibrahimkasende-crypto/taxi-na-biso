'use client';

import { channels } from '@openride/realtime';
import { formatFareCdf } from '@openride/ui';
import { useEffect, useState } from 'react';

import { KinshasaMap } from '@/components/KinshasaMap';
import { Soon } from '@/components/SiteChrome';
import { getApi } from '@/lib/api-browser';
import { getPublicEnv } from '@/lib/env';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { isActiveRiderTrip, tripStatusLabel } from '@/lib/trip-status';

interface TripRow {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  estimated_fare_cents: number | null;
  final_fare_cents: number | null;
  driver_id: string | null;
  booking_id: string;
}

function parsePoint(point: unknown): { lat: number; lng: number } | null {
  if (!point) return null;
  if (typeof point === 'string') {
    const m = /POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i.exec(point);
    if (!m?.[1] || !m[2]) return null;
    return { lng: Number(m[1]), lat: Number(m[2]) };
  }
  if (typeof point === 'object' && point !== null && 'coordinates' in point) {
    const coords = (point as { coordinates?: number[] }).coordinates;
    if (Array.isArray(coords) && coords.length >= 2 && coords[0] != null && coords[1] != null) {
      return { lng: coords[0], lat: coords[1] };
    }
  }
  return null;
}

export function TripLive({ initial }: { initial: TripRow }) {
  const [trip, setTrip] = useState(initial);
  const [driverPhone, setDriverPhone] = useState<string | null>(null);
  const [driverPoint, setDriverPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const env = getPublicEnv();

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel(channels.trip(trip.id))
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'trips', filter: `id=eq.${trip.id}` },
        (payload) => setTrip((prev) => ({ ...prev, ...(payload.new as TripRow) })),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [trip.id]);

  useEffect(() => {
    if (!trip.driver_id) return;
    const supabase = getSupabaseBrowser();
    const driverId = trip.driver_id;
    void supabase
      .from('users')
      .select('phone')
      .eq('id', driverId)
      .maybeSingle()
      .then(({ data }) => setDriverPhone((data as { phone?: string } | null)?.phone ?? null));

    void supabase
      .from('driver_location_latest')
      .select('point')
      .eq('driver_id', driverId)
      .maybeSingle()
      .then(({ data }) => {
        const parsed = parsePoint((data as { point?: unknown } | null)?.point);
        if (parsed) setDriverPoint(parsed);
      });

    const channel = supabase
      .channel(`driver-loc:${driverId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'driver_location_latest', filter: `driver_id=eq.${driverId}` },
        (payload) => {
          const parsed = parsePoint((payload.new as { point?: unknown } | null)?.point);
          if (parsed) setDriverPoint(parsed);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [trip.driver_id]);

  async function cancel(): Promise<void> {
    setError(null);
    try {
      await getApi().cancelBooking(trip.booking_id, 'annulation passager web');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const fare = trip.final_fare_cents ?? trip.estimated_fare_cents;
  const phoneDigits = driverPhone?.replace(/\D/g, '') ?? '';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-brand p-5 text-white">
        <p className="text-sm opacity-90">Statut</p>
        <p className="text-xl font-bold">{tripStatusLabel(trip.status)}</p>
      </div>
      <KinshasaMap driver={driverPoint} />
      <div className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-sm text-muted">Départ</p>
        <p className="font-medium">{trip.pickup_address}</p>
        <p className="mt-3 text-sm text-muted">Arrivée</p>
        <p className="font-medium">{trip.dropoff_address}</p>
        {fare != null ? <p className="mt-3 text-xl font-bold">{formatFareCdf(fare)}</p> : null}
      </div>
      {trip.driver_id ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          {driverPhone ? (
            <a className="min-h-12 flex-1 rounded-xl border px-4 py-3 text-center" href={`tel:${driverPhone}`}>
              Appeler
            </a>
          ) : null}
          {phoneDigits ? (
            <a
              className="min-h-12 flex-1 rounded-xl border px-4 py-3 text-center"
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}
      <p className="text-sm text-muted">
        PIN de démarrage et évaluation <Soon>Bientôt disponible</Soon>
      </p>
      {isActiveRiderTrip(trip.status) && trip.status !== 'in_progress' ? (
        <button type="button" onClick={() => void cancel()} className="min-h-12 w-full rounded-xl border text-danger">
          Annuler la course
        </button>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <p className="text-xs text-muted">Assistance : {env.supportPhone}</p>
    </div>
  );
}
