"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { inquirySchema, type InquiryInput } from "@/lib/schemas/inquiry";
import { submitInquiry } from "@/actions/submit-inquiry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CanvasHandle } from "./fabric-canvas";
import { allRememberedFiles } from "@/lib/upload-registry";
import { useCustomizerStore } from "@/lib/store/customizer-store";
import type { Product } from "@/lib/products";

export function InquiryForm({
  product,
  canvas,
  onSuccess,
}: {
  product: Product;
  canvas: CanvasHandle | null;
  onSuccess: (payload: { referenceCode: string; whatsappUrl: string }) => void;
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
      material,
      quantity,
      notes: "",
    },
  });

  async function onSubmit(values: InquiryInput) {
    if (!canvas?.hasDesign()) {
      toast.error("Add artwork or text before sending an inquiry.");
      return;
    }

    const mockup = await canvas.exportMockup();
    const data = new FormData();
    data.set("productSlug", product.slug);
    data.set("productName", product.name);
    data.set("customerName", values.customerName);
    data.set("customerEmail", values.customerEmail ?? "");
    data.set("customerPhone", values.customerPhone);
    data.set("material", material);
    data.set("quantity", String(quantity));
    data.set("notes", values.notes ?? "");
    data.set("canvasJson", canvas.exportJson());
    data.set("mockup", mockup, "mockup.jpg");
    allRememberedFiles().forEach((file) => data.append("production", file));

    const result = await submitInquiry(data);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    onSuccess({
      referenceCode: result.referenceCode,
      whatsappUrl: result.whatsappUrl,
    });
    window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
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
      <Button
        type="submit"
        size="lg"
        className="h-11 w-full rounded-full bg-boo-pink font-heading text-base text-white hover:bg-boo-pink/90"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Sending…" : "Send inquiry + WhatsApp"}
      </Button>
    </form>
  );
}
