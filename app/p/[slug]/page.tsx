import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { EnsureCmsPage } from "@/components/cms/ensure-cms-page";
import { SiteCanvas } from "@/components/cms/site-canvas";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { getLiveCatalog, getSite } from "@/lib/local-db";
import { pageSlugify, pick, RESERVED_PAGE_SLUGS } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function adminSession() {
  try {
    const token = (await cookies()).get(adminCookieName())?.value;
    return await isValidAdminSession(token);
  } catch {
    return false;
  }
}

export default async function CmsPageView({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = pageSlugify(decodeURIComponent(raw || ""));
  if (!slug || RESERVED_PAGE_SLUGS.has(slug)) notFound();
  const site = await getSite();
  const page = site.pages.find((item) => item.slug === slug);
  const isAdmin = await adminSession();
  if (!isAdmin && (!page || !page.visible)) notFound();
  const products = await getLiveCatalog();
  return (
    <>
      <EnsureCmsPage slug={slug} />
      <SiteCanvas products={products} />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  const slug = pageSlugify(decodeURIComponent(raw || ""));
  const site = await getSite();
  const page = site.pages.find((item) => item.slug === slug);
  if (!page) return { title: "Boo" };
  return { title: `${pick(page.title, "en") || page.slug} — Boo` };
}
