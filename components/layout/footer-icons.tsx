import type { FooterIcon } from "@/lib/site";
import { pick } from "@/lib/site";

export const FOOTER_ICON_OPTIONS = [
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["tiktok", "TikTok"],
  ["youtube", "YouTube"],
  ["x", "X"],
  ["whatsapp", "WhatsApp"],
  ["email", "Email"],
  ["phone", "Phone"],
] as const;

function IconGlyph({ name }: { name: string }) {
  const common = "size-4";
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z" />
      </svg>
    );
  }
  if (name === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M14 4h2.2a5.7 5.7 0 0 0 3.8 3.5v2.3A8 8 0 0 1 16 8.4V15a6 6 0 1 1-6-6h.2V11.4A3.6 3.6 0 1 0 13.6 15V4Z" />
      </svg>
    );
  }
  if (name === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M22 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C18.4 5.4 12 5.4 12 5.4s-6.4 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 9 2 12.2 2 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.4.4 7.8.4 7.8.4s6.4 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6ZM10 15.5v-6.6l5.2 3.3-5.2 3.3Z" />
      </svg>
    );
  }
  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M17.6 4h2.6l-5.7 6.5L21 20h-5.3l-4.2-5.5L6.8 20H4.2l6.1-7L3.2 4h5.4l3.8 5L17.6 4Zm-.9 14.4h1.4L7.4 5.5H5.9l10.8 12.9Z" />
      </svg>
    );
  }
  if (name === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M19.1 4.9A10 10 0 0 0 4.1 17.6L3 21.5l4-1a10 10 0 0 0 12.1-15.6ZM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.4.6.6-2.3-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4 0-.5.2-.7l.4-.4.1-.4-.1-.4c0-.1-.5-1.3-.7-1.8s-.4-.4-.5-.4h-.5c-.2 0-.4 0-.6.3s-.8.8-.8 2 .9 2.3 1 2.5 1.7 2.6 4.1 3.6 1.8.7 2.5.6.8-.6 1-.9.2-1 .1-1.1Z" />
      </svg>
    );
  }
  if (name === "email") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }
  if (name === "phone") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M7 3.5h3.2l1 4.2-2 1.2a12 12 0 0 0 6 6l1.2-2 4.2 1V17a2 2 0 0 1-2.2 2A16 16 0 0 1 5 7.2 2 2 0 0 1 7 3.5Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".8" fill="currentColor" />
    </svg>
  );
}

export function FooterIconRow({ items, locale }: { items: FooterIcon[]; locale: string }) {
  const visible = items.filter((item) => item.href || pick(item.label, locale));
  if (!visible.length) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {visible.map((item) => {
        const label = pick(item.label, locale);
        const inner = (
          <>
            <span className="grid size-8 place-items-center rounded-full bg-white/10">
              <IconGlyph name={item.icon} />
            </span>
            {label ? <span className="text-sm text-white/75">{label}</span> : null}
          </>
        );
        if (!item.href) {
          return (
            <span key={item.id} className="inline-flex items-center gap-2">
              {inner}
            </span>
          );
        }
        return (
          <a
            key={item.id}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-white"
          >
            {inner}
          </a>
        );
      })}
    </div>
  );
}
