import { PageHero } from '@/components/PageHero';
import { photos } from '@/config/media';

export default function ConditionsPage() {
  return (
    <>
      <PageHero title="Conditions d’utilisation" intro="Cadre d’utilisation du site et des demandes de course Taxi Na Biso." src={photos.kinshasaBoulevard.src} alt={photos.kinshasaBoulevard.alt} />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 text-sm leading-relaxed text-muted">
        <p>Taxi Na Biso met en relation des clients et des chauffeurs à Kinshasa. Une demande envoyée depuis le site n’est confirmée qu’après validation par l’équipe et/ou envoi du message WhatsApp par le client.</p>
        <p>Les tarifs affichés sont des tarifs de référence à l’heure et à la journée. Ils ne constituent pas un prix de course kilométrique.</p>
      </div>
    </>
  );
}
