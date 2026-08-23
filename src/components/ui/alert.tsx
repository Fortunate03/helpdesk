import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "error";

const TONES: Record<Tone, string> = {
  info: "bg-progress-bg text-progress-fg border-progress-line",
  success: "bg-resolved-bg text-resolved-fg border-resolved-line",
  warning: "bg-pending-bg text-pending-fg border-pending-line",
  error: "bg-danger-bg text-danger-fg border-danger-line",
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
  ...props
}: Omit<ComponentProps<"div">, "title"> & { tone?: Tone; title?: string }) {
  return (
    <div
      // Errors need to reach screen readers when they appear after a failed submit.
      // With no icon, the title and message text carry the meaning on their own.
      role={tone === "error" ? "alert" : "status"}
      className={cn("space-y-1 rounded-lg border p-4 text-sm", TONES[tone], className)}
      {...props}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className="leading-relaxed">{children}</div> : null}
    </div>
  );
}
