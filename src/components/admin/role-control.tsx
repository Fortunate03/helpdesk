import { setUserRole } from "@/actions/users";
import { ROLE_LABELS, type Role } from "@/lib/permissions";

export function RoleControl({
  userId,
  current,
  disabled,
}: {
  userId: string;
  current: Role;
  disabled?: boolean;
}) {
  if (disabled) {
    return <span className="text-sm text-muted">{ROLE_LABELS[current]}</span>;
  }

  return (
    <form action={setUserRole} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />

      <label htmlFor={`role-${userId}`} className="sr-only">
        Role
      </label>
      <select
        id={`role-${userId}`}
        name="role"
        defaultValue={current}
        className="h-9 rounded-lg border border-line-strong bg-surface px-2.5 text-sm text-ink transition-colors hover:border-brand-300 focus:border-brand-500"
      >
        {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="h-9 rounded-lg border border-line-strong bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-brand-300"
      >
        Save
      </button>
    </form>
  );
}
