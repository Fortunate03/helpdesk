"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { submitTicket } from "@/actions/tickets";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/form";
import { CATEGORY_LABELS, DEPARTMENT_LABELS } from "@/lib/constants";

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABELS).map(([value, label]) => ({ value, label }));

type Props = {
  defaults?: { fullName: string; email: string };
};

export function SubmitForm({ defaults }: Props) {
  const [state, formAction, pending] = useActionState(submitTicket, {});
  const locked = Boolean(defaults);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          name="fullName"
          label="Full Name"
          required
          autoComplete="name"
          placeholder="John Smith"
          defaultValue={defaults?.fullName}
          readOnly={locked}
          error={state.errors?.fullName}
        />

        <TextField
          name="email"
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          placeholder="name@example.ac.za"
          defaultValue={defaults?.email}
          readOnly={locked}
          hint="We send updates about this request to this address."
          error={state.errors?.email}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          name="department"
          label="Department"
          required
          options={DEPARTMENT_OPTIONS}
          placeholder="Select your department"
          error={state.errors?.department}
        />

        <SelectField
          name="category"
          label="Issue Category"
          required
          options={CATEGORY_OPTIONS}
          placeholder="Select the type of issue"
          hint="Pick the closest match. The team will re-route it if needed."
          error={state.errors?.category}
        />
      </div>

      <TextAreaField
        name="description"
        label="Description of the Problem"
        required
        rows={7}
        placeholder="Tell us what happened, what you were doing at the time, and any error message you saw. Include your office or room number if the problem is with equipment."
        hint="The more detail you give, the less back and forth it takes to fix."
        error={state.errors?.description}
      />

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted">
          You will receive a reference number as soon as this is submitted.
        </p>
        <Button type="submit" size="lg" disabled={pending}>
          <Send className="size-4.5" aria-hidden="true" />
          {pending ? "Submitting…" : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}
