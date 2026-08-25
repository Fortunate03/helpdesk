import { z } from "zod";
import { categoryEnum, departmentEnum, ticketStatusEnum } from "@/db/schema";
import { REFERENCE_LENGTH, isValidReference, normalizeReference } from "@/lib/reference";

// Letters and combining marks so accented names pass, plus the punctuation that
// genuinely appears in names. Anything else — digits, @, / — is junk input.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} '\u2019.-]*$/u;

function personName(tooShortMessage: string) {
  return z
    .string()
    .trim()
    .min(2, tooShortMessage)
    .max(120, "Name must be 120 characters or fewer.")
    .regex(NAME_PATTERN, "Names can only contain letters, spaces, hyphens and apostrophes.");
}

/**
 * Shared by the browser form and the server action. The action re-validates on the
 * server because client-side checks are a convenience for the user, not a guarantee.
 * A request can always be sent without ever loading the form.
 */
export const submitTicketSchema = z.object({
  fullName: personName("Please enter your full name."),
  email: z.email("Enter a valid email address, for example name@example.ac.za."),
  department: z.enum(departmentEnum.enumValues, { message: "Select your department." }),
  category: z.enum(categoryEnum.enumValues, { message: "Select the type of issue." }),
  description: z
    .string()
    .trim()
    .min(20, "Please describe the problem in at least 20 characters so we can help.")
    .max(4000, "Description must be 4000 characters or fewer."),
});

export const trackTicketSchema = z.object({
  // Normalised first so spacing, case and the characters people commonly mistype
  // (O for zero, I or L for one) still resolve to the right request.
  reference: z
    .string()
    .transform(normalizeReference)
    .refine(isValidReference, `Reference numbers are ${REFERENCE_LENGTH} letters and digits.`),
});

export const registerSchema = z
  .object({
    name: personName("Please enter your full name."),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const updateProfileSchema = z.object({
  name: personName("Please enter your full name."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "Choose a password you are not already using.",
    path: ["newPassword"],
  });

export const commentSchema = z.object({
  ticketId: z.uuid(),
  body: z.string().trim().min(1, "Write a message before sending.").max(4000),
  isInternal: z.coerce.boolean().optional(),
});

export const updateStatusSchema = z.object({
  ticketId: z.uuid(),
  status: z.enum(ticketStatusEnum.enumValues),
});

export const assignTicketSchema = z.object({
  ticketId: z.uuid(),
  // Empty string means "unassign", which is why this is not a plain uuid.
  assigneeId: z.string(),
});

/** Turns a Zod failure into the flat { field: message } shape the form components expect. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !result[key]) result[key] = issue.message;
  }

  return result;
}

/** Admin-only. Public registration cannot reach this, so it always produces a plain user. */
export const createStaffSchema = z.object({
  name: personName("Enter the person's full name."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  role: z.enum(["technician", "admin"], { message: "Choose a role." }),
});

export const setRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["user", "technician", "admin"]),
});
