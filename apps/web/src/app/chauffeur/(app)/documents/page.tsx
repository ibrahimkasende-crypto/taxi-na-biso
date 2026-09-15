import { DocumentUpload } from '@/components/DocumentUpload';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireDriver } from '@/lib/session';

export default async function DocumentsPage() {
  const profile = await requireDriver();
  const supabase = await getSupabaseServer();
  const { data: dp } = await supabase.from('driver_profiles').select('status').eq('user_id', profile.id).maybeSingle();
  const { data: docs } = await supabase
    .from('driver_documents')
    .select('doc_type, status, expires_on')
    .eq('driver_id', profile.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Documents</h1>
      <p className="mt-2 text-sm text-muted">Statut dossier : {(dp as { status?: string } | null)?.status ?? 'inconnu'}</p>
      <ul className="mt-4 space-y-2">
        {(docs ?? []).map((d) => (
          <li key={`${d.doc_type}-${d.status}`} className="rounded-xl bg-white p-3 shadow-card text-sm">
            {d.doc_type} · {d.status}
            {d.expires_on ? ` · exp. ${d.expires_on}` : ''}
          </li>
        ))}
      </ul>
      <DocumentUpload driverId={profile.id} />
    </div>
  );
}
