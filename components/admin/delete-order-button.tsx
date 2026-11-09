"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteInquiry } from "@/actions/admin";

function ConfirmDelete() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-full bg-red-600 px-5 font-heading text-white disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete order"}
    </button>
  );
}

export function DeleteOrderButton({
  id,
  reference,
  compact = false,
}: {
  id: string;
  reference: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 w-full rounded-full bg-red-50 px-3 font-heading text-sm text-red-700 ring-1 ring-red-200"
      >
        {compact ? "Delete" : "Delete order"}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-oxford/60 p-4 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[28px] bg-background p-6 shadow-[0_24px_80px_-28px_rgba(10,37,64,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="font-heading text-2xl text-oxford">Delete this order?</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This permanently removes #{reference.replace("#", "")} from the dashboard and
              database, including customer details, mockups, and uploaded images. This cannot be
              undone.
            </p>
            <form action={deleteInquiry} className="mt-6 flex flex-wrap justify-end gap-3">
              <input type="hidden" name="id" value={id} />
              <button
                type="button"
                className="h-11 rounded-full bg-cream px-5 font-heading text-oxford"
                onClick={() => setOpen(false)}
              >
                Keep order
              </button>
              <ConfirmDelete />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
