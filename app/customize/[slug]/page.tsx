import { notFound } from "next/navigation";
import { CustomizerShell } from "@/components/customizer/customizer-shell";
import { getCatalogProduct } from "@/lib/local-db";

export const dynamic = "force-dynamic";

export default async function CustomizePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product || product.archived) notFound();
  return <CustomizerShell product={product} />;
}
