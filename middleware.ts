import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/newsroom/escritorio", "/newsroom/admin"];
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  if (isProtected) {
    const token = request.cookies.get("sb-token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAuthRoute) {
    const token = request.cookies.get("sb-token")?.value;
    if (token) {
      return NextResponse.redirect(new URL("/newsroom/escritorio", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/newsroom/escritorio/:path*", "/newsroom/admin/:path*", "/login", "/register"],
};
