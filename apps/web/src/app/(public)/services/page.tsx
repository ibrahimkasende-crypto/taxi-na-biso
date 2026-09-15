import Link from 'next/link';
import { Car, Crown, Gem, Mountain, Sparkles, Users } from 'lucide-react';

import { PageHero } from '@/components/PageHero';
import { Reveal } from '@/components/Reveal';
import { photos } from '@/config/media';
import { overlayFleetRates } from '@/lib/live-fleet';
import { getSupabaseServer } from '@/lib/supabase-server';

const icons = {
  basic: Car,
  confort: Sparkles,
  premium: Crown,
  familiale: Users,
  familiale_premium: Gem,
  '4x4': Mountain,
} as const;

export default async function ServicesPage() {
  const fleetCategories = await overlayFleetRates(await getSupabaseServer());
  return (
    <>
      <PageHero
        title="Services"
        intro="Des solutions pour chaque besoin : Basic, Confort, Premium, Familiale et 4x4."
        src={photos.sedanNight.src}
        alt={photos.sedanNight.alt}
      />
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {fleetCategories.map((c, i) => {
            const Icon = icons[c.id];
            return (
              <Reveal key={c.id} delayMs={i * 50}>
                <article className="rounded-3xl bg-white p-6 shadow-card">
                  <Icon className="h-5 w-5 text-brand" />
                  <h2 className="mt-2 text-xl font-semibold">{c.label}</h2>
                  <p className="mt-2 text-sm text-muted">{c.positioning}</p>
                  <p className="mt-2 text-sm">{c.vehicles.join(', ')}</p>
                  <p className="mt-3 font-semibold text-brand">{c.hourlyUsd} $ / heure · {c.dailyUsd} $ / journée</p>
                  <Link href={`/?cat=${c.id}#reservation`} className="btn-primary mt-5">
                    Choisir
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </>
  );
}
