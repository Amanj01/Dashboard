// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from 'axios';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post("http://localhost:5000/api/auth/login", {
            username: credentials.username,
            password: credentials.password,
          });

          if (res.data && res.data.token) {
            return { token: res.data.token, role: res.data.role };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        accessToken: token.accessToken,
        role: token.role,
      };
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.JWT_SECRET,
});

// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  
  // Skip middleware for these paths
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.includes('favicon.ico') ||
    path === '/auth/signin'
  ) {
    return NextResponse.next();
  }

  // Force login by redirecting to signin
  const token = await getToken({ req });
  if (!token) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', path);
    const response = NextResponse.redirect(signInUrl);
    
    // Clear all auth cookies
    const cookiesToClear = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.delete(cookieName);
    });
    
    return response;
  }

  // Check if token is expired (optional)
  const tokenAge = Date.now() - new Date(token.iat * 1000).getTime();
  if (tokenAge > 1 * 60 * 1000) { // 1 minute in milliseconds
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', path);
    const response = NextResponse.redirect(signInUrl);
    
    // Clear all auth cookies
    const cookiesToClear = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.delete(cookieName);
    });
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!auth/signin|api|_next/static|_next/image|favicon.ico).*)',
  ],
};