"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SuccessModal({
  open,
  onOpenChange,
  referenceCode,
  whatsappUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referenceCode: string;
  whatsappUrl: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Inquiry sent!</DialogTitle>
          <DialogDescription>
            We saved your mockup as{" "}
            <span className="font-heading text-boo-ink">{referenceCode}</span>. If
            WhatsApp did not open, tap the fallback link below.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl bg-secondary p-4 font-heading text-lg text-boo-ink">
          {referenceCode}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep designing
          </Button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 font-medium text-primary-foreground"
          >
            Open WhatsApp
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
