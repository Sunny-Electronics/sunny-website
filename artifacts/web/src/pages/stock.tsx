import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Box,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Filter,
  PackageSearch,
  Search,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import sunnyLogo from "@assets/image_1775118121182.png";

type StockRow = {
  aec: "Yes" | "No" | "Unknown";
  automotive: "Yes" | "No" | "Unknown";
  datasheet: "available" | "notYet";
  family: string;
  frequency: string;
  frequencyRange: string;
  frequencyStability: string;
  frequencyTolerance: string;
  loadCapacitance: string;
  military: "Yes" | "No";
  mode: string;
  outputLevel: string;
  outputType: string;
  packageType: string;
  packaging: "T&R" | "Bulk" | "Box";
  resonanceFrequency: string;
  resonanceResistance: string;
  seriesResistance: string;
  spbn: string;
  spq: string;
  stock: number;
  supplyVoltage: string;
  type: string;
};

const filters = [
  {
    title: "Sunny Model",
    options: ["SMD Crystal", "SMD Oscillator", "Oscillators", "Tuning Forks", "VCXO", "TCXO"],
  },
  {
    title: "In Stock",
    options: ["Yes"],
  },
  {
    title: "Package Type",
    options: ["ATS-49/U", "SX-1", "SX-3", "SX-8", "SX-21", "SX-32", "SCO-10", "SCO-53", "SLO-10", "SPO-10"],
  },
  {
    title: "Standard Frequency",
    options: ["4.9152", "8.0000", "16.0000", "25.0000", "27.0000", "32.0000", "74.2500", "171.925063"],
  },
  {
    title: "Frequency Stability",
    options: ["+/-10ppm", "+/-20ppm", "+/-25ppm", "+/-30ppm", "+/-50ppm", "+/-100ppm"],
  },
  {
    title: "Standard Frequency Range",
    options: ["0.032768 MHz", "4 to 12 MHz", "12 to 25 MHz", "25 to 50 MHz", "50 to 212.5 MHz"],
  },
  {
    title: "Frequency Tolerance",
    options: ["+/-10ppm", "+/-20ppm", "+/-30ppm", "+/-50ppm"],
  },
  {
    title: "Load Capacitance",
    options: ["6pF", "8pF", "10pF", "12pF", "18pF", "20pF"],
  },
  {
    title: "Series Resistance",
    options: ["40 Ohm", "50 Ohm", "60 Ohm", "80 Ohm", "100 Ohm"],
  },
  {
    title: "Resonance Resistance",
    options: ["40 Ohm", "50 Ohm", "60 Ohm", "80 Ohm", "100 Ohm"],
  },
  {
    title: "Output Type",
    options: ["Tri-state", "Enable/Disable", "No connection"],
  },
  {
    title: "Mode of Oscillation",
    options: ["Fundamental", "3rd Overtone", "5th Overtone"],
  },
  {
    title: "Supply Voltage",
    options: ["1.2V", "1.8V", "3.0V", "3.3V", "5V"],
  },
  {
    title: "Packaging",
    options: ["T&R", "Bulk", "Box"],
  },
  {
    title: "Output Level",
    options: ["HCMOS", "CMOS", "LVDS", "LVPECL", "Clipped Sinewave"],
  },
  {
    title: "AEC Qualified",
    options: ["Yes", "No", "Unknown"],
  },
  {
    title: "Automotive",
    options: ["Yes", "No", "Unknown"],
  },
  {
    title: "Military",
    options: ["Yes", "No"],
  },
];

