import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextMiddleware } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/api/auth"];

// auth() returns a NextMiddleware when given a callback
const middleware: NextMiddleware = auth(function onAuth(req) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  if (!(req as any).auth) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
} as Parameters<typeof auth>[0]);

export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
