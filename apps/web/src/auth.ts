import NextAuth, { type NextAuthResult } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env["AUTH_GITHUB_ID"],
      clientSecret: process.env["AUTH_GITHUB_SECRET"],
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Development-only hardcoded users. Replace with real DB lookup in production.
        const devUsers: Record<string, { id: string; name: string; email: string }> = {
          "admin@eventgrid.dev": { id: "dev-admin", name: "Admin User", email: "admin@eventgrid.dev" },
          "sales@eventgrid.dev": { id: "dev-sales", name: "Sales Rep", email: "sales@eventgrid.dev" },
        };

        const user = devUsers[parsed.data.email];
        return user ?? null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token["userId"] = user.id;
        token["provider"] = account?.provider ?? "credentials";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token["userId"];
        (session.user as any).provider = token["provider"];
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: { strategy: "jwt" },
};

const result: NextAuthResult = NextAuth(authConfig);
export const { handlers, auth, signIn, signOut } = result;
