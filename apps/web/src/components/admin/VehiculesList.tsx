'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { EmptyState, Skeleton, StatusPill } from '@/components/admin/AdminUi';
import { fleetCategoryById } from '@/config/fleet';
import { bookingDb } from '@/lib/booking-db';
import { moneyUsd } from '@/lib/admin-format';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type Vehicle = {
  id: string;
  make: string;
  model: string;
  rego: string;
  status: string;
  color: string | null;
  fleet_category: string | null;
};

export function VehiculesList() {
  const [rows, setRows] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void bookingDb(getSupabaseBrowser())
      .from('vehicles')
      .select('id, make, model, rego, status, color, fleet_category')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRows((data as Vehicle[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-2xl font-bold">Véhicules</h1>
        <Link href="/admin/vehicules/nouveau" className="rounded-xl bg-taxi px-4 py-2 text-sm font-semibold text-navy">
          + Ajouter un véhicule
        </Link>
      </div>
      {rows.length === 0 ? (
        <EmptyState>Aucun véhicule.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((v) => {
            const cat = fleetCategoryById(v.fleet_category);
            return (
              <Link key={v.id} href={`/admin/vehicules/${v.id}`} className="overflow-hidden rounded-2xl bg-white shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/admin/taxi-car.png" alt="" className="h-36 w-full object-cover" />
                <div className="p-4">
                  <p className="text-lg font-semibold">{v.make} {v.model}</p>
                  <p className="text-sm text-muted">{cat.label} · {v.rego}</p>
                  <p className="mt-1 text-sm">{moneyUsd(cat.hourlyUsd)} / h · {moneyUsd(cat.dailyUsd)} / j</p>
                  <div className="mt-2"><StatusPill status={v.status} /></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
