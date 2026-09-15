import { requireRider } from '@/lib/session';

export default async function ProfilPage() {
  const profile = await requireRider();
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <h1 className="text-2xl font-bold">Profil</h1>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="text-muted">Nom</dt>
          <dd>{profile.display_name ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted">E-mail</dt>
          <dd>{profile.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted">Téléphone</dt>
          <dd>{profile.phone ?? '—'}</dd>
        </div>
      </dl>
    </div>
  );
}
