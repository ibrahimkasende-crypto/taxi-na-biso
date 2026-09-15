'use client';

import { Clock, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
  const [mobile, setMobile] = useState(false);
  const suggestions = useMemo(() => suggestTimes(date).filter((t) => t.includes(':') && !isTimePastOnDate(date, t)), [date]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

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
      <div className="grid max-h-56 grid-cols-2 gap-3 overflow-hidden">
        <ul className="max-h-56 overflow-auto rounded-2xl bg-black/[0.03] p-1">
          {HOURS.map((h) => {
            const sample = `${h}:00`;
            const disabled = isTimePastOnDate(date, sample) && isTimePastOnDate(date, `${h}:45`);
            return (
              <li key={h}>
                <button
                  type="button"
                  disabled={disabled}
                  className={`min-h-10 w-full rounded-xl text-sm ${hour === h ? 'bg-taxi font-semibold text-navy' : 'hover:bg-white'} disabled:opacity-30`}
                  onClick={() => pick(`${h}:${MINS.includes(minute) ? minute : '00'}`)}
                >
                  {h} h
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="max-h-56 overflow-auto rounded-2xl bg-black/[0.03] p-1">
          {MINS.map((m) => {
            const time = `${hour}:${m}`;
            const disabled = isTimePastOnDate(date, time);
            return (
              <li key={m}>
                <button
                  type="button"
                  disabled={disabled}
                  className={`min-h-10 w-full rounded-xl text-sm ${minute === m ? 'bg-taxi font-semibold text-navy' : 'hover:bg-white'} disabled:opacity-30`}
                  onClick={() => pick(time)}
                >
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
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => pick(t)}
              className={`min-h-11 rounded-2xl border px-4 text-sm font-medium ${value === t ? 'border-taxi bg-taxi/30 text-navy' : 'border-black/10 bg-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 text-left"
      >
        <Clock className="h-5 w-5 text-brand" aria-hidden />
        <span>
          <span className="block text-xs text-muted">Choisir une heure</span>
          <span className="block font-semibold">{value || '—'}</span>
        </span>
      </button>
      {open ? (
        mobile ? (
          <div className="fixed inset-0 z-[90] flex items-end bg-navy/50" role="dialog" aria-modal aria-label="À quelle heure ?">
            <button type="button" className="absolute inset-0" aria-label="Fermer" onClick={() => setOpen(false)} />
            <div className="tnb-glass relative w-full rounded-t-3xl p-5 pb-8">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-lg font-semibold">À quelle heure ?</p>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5" onClick={() => setOpen(false)} aria-label="Fermer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {panel}
            </div>
          </div>
        ) : (
          <div className="tnb-glass rounded-3xl p-4">{panel}</div>
        )
      ) : null}
    </div>
  );
}