const stockRows: StockRow[] = [
  {
    aec: "No",
    automotive: "No",
    datasheet: "available",
    family: "Crystals",
    frequency: "32.0000",
    frequencyRange: "25 to 50 MHz",
    frequencyStability: "+/-30ppm",
    frequencyTolerance: "+/-30ppm",
    loadCapacitance: "12pF",
    military: "No",
    mode: "Fundamental",
    outputLevel: "-",
    outputType: "-",
    packageType: "SX-21",
    packaging: "T&R",
    resonanceFrequency: "-",
    resonanceResistance: "80 Ohm",
    seriesResistance: "80 Ohm",
    spbn: "SR12130J6-32.0000",
    spq: "3,000 pcs",
    stock: 286000,
    supplyVoltage: "-",
    type: "SMD Crystal",
  },
  {
    aec: "No",
    automotive: "No",
    datasheet: "notYet",
    family: "Crystals",
    frequency: "25.0000",
    frequencyRange: "25 to 50 MHz",
    frequencyStability: "+/-30ppm",
    frequencyTolerance: "+/-20ppm",
    loadCapacitance: "20pF",
    military: "No",
    mode: "Fundamental",
    outputLevel: "-",
    outputType: "-",
    packageType: "SX-32",
    packaging: "T&R",
    resonanceFrequency: "-",
    resonanceResistance: "60 Ohm",
    seriesResistance: "60 Ohm",
    spbn: "SP20120E6-25.0000",
    spq: "3,000 pcs",
    stock: 148000,
    supplyVoltage: "-",
    type: "SMD Crystal",
  },
  {
    aec: "Unknown",
    automotive: "Unknown",
    datasheet: "available",
    family: "Oscillators",
    frequency: "74.2500",
    frequencyRange: "50 to 212.5 MHz",
    frequencyStability: "+/-50ppm",
    frequencyTolerance: "-",
    loadCapacitance: "-",
    military: "No",
    mode: "VCXO",
    outputLevel: "HCMOS",
    outputType: "Tri-state",
    packageType: "SVH",
    packaging: "T&R",
    resonanceFrequency: "-",
    resonanceResistance: "-",
    seriesResistance: "-",
    spbn: "SVH3350DEBSR-74.250M",
    spq: "1,000 pcs",
    stock: 4200,
    supplyVoltage: "3.3V",
    type: "VCXO",
  },
  {
    aec: "Unknown",
    automotive: "Unknown",
    datasheet: "notYet",
    family: "Oscillators",
    frequency: "171.925063",
    frequencyRange: "50 to 212.5 MHz",
    frequencyStability: "+/-25ppm",
    frequencyTolerance: "-",
    loadCapacitance: "-",
    military: "No",
    mode: "Fundamental / 3rd Overtone Review",
    outputLevel: "LVDS",
    outputType: "Tri-state",
    packageType: "SLO-10",
    packaging: "T&R",
    resonanceFrequency: "-",
    resonanceResistance: "-",
    seriesResistance: "-",
    spbn: "SLO-102525BDSR-171.925063M",
    spq: "1,000 pcs",
    stock: 3600,
    supplyVoltage: "2.5V",
    type: "SMD Oscillator",
  },
  {
    aec: "Yes",
    automotive: "Yes",
    datasheet: "available",
    family: "Tuning Forks",
    frequency: "0.032768",
    frequencyRange: "0.032768 MHz",
    frequencyStability: "-",
    frequencyTolerance: "+/-20ppm",
    loadCapacitance: "12.5pF",
    military: "No",
    mode: "Flexural",
    outputLevel: "-",
    outputType: "-",
    packageType: "CS-2012",
    packaging: "T&R",
    resonanceFrequency: "32.768 kHz",
    resonanceResistance: "80 kOhm",
    seriesResistance: "80 kOhm",
    spbn: "STM12520B-32.768-TR",
    spq: "3,000 pcs",
    stock: 512000,
    supplyVoltage: "-",
    type: "Tuning Fork",
  },
  {
    aec: "No",
    automotive: "No",
    datasheet: "notYet",
    family: "Crystals",
    frequency: "4.9152",
    frequencyRange: "4 to 12 MHz",
    frequencyStability: "+/-30ppm",
    frequencyTolerance: "+/-20ppm",
    loadCapacitance: "18pF",
    military: "No",
    mode: "Fundamental",
    outputLevel: "-",
    outputType: "-",
    packageType: "SX-1",
    packaging: "T&R",
    resonanceFrequency: "-",
    resonanceResistance: "100 Ohm",
    seriesResistance: "100 Ohm",
    spbn: "SJ18120E6-4.915200-TR",
    spq: "1,000 pcs",
    stock: 92000,
    supplyVoltage: "-",
    type: "SMD Crystal",
  },
];

const technicalColumns = [
  ["Type", "type"],
  ["Standard Frequency", "frequency"],
  ["Resonance Frequency", "resonanceFrequency"],
  ["Frequency Stability", "frequencyStability"],
  ["Standard Frequency Range", "frequencyRange"],
  ["Load Capacitance", "loadCapacitance"],
  ["Frequency Tolerance", "frequencyTolerance"],
  ["Series Resistance", "seriesResistance"],
  ["Resonance Resistance", "resonanceResistance"],
  ["Output Type", "outputType"],
  ["Mode of Oscillation", "mode"],
  ["Supply Voltage", "supplyVoltage"],
  ["Packaging", "packaging"],
  ["Output Level", "outputLevel"],
  ["AEC Qualified", "aec"],
  ["Automotive", "automotive"],
  ["Military", "military"],
] as const;

