import { CartPage } from "@/components/shop/cart-page";
import { getBundles, getLiveCatalog } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CartRoute() {
  const [products, bundles] = await Promise.all([getLiveCatalog(), getBundles()]);
  return <CartPage products={products} bundles={bundles} />;
}
