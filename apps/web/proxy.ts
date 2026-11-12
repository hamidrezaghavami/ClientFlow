import { clerkMiddleware } from '@clerk/nextjs/server';

import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { clerkConfigured } from './auth-config';

const handleClerk = clerkMiddleware();

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerkConfigured ? handleClerk(request, event) : NextResponse.next();
}

export const config = {
  matcher: ['/', '/sign-in/:path*', '/sign-up/:path*', '/dashboard/:path*', '/api/scope-review', '/api/client-board', '/__clerk/:path*'],
};
