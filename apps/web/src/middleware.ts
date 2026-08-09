import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/home(.*)',
  '/chats(.*)',
  '/wallet(.*)',
  '/moments(.*)',
  '/mini-apps(.*)',
  '/admin(.*)',
  '/settings(.*)',
  '/search(.*)',
  '/notifications(.*)',
  '/u/(.*)',
]);

export default function middleware(req: NextRequest, evt: any) {
  // If Clerk Publishable Key is not configured in Vercel environment variables,
  // allow request to pass through cleanly without throwing Edge 500 MIDDLEWARE_INVOCATION_FAILED error.
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (typeof clerkKey !== 'string' || !clerkKey.startsWith('pk_')) {
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  })(req, evt);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
