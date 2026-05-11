import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'repo_auth';
const PUBLIC_PATHS = ['/login', '/unauthorized'];
const ADMIN_PREFIX = '/admin';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let user: { role: string } | null = null;
  try {
    const raw = request.cookies.get(AUTH_COOKIE)?.value;
    user = raw ? JSON.parse(decodeURIComponent(raw)) : null;
  } catch {
    user = null;
  }

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  // Root → redirect based on auth state
  if (pathname === '/') {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url));
  }

  // Already logged in → don't show login page again
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url));
  }

  // Public pages — always allow
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  // Everything else requires auth
  if (!isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Admin section requires admin role
  if (pathname.startsWith(ADMIN_PREFIX) && !isAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons).*)'],
};
