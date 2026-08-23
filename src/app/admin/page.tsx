import { Inbox, UserX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatusFilter } from "@/components/tickets/status-filter";
import { TicketList, type TicketRow } from "@/components/tickets/ticket-list";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StatTile } from "@/components/ui/stat-tile";
import { ticketStatusEnum, type TicketStatus } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { PAGE_SIZE, countUnassigned, listTickets, parsePage } from "@/lib/tickets";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; unassigned?: string; page?: string }>;
}) {
  await requireRole(["admin"]);
  const { status, unassigned, page } = await searchParams;

  const activeStatus = ticketStatusEnum.enumValues.includes(status as TicketStatus)
    ? (status as TicketStatus)
    : undefined;

  const onlyUnassigned = unassigned === "1";
  const currentPage = parsePage(page);

  const [{ rows, counts, total, totalPages }, unassignedCount] = await Promise.all([
    listTickets({ status: activeStatus, unassignedOnly: onlyUnassigned, page: currentPage }),
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
    assigneeName: row.assignee?.name ?? null,
  }));

  const params: Record<string, string> = {};
  if (activeStatus) params.status = activeStatus;
  if (onlyUnassigned) params.unassigned = "1";

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Every request across the help desk. Assign technicians and move requests through to resolution."
      />

      <Container className="space-y-8 py-8 lg:py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatTile label="Total requests" value={counts.ALL} />
          <StatTile label="Pending" value={counts.PENDING} />
          <StatTile label="In progress" value={counts.IN_PROGRESS} />
          <StatTile label="Resolved" value={counts.RESOLVED} />
          <StatTile label="Unassigned" value={unassignedCount} />
        </div>

        {counts.ALL === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No requests yet"
            description="Once people start reporting problems they will all appear here."
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusFilter
                basePath="/admin"
                active={activeStatus}
                counts={counts}
                params={onlyUnassigned ? { unassigned: "1" } : {}}
              />

              <Link
                href={onlyUnassigned ? "/admin" : "/admin?unassigned=1"}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                  onlyUnassigned
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line-strong bg-surface text-muted hover:border-brand-300 hover:text-ink"
                }`}
              >
                <UserX className="size-4" aria-hidden="true" />
                Unassigned only
              </Link>
            </div>

            {visible.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Nothing to show"
                description="No requests match this view. Try clearing the status filter or the unassigned-only toggle."
              />
            ) : (
              <>
                <TicketList tickets={visible} hrefBase="/admin/tickets" showRequester showAssignee />
                <Pagination
                  basePath="/admin"
                  page={currentPage}
                  totalPages={totalPages}
                  total={total}
                  pageSize={PAGE_SIZE}
                  params={params}
                />
              </>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
