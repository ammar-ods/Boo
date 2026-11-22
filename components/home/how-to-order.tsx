"use client";

import { EditableCopy } from "@/components/cms/editable-copy";
import type { StorefrontCopyKey } from "@/lib/site";

const STEPS: { n: StorefrontCopyKey; title: StorefrontCopyKey; body: StorefrontCopyKey; tone: "neutral" | "gold" | "green" }[] = [
  { n: "howTo1n", title: "howTo1title", body: "howTo1body", tone: "neutral" },
  { n: "howTo2n", title: "howTo2title", body: "howTo2body", tone: "gold" },
  { n: "howTo3n", title: "howTo3title", body: "howTo3body", tone: "green" },
];

export function HowToOrder() {
  return (
    <section className="bg-cream py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-12">
        <EditableCopy
          k="howToEyebrow"
          as="span"
          className="mb-2 block text-[11px] font-bold tracking-[0.16em] text-[#C59B27] uppercase"
        />
        <EditableCopy
          k="howToTitle"
          as="h2"
          className="mb-4 block font-heading text-2xl font-bold text-oxford sm:text-[32px] sm:leading-[46px]"
        />
        <EditableCopy
          k="howToBody"
          as="p"
          className="mx-auto mb-12 block max-w-xl text-sm text-muted-foreground sm:text-base"
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="flex flex-col items-center rounded-[16px] bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`mb-5 grid size-16 place-items-center rounded-[16px] font-heading text-[32px] font-bold ${
                  step.tone === "gold"
                    ? "bg-[#FBF5E6] text-[#C59B27]"
                    : step.tone === "green"
                      ? "bg-[#eae8e4] text-[#25D366]"
                      : "bg-[#eae8e4] text-oxford"
                }`}
              >
                <EditableCopy k={step.n} />
              </div>
              <EditableCopy k={step.title} as="h3" className="mb-2 block font-heading text-lg font-bold text-oxford" />
              <EditableCopy k={step.body} as="p" className="block text-sm leading-relaxed text-muted-foreground sm:text-base" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
