"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SHOW_RESET_LINK, takeResetLink } from "@/lib/reset-links";

export type ResetRequestState = {
  sent?: boolean;
  demoMode?: boolean;
  demoLink?: string;
  error?: string;
};

export async function requestPasswordReset(
  _previous: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email.includes("@")) {
    return { error: "Enter the email address you registered with." };
  }

  try {
    await auth.api.requestPasswordReset({
      headers: await headers(),
      body: { email, redirectTo: "/reset-password" },
    });
  } catch {
    // Swallowed on purpose: a failure here would otherwise reveal whether the
    // address has an account.
  }

  return {
    sent: true,
    demoMode: SHOW_RESET_LINK,
    demoLink: SHOW_RESET_LINK ? takeResetLink(email) : undefined,
  };
}
