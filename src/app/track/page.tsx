import { CalendarDays, FileSearch, Search, Tag } from "lucide-react";
import type { Metadata } from "next";
import { findTicketByReference } from "@/actions/tickets";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/tickets/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { CATEGORY_LABELS, STATUS_DESCRIPTIONS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { trackTicketSchema } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Track a Request",
  description: "Check the status of an ICT support request using its reference number.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  const parsed = reference ? trackTicketSchema.safeParse({ reference }) : null;
  const ticket = parsed?.success ? await findTicketByReference(parsed.data.reference) : null;

  return (
    <>
      <PageHeader
        title="Track a Request"
        description="Enter the reference number you were given when you submitted the request."
      />

      <Container className="flex justify-center py-10 lg:py-14">
        <div className="w-full max-w-xl space-y-6">
          <Card>
            <CardContent className="p-6 sm:p-8">
              {/* A GET form keeps the reference in the URL, so a lookup can be bookmarked. */}
              <form method="get" className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="reference" className="block text-sm font-medium text-ink">
                    Reference number
                  </label>
                  <input
                    id="reference"
                    name="reference"
                    defaultValue={reference ?? ""}
                    placeholder="7K2QX9M4TB0R"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={parsed && !parsed.success ? true : undefined}
                    aria-describedby="reference-hint"
                    className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 font-mono text-sm tracking-tight text-ink transition-colors placeholder:font-sans placeholder:text-muted/70 hover:border-brand-300 focus:border-brand-500"
                  />
                  <p id="reference-hint" className="text-xs text-muted">
                    Twelve letters and digits, shown when you submitted the request. Case and spacing do not matter.
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  <Search className="size-4.5" aria-hidden="true" />
                  Check status
                </Button>
              </form>
            </CardContent>
          </Card>

          {parsed && !parsed.success ? (
            <Alert tone="warning" title="That does not look like a reference number">
              {parsed.error.issues[0]?.message}
            </Alert>
          ) : null}

          {parsed?.success && !ticket ? (
            <Alert tone="error" title="No request found">
              We could not find a request with reference{" "}
              <span className="font-mono">{parsed.data.reference}</span>. Check the number and try
              again, or contact the help desk if you think it should exist.
            </Alert>
          ) : null}

          {ticket ? (
            <Card>
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium tracking-wider text-muted uppercase">
                      Reference
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold text-ink-strong">
                      {ticket.reference}
                    </p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>

                <p className="mt-5 rounded-lg bg-canvas p-4 text-sm leading-relaxed text-muted">
                  {STATUS_DESCRIPTIONS[ticket.status]}
                </p>

                <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
                  <div className="flex gap-2.5">
                    <Tag className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                    <div>
                      <dt className="text-xs text-muted">Category</dt>
                      <dd className="text-sm font-medium text-ink">
                        {CATEGORY_LABELS[ticket.category]}
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                    <div>
                      <dt className="text-xs text-muted">Submitted</dt>
                      <dd className="text-sm font-medium text-ink">
                        {formatDateTime(ticket.createdAt)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <FileSearch className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                    <div>
                      <dt className="text-xs text-muted">Last updated</dt>
                      <dd className="text-sm font-medium text-ink">
                        {formatDateTime(ticket.updatedAt)}
                      </dd>
                    </div>
                  </div>
                  {ticket.resolvedAt ? (
                    <div className="flex gap-2.5">
                      <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                      <div>
                        <dt className="text-xs text-muted">Resolved</dt>
                        <dd className="text-sm font-medium text-ink">
                          {formatDateTime(ticket.resolvedAt)}
                        </dd>
                      </div>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-6 border-t border-line pt-6">
                  <p className="text-sm text-muted">
                    Want the full history, including replies from the technician?
                  </p>
                  <ButtonLink href="/login" variant="outline" size="sm" className="mt-3">
                    Sign in to see details
                  </ButtonLink>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </Container>
    </>
  );
}
