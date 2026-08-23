import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SubmitForm } from "@/components/tickets/submit-form";
import { BulletList } from "@/components/ui/bullet-list";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/lib/session";
import { SITE } from "@/lib/constants";
import { Clock, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Submit Request",
  description: "Report an ICT problem and receive a reference number to track it.",
};

export default async function SubmitPage() {
  const user = await getCurrentUser();

  return (
    <>
      <PageHeader
        title="Submit a Request"
        description="Tell us what is not working. You do not need an account, but signing in means the request appears under My Requests automatically."
      />

      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-14">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <SubmitForm
              defaults={user ? { fullName: user.name, email: user.email } : undefined}
            />
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-semibold text-ink-strong">Before you submit</h2>
              <BulletList
                className="mt-4 text-muted"
                items={[
                  "Restart the device. It genuinely resolves a surprising number of faults.",
                  "Note any error message word for word, or take a photo of it.",
                  "Include your office, room or lab number so a technician can find you.",
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-semibold text-ink-strong">Urgent problem?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                If a whole lab, lecture venue or department is offline, call us rather than
                waiting for a reply.
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <a href={SITE.phoneHref} className="text-ink transition-colors hover:text-brand-700">
                    {SITE.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <a href={`mailto:${SITE.email}`} className="text-ink transition-colors hover:text-brand-700">
                    {SITE.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <span className="text-muted">{SITE.hours[0].days}, {SITE.hours[0].time}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </Container>
    </>
  );
}
