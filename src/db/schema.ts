import { relations } from "drizzle-orm";
import { boolean, index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { generateReference } from "@/lib/reference";
import { account, session, user } from "./auth-schema";

export * from "./auth-schema";

export const ticketStatusEnum = pgEnum("ticket_status", ["PENDING", "IN_PROGRESS", "RESOLVED"]);
export const priorityEnum = pgEnum("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const categoryEnum = pgEnum("category", [
  "HARDWARE",
  "SOFTWARE",
  "NETWORK",
  "ACCOUNT_ACCESS",
  "EMAIL",
  "PRINTING",
  "OTHER",
]);
export const departmentEnum = pgEnum("department", [
  "ADMINISTRATION",
  "ACADEMIC_STAFF",
  "STUDENT_SERVICES",
  "FINANCE",
  "LIBRARY",
  "IT",
  "STUDENT",
  "OTHER",
]);
export const eventTypeEnum = pgEnum("event_type", [
  "CREATED",
  "STATUS_CHANGED",
  "ASSIGNED",
  "COMMENTED",
]);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Random, not sequential: a counter would let anyone enumerate every request
    // through the public tracker. See src/lib/reference.ts.
    reference: text("reference").notNull().unique().$defaultFn(generateReference),

    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    department: departmentEnum("department").notNull(),
    category: categoryEnum("category").notNull(),
    description: text("description").notNull(),
    status: ticketStatusEnum("status").notNull().default("PENDING"),
    priority: priorityEnum("priority").notNull().default("MEDIUM"),

    // Null when submitted by a guest. Such tickets are reachable only via /track.
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    assignedToId: text("assigned_to_id").references(() => user.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    index("tickets_status_idx").on(table.status),
    index("tickets_user_id_idx").on(table.userId),
    index("tickets_assigned_to_id_idx").on(table.assignedToId),
    index("tickets_created_at_idx").on(table.createdAt),
  ],
);

export const ticketComments = pgTable(
  "ticket_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),

    // Kept alongside authorId so the comment still reads correctly if the account is deleted.
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),

    // Internal notes are visible to technicians and admins only, never to the requester.
    isInternal: boolean("is_internal").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("ticket_comments_ticket_id_idx").on(table.ticketId)],
);

export const ticketEvents = pgTable(
  "ticket_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    type: eventTypeEnum("type").notNull(),
    fromStatus: ticketStatusEnum("from_status"),
    toStatus: ticketStatusEnum("to_status"),
    actorName: text("actor_name").notNull(),
    detail: text("detail"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("ticket_events_ticket_id_idx").on(table.ticketId)],
);

// Tickets reference `user` twice (requester and assignee), so both sides of each
// relation carry a relationName, without which Drizzle cannot tell them apart.
export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  requester: one(user, {
    fields: [tickets.userId],
    references: [user.id],
    relationName: "requester",
  }),
  assignee: one(user, {
    fields: [tickets.assignedToId],
    references: [user.id],
    relationName: "assignee",
  }),
  comments: many(ticketComments),
  events: many(ticketEvents),
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketComments.ticketId], references: [tickets.id] }),
  author: one(user, { fields: [ticketComments.authorId], references: [user.id] }),
}));

export const ticketEventsRelations = relations(ticketEvents, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketEvents.ticketId], references: [tickets.id] }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  submittedTickets: many(tickets, { relationName: "requester" }),
  assignedTickets: many(tickets, { relationName: "assignee" }),
  comments: many(ticketComments),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketComment = typeof ticketComments.$inferSelect;
export type TicketEvent = typeof ticketEvents.$inferSelect;
export type TicketStatus = (typeof ticketStatusEnum.enumValues)[number];
export type Category = (typeof categoryEnum.enumValues)[number];
export type Department = (typeof departmentEnum.enumValues)[number];
export type Priority = (typeof priorityEnum.enumValues)[number];
