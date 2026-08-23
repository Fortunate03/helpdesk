import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an ICT Help Desk account to track your support requests.",
};

export default async function RegisterPage() {
  const session = await getSession();

  if (session?.user) {
    redirect("/my-requests");
  }

  return (
    <AuthShell
      title="Create your account"
      description="An account keeps all of your requests in one place and lets you reply to technicians."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
