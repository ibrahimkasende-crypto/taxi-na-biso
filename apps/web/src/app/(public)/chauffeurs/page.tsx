import Link from 'next/link';

import { PageHero } from '@/components/PageHero';
import { photos } from '@/config/media';

export default function ChauffeursPage() {
  return (
    <>
      <PageHero
        title="Devenir chauffeur"
        intro="Rejoignez le réseau Taxi Na Biso à Kinshasa : inscription, documents, validation, puis courses."
        src={photos.driverPhone.src}
        alt={photos.driverPhone.alt}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Avantages</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Offres en temps réel lorsque vous êtes en ligne</li>
            <li>Historique, revenus et commission visibles</li>
            <li>Application native pour le GPS en arrière-plan</li>
            <li>Flexibilité de vos horaires</li>
          </ul>
          <h2 className="mt-10 text-2xl font-bold">Étapes</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
            <li>Créer un compte chauffeur</li>
            <li>Compléter le profil et le véhicule</li>
            <li>Déposer les documents (permis, photo, autorisation)</li>
            <li>Attendre la validation opérateur</li>
            <li>Passer en ligne et accepter des courses</li>
          </ol>
          <p className="mt-6 text-sm text-muted">
            Un chauffeur non validé ne reçoit pas de courses. La géolocalisation navigateur ne fonctionne que si l’onglet est ouvert.
          </p>
          <Link href="/chauffeur/inscription" className="btn-primary mt-8">Devenir chauffeur</Link>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Documents nécessaires</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>Permis (recto / verso)</li>
            <li>Photo</li>
            <li>Autorisation</li>
            <li>Certificat médical le cas échéant</li>
          </ul>
          <p className="mt-8 text-xs text-muted">Photographie Pexels : scène générale, non présentée comme un chauffeur Taxi Na Biso identifié.</p>
        </div>
      </div>
    </>
  );
}
