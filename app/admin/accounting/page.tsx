export default function AccountingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <p className="font-script text-2xl text-boo-teal">books</p>
      <h1 className="mt-1 font-heading text-4xl text-oxford">Accounting sheet</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        This desk is set up and empty on purpose. The sheet, columns, and how money is tracked will land here next.
      </p>
      <div className="mt-10 min-h-[22rem] rounded-[1.8rem] bg-white p-8 ring-1 ring-oxford/8">
        <p className="text-sm text-oxford/45">No accounting data yet.</p>
      </div>
    </div>
  );
}
