import { eq } from "drizzle-orm";
import { Inbox, Plus } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { StatusFilter } from "@/components/tickets/status-filter";
import { TicketList, type TicketRow } from "@/components/tickets/ticket-list";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ticketStatusEnum, tickets, type TicketStatus } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { PAGE_SIZE, listTickets, parsePage } from "@/lib/tickets";

export const metadata: Metadata = {
  title: "My Requests",
  description: "View and track the ICT support requests you have submitted.",
};

export default async function MyRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; denied?: string; page?: string }>;
}) {
  const user = await requireUser();
  const { status, denied, page } = await searchParams;

  const activeStatus = ticketStatusEnum.enumValues.includes(status as TicketStatus)
    ? (status as TicketStatus)
    : undefined;

  const currentPage = parsePage(page);

  const { rows, counts, total, totalPages } = await listTickets({
    scope: eq(tickets.userId, user.id),
    status: activeStatus,
    page: currentPage,
  });

  const visible: TicketRow[] = rows.map((row) => ({
    reference: row.reference,
    category: row.category,
    status: row.status,
    priority: row.priority,
    createdAt: row.createdAt,
    description: row.description,
    assigneeName: row.assignee?.name ?? null,
  }));

  return (
    <>
      <PageHeader
        title="My Requests"
        description="Everything you have submitted, newest first. Select a request to see its full history."
        action={
          <ButtonLink href="/submit">
            <Plus className="size-4.5" aria-hidden="true" />
            New Request
          </ButtonLink>
        }
      />

      <Container className="space-y-6 py-8 lg:py-12">
        {denied ? (
          <Alert tone="warning" title="Not available to your account">
            That area is limited to help desk staff.
          </Alert>
        ) : null}

        {counts.ALL === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No requests yet"
            description="When you report a problem it will appear here, along with its reference number and current status."
            action={
              <ButtonLink href="/submit">
                <Plus className="size-4.5" aria-hidden="true" />
                Submit your first request
              </ButtonLink>
            }
          />
        ) : (
          <>
            <StatusFilter basePath="/my-requests" active={activeStatus} counts={counts} />

            {visible.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Nothing to show"
                description="No requests match this filter. Try selecting All to see everything."
              />
            ) : (
              <>
                <TicketList tickets={visible} hrefBase="/my-requests" showAssignee />
                <Pagination
                  basePath="/my-requests"
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
      </Container>
    </>
  );
}
