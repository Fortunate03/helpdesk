"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { ticketComments, ticketEvents, tickets } from "@/db/schema";
import { nextTechnicianInRotation } from "@/lib/assignment";
import { generateReference } from "@/lib/reference";
import { getCurrentUser, isStaff, roleOf } from "@/lib/session";
import {
  assignTicketSchema,
  commentSchema,
  fieldErrors,
  submitTicketSchema,
  updateStatusSchema,
} from "@/lib/validation";

export type FormState = {
  errors?: Record<string, string>;
  message?: string;
};


/**
 * Every route that can show a request's status. Kept in one place because these were
 * previously listed per action, and the requester's own list was missed, so it went on
 * showing Pending after a technician had resolved the request.
 */
function revalidateTicket(reference: string) {
  revalidatePath("/my-requests");
  revalidatePath(`/my-requests/${reference}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/tickets/${reference}`);
  revalidatePath("/tech");
  revalidatePath("/track");
}


/** Postgres 23505: the unique index on tickets.reference rejected a duplicate. */
function isDuplicateReference(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function submitTicket(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = submitTicketSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const user = await getCurrentUser();
  let reference: string | undefined;

  // References are random, so a clash is vanishingly unlikely rather than impossible.
  // A fresh one is generated per attempt, and the unique index is what actually
  // decides; this just turns an astronomically rare collision into a retry.
  for (let attempt = 0; attempt < 3 && reference === undefined; attempt += 1) {
    try {
      reference = await db.transaction(async (tx) => {
        // Requests go straight into a technician's queue rather than sitting
        // unassigned waiting for an administrator to hand them out.
        const assignedToId = await nextTechnicianInRotation(tx);

        const [ticket] = await tx
          .insert(tickets)
          .values({
            ...parsed.data,
            reference: generateReference(),
            assignedToId,
            userId: user?.id ?? null,
            // For a signed-in user the account is the source of truth. The form posts
            // these fields too, so without this override someone could log a request
            // under another person's name and address.
            fullName: user?.name ?? parsed.data.fullName,
            email: user?.email ?? parsed.data.email,
          })
          .returning({ id: tickets.id, reference: tickets.reference });

        await tx.insert(ticketEvents).values({
          ticketId: ticket.id,
          type: "CREATED",
          toStatus: "PENDING",
          actorName: user?.name ?? parsed.data.fullName,
          detail: user ? null : "Submitted without an account",
        });

        if (assignedToId) {
          const assignee = await tx.query.user.findFirst({
            where: (table, { eq: matches }) => matches(table.id, assignedToId),
            columns: { name: true },
          });

          await tx.insert(ticketEvents).values({
            ticketId: ticket.id,
            type: "ASSIGNED",
            actorName: "Help desk",
            detail: `Automatically assigned to ${assignee?.name ?? "a technician"}`,
          });
        }

        return ticket.reference;
      });
    } catch (error) {
      if (isDuplicateReference(error) && attempt < 2) continue;

      console.error("submitTicket failed", error);
      return { message: "We could not save your request. Please try again in a moment." };
    }
  }

  if (reference === undefined) {
    return { message: "We could not save your request. Please try again in a moment." };
  }

  revalidateTicket(reference);
  redirect(`/submit/success?ref=${reference}`);
}

export async function addComment(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = commentSchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
    isInternal: formData.get("isInternal") === "on",
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { message: "Please sign in to reply to a request." };
  }

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, parsed.data.ticketId),
    columns: { id: true, userId: true, assignedToId: true, reference: true },
  });

  if (!ticket) {
    return { message: "That request no longer exists." };
  }

  const staff = isStaff(user);
  const owns = ticket.userId === user.id;

  if (!staff && !owns) {
    return { message: "You do not have access to this request." };
  }

  // Only staff may write internal notes, regardless of what the form posted.
  const isInternal = staff && parsed.data.isInternal === true;

  await db.transaction(async (tx) => {
    await tx.insert(ticketComments).values({
      ticketId: ticket.id,
      authorId: user.id,
      authorName: user.name,
      body: parsed.data.body,
      isInternal,
    });

    await tx.insert(ticketEvents).values({
      ticketId: ticket.id,
      type: "COMMENTED",
      actorName: user.name,
      detail: isInternal ? "Added an internal note" : null,
    });

    await tx.update(tickets).set({ updatedAt: new Date() }).where(eq(tickets.id, ticket.id));
  });

  revalidateTicket(ticket.reference);

  return { message: "" };
}

