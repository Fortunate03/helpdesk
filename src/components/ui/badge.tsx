import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "pending" | "progress" | "resolved" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-canvas text-muted border-line-strong",
  brand: "bg-brand-50 text-brand-700 border-brand-200",
  pending: "bg-pending-bg text-pending-fg border-pending-line",
  progress: "bg-progress-bg text-progress-fg border-progress-line",
  resolved: "bg-resolved-bg text-resolved-fg border-resolved-line",
  danger: "bg-danger-bg text-danger-fg border-danger-line",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
