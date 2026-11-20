"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveFormsSettings } from "@/actions/admin";
import { flashStatus } from "@/components/status-flash";
import { FormFieldsEditor } from "@/components/admin/form-fields-editor";
import type { Commerce } from "@/lib/site";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 rounded-full bg-oxford px-6 font-heading text-white">
      {pending ? "Saving…" : "Save forms"}
    </button>
  );
}

export function FormsSettingsForm({ commerce }: { commerce: Commerce }) {
  const router = useRouter();
  const [contactFields, setContactFields] = useState(commerce.contactFields);
  const [checkoutFields, setCheckoutFields] = useState(commerce.checkoutFields);

  return (
    <form
      action={async (formData) => {
        formData.set("contactFields", JSON.stringify(contactFields));
        formData.set("checkoutFields", JSON.stringify(checkoutFields));
        try {
          await saveFormsSettings(formData);
          router.refresh();
          flashStatus("Saved");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save");
        }
      }}
      className="mt-8 space-y-8"
    >
      <section className="space-y-4 rounded-[1.6rem] bg-white p-6 ring-1 ring-oxford/8">
        <h2 className="font-heading text-2xl text-oxford">Contact form</h2>
        <p className="text-sm text-muted-foreground">Shown on the contact page. Submissions still land in Orders.</p>
        <FormFieldsEditor fields={contactFields} onChange={setContactFields} />
      </section>
      <section className="space-y-4 rounded-[1.6rem] bg-white p-6 ring-1 ring-oxford/8">
        <h2 className="font-heading text-2xl text-oxford">Checkout / shipping form</h2>
        <p className="text-sm text-muted-foreground">Fields and required flags on the checkout page.</p>
        <FormFieldsEditor fields={checkoutFields} onChange={setCheckoutFields} />
      </section>
      <Submit />
    </form>
  );
}
