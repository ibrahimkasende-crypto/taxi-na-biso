import { PageHero } from '@/components/PageHero';
import { brand } from '@/config/brand';
import { photos } from '@/config/media';

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="À propos"
        intro={`${brand.appName} est une plateforme de mobilité pour ${brand.defaultCity}.`}
        src={photos.kinshasaSkyline.src}
        alt={photos.kinshasaSkyline.alt}
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14">
        <section>
          <h2 className="text-2xl font-bold">Vision</h2>
          <p className="mt-3 text-muted">
            Rendre les déplacements à Kinshasa plus simples, plus lisibles et plus sûrs, avec une technologie que l’on peut héberger et contrôler localement.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Mission</h2>
          <p className="mt-3 text-muted">
            {brand.tagline}. Le site web, l’application passager et l’application chauffeur partagent le même backend, les mêmes comptes et les mêmes courses.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Valeurs</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
            <li>Confiance et vérification des chauffeurs</li>
            <li>Proximité congolaise : français, CDF, assistance locale</li>
            <li>Transparence : ne pas afficher comme actives des fonctions encore absentes</li>
          </ul>
        </section>
        <p className="text-sm text-muted">Les noms des dirigeants ne sont pas publiés ici.</p>
      </div>
    </>
  );
}
