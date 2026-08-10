import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // IMPORTANT: Always run for Clerk-specific frontend API proxy routes
    '/__clerk/(.*)',
  ],
};
