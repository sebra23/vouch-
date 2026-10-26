import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: {
        scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.readonly",
        access_type: "offline", prompt: "consent",
      }},
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: "common",
      authorization: { params: {
        scope: "openid profile email offline_access User.Read Calendars.Read Mail.Read Mail.ReadWrite",
      }},
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) { token.provider = account.provider; token.accessToken = account.access_token; token.refreshToken = account.refresh_token; token.accessTokenExpires = account.expires_at; }
      return token;
    },
    async session({ session, token }) {
      (session as any).provider = token.provider; (session as any).userId = token.sub;
      return session;
    },
  },
  pages: { signIn: "/login" },
};
