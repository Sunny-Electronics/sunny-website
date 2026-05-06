import { Link } from "wouter";
import {
  ArrowLeft,
  CalendarClock,
  Download,
  FileSpreadsheet,
  Filter,
  LockKeyhole,
  PackageSearch,
  Search,
  ShieldCheck,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import sunnyLogo from "@assets/image_1775118121182.png";

const sourceWorkbook = "SunnyKR_Project_Files/08_OrderList_Stock_Pricing/sourcing schedule 26.05.06.xlsx";

const stockMetrics = [
  ["2,635", "Sourcing rows"],
  ["115.0M", "Total order qty"],
  ["85.7M", "Sent qty"],
  ["28.2M", "Rest balance"],
];

const stockColumns = [
  ["SOURCE DATE", "Source order date"],
  ["SOURCING", "Supplier / sourcing lane"],
  ["CUSTOMER", "SPA customer scope"],
  ["PACKAGE TYPE", "Product family"],
  ["Sunny MPN", "Sunny internal MPN"],
  ["FREQ (MHz)", "Frequency"],
  ["CL/VOLT", "Load capacitance or voltage"],
  ["ORDER", "Ordered quantity"],
  ["QTY", "Sent / produced quantity"],
  ["SENDING DATE", "Shipment or production date"],
  ["Rest Balance", "Remaining balance"],
  ["Request delivery", "Requested delivery date"],
  ["Replied delivery", "Confirmed or replied delivery"],
];

const topPackages = [
  ["SX-1", "499 rows"],
  ["SX-32", "400 rows"],
  ["SCO-10", "347 rows"],
  ["ATS-49/U", "281 rows"],
  ["SCO-32", "266 rows"],
  ["SX-8", "190 rows"],
];

export default function Stock() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">SunnyKR SPA Stock</div>
            </div>
          </Link>
          <div className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50">
            <Input className="h-12 flex-1 border-0 bg-transparent focus-visible:ring-0" placeholder="Search Sunny MPN, package type, frequency, supplier, or delivery status" />
            <button type="button" className="flex h-12 w-14 items-center justify-center bg-primary text-white" aria-label="Search stock">
              <Search className="h-5 w-5" />
            </button>
          </div>
          <Link href="/request-quote">
            <Button className="h-12 gap-2">
              <PackageSearch className="h-4 w-4" />
              Request Quote
            </Button>
          </Link>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-5 pb-4 text-sm font-semibold">
          <Link href="/request-access" className="text-slate-600 hover:text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            SPA Access
          </Link>
          <a href="#mapping" className="text-slate-600 hover:text-primary">Field Mapping</a>
          <a href="#security" className="text-slate-600 hover:text-primary">Security</a>
          <Link href="/order-list" className="text-slate-600 hover:text-primary">Order List</Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">SunnyKR Stock</p>
              <h1 className="mb-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
                SPA stock view based on SunnyKR sourcing schedule fields.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                The stock screen is shaped from the confidential SunnyKR sourcing schedule. Public pages
                show only safe summaries and field structure; row-level customer, supplier, quantity, and
                delivery records must load only after approved SPA login.
              </p>
            </div>
            <div className="grid grid-cols-2 border border-slate-200 bg-white shadow-sm">
              {stockMetrics.map(([value, label], index) => (
                <div key={label} className={`${index % 2 === 0 ? "border-r" : ""} ${index < 2 ? "border-b" : ""} border-slate-200 p-5`}>
                  <div className="text-3xl font-display font-bold text-primary">{value}</div>
                  <div className="text-xs font-semibold text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              [<FileSpreadsheet className="h-5 w-5" />, "Source Workbook", sourceWorkbook],
              [<Warehouse className="h-5 w-5" />, "Stock Logic", "Use ORDER, QTY, and Rest Balance for SPA availability."],
              [<CalendarClock className="h-5 w-5" />, "Delivery Logic", "Compare Request delivery with Replied delivery."],
              [<ShieldCheck className="h-5 w-5" />, "SPA Visibility", "Expose rows only through approved company permissions."],
            ].map(([icon, title, text]) => (
              <div key={String(title)} className="border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center bg-primary/10 text-primary">{icon}</div>
                <h2 className="font-display text-lg font-bold">{title}</h2>
                <p className="mt-2 break-words text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="mapping" className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Stock Field Mapping</h2>
                <p className="text-sm text-slate-600">Columns read from `sourcing schedule 26.05.06.xlsx`.</p>
              </div>
              <Button variant="outline" className="h-10 gap-2 bg-white">
                <Download className="h-4 w-4" />
                Export Mapping
              </Button>
            </div>
            <div className="overflow-x-auto border border-slate-300 bg-white">
              <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-300 text-xs uppercase text-slate-800">
                  <tr>
                    <th className="border-r border-slate-400 px-3 py-3">Workbook Column</th>
                    <th className="px-3 py-3">SunnyKR SPA Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {stockColumns.map(([column, meaning]) => (
                    <tr key={column} className="border-t border-slate-200">
                      <td className="border-r border-slate-200 px-3 py-3 font-semibold">{column}</td>
                      <td className="px-3 py-3 text-slate-700">{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
              <Filter className="h-4 w-4" />
              Top Package Types
            </div>
            <div className="grid gap-3">
              {topPackages.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
                  <span className="font-semibold">{name}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section id="security" className="bg-slate-950 py-10 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
                <LockKeyhole className="h-4 w-4" />
                Confidential SPA data
              </div>
              <h2 className="font-display text-3xl font-bold">Do not publish the workbook rows on public SunnyKR.com pages.</h2>
            </div>
            <Link href="/order-list">
              <Button variant="outline" className="h-12 bg-white text-slate-950 hover:bg-slate-100">
                View Order List
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
