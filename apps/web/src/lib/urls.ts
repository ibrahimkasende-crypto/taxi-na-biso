/** URLs publiques. Localhost uniquement si les variables de production sont absentes. */

const PROD_SITE = 'https://taxinabiso.newsystemcorps.com';
const PROD_ADMIN = 'https://admin.taxinabiso.newsystemcorps.com';

function stripSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function useProdHosts(): boolean {
  return process.env.NEXT_PUBLIC_APP_ENV === 'production';
}

export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return stripSlash(fromEnv);
  return useProdHosts() ? PROD_SITE : 'http://localhost:3001';
}

export function adminUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (fromEnv) return stripSlash(fromEnv);
  return useProdHosts() ? PROD_ADMIN : 'http://localhost:3000';
}

export function adminHome(): string {
  return `${adminUrl()}/dashboard`;
}

export function adminLoginUrl(): string {
  return `${adminUrl()}/login`;
}
