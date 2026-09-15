'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Car, Check, Clock, Loader2, MapPin, Phone, User } from 'lucide-react';

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
  formatLongDate,
  formatPickupRecapParts,
  formatWeekdayLong,
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

  const schedule = formatPickupRecapParts(draft);

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
          <p className="mt-1 text-sm text-muted">Votre chauffeur viendra vous chercher dès qu’il est disponible.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ScheduleTile icon={CalendarDays} label="Date" value="Aujourd’hui" accent />
            <ScheduleTile icon={Clock} label="Heure" value="Dès que possible" accent />
          </div>
          <button type="button" className="btn-primary mt-5 w-full" onClick={() => go('vehicle')}>
            Continuer
          </button>
        </>
      ) : null}

      {step === 'date' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">Choisissez votre date</h2>
          <p className="mt-1 text-sm text-muted">Quand le chauffeur doit-il venir vous récupérer ?</p>
          <div className="mt-4 rounded-2xl border-2 border-taxi/30 bg-taxi/10 px-4 py-4 text-center">
            <span className="block text-xs font-medium uppercase tracking-wide text-navy/60">Date sélectionnée</span>
            <p className="mt-1 text-xl font-bold capitalize text-navy sm:text-2xl">{formatWeekdayLong(draft.date)}</p>
          </div>
          <div className="mt-4">
            <DatePicker
              value={draft.date}
              onChange={(date) => {
                patch({ date, timeMode: 'scheduled' });
                window.setTimeout(() => go('time'), reduce ? 0 : 200);
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted">Touchez le champ pour ouvrir le calendrier</p>
        </>
      ) : null}

      {step === 'time' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">À quelle heure souhaitez-vous être récupéré ?</h2>
          <p className="mt-1 text-sm text-muted">Pour le {formatLongDate(draft.date)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ScheduleTile icon={CalendarDays} label="Date" value={formatLongDate(draft.date)} />
            <ScheduleTile icon={Clock} label="Heure" value={draft.time || '—'} accent highlight />
          </div>
          <div className="mt-4">
            <TimePicker
              inline
              date={draft.date}
              value={draft.time}
              onChange={(time) => {
                if (isTimePastOnDate(draft.date, time)) {
                  setError('Cette heure est déjà passée. Choisissez une autre heure.');
                  return;
                }
                patch({ time, timeMode: 'scheduled' });
                setError(null);
              }}
            />
          </div>
          {error ? (
            <p className="mt-3 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            className="btn-primary mt-5 w-full"
            disabled={!draft.time || isTimePastOnDate(draft.date, draft.time)}
            onClick={() => go('vehicle')}
          >
            Continuer
          </button>
        </>
      ) : null}

      {step === 'vehicle' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">Quel véhicule vous convient ?</h2>
          <ScheduleBanner schedule={schedule} className="mt-3" />
          <div className="-mx-1 mt-3 flex gap-2.5 overflow-x-auto px-1 pb-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((c) => {
              const selected = draft.categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => patch({ categoryId: c.id })}
                  className={`w-[8.75rem] shrink-0 snap-start overflow-hidden rounded-2xl border-2 text-left sm:w-40 ${
                    selected ? 'border-taxi ring-2 ring-taxi/30' : 'border-black/8'
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
          <button type="button" className="btn-primary mt-5 w-full" onClick={() => afterVehicle()}>
            Continuer
          </button>
        </>
      ) : null}

      {step === 'contact' ? (
        <>
          <h2 className="text-xl font-semibold sm:text-2xl">Presque terminé 👋</h2>
          <p className="mt-1 text-sm text-muted">Comment pouvons-nous vous contacter ?</p>
          <ScheduleBanner schedule={schedule} className="mt-3" />
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
          <p className="mt-1 text-sm text-muted">Vérifiez les informations avant confirmation.</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-taxi/25 text-brand">
                    <MapPin className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="my-1 w-0.5 flex-1 min-h-[1.5rem] bg-black/10" aria-hidden />
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-navy/10 text-navy">
                    <MapPin className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <RecapField label="Départ" value={draft.pickup?.label ?? ''} onEdit={() => go('pickup')} />
                  <RecapField label="Destination" value={draft.dropoff?.label ?? ''} onEdit={() => go('dropoff')} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-taxi/35 bg-gradient-to-br from-taxi/15 to-taxi/5 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-navy/70">Prise en charge</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-brand underline-offset-2 hover:underline"
                  onClick={() => go(isImmediate(draft) ? 'nowConfirm' : 'time')}
                >
                  Modifier
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ScheduleTile icon={CalendarDays} label="Date" value={schedule.dateLabel} accent />
                <ScheduleTile icon={Clock} label="Heure" value={schedule.timeLabel} accent highlight />
              </div>
            </div>

            <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
              <RecapField label="Véhicule" value={`${cat.label} · ${cat.hourlyUsd} $/h`} onEdit={() => go('vehicle')} icon={Car} />
            </div>

            <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
              <RecapField label="Client" value={draft.name} onEdit={() => go('contact')} icon={User} />
              <div className="mt-3 border-t border-black/5 pt-3">
                <RecapField label="Téléphone" value={normalizePhone(draft.phone)} onEdit={() => go('contact')} icon={Phone} />
              </div>
            </div>
          </div>
          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <button type="button" disabled={busy} className="btn-primary mt-5 w-full text-base tracking-wide" onClick={() => void confirm()}>
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

function ScheduleTile({
  icon: Icon,
  label,
  value,
  accent = false,
  highlight = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-3 ${accent ? 'border border-taxi/25 bg-white shadow-sm' : 'border border-black/8 bg-[#faf8f5]'}`}
    >
      <Icon className="mb-1.5 h-5 w-5 text-brand" aria-hidden />
      <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">{label}</span>
      <span className={`mt-0.5 block leading-snug ${highlight ? 'text-xl font-bold tabular-nums text-navy' : 'text-sm font-bold text-ink'}`}>
        {value}
      </span>
    </div>
  );
}

function ScheduleBanner({
  schedule,
  className = '',
}: {
  schedule: ReturnType<typeof formatPickupRecapParts>;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border border-taxi/25 bg-taxi/10 px-3 py-2.5 text-sm ${className}`}>
      <CalendarDays className="h-4 w-4 shrink-0 text-brand" aria-hidden />
      <span className="min-w-0 truncate font-medium text-navy">{schedule.dateLabel}</span>
      <span className="text-muted" aria-hidden>
        ·
      </span>
      <Clock className="h-4 w-4 shrink-0 text-brand" aria-hidden />
      <span className="min-w-0 truncate font-semibold tabular-nums text-navy">{schedule.timeLabel}</span>
    </div>
  );
}

function RecapField({
  label,
  value,
  onEdit,
  icon: Icon,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  icon?: typeof User;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
          {label}
        </span>
        <span className="mt-1 block text-base font-semibold leading-snug text-ink">{value}</span>
      </div>
      <button type="button" className="shrink-0 text-xs font-semibold text-brand underline-offset-2 hover:underline" onClick={onEdit}>
        Modifier
      </button>
    </div>
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
