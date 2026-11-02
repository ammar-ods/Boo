import Link from "next/link";
import { ProductGrid } from "@/components/catalog/product-grid";
import { BooLogo } from "@/components/brand/boo-logo";

export default function HomePage() {
  return (
    <div>
      <section className="star-wash border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-script text-3xl text-boo-pink">Giza apartment studio</p>
            <h1 className="mt-2 max-w-xl font-heading text-5xl leading-tight text-boo-ink sm:text-6xl">
              Custom creations, made with love.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Apparel, mugs, laser-cut wood, acrylic medals, and vinyl stickers —
              designed in-browser, quoted over WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-full bg-boo-teal px-6 py-3 font-heading text-white"
              >
                Shop the catalog
              </Link>
              <Link
                href="#about"
                className="rounded-full border border-border bg-white px-6 py-3 font-heading"
              >
                About the studio
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-foreground/10">
            <div className="chrome-bar -mx-6 -mt-6 mb-6 h-3" />
            <BooLogo />
            <div className="mt-6 grid grid-cols-2 gap-3 text-center font-heading">
              {["Tees", "Mugs", "Wood", "Acrylic"].map((item) => (
                <div key={item} className="rounded-2xl bg-secondary py-6">
                  {item}
                </div>
              ))}
            </div>
            <p className="font-script mt-5 text-center text-2xl text-boo-teal">
              made with love
            </p>
          </div>
        </div>
      </section>

      <section id="creations" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-script text-2xl text-boo-orange">creations</p>
            <h2 className="font-heading text-4xl">Pick a blank. Make it yours.</h2>
          </div>
          <Link href="/catalog" className="font-heading text-boo-teal">
            View all →
          </Link>
        </div>
        <ProductGrid />
      </section>

      <section id="about" className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-4xl">A tiny studio with a loud sparkle.</h2>
            <p className="mt-4 text-muted-foreground">
              BOO Custom Creations is a Giza-based fabrication desk for one-off gifts,
              merch drops, and keepsake signage. Upload a file, place it freely on the
              product, and send an inquiry — we quote and produce from the mockup.
            </p>
          </div>
          <div id="contact" className="rounded-[1.6rem] bg-boo-teal p-8 text-white">
            <h3 className="font-heading text-3xl">Say hello</h3>
            <p className="mt-3 text-white/90">123 Maker Way, Giza, Egypt</p>
            <p>@boocustomcreations</p>
            <p className="mt-6 font-script text-3xl">Your creative business, made with love.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
