import { ArrowLeft, Building2, CalendarDays, Mail, Tag, User } from "lucide-react";
import Link from "next/link";
import { CommentForm } from "@/components/tickets/comment-form";
import { PriorityBadge, StatusBadge } from "@/components/tickets/status-badge";
import { ManageRequestDialog } from "@/components/tickets/manage-request-dialog";
import { AssignControl, ClaimControl, StatusControl } from "@/components/tickets/ticket-controls";
import { TicketTimeline } from "@/components/tickets/ticket-timeline";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import {
  CATEGORY_LABELS,
  DEPARTMENT_LABELS,
  STATUS_DESCRIPTIONS,
} from "@/lib/constants";
import type { Role } from "@/lib/permissions";
import type { TicketWithHistory } from "@/lib/tickets";
import { formatDateTime } from "@/lib/utils";

export function TicketDetail({
  ticket,
  role,
  canUpdateStatus,
  canClaim = false,
  technicians,
  backHref,
  backLabel,
}: {
  ticket: TicketWithHistory;
  role: Role;
  canUpdateStatus: boolean;
  canClaim?: boolean;
  technicians?: Array<{ id: string; name: string; role: string | null }>;
  backHref: string;
  backLabel: string;
}) {
  const isStaff = role === "admin" || role === "technician";

  // Internal notes are filtered out server-side rather than hidden with CSS, so
  // they never reach the requester's browser at all.
  const visibleComments = isStaff
    ? ticket.comments
    : ticket.comments.filter((comment) => !comment.isInternal);

  return (
    <Container className="py-8 lg:py-12">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-semibold sm:text-3xl">{ticket.reference}</h1>
          <p className="mt-2 text-sm text-muted">
            {CATEGORY_LABELS[ticket.category]} · Submitted {formatDateTime(ticket.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
                Description of the problem
              </h2>
              <p className="mt-3 leading-relaxed whitespace-pre-wrap text-ink">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-semibold text-ink-strong">Activity</h2>
              <p className="mt-1 text-sm text-muted">
                Everything that has happened on this request, oldest first.
              </p>

              <div className="mt-6">
                <TicketTimeline events={ticket.events} comments={visibleComments} />
              </div>

              <div className="mt-8 border-t border-line pt-6">
                <CommentForm ticketId={ticket.id} canPostInternal={isStaff} />
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
                Current status
              </h2>
              <div className="mt-3">
                <StatusBadge status={ticket.status} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {STATUS_DESCRIPTIONS[ticket.status]}
              </p>

              {/* Moved behind a dialog so the details below sit higher on the page. */}
              {canClaim || canUpdateStatus || role === "admin" ? (
                <div className="mt-5 border-t border-line pt-5">
                  <ManageRequestDialog>
                    {canClaim ? <ClaimControl ticketId={ticket.id} /> : null}

                    {canUpdateStatus ? (
                      <StatusControl ticketId={ticket.id} current={ticket.status} />
                    ) : null}

                    {role === "admin" && technicians ? (
                      <AssignControl
                        ticketId={ticket.id}
                        current={ticket.assignedToId}
                        technicians={technicians}
                      />
                    ) : null}
                  </ManageRequestDialog>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Details</h2>

              <dl className="mt-4 space-y-4 text-sm">
                <Detail icon={Tag} label="Category" value={CATEGORY_LABELS[ticket.category]} />
                <Detail
                  icon={Building2}
                  label="Department"
                  value={DEPARTMENT_LABELS[ticket.department]}
                />
                <Detail
                  icon={User}
                  label="Assigned to"
                  value={ticket.assignee?.name ?? "Not yet assigned"}
                />
                <Detail icon={CalendarDays} label="Last updated" value={formatDateTime(ticket.updatedAt)} />
                {ticket.resolvedAt ? (
                  <Detail
                    icon={CalendarDays}
                    label="Resolved"
                    value={formatDateTime(ticket.resolvedAt)}
                  />
                ) : null}
              </dl>
            </CardContent>
          </Card>

          {isStaff ? (
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
                  Requester
                </h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <Detail icon={User} label="Name" value={ticket.fullName} />
                  <Detail icon={Mail} label="Email" value={ticket.email} />
                  {!ticket.userId ? (
                    <p className="rounded-lg bg-canvas p-3 text-xs leading-relaxed text-muted">
                      Submitted without an account, so the requester can only follow this through
                      the public tracker.
                    </p>
                  ) : null}
                </dl>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </Container>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="font-medium break-words text-ink">{value}</dd>
      </div>
    </div>
  );
}
