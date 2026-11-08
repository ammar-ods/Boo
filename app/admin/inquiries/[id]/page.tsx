import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaLightbox } from "@/components/admin/media-lightbox";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { OrderSaveForm } from "@/components/admin/order-save-form";
import { Label } from "@/components/ui/label";
import { getOrder } from "@/lib/local-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

function looksLikeImage(url: string) {
  return (
    /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url) ||
    url.includes("/storage/v1/object/") ||
    url.startsWith("/uploads/") ||
    url.startsWith("/products/") ||
    url.startsWith("data:image")
  );
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getOrder(id);
  if (!inquiry) notFound();

  const payload = (inquiry.canvas_json ?? {}) as {
    views?: { id?: string; label?: string; url?: string }[];
    uploads?: { name?: string; url?: string }[];
    payment?: { method?: string; transferPhone?: string; receiptUrl?: string };
  };
  const payment = payload.payment;
  const extras = (inquiry.production_paths ?? []).filter(
    (path) => path !== inquiry.mockup_path && path !== payment?.receiptUrl,
  );
  const labeledViews = (payload.views ?? []).filter((item) => item.url);
  const previewImages = (
    labeledViews.length
      ? labeledViews.map((item) => item.url as string)
      : [inquiry.mockup_path, ...extras]
  ).filter((path): path is string => typeof path === "string" && looksLikeImage(path));
  const uploadFiles = (payload.uploads ?? []).filter((item) => item.url);
  const otherFiles = extras.filter((path) => !looksLikeImage(path));

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <Link href="/admin/inquiries" className="inline-flex min-h-10 items-center text-sm text-oxford/70 hover:text-oxford">
        ← All orders
      </Link>
      <h1 className="mt-4 font-heading text-4xl text-oxford">#{inquiry.reference_code.replace("#", "")}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {inquiry.product_name} · {inquiry.customer_name} ·{" "}
        {inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : ""}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <div>
            <h2 className="font-heading text-xl text-oxford">Submitted preview</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              For mugs, the large card is the unfolded wrap — seam to seam — so you can see print placement.
            </p>
          </div>
          {previewImages.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previewImages.map((file, index) => (
                <article
                  key={file}
                  className={`overflow-hidden rounded-2xl bg-white ring-1 ring-foreground/10 ${
                    index === 0 ? "col-span-2 sm:col-span-2" : ""
                  }`}
                >
                  <MediaLightbox src={file} label={labeledViews[index]?.label || "Preview"}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file}
                      alt={labeledViews[index]?.label || (index === 0 ? "Front preview" : "Order preview")}
                      className={`w-full bg-[#f6f3ee] object-contain ${index === 0 ? "h-56" : "h-28"}`}
                    />
                  </MediaLightbox>
                  {labeledViews[index]?.label ? (
                    <p className="px-2.5 pt-2 text-xs font-semibold">{labeledViews[index]?.label}</p>
                  ) : null}
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2 text-xs">
                    <MediaLightbox src={file} label={labeledViews[index]?.label || "Preview"}>
                      <span className="font-heading text-boo-teal">View</span>
                    </MediaLightbox>
                    <a className="font-heading text-boo-orange" href={file} download>
                      Download
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] bg-white px-6 py-12 text-center text-sm text-muted-foreground ring-1 ring-oxford/8">
              No mockup preview is stored on this order yet.
            </div>
          )}

          <div>
            <h2 className="mb-3 font-heading text-xl text-oxford">Customer uploads</h2>
            <ul className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {uploadFiles.map((file) => (
                <li key={file.url} className="overflow-hidden rounded-2xl bg-white ring-1 ring-foreground/10">
                  {looksLikeImage(file.url || "") ? (
                    <MediaLightbox src={file.url || ""} label={file.name || "Upload"}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.url} alt={file.name || ""} className="h-28 w-full bg-[#f6f3ee] object-contain" />
                    </MediaLightbox>
                  ) : null}
                  <div className="px-3 py-2">
                    <p className="truncate text-xs text-muted-foreground">{file.name || file.url?.split("/").pop()}</p>
                    <div className="mt-2 flex gap-3 text-xs">
                      {looksLikeImage(file.url || "") ? (
                        <MediaLightbox src={file.url || ""} label={file.name || "Upload"}>
                          <span className="font-heading text-boo-teal">View</span>
                        </MediaLightbox>
                      ) : (
                        <a className="font-heading text-boo-teal" href={file.url} target="_blank" rel="noreferrer">
                          View
                        </a>
                      )}
                      <a className="font-heading text-boo-orange" href={file.url} download>
                        Download
                      </a>
                    </div>
                  </div>
                </li>
              ))}
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
              {previewImages.length === 0 && otherFiles.length === 0 && uploadFiles.length === 0 ? (
                <li className="col-span-full rounded-[1.4rem] bg-white px-6 py-8 text-center text-muted-foreground ring-1 ring-oxford/8">
                  No files were attached to this inquiry.
                </li>
              ) : otherFiles.length === 0 && uploadFiles.length === 0 ? (
                <li className="col-span-full rounded-[1.4rem] bg-white px-6 py-6 text-center text-muted-foreground ring-1 ring-oxford/8">
                  Artwork is in the preview images above.
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
        <OrderSaveForm>
          <input type="hidden" name="id" value={inquiry.id} />
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Phone</dt>
              <dd className="mt-0.5 text-oxford">{inquiry.customer_phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Payment</dt>
              <dd className="mt-0.5 text-oxford">
                {payment?.method === "online" ? "Online transfer" : payment?.method === "cod" ? "Cash on delivery" : "—"}
              </dd>
            </div>
            {payment?.method === "online" ? (
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Transfer phone
                </dt>
                <dd className="mt-0.5 text-oxford" dir="ltr">
                  {payment.transferPhone || "—"}
                </dd>
              </div>
            ) : null}
            {payment?.receiptUrl ? (
              <div>
                <dt className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Receipt
                </dt>
                <dd>
                  <MediaLightbox src={payment.receiptUrl} label="Receipt">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={payment.receiptUrl}
                      alt="Receipt"
                      className="h-28 w-full rounded-xl bg-[#f6f3ee] object-contain"
                    />
                  </MediaLightbox>
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Material</dt>
              <dd className="mt-0.5 text-oxford">{inquiry.material || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Quantity</dt>
              <dd className="mt-0.5 text-oxford">{inquiry.quantity}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-oxford">
                {inquiry.notes || "No notes"}
              </dd>
            </div>
          </dl>
          <div className="space-y-1.5">
            <Label htmlFor="quoted_price">Quoted price (EGP)</Label>
            <input
              id="quoted_price"
              name="quoted_price"
              type="number"
              step="0.01"
              defaultValue={inquiry.quoted_price ?? ""}
              className="h-11 w-full rounded-xl border border-input px-3 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={inquiry.status}
              className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
            >
              <option value="pending">pending</option>
              <option value="quoted">quoted</option>
              <option value="fulfilled">fulfilled</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Fulfilled or cancelled keeps mockups and uploads on file. Use Delete order to remove
            the record and its images.
          </p>
        </OrderSaveForm>
        <div className="rounded-[1.4rem] bg-white p-5 ring-1 ring-oxford/8">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Permanently remove this order from the dashboard, database, and storage.
          </p>
          <DeleteOrderButton id={inquiry.id} reference={inquiry.reference_code} />
        </div>
        </div>
      </div>
    </div>
  );
}
