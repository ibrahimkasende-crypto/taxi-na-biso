'use client';

import { BarChart3 } from 'lucide-react';

const STATUS_COLORS = {
  pending: '#F5C518',
  approved: '#10B981',
  running: '#0EA5E9',
  done: '#9CA3AF',
  rejected: '#EF4444',
} as const;

type StatusSlice = { key: keyof typeof STATUS_COLORS; label: string; value: number };

export function StatusDonutChart({ slices, totalLabel = 'Demandes' }: { slices: StatusSlice[]; totalLabel?: string }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-sm text-muted">Aucune donnée de statut.</p>
      </div>
    );
  }

  const arcs = slices.filter((s) => s.value > 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
          {arcs.map((slice) => {
            const len = (slice.value / total) * c;
            const dash = `${len} ${c - len}`;
            const el = (
              <circle
                key={slice.key}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={STATUS_COLORS[slice.key]}
                strokeWidth="10"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-2xl font-bold text-navy">{total}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{totalLabel}</p>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-1.5 text-xs sm:max-w-[11rem]">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[s.key] }} aria-hidden />
              {s.label}
            </span>
            <span className="font-semibold text-navy">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RevenueBarChart({
  bars,
}: {
  bars: { label: string; value: number }[];
}) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  const hasData = bars.some((b) => b.value > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#F7F8FA] px-4 py-8 text-center">
        <BarChart3 className="mb-2 h-8 w-8 text-muted/50" aria-hidden />
        <p className="text-sm font-medium text-navy">Aucun revenu enregistré pour cette période</p>
        <p className="mt-1 max-w-xs text-xs text-muted">
          Les revenus apparaîtront après les premières courses terminées.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-36 items-end gap-1.5 sm:gap-2">
      {bars.map((b) => (
        <div key={b.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-medium text-navy/70">{b.value > 0 ? `${b.value} $` : ''}</span>
          <div
            className="w-full rounded-t-md bg-taxi transition-[height] duration-300"
            style={{ height: `${Math.max(8, (b.value / max) * 100)}%`, minHeight: b.value > 0 ? 8 : 4, opacity: b.value > 0 ? 1 : 0.25 }}
            title={`${b.label} : ${b.value} $`}
          />
          <span className="text-[10px] text-muted">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
