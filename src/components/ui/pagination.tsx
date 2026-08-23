import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The page lives in the URL rather than in component state, so a given page can be
 * shared, bookmarked and restored by the back button.
 */
export function Pagination({
  basePath,
  page,
  totalPages,
  total,
  pageSize,
  params = {},
  label = "requests",
}: {
  basePath: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  params?: Record<string, string>;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams(params);
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted">
        Showing <span className="font-medium text-ink">{first}</span> to{" "}
        <span className="font-medium text-ink">{last}</span> of{" "}
        <span className="font-medium text-ink">{total}</span> {label}
      </p>

      <div className="flex items-center gap-1.5">
        <PageArrow
          href={href(page - 1)}
          disabled={page <= 1}
          label="Previous page"
          icon={ChevronLeft}
        />

        {pageNumbers(page, totalPages).map((entry, index) =>
          entry === "gap" ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-muted" aria-hidden="true">
              &hellip;
            </span>
          ) : (
            <Link
              key={entry}
              href={href(entry)}
              aria-current={entry === page ? "page" : undefined}
              aria-label={`Page ${entry}`}
              className={cn(
                "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-medium tabular-nums transition-colors",
                entry === page
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line-strong bg-surface text-ink hover:border-brand-300",
              )}
            >
              {entry}
            </Link>
          ),
        )}

        <PageArrow
          href={href(page + 1)}
          disabled={page >= totalPages}
          label="Next page"
          icon={ChevronRight}
        />
      </div>
    </nav>
  );
}

function PageArrow({
  href,
  disabled,
  label,
  icon: Icon,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: typeof ChevronLeft;
}) {
  const styles = "grid size-9 place-items-center rounded-lg border text-ink transition-colors";

  // A disabled control must not stay in the tab order, so render a span rather than
  // a link that goes nowhere.
  if (disabled) {
    return (
      <span aria-hidden="true" className={cn(styles, "border-line bg-canvas text-muted/50")}>
        <Icon className="size-4" />
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} className={cn(styles, "border-line-strong bg-surface hover:border-brand-300")}>
      <Icon className="size-4" aria-hidden="true" />
    </Link>
  );
}

/** First and last pages always shown, with the current page and its neighbours. */
function pageNumbers(page: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const visible = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  const result: Array<number | "gap"> = [];
  let previous = 0;

  for (const current of visible) {
    if (previous && current - previous > 1) result.push("gap");
    result.push(current);
    previous = current;
  }

  return result;
}
