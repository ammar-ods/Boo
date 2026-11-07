import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; product?: string }>;
}) {
  const { ref } = await searchParams;
  const reference = ref ? (ref.startsWith("#") ? ref : `#${ref}`) : null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-script text-3xl text-oxford/70">selected with taste</p>
      <h1 className="mt-2 font-heading text-5xl text-oxford">شكرًا لطلبك</h1>
      <p className="mt-4 text-muted-foreground">
        استلمنا طلبك
        {reference ? (
          <>
            {" "}
            برقم <span className="font-medium text-oxford">{reference}</span>
          </>
        ) : null}
        . هنتواصل معاك لتأكيد التوصيل.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/catalog" className="btn-press">
          رجوع للمتجر
        </Link>
        <Link href="/" className="btn-press btn-press-outline">
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
