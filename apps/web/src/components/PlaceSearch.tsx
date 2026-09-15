'use client';

import { MapPin, Search } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';

import { FloatingPopover } from '@/components/ui/FloatingPopover';
import { rememberPlace, searchKinshasaPlaces, type KinshasaPlace } from '@/config/places';
import { placeFromKinshasa, type RidePlace } from '@/lib/ride-request';

export function PlaceSearch({
  label,
  placeholder,
  value,
  onChange,
  onUseGps,
  gpsBusy,
  chips,
  autoFocus,
  onPicked,
  hideLabel,
}: {
  label: string;
  placeholder: string;
  value: RidePlace | null;
  onChange: (place: RidePlace | null) => void;
  onUseGps?: () => void;
  gpsBusy?: boolean;
  chips?: readonly KinshasaPlace[];
  autoFocus?: boolean;
  onPicked?: (place: RidePlace) => void;
  hideLabel?: boolean;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const anchorRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const query = typed ?? value?.label ?? '';
  const results = useMemo(() => searchKinshasaPlaces(query).slice(0, 6), [query]);
  const showResults = open && (typed !== null || query.length > 0 || !chips);

  function pick(place: KinshasaPlace) {
    rememberPlace(place);
    const next = placeFromKinshasa(place);
    onChange(next);
    setTyped(null);
    setOpen(false);
    onPicked?.(next);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHi((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      const hit = results[hi];
      if (showResults && hit) {
        e.preventDefault();
        pick(hit);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const resultsList = (
    <ul id={listId} role="listbox" className="max-h-72 overflow-auto py-1">
      {results.length === 0 ? (
        <li className="px-3 py-3 text-sm text-muted">Aucun lieu. Continuez à taper.</li>
      ) : (
        results.map((p, i) => (
          <li key={p.place_id} id={`${listId}-${p.place_id}`} role="option" aria-selected={i === hi}>
            <button
              type="button"
              className={`flex min-h-11 w-full items-start gap-3 px-3 py-2 text-left ${i === hi ? 'bg-orange-50' : 'hover:bg-orange-50/70'}`}
              onMouseEnter={() => setHi(i)}
              onClick={() => pick(p)}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
              <span>
                <span className="block text-sm font-medium text-ink">{p.label}</span>
                <span className="block text-xs text-muted">{p.address}</span>
              </span>
            </button>
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div className="relative">
      {hideLabel ? (
        <label className="sr-only" htmlFor={id}>{label}</label>
      ) : (
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted" htmlFor={id}>{label}</label>
      )}
      <div ref={anchorRef} className={hideLabel ? '' : 'mt-1'}>
        <span className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" aria-hidden />
          <input
            id={id}
            role="combobox"
            aria-expanded={showResults}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showResults && results[hi] ? `${listId}-${results[hi]!.place_id}` : undefined}
            value={query}
            onChange={(e) => {
              setTyped(e.target.value);
              setOpen(true);
              setHi(0);
              if (value) onChange(null);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
            placeholder={placeholder}
            autoComplete="off"
            autoFocus={autoFocus}
            className="min-h-14 w-full rounded-2xl border border-black/10 bg-[#f7f5f2] pl-12 pr-4 text-base text-ink outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/20"
          />
        </span>
      </div>
      {chips && chips.length > 0 && !value && !typed ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((p) => (
            <button key={p.place_id} type="button" onClick={() => pick(p)} className="min-h-10 rounded-full border border-black/10 bg-white px-3 text-sm hover:border-brand/40">
              {p.place_id === 'ndjili' ? 'Aéroport N’djili' : p.place_id === 'unikin' ? 'UNIKIN' : p.label}
            </button>
          ))}
        </div>
      ) : null}
      {onUseGps ? (
        <button type="button" onClick={onUseGps} disabled={gpsBusy} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white text-sm font-semibold disabled:opacity-60">
          <MapPin className="h-4 w-4 text-brand" />
          {gpsBusy ? 'Localisation…' : 'Utiliser ma position actuelle'}
        </button>
      ) : null}
      <FloatingPopover
        open={!!showResults}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        width={420}
        mobileMaxWidth={768}
        zIndex={96}
        ariaLabel={label}
        className="p-0"
      >
        {resultsList}
      </FloatingPopover>
    </div>
  );
}