export async function updateStatus(formData: FormData): Promise<void> {
  const parsed = updateStatusSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
  });

  if (!parsed.success) return;

  const user = await getCurrentUser();

  if (!user || !isStaff(user)) {
    throw new Error("Not authorised to change the status of a request.");
  }

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, parsed.data.ticketId),
    columns: { id: true, status: true, reference: true, assignedToId: true },
  });

  if (!ticket || ticket.status === parsed.data.status) return;

  // A technician may only work tickets assigned to them; admins may work any.
  if (roleOf(user) === "technician" && ticket.assignedToId !== user.id) {
    throw new Error("This request is not assigned to you.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(tickets)
      .set({
        status: parsed.data.status,
        updatedAt: new Date(),
        resolvedAt: parsed.data.status === "RESOLVED" ? new Date() : null,
      })
      .where(eq(tickets.id, ticket.id));

    await tx.insert(ticketEvents).values({
      ticketId: ticket.id,
      type: "STATUS_CHANGED",
      fromStatus: ticket.status,
      toStatus: parsed.data.status,
      actorName: user.name,
    });
  });

  revalidateTicket(ticket.reference);
}

export async function assignTicket(formData: FormData): Promise<void> {
  const parsed = assignTicketSchema.safeParse({
    ticketId: formData.get("ticketId"),
    assigneeId: formData.get("assigneeId") ?? "",
  });

  if (!parsed.success) return;

  const user = await getCurrentUser();

  if (!user || roleOf(user) !== "admin") {
    throw new Error("Only administrators can assign requests.");
  }

  const assigneeId = parsed.data.assigneeId || null;

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, parsed.data.ticketId),
    columns: { id: true, reference: true, status: true },
  });

  if (!ticket) return;

  const assignee = assigneeId
    ? await db.query.user.findFirst({ where: (u, { eq: matches }) => matches(u.id, assigneeId) })
    : null;

  await db.transaction(async (tx) => {
    await tx
      .update(tickets)
      .set({
        assignedToId: assigneeId,
        updatedAt: new Date(),
        // Picking up an unassigned request is the point at which work starts.
        status: assigneeId && ticket.status === "PENDING" ? "IN_PROGRESS" : ticket.status,
      })
      .where(eq(tickets.id, ticket.id));

    await tx.insert(ticketEvents).values({
      ticketId: ticket.id,
      type: "ASSIGNED",
      actorName: user.name,
      detail: assignee ? `Assigned to ${assignee.name}` : "Assignment cleared",
    });
  });

  revalidateTicket(ticket.reference);
}


/**
 * Lets a technician take an unassigned request. Without this the only route to a
 * resolution was an administrator assigning the request first, which left technicians
 * unable to act on anything sitting in the unassigned queue.
 */
export async function claimTicket(formData: FormData): Promise<void> {
  const ticketId = String(formData.get("ticketId") ?? "");
  const user = await getCurrentUser();

  if (!user || !isStaff(user)) {
    throw new Error("Only help desk staff can claim a request.");
  }

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
    columns: { id: true, reference: true, status: true, assignedToId: true },
  });

  if (!ticket) return;

  // Claiming is only for work nobody owns; reassignment stays an admin decision.
  if (ticket.assignedToId) {
    throw new Error("This request is already assigned.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(tickets)
      .set({
        assignedToId: user.id,
        status: ticket.status === "PENDING" ? "IN_PROGRESS" : ticket.status,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticket.id));

    await tx.insert(ticketEvents).values({
      ticketId: ticket.id,
      type: "ASSIGNED",
      actorName: user.name,
      detail: `Claimed by ${user.name}`,
      createdAt: new Date(),
    });

    if (ticket.status === "PENDING") {
      await tx.insert(ticketEvents).values({
        ticketId: ticket.id,
        type: "STATUS_CHANGED",
        fromStatus: "PENDING",
        toStatus: "IN_PROGRESS",
        actorName: user.name,
      });
    }
  });

  revalidateTicket(ticket.reference);
}

/** Used by the public tracker, which must never expose more than status information. */
export async function findTicketByReference(reference: string) {
  return db.query.tickets.findFirst({
    where: and(eq(tickets.reference, reference)),
    columns: {
      reference: true,
      category: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      resolvedAt: true,
    },
  });
}
