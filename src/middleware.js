import { NextResponse } from 'next/server';

const ALLOWED_CORS_ORIGINS = new Set([
  'http://localhost:3000',
  'https://localhost:3000',
  'https://dev.innova.neuro-exchange.com',
  'https://staging.innova.neuro-exchange.com',
  'https://innova.neuro-exchange.com',
]);

function getCorsHeaders(request) {
  const origin = request.headers.get('origin');
  if (!origin || !ALLOWED_CORS_ORIGINS.has(origin)) return null;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': request.headers.get('access-control-request-headers') || 'Content-Type, Authorization, X-Requested-With, x-agent-host, x-cron-secret',
    'Vary': 'Origin',
  };
}

function applyCorsHeaders(response, corsHeaders) {
  if (!corsHeaders) return response;

  Object.entries(corsHeaders).forEach(([headerName, headerValue]) => {
    response.headers.set(headerName, headerValue);
  });

  return response;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const corsHeaders = getCorsHeaders(request);

  if (pathname.startsWith('/api')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders || {},
      });
    }

    return applyCorsHeaders(NextResponse.next(), corsHeaders);
  }

  const sessionCookie = request.cookies.get('HttpSessionID');
  const isLoggedIn = !!sessionCookie?.value;

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

  return applyCorsHeaders(NextResponse.next(), corsHeaders);
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|NeuroLogo.svg|app-store-button.png|Google-play-button.png|Neuro-Access-preview.png|simple-Qr.png).*)',
  ],
};
