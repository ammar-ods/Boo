import { getSite } from "@/lib/local-db";
import { FormsSettingsForm } from "@/components/admin/forms-settings-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminFormsPage() {
  const site = await getSite();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <p className="font-script text-2xl text-boo-teal">studio</p>
      <h1 className="mt-1 font-heading text-4xl text-oxford">Forms</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Contact and checkout fields: labels, required flags, and which inputs appear on those forms.
      </p>
      <FormsSettingsForm commerce={site.commerce} />
    </div>
  );
}
