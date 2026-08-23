"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

/**
 * The controls are server-rendered forms passed in as children, so the server action
 * and its permission checks are unchanged; this only decides when they are on screen.
 *
 * The dialog stays open after a submission rather than closing itself. Unmounting a
 * form in the same tick as its submit risks losing the action, and leaving it open
 * means the controls re-render with the new status for confirmation.
 */
export function ManageRequestDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className="w-full">
        <SlidersHorizontal className="size-4.5" aria-hidden="true" />
        Manage request
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Manage request"
        description="Changes apply immediately and are recorded in the request's history."
      >
        <div className="space-y-6">{children}</div>
      </Modal>
    </>
  );
}
