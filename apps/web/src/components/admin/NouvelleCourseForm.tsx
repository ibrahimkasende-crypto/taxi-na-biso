'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { PlaceSearch } from '@/components/PlaceSearch';
import { fleetCategories, type FleetCategoryId } from '@/config/fleet';
import { bookingDb } from '@/lib/booking-db';
import { showAdminToast } from '@/components/admin/AdminShell';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { todayISODate, nowHHMM, type RidePlace } from '@/lib/ride-request';

export function NouvelleCourseForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+243');
  const [pickup, setPickup] = useState<RidePlace | null>(null);
  const [dropoff, setDropoff] = useState<RidePlace | null>(null);
  const [date, setDate] = useState(todayISODate());
  const [time, setTime] = useState(nowHHMM());
  const [category, setCategory] = useState<FleetCategoryId>('confort');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !pickup || !dropoff) {
      setError('Complétez client, téléphone, départ et destination.');
      return;
    }
    setBusy(true);
    setError(null);
    const scheduled = new Date(`${date}T${time}:00+01:00`).toISOString();
    const { data, error: err } = await bookingDb(getSupabaseBrowser()).rpc('submit_booking_request', {
      payload: {
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        pickup_label: pickup.label,
        pickup_address: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        pickup_place_id: pickup.place_id,
        dropoff_label: dropoff.label,
        dropoff_address: dropoff.address,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        dropoff_place_id: dropoff.place_id,
        scheduled_for: scheduled,
        is_now: false,
        category,
        notes: note,
      },
    });
    setBusy(false);
    if (err) {
      setError('Impossible d’enregistrer cette course pour le moment.');
      return;
    }
    showAdminToast('Demande enregistrée');
    const row = data as { id?: string } | null;
    router.push(row?.id ? `/admin/demandes/${row.id}` : '/admin/demandes');
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-card">
      <h1 className="text-2xl font-bold">Nouvelle course</h1>
      <p className="text-sm text-muted">Commande reçue par téléphone ou WhatsApp.</p>
      <label className="block text-sm font-medium">
        Client
        <input className="mt-1 min-h-11 w-full rounded-xl border px-3" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm font-medium">
        Téléphone
        <input className="mt-1 min-h-11 w-full rounded-xl border px-3" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <PlaceSearch label="Départ" placeholder="unik, gombe…" value={pickup} onChange={setPickup} />
      <PlaceSearch label="Destination" placeholder="aéroport, victoire…" value={dropoff} onChange={setDropoff} />
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-medium">
          Date
          <input type="date" className="mt-1 min-h-11 w-full rounded-xl border px-3" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="text-sm font-medium">
          Heure
          <input type="time" className="mt-1 min-h-11 w-full rounded-xl border px-3" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {fleetCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`shrink-0 rounded-xl border px-3 py-2 text-sm ${category === c.id ? 'border-taxi bg-taxi/20' : ''}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <label className="block text-sm font-medium">
        Commentaire
        <textarea className="mt-1 w-full rounded-xl border px-3 py-2" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={busy} className="min-h-11 w-full rounded-xl bg-taxi font-semibold text-navy disabled:opacity-60">
        {busy ? 'Enregistrement…' : 'Enregistrer la demande'}
      </button>
    </form>
  );
}
