'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { PlaceSearch } from '@/components/PlaceSearch';
import { fleetCategories, fleetCategoryById, type FleetCategoryId, WHATSAPP_DISPLAY } from '@/config/fleet';
import { nearestPlace } from '@/config/places';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import {
  buildWhatsAppMessage,
  clearDraft,
  combineKinshasaDateTime,
  formatLongDate,
  isImmediate,
  nowHHMM,
  readDraft,
  todayISODate,
  validateRideDraft,
  writeDraft,
  type RideDraft,
} from '@/lib/ride-request';
import { officialWhatsAppUrl, openWhatsApp } from '@/lib/whatsapp';
import { useLiveFleet } from '@/lib/use-live-fleet';

const emptyDraft = (): RideDraft => ({
  name: '',
  phone: '',
  pickup: null,
  dropoff: null,
  date: todayISODate(),
  timeMode: 'now',
  time: nowHHMM(),
  categoryId: 'confort',
});

export function RideRequestForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [draft, setDraft] = useState<RideDraft>(emptyDraft);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [recap, setRecap] = useState(false);
  const [success, setSuccess] = useState<{ reference: string; status: string; whatsAppUrl: string } | null>(null);
  const [isRider, setIsRider] = useState(false);

  useEffect(() => {
    const cat = params.get('cat') as FleetCategoryId | null;
    const stored = readDraft();
    setDraft((prev) => {
      const next = { ...prev, ...stored };
      if (cat && fleetCategories.some((c) => c.id === cat)) next.categoryId = cat;
      return { ...emptyDraft(), ...next, date: next.date || todayISODate() };
    });
    const sync = () => {
      const current = new URL(window.location.href).searchParams.get('cat') as FleetCategoryId | null;
      if (current && fleetCategories.some((c) => c.id === current)) {
        setDraft((d) => ({ ...d, categoryId: current }));
      }
    };
    window.addEventListener('tnb:category', sync);
    return () => window.removeEventListener('tnb:category', sync);
  }, [params]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user || cancelled) return;
      const { data: profile } = await supabase
        .from('users')
        .select('display_name, phone, role')
        .eq('id', user.id)
        .maybeSingle();
      const row = profile as { display_name?: string; phone?: string; role?: string } | null;
      if (!row || row.role !== 'rider') return;
      setIsRider(true);
      setDraft((d) => ({
        ...d,
        name: d.name || row.display_name || user.user_metadata?.display_name || '',
        phone: d.phone || row.phone || user.phone || '',
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cats = useLiveFleet();
  const cat = cats.find((c) => c.id === draft.categoryId) ?? fleetCategoryById(draft.categoryId);
  const immediate = isImmediate(draft);
  const cta = immediate ? 'Commander la course' : 'Réserver la course';
  const timeLabel = draft.timeMode === 'now' ? 'Maintenant' : draft.time;

  function patch(partial: Partial<RideDraft>) {
    setDraft((d) => {
      const next = { ...d, ...partial };
      writeDraft(next);
      return next;
    });
    setError(null);
  }

  async function useGps() {
    if (!navigator.geolocation) {
      setError('La géolocalisation n’est pas disponible. Recherchez votre départ.');
      return;
    }
    setGpsBusy(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let label = 'Ma position actuelle';
        let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`,
          );
          if (res.ok) {
            const geo = (await res.json()) as { locality?: string; city?: string; principalSubdivision?: string };
            const zone = [geo.locality, geo.city || 'Kinshasa'].filter(Boolean).join(', ');
            if (zone) {
              label = zone;
              address = zone;
            }
          }
        } catch {
          const near = nearestPlace(latitude, longitude);
          if (near) {
            label = near.label;
            address = near.address;
          }
        }
        patch({
          pickup: {
            label,
            address,
            lat: latitude,
            lng: longitude,
            place_id: `gps:${latitude.toFixed(5)},${longitude.toFixed(5)}`,
          },
        });
        setGpsBusy(false);
      },
      () => {
        setGpsBusy(false);
        setError('Recherchez votre point de départ');
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  function goRecap() {
    if (compact && step === 1) {
      if (!draft.pickup || !draft.dropoff) {
        setError('Indiquez le départ et la destination.');
        return;
      }
      setStep(2);
      setError(null);
      return;
    }
    const msg = validateRideDraft(draft);
    if (msg) {
      setError(msg);
      if (compact) setStep(2);
      return;
    }
    setRecap(true);
  }

  async function confirmAndWhatsApp() {
    const msg = validateRideDraft(draft);
    if (msg) {
      setError(msg);
      setRecap(false);
      return;
    }
    setBusy(true);
    setError(null);
    writeDraft(draft);
    const scheduledFor =
      draft.timeMode === 'now' ? new Date().toISOString() : combineKinshasaDateTime(draft.date, draft.time).toISOString();
    try {
      const supabase = bookingDb(getSupabaseBrowser());
      const { data, error: rpcError } = await supabase.rpc('submit_booking_request', {
        payload: {
          customer_name: draft.name.trim(),
          customer_phone: draft.phone.trim(),
          pickup_label: draft.pickup!.label,
          pickup_address: draft.pickup!.address,
          pickup_lat: draft.pickup!.lat,
          pickup_lng: draft.pickup!.lng,
          pickup_place_id: draft.pickup!.place_id,
          dropoff_label: draft.dropoff!.label,
          dropoff_address: draft.dropoff!.address,
          dropoff_lat: draft.dropoff!.lat,
          dropoff_lng: draft.dropoff!.lng,
          dropoff_place_id: draft.dropoff!.place_id,
          scheduled_for: scheduledFor,
          is_now: draft.timeMode === 'now',
          category: draft.categoryId,
        },
      });
      if (rpcError) throw rpcError;
      const row = data as { reference?: string; status?: string } | null;
      const reference = row?.reference ?? `TNB-${todayISODate().replace(/-/g, '')}-TEMP`;
      const message = buildWhatsAppMessage({
        reference,
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        pickup: draft.pickup!,
        dropoff: draft.dropoff!,
        date: draft.date,
        timeLabel,
        categoryId: draft.categoryId,
      });
      const wa = officialWhatsAppUrl(message);
      setSuccess({ reference, status: row?.status ?? 'pending', whatsAppUrl: wa });
      setRecap(false);
      openWhatsApp(wa);
    } catch (err) {
      console.error('[booking-request]', err);
      setError('Impossible d’envoyer votre demande pour le moment. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  const fieldCls =
    'mt-1 min-h-12 w-full rounded-xl border border-black/10 bg-[#f7f5f2] px-3 text-ink outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/20';

  if (success) {
    return (
      <div className="w-full rounded-[1.75rem] bg-white/95 p-6 shadow-[0_18px_50px_rgba(17,24,39,0.12)]">
        <p className="text-sm font-medium text-brand">Demande envoyée</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">Votre demande de course a bien été transmise.</h2>
        <p className="mt-2 text-sm text-muted">Elle est actuellement en attente de confirmation.</p>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted">Référence</dt><dd className="font-medium">{success.reference}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Statut</dt><dd className="font-medium">En attente</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Départ</dt><dd className="text-right">{draft.pickup?.label}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Destination</dt><dd className="text-right">{draft.dropoff?.label}</dd></div>
        </dl>
        <p className="mt-4 text-xs text-muted">
          WhatsApp s’ouvre avec le message prêt. Vérifiez-le puis appuyez sur Envoyer. Rien n’est envoyé à votre place.
        </p>
        <button type="button" className="btn-primary mt-5 w-full" onClick={() => openWhatsApp(success.whatsAppUrl)}>
          Rouvrir WhatsApp
        </button>
        <button
          type="button"
          className="mt-2 w-full min-h-11 rounded-xl border border-black/10 text-sm"
          onClick={() => {
            clearDraft();
            router.push(isRider ? '/client/demandes' : '/connexion?next=/client/demandes');
          }}
        >
          Suivre ma demande
        </button>
      </div>
    );
  }

  return (
    <form
      className="w-full rounded-[1.75rem] bg-white/95 p-5 shadow-[0_18px_50px_rgba(17,24,39,0.12)] backdrop-blur-md sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        goRecap();
      }}
    >
      <h2 className="text-lg font-semibold text-ink">Réserver une course</h2>
      <p className="mt-1 text-sm text-muted">Kinshasa · réponse via WhatsApp {WHATSAPP_DISPLAY}</p>

      <div className={compact && step === 2 ? 'hidden lg:block' : ''}>
        <div className="mt-4 space-y-3">
          <PlaceSearch
            label="D’où partez-vous ?"
            placeholder="unik, gombe, aéroport…"
            value={draft.pickup}
            onChange={(pickup) => patch({ pickup })}
            onUseGps={useGps}
            gpsBusy={gpsBusy}
          />
          <PlaceSearch
            label="Où allez-vous ?"
            placeholder="victoire, limete…"
            value={draft.dropoff}
            onChange={(dropoff) => patch({ dropoff })}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Date
            <input
              type="date"
              min={todayISODate()}
              value={draft.date}
              onChange={(e) => patch({ date: e.target.value })}
              className={fieldCls}
            />
          </label>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Heure</p>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                className={`min-h-12 flex-1 rounded-xl border text-sm font-medium ${
                  draft.timeMode === 'now' ? 'border-brand bg-orange-50 text-brand' : 'border-black/10'
                }`}
                onClick={() => patch({ timeMode: 'now', time: nowHHMM() })}
              >
                Maintenant
              </button>
            </div>
            <input
              type="time"
              value={draft.time}
              onChange={(e) => patch({ timeMode: 'scheduled', time: e.target.value })}
              className={`${fieldCls} mt-2`}
            />
          </div>
        </div>
      </div>

      <div className={compact && step === 1 ? 'hidden lg:block' : ''}>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Nom
            <input
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Votre nom"
              className={fieldCls}
              autoComplete="name"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Téléphone
            <input
              value={draft.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              placeholder="+243 …"
              className={fieldCls}
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Type de véhicule</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {cats.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => patch({ categoryId: c.id })}
              className={`min-h-12 shrink-0 rounded-xl border px-3 text-left text-sm ${
                draft.categoryId === c.id ? 'border-brand bg-orange-50' : 'border-black/10'
              }`}
            >
              <span className="block font-medium">{c.label}</span>
              <span className="text-xs text-muted">{c.hourlyUsd} $/h</span>
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : compact && step === 1 ? 'Continuer' : cta}
      </button>
      {compact && step === 2 ? (
        <button type="button" className="mt-2 w-full text-sm text-brand" onClick={() => setStep(1)}>
          Modifier le trajet
        </button>
      ) : null}

      {recap ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Votre demande</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="Client" v={draft.name} />
              <Row k="Téléphone" v={draft.phone} />
              <Row k="Départ" v={draft.pickup?.label ?? ''} />
              <Row k="Destination" v={draft.dropoff?.label ?? ''} />
              <Row k="Date" v={formatLongDate(draft.date)} />
              <Row k="Heure" v={timeLabel} />
              <Row k="Catégorie" v={cat.label} />
              <Row k="Tarif de référence" v={`${cat.hourlyUsd} $ / heure · ${cat.dailyUsd} $ / journée`} />
            </dl>
            <p className="mt-3 text-xs text-muted">Aucun prix de trajet n’est calculé : ces tarifs sont à l’heure et à la journée.</p>
            <div className="mt-5 flex flex-col gap-2">
              <button type="button" disabled={busy} className="btn-primary w-full" onClick={() => void confirmAndWhatsApp()}>
                {busy ? 'Envoi de la demande…' : 'Confirmer sur WhatsApp'}
              </button>
              <button type="button" className="min-h-11 rounded-xl border border-black/10 text-sm" onClick={() => setRecap(false)}>
                Modifier
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium text-ink">{v}</dd>
    </div>
  );
}

export function scrollToReservation(categoryId?: FleetCategoryId) {
  const url = new URL(window.location.href);
  url.hash = 'reservation';
  if (categoryId) url.searchParams.set('cat', categoryId);
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  document.getElementById('reservation')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  window.dispatchEvent(new Event('tnb:category'));
}
