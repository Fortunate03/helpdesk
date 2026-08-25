"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/actions/account";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Leaving the old password sitting in the inputs after a successful change is
  // exactly the value you do not want left on a shared machine.
  useEffect(() => {
    if (state.message && !state.errors) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      {state.message ? (
        <Alert tone={state.errors ? "error" : "success"}>{state.message}</Alert>
      ) : null}

      <TextField
        name="currentPassword"
        label="Current Password"
        type="password"
        required
        autoComplete="current-password"
        error={state.errors?.currentPassword}
      />

      <TextField
        name="newPassword"
        label="New Password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint="Use at least 8 characters. A short phrase is easier to remember than a jumble."
        error={state.errors?.newPassword}
      />

      <TextField
        name="confirmPassword"
        label="Confirm New Password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        error={state.errors?.confirmPassword}
      />

      <Button type="submit" disabled={pending}>
        {pending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
