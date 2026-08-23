import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Container className="flex justify-center py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <Card className="mt-8">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-7 text-center">
              <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            </div>

            {children}
          </CardContent>
        </Card>

        {footer ? <div className="mt-6 text-center text-sm text-muted">{footer}</div> : null}

        <p className="mt-8 text-center text-xs text-muted">
          Having trouble signing in?{" "}
          <Link href="/contact" className="font-medium text-brand-700 hover:underline">
            Contact the help desk
          </Link>
        </p>
      </div>
    </Container>
  );
}
