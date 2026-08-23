"use client";

import { LayoutDashboard, ListChecks, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buttonStyles } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { PRIMARY_NAV } from "@/lib/constants";
import type { Role } from "@/lib/permissions";
import { cn } from "@/lib/utils";

type Props = {
  user: { name: string; email: string; role: Role } | null;
};

export function MobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    // Stop the page behind the drawer from scrolling while it is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      // Keep Tab inside the drawer; without this, focus walks onto the page behind it.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    // The back button navigates away without a click of ours to react to.
    function onPopState() {
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
    };
  }, [open]);

  async function handleSignOut() {
    await authClient.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const links = [
    ...PRIMARY_NAV,
    ...(user?.role === "technician" ? [{ href: "/tech", label: "Technician Queue" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin Dashboard" }] : []),
  ];

  const drawer = (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-ink-strong/40"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-line bg-surface shadow-raised"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <span className="text-sm font-semibold text-ink-strong">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Links and the account block scroll together. When only the nav could flex,
            a short window squeezed it away while the pinned footer kept its height. */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <nav className="p-3">
            <ul className="space-y-1">
              {links.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                        active ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-canvas",
                      )}
                    >
                      {item.href === "/tech" ? <ListChecks className="size-4" aria-hidden="true" /> : null}
                      {item.href === "/admin" ? (
                        <LayoutDashboard className="size-4" aria-hidden="true" />
                      ) : null}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-line p-4">
            {user ? (
              <div className="space-y-3">
                <div>
                  <p className="truncate text-sm font-medium text-ink-strong">{user.name}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={buttonStyles({ variant: "outline", size: "sm", className: "w-full" })}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={buttonStyles({ variant: "outline", className: "w-full" })}
                >
                  Login
                </Link>
                <Link
                  href="/submit"
                  onClick={() => setOpen(false)}
                  className={buttonStyles({ className: "w-full" })}
                >
                  Submit a Request
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid size-10 place-items-center rounded-lg border border-line-strong text-ink transition-colors hover:border-brand-300 lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {/* Portalled to document.body: the site header sets backdrop-blur, and an
          ancestor with a backdrop-filter becomes the containing block for fixed
          positioning, which pinned this overlay to the header's own height. */}
      {open ? createPortal(drawer, document.body) : null}
    </>
  );
}
