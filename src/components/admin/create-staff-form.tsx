"use client";

import { UserPlus } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { createStaffUser } from "@/actions/users";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/form";

const ROLE_OPTIONS = [
  { value: "technician", label: "Technician" },
  { value: "admin", label: "Administrator" },
];

export function CreateStaffForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(createStaffUser, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.errors) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      {state.message ? (
        <Alert tone={state.errors ? "error" : "success"}>{state.message}</Alert>
      ) : null}

      <TextField
        name="name"
        label="Full Name"
        required
        autoComplete="off"
        placeholder="Jane Doe"
        error={state.errors?.name}
      />

      <TextField
        name="email"
        label="Email Address"
        type="email"
        required
        autoComplete="off"
        placeholder="name@helpdesk.co.za"
        error={state.errors?.email}
      />

      <TextField
        name="password"
        label="Temporary Password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint="Share this with the person and ask them to change it after their first sign-in."
        error={state.errors?.password}
      />

      <SelectField
        name="role"
        label="Role"
        required
        options={ROLE_OPTIONS}
        placeholder="Select a role"
        error={state.errors?.role}
      />

      <Button type="submit" className="w-full" disabled={pending}>
        <UserPlus className="size-4.5" aria-hidden="true" />
        {pending ? "Creating…" : "Create staff account"}
      </Button>
    </form>
  );
}
