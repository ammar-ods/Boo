"use client";

import { EditableCopy } from "@/components/cms/editable-copy";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";

export function FreeShippingMeter({ amount }: { amount: number }) {
  const { site } = useEdit();
  const { formatPrice } = useI18n();
  const min = site.commerce.freeShippingMin;
  if (!min) return null;

  const added = Math.max(0, amount);
  const remaining = Math.max(0, min - added);
  const pct = Math.min(100, Math.round((added / min) * 100));
  const remainPct = Math.max(0, 100 - pct);
  const unlocked = remaining === 0;

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-2 flex items-end justify-between gap-3 text-[12px] leading-snug sm:text-[13px]">
        <p className={`font-medium ${unlocked ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"}`}>
          {unlocked ? (
            <EditableCopy k="freeShipUnlocked" />
          ) : (
            <EditableCopy
              k="freeShipProgress"
              vars={{ added: formatPrice(added), remaining: formatPrice(remaining), min: formatPrice(min) }}
            />
          )}
        </p>
        {!unlocked ? (
          <p className="shrink-0 text-foreground/50">
            <EditableCopy k="freeShipRemaining" vars={{ percent: remainPct }} />
          </p>
        ) : null}
      </div>
      <div className={`h-1.5 overflow-hidden rounded-full ${unlocked ? "bg-emerald-100 dark:bg-emerald-950/70" : "bg-muted"}`}>
        <div
          className={`h-full rounded-full ${
            unlocked
              ? "bg-gradient-to-l from-emerald-700 to-emerald-400"
              : "bg-gradient-to-l from-[#c9a44a] to-[#e0c56a]"
          }`}
          style={{ width: `${Math.max(unlocked ? 100 : pct, 6)}%` }}
        />
      </div>
    </div>
  );
}
