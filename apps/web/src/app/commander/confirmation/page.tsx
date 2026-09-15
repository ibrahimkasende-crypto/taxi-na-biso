'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { SiteFooter, SiteHeader } from '@/components/SiteChrome';

function Inner() {
  const params = useSearchParams();
  const trip = params.get('trip');
  if (!trip) {
    return <p className="text-muted">Aucune course confirmée. Vérifiez votre connexion puis réessayez.</p>;
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">Course demandée</h1>
      <p className="mt-2 text-muted">Votre demande a été enregistrée. Suivez-la dans l’espace client.</p>
      <Link
        href={`/client/course/${trip}`}
        className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-brand px-5 font-semibold text-white"
      >
        Suivre la course
      </Link>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-lg px-4 py-12">
        <Suspense>
          <Inner />
        </Suspense>
      </div>
      <SiteFooter />
    </>
  );
}
