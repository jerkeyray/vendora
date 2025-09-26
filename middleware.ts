import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply middleware to dashboard routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/(vendor)")) {
    // Get session from cookie (this is a simplified check)
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
      // No session, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }

    // For dashboard routes, we need to check if onboarding is complete
    // We'll do this check in the component itself since middleware can't easily make API calls
    // But we can add a redirect if needed
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/(vendor)/:path*"],
};
