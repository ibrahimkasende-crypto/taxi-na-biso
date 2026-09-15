import Link from 'next/link';

import { DriverStatusControl } from '@/components/admin/DriverStatusControl';
import { StatusPill } from '@/components/admin/AdminUi';
import { getSupabaseServer } from '@/lib/supabase-server';

export default async function ChauffeurFiche({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const [{ data: profile }, { data: user }, { data: docs }, { data: vehicles }, { data: trips }] = await Promise.all([
    supabase.from('driver_profiles').select('*').eq('user_id', id).maybeSingle(),
    supabase.from('users').select('display_name, phone, email').eq('id', id).maybeSingle(),
    supabase.from('driver_documents').select('doc_type, status, expires_on').eq('driver_id', id).order('doc_type'),
    supabase.from('vehicles').select('id, rego, make, model, status').eq('default_driver_id', id),
    supabase
      .from('trips')
      .select('id, status, pickup_address, dropoff_address, requested_at')
      .eq('driver_id', id)
      .order('requested_at', { ascending: false })
      .limit(6),
  ]);

  if (!profile) {
    return (
      <div>
        <Link href="/admin/chauffeurs" className="text-sm text-muted">
          ← Chauffeurs
        </Link>
        <p className="mt-4 text-sm text-red-600">Chauffeur introuvable.</p>
      </div>
    );
  }

  const p = profile as Record<string, unknown>;
  const u = user as { display_name?: string; phone?: string; email?: string } | null;

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/admin/chauffeurs" className="text-sm text-muted">
        ← Chauffeurs
      </Link>
      <div className="flex items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/admin/driver-avatar.png" alt="" className="h-16 w-16 rounded-full object-cover" />
          <div>
            <h1 className="text-2xl font-bold">{u?.display_name ?? 'Chauffeur'}</h1>
            <p className="text-sm text-muted">
              {u?.phone ?? '—'} · {u?.email ?? ''}
            </p>
            <div className="mt-2">
              <StatusPill status={String(p.status)} />
            </div>
          </div>
        </div>
        <DriverStatusControl driverId={id} status={String(p.status)} />
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h2 className="mb-2 font-semibold">Informations</h2>
        <p className="text-sm">Permis {String(p.licence_number ?? '—')}</p>
        <p className="text-sm">Autorité {String(p.authority_number ?? '—')}</p>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h2 className="mb-2 font-semibold">Véhicule</h2>
        {(vehicles ?? []).length === 0 ? (
          <p className="text-sm text-muted">Aucun véhicule attribué.</p>
        ) : (
          (vehicles as { id: string; rego: string; make: string; model: string; status: string }[]).map((v) => (
            <Link key={v.id} href={`/admin/vehicules/${v.id}`} className="block text-sm hover:underline">
              {v.make} {v.model} · {v.rego}
            </Link>
          ))
        )}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h2 className="mb-2 font-semibold">Documents</h2>
        {(docs ?? []).length === 0 ? (
          <p className="text-sm text-muted">Aucun document.</p>
        ) : (
          <ul className="text-sm">
            {(docs as { doc_type: string; status: string; expires_on: string | null }[]).map((d) => (
              <li key={d.doc_type}>
                {d.doc_type} · {d.status} {d.expires_on ? `· ${d.expires_on}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h2 className="mb-2 font-semibold">Courses récentes</h2>
        {(trips ?? []).length === 0 ? (
          <p className="text-sm text-muted">Aucune course récente.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(trips as { id: string; status: string; pickup_address: string; dropoff_address: string }[]).map((t) => (
              <li key={t.id}>
                <Link href={`/admin/courses/${t.id}`} className="font-medium hover:underline">
                  {t.pickup_address} → {t.dropoff_address}
                </Link>
                <span className="ml-2 text-muted">{t.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
