"use client";

import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});

  if (state.sent) {
    return (
      <div className="space-y-4">
        <Alert tone="success" title="Check your inbox">
          If an account exists for that address, a reset link is on its way. The link expires in
          one hour and can be used once.
        </Alert>

        {state.demoLink ? <DemoLink url={state.demoLink} /> : null}

        <Link href="/login" className="block text-center text-sm font-medium text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <TextField
        name="email"
        label="Email Address"
        type="email"
        required
        autoComplete="email"
        placeholder="name@example.co.za"
        hint="We will send a link to reset your password."
      />

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

/**
 * Only rendered when the demo flag is on. It is shown with the warning attached
 * because anyone who can see this link can take over the account it belongs to.
 */
function DemoLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access is blocked on insecure origins; the link is on screen anyway.
    }
  }

  return (
    <div className="rounded-lg border border-pending-line bg-pending-bg p-4">
      <p className="text-sm font-semibold text-pending-fg">Demo mode: reset link shown below</p>
      <p className="mt-1 text-xs leading-relaxed text-pending-fg/90">
        No email is being sent. This link would normally arrive in the requester&apos;s inbox, so
        it must never be displayed on a live site.
      </p>

      <p className="mt-3 rounded-md border border-pending-line bg-surface p-2.5 font-mono text-xs break-all text-ink">
        {url}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-brand-300"
        >
          {copied ? (
            <Check className="size-3.5 text-brand-600" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>

        <a
          href={url}
          className="inline-flex items-center rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700"
        >
          Open reset page
        </a>
      </div>
    </div>
  );
}
