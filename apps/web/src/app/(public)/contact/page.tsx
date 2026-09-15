import { ContactForm } from '@/components/ContactForm';
import { PageHero } from '@/components/PageHero';
import { photos } from '@/config/media';

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact"
        intro="Assistance locale à Kinshasa. Le formulaire de cette page n’envoie pas encore d’e-mail transactionnel."
        src={photos.kinshasaGombe.src}
        alt={photos.kinshasaGombe.alt}
      />
      <div className="mx-auto max-w-6xl px-4 py-14">
        <ContactForm />
      </div>
    </>
  );
}
