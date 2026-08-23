import { LayoutDashboard, ListChecks } from "lucide-react";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { buttonStyles, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getSession, roleOf } from "@/lib/session";
import Link from "next/link";

export async function SiteHeader() {
  const session = await getSession();
  const user = session?.user ?? null;
  const role = roleOf(user);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <DesktopNav />
        </div>

        <div className="flex items-center gap-2.5">
          {role === "technician" ? (
            <Link
              href="/tech"
              className={buttonStyles({ variant: "ghost", size: "sm", className: "hidden lg:inline-flex" })}
            >
              <ListChecks className="size-4" aria-hidden="true" />
              Queue
            </Link>
          ) : null}

          {role === "admin" ? (
            <Link
              href="/admin"
              className={buttonStyles({ variant: "ghost", size: "sm", className: "hidden lg:inline-flex" })}
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Admin
            </Link>
          ) : null}

          {user ? (
            <UserMenu name={user.name} email={user.email} role={role} />
          ) : (
            <>
              <ButtonLink href="/login" variant="outline" size="sm" className="hidden sm:inline-flex">
                Login
              </ButtonLink>
              <ButtonLink href="/submit" size="sm" className="hidden sm:inline-flex">
                Submit a Request
              </ButtonLink>
            </>
          )}

          <MobileNav
            user={user ? { name: user.name, email: user.email, role } : null}
          />
        </div>
      </Container>
    </header>
  );
}
