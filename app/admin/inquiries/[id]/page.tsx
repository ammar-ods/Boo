import Image from "next/image";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateInquiryStatus } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdminClient } from "@/lib/supabase/admin";
import type { InquiryRecord } from "@/lib/inquiry-types";
import { inquiryFilePaths } from "@/lib/storage-cleanup";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("inquiries").select("*").eq("id", id).single();
  if (error || !data) notFound();
  const inquiry = data as InquiryRecord;

  const paths = inquiryFilePaths(inquiry);
  const signed = await Promise.all(
    paths.map(async (path) => {
      const { data: urlData } = await supabase.storage
        .from("inquiry-assets")
        .createSignedUrl(path, 60 * 30);
      return { path, url: urlData?.signedUrl ?? null };
    }),
  );
  const mockup = signed.find((item) => item.path === inquiry.mockup_path);
  const production = signed.filter((item) => item.path !== inquiry.mockup_path);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/admin/inquiries" className="text-sm text-boo-teal">
        ← All inquiries
      </Link>
      <h1 className="mt-3 font-heading text-4xl">
        {inquiry.reference_code.startsWith("#")
          ? inquiry.reference_code
          : `#${inquiry.reference_code}`}
      </h1>
      <p className="text-muted-foreground">
        {inquiry.product_name} · {inquiry.customer_name}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-foreground/10">
            {mockup?.url ? (
              <Image
                src={mockup.url}
                alt="Mockup"
                width={900}
                height={900}
                className="h-auto w-full"
              />
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
                <li key={file.path}>
                  {file.url ? (
                    <a className="text-boo-teal underline" href={file.url} target="_blank">
                      Download {file.path.split("/").pop()}
                    </a>
                  ) : (
                    file.path
                  )}
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
          <div>
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
            <p className="mt-3 text-sm">{inquiry.notes || "No notes"}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quoted_price">Quoted price</Label>
            <Input
              id="quoted_price"
              name="quoted_price"
              type="number"
              step="0.01"
              defaultValue={inquiry.quoted_price ?? ""}
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
            Setting status to fulfilled or cancelled deletes large files from Storage.
          </p>
          <Button type="submit" className="w-full rounded-full bg-boo-orange text-white">
            Save
          </Button>
        </form>
      </div>
    </div>
  );
}
