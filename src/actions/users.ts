"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getCurrentUser, roleOf } from "@/lib/session";
import { createStaffSchema, fieldErrors, setRoleSchema } from "@/lib/validation";
import type { FormState } from "@/actions/tickets";

/**
 * Technician and administrator accounts exist only by invitation: public registration
 * always produces a plain user, and Better Auth marks the role field as input: false
 * so it cannot be set from the sign-up request either. This is the only way in.
 */
export async function createStaffUser(_previous: FormState, formData: FormData): Promise<FormState> {
  const actor = await getCurrentUser();

  if (!actor || roleOf(actor) !== "admin") {
    return { message: "Only administrators can create staff accounts." };
  }

  const parsed = createStaffSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  try {
    await auth.api.createUser({
      // Passing the request headers lets Better Auth run its own admin check as well,
      // so the guard above is defence in depth rather than the only barrier.
      headers: await headers(),
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        role: parsed.data.role,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      const message = String(error.body?.message ?? "");
      if (/exist/i.test(message)) {
        return { errors: { email: "An account with that email already exists." } };
      }
      return { message: message || "Could not create the account." };
    }

    console.error("createStaffUser failed", error);
    return { message: "Could not create the account. Please try again." };
  }

  revalidatePath("/admin/users");
  return { message: `${parsed.data.name} can now sign in as a ${parsed.data.role}.` };
}

export async function setUserRole(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();

  if (!actor || roleOf(actor) !== "admin") {
    throw new Error("Only administrators can change roles.");
  }

  const parsed = setRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) return;

  // Removing your own admin rights would lock the last administrator out of the system.
  if (parsed.data.userId === actor.id && parsed.data.role !== "admin") {
    throw new Error("You cannot remove your own administrator role.");
  }

  await auth.api.setRole({
    headers: await headers(),
    body: { userId: parsed.data.userId, role: parsed.data.role },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function deleteUser(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();

  if (!actor || roleOf(actor) !== "admin") {
    throw new Error("Only administrators can delete accounts.");
  }

  const userId = String(formData.get("userId") ?? "");

  // Refusing self-deletion is what guarantees at least one administrator survives:
  // an admin may remove another admin, but never the account they are signed in as.
  if (!userId || userId === actor.id) {
    throw new Error("You cannot delete your own account.");
  }

  await auth.api.removeUser({ headers: await headers(), body: { userId } });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/tech");
}
