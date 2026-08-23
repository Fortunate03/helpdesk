import { and, asc, eq, ne, or, isNull, sql } from "drizzle-orm";
import { user } from "@/db/schema";
import type { db as Database } from "@/db";

type Executor = typeof Database | Parameters<Parameters<typeof Database.transaction>[0]>[0];

/**
 * Picks the next technician in rotation for a new request.
 *
 * The cursor is a Postgres sequence rather than a counter in application code: two
 * simultaneous submissions calling nextval() are guaranteed different positions, so
 * neither the same technician gets both nor does one get skipped.
 *
 * Technicians are ordered by id so the rotation is stable between calls. Adding or
 * removing a technician shifts the cycle, which is acceptable: it keeps cycling
 * evenly from that point on.
 *
 * Returns null when there is nobody to assign to, leaving the request unassigned for
 * an administrator or a technician to pick up.
 */
export async function nextTechnicianInRotation(tx: Executor) {
  const technicians = await tx
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.role, "technician"),
        // A banned account should not be handed new work.
        or(isNull(user.banned), ne(user.banned, true)),
      ),
    )
    .orderBy(asc(user.id));

  if (technicians.length === 0) return null;

  const rows = await tx.execute<{ position: number }>(
    sql`select nextval('technician_rotation')::int as position`,
  );

  const position = Number((rows as unknown as Array<{ position: number }>)[0]?.position ?? 0);

  return technicians[position % technicians.length].id;
}
