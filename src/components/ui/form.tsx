import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fields are composed as whole units rather than assembled from a Label plus an
 * Input at each call site. The label association, aria-describedby wiring and error
 * styling are done once here, so no form can accidentally ship an unlabelled input.
 * The element id is derived from `name`, which must therefore be unique per form.
 */
type FieldProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
};

const controlStyles = [
  "w-full rounded-lg border bg-surface px-3.5 text-sm text-ink",
  "placeholder:text-muted/70",
  "transition-colors duration-150",
  "disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted",
].join(" ");

function stateStyles(error?: string) {
  return error
    ? "border-danger-line focus:border-danger-fg"
    : "border-line-strong hover:border-brand-300 focus:border-brand-500";
}

function FieldShell({
  name,
  label,
  hint,
  error,
  required,
  children,
}: FieldProps & { children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-1 text-danger-fg" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-muted">(optional)</span>
        )}
      </label>

      {children}

      {hint && !error ? (
        <p id={`${name}-hint`} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${name}-error`} className="text-xs font-medium text-danger-fg">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy({ name, hint, error }: FieldProps) {
  if (error) return `${name}-error`;
  if (hint) return `${name}-hint`;
  return undefined;
}

export function TextField({
  name,
  label,
  hint,
  error,
  required,
  className,
  ...props
}: FieldProps & Omit<ComponentProps<"input">, "name" | "id">) {
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} required={required}>
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ name, label, hint, error })}
        className={cn(controlStyles, stateStyles(error), "h-11", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  error,
  required,
  className,
  ...props
}: FieldProps & Omit<ComponentProps<"textarea">, "name" | "id">) {
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ name, label, hint, error })}
        className={cn(controlStyles, stateStyles(error), "min-h-32 resize-y py-3 leading-relaxed", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  hint,
  error,
  required,
  options,
  placeholder = "Select an option",
  className,
  ...props
}: FieldProps &
  Omit<ComponentProps<"select">, "name" | "id"> & {
    options: ReadonlyArray<{ value: string; label: string }>;
    placeholder?: string;
  }) {
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <select
          id={name}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy({ name, label, hint, error })}
          defaultValue={props.defaultValue ?? ""}
          className={cn(controlStyles, stateStyles(error), "h-11 appearance-none pr-10", className)}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  );
}
