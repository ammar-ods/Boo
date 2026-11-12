"use client";

import { toast } from "sonner";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/site";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { DynamicShopFields } from "@/components/shop/dynamic-fields";

export default function ContactPage() {
  const { t, locale } = useI18n();
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
      <h1 className="font-heading text-4xl text-oxford sm:text-5xl">{t("contactTitle")}</h1>
      <p className="mt-3 text-muted-foreground">{t("contactBody")}</p>
      <a
        href={whatsappChatUrl(site.chrome.whatsappPhone)}
        target="_blank"
        rel="noreferrer"
        className="mt-8 flex min-h-16 items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 font-heading text-xl text-white shadow-[0_10px_24px_-12px_rgba(37,211,102,0.9)] transition hover:brightness-105"
      >
        <svg viewBox="0 0 24 24" className="size-7 fill-current" aria-hidden>
          <path d="M19.1 4.9A9.9 9.9 0 0 0 3.2 17.3L2 22l4.8-1.3A9.9 9.9 0 1 0 19.1 4.9Zm-7.1 15.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.8.7.8-2.7-.2-.3a8.2 8.2 0 1 1 6.7 3.7Zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.7.8c-.1.2-.3.2-.6.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.6l.4-.5.1-.3c0-.1 0-.3-.1-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3a9.4 9.4 0 0 0 3.4 3 11 11 0 0 0 1.4.5c.5.2 1 .1 1.4.1.4 0 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1 0-.1-.2-.2-.4-.3Z" />
        </svg>
        {t("chatWhatsApp")}
      </a>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <DynamicShopFields fields={fields} />
        <button type="submit" className="btn-press">
          {t("send")}
        </button>
      </form>
    </div>
  );
}
