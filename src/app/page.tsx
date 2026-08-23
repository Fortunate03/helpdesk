import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Laptop,
  Loader,
  Lock,
  Mail,
  Printer,
  Search,
  Wifi,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { CATEGORY_HINTS, CATEGORY_LABELS, SITE, STATUS_DESCRIPTIONS } from "@/lib/constants";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Log the problem",
    body: "Describe what went wrong and pick a category. It takes about a minute, and you do not need an account.",
  },
  {
    icon: Search,
    title: "Get a reference number",
    body: "Every request is given its own reference code. Keep it, because that is how you look the request up later.",
  },
  {
    icon: CheckCircle2,
    title: "Track it to resolution",
    body: "A technician is assigned and the status moves from Pending to In Progress to Resolved. You can follow it the whole way.",
  },
];

const SERVICES = [
  { icon: Laptop, key: "HARDWARE" },
  { icon: ClipboardList, key: "SOFTWARE" },
  { icon: Wifi, key: "NETWORK" },
  { icon: Lock, key: "ACCOUNT_ACCESS" },
  { icon: Mail, key: "EMAIL" },
  { icon: Printer, key: "PRINTING" },
] as const;

const STATUSES = [
  { key: "PENDING", icon: Clock, tone: "bg-pending-bg text-pending-fg border-pending-line" },
  { key: "IN_PROGRESS", icon: Loader, tone: "bg-progress-bg text-progress-fg border-progress-line" },
  { key: "RESOLVED", icon: CheckCircle2, tone: "bg-resolved-bg text-resolved-fg border-resolved-line" },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        {/* Decorative wash behind the hero; hidden from assistive tech. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_28rem_at_78%_-12%,var(--color-brand-50),transparent)]"
        />

        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl leading-[1.1] font-semibold sm:text-5xl lg:text-6xl">
              Technical support,
              <span className="block text-brand-600">tracked from report to resolution.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Report a problem once and follow it the whole way through. No queueing at a
              counter, no wondering whether anyone picked it up. Every request gets a
              reference number and a status you can check at any time.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/submit" size="lg">
                Submit a Request
                <ArrowRight className="size-4.5" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/track" variant="outline" size="lg">
                <Search className="size-4.5" aria-hidden="true" />
                Track a request
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Response target</dt>
                <dd className="mt-1 text-xl font-semibold text-ink-strong">1 working day</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Support hours</dt>
                <dd className="mt-1 text-xl font-semibold text-ink-strong">{SITE.hours[0].time}</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-xs tracking-wide text-muted uppercase">Account needed</dt>
                <dd className="mt-1 text-xl font-semibold text-ink-strong">Not to report</dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">How the help desk works</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Three steps, from the moment something breaks to the moment it is fixed.
            </p>
          </div>

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full hover:shadow-raised">
                  <CardContent className="flex h-full flex-col p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-600 text-white">
                        <step.icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.body}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">What we support</h2>
            <p className="mt-3 leading-relaxed text-muted">
              If it plugs in, logs in or prints, it belongs here. Not sure which category fits?
              Choose Other and describe it in your own words.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <li key={service.key}>
                <div className="h-full rounded-card border border-line bg-canvas p-6">
                  <span className="grid size-10 place-items-center rounded-lg border border-brand-200 bg-surface text-brand-600">
                    <service.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold text-ink-strong">{CATEGORY_LABELS[service.key]}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {CATEGORY_HINTS[service.key]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">What each status means</h2>
            <p className="mt-3 leading-relaxed text-muted">
              You will see one of these three against every request you submit.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STATUSES.map((status) => (
              <div key={status.key} className={`rounded-card border p-6 ${status.tone}`}>
                <div className="flex items-center gap-2 font-semibold">
                  <status.icon className="size-4.5" aria-hidden="true" />
                  {status.key === "IN_PROGRESS" ? "In Progress" : status.key === "PENDING" ? "Pending" : "Resolved"}
                </div>
                <p className="mt-2 text-sm leading-relaxed opacity-90">
                  {STATUS_DESCRIPTIONS[status.key]}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="overflow-hidden rounded-card bg-ink-strong px-6 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Something not working?
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-white/70">
              Log it now and the support team will pick it up. You will get a reference number
              straight away, and {SITE.name} will keep you posted as it moves along.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/submit" size="lg">
                Submit a Request
                <ArrowRight className="size-4.5" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href="/contact"
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
              >
                Contact the help desk
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
