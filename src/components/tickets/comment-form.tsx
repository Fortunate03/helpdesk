"use client";

import { Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { addComment } from "@/actions/tickets";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function CommentForm({ ticketId, canPostInternal }: { ticketId: string; canPostInternal: boolean }) {
  const [state, formAction, pending] = useActionState(addComment, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // The action returns an empty message on success; clear the box so the next
    // reply starts from scratch rather than re-editing the previous one.
    if (state.message === "") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="ticketId" value={ticketId} />

      {state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div className="space-y-1.5">
        <label htmlFor="body" className="block text-sm font-medium text-ink">
          Add a reply
        </label>
        <textarea
          id="body"
          name="body"
          rows={4}
          required
          placeholder="Add more detail, answer a question from the technician, or confirm the problem is fixed."
          aria-invalid={state.errors?.body ? true : undefined}
          aria-describedby={state.errors?.body ? "body-error" : undefined}
          className="min-h-28 w-full resize-y rounded-lg border border-line-strong bg-surface px-3.5 py-3 text-sm leading-relaxed text-ink transition-colors placeholder:text-muted/70 hover:border-brand-300 focus:border-brand-500"
        />
        {state.errors?.body ? (
          <p id="body-error" className="text-xs font-medium text-danger-fg">
            {state.errors.body}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {canPostInternal ? (
          <label className="flex items-center gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              name="isInternal"
              className="size-4 rounded border-line-strong accent-brand-600"
            />
            Internal note, not shown to the requester
          </label>
        ) : (
          <span />
        )}

        <Button type="submit" disabled={pending}>
          <Send className="size-4" aria-hidden="true" />
          {pending ? "Sending…" : "Send reply"}
        </Button>
      </div>
    </form>
  );
}
