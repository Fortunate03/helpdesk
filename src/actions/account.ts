"use server";

import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { changePasswordSchema, fieldErrors, updateProfileSchema } from "@/lib/validation";
import type { FormState } from "@/actions/tickets";

/** Changes only ever apply to the signed-in account: no user id crosses the wire. */
export async function updateProfile(_previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();

  if (!user) {
    return { message: "Sign in to change your details." };
  }

  const parsed = updateProfileSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  if (parsed.data.name === user.name) {
    return { message: "That is already the name on your account." };
  }

  try {
    await auth.api.updateUser({ headers: await headers(), body: { name: parsed.data.name } });
  } catch (error) {
    console.error("updateProfile failed", error);
    return { message: "Could not save your details. Please try again." };
  }

  // The header, the account menus and the assignee column all read the name from the
  // session, so the whole tree is stale until it is revalidated.
  revalidatePath("/", "layout");
  return { message: "Your details have been saved." };
}

export async function changePassword(_previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();

  if (!user) {
    return { message: "Sign in to change your password." };
  }

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        // A password change is how someone reacts to an account they think is
        // compromised, so every other signed-in device is dropped. Better Auth issues
        // this browser a fresh session, which nextCookies() forwards to the response.
        revokeOtherSessions: true,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      if (error.body?.code === "INVALID_PASSWORD") {
        return { errors: { currentPassword: "That is not your current password." } };
      }
      return { message: String(error.body?.message ?? "") || "Could not change your password." };
    }

    console.error("changePassword failed", error);
    return { message: "Could not change your password. Please try again." };
  }

  return { message: "Your password has been changed. Other devices have been signed out." };
}
