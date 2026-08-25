"use client";

import { ChevronDown, LayoutDashboard, ListChecks, LogOut, Ticket, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { Role } from "@/lib/permissions";

export function UserMenu({ name, email, role }: { name: string; email: string; role: Role }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    // refresh() re-runs the server components so the header drops back to signed-out.
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-canvas"
      >
        {/* Shown at every width now: with the avatar gone, hiding the name on small
            screens would leave nothing but a chevron. */}
        <span className="max-w-32 truncate font-medium text-ink">{name}</span>
        <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface shadow-raised"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-ink-strong">{name}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{email}</p>
          </div>

          <div className="p-1.5">
            <MenuLink href="/my-requests" icon={Ticket} label="My Requests" onSelect={() => setOpen(false)} />
            <MenuLink href="/profile" icon={UserRound} label="My Profile" onSelect={() => setOpen(false)} />
            {role === "technician" ? (
              <MenuLink href="/tech" icon={ListChecks} label="Technician Queue" onSelect={() => setOpen(false)} />
            ) : null}
            {role === "admin" ? (
              <MenuLink
                href="/admin"
                icon={LayoutDashboard}
                label="Admin Dashboard"
                onSelect={() => setOpen(false)}
              />
            ) : null}

            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-danger-bg hover:text-danger-fg disabled:opacity-60"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onSelect,
}: {
  href: string;
  icon: typeof Ticket;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
