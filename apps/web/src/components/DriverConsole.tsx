'use client';

import { channels } from '@openride/realtime';
import { formatDistance, formatDurationS, formatFareCdf } from '@openride/ui';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getApi } from '@/lib/api-browser';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface Vehicle {
  id: string;
  rego: string;
  make: string;
  model: string;
}

interface Offer {
  id: string;
  trip_id: string;
  responds_by: string;
  pickup_eta_s: number | null;
  distance_to_pickup_m: number | null;
  trips: { pickup_address: string; dropoff_address: string; estimated_fare_cents: number | null } | null;
}

interface ActiveTrip {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
}

export function DriverConsole({
  driverId,
  approved,
}: {
  driverId: string;
  approved: boolean;
}) {
  const [online, setOnline] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [trip, setTrip] = useState<ActiveTrip | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchRef = useRef<number | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  const beep = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx.current ??= new Ctx();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // ignore
    }
  }, []);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    const nowIso = new Date().toISOString();
    const [statusRes, tripRes, offerRes, vehRes] = await Promise.all([
      supabase.from('driver_status').select('status, vehicle_id').eq('driver_id', driverId).is('ended_at', null).maybeSingle(),
      supabase
        .from('trips')
        .select('id, status, pickup_address, dropoff_address')
        .eq('driver_id', driverId)
        .in('status', ['assigned', 'driver_en_route', 'arrived_at_pickup', 'in_progress'])
        .order('assigned_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('trip_offers')
        .select('id, trip_id, responds_by, pickup_eta_s, distance_to_pickup_m, trips(pickup_address, dropoff_address, estimated_fare_cents)')
        .eq('driver_id', driverId)
        .eq('status', 'pending')
        .gt('responds_by', nowIso)
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from('vehicles').select('id, rego, make, model').eq('default_driver_id', driverId).eq('status', 'active'),
    ]);
    const status = statusRes.data as { status?: string; vehicle_id?: string } | null;
    setOnline(Boolean(status) && status?.status !== 'offline');
    setVehicleId(status?.vehicle_id ?? null);
    setTrip((tripRes.data as ActiveTrip) ?? null);
    const nextOffer = (offerRes.data as unknown as Offer) ?? null;
    setOffer((prev) => {
      if (nextOffer && nextOffer.id !== prev?.id) beep();
      return nextOffer;
    });
    const vs = (vehRes.data as Vehicle[]) ?? [];
    setVehicles(vs);
    if (!status?.vehicle_id && vs[0]) setVehicleId(vs[0].id);
  }, [beep, driverId]);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const channel = supabase.channel(channels.driver(driverId));
    for (const table of ['driver_status', 'trips', 'trip_offers']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `driver_id=eq.${driverId}` }, () => {
        void refresh();
      });
    }
    channel.subscribe();
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [driverId, refresh]);

  const pushLocation = useCallback(
    async (lat: number, lng: number) => {
      await getSupabaseBrowser().from('driver_location_latest').upsert(
        {
          driver_id: driverId,
          point: `SRID=4326;POINT(${lng} ${lat})`,
          recorded_at: new Date().toISOString(),
        },
        { onConflict: 'driver_id' },
      );
    },
    [driverId],
  );

  useEffect(() => {
    if (!online) {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
      return;
    }
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => void pushLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [online, pushLocation]);

  async function toggle(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      if (online) await getApi().driverGoOffline();
      else {
        if (!approved) throw new Error('Compte non validé : vous ne pouvez pas recevoir de courses.');
        if (!vehicleId) throw new Error('Aucun véhicule actif.');
        await getApi().driverGoOnline(vehicleId);
      }
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Accueil chauffeur</h1>
      {!approved ? (
        <p className="rounded-xl bg-orange-50 p-3 text-sm">Votre dossier n’est pas encore validé. Pas d’offres tant que l’opérateur n’a pas approuvé.</p>
      ) : null}
      <div className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-sm text-muted">Disponibilité (onglet actif uniquement)</p>
        <select
          className="mt-2 min-h-11 w-full rounded-xl border px-3"
          value={vehicleId ?? ''}
          onChange={(e) => setVehicleId(e.target.value)}
          disabled={online}
        >
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.rego} · {v.make} {v.model}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={busy}
          className={`mt-3 min-h-12 w-full rounded-xl font-semibold text-white ${online ? 'bg-danger' : 'bg-success'}`}
        >
          {online ? 'Passer hors ligne' : 'Passer en ligne'}
        </button>
      </div>
      {trip ? (
        <Link href={`/chauffeur/course/${trip.id}`} className="block rounded-2xl bg-brand p-4 text-white">
          Course en cours · {trip.pickup_address} → {trip.dropoff_address}
        </Link>
      ) : null}
      {offer && !trip ? (
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="font-semibold">Nouvelle offre</p>
          <p className="mt-1">{offer.trips?.pickup_address} → {offer.trips?.dropoff_address}</p>
          {offer.distance_to_pickup_m != null ? (
            <p className="text-sm text-muted">{formatDistance(offer.distance_to_pickup_m)}</p>
          ) : null}
          {offer.pickup_eta_s != null ? (
            <p className="text-sm text-muted">{formatDurationS(offer.pickup_eta_s)}</p>
          ) : null}
          {offer.trips?.estimated_fare_cents != null ? (
            <p className="mt-2 text-xl font-bold">{formatFareCdf(offer.trips.estimated_fare_cents)}</p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="min-h-12 flex-1 rounded-xl border"
              onClick={() => {
                void getApi()
                  .declineOffer(offer.trip_id, 'refus web')
                  .then(refresh)
                  .catch((e: unknown) => setError((e as Error).message));
              }}
            >
              Refuser
            </button>
            <button
              type="button"
              className="min-h-12 flex-1 rounded-xl bg-success font-semibold text-white"
              onClick={() => {
                void getApi()
                  .acceptOffer(offer.trip_id)
                  .then(refresh)
                  .catch((e: unknown) => setError((e as Error).message));
              }}
            >
              Accepter
            </button>
          </div>
        </div>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
