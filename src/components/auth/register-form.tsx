"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { fieldErrors, registerSchema } from "@/lib/validation";

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse(Object.fromEntries(form));

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setPending(true);

    // Accounts created here are always plain users. Technician and administrator
    // accounts are created by an admin from the user management page.
    const { error } = await authClient.signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      setMessage(
        error.message?.toLowerCase().includes("exist")
          ? "An account with that email address already exists. Try signing in instead."
          : (error.message ?? "We could not create your account. Please try again."),
      );
      setPending(false);
      return;
    }

    router.push("/my-requests");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {message ? <Alert tone="error">{message}</Alert> : null}

      <TextField
        name="name"
        label="Full Name"
        required
        autoComplete="name"
        placeholder="John Smith"
        error={errors.name}
      />

      <TextField
        name="email"
        label="Email Address"
        type="email"
        required
        autoComplete="email"
        placeholder="name@example.co.za"
        error={errors.email}
      />

      <TextField
        name="password"
        label="Password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint="Use at least 8 characters. A short phrase is easier to remember than a jumble."
        error={errors.password}
      />

      <TextField
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="Re-enter your password"
        error={errors.confirmPassword}
      />

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
