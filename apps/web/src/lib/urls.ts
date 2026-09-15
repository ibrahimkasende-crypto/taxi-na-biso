/** URLs publiques. Localhost uniquement si les variables de production sont absentes. */

const PROD_SITE = 'https://taxinabiso.newsystemcorps.com';

function stripSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function productionHosts(): boolean {
  return process.env.NEXT_PUBLIC_APP_ENV === 'production';
}

export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_WEB_URL;
  if (fromEnv) return stripSlash(fromEnv);
  return productionHosts() ? PROD_SITE : 'http://localhost:3001';
}

/** Console admin : même origine que le site (`apps/web`). */
export function adminUrl(): string {
  return `${siteUrl()}/admin`;
}

export function adminHome(): string {
  return '/admin';
}

export function adminLoginUrl(): string {
  return '/admin/login';
}
