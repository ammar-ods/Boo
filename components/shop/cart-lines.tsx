"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart";
import { EditableCopy } from "@/components/cms/editable-copy";
import { useI18n } from "@/lib/i18n";

export function CartLines({
  items,
  editable = false,
  compact = false,
}: {
  items: CartItem[];
  editable?: boolean;
  compact?: boolean;
}) {
  const { t, locale, formatPrice } = useI18n();
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {items.map((item) => {
        const name = locale === "ar" ? item.nameAr || item.name : item.name;
        const line = item.priceEgp * item.quantity;
        return (
          <div
            key={item.id}
            className={`flex gap-3 bg-white ring-1 ring-oxford/8 ${compact ? "rounded-[12px] p-3" : "rounded-[14px] p-3.5"}`}
          >
            <div
              className={`relative shrink-0 overflow-hidden rounded-[10px] bg-chip ${
                compact ? "size-16 sm:size-[4.5rem]" : "h-24 w-20 sm:h-28 sm:w-24"
              }`}
            >
              {item.image ? <Image src={item.image} alt="" fill className="object-cover" /> : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`truncate font-heading text-oxford ${compact ? "text-base" : "text-lg"}`}>{name}</p>
                  {item.color ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <EditableCopy k="color" />: <span className="text-oxford">{item.color}</span>
                    </p>
                  ) : null}
                  {item.dimensions?.length || item.dimensions?.width ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <EditableCopy k="dimensions" />: {item.dimensions.length || "?"} × {item.dimensions.width || "?"}
                    </p>
                  ) : null}
                  {!editable ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <EditableCopy k="quantity" />: {item.quantity}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-semibold text-oxford">{formatPrice(editable ? item.priceEgp : line)}</p>
              </div>
              {editable ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-lg bg-cream px-1.5 py-1">
                    <button
                      type="button"
                      className="grid size-7 place-items-center text-oxford/50 hover:text-oxford"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      aria-label={t("quantity")}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      className="grid size-7 place-items-center text-oxford/50 hover:text-oxford"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label={t("quantity")}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] font-semibold tracking-[0.12em] text-oxford/40 uppercase hover:text-red-700"
                    onClick={() => remove(item.id)}
                  >
                    <EditableCopy k="remove" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
