"use client";

import { useEffect, useState } from "react";
import { ImagePlus, LayoutGrid, Type, X } from "lucide-react";
import { toast } from "sonner";
import { useEdit } from "@/lib/edit-context";
import {
  SECTION_TYPES,
  type GalleryItem,
  type ImagePlacement,
  type Localized,
  type SiteSection,
} from "@/lib/site";

type Tab = "copy" | "layout" | "media";

export function SectionInspector({ section }: { section: SiteSection | null }) {
  const { patchSection, setSelectedId, save, saving, dirty } = useEdit();
  const [tab, setTab] = useState<Tab>("copy");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSelectedId]);

  if (!section) return null;
  const meta = SECTION_TYPES.find((item) => item.type === section.type);

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[min(72vh,620px)] flex-col rounded-t-[24px] bg-background shadow-[0_-18px_50px_-24px_rgba(10,37,64,0.45)] ring-1 ring-oxford/10 sm:inset-x-auto sm:bottom-3 sm:end-3 sm:top-[9rem] sm:max-h-none sm:w-[23.5rem] sm:rounded-[24px] sm:shadow-[0_24px_80px_-28px_rgba(10,37,64,0.4)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3 border-b border-oxford/10 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-oxford/45 uppercase">
            {meta?.label} · {meta?.labelAr}
          </p>
          <p className="truncate font-heading text-xl text-oxford">Edit section</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="h-9 rounded-full bg-oxford px-3.5 text-sm font-semibold text-white disabled:opacity-40"
            onClick={() => void save()}
            disabled={saving || !dirty}
          >
            {saving ? "…" : "Save"}
          </button>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full bg-cream text-oxford"
            onClick={() => setSelectedId(null)}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-oxford/10 p-1.5">
        {(
          [
            ["copy", "Copy", Type],
            ["layout", "Layout", LayoutGrid],
            ["media", "Media", ImagePlus],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-xl text-sm font-medium ${
              tab === id ? "bg-oxford text-white" : "text-oxford/60 hover:bg-cream"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "copy" ? <CopyTab section={section} patch={patchSection} /> : null}
        {tab === "layout" ? <LayoutTab section={section} patch={patchSection} /> : null}
        {tab === "media" ? <MediaTab section={section} patch={patchSection} /> : null}
      </div>
    </aside>
  );
}

function CopyTab({
  section,
  patch,
}: {
  section: SiteSection;
  patch: ReturnType<typeof useEdit>["patchSection"];
}) {
  return (
    <div className="space-y-4">
      <BilingualField
        label="Eyebrow"
        value={section.content.eyebrow}
        onChange={(eyebrow) => patch(section.id, { content: { eyebrow } })}
      />
      <BilingualField
        label="Title"
        value={section.content.title}
        onChange={(title) => patch(section.id, { content: { title } })}
      />
      <BilingualField
        label="Body"
        value={section.content.body}
        multiline
        onChange={(body) => patch(section.id, { content: { body } })}
      />
      <div className="rounded-2xl bg-cream/80 p-3">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">Buttons</p>
        <BilingualField
          label="Primary button"
          value={section.content.ctaLabel}
          onChange={(ctaLabel) => patch(section.id, { content: { ctaLabel } })}
        />
        <TextField
          label="Primary link"
          value={section.content.ctaHref ?? ""}
          onChange={(ctaHref) => patch(section.id, { content: { ctaHref } })}
        />
        <BilingualField
          label="Second button"
          value={section.content.secondaryCtaLabel}
          onChange={(secondaryCtaLabel) => patch(section.id, { content: { secondaryCtaLabel } })}
        />
        <TextField
          label="Second link"
          value={section.content.secondaryCtaHref ?? ""}
          onChange={(secondaryCtaHref) => patch(section.id, { content: { secondaryCtaHref } })}
        />
      </div>
    </div>
  );
}

function LayoutTab({
  section,
  patch,
}: {
  section: SiteSection;
  patch: ReturnType<typeof useEdit>["patchSection"];
}) {
  return (
    <div className="space-y-5">
      <Group title="Type">
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="Align"
            value={section.style.align ?? "center"}
            onChange={(align) => patch(section.id, { style: { align: align as "start" | "center" } })}
            options={[
              ["start", "Start"],
              ["center", "Center"],
            ]}
          />
          <NumberField
            label="Font size"
            value={section.style.fontSize ?? 36}
            onChange={(fontSize) => patch(section.id, { style: { fontSize } })}
          />
        </div>
      </Group>
      <Group title="Size">
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Width %"
            value={section.style.blockWidth ?? 100}
            onChange={(blockWidth) =>
              patch(section.id, { style: { blockWidth: Math.min(100, Math.max(20, blockWidth)) } })
            }
          />
          <NumberField
            label="Min height"
            value={section.style.minHeight ?? 0}
            onChange={(minHeight) => patch(section.id, { style: { minHeight: Math.max(0, minHeight) } })}
          />
        </div>
      </Group>
      <Group title="Spacing">
        <div className="grid grid-cols-3 gap-2">
          <NumberField
            label="Padding Y"
            value={section.style.paddingY ?? 48}
            onChange={(paddingY) => patch(section.id, { style: { paddingY: Math.max(0, paddingY) } })}
          />
          <NumberField
            label="Margin X"
            value={section.style.marginX ?? 0}
            onChange={(marginX) => patch(section.id, { style: { marginX: Math.max(0, marginX) } })}
          />
          <NumberField
            label="Margin Y"
            value={section.style.marginY ?? 0}
            onChange={(marginY) => patch(section.id, { style: { marginY: Math.max(0, marginY) } })}
          />
        </div>
      </Group>
      <Group title="Color">
        <div className="grid grid-cols-2 gap-2">
          <ColorField
            label="Background"
            value={section.style.background ?? "#f6f3ea"}
            onChange={(background) => patch(section.id, { style: { background } })}
          />
          <ColorField
            label="Text"
            value={section.style.color ?? "#0a2540"}
            onChange={(color) => patch(section.id, { style: { color } })}
          />
        </div>
      </Group>
      <Group title="Options">
        <SwitchRow
          label="Rounded corners"
          checked={Boolean(section.style.rounded)}
          onChange={(rounded) => patch(section.id, { style: { rounded } })}
        />
        <SwitchRow
          label="Show primary button"
          checked={section.style.showPrimaryCta !== false}
          onChange={(showPrimaryCta) => patch(section.id, { style: { showPrimaryCta } })}
        />
        <SwitchRow
          label="Show second button"
          checked={section.style.showSecondaryCta !== false}
          onChange={(showSecondaryCta) => patch(section.id, { style: { showSecondaryCta } })}
        />
      </Group>
    </div>
  );
}

function MediaTab({
  section,
  patch,
}: {
  section: SiteSection;
  patch: ReturnType<typeof useEdit>["patchSection"];
}) {
  return (
    <div className="space-y-4">
      <SelectField
        label="Image layout"
        value={section.style.imagePlacement ?? (section.content.image ? "below" : "hidden")}
        onChange={(imagePlacement) =>
          patch(section.id, { style: { imagePlacement: imagePlacement as ImagePlacement } })
        }
        options={[
          ["hidden", "No image"],
          ["below", "Below text, inset"],
          ["bleed", "Full-width strip"],
          ["cover", "Fill the section"],
          ["start", "Half, image first"],
          ["end", "Half, image last"],
        ]}
      />
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Image width %"
          value={section.style.imageWidth ?? 70}
          onChange={(imageWidth) => patch(section.id, { style: { imageWidth } })}
        />
        <NumberField
          label="Max height"
          value={section.style.imageHeight ?? 280}
          onChange={(imageHeight) => patch(section.id, { style: { imageHeight } })}
        />
      </div>
      <SwitchRow
        label="Rounded images"
        checked={
          section.style.imageRounded ??
          (section.style.imagePlacement === "below" ||
            section.style.imagePlacement === "start" ||
            section.style.imagePlacement === "end")
        }
        onChange={(imageRounded) => patch(section.id, { style: { imageRounded } })}
      />
      <ImageUpload
        label="Arabic image"
        value={section.content.image?.ar}
        onChange={(url) =>
          patch(section.id, {
            content: { image: { ar: url, en: section.content.image?.en || url } },
            style: {
              imagePlacement:
                section.style.imagePlacement === "hidden" ? "below" : section.style.imagePlacement,
            },
          })
        }
        onClear={() =>
          patch(section.id, {
            content: { image: { ar: "", en: section.content.image?.en || "" } },
          })
        }
      />
      <ImageUpload
        label="English image"
        value={section.content.image?.en}
        onChange={(url) =>
          patch(section.id, {
            content: { image: { ar: section.content.image?.ar || url, en: url } },
            style: {
              imagePlacement:
                section.style.imagePlacement === "hidden" ? "below" : section.style.imagePlacement,
            },
          })
        }
        onClear={() =>
          patch(section.id, {
            content: { image: { ar: section.content.image?.ar || "", en: "" } },
          })
        }
      />
      <button
        type="button"
        className="h-10 w-full rounded-full bg-red-50 text-sm font-semibold text-red-700"
        onClick={() =>
          patch(section.id, {
            content: { image: { ar: "", en: "" } },
            style: { imagePlacement: "hidden" },
          })
        }
      >
        Remove all images
      </button>
      {section.type === "marquee" ? (
        <GalleryEditor
          items={section.content.gallery ?? []}
          onChange={(gallery) => patch(section.id, { content: { gallery } })}
        />
      ) : null}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">{title}</p>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-xs text-oxford/60">
      <span className="mb-1 block">{label}</span>
      <input
        type="number"
        className="h-9 w-full rounded-xl border border-oxford/12 bg-cream px-2.5 text-sm text-oxford"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs text-oxford/60">
      <span className="mb-1 block">{label}</span>
      <div className="flex h-9 items-center gap-2 rounded-xl border border-oxford/12 bg-cream px-2">
        <input
          type="color"
          className="size-6 cursor-pointer rounded"
          value={value.startsWith("#") ? value : "#0a2540"}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          className="w-full bg-transparent text-sm text-oxford outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-2 block text-xs text-oxford/60">
      <span className="mb-1 block">{label}</span>
      <input
        className="h-9 w-full rounded-xl border border-oxford/12 bg-white px-2.5 text-sm text-oxford"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block text-xs text-oxford/60">
      <span className="mb-1 block">{label}</span>
      <select
        className="h-9 w-full rounded-xl border border-oxford/12 bg-cream px-2.5 text-sm text-oxford"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([id, labelText]) => (
          <option key={id} value={id}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex h-10 items-center justify-between gap-3 border-b border-oxford/6 text-sm last:border-0">
      <span className="text-oxford">{label}</span>
      <input
        type="checkbox"
        className="size-4 accent-oxford"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function BilingualField({
  label,
  value,
  multiline,
  onChange,
}: {
  label: string;
  value?: Localized;
  multiline?: boolean;
  onChange: (value: Localized) => void;
}) {
  const current = value ?? { ar: "", en: "" };
  const Field = multiline ? "textarea" : "input";
  return (
    <div>
      <p className="mb-1 text-xs text-oxford/60">{label}</p>
      <div className="grid gap-2">
        <Field
          className="w-full rounded-xl border border-oxford/12 bg-cream px-2.5 py-2 text-sm text-oxford"
          placeholder="عربي"
          dir="rtl"
          value={current.ar}
          rows={multiline ? 3 : undefined}
          onChange={(event) => onChange({ ...current, ar: event.currentTarget.value })}
        />
        <Field
          className="w-full rounded-xl border border-oxford/12 bg-cream px-2.5 py-2 text-sm text-oxford"
          placeholder="English"
          dir="ltr"
          value={current.en}
          rows={multiline ? 3 : undefined}
          onChange={(event) => onChange({ ...current, en: event.currentTarget.value })}
        />
      </div>
    </div>
  );
}

function GalleryEditor({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  return (
    <div className="rounded-2xl bg-cream/80 p-3">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-oxford/45 uppercase">
        Scrolling images
      </p>
      {items.map((item, index) => (
        <div key={`${item.src}-${index}`} className="mb-3 rounded-xl bg-white p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt="" className="mb-2 max-h-20 w-full object-contain" />
          <input
            className="mb-2 h-9 w-full rounded-xl border border-oxford/12 px-2.5 text-sm"
            placeholder="Link (optional)"
            value={item.href ?? ""}
            onChange={(event) =>
              onChange(items.map((row, i) => (i === index ? { ...row, href: event.target.value } : row)))
            }
          />
          <button
            type="button"
            className="text-xs font-semibold text-red-700"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <ImageUpload label="Add image" onChange={(url) => onChange([...items, { src: url }])} />
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
}) {
  return (
    <div className="text-xs text-oxford/60">
      <p className="mb-1">{label}</p>
      {value ? (
        <div className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="max-h-24 w-full rounded-xl object-contain object-top" />
          {onClear ? (
            <button type="button" className="mt-1 text-xs font-semibold text-red-700" onClick={onClear}>
              Remove this image
            </button>
          ) : null}
        </div>
      ) : null}
      <input
        type="file"
        accept="image/*"
        className="block w-full text-xs"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const data = new FormData();
          data.set("file", file);
          const response = await fetch("/api/site/upload", { method: "POST", body: data });
          const payload = (await response.json()) as { url?: string; error?: string };
          if (!response.ok || !payload.url) {
            toast.error(payload.error || "Could not upload image");
            return;
          }
          onChange(payload.url);
        }}
      />
    </div>
  );
}
