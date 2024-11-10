import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Force check token on every request
  const token = await getToken({ 
    req, 
    secret: process.env.JWT_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });

  // Always redirect to login if no valid session exists
  if (!token) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Verify token expiration on every request
  if (token.exp * 1000 < Date.now()) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except authentication-related and static assets
    "/((?!auth/signin|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
