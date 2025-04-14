import {authMiddleware} from '@clerk/nextjs';
import {NextResponse} from 'next/server';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: [],
  afterAuth(auth, req, evt) {
    //  Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInURL = new URL('/sign-in', req.url);
      signInURL.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInURL);
    }
    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
