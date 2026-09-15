import Link from 'next/link';
import { Suspense } from 'react';

import { AuthForm } from '@/components/AuthForm';
import { AuthSplit } from '@/components/AuthSplit';

export default function ConnexionPage() {
  return (
    <AuthSplit
      title="Connexion"
      subtitle="Espace passager — commandez et suivez vos courses en quelques instants."
    >
      <Suspense>
        <AuthForm mode="signin" intendedRole="rider" />
      </Suspense>
      <p className="mt-4 text-center text-sm text-muted">
        Pas de compte ? <Link href="/inscription" className="text-brand">Inscription</Link>
        {' · '}
        <Link href="/chauffeur/connexion" className="text-brand">Espace chauffeur</Link>
      </p>
    </AuthSplit>
  );
}
