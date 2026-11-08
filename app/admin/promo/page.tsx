import { getSite } from "@/lib/local-db";
import { PromoForm } from "@/components/admin/promo-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PromoPage() {
  const site = await getSite();
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      <p className="font-script text-2xl text-boo-teal">studio</p>
      <h1 className="mt-1 font-heading text-4xl text-oxford">Promo popup</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Visitors see a short offer card on the storefront. Size, timing, and animation stay the same —
        you control the copy, optional image, and whether it is live.
      </p>
      <PromoForm
        live={site.promo.live}
        textAr={site.promo.text.ar}
        textEn={site.promo.text.en}
        image={site.promo.image}
        payPhone={site.chrome.payPhone}
      />
    </div>
  );
}
