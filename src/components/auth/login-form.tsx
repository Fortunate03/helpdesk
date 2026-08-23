"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validation";
import { fieldErrors } from "@/lib/validation";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse(Object.fromEntries(form));

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setPending(true);

    const { error } = await authClient.signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      // Deliberately vague: saying which of the two was wrong would let someone
      // check whether a given email address has an account here.
      setMessage("That email and password combination did not match an account.");
      setPending(false);
      return;
    }

    router.push(next ?? "/my-requests");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {message ? <Alert tone="error">{message}</Alert> : null}

      <TextField
        name="email"
        label="Email Address"
        type="email"
        required
        autoComplete="email"
        placeholder="name@example.co.za"
        error={errors.email}
      />

      <div className="space-y-1.5">
        <TextField
          name="password"
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Login"}
      </Button>
    </form>
  );
}
