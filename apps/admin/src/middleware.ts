import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { isStaffRole } from '@/lib/roles';
import { withAuthCookieOptions } from '@/lib/auth-cookies';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return NextResponse.next();
  }

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
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (!isStaffRole((profile as { role?: string } | null)?.role)) {
    return NextResponse.redirect(new URL('/login?denied=1', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/dispatch/:path*',
    '/drivers/:path*',
    '/vehicles/:path*',
    '/fares/:path*',
    '/payments/:path*',
    '/compliance/:path*',
    '/incidents/:path*',
    '/audit/:path*',
  ],
};
