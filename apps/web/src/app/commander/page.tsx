import { Suspense } from 'react';

import { BookingWorkspace } from '@/components/BookingWorkspace';
import { PageHero } from '@/components/PageHero';
import { photos } from '@/config/media';

export default function CommanderPage() {
  return (
    <>
      <PageHero
        title="Commander"
        intro="Carte à Kinshasa, départ, destination, estimation, puis confirmation une fois connecté."
        src={photos.kinshasaBoulevard.src}
        alt={photos.kinshasaBoulevard.alt}
      />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <Suspense fallback={<p className="text-sm text-muted">Chargement de la commande…</p>}>
          <BookingWorkspace />
        </Suspense>
      </div>
    </>
  );
}
