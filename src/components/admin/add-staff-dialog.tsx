"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateStaffForm } from "@/components/admin/create-staff-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function AddStaffDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus className="size-4.5" aria-hidden="true" />
        Add staff account
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a staff account"
        description="Creates the account immediately. The person signs in with the email and temporary password you set here."
      >
        <CreateStaffForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
