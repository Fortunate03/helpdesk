import {
  Accessibility,
  ArrowRight,
  BookOpen,
  GraduationCap,
  History,
  ListChecks,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: "What the ICT Help Desk does, who it serves, and how support requests are handled.",
};

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: "Students",
    body: "Wi-Fi and network access, student portal and email accounts, lab computers, printing credit and password resets.",
  },
  {
    icon: Users,
    title: "Academic & administrative staff",
    body: "Office equipment, software licences and installations, shared drives, mailbox problems and lecture-venue technology.",
  },
  {
    icon: BookOpen,
    title: "Departments & faculties",
    body: "Computer labs, departmental printers and shared systems, plus support for events and examinations.",
  },
];

const COMMITMENTS = [
  {
    icon: ListChecks,
    title: "Every request is recorded",
    body: "Nothing is handled purely by word of mouth. Each report becomes a numbered request with an owner and a status, so it cannot quietly disappear.",
  },
  {
    icon: History,
    title: "A full history is kept",
    body: "Assignments, status changes and replies are all logged against the request, so anyone picking it up can see exactly what has happened.",
  },
  {
    icon: ShieldCheck,
    title: "Your details stay private",
    body: "Only you and the support staff working on your request can see its contents. The public tracker shows status alone, never your description or contact details.",
  },
  {
    icon: Accessibility,
    title: "Usable by everyone",
    body: "The portal works with a keyboard alone, is readable by screen readers, and does not use colour as the only way of signalling status.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About the ICT Help Desk"
        description="A single, accountable route for every technology problem on campus."
      />

      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Why this service exists</h2>
            <p className="leading-relaxed text-muted">
              Technology problems used to be reported in whatever way was closest to hand: an
              email to whoever answered last time, a phone call, a note left on a desk, or
              stopping a technician in a corridor. Requests were easy to lose, impossible to
              prioritise, and nobody could say with confidence whether something had been dealt
              with.
            </p>
            <p className="leading-relaxed text-muted">
              The {SITE.name} replaces all of that with one route. Every problem is logged
              against a reference number, assigned to a technician, and tracked through to
              resolution. You always know where your request stands, and the support team always
              knows what is outstanding and what matters most.
            </p>

            <h2 className="pt-4 text-2xl font-semibold">What we help with</h2>
            <p className="leading-relaxed text-muted">
              Broadly, anything that plugs in, logs in or prints. That includes desktops and
              laptops, printers and scanners, Wi-Fi and cabled network access, email and account
              problems, software installations and licences, and the equipment in lecture venues
              and computer labs. If you are not sure whether something is ours, submit it anyway.
              We would rather re-route a request than have you wait.
            </p>

            <h2 className="pt-4 text-2xl font-semibold">How a request is handled</h2>
            <p className="leading-relaxed text-muted">
              A new request arrives as <strong className="font-medium text-ink">Pending</strong>{" "}
              and is reviewed by the help desk. Once a technician takes it on it moves to{" "}
              <strong className="font-medium text-ink">In Progress</strong>, and you can reply on
              the request itself if more information is needed. When the problem is fixed it is
              marked <strong className="font-medium text-ink">Resolved</strong>, with the full
              history kept against the reference number.
            </p>

            <div className="pt-2">
              <ButtonLink href="/submit">
                Submit a Request
                <ArrowRight className="size-4.5" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>

          <aside className="space-y-4">
            <h2 className="text-lg font-semibold">Who we support</h2>
            {AUDIENCES.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <item.icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <h3 className="font-semibold text-ink-strong">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </aside>
        </div>
      </Container>

      <section className="border-t border-line bg-surface py-14 lg:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">What you can expect from us</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Four commitments that hold for every request, regardless of who submits it.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {COMMITMENTS.map((item) => (
              <div key={item.title} className="rounded-card border border-line bg-canvas p-6">
                <span className="grid size-10 place-items-center rounded-lg bg-brand-600 text-white">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-ink-strong">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
