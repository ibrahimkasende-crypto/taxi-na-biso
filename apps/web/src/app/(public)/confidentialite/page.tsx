import { PageHero } from '@/components/PageHero';
import { photos } from '@/config/media';

export default function ConfidentialitePage() {
  return (
    <>
      <PageHero title="Politique de confidentialité" intro="Données collectées pour traiter vos demandes de course." src={photos.kinshasaGombe.src} alt={photos.kinshasaGombe.alt} />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 text-sm leading-relaxed text-muted">
        <p>Nous collectons le nom, le téléphone, les lieux de départ et de destination, ainsi que l’horaire souhaité afin de traiter votre demande.</p>
        <p>Ces informations sont utilisées par l’équipe Taxi Na Biso et ne sont pas vendues à des tiers.</p>
      </div>
    </>
  );
}
