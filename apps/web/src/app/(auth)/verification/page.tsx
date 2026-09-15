import Link from 'next/link';

import { SiteHeader } from '@/components/SiteChrome';

export default function VerificationPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-28 text-center">
        <h1 className="text-2xl font-semibold">Vérification</h1>
        <p className="mt-3 text-muted">
          L’OTP SMS n’est pas activé sur ce site de démonstration. Utilisez l’e-mail et le mot de passe. Si votre
          projet Supabase exige une confirmation e-mail, consultez votre boîte de réception.
        </p>
        <Link href="/connexion" className="mt-6 inline-flex text-brand">
          Retour à la connexion
        </Link>
      </div>
    </>
  );
}
