import Link from 'next/link';
import { Suspense } from 'react';

import { AuthForm } from '@/components/AuthForm';
import { AuthSplit } from '@/components/AuthSplit';

export default function DriverLoginPage() {
  return (
    <AuthSplit
      variant="driver"
      title="Connexion chauffeur"
      subtitle="Accédez à votre espace de conduite."
    >
      <Suspense>
        <AuthForm mode="signin" intendedRole="driver" />
      </Suspense>
      <p className="mt-4 text-center text-sm text-white/70">
        Pas de compte ? <Link href="/chauffeur/inscription" className="text-brand">Devenir chauffeur</Link>
      </p>
    </AuthSplit>
  );
}
