import Link from "next/link";
import type { TicketStatus } from "@/db/schema";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Plain links rather than client-side state: the active filter lives in the URL,
 * so a filtered view can be shared, bookmarked and restored by the back button.
 */
export function StatusFilter({
  basePath,
  active,
  counts,
  params = {},
}: {
  basePath: string;
  active?: TicketStatus;
  counts: Record<TicketStatus, number> & { ALL: number };
  params?: Record<string, string>;
}) {
  const options: Array<{ value?: TicketStatus; label: string; count: number }> = [
    { label: "All", count: counts.ALL },
    { value: "PENDING", label: STATUS_LABELS.PENDING, count: counts.PENDING },
    { value: "IN_PROGRESS", label: STATUS_LABELS.IN_PROGRESS, count: counts.IN_PROGRESS },
    { value: "RESOLVED", label: STATUS_LABELS.RESOLVED, count: counts.RESOLVED },
  ];

  const hrefFor = (value?: TicketStatus) => {
    const search = new URLSearchParams(params);
    if (value) search.set("status", value);
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === active;

        return (
          <Link
            key={option.label}
            href={hrefFor(option.value)}
            aria-current={selected ? "true" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
              selected
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line-strong bg-surface text-muted hover:border-brand-300 hover:text-ink",
            )}
          >
            {option.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                selected ? "bg-white/20" : "bg-canvas",
              )}
            >
              {option.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
