import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; product?: string }>;
}) {
  const { ref, product } = await searchParams;
  const reference = ref ? (ref.startsWith("#") ? ref : `#${ref}`) : null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-script text-4xl text-boo-pink">made with love</p>
      <h1 className="mt-2 font-heading text-5xl">Thank you</h1>
      <p className="mt-4 text-muted-foreground">
        We received your {product ? `${product} ` : ""}inquiry
        {reference ? (
          <>
            {" "}
            as <span className="font-heading text-boo-ink">{reference}</span>
          </>
        ) : null}
        . The studio will follow up with a quote.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        WhatsApp checkout is coming next — for now this confirmation is enough.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/catalog"
          className="rounded-full bg-boo-teal px-5 py-2 font-heading text-white"
        >
          Back to shop
        </Link>
        <Link href="/" className="rounded-full bg-white px-5 py-2 font-heading ring-1 ring-foreground/10">
          Home
        </Link>
      </div>
    </div>
  );
}
