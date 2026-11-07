import { Suspense } from "react";
import { SiteCanvas } from "@/components/cms/site-canvas";
import { cookies } from "next/headers";
import { getLiveCatalog, getSite } from "@/lib/local-db";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [products, site] = await Promise.all([getLiveCatalog(), getSite()]);
  const token = (await cookies()).get(adminCookieName())?.value;
  const isAdmin = await isValidAdminSession(token);

  return (
    <Suspense>
      <SiteCanvas initial={site} products={products} isAdmin={isAdmin} />
    </Suspense>
  );
}
