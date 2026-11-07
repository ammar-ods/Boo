import Link from "next/link";
import { ProductGrid } from "@/components/catalog/product-grid";
import { DisciplineCarousel } from "@/components/home/discipline-carousel";
import { getLiveCatalog } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FAQS = [
  {
    q: "Is this a live checkout?",
    a: "You customize a piece and send an inquiry. The atelier quotes, then produces from the saved mockup.",
  },
  {
    q: "What files work best?",
    a: "PNG or SVG with a transparent background for prints. High-contrast black artwork for laser wood and acrylic.",
  },
  {
    q: "Creator assurance?",
    a: "30-day studio trial language, carbon-neutral courier tracking after quote, and a live concierge for setup questions.",
  },
];

export default async function HomePage() {
  const products = await getLiveCatalog();
  const drop = products[0];

  return (
    <div>
      <section className="px-4 pb-6 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mx-auto inline-flex rounded-full bg-chip px-3.5 py-1 text-xs font-medium text-oxford">
            Oxford atelier · selected with taste
          </p>
          <h1 className="mt-5 font-heading text-5xl leading-[1.12] text-oxford sm:text-6xl lg:text-[4.25rem]">
            Creator tools, <span className="italic">chosen for the desk.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Micro-batch hardware, aesthetic desk gear, and bespoke letterpress gifts
            for studios that refuse generic clutter.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/catalog" className="btn-press">
              Shop the drop →
            </Link>
            <Link href="/catalog?collection=gifts" className="btn-press btn-press-outline">
              Bespoke gifting
            </Link>
          </div>
          <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-2xl font-semibold text-oxford">5,000+</dt>
              <dd className="mt-1 text-muted-foreground">makers rated</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold text-oxford">#084/200</dt>
              <dd className="mt-1 text-muted-foreground">this week’s batch</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold text-oxford">30-day</dt>
              <dd className="mt-1 text-muted-foreground">studio trial</dd>
            </div>
          </dl>
        </div>
      </section>

      <DisciplineCarousel />

      {drop ? (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="surface-card flex flex-col items-start justify-between gap-6 bg-chip px-8 py-10 sm:flex-row sm:items-center sm:px-12">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-oxford/60">WEEKLY CREATOR DROP</p>
              <h2 className="mt-2 font-heading text-3xl text-oxford sm:text-4xl">{drop.name}</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">{drop.tagline}</p>
            </div>
            <Link href={`/customize/${drop.slug}`} className="btn-press shrink-0">
              Shop this drop →
            </Link>
          </div>
        </section>
      ) : null}

      <section id="creations" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-4xl text-oxford sm:text-5xl">Staff picks</h2>
          <p className="mt-2 text-muted-foreground">Top rated pieces from this week’s atelier batch.</p>
          <Link href="/catalog" className="mt-3 inline-block text-sm font-semibold text-oxford">
            View catalog →
          </Link>
        </div>
        <ProductGrid products={products} compact />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="overflow-hidden rounded-[32px] bg-oxford px-8 py-12 text-white sm:px-12">
          <p className="text-xs tracking-[0.2em] text-white/55">NIGHT OWL CREATOR SET</p>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl">Pocket Light · Mic Setup · Full Studio Box</h2>
          <p className="mt-3 max-w-xl text-sm text-white/70">
            Modular tiers from $39. Bundle the desk, keep the signal-to-noise high.
          </p>
          <Link href="/catalog" className="btn-press btn-press-light mt-8">
            Build a kit
          </Link>
        </div>
      </section>

      <section id="about" className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-4xl text-oxford">An atelier, not a catalog dump.</h2>
            <p className="mt-4 text-muted-foreground">
              Boo is built for digital creators, designers, studio builders, and
              discerning gifters. Every order is treated as an unboxing ritual — grosgrain,
              letterpress, and hardware that earns a permanent place on the desk.
            </p>
            <div className="mt-8 space-y-4">
              {FAQS.map((item) => (
                <div key={item.q}>
                  <h3 className="font-heading text-lg text-oxford">{item.q}</h3>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
          <div id="contact" className="rounded-[28px] bg-[#121214] p-8 text-white">
            <h3 className="font-heading text-3xl">Creator concierge</h3>
            <p className="mt-3 text-white/70">
              Live studio setup consultations after your inquiry. Pickup or carbon-neutral
              courier once the quote is locked.
            </p>
            <p className="font-script mt-6 text-2xl text-white/80">Tactile craft & longevity.</p>
            <Link href="/admin/login" className="btn-press btn-press-light mt-8">
              Studio log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
