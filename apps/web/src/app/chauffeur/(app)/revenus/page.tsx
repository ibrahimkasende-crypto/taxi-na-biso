import { formatFareCdf } from '@openride/ui';

import { getSupabaseServer } from '@/lib/supabase-server';
import { requireDriver } from '@/lib/session';
import { vehicleCategoryById } from '@/config/brand';

export default async function RevenusPage() {
  const profile = await requireDriver();
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('payments')
    .select('amount_cents, application_fee_cents, status')
    .eq('driver_id', profile.id)
    .eq('status', 'captured');

  const rows = data ?? [];
  const gross = rows.reduce((s, r) => s + r.amount_cents, 0);
  const fees = rows.reduce((s, r) => s + (r.application_fee_cents ?? 0), 0);
  const commission = vehicleCategoryById('economy').fare.platformCommissionPct;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Revenus</h1>
      <div className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-sm text-muted">Encaissements capturés</p>
        <p className="text-2xl font-bold">{formatFareCdf(gross)}</p>
        <p className="mt-2 text-sm text-muted">Frais plateforme enregistrés : {formatFareCdf(fees)}</p>
        <p className="mt-1 text-sm text-muted">Commission indicative config : {commission} %</p>
      </div>
    </div>
  );
}
