"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyReference({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access is blocked on insecure origins and in some browsers;
      // the reference is on screen either way, so this is not worth an error state.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
    >
      {copied ? (
        <Check className="size-4 text-brand-600" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy reference"}
      <span className="sr-only">{copied ? "Reference copied to clipboard" : ""}</span>
    </button>
  );
}
