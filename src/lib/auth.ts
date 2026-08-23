import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { APP_URL } from "@/lib/app-url";
import { ac, roles } from "@/lib/permissions";
import { rememberResetLink } from "@/lib/reset-links";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: APP_URL,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      // No mail provider is wired up, so the link goes to the server log. Replace this
      // body with a transactional email call (Resend, SES, SMTP) and the rest of the
      // reset flow keeps working unchanged.
      console.log(`\n[password reset] ${user.email}\n${url}\n`);

      // Also held briefly in memory so the demo build can show it on the page.
      rememberResetLink(user.email, url);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  plugins: [
    adminPlugin({ ac, roles, defaultRole: "user", adminRoles: ["admin"] }),

    // Has to stay last: it forwards Set-Cookie headers from server actions, and
    // plugins registered after it would not have their cookies included.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
