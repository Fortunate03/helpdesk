import { assignTicket, claimTicket, updateStatus } from "@/actions/tickets";
import type { TicketStatus } from "@/db/schema";
import { STATUS_LABELS } from "@/lib/constants";

/**
 * Plain forms posting to server actions rather than client-side state. The action
 * re-checks the caller's role, so these controls being rendered is a convenience,
 * never the thing that grants permission.
 */
export function StatusControl({
  ticketId,
  current,
}: {
  ticketId: string;
  current: TicketStatus;
}) {
  return (
    <form action={updateStatus} className="space-y-2">
      <input type="hidden" name="ticketId" value={ticketId} />

      <label htmlFor="status" className="block text-xs font-medium tracking-wide text-muted uppercase">
        Status
      </label>

      <div className="flex gap-2">
        <select
          id="status"
          name="status"
          defaultValue={current}
          className="h-10 flex-1 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink transition-colors hover:border-brand-300 focus:border-brand-500"
        >
          {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Update
        </button>
      </div>
    </form>
  );
}

export function ClaimControl({ ticketId }: { ticketId: string }) {
  return (
    <form action={claimTicket} className="space-y-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <p className="text-xs leading-relaxed text-muted">
        Nobody is working on this request yet. Claiming it assigns it to you and moves it to In
        Progress.
      </p>
      <button
        type="submit"
        className="h-10 w-full rounded-lg bg-brand-600 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Claim this request
      </button>
    </form>
  );
}

export function AssignControl({
  ticketId,
  current,
  technicians,
}: {
  ticketId: string;
  current: string | null;
  technicians: Array<{ id: string; name: string; role: string | null }>;
}) {
  return (
    <form action={assignTicket} className="space-y-2">
      <input type="hidden" name="ticketId" value={ticketId} />

      <label
        htmlFor="assigneeId"
        className="block text-xs font-medium tracking-wide text-muted uppercase"
      >
        Assigned technician
      </label>

      <div className="flex gap-2">
        <select
          id="assigneeId"
          name="assigneeId"
          defaultValue={current ?? ""}
          className="h-10 flex-1 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink transition-colors hover:border-brand-300 focus:border-brand-500"
        >
          <option value="">Unassigned</option>
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.name}
              {technician.role === "admin" ? " (admin)" : ""}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="h-10 rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-brand-300"
        >
          Save
        </button>
      </div>
    </form>
  );
}
