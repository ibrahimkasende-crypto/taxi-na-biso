import { PageHero } from '@/components/PageHero';
import { photos } from '@/config/media';

export default function MentionsPage() {
  return (
    <>
      <PageHero title="Mentions légales" intro="Taxi Na Biso — Kinshasa, République démocratique du Congo." src={photos.kinshasaSkyline.src} alt={photos.kinshasaSkyline.alt} />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 text-sm leading-relaxed text-muted">
        <p>Taxi Na Biso — transport de personnes à Kinshasa.</p>
        <p>Contact : hello@taxinabiso.com · WhatsApp +243 974 543 860.</p>
      </div>
    </>
  );
}
