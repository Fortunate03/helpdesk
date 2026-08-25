"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function DesktopNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const links = navFor(signedIn);

  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {links.map((item) => {
          // "/" would otherwise match every route under the startsWith check.
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-brand-700" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
                {active ? (
                  <span
                    className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-brand-600"
                    aria-hidden="true"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
