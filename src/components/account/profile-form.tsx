"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/account";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, {});

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message ? (
        <Alert tone={state.errors ? "error" : "success"}>{state.message}</Alert>
      ) : null}

      <TextField
        name="name"
        label="Full Name"
        required
        autoComplete="name"
        defaultValue={name}
        placeholder="John Smith"
        hint="Letters, spaces, hyphens and apostrophes only."
        error={state.errors?.name}
      />

      {/* Read-only: the address is the sign-in identifier, and with no mail provider
          wired up a change here could not be verified. */}
      <TextField
        name="email"
        label="Email Address"
        type="email"
        defaultValue={email}
        readOnly
        disabled
        hint="Contact the help desk if your email address needs to change."
      />

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
