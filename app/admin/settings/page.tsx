import { getSite } from "@/lib/local-db";
import { ShopSettingsForm } from "@/components/admin/shop-settings-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const site = await getSite();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <p className="font-script text-2xl text-boo-teal">studio</p>
      <h1 className="mt-1 font-heading text-4xl text-oxford">Settings</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Shipping, WhatsApp, contact destination, and the fields shown on contact and checkout.
      </p>
      <ShopSettingsForm
        commerce={site.commerce}
        whatsappPhone={site.chrome.whatsappPhone}
        payPhone={site.chrome.payPhone}
        showDiscipline={site.chrome.showDiscipline !== false}
      />
    </div>
  );
}
