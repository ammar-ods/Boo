"use client";

import { toast } from "sonner";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { EditableCopy } from "@/components/cms/editable-copy";
import { pick } from "@/lib/site";
import { ContactWhatsAppButton } from "@/components/layout/contact-whatsapp-button";
import { DynamicShopFields } from "@/components/shop/dynamic-fields";

export default function ContactPage() {
  const { locale } = useI18n();
  const { site } = useEdit();
  const fields = site.commerce.contactFields ?? [];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload: Record<string, string> = {};
    for (const field of fields.filter((item) => item.enabled)) {
      payload[field.key] = String(data.get(field.key) ?? "").trim();
      if (field.required && !payload[field.key]) {
        toast.error(pick(field.label, locale) || field.key);
        return;
      }
    }
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        notes: payload.notes,
        fields: payload,
      }),
    });
    if (!response.ok) {
      toast.error("Could not send");
      return;
    }
    const result = (await response.json()) as { reference?: string };
    window.location.href = `/thanks?ref=${encodeURIComponent(result.reference ?? "")}`;
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-12 sm:px-8">
      <EditableCopy k="contactTitle" as="h1" className="font-heading text-4xl text-oxford sm:text-5xl" />
      <EditableCopy k="contactBody" as="p" className="mt-3 block text-muted-foreground" />
      <ContactWhatsAppButton />
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <DynamicShopFields fields={fields} />
        <button type="submit" className="btn-press">
          <EditableCopy k="send" />
        </button>
      </form>
    </div>
  );
}
