import Link from 'next/link';

import { SiteHeader } from '@/components/SiteChrome';

export default function DriverVerificationPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-28 text-center">
        <h1 className="text-2xl font-semibold">Vérification chauffeur</h1>
        <p className="mt-3 text-muted">
          L’OTP SMS n’est pas activé ici. Après inscription, un opérateur doit valider vos documents avant les courses.
        </p>
        <Link href="/chauffeur/connexion" className="mt-6 inline-flex text-brand">
          Connexion
        </Link>
      </div>
    </>
  );
}
