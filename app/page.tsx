import { SiteCanvas } from "@/components/cms/site-canvas";
import { getLiveCatalog } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const products = await getLiveCatalog();
  return <SiteCanvas products={products} />;
}
