import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers for all responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Block access to sensitive paths
  const pathname = request.nextUrl.pathname;
  
  // Block common attack patterns
  const blockedPatterns = [
    /\.env/i,
    /\.git/i,
    /\.config/i,
    /wp-admin/i,
    /wp-login/i,
    /phpMyAdmin/i,
    /\.php$/i,
    /\.asp$/i,
    /\.aspx$/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(pathname)) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes that handle their own security
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
