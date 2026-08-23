import { ArrowRight, Search } from "lucide-react";
import { isValidReference } from "@/lib/reference";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyReference } from "@/components/tickets/copy-reference";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SITE } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Request submitted",
};

const STEPS = [
  {
    key: "pending",
    body: (
      <>
        Your request sits at <strong className="font-medium text-ink">Pending</strong> until a
        technician picks it up, usually within one working day.
      </>
    ),
  },
  {
    key: "in-progress",
    body: (
      <>
        Once work starts the status moves to{" "}
        <strong className="font-medium text-ink">In Progress</strong>.
      </>
    ),
  },
  {
    key: "resolved",
    body: (
      <>
        When the problem is fixed it is marked{" "}
        <strong className="font-medium text-ink">Resolved</strong>.
      </>
    ),
  },
];

export default async function SubmitSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const user = await getCurrentUser();

  // Only shows a reference the system could have issued; nothing is looked up here,
  // so the page never reveals whether a given reference actually exists.
  if (!ref || !isValidReference(ref)) {
    notFound();
  }

  return (
    <Container className="flex justify-center py-14 sm:py-20">
      <div className="w-full max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center sm:p-12">
            <h1 className="text-2xl font-semibold sm:text-3xl">Your request has been logged</h1>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
              The ICT support team has received it. Keep the reference number below. It is how
              you look this request up.
            </p>

            <div className="mt-8 rounded-card border border-brand-200 bg-brand-50 px-6 py-6">
              <p className="text-xs font-medium tracking-wider text-brand-700 uppercase">
                Reference number
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold tracking-[0.12em] break-all text-brand-800 sm:text-3xl">
                {ref}
              </p>
              <div className="mt-4 flex justify-center">
                <CopyReference reference={ref} />
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {user ? (
                <ButtonLink href="/my-requests" size="lg">
                  Go to My Requests
                  <ArrowRight className="size-4.5" aria-hidden="true" />
                </ButtonLink>
              ) : (
                <ButtonLink href={`/track?reference=${ref}`} size="lg">
                  <Search className="size-4.5" aria-hidden="true" />
                  Track this request
                </ButtonLink>
              )}
              <ButtonLink href="/submit" variant="outline" size="lg">
                Submit another
              </ButtonLink>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 rounded-card border border-line bg-surface p-6">
          <h2 className="font-semibold text-ink-strong">What happens next</h2>
          {/* Each step's prose is wrapped in a single span. Without it the li's own
              flex layout treats every text run and <strong> as a separate item and
              spreads the sentence across columns. */}
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            {STEPS.map((step, index) => (
              <li key={step.key} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-canvas text-xs font-semibold text-ink">
                  {index + 1}
                </span>
                <span className="min-w-0 pt-0.5">{step.body}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
            Something urgent in the meantime? Call {SITE.phone} during support hours.
          </p>
        </div>
      </div>
    </Container>
  );
}
