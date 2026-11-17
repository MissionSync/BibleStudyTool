import { NextRequest, NextResponse } from 'next/server';
import {
  buildShareContentSecurityPolicy,
  createShareNonce,
} from './lib/shareCsp';

// Nonces are per request, so this policy cannot live in next.config headers.
// The matcher keeps it on /share, which is the only route that had a CSP.
export function proxy(request: NextRequest) {
  const nonce = createShareNonce();
  const contentSecurityPolicy = buildShareContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', contentSecurityPolicy);

  return response;
}

export const config = {
  matcher: '/share/:path*',
};
