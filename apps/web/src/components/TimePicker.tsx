'use client';

import { Clock } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { FloatingPopover } from '@/components/ui/FloatingPopover';
import { isTimePastOnDate, suggestTimes } from '@/lib/ride-request';

const HOURS = Array.from({ length: 18 }, (_, i) => String(i + 5).padStart(2, '0'));
const MINS = ['00', '15', '30', '45'];

export function TimePicker({
  date,
  value,
  onChange,
}: {
  date: string;
  value: string;
  onChange: (hhmm: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const suggestions = useMemo(() => suggestTimes(date).filter((t) => t.includes(':') && !isTimePastOnDate(date, t)), [date]);

  const [hh, mm] = (value || '08:00').split(':');
  const hour = hh ?? '08';
  const minute = mm ?? '00';

  function pick(time: string) {
    if (isTimePastOnDate(date, time)) return;
    onChange(time);
    setOpen(false);
  }

  const panel = (
    <div>
      {suggestions.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((t) => (
            <button key={t} type="button" onClick={() => pick(t)} className={`min-h-9 rounded-xl border px-3 text-sm font-medium ${value === t ? 'border-taxi bg-taxi/30 text-navy' : 'border-black/10 bg-white'}`}>
              {t}
            </button>
          ))}
        </div>
      ) : null}
      <div className="grid max-h-52 grid-cols-2 gap-2 overflow-hidden">
        <ul className="max-h-52 overflow-auto rounded-xl bg-black/[0.03] p-1">
          {HOURS.map((h) => {
            const disabled = isTimePastOnDate(date, `${h}:00`) && isTimePastOnDate(date, `${h}:45`);
            return (
              <li key={h}>
                <button type="button" disabled={disabled} className={`min-h-9 w-full rounded-lg text-sm ${hour === h ? 'bg-taxi font-semibold text-navy' : 'hover:bg-white'} disabled:opacity-30`} onClick={() => pick(`${h}:${MINS.includes(minute) ? minute : '00'}`)}>
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
                <button type="button" disabled={disabled} className={`min-h-9 w-full rounded-lg text-sm ${minute === m ? 'bg-taxi font-semibold text-navy' : 'hover:bg-white'} disabled:opacity-30`} onClick={() => pick(time)}>
                  {m}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Clock className="h-5 w-5 text-brand" aria-hidden />
        <span>
          <span className="block text-xs text-muted">Choisir une heure</span>
          <span className="block font-semibold">{value || '—'}</span>
        </span>
      </button>
      <FloatingPopover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} title="À quelle heure ?" width={300} ariaLabel="Choisir une heure">
        {panel}
      </FloatingPopover>
    </div>
  );
}
