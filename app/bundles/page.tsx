import { EnsureCmsPage } from "@/components/cms/ensure-cms-page";
import { SiteCanvas } from "@/components/cms/site-canvas";
import { getBundles, getLiveCatalog } from "@/lib/local-db";

export const dynamic = "force-dynamic";

export default async function BundlesPage() {
  const [bundles, products] = await Promise.all([getBundles(), getLiveCatalog()]);
  return (
    <>
      <EnsureCmsPage slug="bundles" title={{ ar: "الباقات", en: "Bundles" }} />
      <SiteCanvas products={products} bundles={bundles} />
    </>
  );
}
