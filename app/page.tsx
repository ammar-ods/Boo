import Link from "next/link";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getLiveCatalog } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DISCIPLINES = [
  {
    title: "Creator Kits",
    body: "Audio engineering, optics & fill, streaming, and mobile creation.",
    href: "/catalog?collection=creator-kits",
  },
  {
    title: "Studio Gear",
    body: "Mechanical boards, desk pads, ambient lightbars, monitor stands.",
    href: "/catalog?collection=studio-gear",
  },
  {
    title: "Curated Gifts",
    body: "Keepsake boxes, letterpress, milestone sets, and team gifting.",
    href: "/catalog?collection=gifts",
  },
  {
    title: "Drops Under $50",
    body: "Tactile accents, cable organizers, and entry creator lighting.",
    href: "/catalog?collection=under-50",
  },
];

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
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-oxford/70">OXFORD ATELIER</p>
            <h1 className="mt-4 max-w-xl font-heading text-5xl leading-[1.12] text-oxford sm:text-6xl">
              Creator tools, <span className="italic">selected with taste.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Micro-batch hardware, aesthetic desk gear, and bespoke letterpress gifts
              for studios that refuse generic clutter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-full bg-oxford px-6 py-3 text-sm font-medium text-white"
              >
                Shop the drop
              </Link>
              <Link
                href="/catalog?collection=gifts"
                className="rounded-full border border-border bg-white px-6 py-3 text-sm font-medium"
              >
                Bespoke gifting
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-2xl font-heading text-oxford">5,000+</dt>
                <dd className="text-muted-foreground">makers rated</dd>
              </div>
              <div>
                <dt className="text-2xl font-heading text-oxford">#084/200</dt>
                <dd className="text-muted-foreground">this week’s batch</dd>
              </div>
              <div>
                <dt className="text-2xl font-heading text-oxford">30-day</dt>
                <dd className="text-muted-foreground">studio trial</dd>
              </div>
            </dl>
          </div>
          <div className="overflow-hidden rounded-[20px] bg-white p-8 atelier-shadow ring-1 ring-border">
            <p className="text-xs tracking-[0.2em] text-oxford/60">WEEKLY CREATOR DROP</p>
            <h2 className="mt-3 font-heading text-3xl text-oxford">
              {drop?.name ?? "Night Owl Creator Set"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {drop?.tagline ?? "Serialized micro-batch. Pocket light, mic setup, full studio box."}
            </p>
            {drop ? (
              <Link
                href={`/customize/${drop.slug}`}
                className="mt-6 inline-flex rounded-full bg-oxford px-5 py-2.5 text-sm font-medium text-white"
              >
                Customize this drop
              </Link>
            ) : null}
            <p className="mt-6 text-xs text-muted-foreground">Micro-batch Edition · tactile craft, zero-plastic packing</p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs tracking-[0.2em] text-oxford/60">DISCIPLINES</p>
          <h2 className="mt-2 font-heading text-4xl text-oxford">Shop by studio practice.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DISCIPLINES.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[16px] bg-ivory p-5 ring-1 ring-border transition hover:-translate-y-0.5 atelier-shadow"
              >
                <h3 className="font-heading text-xl text-oxford">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="creations" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-oxford/60">STAFF PICKS</p>
            <h2 className="font-heading text-4xl text-oxford">Top rated by makers.</h2>
          </div>
          <Link href="/catalog" className="text-sm font-medium text-oxford">
            View catalog →
          </Link>
        </div>
        <ProductGrid products={products} compact />
      </section>

      <section className="border-y border-border bg-oxford text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs tracking-[0.2em] text-white/60">NIGHT OWL CREATOR SET</p>
            <h2 className="mt-2 font-heading text-3xl">Pocket Light · Mic Setup · Full Studio Box</h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Modular tiers from $39. Bundle the desk, keep the signal-to-noise high.
            </p>
          </div>
          <Link href="/catalog" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-oxford">
            Build a kit
          </Link>
        </div>
      </section>

      <section id="about" className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
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
          <div id="contact" className="rounded-[20px] bg-[#121214] p-8 text-white">
            <h3 className="font-heading text-3xl">Creator concierge</h3>
            <p className="mt-3 text-white/70">
              Live studio setup consultations after your inquiry. Pickup or carbon-neutral
              courier once the quote is locked.
            </p>
            <p className="font-script mt-6 text-2xl text-white/80">Tactile craft & longevity.</p>
            <Link
              href="/admin/login"
              className="mt-8 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-oxford"
            >
              Studio log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
