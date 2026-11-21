import Link from "next/link";
import { ClipboardList, Globe, Sheet } from "lucide-react";

const CARDS = [
  {
    href: "/admin/inquiries",
    title: "Orders",
    body: "Every checkout from the shop lands here. Open an order for customer details, mockups, and status.",
    icon: ClipboardList,
  },
  {
    href: "/admin/website",
    title: "Website Settings",
    body: "Pages, products, categories, promo, forms, and shop settings — everything that shapes the storefront.",
    icon: Globe,
  },
  {
    href: "/admin/accounting",
    title: "Accounting sheet",
    body: "Books and money for the studio. This section is ready — details come next.",
    icon: Sheet,
  },
];

export default function AdminHomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-script text-2xl text-boo-teal">studio</p>
      <h1 className="mt-1 font-heading text-4xl text-oxford sm:text-5xl">Desk</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Pick a desk. Orders, the website, or accounting.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex min-h-[18rem] flex-col rounded-[1.8rem] bg-white p-7 shadow-sm ring-1 ring-oxford/8 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-cream text-oxford ring-1 ring-oxford/8">
                <Icon className="size-6" />
              </span>
              <h2 className="mt-8 font-heading text-3xl text-oxford">{card.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
              <span className="mt-6 text-sm font-semibold text-oxford/50 transition group-hover:text-oxford">
                Open →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
