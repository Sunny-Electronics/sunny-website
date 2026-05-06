import { useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Clock,
  Download,
  FileUp,
  History,
  Plus,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import sunnyLogo from "@assets/image_1775118121182.png";

const quoteColumns = [
  "Product",
  "Quantity",
  "Target Date",
  "SPA Ref.",
  "Package",
  "Frequency",
  "Voltage",
  "Tolerance",
  "Temp Range",
  "Datasheet",
  "Note",
  "Quote Status",
];

const sampleRows = [
  {
    product: "SXO-7050 series",
    quantity: "10,000",
    target: "2026-06-30",
    ref: "Project A",
    package: "7.0 x 5.0 mm",
    frequency: "25.000 MHz",
    voltage: "3.3V",
    tolerance: "+/-25 ppm",
    temp: "-40C to +85C",
  },
  {
    product: "Crystal unit",
    quantity: "5,000",
    target: "2026-07-15",
    ref: "New design",
    package: "3.2 x 2.5 mm",
    frequency: "32.000 MHz",
    voltage: "-",
    tolerance: "+/-10 ppm",
    temp: "-20C to +70C",
  },
];

export default function RequestQuote() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [listStarted, setListStarted] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">RFQ Center</div>
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50">
            <Input
              className="h-12 flex-1 border-0 bg-transparent focus-visible:ring-0"
              placeholder="Enter keyword, part number, frequency, or document"
              data-testid="input-rfq-search"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hidden h-12 items-center gap-2 px-4 text-sm font-semibold text-primary md:flex"
              data-testid="button-upload-list-header"
            >
              <Upload className="h-4 w-4" />
              Upload a List
            </button>
            <button
              type="button"
              className="flex h-12 w-14 items-center justify-center bg-primary text-white"
              aria-label="Search"
              data-testid="button-rfq-search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          <Link href="/request-access">
            <Button variant="outline" className="h-12 gap-2">
              <History className="h-4 w-4" />
              Quote History
            </Button>
          </Link>
        </div>

        <nav className="mx-auto flex max-w-7xl items-center gap-8 px-5 pb-4 text-sm font-semibold">
          <Link href="/" className="text-slate-600 hover:text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Home
          </Link>
          <a href="#list" className="text-slate-600 hover:text-primary">Create List</a>
          <a href="#upload" className="text-slate-600 hover:text-primary">Upload RFQ</a>
          <a href="#details" className="text-slate-600 hover:text-primary">Request Details</a>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
                Request a Quote
              </p>
              <h1 className="mb-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Build your RFQ list fast.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                Search by part number, upload an Excel list, or create a list manually.
                Sunny will review price, lead time, stock, datasheets, and QA documents
                after your request is submitted.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  className="h-11 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-list"
                >
                  <FileUp className="h-4 w-4" />
                  Upload a List
                </Button>
                <Button
                  variant="outline"
                  className="h-11 gap-2 bg-white"
                  onClick={() => setListStarted(true)}
                  data-testid="button-create-list"
                >
                  <Plus className="h-4 w-4" />
                  Create List
                </Button>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-primary" />
                What Sunny will confirm
              </div>
              <div className="grid gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Price and lead time after review
                </div>
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 text-slate-400" />
                  Datasheets, QA documents, and spec availability
                </div>
                <div className="flex items-center gap-3">
                  <History className="h-4 w-4 text-slate-400" />
                  Quote history later through Sunny Portal Access (SPA)
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="upload" className="mx-auto max-w-7xl px-5 py-8">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xls,.xlsx,.csv,.pdf"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
          />

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="border border-dashed border-slate-300 bg-white p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold">Upload or create your RFQ list</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Upload Excel, CSV, or PDF. We will support Sunny part guides and SPA templates later.
                  </p>
                  {fileName && (
                    <p className="mt-3 text-sm font-semibold text-primary">Selected file: {fileName}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="h-11 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
              </div>
            </div>

            <div id="details" className="border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-display text-xl font-bold">Request details</h2>
              <div className="grid gap-3">
                <Input placeholder="Company name" data-testid="input-company" />
                <Input placeholder="Your email" data-testid="input-email" />
                <Input placeholder="Industry / application" data-testid="input-industry" />
                <Input placeholder="Target annual quantity" data-testid="input-annual-quantity" />
                <Textarea placeholder="Special requirements, QA documents, or notes" rows={4} />
              </div>
            </div>
          </div>
        </section>

        {listStarted && (
          <section id="list" className="mx-auto max-w-7xl px-5 pb-16">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">RFQ List</h2>
                <p className="text-sm text-slate-600">
                  Add parts now. Price, lead time, stock, and QA documents will be confirmed by Sunny.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2 bg-white">
                  <Plus className="h-4 w-4" />
                  Add Parts
                </Button>
                <Button className="gap-2">
                  Create Quote Request
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-300 bg-white">
              <table className="min-w-[1320px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-300 text-xs uppercase text-slate-800">
                  <tr>
                    <th className="w-10 border-r border-slate-400 px-3 py-3">#</th>
                    {quoteColumns.map((column) => (
                      <th key={column} className="border-r border-slate-400 px-3 py-3">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleRows.map((row, index) => (
                    <tr key={index} className="border-t border-slate-200">
                      <td className="border-r border-slate-200 px-3 py-4 font-semibold">{index + 1}</td>
                      <td className="border-r border-slate-200 px-3 py-4">{row.product}</td>
                      <td className="border-r border-slate-200 px-3 py-4">{row.quantity}</td>
                      <td className="border-r border-slate-200 px-3 py-4">{row.target}</td>
                      <td className="border-r border-slate-200 px-3 py-4">{row.ref}</td>
                      <td className="border-r border-slate-200 px-3 py-4">{row.package}</td>
                      <td className="border-r border-slate-200 px-3 py-4">{row.frequency}</td>
                      <td className="border-r border-slate-200 px-3 py-4">{row.voltage}</td>
                      <td className="border-r border-slate-200 px-3 py-4">{row.tolerance}</td>
                      <td className="border-r border-slate-200 px-3 py-4">{row.temp}</td>
                      <td className="border-r border-slate-200 px-3 py-4 text-primary">Pending</td>
                      <td className="border-r border-slate-200 px-3 py-4">-</td>
                      <td className="px-3 py-4 font-semibold text-amber-700">Needs review</td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td className="border-r border-slate-200 px-3 py-4 font-semibold">3</td>
                    <td className="border-r border-slate-200 px-3 py-4">
                      <Input className="h-9 bg-white" placeholder="Add part number" />
                    </td>
                    <td className="border-r border-slate-200 px-3 py-4">
                      <Input className="h-9 bg-white" placeholder="Qty" />
                    </td>
                    <td className="border-r border-slate-200 px-3 py-4">
                      <Input className="h-9 bg-white" placeholder="Date" />
                    </td>
                    <td colSpan={9} className="px-3 py-4 text-slate-500">
                      Add remaining details if known. Sunny can review missing specs later.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
