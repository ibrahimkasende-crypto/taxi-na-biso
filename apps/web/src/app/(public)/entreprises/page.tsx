import Link from 'next/link';

import { PageHero } from '@/components/PageHero';
import { Soon } from '@/components/SiteChrome';
import { photos } from '@/config/media';

export default function EntreprisesPage() {
  return (
    <>
      <PageHero
        title="Entreprises"
        intro="Mobilité du personnel, facturation, suivi et rapports — offre en cours de construction."
        src={photos.office.src}
        alt={photos.office.alt}
      />
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {['Transport du personnel', 'Facturation centralisée', 'Suivi des courses', 'Comptes professionnels', 'Rapports'].map((t) => (
            <div key={t} className="rounded-2xl bg-white p-5 shadow-card">
              <h2 className="font-semibold">{t}</h2>
              <p className="mt-1 text-sm text-muted">
                Non branché au backend actuel. <Soon>Bientôt disponible</Soon>
              </p>
            </div>
          ))}
        </div>
        <Link href="/contact" className="btn-primary mt-10">Demander une présentation</Link>
      </div>
    </>
  );
}
