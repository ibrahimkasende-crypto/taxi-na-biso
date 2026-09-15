'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { fleetCategories, type FleetCategoryId } from '@/config/fleet';
import { bookingDb } from '@/lib/booking-db';
import { showAdminToast } from '@/components/admin/AdminShell';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function NouveauVehiculePage() {
  const router = useRouter();
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [rego, setRego] = useState('DEMO-TNB-');
  const [color, setColor] = useState('Blanc');
  const [category, setCategory] = useState<FleetCategoryId>('confort');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cat = fleetCategories.find((c) => c.id === category);
    const { data, error: err } = await bookingDb(getSupabaseBrowser()).from('vehicles').insert({
      make,
      model,
      rego,
      color,
      year: 2015,
      vehicle_type: cat?.vehicleType ?? 'sedan',
      fleet_category: category,
      status: 'active',
      seat_capacity: 4,
      operator_id: '00000000-0000-0000-0000-000000000001',
    }).select('id').maybeSingle();
    if (err) {
      setError('Impossible d’ajouter ce véhicule.');
      return;
    }
    showAdminToast('Véhicule ajouté');
    const row = data as { id?: string } | null;
    router.push(row?.id ? `/admin/vehicules/${row.id}` : '/admin/vehicules');
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-3 rounded-2xl bg-white p-6 shadow-card">
      <h1 className="text-2xl font-bold">Ajouter un véhicule</h1>
      <input className="min-h-11 w-full rounded-xl border px-3" placeholder="Marque" value={make} onChange={(e) => setMake(e.target.value)} />
      <input className="min-h-11 w-full rounded-xl border px-3" placeholder="Modèle" value={model} onChange={(e) => setModel(e.target.value)} required />
      <input className="min-h-11 w-full rounded-xl border px-3" placeholder="Plaque" value={rego} onChange={(e) => setRego(e.target.value)} required />
      <input className="min-h-11 w-full rounded-xl border px-3" placeholder="Couleur" value={color} onChange={(e) => setColor(e.target.value)} />
      <select className="min-h-11 w-full rounded-xl border px-3" value={category} onChange={(e) => setCategory(e.target.value as FleetCategoryId)}>
        {fleetCategories.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" className="min-h-11 rounded-xl bg-taxi px-4 font-semibold text-navy">Enregistrer</button>
    </form>
  );
}
