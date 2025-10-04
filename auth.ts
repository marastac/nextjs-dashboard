// /auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import postgres from 'postgres';

// ¡Solo Node! (no edge)
export const runtime = 'nodejs';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  password: string; // hash bcrypt/bcryptjs
};

async function getUser(email: string): Promise<UserRow | undefined> {
  const rows = await sql<UserRow[]>`SELECT * FROM users WHERE email=${email}`;
  return rows[0];
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }).safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await getUser(email);
        if (!user) return null;

        // Import dinámico evita que Turbopack/Edge levanten la dep en cliente
        const bcrypt = await import('bcryptjs');
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return { id: user.id, name: user.name ?? '', email: user.email };
      },
    }),
  ],
});
