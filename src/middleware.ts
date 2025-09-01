import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/profile", "/host", "/requests", "/messages"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) || pathname === "/";
  if (!isProtected) return NextResponse.next();

  // Check both cookie and localStorage (via custom header)
  const token = req.cookies.get("auth")?.value || req.headers.get("x-auth-token");
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};
