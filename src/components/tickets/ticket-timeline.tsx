import type { TicketComment, TicketEvent } from "@/db/schema";
import { STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

type Entry =
  | { kind: "event"; at: Date; data: TicketEvent }
  | { kind: "comment"; at: Date; data: TicketComment };

/**
 * Events and replies are merged into one feed so the request reads chronologically,
 * rather than making the reader stitch two separate lists together.
 */
export function TicketTimeline({
  events,
  comments,
}: {
  events: TicketEvent[];
  comments: TicketComment[];
}) {
  const entries: Entry[] = [
    // COMMENTED events are dropped: the comment itself is already in the feed and
    // showing both would duplicate every reply.
    ...events
      .filter((event) => event.type !== "COMMENTED")
      .map((event) => ({ kind: "event" as const, at: event.createdAt, data: event })),
    ...comments.map((comment) => ({ kind: "comment" as const, at: comment.createdAt, data: comment })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  return (
    <ol className="space-y-4">
      {entries.map((entry) => {
        if (entry.kind === "comment") {
          const comment = entry.data;

          return (
            <li
              key={`comment-${comment.id}`}
              className={`rounded-card border p-4 ${
                comment.isInternal ? "border-pending-line bg-pending-bg" : "border-line bg-surface"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-semibold text-ink-strong">{comment.authorName}</p>
                <time dateTime={comment.createdAt.toISOString()} className="text-xs text-muted">
                  {formatDateTime(comment.createdAt)}
                </time>
              </div>

              {comment.isInternal ? (
                <p className="mt-1 text-xs font-medium text-pending-fg">
                  Internal note, not visible to the requester
                </p>
              ) : null}

              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-ink">
                {comment.body}
              </p>
            </li>
          );
        }

        const event = entry.data;

        return (
          <li key={`event-${event.id}`} className="px-1">
            <p className="text-sm text-ink">
              <span className="font-medium">{event.actorName}</span>{" "}
              {event.type === "CREATED" ? "submitted this request" : null}
              {event.type === "STATUS_CHANGED" ? (
                <>
                  changed the status
                  {event.fromStatus ? (
                    <> from <span className="font-medium">{STATUS_LABELS[event.fromStatus]}</span></>
                  ) : null}
                  {event.toStatus ? (
                    <> to <span className="font-medium">{STATUS_LABELS[event.toStatus]}</span></>
                  ) : null}
                </>
              ) : null}
              {event.type === "ASSIGNED" ? (event.detail ?? "updated the assignment") : null}
            </p>
            <time dateTime={event.createdAt.toISOString()} className="text-xs text-muted">
              {formatDateTime(event.createdAt)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
