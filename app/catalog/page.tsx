import { ProductGrid } from "@/components/catalog/product-grid";
import { getLiveCatalog } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TITLES: Record<string, string> = {
  "creator-kits": "Creator Kits",
  "studio-gear": "Studio Gear",
  gifts: "Curated Gifts",
  "staff-picks": "Staff Picks",
  "under-50": "Drops Under $50",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; q?: string }>;
}) {
  const products = await getLiveCatalog();
  const { collection, q } = await searchParams;
  const heading = (collection && TITLES[collection]) || (q ? `Search: ${q}` : "The catalog");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs tracking-[0.2em] text-oxford/60">ATELIER STOREFRONT</p>
      <h1 className="mt-2 font-heading text-5xl text-oxford">{heading}</h1>
      <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">
        Filter by discipline, then open a piece in the customizer. Every inquiry is saved
        for the studio desk with a mockup and your original files.
      </p>
      <ProductGrid products={products} collection={collection} query={q} />
    </div>
  );
}
