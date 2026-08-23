import { Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SITE, PRIMARY_NAV } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";

// Home and Contact are left out here: the logo already returns to the home page,
// and the Contact column alongside carries the same details.
const FOOTER_NAV = PRIMARY_NAV.filter((item) => item.href !== "/" && item.href !== "/contact");

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{SITE.description}</p>
        </div>

        <nav aria-labelledby="footer-nav-heading">
          <h2 id="footer-nav-heading" className="text-sm font-semibold text-ink-strong">
            Navigate
          </h2>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-brand-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-ink-strong">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-brand-700">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <a href={SITE.phoneHref} className="transition-colors hover:text-brand-700">
                {SITE.phone}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink-strong">Support hours</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {SITE.hours.map((entry) => (
              <li key={entry.days} className="flex gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span>
                  <span className="block text-ink">{entry.days}</span>
                  {entry.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>{SITE.tagline}</p>
        </Container>
      </div>
    </footer>
  );
}
