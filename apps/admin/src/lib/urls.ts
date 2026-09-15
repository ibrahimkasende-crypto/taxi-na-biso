/** URLs publiques. Localhost uniquement si les variables de production sont absentes. */

const PROD_WEB = 'https://taxinabiso.newsystemcorps.com';

function stripSlash(url: string): string {
  return url.replace(/\/$/, '');
}

export function webUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WEB_URL;
  if (fromEnv) return stripSlash(fromEnv);
  return process.env.NEXT_PUBLIC_APP_ENV === 'production' ? PROD_WEB : 'http://localhost:3001';
}
