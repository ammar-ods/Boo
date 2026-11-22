"use client";

import type { ElementType } from "react";
import { useEdit } from "@/lib/edit-context";
import { useI18n } from "@/lib/i18n";
import {
  COMMERCE_COPY_KEYS,
  pick,
  type CommerceCopyKey,
  type CopyKey,
  type Localized,
  type StorefrontCopyKey,
} from "@/lib/site";
import { cn } from "@/lib/utils";

const COMMERCE_KEY_SET = new Set<string>(COMMERCE_COPY_KEYS);

export function formatCommerceCopy(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => (vars[key] == null ? `{${key}}` : String(vars[key])));
}

export function EditableText({
  value,
  onChange,
  as: Tag = "span",
  className,
}: {
  value: string;
  onChange?: (next: string) => void;
  as?: ElementType;
  className?: string;
}) {
  const { editing, isAdmin } = useEdit();
  if (!(editing && isAdmin && onChange)) {
    return <Tag className={className}>{value}</Tag>;
  }
  return (
    <Tag
      className={cn("rounded-sm outline-dashed outline-1 outline-oxford/25", className)}
      contentEditable
      suppressContentEditableWarning
      onClick={(event: { stopPropagation: () => void; preventDefault: () => void }) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      onPointerDown={(event: { stopPropagation: () => void }) => event.stopPropagation()}
      onBlur={(event: { currentTarget: HTMLElement }) => {
        onChange(event.currentTarget.textContent ?? "");
      }}
    >
      {value}
    </Tag>
  );
}

export function EditableCopy({
  k,
  vars,
  as,
  className,
}: {
  k: CopyKey;
  vars?: Record<string, string | number>;
  as?: ElementType;
  className?: string;
}) {
  const { site, setCommerce, setChrome, editing, isAdmin } = useEdit();
  const { locale, t } = useI18n();
  const commerceStored = site.commerce.copy?.[k as CommerceCopyKey];
  const chromeStored = site.chrome.copy?.[k as StorefrontCopyKey];
  const stored = COMMERCE_KEY_SET.has(k) ? commerceStored : chromeStored;
  const raw = pick(stored, locale)?.trim() || t(k);
  const show = editing && isAdmin ? raw : formatCommerceCopy(raw, vars);
  return (
    <EditableText
      as={as}
      className={className}
      value={show}
      onChange={(next) => {
        const loc = { ar: stored?.ar || t(k), en: stored?.en || t(k), [locale]: next };
        if (COMMERCE_KEY_SET.has(k)) {
          setCommerce({ copy: { ...site.commerce.copy, [k]: loc } });
          return;
        }
        setChrome({ copy: { ...site.chrome.copy, [k]: loc } });
      }}
    />
  );
}

export function EditableLoc({
  value,
  onChange,
  fallback,
  as,
  className,
}: {
  value?: Localized;
  onChange: (next: Localized) => void;
  fallback: string;
  as?: ElementType;
  className?: string;
}) {
  const { locale } = useI18n();
  const raw = pick(value, locale)?.trim() || fallback;
  return (
    <EditableText
      as={as}
      className={className}
      value={raw}
      onChange={(next) => onChange({ ar: value?.ar || fallback, en: value?.en || fallback, [locale]: next })}
    />
  );
}
