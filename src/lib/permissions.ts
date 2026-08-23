import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Permissions are declared once here and enforced on the server. Anything the UI
 * hides must also be checked in the matching server action. Hiding a button is a
 * usability choice, not an access control.
 */
const statement = {
  ...defaultStatements,
  ticket: [
    "create",
    "read:own",
    "read:assigned",
    "read:any",
    "assign",
    "update:status",
    "comment",
    "comment:internal",
    "delete",
  ],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  ticket: ["create", "read:own", "comment"],
});

export const technician = ac.newRole({
  ticket: ["create", "read:own", "read:assigned", "update:status", "comment", "comment:internal"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  ticket: [
    "create",
    "read:own",
    "read:assigned",
    "read:any",
    "assign",
    "update:status",
    "comment",
    "comment:internal",
    "delete",
  ],
});

export const roles = { user, technician, admin };

export type Role = keyof typeof roles;

export const ROLE_LABELS: Record<Role, string> = {
  user: "User",
  technician: "Technician",
  admin: "Administrator",
};
