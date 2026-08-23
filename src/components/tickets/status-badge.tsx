import { CheckCircle2, Clock, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Priority, TicketStatus } from "@/db/schema";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Each status carries an icon as well as a colour. Relying on colour alone would
 * make the three states indistinguishable to colour-blind users and in print.
 */
const STATUS_META = {
  PENDING: { tone: "pending", Icon: Clock },
  IN_PROGRESS: { tone: "progress", Icon: Loader },
  RESOLVED: { tone: "resolved", Icon: CheckCircle2 },
} as const;

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  const { tone, Icon } = STATUS_META[status];

  return (
    <Badge tone={tone} className={className}>
      <Icon className="size-3.5" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const PRIORITY_TONE = {
  LOW: "bg-canvas text-muted border-line-strong",
  MEDIUM: "bg-brand-50 text-brand-700 border-brand-200",
  HIGH: "bg-pending-bg text-pending-fg border-pending-line",
  URGENT: "bg-danger-bg text-danger-fg border-danger-line",
} as const satisfies Record<Priority, string>;

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        PRIORITY_TONE[priority],
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
