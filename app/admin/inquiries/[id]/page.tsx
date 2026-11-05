import Link from "next/link";
import { notFound } from "next/navigation";
import { updateInquiryStatus } from "@/actions/admin";
import { Label } from "@/components/ui/label";
import { getOrder } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

function looksLikeImage(url: string) {
  return /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url) || url.includes("/storage/v1/object/");
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getOrder(id);
  if (!inquiry) notFound();

  const extras = (inquiry.production_paths ?? []).filter((path) => path !== inquiry.mockup_path);
  const previewImages = [inquiry.mockup_path, ...extras].filter(
    (path): path is string => typeof path === "string" && looksLikeImage(path),
  );
  const otherFiles = extras.filter((path) => !looksLikeImage(path));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/admin/inquiries" className="text-sm text-boo-teal">
        ← All orders
      </Link>
      <h1 className="mt-3 font-heading text-4xl">#{inquiry.reference_code.replace("#", "")}</h1>
      <p className="text-muted-foreground">
        {inquiry.product_name} · {inquiry.customer_name} ·{" "}
        {inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : ""}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <h2 className="font-heading text-xl">Submitted preview</h2>
          {previewImages.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previewImages.map((file) => (
                <article
                  key={file}
                  className="overflow-hidden rounded-2xl bg-white ring-1 ring-foreground/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file} alt="Order preview" className="h-28 w-full bg-[#f6f3ee] object-cover" />
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2 text-xs">
                    <a
                      className="font-heading text-boo-teal"
                      href={file}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                    <a className="font-heading text-boo-orange" href={file} download>
                      Download
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] bg-white p-10 text-sm text-muted-foreground ring-1 ring-foreground/10">
              No mockup preview is stored on this order yet.
            </div>
          )}

          <div>
            <h2 className="mb-2 font-heading text-xl">Customer uploads</h2>
            <ul className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {otherFiles.map((file) => (
                <li
                  key={file}
                  className="rounded-2xl bg-white px-3 py-3 ring-1 ring-foreground/10"
                >
                  <p className="truncate text-xs text-muted-foreground">{file.split("/").pop()}</p>
                  <div className="mt-2 flex gap-3 text-xs">
                    <a className="font-heading text-boo-teal" href={file} target="_blank" rel="noreferrer">
                      View
                    </a>
                    <a className="font-heading text-boo-orange" href={file} download>
                      Download
                    </a>
                  </div>
                </li>
              ))}
              {previewImages.length === 0 && otherFiles.length === 0 ? (
                <li className="text-muted-foreground">No files were attached to this inquiry.</li>
              ) : otherFiles.length === 0 ? (
                <li className="text-muted-foreground">Artwork is in the preview images above.</li>
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
              <span className="text-muted-foreground">Material:</span> {inquiry.material || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Quantity:</span> {inquiry.quantity}
            </p>
            <p className="mt-3 whitespace-pre-wrap">{inquiry.notes || "No notes"}</p>
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
            Fulfilled or cancelled removes stored mockup files from storage.
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
