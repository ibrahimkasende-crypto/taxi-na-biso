'use client';

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { FloatingPopover } from '@/components/ui/FloatingPopover';
import { formatMonthYear, formatWeekdayLong, shiftIsoDate, todayISODate } from '@/lib/ride-request';

const WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { y: y ?? 2026, m: m ?? 1, d: d ?? 1 };
}

function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function mondayOffset(y: number, m: number): number {
  return (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
}

export function DatePicker({
  value,
  onChange,
  min = todayISODate(),
}: {
  value: string;
  onChange: (iso: string) => void;
  min?: string;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const selected = parseIso(value || min);
  const [cursor, setCursor] = useState({ y: selected.y, m: selected.m });

  const cells = useMemo(() => {
    const dim = daysInMonth(cursor.y, cursor.m);
    const pad = mondayOffset(cursor.y, cursor.m);
    const list: Array<{ iso: string; day: number } | null> = [];
    for (let i = 0; i < pad; i += 1) list.push(null);
    for (let d = 1; d <= dim; d += 1) {
      list.push({ iso: toIso(cursor.y, cursor.m, d), day: d });
    }
    return list;
  }, [cursor.y, cursor.m]);

  const today = todayISODate();
  const tomorrow = shiftIsoDate(today, 1);
  const sat = (() => {
    const { y, m, d } = parseIso(today);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return shiftIsoDate(today, (6 - dow + 7) % 7);
  })();

  function pick(iso: string) {
    if (iso < min) return;
    onChange(iso);
    setOpen(false);
  }

  const calendar = (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5" onClick={() => setCursor((c) => (c.m === 1 ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 }))} aria-label="Mois précédent">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold capitalize">{formatMonthYear(cursor.y, cursor.m)}</p>
        <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5" onClick={() => setCursor((c) => (c.m === 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m: c.m + 1 }))} aria-label="Mois suivant">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
        {WEEK.map((w) => (
          <span key={w} className="py-1">{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <span key={`e-${i}`} />;
          const disabled = cell.iso < min;
          const isSel = cell.iso === value;
          const isToday = cell.iso === today;
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={disabled}
              onClick={() => pick(cell.iso)}
              className={`min-h-9 rounded-xl text-sm font-medium ${
                disabled ? 'cursor-not-allowed text-black/20' : isSel ? 'bg-taxi text-navy' : isToday ? 'ring-1 ring-taxi/80 text-navy' : 'hover:bg-taxi/20'
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="rounded-full bg-black/5 px-3 py-1.5 text-sm" onClick={() => pick(today)}>Aujourd’hui</button>
        <button type="button" className="rounded-full bg-black/5 px-3 py-1.5 text-sm" onClick={() => pick(tomorrow)}>Demain</button>
        {sat >= today ? (
          <button type="button" className="rounded-full bg-black/5 px-3 py-1.5 text-sm" onClick={() => pick(sat)}>Samedi</button>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => {
          const cur = parseIso(value || min);
          setCursor({ y: cur.y, m: cur.m });
          setOpen(true);
        }}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 text-left shadow-sm"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CalendarDays className="h-5 w-5 text-brand" aria-hidden />
        <span>
          <span className="block text-xs text-muted">{value === today ? 'Aujourd’hui' : 'Date'}</span>
          <span className="block text-base font-semibold capitalize text-ink">{formatWeekdayLong(value || min)}</span>
        </span>
      </button>
      <FloatingPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        title="Choisissez une date"
        width={340}
        ariaLabel="Choisissez une date"
      >
        {calendar}
      </FloatingPopover>
    </>
  );
}
