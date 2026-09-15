import Link from 'next/link';
import { Suspense } from 'react';

import { AuthForm } from '@/components/AuthForm';
import { AuthSplit } from '@/components/AuthSplit';

export default function InscriptionPage() {
  return (
    <AuthSplit
      title="Créer un compte"
      subtitle="Espace passager — un compte pour commander, suivre et retrouver vos reçus."
    >
      <Suspense>
        <AuthForm mode="signup" intendedRole="rider" />
      </Suspense>
      <p className="mt-4 text-center text-sm text-muted">
        Déjà inscrit ? <Link href="/connexion" className="text-brand">Connexion</Link>
      </p>
    </AuthSplit>
  );
}
