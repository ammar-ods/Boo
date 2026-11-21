import { FinanceNav } from "@/components/admin/finance-nav";

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <p className="font-script text-2xl text-boo-teal">books</p>
      <h1 className="mt-1 font-heading text-4xl text-oxford">Financial sheet</h1>
      <p className="mt-2 mb-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Cash, sales, spendings, and assets for the studio.
      </p>
      <FinanceNav />
      {children}
    </div>
  );
}
