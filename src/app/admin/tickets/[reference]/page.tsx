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

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const user = await requireRole(["admin"]);
  const { reference } = await params;

  const [ticket, technicians] = await Promise.all([
    getTicketByReference(normalizeReference(reference)),
    getTechnicians(),
  ]);

  if (!ticket) {
    notFound();
  }

  return (
    <TicketDetail
      ticket={ticket}
      role={roleOf(user)}
      canUpdateStatus
      canClaim={ticket.assignedToId === null}
      technicians={technicians}
      backHref="/admin"
      backLabel="Back to dashboard"
    />
  );
}
