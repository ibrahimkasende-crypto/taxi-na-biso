'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';

import { DatePicker } from '@/components/DatePicker';
import { PlaceSearch } from '@/components/PlaceSearch';
import { TimePicker } from '@/components/TimePicker';
import { fleetCategories, fleetCategoryById, fleetImageForCategory, type FleetCategoryId } from '@/config/fleet';
import { nearestPlace, quickDestinations } from '@/config/places';
import { bookingDb } from '@/lib/booking-db';
import { usePrefersReducedMotion } from '@/lib/motion';
import {
  buildWhatsAppMessage,
  clearDraft,
  combineKinshasaDateTime,
  formatPickupSchedule,
  isImmediate,
  isPlausiblePhone,
  isTimePastOnDate,
  normalizePhone,
  nowHHMM,
  readDraft,
  todayISODate,
  validateRideDraft,
  writeDraft,
  type RideDraft,
  type RidePlace,
} from '@/lib/ride-request';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { officialWhatsAppUrl, openWhatsApp } from '@/lib/whatsapp';
import { useLiveFleet } from '@/lib/use-live-fleet';

type Step = 'dropoff' | 'pickup' | 'when' | 'nowConfirm' | 'date' | 'time' | 'vehicle' | 'contact' | 'recap' | 'done';

const MAIN: Step[] = ['dropoff', 'pickup', 'when', 'vehicle', 'contact'];

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

function hasIdentity(d: RideDraft): boolean {
  return Boolean(d.name.trim() && isPlausiblePhone(d.phone));
}

