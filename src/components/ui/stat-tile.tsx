export function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-card transition-shadow hover:shadow-raised">
      <p className="truncate text-sm text-muted" title={label}>
        {label}
      </p>
      <p className="mt-2 text-3xl leading-none font-semibold tabular-nums text-ink-strong">
        {value}
      </p>
    </div>
  );
}
