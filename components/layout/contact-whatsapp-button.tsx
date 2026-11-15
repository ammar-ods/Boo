"use client";

import { darkenHex } from "@/lib/color";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { IconGlyph } from "@/components/layout/footer-icons";

const RADIUS = {
  pill: 9999,
  rounded: 18,
  square: 8,
} as const;

const SIZE = {
  sm: { minHeight: 44, fontSize: 14, paddingX: 16, icon: "size-4" },
  md: { minHeight: 52, fontSize: 16, paddingX: 20, icon: "size-6" },
  lg: { minHeight: 64, fontSize: 20, paddingX: 24, icon: "size-7" },
} as const;

function isImageIcon(value: string) {
  return /^(https?:)?\/|data:|\.png|\.jpe?g|\.webp|\.svg|\.gif/i.test(value);
}

export function ContactWhatsAppButton() {
  const { t } = useI18n();
  const { site } = useEdit();
  const shape = site.chrome.contactWaShape || "pill";
  const sizeKey = site.chrome.contactWaSize || "lg";
  const size = SIZE[sizeKey];
  const icon = (site.chrome.contactWaIcon || "whatsapp").trim();
  const bg = "#25D366";
  const lip = darkenHex(bg);

  return (
    <a
      href={whatsappChatUrl(site.chrome.whatsappPhone)}
      target="_blank"
      rel="noreferrer"
      className="btn-press mt-8 w-full font-heading"
      style={
        {
          ["--btn-bg" as string]: bg,
          ["--btn-fg" as string]: "#ffffff",
          ["--btn-lip" as string]: lip,
          background: bg,
          color: "#ffffff",
          borderRadius: RADIUS[shape],
          minHeight: size.minHeight,
          fontSize: size.fontSize,
          paddingInline: size.paddingX,
        } as React.CSSProperties
      }
    >
      {icon && icon !== "none" ? (
        isImageIcon(icon) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt="" className={`${size.icon} object-contain`} />
        ) : (
          <IconGlyph name={icon} className={`${size.icon} fill-current`} />
        )
      ) : null}
      {t("chatWhatsApp")}
    </a>
  );
}
