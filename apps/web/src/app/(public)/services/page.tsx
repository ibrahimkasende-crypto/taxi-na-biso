import Link from 'next/link';
import { Bike, Building2, CalendarClock, Car, Plane } from 'lucide-react';

import { PageHero } from '@/components/PageHero';
import { Photo } from '@/components/Photo';
import { Reveal } from '@/components/Reveal';
import { Soon } from '@/components/SiteChrome';
import { vehicleCategories } from '@/config/brand';
import { photos } from '@/config/media';

export default function ServicesPage() {
  const cards = [
    { title: 'Économie', d: vehicleCategories[0]?.description ?? '', src: photos.cityTraffic.src, alt: photos.cityTraffic.alt, icon: Car },
    { title: 'Confort', d: vehicleCategories[1]?.description ?? '', src: photos.sedanInterior.src, alt: photos.sedanInterior.alt, icon: Car },
    { title: 'Moto', d: vehicleCategories[2]?.description ?? '', src: photos.sedanNight.src, alt: photos.sedanNight.alt, icon: Bike, note: 'Catégorie d’affichage — le moteur tarifaire actuel utilise sedan.' },
    { title: 'Aéroport', d: 'Trajet vers N’djili, photographie réelle de l’aéroport.', src: photos.kinshasaAirport.src, alt: photos.kinshasaAirport.alt, icon: Plane },
    { title: 'Course programmée', d: 'Réservation à l’avance depuis le formulaire de commande.', src: photos.kinshasaBoulevard.src, alt: photos.kinshasaBoulevard.alt, icon: CalendarClock },
    { title: 'Entreprises', d: 'Comptes professionnels.', src: photos.office.src, alt: photos.office.alt, icon: Building2, soon: true },
  ];

  return (
    <>
      <PageHero
        title="Services"
        intro="Des courses claires pour Kinshasa : économie, confort, aéroport et programmation."
        src={photos.sedanNight.src}
        alt={photos.sedanNight.alt}
      />
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={c.title} delayMs={i * 50}>
              <article className="overflow-hidden rounded-3xl bg-white shadow-card">
                <div className="relative h-52">
                  <Photo src={c.src} alt={c.alt} sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
                <div className="p-6">
                  <c.icon className="h-5 w-5 text-brand" />
                  <h2 className="mt-2 text-xl font-semibold">
                    {c.title}
                    {c.soon ? <Soon>Bientôt disponible</Soon> : null}
                  </h2>
                  <p className="mt-2 text-sm text-muted">{c.d}</p>
                  {'note' in c && c.note ? <p className="mt-2 text-xs text-muted">{c.note}</p> : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Link href="/commander" className="btn-primary mt-10">Commander une course</Link>
      </div>
    </>
  );
}
