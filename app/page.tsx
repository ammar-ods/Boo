import { SiteCanvas } from "@/components/cms/site-canvas";
import { getBundles, getLiveCatalog } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [products, bundles] = await Promise.all([getLiveCatalog(), getBundles()]);
  return <SiteCanvas products={products} bundles={bundles} />;
}
