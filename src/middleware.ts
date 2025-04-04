import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of protected routes that require authentication
const protectedRoutes = ["/generate", "/gallery", "/profile"];

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get("user");
  const path = request.nextUrl.pathname;

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute && !currentUser) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/generate/:path*", "/gallery/:path*", "/profile/:path*"],
};
