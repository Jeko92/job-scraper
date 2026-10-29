import { type NextRequest, NextResponse } from 'next/server';

import { AUTH_COOKIE } from '@/lib/auth/cookie';
import { LOGIN_HREF } from '@/lib/routes';

export function proxy(request: NextRequest) {
  if (!request.cookies.has(AUTH_COOKIE)) {
    return NextResponse.redirect(new URL(LOGIN_HREF, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/search', '/saved', '/profile', '/onboarding', '/jobs/:path*'],
};
