"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { inquirySchema, type InquiryInput } from "@/lib/schemas/inquiry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CanvasHandle } from "./fabric-canvas";
import { allRememberedFiles } from "@/lib/upload-registry";
import { useCustomizerStore } from "@/lib/store/customizer-store";
import type { Product } from "@/lib/products";
import { productViews } from "@/lib/products";

export function InquiryForm({
  product,
  canvases,
}: {
  product: Product;
  canvases: Record<string, CanvasHandle | null>;
}) {
  const material = useCustomizerStore((s) => s.material);
  const quantity = useCustomizerStore((s) => s.quantity);

  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema) as never,
    defaultValues: {
      productSlug: product.slug,
      productName: product.name,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      material: material || product.defaultMaterial || "Standard",
      quantity,
      notes: "",
    },
  });

  useEffect(() => {
    form.setValue("material", material || product.defaultMaterial || "Standard");
    form.setValue("quantity", quantity);
  }, [form, material, product.defaultMaterial, quantity]);

  async function onSubmit(values: InquiryInput) {
    const views = productViews(product);
    const handles = views
      .map((view) => canvases[view.id])
      .filter((handle): handle is CanvasHandle => Boolean(handle));

    if (handles.length === 0) {
      toast.error("The customizer is still loading. Try again in a moment.");
      return;
    }

    try {
      const data = new FormData();
      data.set("productSlug", product.slug);
      data.set("productName", product.name);
      data.set("customerName", values.customerName);
      data.set("customerEmail", values.customerEmail ?? "");
      data.set("customerPhone", values.customerPhone);
      data.set("material", values.material || material || product.defaultMaterial || "Standard");
      data.set("quantity", String(quantity || values.quantity || 1));
      data.set("notes", values.notes ?? "");
      data.set(
        "canvasJson",
        JSON.stringify({
          views: Object.fromEntries(
            views.map((view) => [view.id, canvases[view.id]?.exportJson() ?? null]),
          ),
        }),
      );

      const mockups: { id: string; blob: Blob }[] = [];
      for (const view of views) {
        const handle = canvases[view.id];
        if (!handle) continue;
        mockups.push({ id: view.id, blob: await handle.exportMockup() });
      }
      if (mockups.length === 0) {
        toast.error("Could not capture a preview.");
        return;
      }
      data.set("mockup", new File([mockups[0].blob], `${mockups[0].id}.jpg`, { type: "image/jpeg" }));
      mockups.slice(1).forEach((item) => {
        data.append(
          "viewMockups",
          new File([item.blob], `${item.id}.jpg`, { type: "image/jpeg" }),
        );
      });
      allRememberedFiles().forEach((file) => {
        if (file.size > 4_000_000) return;
        data.append("production", file);
      });

      const response = await fetch("/api/inquiry", { method: "POST", body: data });
      const result = (await response.json().catch(() => null)) as
        | { ok: true; referenceCode: string }
        | { ok: false; error?: string }
        | null;
      if (!response.ok || !result || !result.ok) {
        toast.error(result && "error" in result && result.error ? result.error : "Could not send the inquiry.");
        return;
      }

      window.location.assign(
        `/thanks?ref=${encodeURIComponent(result.referenceCode)}&product=${encodeURIComponent(product.name)}`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the inquiry.");
    }
  }

  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit(onSubmit, () => {
        toast.error("Add your name and a WhatsApp number so the studio can reply.");
      })}
    >
      <input type="hidden" {...form.register("productSlug")} />
      <input type="hidden" {...form.register("productName")} />
      <div className="space-y-1.5">
        <Label htmlFor="customerName">Your name</Label>
        <Input id="customerName" {...form.register("customerName")} />
        {form.formState.errors.customerName ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.customerName.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="customerPhone">WhatsApp number</Label>
        <Input
          id="customerPhone"
          placeholder="+20 …"
          {...form.register("customerPhone")}
        />
        {form.formState.errors.customerPhone ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.customerPhone.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="customerEmail">Email (optional)</Label>
        <Input id="customerEmail" type="email" {...form.register("customerEmail")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes for the studio</Label>
        <Textarea
          id="notes"
          placeholder="Colors, due date, gift wrap…"
          {...form.register("notes")}
        />
      </div>
      <button
        type="submit"
        className="h-11 w-full rounded-full bg-boo-pink font-heading text-base text-white hover:bg-boo-pink/90 disabled:opacity-60"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
