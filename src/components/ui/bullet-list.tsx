import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The marker sits in a box exactly one line tall and is centred within it, so it
 * aligns with the first line of text at any font size. A fixed top margin only
 * matches one particular size and drifts as soon as the type scale changes.
 */
export function BulletList({
  items,
  className,
  dotClassName = "bg-brand-500",
}: {
  items: ReactNode[];
  className?: string;
  dotClassName?: string;
}) {
  return (
    <ul className={cn("space-y-3 text-sm leading-relaxed", className)}>
      {items.map((item, index) => (
        <li key={index} className="flex gap-2.5">
          <span className="flex h-[1.625em] shrink-0 items-center" aria-hidden="true">
            <span className={cn("size-1.5 rounded-full", dotClassName)} />
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}
