import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-script text-3xl text-boo-pink">oops</p>
      <h1 className="font-heading text-4xl">That page wandered off the safe zone.</h1>
      <Link href="/catalog" className="mt-6 rounded-full bg-boo-teal px-5 py-2 font-heading text-white">
        Back to shop
      </Link>
    </div>
  );
}
