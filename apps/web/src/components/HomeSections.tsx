import Link from 'next/link';
import { Bike, Car, MapPinned, ShieldCheck, Smartphone } from 'lucide-react';

import { Photo } from '@/components/Photo';
import { Reveal } from '@/components/Reveal';
import { Soon } from '@/components/SiteChrome';
import { brand, vehicleCategories } from '@/config/brand';
import { photos } from '@/config/media';

const steps = [
  { n: '01', t: 'Indiquez votre destination', d: 'Départ et arrivée à Kinshasa, en quelques secondes.' },
  { n: '02', t: 'Choisissez votre course', d: 'Économie, Confort ou Moto — tarif affiché en francs congolais.' },
  { n: '03', t: 'Un chauffeur vient vous chercher', d: 'Suivi en temps réel dès qu’une course est acceptée.' },
];

const rideCards = [
  {
    id: 'economy' as const,
    icon: Car,
    capacity: 'Jusqu’à 4 passagers',
    photo: photos.sedanNight,
    cta: 'Choisir Économie',
  },
  {
    id: 'comfort' as const,
    icon: Car,
    capacity: 'Jusqu’à 4 passagers',
    photo: photos.sedanInterior,
    cta: 'Choisir Confort',
  },
  {
    id: 'moto' as const,
    icon: Bike,
    capacity: '1 passager',
    photo: photos.cityTraffic,
    cta: 'Choisir Moto',
  },
];

const safety = [
  { icon: ShieldCheck, t: 'Chauffeurs vérifiés', d: 'Validation opérateur et documents contrôlés avant les courses.' },
  { icon: Car, t: 'Course identifiée', d: 'Profil chauffeur et véhicule affichés une fois la course acceptée.' },
  { icon: MapPinned, t: 'Suivi en temps réel', d: 'Statut et carte disponibles pendant la course sur le web.' },
  { icon: Smartphone, t: 'Assistance locale', d: 'Support Taxi Na Biso à Kinshasa, depuis l’espace client ou chauffeur.' },
];

const faqs = [
  { q: 'Comment commander ?', a: 'Renseignez départ et destination, estimez, puis connectez-vous pour confirmer.' },
  { q: 'Quels moyens de paiement ?', a: 'Le backend actuel gère une carte via Stripe lorsqu’il est configuré. Le cash et le Mobile Money arriveront plus tard.' },
  { q: 'Puis-je devenir chauffeur ?', a: 'Oui. Créez un compte chauffeur, déposez vos documents, puis attendez la validation opérateur.' },
  { q: 'Le GPS web fonctionne-t-il écran éteint ?', a: 'Non. Utilisez l’application chauffeur pour un suivi en arrière-plan.' },
];

