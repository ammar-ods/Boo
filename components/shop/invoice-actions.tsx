"use client";

export function InvoiceActions({ title }: { title: string }) {
  return (
    <div className="invoice-actions flex flex-wrap justify-center gap-3 print:hidden">
      <button type="button" className="btn-press" onClick={() => window.print()}>
        {title}
      </button>
    </div>
  );
}
