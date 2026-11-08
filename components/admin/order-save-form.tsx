"use client";

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

  return (
    <form
      className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10"
      action={async (formData) => {
        try {
          await updateInquiryStatus(formData);
          router.push("/admin/inquiries?saved=1");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save order");
        }
      }}
    >
      {children}
      <SubmitButton />
    </form>
  );
}
