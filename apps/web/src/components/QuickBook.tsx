'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatDistance, formatDurationS, formatFareCdf } from '@openride/ui';
import { ChevronDown, Loader2, MapPin, Navigation } from 'lucide-react';

import { examplePlaces, vehicleCategories, vehicleCategoryById, type VehicleCategory } from '@/config/brand';
import { getApi } from '@/lib/api-browser';
import { previewRoute } from '@/lib/booking-preview';

export interface Place {
  label: string;
  lat: number;
  lng: number;
}

export function QuickBook({
  compact = false,
  variant = 'default',
  pickup: pickupProp,
  dropoff: dropoffProp,
  onPickupChange,
  onDropoffChange,
}: {
  compact?: boolean;
  variant?: 'default' | 'hero';
  pickup?: Place | null;
  dropoff?: Place | null;
  onPickupChange?: (place: Place | null) => void;
  onDropoffChange?: (place: Place | null) => void;
}) {
  const [pickupInner, setPickupInner] = useState<Place | null>(null);
  const [dropoffInner, setDropoffInner] = useState<Place | null>(null);
  const pickup = pickupProp !== undefined ? pickupProp : pickupInner;
  const dropoff = dropoffProp !== undefined ? dropoffProp : dropoffInner;
  const setPickup = onPickupChange ?? setPickupInner;
  const setDropoff = onDropoffChange ?? setDropoffInner;
  const [categoryId, setCategoryId] = useState<VehicleCategory['id']>('economy');
  const [when, setWhen] = useState<'now' | 'scheduled'>('now');
  const [whenOpen, setWhenOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<{
    total_cents: number;
    distance_m: number;
    duration_s: number;
  } | null>(null);

  const category = vehicleCategoryById(categoryId);
  const hero = variant === 'hero';
  const showExtras = !hero && Boolean(pickup && dropoff);

  const preview = useMemo(() => {
    if (!pickup || !dropoff) return null;
    return previewRoute(pickup, dropoff);
  }, [pickup, dropoff]);

  async function locate(): Promise<void> {
    setError(null);
    if (!navigator.geolocation) {
      setError('Géolocalisation indisponible sur ce navigateur.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickup({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Ma position actuelle',
        });
      },
      () => setError('Autorisez la position pour définir le départ.'),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function onEstimate(): Promise<void> {
    if (!pickup || !dropoff || !category) return;
    setBusy(true);
    setError(null);
    try {
      const e = await getApi().fareEstimate({
        pickup: { lat: pickup.lat, lng: pickup.lng },
        dropoff: { lat: dropoff.lat, lng: dropoff.lng },
        vehicle_type: category.vehicleType,
      });
      setEstimate(e);
    } catch (e) {
      setEstimate(null);
      setError(
        `Estimation serveur indisponible (${(e as Error).message}). Distance indicative : ${
          preview ? formatDistance(preview.distance_m) : '—'
        }.`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function onBook(): Promise<void> {
    if (!pickup || !dropoff || !category) return;
    setBusy(true);
    setError(null);
    try {
      const { trip_id } = await getApi().createBooking({
        type: when,
        pickup: { lat: pickup.lat, lng: pickup.lng },
        pickup_label: pickup.label,
        dropoff: { lat: dropoff.lat, lng: dropoff.lng },
        dropoff_label: dropoff.label,
        vehicle_type: category.vehicleType,
        scheduled_pickup_at: when === 'scheduled' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });
      window.location.href = `/commander/confirmation?trip=${encodeURIComponent(trip_id)}`;
    } catch (e) {
      const msg = (e as Error).message;
      if (/jwt|auth|session|not authenticated/i.test(msg) || /401/.test(msg)) {
        window.location.href = `/connexion?next=${encodeURIComponent('/commander')}`;
        return;
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function onHeroContinue(): void {
    if (!pickup || !dropoff) return;
    const q = new URLSearchParams({
      from: pickup.label,
      to: dropoff.label,
      when,
    });
    if (when === 'scheduled' && scheduledAt) q.set('at', scheduledAt);
    window.location.href = `/commander?${q.toString()}`;
  }

  const fieldCls = hero
    ? 'min-h-12 w-full rounded-xl border border-black/10 bg-[#f7f5f2] px-3 text-ink'
    : 'min-h-12 w-full rounded-xl border px-3';

  return (
    <div
      className={
        hero
          ? 'rounded-[1.75rem] bg-white/95 p-5 text-ink shadow-[0_18px_50px_rgba(17,24,39,0.18)] backdrop-blur-md'
          : `rounded-2xl bg-white p-4 shadow-card ${compact ? '' : 'sm:p-6'}`
      }
    >
      {hero ? (
        <p className="text-sm font-semibold text-ink">Commander une course</p>
      ) : (
        <>
          <h2 className="text-lg font-semibold">Commander une course</h2>
          <p className="mt-1 text-sm text-muted">Indiquez départ et destination, puis choisissez votre course.</p>
        </>
      )}

      <label className="mt-4 block text-sm font-medium">Où êtes-vous ?</label>
      <div className="mt-1 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
          <select
            className={`${fieldCls} pl-9`}
            value={pickup?.label === 'Ma position actuelle' ? 'Ma position actuelle' : (pickup?.label ?? '')}
            onChange={(e) => {
              if (e.target.value === 'Ma position actuelle') return;
              const p = examplePlaces.find((x) => x.label === e.target.value);
              setPickup(p ?? null);
              setEstimate(null);
            }}
            aria-label="Point de départ"
          >
            <option value="">Point de départ</option>
            {pickup?.label === 'Ma position actuelle' ? (
              <option value="Ma position actuelle">Ma position actuelle</option>
            ) : null}
            {examplePlaces.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => void locate()}
          className="min-h-12 shrink-0 rounded-xl border border-black/10 px-3 text-sm font-medium text-ink hover:border-brand/40"
        >
          Ma position
        </button>
      </div>

      <label className="mt-3 block text-sm font-medium">Où allez-vous ?</label>
      <div className="relative mt-1">
        <Navigation className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
        <select
          className={`${fieldCls} pl-9`}
          value={dropoff?.label ?? ''}
          onChange={(e) => {
            const p = examplePlaces.find((x) => x.label === e.target.value);
            setDropoff(p ?? null);
            setEstimate(null);
          }}
          aria-label="Destination"
        >
          <option value="">Destination</option>
          {examplePlaces.map((p) => (
            <option key={p.label} value={p.label}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative mt-3">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-medium"
          onClick={() => setWhenOpen((v) => !v)}
          aria-expanded={whenOpen}
        >
          {when === 'now' ? 'Maintenant' : 'Programmer une course'}
          <ChevronDown className="h-4 w-4" />
        </button>
        {whenOpen ? (
          <div className="absolute z-20 mt-2 w-56 rounded-2xl border border-black/10 bg-white p-2 shadow-card">
            <button
              type="button"
              className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm hover:bg-canvas"
              onClick={() => {
                setWhen('now');
                setWhenOpen(false);
              }}
            >
              Maintenant
            </button>
            <button
              type="button"
              className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm hover:bg-canvas"
              onClick={() => {
                setWhen('scheduled');
                setWhenOpen(false);
              }}
            >
              Programmer une course
            </button>
          </div>
        ) : null}
      </div>
      {when === 'scheduled' ? (
        <input
          type="datetime-local"
          className={`mt-2 ${fieldCls}`}
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      ) : null}

      {showExtras ? (
        <>
          <label className="mt-4 block text-sm font-medium">Choisissez votre course</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {vehicleCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryId(c.id);
                  setEstimate(null);
                }}
                className={`min-h-11 rounded-full border px-4 text-sm ${
                  categoryId === c.id ? 'border-brand bg-brand text-white' : 'bg-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {preview && !hero ? (
        <p className="mt-3 text-sm text-muted">
          Distance indicative : {formatDistance(preview.distance_m)} · {formatDurationS(preview.duration_s)}
        </p>
      ) : null}
      {estimate ? <p className="mt-2 text-2xl font-bold">{formatFareCdf(estimate.total_cents)}</p> : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}

      {hero ? (
        <button
          type="button"
          disabled={!pickup || !dropoff}
          onClick={onHeroContinue}
          className="btn-primary mt-5 w-full"
        >
          Commander une course
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={!pickup || !dropoff || busy}
            onClick={() => void onEstimate()}
            className="min-h-12 flex-1 rounded-xl border font-medium disabled:opacity-50"
          >
            {busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Estimer'}
          </button>
          <button
            type="button"
            disabled={!pickup || !dropoff || busy}
            onClick={() => void onBook()}
            className="min-h-12 flex-1 rounded-xl bg-brand font-semibold text-white disabled:opacity-50"
          >
            {busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Commander'}
          </button>
        </div>
      )}
      {!hero ? (
        <p className="mt-3 text-xs text-muted">
          Connectez-vous pour confirmer. Sans réseau, aucune course n’est créée.{' '}
          <Link href="/commander" className="text-brand">
            Carte et suivi
          </Link>
        </p>
      ) : null}
    </div>
  );
}
