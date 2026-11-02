import { NextResponse, type NextRequest } from "next/server";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(adminCookieName())?.value;
  if (await isValidAdminSession(token)) {
    return NextResponse.next();
  }

  const login = request.nextUrl.clone();
  login.pathname = "/admin/login";
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