export function HomeSections() {
  return (
    <div className="tnb-universe">
      <div aria-hidden className="tnb-orb tnb-orb-a" />
      <div aria-hidden className="tnb-orb tnb-orb-b" />
      <div aria-hidden className="tnb-orb tnb-orb-c" />

      <section className="tnb-band py-20 sm:py-24">
        <div className="tnb-shell">
          <Reveal>
            <p className="text-sm font-medium text-brand">Le trajet</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Comment ça marche</h2>
          </Reveal>
          <ol className="relative mt-12 grid gap-5 md:grid-cols-3">
            <span
              aria-hidden
              className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-brand/35 to-transparent md:block"
            />
            {steps.map((s, i) => (
              <Reveal key={s.n} delayMs={i * 90} scale>
                <li className="tnb-lift relative rounded-3xl bg-white/90 p-7 shadow-card backdrop-blur-sm">
                  <span className="text-sm font-bold tracking-[0.18em] text-brand">{s.n}</span>
                  <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="tnb-band py-20 sm:py-24">
        <div className="tnb-shell">
          <Reveal>
            <p className="text-sm font-medium text-brand">Les courses</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Choisissez votre allure</h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">
              Trois catégories réellement proposées sur Taxi Na Biso.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {rideCards.map((card, i) => {
              const cat = vehicleCategories.find((c) => c.id === card.id);
              if (!cat) return null;
              return (
                <Reveal key={card.id} delayMs={i * 80} scale>
                  <article className="tnb-lift overflow-hidden rounded-3xl bg-white shadow-card">
                    <div className="relative aspect-[16/10]">
                      <Photo src={card.photo.src} alt={card.photo.alt} sizes="(max-width: 1024px) 100vw, 33vw" />
                    </div>
                    <div className="p-6">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-brand">
                        <card.icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-2xl font-semibold">{cat.label}</h3>
                      <p className="mt-2 text-sm text-muted">{cat.description}</p>
                      <p className="mt-3 text-sm font-medium text-ink">{card.capacity}</p>
                      <Link href="/commander" className="btn-primary mt-6 w-full">
                        {card.cta}
                      </Link>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="tnb-band py-20 sm:py-24">
        <div className="tnb-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal scale>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Photo src={photos.driverPhone.src} alt={photos.driverPhone.alt} sizes="(max-width: 1024px) 100vw, 50vw" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/35 to-transparent" />
            </div>
          </Reveal>
          <Reveal delayMs={80}>
            <p className="text-sm font-medium text-brand">Espace chauffeur</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Conduisez avec Taxi Na Biso
            </h2>
            <ol className="mt-8 space-y-4 text-base text-muted">
              <li><span className="font-semibold text-ink">1. Inscription</span> — créez votre compte chauffeur.</li>
              <li><span className="font-semibold text-ink">2. Validation</span> — documents et véhicule contrôlés par l’opérateur.</li>
              <li><span className="font-semibold text-ink">3. Disponibilité</span> — passez en ligne quand vous êtes prêt.</li>
              <li><span className="font-semibold text-ink">4. Courses</span> — recevez et acceptez les demandes.</li>
              <li><span className="font-semibold text-ink">5. Revenus</span> — suivez vos courses et commissions.</li>
            </ol>
            <Link href="/chauffeurs" className="btn-primary tnb-lift mt-10">
              Devenir chauffeur
            </Link>
          </Reveal>
        </div>
      </section>

      <div aria-hidden className="tnb-bridge tnb-bridge-to-ink" />
      <section className="relative bg-ink py-20 text-white sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-brand/20 blur-3xl"
        />
        <div className="tnb-shell relative">
          <Reveal>
            <p className="text-sm font-medium text-brand">Confiance</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Sécurité</h2>
            <p className="mt-3 max-w-2xl text-lg text-white/70">
              Uniquement les mécanismes déjà en place dans Taxi Na Biso.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {safety.map((item, i) => (
              <Reveal key={item.t} delayMs={i * 70} scale>
                <div className="tnb-lift rounded-3xl border border-white/10 bg-white/5 p-6">
                  <item.icon className="h-5 w-5 text-brand" />
                  <h3 className="mt-4 text-lg font-semibold">{item.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{item.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-sm text-white/50">
            PIN de démarrage, partage de trajet et QR véhicule : <Soon>Bientôt disponible</Soon>
          </p>
        </div>
      </section>
      <div aria-hidden className="tnb-bridge tnb-bridge-ink-canvas" />

      <section className="tnb-band py-20 sm:py-24">
        <div className="tnb-shell">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions fréquentes</h2>
          </Reveal>
          <dl className="mt-10 grid gap-4 lg:grid-cols-2">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delayMs={i * 50}>
                <div className="tnb-lift rounded-2xl bg-white/85 p-6 shadow-card backdrop-blur-sm">
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">{f.a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
          <p className="mt-8 text-xs text-muted">
            Aucun témoignage client n’est affiché : nous n’inventons pas d’avis. {brand.appName} · {brand.defaultCity}.
          </p>
        </div>
      </section>

      <div aria-hidden className="tnb-bridge tnb-bridge-to-brand" />
      <section className="relative overflow-hidden bg-brand py-24 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        />
        <div className="tnb-shell relative">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Prêt à partir ?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Votre prochain trajet commence ici.
            </h2>
          </Reveal>
          <Reveal delayMs={80}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/commander" className="tnb-lift rounded-xl bg-white px-6 py-3 text-center font-semibold text-brand">
                Commander une course
              </Link>
              <Link href="/chauffeurs" className="tnb-lift rounded-xl border border-white/40 px-6 py-3 text-center font-semibold">
                Devenir chauffeur
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
