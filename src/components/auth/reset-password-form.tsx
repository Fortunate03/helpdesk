"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const nextErrors: Record<string, string> = {};

    if (password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);

    if (error) {
      setMessage(
        "This reset link is no longer valid. Links expire after an hour and can only be used once. Request a new one.",
      );
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="space-y-5">
        <Alert tone="success" title="Password updated">
          You can now sign in with your new password.
        </Alert>
        <Link
          href="/login"
          className="flex h-12 w-full items-center justify-center rounded-lg bg-brand-600 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {message ? (
        <Alert tone="error">
          {message}{" "}
          <Link href="/forgot-password" className="font-medium underline">
            Request a new link
          </Link>
        </Alert>
      ) : null}

      <TextField
        name="password"
        label="New Password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.password}
      />

      <TextField
        name="confirmPassword"
        label="Confirm New Password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        error={errors.confirmPassword}
      />

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Updating…" : "Set new password"}
      </Button>
    </form>
  );
}
