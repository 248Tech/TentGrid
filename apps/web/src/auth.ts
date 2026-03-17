import NextAuth, { type NextAuthResult } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const membershipSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  role: z.string(),
  status: z.string(),
  team: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
});

const syncResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  memberships: z.array(membershipSchema),
});

type SyncedMembership = z.infer<typeof membershipSchema>;

async function syncUserWithApi(params: {
  email: string;
  name: string;
  provider: string;
  subject: string;
  avatarUrl?: string | null;
}) {
  const apiBase =
    process.env["API_INTERNAL_URL"] ??
    process.env["NEXT_PUBLIC_API_URL"] ??
    "http://localhost:4000";
  const internalSecret = process.env["API_INTERNAL_SECRET"];

  if (!internalSecret) {
    throw new Error("API_INTERNAL_SECRET is required to sync auth users.");
  }

  const res = await fetch(`${apiBase}/api/v1/auth/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": internalSecret,
    },
    body: JSON.stringify({
      email: params.email,
      name: params.name,
      provider: params.provider,
      subject: params.subject,
      avatarUrl: params.avatarUrl ?? undefined,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Auth sync failed (${res.status}): ${body}`);
  }

  return syncResponseSchema.parse(await res.json());
}

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
      const existingMemberships = token["memberships"] as SyncedMembership[] | undefined;
      const shouldSync = !!user || !existingMemberships?.length;

      if (shouldSync) {
        const provider =
          account?.provider ?? (token["provider"] as string | undefined) ?? "credentials";
        const email = user?.email ?? token.email;
        const name = user?.name ?? token.name ?? email;
        const subject =
          account?.providerAccountId ??
          user?.id ??
          (typeof token.sub === "string" ? token.sub : undefined) ??
          email;

        token["provider"] = provider;

        if (email && name && subject) {
          try {
            const synced = await syncUserWithApi({
              email,
              name,
              provider,
              subject,
              avatarUrl: user?.image,
            });
            token["userId"] = synced.id;
            token["memberships"] = synced.memberships;
          } catch {
            token["userId"] = user?.id ?? token["userId"];
            token["memberships"] = token["memberships"] ?? [];
          }
        } else if (user) {
          token["userId"] = user.id;
          token["memberships"] = token["memberships"] ?? [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token["userId"];
        (session.user as any).provider = token["provider"];
      }
      (session as any).memberships = (token["memberships"] as SyncedMembership[] | undefined) ?? [];
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
