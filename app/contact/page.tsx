"use client";

import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function ContactPage() {
  const { t } = useI18n();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        phone: data.get("phone"),
        email: data.get("email"),
        notes: data.get("notes"),
      }),
    });
    if (!response.ok) {
      toast.error("Could not send");
      return;
    }
    const payload = (await response.json()) as { reference?: string };
    window.location.href = `/thanks?ref=${encodeURIComponent(payload.reference ?? "")}`;
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-5xl text-oxford">{t("contactTitle")}</h1>
      <p className="mt-3 text-muted-foreground">{t("contactBody")}</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          {t("name")}
          <input required name="name" className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4" />
        </label>
        <label className="block text-sm">
          {t("phone")}
          <input required name="phone" className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4" />
        </label>
        <label className="block text-sm">
          {t("email")}
          <input name="email" type="email" className="mt-1 h-11 w-full rounded-full border border-border bg-white px-4" />
        </label>
        <label className="block text-sm">
          {t("notes")}
          <textarea name="notes" rows={4} className="mt-1 w-full rounded-2xl border border-border bg-white px-4 py-3" />
        </label>
        <button type="submit" className="btn-press">
          {t("send")}
        </button>
      </form>
    </div>
  );
}
