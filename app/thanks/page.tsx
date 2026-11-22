"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EditableCopy } from "@/components/cms/editable-copy";

export default function ThanksPage() {
  return (
    <Suspense>
      <ThanksBody />
    </Suspense>
  );
}

function ThanksBody() {
  const ref = useSearchParams().get("ref");
  const reference = ref ? (ref.startsWith("#") ? ref : `#${ref}`) : null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
      <EditableCopy k="thankYou" as="h1" className="mt-2 font-heading text-5xl text-oxford" />
      <p className="mt-4 text-muted-foreground">
        <EditableCopy k="thankBody" />
        {reference ? (
          <>
            {" "}
            <span className="font-medium text-oxford">{reference}</span>
          </>
        ) : null}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/catalog" className="btn-press">
          <EditableCopy k="backShop" />
        </Link>
        <Link href="/" className="btn-press btn-press-outline">
          <EditableCopy k="home" />
        </Link>
      </div>
    </div>
  );
}
