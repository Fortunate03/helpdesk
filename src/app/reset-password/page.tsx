import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Set a New Password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return (
    <AuthShell
      title="Set a new password"
      description="Choose a password you have not used on this account before."
      footer={
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {token && !error ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Alert tone="error" title="This link cannot be used">
          The reset link is missing or has expired. Reset links are valid for one hour and work
          only once.{" "}
          <Link href="/forgot-password" className="font-medium underline">
            Request a new one
          </Link>
          .
        </Alert>
      )}
    </AuthShell>
  );
}
