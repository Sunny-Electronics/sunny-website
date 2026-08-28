import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, PackageSearch, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import sunnyLogo from "@assets/image_1775118121182.png";

type PublicStockRow = {
  stockNumber: string;
  partNumber: string;
  quantity: number;
};

const publicStock: PublicStockRow[] = [
  { stockNumber: "SR12130J6-32.0000", partNumber: "SX-21 32.0000 MHz", quantity: 286000 },
  { stockNumber: "SP20120E6-25.0000", partNumber: "SX-32 25.0000 MHz", quantity: 148000 },
  { stockNumber: "SVH3350DEBSR-74.250M", partNumber: "SVH 74.2500 MHz", quantity: 4200 },
  { stockNumber: "SLO-102525BDSR-171.925063M", partNumber: "SLO-10 171.925063 MHz", quantity: 3600 },
  { stockNumber: "STM12520B-32.768-TR", partNumber: "CS-2012 32.768 kHz", quantity: 512000 },
  { stockNumber: "SJ18120E6-4.915200-TR", partNumber: "SX-1 4.9152 MHz", quantity: 92000 },
];

export default function Stock() {
  const [query, setQuery] = useState("");
  const visibleRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return publicStock;
    return publicStock.filter((row) =>
      `${row.stockNumber} ${row.partNumber}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-11 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">Public Stock Check</div>
            </div>
          </Link>
          <div className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50">
            <Input
              className="h-11 flex-1 border-0 bg-transparent focus-visible:ring-0"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stock number or Sunny part number"
              aria-label="Search public stock"
              data-testid="input-stock-search"
            />
            <div className="flex h-11 w-14 items-center justify-center bg-primary text-white">
              <Search className="h-5 w-5" />
            </div>
          </div>
          <Link href="/request-quote">
            <Button className="h-11 gap-2" data-testid="button-stock-request-quote">
              <PackageSearch className="h-4 w-4" />
              Request Quote
            </Button>
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-5 pb-4 text-sm font-semibold">
          <Link href="/" className="text-slate-600 hover:text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Home
          </Link>
          <Link href="/products" className="text-slate-600 hover:text-primary">Products</Link>
          <Link href="/part-number-generator" className="text-slate-600 hover:text-primary">Part Number Generator</Link>
          <Link href="/request-quote" className="text-slate-600 hover:text-primary">RFQ</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">Public Availability</p>
          <h1 className="font-display text-4xl font-bold tracking-tight">Sunny Stock Check</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Public stock information is limited to stock number, Sunny part number, and quantity.
            Submit an RFQ for specifications, price, delivery, or document confirmation.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-5 py-4 text-sm font-semibold">Stock Number</th>
                <th className="px-5 py-4 text-sm font-semibold">Sunny Part Number</th>
                <th className="px-5 py-4 text-right text-sm font-semibold">Quantity</th>
                <th className="px-5 py-4 text-right text-sm font-semibold">RFQ</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.stockNumber} className="border-t border-slate-200">
                  <td className="px-5 py-5 font-mono text-sm font-bold text-primary">{row.stockNumber}</td>
                  <td className="px-5 py-5 text-sm font-semibold">{row.partNumber}</td>
                  <td className="px-5 py-5 text-right text-sm font-bold">{row.quantity.toLocaleString()}</td>
                  <td className="px-5 py-5 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/request-quote?spbn=${encodeURIComponent(row.stockNumber)}`}>Request Quote</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                    No matching public stock number or part number.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
