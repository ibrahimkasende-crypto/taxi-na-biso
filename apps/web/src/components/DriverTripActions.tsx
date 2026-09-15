'use client';

import { formatFareCdf } from '@openride/ui';
import { useState } from 'react';

import { Soon } from '@/components/SiteChrome';
import { getApi } from '@/lib/api-browser';
import { getPublicEnv } from '@/lib/env';
import { tripStatusLabel } from '@/lib/trip-status';

interface Trip {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  estimated_fare_cents: number | null;
  rider_id: string;
}

export function DriverTripActions({ trip, riderPhone }: { trip: Trip; riderPhone: string | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const env = getPublicEnv();
  const maps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.dropoff_address)}`;
  const pickupMaps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.pickup_address)}`;
  const digits = riderPhone?.replace(/\D/g, '') ?? '';

  async function run(event: 'en-route' | 'arrived' | 'start' | 'complete' | 'cancel'): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await getApi().tripEvent(trip.id, event, event === 'cancel' ? 'annulation chauffeur web' : undefined);
      window.location.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-brand p-4 text-white">
        <p className="text-sm opacity-90">{tripStatusLabel(trip.status)}</p>
        <p className="font-semibold">{trip.pickup_address} → {trip.dropoff_address}</p>
        {trip.estimated_fare_cents != null ? (
          <p className="mt-2 text-xl font-bold">{formatFareCdf(trip.estimated_fare_cents)}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <a className="min-h-12 rounded-xl border px-4 py-3 text-center" href={pickupMaps} target="_blank" rel="noreferrer">
          Naviguer vers le client
        </a>
        <a className="min-h-12 rounded-xl border px-4 py-3 text-center" href={maps} target="_blank" rel="noreferrer">
          Naviguer vers la destination
        </a>
        {riderPhone ? (
          <a className="min-h-12 rounded-xl border px-4 py-3 text-center" href={`tel:${riderPhone}`}>
            Appeler le client
          </a>
        ) : null}
        {digits ? (
          <a className="min-h-12 rounded-xl border px-4 py-3 text-center" href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        ) : null}
      </div>
      <p className="text-sm text-muted">
        Vérification PIN passager <Soon>Bientôt disponible</Soon> — le démarrage utilise le flux existant (arrivé → start).
      </p>
      <div className="grid gap-2">
        {trip.status === 'assigned' ? (
          <button disabled={busy} className="min-h-12 rounded-xl bg-brand text-white" onClick={() => void run('en-route')}>
            En route
          </button>
        ) : null}
        {trip.status === 'assigned' || trip.status === 'driver_en_route' ? (
          <button disabled={busy} className="min-h-12 rounded-xl bg-brand text-white" onClick={() => void run('arrived')}>
            Je suis arrivé
          </button>
        ) : null}
        {trip.status === 'arrived_at_pickup' ? (
          <button disabled={busy} className="min-h-12 rounded-xl bg-success text-white" onClick={() => void run('start')}>
            Démarrer la course
          </button>
        ) : null}
        {trip.status === 'in_progress' ? (
          <button disabled={busy} className="min-h-12 rounded-xl bg-success text-white" onClick={() => void run('complete')}>
            Terminer
          </button>
        ) : null}
        {trip.status !== 'in_progress' && trip.status !== 'completed' ? (
          <button disabled={busy} className="min-h-12 rounded-xl border text-danger" onClick={() => void run('cancel')}>
            Annuler
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <p className="text-xs text-muted">Assistance {env.supportPhone}</p>
    </div>
  );
}
