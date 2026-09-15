import Link from 'next/link';
import { Suspense } from 'react';

import { AuthForm } from '@/components/AuthForm';
import { AuthSplit } from '@/components/AuthSplit';

export default function DriverSignupPage() {
  return (
    <AuthSplit
      variant="driver"
      title="Devenir chauffeur"
      subtitle="Créez votre compte, déposez vos documents, puis attendez la validation."
    >
      <Suspense>
        <AuthForm mode="signup" intendedRole="driver" />
      </Suspense>
      <p className="mt-4 text-center text-sm text-white/70">
        Déjà inscrit ? <Link href="/chauffeur/connexion" className="text-brand">Connexion</Link>
      </p>
    </AuthSplit>
  );
}
