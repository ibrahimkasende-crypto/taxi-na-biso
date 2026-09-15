import { ShieldCheck, Car, MapPinned, Smartphone } from 'lucide-react';

import { MarketingHome, ContactCta } from '@/components/MarketingHome';
import { Reveal } from '@/components/Reveal';
import { Soon } from '@/components/SiteChrome';
import { brand } from '@/config/brand';

const safety = [
  { icon: ShieldCheck, t: 'Chauffeurs vérifiés', d: 'Validation opérateur et documents contrôlés avant les courses.' },
  { icon: Car, t: 'Course identifiée', d: 'Profil chauffeur et véhicule affichés une fois la course acceptée.' },
  { icon: MapPinned, t: 'Suivi en temps réel', d: 'Statut et carte disponibles pendant la course sur le web.' },
  { icon: Smartphone, t: 'Assistance locale', d: 'Support Taxi Na Biso à Kinshasa, depuis l’espace client ou chauffeur.' },
];

const faqs = [
  { q: 'Comment commander ?', a: 'Indiquez départ, destination, horaire et catégorie. La demande est enregistrée, puis vous confirmez sur WhatsApp.' },
  { q: 'Comment sont affichés les tarifs ?', a: 'Les tarifs officiels sont à l’heure et à la journée. Nous ne calculons pas un prix kilométrique automatique.' },
  { q: 'Puis-je devenir chauffeur ?', a: 'Oui. Créez un compte chauffeur, déposez vos documents, puis attendez la validation opérateur.' },
  { q: 'Dois-je être connecté ?', a: 'Non pour envoyer une demande WhatsApp. Un compte Client permet de suivre la demande dans l’espace client.' },
];

export function HomeSections() {
  return (
    <div className="tnb-universe">
      <div aria-hidden className="tnb-orb tnb-orb-a" />
      <div aria-hidden className="tnb-orb tnb-orb-b" />
      <div aria-hidden className="tnb-orb tnb-orb-c" />

      <MarketingHome />

      <div aria-hidden className="tnb-bridge tnb-bridge-to-ink" />
      <section className="relative bg-ink py-20 text-white sm:py-24">
        <div className="tnb-shell relative">
          <Reveal>
            <p className="text-sm font-medium text-brand">Confiance</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Sécurité</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {safety.map((item) => (
              <div key={item.t} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <item.icon className="h-5 w-5 text-brand" />
                <h3 className="mt-4 text-lg font-semibold">{item.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.d}</p>
              </div>
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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions fréquentes</h2>
          <dl className="mt-10 grid gap-4 lg:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl bg-white/85 p-6 shadow-card">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-xs text-muted">
            {brand.appName} · {brand.defaultCity}.
          </p>
        </div>
      </section>

      <ContactCta />
    </div>
  );
}
