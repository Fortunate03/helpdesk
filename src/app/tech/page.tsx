import { and, desc, eq, isNull } from "drizzle-orm";
import { ListChecks } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { StatusFilter } from "@/components/tickets/status-filter";
import { TicketList, type TicketRow } from "@/components/tickets/ticket-list";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StatTile } from "@/components/ui/stat-tile";
import { db } from "@/db";
import { ticketStatusEnum, tickets, type TicketStatus } from "@/db/schema";
import { requireRole, roleOf } from "@/lib/session";
import { PAGE_SIZE, countUnassigned, listTickets, parsePage } from "@/lib/tickets";

export const metadata: Metadata = {
  title: "Technician Queue",
};

export default async function TechQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const user = await requireRole(["technician", "admin"]);
  const { status, page } = await searchParams;

  // An administrator is a superuser: the queue shows every request, not only the ones
  // that happen to be assigned to them. A technician still sees just their own work.
  const isAdmin = roleOf(user) === "admin";

  const activeStatus = ticketStatusEnum.enumValues.includes(status as TicketStatus)
    ? (status as TicketStatus)
    : undefined;

  const currentPage = parsePage(page);

  const [{ rows, counts, total, totalPages }, unclaimed, unassignedCount] = await Promise.all([
    listTickets({
      scope: isAdmin ? undefined : eq(tickets.assignedToId, user.id),
      status: activeStatus,
      page: currentPage,
    }),
    db.query.tickets.findMany({
      where: and(isNull(tickets.assignedToId), eq(tickets.status, "PENDING")),
      orderBy: desc(tickets.createdAt),
      limit: 10,
    }),
    countUnassigned(),
  ]);

  const visible: TicketRow[] = rows.map((row) => ({
    reference: row.reference,
    category: row.category,
    status: row.status,
    priority: row.priority,
    createdAt: row.createdAt,
    description: row.description,
    requesterName: row.fullName,
  }));

  return (
    <>
      <PageHeader
        title={isAdmin ? "Request Queue" : "Technician Queue"}
        description={
          isAdmin
            ? "Every request across the help desk. Assigned or not, you can open and act on any of them."
            : `Requests assigned to you, ${user.name.split(" ")[0]}. Update the status as you work through them.`
        }
      />

      <Container className="space-y-8 py-8 lg:py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatTile label={isAdmin ? "All requests" : "Assigned to me"} value={counts.ALL} />
          <StatTile label="Pending" value={counts.PENDING} />
          <StatTile label="In progress" value={counts.IN_PROGRESS} />
          <StatTile label="Resolved" value={counts.RESOLVED} />
          <StatTile label="Unassigned" value={unassignedCount} />
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{isAdmin ? "All requests" : "My queue"}</h2>

          {counts.ALL === 0 ? (
            <EmptyState
              icon={ListChecks}
              title={isAdmin ? "No requests yet" : "Nothing assigned to you"}
              description={
                isAdmin
                  ? "Once people start reporting problems they will all appear here."
                  : unassignedCount > 0
                    ? "Unassigned requests are listed below. Claim one to assign it to yourself and start work."
                    : "Requests assigned to you appear here. There is nothing waiting to be picked up either."
              }
            />
          ) : (
            <>
              <StatusFilter basePath="/tech" active={activeStatus} counts={counts} />

              {visible.length === 0 ? (
                <EmptyState
                  icon={ListChecks}
                  title="Nothing to show"
                  description="No assigned requests match this filter."
                />
              ) : (
                <>
                  <TicketList tickets={visible} hrefBase="/my-requests" showRequester />
                  <Pagination
                    basePath="/tech"
                    page={currentPage}
                    totalPages={totalPages}
                    total={total}
                    pageSize={PAGE_SIZE}
                    params={activeStatus ? { status: activeStatus } : {}}
                  />
                </>
              )}
            </>
          )}
        </section>

        {unclaimed.length > 0 ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Waiting to be assigned</h2>
              <p className="mt-1 text-sm text-muted">
                Requests nobody has picked up yet. Open one and claim it to assign it to
                yourself and start work.
              </p>
            </div>

            <TicketList
              tickets={unclaimed.map((row) => ({
                reference: row.reference,
                category: row.category,
                status: row.status,
                priority: row.priority,
                createdAt: row.createdAt,
                description: row.description,
                requesterName: row.fullName,
              }))}
              hrefBase="/my-requests"
              showRequester
            />
          </section>
        ) : null}
      </Container>
    </>
  );
}
