import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketDetail } from "@/components/tickets/ticket-detail";
import { getTicketByReference, getTechnicians } from "@/lib/tickets";
import { normalizeReference } from "@/lib/reference";
import { requireUser, roleOf } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  const { reference } = await params;
  return { title: reference };
}

export default async function MyRequestPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const user = await requireUser();
  const { reference } = await params;

  const ticket = await getTicketByReference(normalizeReference(reference));

  if (!ticket) {
    notFound();
  }

  const role = roleOf(user);
  const isStaff = role === "admin" || role === "technician";

  // Ownership is checked here, on the server. Without this any signed-in user could
  // read another person's request simply by typing its reference into the URL.
  if (ticket.userId !== user.id && !isStaff) {
    notFound();
  }

  const canUpdateStatus =
    role === "admin" || (role === "technician" && ticket.assignedToId === user.id);

  // Nobody owns it yet, so any staff member can take it on.
  const canClaim = isStaff && ticket.assignedToId === null;

  return (
    <TicketDetail
      ticket={ticket}
      role={role}
      canUpdateStatus={canUpdateStatus}
      canClaim={canClaim}
      technicians={role === "admin" ? await getTechnicians() : undefined}
      backHref="/my-requests"
      backLabel="Back to My Requests"
    />
  );
}