export function RideRequestForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const reduce = usePrefersReducedMotion();
  const [draft, setDraft] = useState<RideDraft>(emptyDraft);
  const [step, setStep] = useState<Step>('dropoff');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [success, setSuccess] = useState<{ reference: string; whatsAppUrl: string } | null>(null);
  const [isRider, setIsRider] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const titleId = useId();
  const cats = useLiveFleet();
  const cat = cats.find((c) => c.id === draft.categoryId) ?? fleetCategoryById(draft.categoryId);
  const expanded = compact && step !== 'dropoff' && step !== 'done';

  useEffect(() => {
    const catParam = params.get('cat') as FleetCategoryId | null;
    const stored = readDraft();
    setDraft((prev) => {
      const next = { ...prev, ...stored };
      if (catParam && fleetCategories.some((c) => c.id === catParam)) next.categoryId = catParam;
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

  useEffect(() => {
    document.body.dataset.bookingOpen = expanded ? '1' : '0';
    return () => {
      delete document.body.dataset.bookingOpen;
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  function go(next: Step) {
    setError(null);
    setStep(next);
    setAnimKey((k) => k + 1);
  }

  function patch(partial: Partial<RideDraft>) {
    setDraft((d) => {
      const next = { ...d, ...partial };
      writeDraft(next);
      return next;
    });
    setError(null);
  }

  function afterVehicle(d = draft) {
    go(hasIdentity(d) ? 'recap' : 'contact');
  }

  async function useGps() {
    if (!navigator.geolocation) {
      setGpsDenied(true);
      setError('Localisation non autorisée. Recherchez votre point de départ.');
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
            const geo = (await res.json()) as { locality?: string; city?: string };
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
        const pickup: RidePlace = {
          label,
          address,
          lat: latitude,
          lng: longitude,
          place_id: `gps:${latitude.toFixed(5)},${longitude.toFixed(5)}`,
        };
        patch({ pickup });
        setGpsBusy(false);
        setGpsDenied(false);
        window.setTimeout(() => go('when'), reduce ? 0 : 180);
      },
      () => {
        setGpsBusy(false);
        setGpsDenied(true);
        setError(null);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function confirm() {
    const normalized = { ...draft, phone: normalizePhone(draft.phone) };
    patch({ phone: normalized.phone });
    const msg = validateRideDraft(normalized);
    if (msg) {
      setError(msg);
      return;
    }
    setBusy(true);
    setError(null);
    const scheduledFor =
      normalized.timeMode === 'now' ? new Date().toISOString() : combineKinshasaDateTime(normalized.date, normalized.time).toISOString();
    try {
      const supabase = bookingDb(getSupabaseBrowser());
      const { data, error: rpcError } = await supabase.rpc('submit_booking_request', {
        payload: {
          customer_name: normalized.name.trim(),
          customer_phone: normalized.phone.trim(),
          pickup_label: normalized.pickup!.label,
          pickup_address: normalized.pickup!.address,
          pickup_lat: normalized.pickup!.lat,
          pickup_lng: normalized.pickup!.lng,
          pickup_place_id: normalized.pickup!.place_id,
          dropoff_label: normalized.dropoff!.label,
          dropoff_address: normalized.dropoff!.address,
          dropoff_lat: normalized.dropoff!.lat,
          dropoff_lng: normalized.dropoff!.lng,
          dropoff_place_id: normalized.dropoff!.place_id,
          scheduled_for: scheduledFor,
          is_now: normalized.timeMode === 'now',
          category: normalized.categoryId,
        },
      });
      if (rpcError) throw rpcError;
      const row = data as { reference?: string } | null;
      const reference = row?.reference ?? `TNB-${todayISODate().replace(/-/g, '')}-TEMP`;
      const message = buildWhatsAppMessage({
        reference,
        name: normalized.name.trim(),
        phone: normalized.phone.trim(),
        pickup: normalized.pickup!,
        dropoff: normalized.dropoff!,
        date: normalized.date,
        timeLabel: normalized.time,
        categoryId: normalized.categoryId,
        isNow: normalized.timeMode === 'now',
      });
      setSuccess({ reference, whatsAppUrl: officialWhatsAppUrl(message) });
      go('done');
    } catch (err) {
      console.error('[booking-request]', err);
      setError('Nous n’avons pas pu enregistrer votre demande. Vos informations sont conservées, veuillez réessayer.');
    } finally {
      setBusy(false);
    }
  }

  const mainIndex = Math.max(
    0,
    MAIN.indexOf(
      step === 'date' || step === 'time' || step === 'nowConfirm'
        ? 'when'
        : step === 'recap' || step === 'done'
          ? 'contact'
          : step,
    ),
  );

  const pickupLabel = formatPickupSchedule(draft);

  const phoneNational = draft.phone.replace(/^\+?243/, '').replace(/\D/g, '');

  const cardCls =
    'tnb-book-card w-full rounded-[1.75rem] p-4 text-ink transition-[min-height] duration-300 sm:min-h-[17rem] sm:p-6';

  const body = (
    <div key={animKey} className={reduce ? '' : 'tnb-step-in'}>
      {step !== 'dropoff' && step !== 'done' ? (
        <button
          type="button"
          className="mb-3 inline-flex min-h-10 items-center gap-1 text-sm text-muted hover:text-ink"
          onClick={() => {
            if (step === 'pickup') go('dropoff');
            else if (step === 'when') go('pickup');
            else if (step === 'nowConfirm') go('when');
            else if (step === 'date') go('when');
            else if (step === 'time') go('date');
            else if (step === 'vehicle') go(draft.timeMode === 'now' ? 'nowConfirm' : 'time');
            else if (step === 'contact') go('vehicle');
            else if (step === 'recap') go(hasIdentity(draft) ? 'vehicle' : 'contact');
          }}
          aria-label="Retour"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
      ) : null}

      {step !== 'done' ? (
        <div className="mb-4 flex gap-1.5" aria-hidden>
          {MAIN.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 flex-1 rounded-full ${i <= mainIndex ? 'bg-taxi' : 'bg-black/10'}`}
            />
          ))}
        </div>
      ) : null}

      {step === 'dropoff' ? (
        <>
          <h2 id={titleId} className="text-xl font-semibold sm:text-2xl">
            Où souhaitez-vous aller ?
          </h2>
          <div className="mt-4">
            <PlaceSearch
              hideLabel
              autoFocus={!compact}
              label="Où souhaitez-vous aller ?"
              placeholder="Rechercher votre destination"
              value={draft.dropoff}
              chips={quickDestinations}
              onChange={(dropoff) => patch({ dropoff })}
              onPicked={() => window.setTimeout(() => go('pickup'), reduce ? 0 : 200)}
            />
          </div>
          <button
            type="button"
            className="btn-primary mt-5 w-full"
            disabled={!draft.dropoff}
            onClick={() => draft.dropoff && go('pickup')}
          >
            Continuer
          </button>
        </>
      ) : null}

      {step === 'pickup' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">D’où partez-vous ?</h2>
          {gpsDenied ? (
            <p className="mt-2 text-sm text-muted">Localisation non autorisée. Recherchez votre point de départ.</p>
          ) : null}
          <div className="mt-4">
            <PlaceSearch
              hideLabel
              autoFocus={gpsDenied}
              label="D’où partez-vous ?"
              placeholder="Rechercher mon point de départ"
              value={draft.pickup}
              onChange={(pickup) => patch({ pickup })}
              onUseGps={useGps}
              gpsBusy={gpsBusy}
              onPicked={() => window.setTimeout(() => go('when'), reduce ? 0 : 200)}
            />
          </div>
          {draft.pickup && !gpsBusy ? (
            <button type="button" className="btn-primary mt-5 w-full" onClick={() => go('when')}>
              Continuer
            </button>
          ) : null}
        </>
      ) : null}

      {step === 'when' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">Quand souhaitez-vous être récupéré ?</h2>
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              className="min-h-14 rounded-2xl border-2 border-black/8 bg-white px-4 text-left hover:border-taxi sm:min-h-16"
              onClick={() => {
                patch({ timeMode: 'now', date: todayISODate(), time: nowHHMM() });
                window.setTimeout(() => go('nowConfirm'), reduce ? 0 : 180);
              }}
            >
              <span className="block text-lg font-semibold">Maintenant</span>
              <span className="text-sm text-muted">Dès qu’un chauffeur est disponible</span>
            </button>
            <button
              type="button"
              className="min-h-14 rounded-2xl border-2 border-black/8 bg-white px-4 text-left hover:border-taxi sm:min-h-16"
              onClick={() => {
                patch({ timeMode: 'scheduled' });
                go('date');
              }}
            >
              <span className="block text-lg font-semibold">Planifier</span>
              <span className="text-sm text-muted">Choisir une date et une heure</span>
            </button>
          </div>
        </>
      ) : null}

      {step === 'nowConfirm' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">Prise en charge</h2>
          <div className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-4">
            <span className="block text-xs text-muted">Prise en charge</span>
            <span className="block text-lg font-semibold">Dès que possible</span>
          </div>
          <button type="button" className="btn-primary mt-5 w-full" onClick={() => go('vehicle')}>
            Continuer
          </button>
        </>
      ) : null}

      {step === 'date' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">Choisissez votre date</h2>
          <div className="mt-4">
            <DatePicker
              value={draft.date}
              onChange={(date) => {
                patch({ date, timeMode: 'scheduled' });
                window.setTimeout(() => go('time'), reduce ? 0 : 200);
              }}
            />
          </div>
        </>
      ) : null}

      {step === 'time' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">À quelle heure souhaitez-vous être récupéré ?</h2>
          <div className="mt-4">
            <TimePicker
              date={draft.date}
              value={draft.time}
              onChange={(time) => {
                if (isTimePastOnDate(draft.date, time)) {
                  setError('Cette heure est déjà passée. Choisissez une autre heure.');
                  return;
                }
                patch({ time, timeMode: 'scheduled' });
                window.setTimeout(() => go('vehicle'), reduce ? 0 : 200);
              }}
            />
          </div>
          {error ? (
            <p className="mt-3 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </>
      ) : null}

      {step === 'vehicle' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">Quel véhicule vous convient ?</h2>
          <div className="-mx-1 mt-3 flex gap-2.5 overflow-x-auto px-1 pb-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((c) => {
              const selected = draft.categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    const next = { ...draft, categoryId: c.id };
                    patch({ categoryId: c.id });
                    window.setTimeout(() => afterVehicle(next), reduce ? 0 : 220);
                  }}
                  className={`w-[8.75rem] shrink-0 snap-start overflow-hidden rounded-2xl border-2 text-left sm:w-40 ${
                    selected ? 'border-taxi' : 'border-black/8'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fleetImageForCategory(c.id)} alt="" className="h-20 w-full object-cover sm:h-24" />
                  <span className="block px-2.5 py-2 sm:px-3">
                    <span className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold sm:text-base">{c.label}</span>
                      {selected ? <Check className="h-4 w-4 text-navy" aria-hidden /> : null}
                    </span>
                    <span className="block text-xs text-muted sm:text-sm">{c.hourlyUsd} $ / h</span>
                    <span className="hidden text-[11px] text-muted sm:block">{c.vehicles[0]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {step === 'contact' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">Presque terminé 👋</h2>
          <p className="mt-1 text-sm text-muted">Comment pouvons-nous vous contacter ?</p>
          <label className="mt-4 block text-sm font-medium">
            Nom
            <input
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              autoComplete="name"
              className="mt-1 min-h-12 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-3 outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <label className="mt-3 block text-sm font-medium">
            Téléphone / WhatsApp
            <span className="mt-1 flex overflow-hidden rounded-2xl border border-black/10 bg-[#f7f5f2] focus-within:ring-2 focus-within:ring-brand/20">
              <span className="flex min-h-12 items-center px-3 text-sm text-muted">🇨🇩 +243</span>
              <input
                value={phoneNational}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw.trim().startsWith('+') || raw.startsWith('00')) patch({ phone: normalizePhone(raw) });
                  else patch({ phone: normalizePhone(`+243${raw.replace(/\D/g, '')}`) });
                }}
                inputMode="tel"
                autoComplete="tel"
                placeholder="974 543 860"
                className="min-h-12 min-w-0 flex-1 bg-transparent px-2 outline-none"
              />
            </span>
          </label>
          <button
            type="button"
            className="btn-primary mt-5 w-full"
            disabled={!hasIdentity({ ...draft, phone: normalizePhone(draft.phone) })}
            onClick={() => go('recap')}
          >
            Continuer
          </button>
        </>
      ) : null}

      {step === 'recap' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">Votre course</h2>
          <ul className="mt-4 divide-y divide-black/5 text-sm">
            <RecapRow label="Départ" value={draft.pickup?.label ?? ''} onEdit={() => go('pickup')} />
            <RecapRow label="Destination" value={draft.dropoff?.label ?? ''} onEdit={() => go('dropoff')} />
            <RecapRow label="Prise en charge" value={pickupLabel} onEdit={() => go(isImmediate(draft) ? 'nowConfirm' : 'time')} />
            <RecapRow label="Véhicule" value={cat.label} onEdit={() => go('vehicle')} />
            <RecapRow label="Client" value={draft.name} onEdit={() => go('contact')} />
            <RecapRow label="Téléphone" value={normalizePhone(draft.phone)} onEdit={() => go('contact')} />
          </ul>
          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <button type="button" disabled={busy} className="btn-primary mt-5 w-full" onClick={() => void confirm()}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Création de votre demande…
              </span>
            ) : (
              'CONFIRMER LA COURSE'
            )}
          </button>
        </>
      ) : null}

      {step === 'done' && success ? (
        <div className="text-center">
          <p className="text-3xl" aria-hidden>
            ✓
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Demande prête !</h2>
          <p className="mt-2 text-sm text-muted">Votre demande a été enregistrée.</p>
          <p className="mt-3 text-sm">
            Référence : <strong>{success.reference}</strong>
          </p>
          <button
            type="button"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#25D366] px-5 font-semibold text-white"
            onClick={() => openWhatsApp(success.whatsAppUrl)}
          >
            Ouvrir WhatsApp
          </button>
          <p className="mt-3 text-xs text-muted">
            Une conversation avec TAXI NA BISO va s’ouvrir avec votre demande déjà préparée. Rien n’est envoyé à votre place.
          </p>
          <button
            type="button"
            className="mt-3 w-full min-h-11 text-sm text-brand"
            onClick={() => {
              clearDraft();
              router.push(isRider ? '/client/demandes' : '/connexion?next=/client/demandes');
            }}
          >
            Suivre ma demande
          </button>
        </div>
      ) : null}
    </div>
  );

  const card = (
    <div className={cardCls} role="form" aria-labelledby={titleId}>
      {body}
    </div>
  );

  if (expanded) {
    return (
      <div className="lg:contents">
        <div className="fixed inset-0 z-40 bg-navy/50 lg:hidden" />
        <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-[1.75rem] pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:rounded-none lg:pb-0">
          {card}
        </div>
      </div>
    );
  }

  return card;
}

function RecapRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <span>
        <span className="block text-xs text-muted">{label}</span>
        <span className="font-medium">{value}</span>
      </span>
      <button type="button" className="text-xs font-medium text-brand" onClick={onEdit}>
        Modifier
      </button>
    </li>
  );
}

export function scrollToReservation(categoryId?: FleetCategoryId) {
  const url = new URL(window.location.href);
  url.hash = 'reservation';
  if (categoryId) url.searchParams.set('cat', categoryId);
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  document.getElementById('reservation')?.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
  window.dispatchEvent(new Event('tnb:category'));
}