export default function Stock() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const totalStock = useMemo(
    () => stockRows.reduce((total, row) => total + row.stock, 0),
    [],
  );

  return (
    <div className="min-h-screen bg-white text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-11 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">Sunny Stock Check</div>
            </div>
          </Link>
          <div className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50">
            <Input
              className="h-11 flex-1 border-0 bg-transparent focus-visible:ring-0"
              placeholder="Search SPBN, package type, frequency, output, or stock"
              data-testid="input-stock-search"
            />
            <button type="button" className="flex h-11 w-14 items-center justify-center bg-primary text-white" aria-label="Search stock">
              <Search className="h-5 w-5" />
            </button>
          </div>
          <Link href="/request-quote">
            <Button className="h-11 gap-2" data-testid="button-stock-request-quote">
              <PackageSearch className="h-4 w-4" />
              Quote Now
            </Button>
          </Link>
        </div>
        <nav className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-6 px-5 pb-4 text-sm font-semibold">
          <Link href="/" className="text-slate-600 hover:text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Home
          </Link>
          <Link href="/request-quote" className="text-slate-600 hover:text-primary">Quote Now</Link>
          <Link href="/part-number-generator" className="text-slate-600 hover:text-primary">Part Number Generator</Link>
          <Link href="/products" className="text-slate-600 hover:text-primary">Products</Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-50 px-5 py-5">
          <div className="mx-auto max-w-[1800px]">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Sunny Stock Check</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Search Sunny SPBN, package, frequency, stock, and catalog-based specs. Pricing is quote-only for now.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                <Metric label="Parts" value={stockRows.length.toLocaleString()} />
                <Metric label="Total stock" value={totalStock.toLocaleString()} />
                <Metric label="Ship from" value="S. Korea" />
                <Metric label="Price" value="Contact Sunny" />
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4" />
                Filters
                <span className="text-xs text-slate-500">{filtersOpen ? "Collapse filters" : "Expand filters"}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
              </button>
              <div className="text-sm text-slate-600">Showing 1 - {stockRows.length} of {stockRows.length} Sunny parts</div>
            </div>

            {filtersOpen && (
              <div className="overflow-x-auto border border-slate-200 bg-white p-3" data-testid="sunny-stock-filters">
                <div className="flex min-w-max gap-3">
                  {filters.map((filter) => (
                    <FilterBox key={filter.title} title={filter.title} options={filter.options} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="px-0 pb-10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[2400px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-950 text-white">
                <tr>
                  <HeaderCell label="SPBN" className="w-[360px]" />
                  <HeaderCell label="Quantity" className="w-[190px]" />
                  <HeaderCell label="Shipping + Packaging" className="w-[300px]" />
                  <HeaderCell label="Pricing" className="w-[160px]" />
                  <HeaderCell label="Stock" className="w-[160px]" />
                  {technicalColumns.map(([label]) => (
                    <HeaderCell key={label} label={label} className="w-[170px]" />
                  ))}
                </tr>
              </thead>
              <tbody>
                {stockRows.map((row, index) => (
                  <tr key={row.spbn} className={index % 2 ? "bg-slate-100" : "bg-white"}>
                    <td className="border-r border-slate-200 align-top">
                      <PartSummary row={row} />
                    </td>
                    <td className="border-r border-slate-200 align-top">
                      <QuantityBox row={row} />
                    </td>
                    <td className="border-r border-slate-200 align-top">
                      <ShippingBox row={row} />
                    </td>
                    <td className="border-r border-slate-200 px-4 py-5 align-top font-bold text-slate-950">
                      $ Contact Sunny
                    </td>
                    <td className="border-r border-slate-200 px-4 py-5 align-top">
                      <div className="font-semibold">In Stock {row.stock.toLocaleString()}</div>
                      <div className="mt-1 text-[11px] text-slate-500">SPQ {row.spq}</div>
                    </td>
                    {technicalColumns.map(([, key]) => (
                      <td key={key} className="border-r border-slate-200 px-4 py-5 align-top text-slate-700">
                        {String(row[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 bg-white px-3 py-2">
      <div className="font-display text-lg font-bold text-primary">{value}</div>
      <div className="text-[11px] font-semibold uppercase text-slate-500">{label}</div>
    </div>
  );
}

function FilterBox({ title, options }: { title: string; options: string[] }) {
  return (
    <div className="h-52 w-60 shrink-0 border border-slate-200 bg-white p-3">
      <div className="mb-2 font-semibold">{title}</div>
      <Input className="mb-2 h-9 text-xs" placeholder="Search" />
      <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" className="h-3.5 w-3.5" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function HeaderCell({ className = "", label }: { className?: string; label: string }) {
  return (
    <th className={`border-r border-slate-700 px-4 py-3 text-[11px] font-bold ${className}`}>
      <span className="inline-flex items-center gap-1">
        {label}
        <ChevronDown className="h-3 w-3" />
      </span>
    </th>
  );
}

function SunnyPlaceholder() {
  return (
    <div className="grid h-14 w-16 shrink-0 grid-cols-2 overflow-hidden border border-slate-200 bg-slate-100">
      <div className="flex items-center justify-center text-[10px] font-bold text-primary">Sunny</div>
      <div className="grid grid-cols-2 gap-1 bg-slate-900 p-2">
        <span className="bg-amber-300" />
        <span className="bg-amber-300" />
        <span className="bg-amber-300" />
        <span className="bg-amber-300" />
      </div>
    </div>
  );
}

function PartSummary({ row }: { row: StockRow }) {
  return (
    <div className="flex gap-3 p-4">
      <SunnyPlaceholder />
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500">{row.family}</div>
        <div className="break-all font-mono text-sm font-bold text-primary">{row.spbn}</div>
        <div className="mt-1 text-xs leading-5 text-slate-700">
          {row.type} {row.frequency}MHz {row.frequencyTolerance !== "-" ? `${row.frequencyTolerance} Tol ` : ""}
          {row.frequencyStability !== "-" ? `${row.frequencyStability} Stability ` : ""}
          {row.loadCapacitance !== "-" ? `${row.loadCapacitance} ` : ""}
          {row.mode}
        </div>
        <div className="mt-2 font-semibold text-primary">Sunny</div>
        <div className="mt-2 font-semibold">Total stock: {row.stock.toLocaleString()}</div>
        <div className="mt-2 inline-flex items-center gap-1 border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
          <Box className="h-3 w-3" />
          SPQ {row.spq}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {row.datasheet === "available" ? (
            <Link href="/documents" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <FileText className="h-3.5 w-3.5" />
              Datasheet
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <FileText className="h-3.5 w-3.5" />
              Not yet available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function QuantityBox({ row }: { row: StockRow }) {
  const defaultQty = row.spq.startsWith("1,000") ? "1000" : "3000";

  return (
    <div className="p-4">
      <div className="flex h-11 items-center border border-slate-300 bg-white">
        <button type="button" className="h-full w-10 text-lg text-slate-500">-</button>
        <input className="h-full min-w-0 flex-1 border-0 text-center text-sm outline-none" defaultValue={defaultQty} />
        <button type="button" className="h-full w-10 text-lg text-primary">+</button>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>Min: {row.spq}</span>
        <span>Inc: {row.spq}</span>
      </div>
      <Link href={`/request-quote?spbn=${encodeURIComponent(row.spbn)}`}>
        <Button className="mt-3 h-10 w-full gap-2 text-xs">
          <ClipboardList className="h-4 w-4" />
          Add to RFQ
        </Button>
      </Link>
    </div>
  );
}

function ShippingBox({ row }: { row: StockRow }) {
  return (
    <div className="p-4">
      <div className="flex items-start gap-2">
        <span className="mt-1 h-3 w-3 rounded-full border-2 border-primary" />
        <div>
          <div className="font-bold">Ship from Sunny Warehouse (S. Korea)</div>
          <div className="text-[11px] text-slate-500">Schedule after Sunny confirmation</div>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2">
        <Check className="mt-0.5 h-4 w-4 text-primary" />
        <div>
          <div className="font-semibold">In Stock</div>
          <div className="text-[11px] text-slate-500">{row.packaging} / SPQ {row.spq}</div>
        </div>
      </div>
      <div className="mt-3 inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold">
        <Warehouse className="h-3.5 w-3.5 text-primary" />
        Sunny stock sample
      </div>
    </div>
  );
}
