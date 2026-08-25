import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketDetail } from "@/components/tickets/ticket-detail";
import { normalizeReference } from "@/lib/reference";
import { requireRole, roleOf } from "@/lib/session";
import { getTechnicians, getTicketByReference } from "@/lib/tickets";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  const { reference } = await params;
  return { title: reference };
}

/**
 * The queue's own view of a request, so the way back from a ticket is the queue the
 * technician opened it from rather than their personal request list.
 */
export default async function TechTicketPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const user = await requireRole(["technician", "admin"]);
  const { reference } = await params;

  const ticket = await getTicketByReference(normalizeReference(reference));

  if (!ticket) {
    notFound();
  }

  const role = roleOf(user);

  return (
    <TicketDetail
      ticket={ticket}
      role={role}
      // A technician acts on the requests they hold; an administrator on any of them.
      canUpdateStatus={role === "admin" || ticket.assignedToId === user.id}
      canClaim={ticket.assignedToId === null}
      technicians={role === "admin" ? await getTechnicians() : undefined}
      backHref="/tech"
      backLabel="Back to the queue"
    />
  );
}
