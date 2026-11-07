import { getBundles, getLiveCatalog } from "@/lib/local-db";
import { BundlesGrid } from "@/components/shop/bundles-grid";

export const dynamic = "force-dynamic";

export default async function BundlesPage() {
  const [bundles, products] = await Promise.all([getBundles(), getLiveCatalog()]);
  return <BundlesGrid bundles={bundles} products={products} />;
}
