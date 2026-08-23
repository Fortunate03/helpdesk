import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { tickets, user } from "@/db/schema";
import { ac, roles } from "@/lib/permissions";

/**
 * Accounts are created through Better Auth rather than inserted directly, so the
 * password hashing and account rows match exactly what sign-in expects. The
 * nextCookies plugin is deliberately left out, as there is no request to attach
 * cookies to when this runs from the command line.
 */
const seedAuth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: process.env.BETTER_AUTH_SECRET,
  // Lower than the app itself (src/lib/auth.ts keeps 8) purely so the short demo
  // passwords below can be created. Sign-in does not check length, so real
  // registrations through the site are still held to the 8-character minimum.
  emailAndPassword: { enabled: true, minPasswordLength: 4 },
  plugins: [adminPlugin({ ac, roles, defaultRole: "user", adminRoles: ["admin"] })],
});

const PEOPLE = [
  { name: "John Smith", email: "admin@helpdesk.co.za", password: "admin", role: "admin" },
  { name: "Jane Doe", email: "technician@helpdesk.co.za", password: "user", role: "technician" },
  { name: "Alex Brown", email: "user@helpdesk.co.za", password: "user", role: "user" },
] as const;

async function main() {
  console.log("Clearing existing requests and accounts…");

  // ticket_comments and ticket_events cascade from tickets; sessions and accounts
  // cascade from user.
  await db.delete(tickets);
  await db.delete(user);

  console.log("Creating accounts…");

  for (const person of PEOPLE) {
    await seedAuth.api.signUpEmail({
      body: { name: person.name, email: person.email, password: person.password },
    });

    // signUpEmail always produces a plain user; the role is applied afterwards.
    await db
      .update(user)
      .set({ role: person.role, emailVerified: true })
      .where(eq(user.email, person.email));
  }

  console.log(`\nDatabase is empty of requests. ${PEOPLE.length} accounts created:\n`);
  for (const person of PEOPLE) {
    console.log(`  ${person.role.padEnd(11)} ${person.email.padEnd(26)} ${person.password}`);
  }
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
