'use client';

import { useState } from 'react';

import { getSupabaseBrowser } from '@/lib/supabase-browser';

export function VehicleForm({ driverId }: { driverId: string }) {
  const [rego, setRego] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [color, setColor] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(false);
    const yearNum = Number(year);
    try {
      const { error: err } = await getSupabaseBrowser().from('vehicles').insert({
        rego: rego.trim().toUpperCase(),
        make: make.trim(),
        model: model.trim(),
        year: yearNum,
        color: color.trim() || null,
        vehicle_type: 'sedan',
        seat_capacity: 4,
        fuel_type: 'petrol',
        status: 'pending',
        default_driver_id: driverId,
      });
      if (err) throw err;
      setOk(true);
      setRego('');
      setMake('');
      setModel('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-3 rounded-2xl bg-white p-4 shadow-card">
      <h2 className="font-semibold">Enregistrer un véhicule</h2>
      <p className="text-xs text-muted">Le statut restera « en attente » jusqu’à validation opérateur.</p>
      <input className="min-h-11 w-full rounded-xl border px-3" placeholder="Immatriculation" required value={rego} onChange={(e) => setRego(e.target.value)} />
      <input className="min-h-11 w-full rounded-xl border px-3" placeholder="Marque" required value={make} onChange={(e) => setMake(e.target.value)} />
      <input className="min-h-11 w-full rounded-xl border px-3" placeholder="Modèle" required value={model} onChange={(e) => setModel(e.target.value)} />
      <input className="min-h-11 w-full rounded-xl border px-3" placeholder="Année" required value={year} onChange={(e) => setYear(e.target.value)} />
      <input className="min-h-11 w-full rounded-xl border px-3" placeholder="Couleur" value={color} onChange={(e) => setColor(e.target.value)} />
      <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-brand font-semibold text-white disabled:opacity-50">
        Enregistrer
      </button>
      {ok ? <p className="text-sm text-success">Véhicule enregistré (en attente).</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </form>
  );
}
