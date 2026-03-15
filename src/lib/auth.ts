import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail    = process.env.ADMIN_EMAIL!;
        const adminPassword = process.env.ADMIN_PASSWORD!;

        // Simple owner-only auth
        if (credentials.email !== adminEmail) return null;

        // Support both plain-text (dev) and bcrypt-hashed passwords
        const valid =
          credentials.password === adminPassword ||
          (adminPassword.startsWith("$2") &&
            (await bcrypt.compare(credentials.password, adminPassword)));

        if (!valid) return null;

        return {
          id: process.env.OWNER_ID || "vipin",
          email: adminEmail,
          name: "Admin",
          role: "admin",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
    error:  "/admin/login",
  },
};
