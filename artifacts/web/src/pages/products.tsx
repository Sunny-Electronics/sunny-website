import { Link } from "wouter";
import {
  ArrowLeft,
  ChevronRight,
  Cpu,
  Download,
  FileCheck2,
  Filter,
  RadioReceiver,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import sunnyLogo from "@assets/image_1775118121182.png";

const productFamilies = [
  {
    icon: <Cpu className="h-6 w-6" />,
    name: "Crystal Units",
    summary: "MHz and kHz quartz crystal units for compact electronic designs.",
    details: ["SMD packages", "Tight tolerance options", "Consumer, industrial, and automotive programs"],
  },
  {
    icon: <Timer className="h-6 w-6" />,
    name: "Oscillators",
    summary: "SPXO, TCXO, VCXO, and OCXO timing modules for stable frequency output.",
    details: ["Low jitter options", "Temperature stability", "Custom frequency support"],
  },
  {
    icon: <RadioReceiver className="h-6 w-6" />,
    name: "Resonators",
    summary: "Reliable resonator solutions for high-volume manufacturing requirements.",
    details: ["Small package sizes", "Stable supply support", "Application review available"],
  },
  {
    icon: <Waves className="h-6 w-6" />,
    name: "Filters and Modules",
    summary: "SAW filters, RTC modules, and application-specific timing support.",
    details: ["Signal clarity", "Timing synchronization", "Document support by project"],
  },
];

const documentTypes = [
  "Datasheet",
  "RoHS / REACH",
  "Material declaration",
  "Reliability report",
  "IATF / ISO quality document",
  "Customer-specific QA package",
];

export default function Products() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">Products and Documents</div>
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50">
            <Input
              className="h-12 flex-1 border-0 bg-transparent focus-visible:ring-0"
              placeholder="Search part number, frequency, package, datasheet, or QA document"
              data-testid="input-products-search"
            />
            <button
              type="button"
              className="flex h-12 w-14 items-center justify-center bg-primary text-white"
              aria-label="Search products"
              data-testid="button-products-search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          <Link href="/request-quote">
            <Button className="h-12">Request Quote</Button>
          </Link>
        </div>

        <nav className="mx-auto flex max-w-7xl items-center gap-8 px-5 pb-4 text-sm font-semibold">
          <Link href="/" className="text-slate-600 hover:text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Home
          </Link>
          <a href="#families" className="text-slate-600 hover:text-primary">Product Families</a>
          <a href="#documents" className="text-slate-600 hover:text-primary">Documents</a>
          <a href="#filters" className="text-slate-600 hover:text-primary">Search Filters</a>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
              Product Center
            </p>
            <h1 className="mb-4 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
              Make SunnyKR easy to search before customers request pricing.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              This page is the foundation for standard part search, datasheets, quality documents,
              and customer support files. Prices, lead times, and private customer data will be
              added later inside protected workflows.
            </p>
          </div>
        </section>

        <section id="families" className="mx-auto max-w-7xl px-5 py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold">Product Families</h2>
              <p className="mt-2 text-sm text-slate-600">
                Clear product groups help visitors understand Sunny before they send an RFQ.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {productFamilies.map((family) => (
              <article key={family.name} className="border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                    {family.icon}
                  </div>
                  <h3 className="font-display text-2xl font-bold">{family.name}</h3>
                </div>
                <p className="mb-4 text-sm leading-6 text-slate-600">{family.summary}</p>
                <div className="grid gap-2">
                  {family.details.map((detail) => (
                    <div key={detail} className="flex items-center gap-2 text-sm text-slate-700">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      {detail}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="filters" className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[360px_1fr]">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
                <SlidersHorizontal className="h-4 w-4" />
                Future Search Filters
              </div>
              <h2 className="font-display text-3xl font-bold">Search like a real component site.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                These filters are placeholders now. Later we will connect them to Sunny's product guide,
                stock file, standard documents, and customer-specific portal rules.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {["Frequency", "Package Size", "Voltage", "Tolerance", "Temperature", "Application"].map((filter) => (
                <div key={filter} className="border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Filter className="h-4 w-4 text-primary" />
                    {filter}
                  </div>
                  <Input className="h-10 bg-white" placeholder="Coming soon" disabled />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="documents" className="mx-auto max-w-7xl px-5 py-12">
          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold">Documents Customers Will Search</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              This prepares SunnyKR for datasheets, QA documents, compliance files, and customer-specific
              document packages without exposing private files publicly.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documentTypes.map((documentType) => (
              <div key={documentType} className="border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-3">
                  <FileCheck2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{documentType}</h3>
                </div>
                <p className="mb-4 text-sm leading-6 text-slate-600">
                  Public availability and customer-only access rules will be configured later.
                </p>
                <Button variant="outline" className="h-10 gap-2 bg-white" disabled>
                  <Download className="h-4 w-4" />
                  Coming Soon
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 py-12 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
                <ShieldCheck className="h-4 w-4" />
                Customer data stays protected
              </div>
              <h2 className="font-display text-3xl font-bold">Public product search first. Private pricing later.</h2>
            </div>
            <Link href="/request-access">
              <Button variant="outline" className="h-12 bg-white text-slate-950 hover:bg-slate-100">
                Partners Portal Log In
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
