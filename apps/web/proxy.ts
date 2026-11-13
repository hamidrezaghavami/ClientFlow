import { clerkMiddleware } from '@clerk/nextjs/server';

import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { clerkConfigured } from './auth-config';

function withLanguage(request: NextRequest) {
  const headers = new Headers(request.headers);
  const selected = request.nextUrl.searchParams.get('lang');
  const language = selected ?? request.cookies.get('clientflow-language')?.value ?? 'en';
  headers.set('x-clientflow-language', language);
  const response = NextResponse.next({ request: { headers } });
  if (selected === 'en' || selected === 'tr' || selected === 'fa') {
    response.cookies.set('clientflow-language', selected, { path: '/', sameSite: 'lax', maxAge: 31_536_000 });
  }
  return response;
}

const handleClerk = clerkMiddleware((_auth, request) => withLanguage(request));

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerkConfigured ? handleClerk(request, event) : withLanguage(request);
}

export const config = {
  matcher: ['/', '/sign-in/:path*', '/sign-up/:path*', '/dashboard/:path*', '/review', '/__clerk/:path*'],
};
