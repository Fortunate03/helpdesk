import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to view and track your ICT support requests.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();

  if (session?.user) {
    redirect("/my-requests");
  }

  const { next } = await searchParams;

  // Only same-site paths are accepted, so a crafted ?next= cannot bounce the user
  // to another domain after a successful login.
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return (
    <AuthShell
      title="Sign in to your account"
      description="Access your requests and follow their progress."
      footer={
        <>
          Do not have an account?{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <LoginForm next={safeNext} />
    </AuthShell>
  );
}
