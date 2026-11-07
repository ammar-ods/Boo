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
      <p className="inline-flex rounded-full bg-chip px-3 py-1 text-xs font-medium text-oxford">
        Atelier storefront
      </p>
      <h1 className="mt-4 font-heading text-5xl text-oxford">{heading}</h1>
      <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">
        Filter by discipline, then open a piece in the customizer. Every inquiry is saved
        for the studio desk with a mockup and your original files.
      </p>
      <ProductGrid products={products} collection={collection} query={q} />
    </div>
  );
}
