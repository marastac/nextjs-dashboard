// /auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    /**
     * Controla el acceso en Middleware.
     * - Devuelve `false` para forzar redirección a /login cuando no hay sesión.
     * - Puede devolver un Response para redirigir manualmente.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        return isLoggedIn ? true : false; // no logueado -> NextAuth redirige a /login
      }

      // Si ya está logueado y va a la home, llévalo al dashboard.
      if (isLoggedIn && nextUrl.pathname === '/') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  // Los providers se definen en /auth.ts
  providers: [],
} satisfies NextAuthConfig;
