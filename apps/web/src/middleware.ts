import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { canAccessClient, canAccessDriver, homeForRole } from '@/lib/roles';
import { withAuthCookieOptions } from '@/lib/auth-cookies';

function isPublicDriverAuth(pathname: string): boolean {
  return (
    pathname.startsWith('/chauffeur/connexion') ||
    pathname.startsWith('/chauffeur/inscription') ||
    pathname.startsWith('/chauffeur/verification')
  );
}

function redirectTo(request: NextRequest, dest: string) {
  if (dest.startsWith('http://') || dest.startsWith('https://')) {
    return NextResponse.redirect(dest);
  }
  return NextResponse.redirect(new URL(dest, request.url));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth =
    pathname.startsWith('/client') ||
    (pathname.startsWith('/chauffeur') && !isPublicDriverAuth(pathname));

  if (!needsAuth) return NextResponse.next();

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, withAuthCookieOptions(options ?? {}));
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = pathname.startsWith('/chauffeur') ? '/chauffeur/connexion' : '/connexion';
    const dest = request.nextUrl.clone();
    dest.pathname = login;
    dest.searchParams.set('next', pathname);
    return NextResponse.redirect(dest);
  }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role ?? (user.user_metadata?.role as string | undefined);

  if (pathname.startsWith('/client') && !canAccessClient(role)) {
    return redirectTo(request, homeForRole(role));
  }
  if (pathname.startsWith('/chauffeur') && !isPublicDriverAuth(pathname) && !canAccessDriver(role)) {
    return redirectTo(request, homeForRole(role));
  }

  return response;
}

export const config = {
  matcher: ['/client', '/client/:path*', '/chauffeur', '/chauffeur/:path*'],
};
