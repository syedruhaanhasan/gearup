import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getJwtSecretKey, SESSION_COOKIE_NAME } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=forbidden", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login?error=session", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
