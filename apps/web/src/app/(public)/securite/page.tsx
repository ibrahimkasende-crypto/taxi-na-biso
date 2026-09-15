import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

import { PageHero } from '@/components/PageHero';
import { Soon } from '@/components/SiteChrome';
import { photos } from '@/config/media';

export default function SecuritePage() {
  return (
    <>
      <PageHero
        title="Sécurité"
        intro="Contrôles chauffeur et véhicule, assistance locale, et fonctions clairement indiquées lorsqu’elles ne sont pas encore actives."
        src={photos.nightDrive.src}
        alt={photos.nightDrive.alt}
      />
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2">
          {[
            'Conducteur vérifié (approbation opérateur requise pour passer en ligne)',
            'Documents contrôlés dans le dossier chauffeur',
            'Véhicule identifié',
            'Assistance locale Kinshasa',
            'Gestion des incidents depuis l’espace client ou chauffeur',
          ].map((t) => (
            <div key={t} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <p>{t}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">PIN de démarrage <Soon>Bientôt disponible</Soon></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">QR véhicule <Soon>Bientôt disponible</Soon></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">Partage de trajet <Soon>Bientôt disponible</Soon></div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-10">
          <Link href="/contact" className="btn-secondary">Contacter l’assistance</Link>
        </div>
      </section>
    </>
  );
}
