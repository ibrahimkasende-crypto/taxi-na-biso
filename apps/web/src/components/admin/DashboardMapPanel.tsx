'use client';

import { Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';

import { KinshasaMap } from '@/components/KinshasaMap';
import type { BookingRequestRow } from '@/components/admin/DemandesConsole';

export function DashboardMapPanel({ rows }: { rows: BookingRequestRow[] }) {
  const [fullscreen, setFullscreen] = useState(false);
  const primary = rows[0];
  const pickup = primary ? { lat: primary.pickup_lat, lng: primary.pickup_lng } : undefined;
  const dropoff = primary ? { lat: primary.dropoff_lat, lng: primary.dropoff_lng } : undefined;

  const map = (
    <KinshasaMap pickup={pickup} dropoff={dropoff} />
  );

  return (
    <>
      <section className={`rounded-2xl bg-white p-3 shadow-card ${fullscreen ? 'hidden' : ''}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy">Carte des demandes</h2>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 text-muted hover:text-navy"
            onClick={() => setFullscreen(true)}
            aria-label="Plein écran"
            title="Plein écran"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        <div className="h-52 overflow-hidden rounded-xl sm:h-56">{map}</div>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden /> Départ
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden /> Destination
          </span>
          <span className="flex items-center gap-1">🚕 Véhicule</span>
        </div>
      </section>

      {fullscreen ? (
        <div className="fixed inset-0 z-[85] flex flex-col bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Carte des demandes</h2>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl border"
              onClick={() => setFullscreen(false)}
              aria-label="Quitter le plein écran"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-2xl">{map}</div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
            <span>● Départ</span>
            <span>● Destination</span>
            <span>🚕 Véhicule</span>
          </div>
        </div>
      ) : null}
    </>
  );
}
