import { NextResponse } from 'next/server';

export function middleware(request) {
  const sessionCookie = request.cookies.get('HttpSessionID');
  const isLoggedIn = !!sessionCookie?.value;
  const { pathname } = request.nextUrl;

  // Ignore static assets and service workers
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/serviceworker.js') ||
    pathname.endsWith('.map') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/neuroAdminLogo.svg')
  ) {
    return NextResponse.next();
  }


  if (pathname.startsWith('/login') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|login|_next/static|_next/image|favicon.ico|serviceworker.js|.*\\.map$).*)',
  ],
};
