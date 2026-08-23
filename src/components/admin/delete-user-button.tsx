"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function DeleteUserButton({ userId, name }: { userId: string; name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${name}`}
        className="grid size-9 place-items-center rounded-lg border border-line-strong text-muted transition-colors hover:border-danger-line hover:bg-danger-bg hover:text-danger-fg"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>

      {/* Deleting is irreversible, so it goes through a confirmation rather than
          firing straight off a click in a table row. */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Delete ${name}?`}
        description="This removes the account and signs the person out everywhere. It cannot be undone."
      >
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-muted">
            Requests they submitted and replies they left are kept, but are no longer linked to
            an account. Any requests assigned to them become unassigned.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <form action={deleteUser}>
              <input type="hidden" name="userId" value={userId} />
              <Button type="submit" variant="danger" className="w-full sm:w-auto">
                <Trash2 className="size-4" aria-hidden="true" />
                Delete account
              </Button>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
