'use client';

import type { ReactNode } from 'react';

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-taxi/20 text-[#7A5A00]',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-700',
    requested: 'bg-sky-100 text-sky-800',
    scheduled: 'bg-sky-100 text-sky-800',
    assigned: 'bg-sky-100 text-sky-800',
    driver_en_route: 'bg-taxi/25 text-[#7A5A00]',
    arrived_at_pickup: 'bg-taxi/25 text-[#7A5A00]',
    in_progress: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-gray-200 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    online: 'bg-emerald-100 text-emerald-800',
    offline: 'bg-gray-200 text-gray-600',
    suspended: 'bg-red-100 text-red-700',
    active: 'bg-emerald-100 text-emerald-800',
    paid: 'bg-emerald-100 text-emerald-800',
  };
  const labels: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuvée',
    rejected: 'Refusée',
    requested: 'Recherche chauffeur',
    scheduled: 'Planifiée',
    assigned: 'Chauffeur attribué',
    driver_en_route: 'En route',
    arrived_at_pickup: 'Arrivé',
    in_progress: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
    online: 'En ligne',
    offline: 'Hors ligne',
    suspended: 'Suspendu',
    active: 'Actif',
    paid: 'Payé',
    pending_pay: 'En attente',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {labels[status] ?? status}
    </span>
  );
}

export function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function AdminModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-navy/50 p-4 sm:items-center" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-navy">{title}</h3>
          <button type="button" className="text-sm text-muted" onClick={onClose} aria-label="Fermer">
            Fermer
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Skeleton({ className = 'h-24' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-black/5 ${className}`} />;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-white p-8 text-center text-sm text-muted shadow-card">{children}</p>;
}
