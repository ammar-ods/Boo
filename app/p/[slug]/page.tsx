import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { SiteCanvas } from "@/components/cms/site-canvas";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { getLiveCatalog, getSite } from "@/lib/local-db";
import { pick } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CmsPageView({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getSite();
  const page = site.pages.find((item) => item.slug === slug);
  if (!page) notFound();
  let isAdmin = false;
  try {
    const token = (await cookies()).get(adminCookieName())?.value;
    isAdmin = await isValidAdminSession(token);
  } catch {
    isAdmin = false;
  }
  if (!page.visible && !isAdmin) notFound();
  const products = await getLiveCatalog();
  return <SiteCanvas products={products} />;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getSite();
  const page = site.pages.find((item) => item.slug === slug);
  if (!page) return { title: "Boo" };
  return { title: `${pick(page.title, "en") || page.slug} — Boo` };
}
