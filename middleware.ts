import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const INTRANET_COOKIE = "formeta_session";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/intranet")) {
    return NextResponse.next();
  }

  const session = request.cookies.get(INTRANET_COOKIE)?.value;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/intranet/:path*"],
};
