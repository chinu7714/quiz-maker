import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string; role?: Role; isPro?: boolean }).id = user.id;
        (session.user as { id?: string; role?: Role; isPro?: boolean }).role = user.role;
        (session.user as { id?: string; role?: Role; isPro?: boolean }).isPro = user.isPro;
      }
      return session;
    }
  },
  pages: { signIn: "/login" }
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
