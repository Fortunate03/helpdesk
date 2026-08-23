import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PriorityBadge, StatusBadge } from "@/components/tickets/status-badge";
import type { Category, Priority, TicketStatus } from "@/db/schema";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export type TicketRow = {
  reference: string;
  category: Category;
  status: TicketStatus;
  priority: Priority;
  createdAt: Date;
  description: string;
  requesterName?: string | null;
  assigneeName?: string | null;
};

/**
 * The same rows are shown as cards below `md` and as a table above it. Two
 * presentations of one dataset rather than a table forced to scroll sideways
 * on a phone, which is where most requests are actually logged from.
 */
export function TicketList({
  tickets,
  hrefBase,
  showRequester = false,
  showAssignee = false,
}: {
  tickets: TicketRow[];
  hrefBase: string;
  showRequester?: boolean;
  showAssignee?: boolean;
}) {
  return (
    <>
      <ul className="space-y-3 md:hidden">
        {tickets.map((ticket) => (
          <li key={ticket.reference}>
            <Link
              href={`${hrefBase}/${ticket.reference}`}
              className="block rounded-card border border-line bg-surface p-4 shadow-card transition-colors hover:border-brand-300"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-sm font-semibold text-ink-strong">
                  {ticket.reference}
                </span>
                <StatusBadge status={ticket.status} />
              </div>

              <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted">
                {ticket.description}
              </p>

              <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3 text-xs text-muted">
                <span className="font-medium text-ink">{CATEGORY_LABELS[ticket.category]}</span>
                <span aria-hidden="true">·</span>
                <span>{formatDate(ticket.createdAt)}</span>
                {showRequester && ticket.requesterName ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{ticket.requesterName}</span>
                  </>
                ) : null}
                {showAssignee ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{ticket.assigneeName ?? "Unassigned"}</span>
                  </>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-card border border-line bg-surface shadow-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas">
              <tr className="text-xs tracking-wide text-muted uppercase">
                <th scope="col" className="px-5 py-3.5 font-medium">Request No.</th>
                <th scope="col" className="px-5 py-3.5 font-medium">Issue</th>
                {showRequester ? (
                  <th scope="col" className="px-5 py-3.5 font-medium">Requester</th>
                ) : null}
                {showAssignee ? (
                  <th scope="col" className="px-5 py-3.5 font-medium">Assigned to</th>
                ) : null}
                <th scope="col" className="px-5 py-3.5 font-medium">Priority</th>
                <th scope="col" className="px-5 py-3.5 font-medium">Status</th>
                <th scope="col" className="px-5 py-3.5 font-medium">Submitted</th>
                <th scope="col" className="px-5 py-3.5">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {tickets.map((ticket) => (
                <tr key={ticket.reference} className="transition-colors hover:bg-canvas">
                  <td className="px-5 py-4 align-top">
                    <Link
                      href={`${hrefBase}/${ticket.reference}`}
                      className="font-mono font-semibold text-ink-strong hover:text-brand-700"
                    >
                      {ticket.reference}
                    </Link>
                  </td>
                  <td className="max-w-xs px-5 py-4 align-top">
                    <p className="font-medium text-ink">{CATEGORY_LABELS[ticket.category]}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{ticket.description}</p>
                  </td>
                  {showRequester ? (
                    <td className="px-5 py-4 align-top text-muted">{ticket.requesterName ?? "-"}</td>
                  ) : null}
                  {showAssignee ? (
                    <td className="px-5 py-4 align-top text-muted">
                      {ticket.assigneeName ?? <span className="text-muted/70">Unassigned</span>}
                    </td>
                  ) : null}
                  <td className="px-5 py-4 align-top">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-5 py-4 align-top">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-5 py-4 align-top whitespace-nowrap text-muted">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right align-top">
                    <Link
                      href={`${hrefBase}/${ticket.reference}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
                    >
                      View
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
