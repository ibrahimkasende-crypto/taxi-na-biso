import { formatFareCdf } from '@openride/ui';

import { getSupabaseServer } from '@/lib/supabase-server';
import { requireRider } from '@/lib/session';
import { Soon } from '@/components/SiteChrome';

export default async function PaiementsPage() {
  const profile = await requireRider();
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('payments')
    .select('id, amount_cents, status, created_at')
    .eq('rider_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(30);

  return (
    <div>
      <h1 className="text-2xl font-bold">Paiements</h1>
      <p className="mt-2 text-sm text-muted">
        Cash et Mobile Money <Soon>Bientôt disponible</Soon>
      </p>
      <ul className="mt-4 space-y-3">
        {(data ?? []).map((p) => (
          <li key={p.id} className="rounded-2xl bg-white p-4 shadow-card">
            {formatFareCdf(p.amount_cents)} · {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
