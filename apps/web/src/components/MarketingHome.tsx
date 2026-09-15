'use client';

import { Car, Crown, Gem, Mountain, Users, Sparkles } from 'lucide-react';

import { Photo } from '@/components/Photo';
import { Reveal } from '@/components/Reveal';
import { fleetShowcase, fleetCategoryById, WHATSAPP_DISPLAY, type FleetCategoryId } from '@/config/fleet';
import { officialWhatsAppUrl, openWhatsApp } from '@/lib/whatsapp';
import { getPublicEnv } from '@/lib/env';
import { useLiveFleet } from '@/lib/use-live-fleet';

const icons = {
  basic: Car,
  confort: Sparkles,
  premium: Crown,
  familiale: Users,
  familiale_premium: Gem,
  '4x4': Mountain,
} as const;

function goReserve(categoryId?: FleetCategoryId) {
  const url = new URL(window.location.href);
  url.hash = 'reservation';
  if (categoryId) url.searchParams.set('cat', categoryId);
  else url.searchParams.delete('cat');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new Event('tnb:category'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('reservation')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}

export function MarketingHome() {
  const fleetCategories = useLiveFleet();
  return (
    <>
      <section id="pourquoi" className="tnb-band py-16 sm:py-20">
        <div className="tnb-shell grid gap-8 lg:grid-cols-3">
          {[
            { t: 'Flotte réelle', d: 'Basic, Confort, Premium, Familiale et 4x4 — des véhicules adaptés à Kinshasa.' },
            { t: 'Tarifs clairs', d: 'Prix à l’heure et à la journée, sans estimation kilométrique inventée.' },
            { t: 'Demande en quelques secondes', d: 'Départ, destination, horaire, puis confirmation sur WhatsApp.' },
          ].map((item) => (
            <Reveal key={item.t}>
              <article className="rounded-3xl bg-white/90 p-6 shadow-card">
                <h3 className="text-lg font-semibold">{item.t}</h3>
                <p className="mt-2 text-sm text-muted">{item.d}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="services" className="tnb-band py-20 sm:py-24">
        <div className="tnb-shell">
          <Reveal>
            <p className="text-sm font-medium text-brand">Offre</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Nos Services</h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">Des solutions pour chaque besoin.</p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fleetCategories.map((c, i) => {
              const Icon = icons[c.id];
              return (
                <Reveal key={c.id} delayMs={i * 60} scale>
                  <article className="tnb-lift flex h-full flex-col rounded-3xl bg-white p-6 shadow-card">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-xl font-semibold">{c.label}</h3>
                    <p className="mt-1 text-sm text-muted">{c.positioning}</p>
                    <p className="mt-3 text-sm text-ink">{c.vehicles.join(', ')}</p>
                    <p className="mt-4 text-2xl font-bold text-brand">{c.hourlyUsd} $ <span className="text-sm font-medium text-muted">/ heure</span></p>
                    <button type="button" className="btn-primary mt-6 w-full" onClick={() => goReserve(c.id)}>
                      Choisir
                    </button>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="flotte" className="tnb-band py-20 sm:py-24">
        <div className="tnb-shell">
          <Reveal>
            <p className="text-sm font-medium text-brand">Véhicules</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Notre flotte</h2>
          </Reveal>
          <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-2 lg:overflow-visible">
            {fleetShowcase.map((car, i) => {
              const cat = fleetCategoryById(car.categoryId);
              return (
                <Reveal key={car.id} delayMs={i * 70} className="min-w-[80%] snap-center sm:min-w-[60%] lg:min-w-0">
                  <article className="group overflow-hidden rounded-[1.75rem] bg-white shadow-card">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Photo
                        src={car.image}
                        alt={car.alt}
                        sizes="(max-width: 1024px) 85vw, 50vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold">{car.name}</h3>
                      <p className="mt-1 text-sm text-muted">{cat.label} · {cat.hourlyUsd} $ / heure · {cat.dailyUsd} $ / journée</p>
                      <button type="button" className="btn-primary mt-5" onClick={() => goReserve(car.categoryId)}>
                        Réserver
                      </button>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="tnb-band py-20 sm:py-24">
        <div className="tnb-shell">
          <Reveal>
            <p className="text-sm font-medium text-brand">Le trajet</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Comment ça marche</h2>
          </Reveal>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { n: '01', t: 'Je choisis', d: 'Départ, destination, horaire et catégorie.' },
              { n: '02', t: 'Taxi Na Biso comprend', d: 'La demande est enregistrée et envoyée à l’équipe.' },
              { n: '03', t: 'Je confirme sur WhatsApp', d: 'Vous relisez le message, puis vous l’envoyez.' },
            ].map((s) => (
              <li key={s.n} className="rounded-3xl bg-white/90 p-7 shadow-card">
                <span className="text-sm font-bold tracking-[0.18em] text-brand">{s.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="tarifs" className="tnb-band py-20 sm:py-24">
        <div className="tnb-shell">
          <Reveal>
            <p className="text-sm font-medium text-brand">Grille officielle</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Tarifs</h2>
            <p className="mt-3 max-w-2xl text-muted">Prix à l’heure et à la journée. Aucun tarif kilométrique n’est calculé automatiquement.</p>
          </Reveal>
          <div className="mt-8 hidden overflow-hidden rounded-3xl bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink text-white">
                <tr>
                  <th className="px-6 py-4 font-semibold">Catégorie</th>
                  <th className="px-6 py-4 font-semibold">Par heure</th>
                  <th className="px-6 py-4 font-semibold">Journée</th>
                </tr>
              </thead>
              <tbody>
                {fleetCategories.map((c) => (
                  <tr key={c.id} className="border-t border-black/5">
                    <td className="px-6 py-4 font-medium">{c.label}</td>
                    <td className="px-6 py-4">{c.hourlyUsd} $</td>
                    <td className="px-6 py-4">{c.dailyUsd} $</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-3 md:hidden">
            {fleetCategories.map((c) => (
              <article key={c.id} className="rounded-2xl bg-white p-4 shadow-card">
                <h3 className="font-semibold">{c.label}</h3>
                <p className="mt-1 text-sm text-muted">{c.hourlyUsd} $ / heure · {c.dailyUsd} $ / journée</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ContactCta() {
  const phone = getPublicEnv().supportPhone;
  return (
    <>
      <section id="contact" className="tnb-band py-16">
        <div className="tnb-shell grid gap-6 rounded-[2rem] bg-white p-8 shadow-card md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-brand">Localisation</p>
            <p className="mt-2 font-semibold">Kinshasa, RDC</p>
          </div>
          <div>
            <p className="text-sm font-medium text-brand">WhatsApp</p>
            <a className="mt-2 block font-semibold text-ink hover:text-brand" href={officialWhatsAppUrl('Bonjour TAXI NA BISO')}>
              {WHATSAPP_DISPLAY}
            </a>
          </div>
          <div>
            <p className="text-sm font-medium text-brand">Téléphone</p>
            <a className="mt-2 block font-semibold hover:text-brand" href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
          </div>
          <div>
            <p className="text-sm font-medium text-brand">E-mail</p>
            <a className="mt-2 block font-semibold hover:text-brand" href="mailto:hello@taxinabiso.com">hello@taxinabiso.com</a>
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden bg-brand py-24 text-white">
        <div className="tnb-shell relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Besoin d’un véhicule ?</h2>
          <p className="mt-3 max-w-xl text-lg text-white/85">Réservez votre course TAXI NA BISO en quelques secondes.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="tnb-lift rounded-xl bg-white px-6 py-3 font-semibold text-brand" onClick={() => goReserve()}>
              Réserver maintenant
            </button>
            <button
              type="button"
              className="tnb-lift rounded-xl border border-white/40 px-6 py-3 font-semibold"
              onClick={() => openWhatsApp(officialWhatsAppUrl('Bonjour TAXI NA BISO, je souhaite une course.'))}
            >
              WhatsApp
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
