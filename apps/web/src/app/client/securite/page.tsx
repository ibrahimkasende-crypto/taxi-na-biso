import { Soon } from '@/components/SiteChrome';
import { getPublicEnv } from '@/lib/env';

export default function ClientSecuritePage() {
  const env = getPublicEnv();
  return (
    <div>
      <h1 className="text-2xl font-bold">Sécurité</h1>
      <ul className="mt-4 space-y-2 text-sm">
        <li>
          PIN de démarrage <Soon>Bientôt disponible</Soon>
        </li>
        <li>
          Partage de course <Soon>Bientôt disponible</Soon>
        </li>
        <li>
          Urgence :{' '}
          <a className="text-brand" href={`tel:${env.supportPhone}`}>
            appeler l’assistance
          </a>
        </li>
      </ul>
    </div>
  );
}
