import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-script text-2xl text-oxford/70">out of batch</p>
      <h1 className="font-heading text-4xl text-oxford">That page left the atelier.</h1>
      <Link href="/catalog" className="mt-6 rounded-full bg-oxford px-5 py-2 text-sm font-medium text-white">
        Back to shop
      </Link>
    </div>
  );
}
