import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/permissions";

/**
 * Wrapped in cache() so a page, its layout and any server action in the same
 * request share one session lookup instead of hitting the database repeatedly.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export function roleOf(user: { role?: string | null } | null | undefined): Role {
  const role = user?.role;
  return role === "admin" || role === "technician" ? role : "user";
}

/**
 * Guards live in the page and the server action, never only in middleware.
 * Middleware runs before route resolution and cannot be treated as the
 * authorisation boundary. It redirects for convenience; this decides access.
 */
export async function requireUser(redirectTo = "/login") {
  const session = await getSession();

  if (!session?.user) {
    redirect(`${redirectTo}?next=${encodeURIComponent("/my-requests")}`);
  }

  return session.user;
}

export async function requireRole(allowed: Role[]) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowed.includes(roleOf(session.user))) {
    redirect("/my-requests?denied=1");
  }

  return session.user;
}

export function isStaff(user: { role?: string | null } | null | undefined) {
  const role = roleOf(user);
  return role === "admin" || role === "technician";
}
