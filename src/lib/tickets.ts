import { and, asc, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { ticketComments, ticketEvents, tickets, type TicketStatus } from "@/db/schema";

export async function getTicketByReference(reference: string) {
  return db.query.tickets.findFirst({
    where: eq(tickets.reference, reference),
    with: {
      requester: { columns: { id: true, name: true, email: true } },
      assignee: { columns: { id: true, name: true } },
      comments: { orderBy: asc(ticketComments.createdAt) },
      events: { orderBy: asc(ticketEvents.createdAt) },
    },
  });
}

export type TicketWithHistory = NonNullable<Awaited<ReturnType<typeof getTicketByReference>>>;

export async function getTechnicians() {
  return db.query.user.findMany({
    where: (table, { inArray }) => inArray(table.role, ["technician", "admin"]),
    columns: { id: true, name: true, role: true },
    orderBy: (table, { asc: ascending }) => ascending(table.name),
  });
}

export const PAGE_SIZE = 10;

/**
 * Pages the list in SQL rather than loading every row and slicing in memory, so the
 * cost stays flat as the number of requests grows. The status counts deliberately
 * ignore the status filter, so the filter chips keep showing full totals.
 */
export async function listTickets({
  scope,
  status,
  page,
}: {
  scope?: SQL;
  status?: TicketStatus;
  page: number;
}) {
  const base = [scope].filter((condition): condition is SQL => Boolean(condition));

  const countWhere = base.length > 0 ? and(...base) : undefined;
  const where = status ? and(...base, eq(tickets.status, status)) : countWhere;

  const [tallies, rows] = await Promise.all([
    db
      .select({ status: tickets.status, count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(countWhere)
      .groupBy(tickets.status),
    db.query.tickets.findMany({
      where,
      orderBy: desc(tickets.createdAt),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      with: { assignee: { columns: { name: true } } },
    }),
  ]);

  const counts: Record<TicketStatus, number> = { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 };
  for (const tally of tallies) counts[tally.status] = tally.count;

  const all = counts.PENDING + counts.IN_PROGRESS + counts.RESOLVED;
  const total = status ? counts[status] : all;

  return {
    rows,
    counts: { ALL: all, ...counts },
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Clamps a ?page= value so a hand-edited or stale URL cannot produce a negative offset. */
export function parsePage(value: string | undefined, totalPages = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, totalPages);
}

export async function countUnassigned() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(isNull(tickets.assignedToId));

  return row?.count ?? 0;
}
