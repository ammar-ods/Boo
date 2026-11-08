"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { updateInquiryStatus } from "@/actions/admin";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 w-full rounded-full bg-boo-orange font-heading text-white"
    >
      {pending ? "Saving…" : "Save order"}
    </button>
  );
}

export function OrderSaveForm({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10"
      action={async (formData) => {
        try {
          await updateInquiryStatus(formData);
          setSaved(true);
          window.setTimeout(() => {
            router.push("/admin/inquiries");
          }, 900);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save order");
        }
      }}
    >
      {children}
      <SubmitButton />
      {saved ? (
        <div className="pointer-events-none fixed inset-0 z-[80] grid place-items-center">
          <div
            role="status"
            className="saved-toast flex items-center gap-2 rounded-full bg-oxford px-7 py-4 font-heading text-xl text-white shadow-xl ring-1 ring-white/30"
          >
            <span className="grid size-6 place-items-center rounded-full bg-white/20 text-sm">✓</span>
            Saved
          </div>
        </div>
      ) : null}
    </form>
  );
}
