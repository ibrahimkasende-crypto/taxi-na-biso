'use client';

import { Clock } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { FloatingPopover } from '@/components/ui/FloatingPopover';
import { halfHourSlots, isTimePastOnDate, suggestTimes } from '@/lib/ride-request';

const HOURS = Array.from({ length: 18 }, (_, i) => String(i + 5).padStart(2, '0'));
const MINS = ['00', '15', '30', '45'];

export function TimePicker({
  date,
  value,
  onChange,
  inline = false,
}: {
  date: string;
  value: string;
  onChange: (hhmm: string) => void;
  /** Affiche les créneaux directement sous le champ (sans ouvrir le popover). */
  inline?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const quickSlots = useMemo(() => suggestTimes(date), [date]);
  const allSlots = useMemo(() => halfHourSlots(date), [date]);

  const [hh, mm] = (value || '08:00').split(':');
  const hour = hh ?? '08';
  const minute = mm ?? '00';

  function pick(time: string) {
    if (isTimePastOnDate(date, time)) return;
    onChange(time);
    setOpen(false);
    setAdvanced(false);
  }

  const quickPanel = (
    <div>
      <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto">
        {(quickSlots.length > 0 ? quickSlots : allSlots.slice(0, 8)).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => pick(t)}
            className={`min-h-11 min-w-[4.5rem] rounded-xl border px-3 text-sm font-medium ${
              value === t ? 'border-taxi bg-taxi/30 text-navy' : 'border-black/10 bg-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {!advanced ? (
        <button
          type="button"
          className="mt-3 w-full min-h-11 text-sm font-medium text-brand"
          onClick={() => setAdvanced(true)}
        >
          Choisir une autre heure
        </button>
      ) : (
        <div className="mt-3 grid max-h-52 grid-cols-2 gap-2 overflow-hidden">
          <ul className="max-h-52 overflow-auto rounded-xl bg-black/[0.03] p-1">
            {HOURS.map((h) => {
              const disabled = isTimePastOnDate(date, `${h}:00`) && isTimePastOnDate(date, `${h}:45`);
              return (
                <li key={h}>
                  <button
                    type="button"
                    disabled={disabled}
                    className={`min-h-10 w-full rounded-lg text-sm ${hour === h ? 'bg-taxi font-semibold text-navy' : 'hover:bg-white'} disabled:opacity-30`}
                    onClick={() => pick(`${h}:${MINS.includes(minute) ? minute : '00'}`)}
                  >
                    {h} h
                  </button>
                </li>
              );
            })}
          </ul>
          <ul className="max-h-52 overflow-auto rounded-xl bg-black/[0.03] p-1">
            {MINS.map((m) => {
              const time = `${hour}:${m}`;
              const disabled = isTimePastOnDate(date, time);
              return (
                <li key={m}>
                  <button
                    type="button"
                    disabled={disabled}
                    className={`min-h-10 w-full rounded-lg text-sm ${minute === m ? 'bg-taxi font-semibold text-navy' : 'hover:bg-white'} disabled:opacity-30`}
                    onClick={() => pick(time)}
                  >
                    {m}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  const slots = (quickSlots.length > 0 ? quickSlots : allSlots.slice(0, 8)).map((t) => (
    <button
      key={t}
      type="button"
      onClick={() => pick(t)}
      className={`min-h-11 min-w-[4.5rem] rounded-xl border px-3 text-sm font-semibold tabular-nums ${
        value === t ? 'border-taxi bg-taxi text-navy shadow-sm' : 'border-black/10 bg-white hover:border-taxi/50'
      }`}
    >
      {t}
    </button>
  ));

  return (
    <div className="space-y-3">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => {
          setAdvanced(false);
          setOpen(true);
        }}
        className="flex min-h-12 w-full items-center gap-3 rounded-2xl border-2 border-black/10 bg-white px-4 text-left shadow-sm sm:min-h-14"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Clock className="h-5 w-5 shrink-0 text-brand" aria-hidden />
        <span className="min-w-0">
          <span className="block text-xs font-medium text-muted">Heure de prise en charge</span>
          <span className="block text-xl font-bold tabular-nums">{value || '—'}</span>
        </span>
      </button>
      {inline ? (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Créneaux disponibles</p>
          <div className="flex flex-wrap gap-2">{slots}</div>
          <button
            type="button"
            className="mt-3 min-h-11 w-full rounded-xl border border-dashed border-brand/30 text-sm font-medium text-brand"
            onClick={() => {
              setAdvanced(false);
              setOpen(true);
            }}
          >
            Choisir une autre heure
          </button>
        </div>
      ) : null}
      <FloatingPopover
        open={open}
        onClose={() => {
          setOpen(false);
          setAdvanced(false);
        }}
        anchorRef={anchorRef}
        title="Heure de prise en charge"
        width={300}
        ariaLabel="Heure de prise en charge"
      >
        {quickPanel}
      </FloatingPopover>
    </div>
  );
}
