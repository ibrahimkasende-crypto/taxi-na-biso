'use client';

import { MapPin, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { rememberPlace, searchKinshasaPlaces, type KinshasaPlace } from '@/config/places';
import { placeFromKinshasa, type RidePlace } from '@/lib/ride-request';

export function PlaceSearch({
  label,
  placeholder,
  value,
  onChange,
  onUseGps,
  gpsBusy,
}: {
  label: string;
  placeholder: string;
  value: RidePlace | null;
  onChange: (place: RidePlace | null) => void;
  onUseGps?: () => void;
  gpsBusy?: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState(value?.label ?? '');
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value?.label ?? '');
  }, [value?.label]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const results = useMemo(() => searchKinshasaPlaces(query), [query]);

  function pick(place: KinshasaPlace) {
    rememberPlace(place);
    onChange(placeFromKinshasa(place));
    setQuery(place.label);
    setOpen(false);
  }

  return (
    <div ref={wrap} className="relative">
      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted" htmlFor={id}>
        {label}
      </label>
      <div className="mt-1 flex gap-2">
        <span className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
          <input
            id={id}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (value) onChange(null);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            className="min-h-12 w-full rounded-xl border border-black/10 bg-[#f7f5f2] px-10 text-ink outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/20"
          />
        </span>
        {onUseGps ? (
          <button
            type="button"
            onClick={onUseGps}
            disabled={gpsBusy}
            className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-xl border border-black/10 px-3 text-sm font-medium text-ink hover:bg-white disabled:opacity-60"
          >
            <MapPin className="h-4 w-4 text-brand" />
            {gpsBusy ? '…' : 'Ma position'}
          </button>
        ) : null}
      </div>
      {open ? (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-black/10 bg-white py-1 shadow-lg">
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">Aucun lieu. Continuez à taper.</li>
          ) : (
            results.map((p) => (
              <li key={p.place_id}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-orange-50"
                  onClick={() => pick(p)}
                >
                  <span className="text-sm font-medium text-ink">{p.label}</span>
                  <span className="text-xs text-muted">{p.address}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
