import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email, telephone, office location and operating hours for the ICT Help Desk.",
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    note: "Best for non-urgent problems.",
  },
  {
    icon: Phone,
    label: "Telephone",
    value: SITE.phone,
    href: SITE.phoneHref,
    note: "For urgent faults and outages.",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Block C, Room C012",
    note: SITE.campus,
  },
  {
    icon: Clock,
    label: "Operating hours",
    value: SITE.hours[0].time,
    note: SITE.hours[0].days,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact the Help Desk"
        description="Reach the ICT support team by email, phone, or in person at the support office."
      />

      <Container className="py-12 lg:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((channel) => (
            <Card key={channel.label} className="hover:shadow-raised">
              <CardContent className="p-7">
                <span className="grid size-10 place-items-center rounded-lg bg-brand-600 text-white">
                  <channel.icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-xs font-semibold tracking-wider text-muted uppercase">
                  {channel.label}
                </h2>
                {/* text-base rather than text-lg: at four across, the longest value
                    (the email address) breaks mid-word at the larger size. */}
                {channel.href ? (
                  <a
                    href={channel.href}
                    className="mt-1 block text-base font-semibold break-words text-ink-strong transition-colors hover:text-brand-700"
                  >
                    {channel.value}
                  </a>
                ) : (
                  <p className="mt-1 text-base font-semibold break-words text-ink-strong">
                    {channel.value}
                  </p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-muted">{channel.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
}
