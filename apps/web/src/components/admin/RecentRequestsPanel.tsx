'use client';

import Link from 'next/link';
import { Check, Eye, MoreVertical, X } from 'lucide-react';

import { StatusPill } from '@/components/admin/AdminUi';
import type { BookingRequestRow } from '@/components/admin/DemandesConsole';
import { fleetCategoryById } from '@/config/fleet';
import { compactPlaceLabel, compactReference, compactTrip, formatScheduleShort } from '@/lib/admin-format';

function IconAction({
  label,
  onClick,
  href,
  tone,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  tone: 'approve' | 'reject' | 'neutral';
  children: React.ReactNode;
}) {
  const cls =
    tone === 'approve'
      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
      : tone === 'reject'
        ? 'bg-red-600 text-white hover:bg-red-700'
        : 'border border-black/10 bg-white text-navy hover:bg-black/[0.03]';
  const inner = (
    <span
      className={`grid h-8 w-8 place-items-center rounded-lg text-sm transition ${cls}`}
      title={label}
      aria-label={label}
    >
      {children}
    </span>
  );
  if (href) {
    return (
      <Link href={href} title={label} aria-label={label}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label}>
      {inner}
    </button>
  );
}

function RequestActions({
  row,
  onApprove,
  onReject,
}: {
  row: BookingRequestRow;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (row.status === 'pending') {
    return (
      <div className="flex items-center gap-1">
        <IconAction label="Approuver" tone="approve" onClick={() => onApprove(row.id)}>
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </IconAction>
        <IconAction label="Refuser" tone="reject" onClick={() => onReject(row.id)}>
          <X className="h-4 w-4" strokeWidth={2.5} />
        </IconAction>
        <Link
          href={`/admin/demandes/${row.id}`}
          className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 text-navy hover:bg-black/[0.03]"
          title="Voir la demande"
          aria-label="Voir la demande"
        >
          <MoreVertical className="h-4 w-4" />
        </Link>
      </div>
    );
  }
  return (
    <IconAction label="Voir la demande" tone="neutral" href={`/admin/demandes/${row.id}`}>
      <Eye className="h-4 w-4" />
    </IconAction>
  );
}

function ClientCell({ name, phone }: { name: string; phone?: string | null }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-taxi/25 text-[10px] font-bold text-[#7A5A00]">
        {initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-navy">{name}</span>
        {phone ? <span className="block truncate text-[10px] text-muted">{phone}</span> : null}
      </span>
    </div>
  );
}

export function RecentRequestsPanel({
  rows,
  onApprove,
  onReject,
}: {
  rows: BookingRequestRow[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <>
      {/* Desktop table — no horizontal scroll at 1366+ */}
      <div className="hidden md:block">
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col className="w-[11%]" />
            <col className="w-[14%]" />
            <col className="w-[30%]" />
            <col className="w-[11%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="pb-2 pr-1">Référence</th>
              <th className="pb-2 pr-1">Client</th>
              <th className="pb-2 pr-1">Trajet</th>
              <th className="pb-2 pr-1">Date / Heure</th>
              <th className="pb-2 pr-1">Catégorie</th>
              <th className="pb-2 pr-1">Statut</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const ref = compactReference(r.reference);
              const trip = compactTrip(r.pickup_label, r.dropoff_label);
              const sched = formatScheduleShort(r.scheduled_for);
              return (
                <tr key={r.id} className="border-t border-black/5">
                  <td className="py-2 pr-1 align-middle">
                    <Link
                      href={`/admin/demandes/${r.id}`}
                      className="truncate text-[11px] font-semibold text-navy hover:underline"
                      title={ref.full}
                    >
                      {ref.display}
                    </Link>
                  </td>
                  <td className="py-2 pr-1 align-middle">
                    <ClientCell name={r.customer_name} phone={r.customer_phone} />
                  </td>
                  <td className="py-2 pr-1 align-middle">
                    <p className="truncate text-[11px] leading-snug text-navy" title={trip.full}>
                      {trip.short}
                    </p>
                  </td>
                  <td className="py-2 pr-1 align-middle">
                    <span className="block text-[11px] font-medium text-navy">{sched.line1}</span>
                    <span className="block text-[10px] text-muted">{sched.line2}</span>
                  </td>
                  <td className="py-2 pr-1 align-middle">
                    <span className="inline-flex rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-navy">
                      {fleetCategoryById(r.category).label}
                    </span>
                  </td>
                  <td className="py-2 pr-1 align-middle">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="py-2 align-middle">
                    <RequestActions row={r} onApprove={onApprove} onReject={onReject} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((r) => {
          const ref = compactReference(r.reference);
          const trip = compactTrip(r.pickup_label, r.dropoff_label);
          const sched = formatScheduleShort(r.scheduled_for);
          return (
            <article key={r.id} className="rounded-xl border border-black/6 bg-[#FAFBFC] p-3">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/admin/demandes/${r.id}`} className="text-xs font-semibold text-navy" title={ref.full}>
                  {ref.display}
                </Link>
                <StatusPill status={r.status} />
              </div>
              <p className="mt-1 text-sm font-medium text-navy">{r.customer_name}</p>
              <p className="mt-2 text-xs leading-relaxed text-navy" title={trip.full}>
                📍 {compactPlaceLabel(r.pickup_label)}
                <br />
                ↓ {compactPlaceLabel(r.dropoff_label)}
              </p>
              <p className="mt-2 text-[11px] text-muted">
                📅 {sched.line1} · {sched.line2} · 🚕 {fleetCategoryById(r.category).label}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {r.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white"
                      onClick={() => onApprove(r.id)}
                      aria-label="Approuver"
                      title="Approuver"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="grid h-10 w-10 place-items-center rounded-xl bg-red-600 text-white"
                      onClick={() => onReject(r.id)}
                      aria-label="Refuser"
                      title="Refuser"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : null}
                <Link
                  href={`/admin/demandes/${r.id}`}
                  className="min-h-10 flex-1 rounded-xl border border-black/10 bg-white px-3 text-center text-xs font-semibold leading-10 text-navy"
                >
                  Voir
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

