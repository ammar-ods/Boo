"use client";

import { useI18n } from "@/lib/i18n";

export function HowToOrder() {
  const { t } = useI18n();
  const steps = [
    { n: t("howTo1n"), title: t("howTo1title"), body: t("howTo1body"), tone: "neutral" as const },
    { n: t("howTo2n"), title: t("howTo2title"), body: t("howTo2body"), tone: "gold" as const },
    { n: t("howTo3n"), title: t("howTo3title"), body: t("howTo3body"), tone: "green" as const },
  ];

  return (
    <section className="bg-cream py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-12">
        <span className="mb-2 block text-[11px] font-bold tracking-[0.16em] text-[#C59B27] uppercase">
          {t("howToEyebrow")}
        </span>
        <h2 className="mb-4 font-heading text-2xl font-bold text-oxford sm:text-[32px] sm:leading-[46px]">
          {t("howToTitle")}
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-sm text-muted-foreground sm:text-base">{t("howToBody")}</p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => (
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
                {step.n}
              </div>
              <h3 className="mb-2 font-heading text-lg font-bold text-oxford">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
