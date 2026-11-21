import Link from "next/link";
import { FolderOpen, Gift, LayoutTemplate, Package, SlidersHorizontal, Tags } from "lucide-react";

const LINKS = [
  {
    href: "/",
    title: "Pages",
    body: "Open the live site and edit sections, banners, and copy.",
    icon: LayoutTemplate,
  },
  {
    href: "/admin/products",
    title: "Products",
    body: "Catalog, prices, photos, and customizer options.",
    icon: Package,
  },
  {
    href: "/admin/categories",
    title: "Categories",
    body: "Shop filters, category pages, and Discipline tiles.",
    icon: Tags,
  },
  {
    href: "/admin/promo",
    title: "Promo",
    body: "Popup, codes, and the transfer number shown at checkout.",
    icon: Gift,
  },
  {
    href: "/admin/forms",
    title: "Forms",
    body: "Contact and checkout fields: labels, required flags, and which inputs show.",
    icon: FolderOpen,
  },
  {
    href: "/admin/settings",
    title: "Settings",
    body: "Fonts, shipping, WhatsApp, and shop options.",
    icon: SlidersHorizontal,
  },
];

export default function WebsiteSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <p className="font-script text-2xl text-boo-teal">storefront</p>
      <h1 className="mt-1 font-heading text-4xl text-oxford">Website Settings</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Everything that builds the public shop, except orders and accounting.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-oxford/8 transition hover:shadow-lg"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-cream text-oxford">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-5 font-heading text-2xl text-oxford">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
