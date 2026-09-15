import Link from 'next/link';

import { getSupabaseServer } from '@/lib/supabase-server';
import { bookingDb } from '@/lib/booking-db';

export default async function ClientFiche({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = bookingDb(await getSupabaseServer());
  const { data: user } = await supabase.from('users').select('display_name, phone, email, created_at').eq('id', id).maybeSingle();
  const { data: reqs } = await supabase
    .from('booking_requests')
    .select('id, reference, pickup_label, dropoff_label, status, scheduled_for')
    .eq('rider_id', id)
    .order('created_at', { ascending: false })
    .limit(10);
  const u = user as { display_name?: string | null; phone?: string | null; email?: string | null } | null;

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/admin/clients" className="text-sm text-muted">← Clients</Link>
      <h1 className="text-2xl font-bold">{u?.display_name || 'Client'}</h1>
      <div className="rounded-2xl bg-white p-5 shadow-card text-sm">
        <p>{u?.phone}</p>
        <p>{u?.email}</p>
      </div>
      <ul className="space-y-2">
        {((reqs as { id: string; reference: string; pickup_label: string; dropoff_label: string; status: string }[]) ?? []).map((r) => (
          <li key={r.id} className="rounded-xl bg-white p-3 shadow-card">
            <Link href={`/admin/demandes/${r.id}`} className="font-semibold">{r.reference}</Link>
            <p className="text-sm text-muted">{r.pickup_label} → {r.dropoff_label} · {r.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
