import Link from "next/link";
import { notFound } from "next/navigation";
import { updateInquiryStatus } from "@/actions/admin";
import { Label } from "@/components/ui/label";
import { getOrder } from "@/lib/local-db";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getOrder(id);
  if (!inquiry) notFound();

  const production = (inquiry.production_paths ?? []).filter(
    (path) => path !== inquiry.mockup_path,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/admin/inquiries" className="text-sm text-boo-teal">
        ← All orders
      </Link>
      <h1 className="mt-3 font-heading text-4xl">#{inquiry.reference_code.replace("#", "")}</h1>
      <p className="text-muted-foreground">
        {inquiry.product_name} · {inquiry.customer_name} ·{" "}
        {new Date(inquiry.created_at).toLocaleString()}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-foreground/10">
            {inquiry.mockup_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={inquiry.mockup_path} alt="Mockup" className="h-auto w-full" />
            ) : (
              <div className="p-10 text-sm text-muted-foreground">
                Mockup files were cleaned up after fulfillment or cancellation.
              </div>
            )}
          </div>
          <div>
            <h2 className="mb-2 font-heading text-xl">Production files</h2>
            <ul className="space-y-2 text-sm">
              {production.map((file) => (
                <li key={file}>
                  <a className="text-boo-teal underline" href={file} target="_blank">
                    Download {file.split("/").pop()}
                  </a>
                </li>
              ))}
              {production.length === 0 ? (
                <li className="text-muted-foreground">No high-res uploads on file.</li>
              ) : null}
            </ul>
          </div>
        </div>

        <form
          action={updateInquiryStatus}
          className="space-y-4 rounded-[1.4rem] bg-white p-5 ring-1 ring-foreground/10"
        >
          <input type="hidden" name="id" value={inquiry.id} />
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Phone:</span> {inquiry.customer_phone}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {inquiry.customer_email || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Material:</span> {inquiry.material}
            </p>
            <p>
              <span className="text-muted-foreground">Quantity:</span> {inquiry.quantity}
            </p>
            <p className="mt-3">{inquiry.notes || "No notes"}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quoted_price">Quoted price (EGP)</Label>
            <input
              id="quoted_price"
              name="quoted_price"
              type="number"
              step="0.01"
              defaultValue={inquiry.quoted_price ?? ""}
              className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={inquiry.status}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="pending">pending</option>
              <option value="quoted">quoted</option>
              <option value="fulfilled">fulfilled</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground">
            Fulfilled or cancelled removes the large production files from local storage.
          </p>
          <button
            type="submit"
            className="h-9 w-full rounded-full bg-boo-orange font-heading text-white"
          >
            Save order
          </button>
        </form>
      </div>
    </div>
  );
}
