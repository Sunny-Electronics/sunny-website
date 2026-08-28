import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ChevronRight,
  Cpu,
  FileCheck2,
  Hash,
  RadioReceiver,
  Search,
  ShieldCheck,
  Timer,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import sunnyPublicCatalog from "@/data/sunny-obsidian-public.json";
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
  "Published quality certificates",
];

export default function Products() {
  const [catalogQuery, setCatalogQuery] = useState("");
  const catalogMatches = useMemo(() => {
    const query = catalogQuery.trim().toLowerCase();
    if (!query) return [];

    return sunnyPublicCatalog.models
      .filter((model) =>
        [model.model, model.family, model.packageType, model.dimensions]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 24);
  }, [catalogQuery]);

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

          <div className="flex min-w-0 flex-1 items-center justify-end gap-5 text-sm font-semibold text-slate-600">
            <Link href="/stock" className="hover:text-primary">Stock Check</Link>
            <Link href="/documents" className="hover:text-primary">Documents</Link>
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
          <Link href="/part-number-generator" className="text-slate-600 hover:text-primary">Part Number Generator</Link>
          <a href="#documents" className="text-slate-600 hover:text-primary">Documents</a>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
                Product Center
              </p>
              <h1 className="mb-4 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                Frequency-control products for demanding electronic applications.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                Review Sunny product families, build a part number, check published stock quantities,
                and submit an RFQ for confirmed commercial terms.
              </p>
            </div>
            <div className="grid grid-cols-2 border border-slate-200 bg-white shadow-sm">
              <div className="border-r border-b border-slate-200 p-5">
                <div className="text-3xl font-display font-bold text-primary">4</div>
                <div className="text-xs font-semibold text-slate-500">Product families</div>
              </div>
              <div className="border-b border-slate-200 p-5">
                <div className="text-3xl font-display font-bold text-primary">6</div>
                <div className="text-xs font-semibold text-slate-500">Document types</div>
              </div>
              <div className="border-r border-slate-200 p-5">
                <div className="text-3xl font-display font-bold text-primary">RFQ</div>
                <div className="text-xs font-semibold text-slate-500">Quote workflow</div>
              </div>
              <div className="p-5">
                <div className="text-3xl font-display font-bold text-primary">QA</div>
                <div className="text-xs font-semibold text-slate-500">Document support</div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-10">
            <div className="mb-5">
              <h2 className="font-display text-3xl font-bold">Verified Sunny Model Search</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Search the public Sunny catalog by model, family, package type, or dimensions. Customer names,
                emails, pricing, orders, and private commercial information are not included.
              </p>
            </div>

            <label className="flex max-w-3xl items-center gap-3 border border-slate-300 bg-slate-50 px-4 focus-within:border-primary">
              <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="sr-only">Search the verified Sunny public model catalog</span>
              <input
                type="search"
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="Try SCO-10, SX-32, 3.2 × 2.5 mm, or LVDS"
                data-testid="input-sunny-model-search"
              />
            </label>

            {catalogQuery.trim() ? (
              <div className="mt-5">
                <div className="mb-3 text-sm font-semibold text-slate-600">
                  {catalogMatches.length} verified {catalogMatches.length === 1 ? "match" : "matches"}
                </div>
                {catalogMatches.length ? (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {catalogMatches.map((model) => (
                      <Link
                        key={model.id}
                        href={`/quote/other?partNumber=${encodeURIComponent(model.model)}`}
                        className="border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/50 hover:shadow-md"
                      >
                        <div className="font-mono text-base font-bold text-primary">{model.model}</div>
                        <div className="mt-1 text-sm font-semibold text-slate-800">{model.packageType}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {model.family}{model.dimensions ? ` · ${model.dimensions}` : ""}
                        </div>
                        <div className="mt-3 text-xs font-semibold text-primary">Open RFQ review</div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                    No verified model matched that search. Try a broader family or package term, or send the requirement through RFQ.
                  </div>
                )}
              </div>
            ) : null}
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

        <section id="documents" className="mx-auto max-w-7xl px-5 py-12">
          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold">Technical and Quality Documents</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Open Sunny documents that have been approved for public release. Contact Sunny through
              the RFQ form when a project-specific document is required.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documentTypes.map((documentType) => (
              <div key={documentType} className="border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-primary/10 text-primary">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{documentType}</h3>
                </div>
                <p className="mb-4 text-sm leading-6 text-slate-600">
                  Check the public document library for the current approved file.
                </p>
                <Button variant="outline" className="h-10 gap-2 bg-white" asChild>
                  <Link href="/documents">Open Documents</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
                <Hash className="h-4 w-4" />
                Part Number Generator
              </div>
              <h2 className="font-display text-3xl font-bold">Create an RFQ-ready Sunny-style part number.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Configure family, package, frequency, tolerance, voltage, output, and temperature
                before sending the part to the RFQ workflow.
              </p>
            </div>
            <Link href="/part-number-generator">
              <Button className="h-12 gap-2">
                <Hash className="h-4 w-4" />
                Generate Part Number
              </Button>
            </Link>
          </div>
        </section>

        <section className="bg-slate-950 py-12 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
                <ShieldCheck className="h-4 w-4" />
                Commercial details are confirmed by quotation
              </div>
              <h2 className="font-display text-3xl font-bold">Send your part and quantity for an official RFQ.</h2>
            </div>
            <Link href="/request-quote">
              <Button variant="outline" className="h-12 bg-white text-slate-950 hover:bg-slate-100">
                Request a Quote
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
