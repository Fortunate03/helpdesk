import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Only checks that a session cookie is present, which is enough to bounce signed-out
 * visitors to the login page without a database round trip on every request.
 *
 * It is not an authorisation check: the cookie is not validated here and roles are not
 * considered. Every protected page and server action re-checks the real session with
 * requireUser/requireRole, which is what actually decides access.
 */
export function middleware(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/my-requests/:path*", "/tech/:path*", "/admin/:path*"],
};
