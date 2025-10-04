// /middleware.ts
export { auth as middleware } from '@/auth'; // si tu alias "@/" no funciona, usa './auth'

export const config = {
  matcher: ['/dashboard/:path*'], // protege todo /dashboard
};
