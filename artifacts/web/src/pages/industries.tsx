import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Factory,
  HeartPulse,
  Network,
  PackageCheck,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import sunnyLogo from "@assets/image_1775118121182.png";

const industries = [
  {
    icon: <Car className="h-7 w-7" />,
    name: "Automotive",
    headline: "Stable timing support for demanding vehicle programs.",
    points: ["ADAS and safety electronics", "Infotainment and connectivity", "EV and powertrain support"],
  },
  {
    icon: <Network className="h-7 w-7" />,
    name: "Telecommunications",
    headline: "Frequency control for networks that need precise timing.",
    points: ["5G infrastructure", "Optical and network equipment", "Low phase noise requirements"],
  },
  {
    icon: <Smartphone className="h-7 w-7" />,
    name: "Consumer and IoT",
    headline: "Compact parts for high-volume connected electronics.",
    points: ["Wearables and smart devices", "Small package designs", "Stable repeat supply"],
  },
  {
    icon: <Factory className="h-7 w-7" />,
    name: "Industrial",
    headline: "Reliable components for control, automation, and equipment.",
    points: ["Industrial controls", "Measurement equipment", "Long-term program support"],
  },
  {
    icon: <HeartPulse className="h-7 w-7" />,
    name: "Medical and Precision",
    headline: "Document-aware support for regulated product teams.",
    points: ["Traceability support", "QA document requests", "Engineering review by project"],
  },
  {
    icon: <PackageCheck className="h-7 w-7" />,
    name: "EMS and Supply Chain",
    headline: "Support for buyers managing BOMs, RFQs, and repeat orders.",
    points: ["BOM review", "Stock visibility later", "Quote and order history later"],
  },
];

export default function Industries() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">Industries</div>
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50">
            <Input
              className="h-12 flex-1 border-0 bg-transparent focus-visible:ring-0"
              placeholder="Search industry, application, part number, or document"
              data-testid="input-industries-search"
            />
            <Link
              href="/products"
              className="flex h-12 w-14 items-center justify-center bg-primary text-white"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </Link>
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
          <Link href="/products" className="text-slate-600 hover:text-primary">Products</Link>
          <Link href="/quality" className="text-slate-600 hover:text-primary">Quality</Link>
          <Link href="/request-access" className="text-slate-600 hover:text-primary">Sunny Portal Access (SPA)</Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">Industry Support</p>
            <h1 className="mb-4 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
              Frequency control support for SPA vendors who need reliability, documents, and long-term supply.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              SunnyKR should speak clearly to buyers, engineers, QA teams, and supply-chain teams.
              This page frames Sunny by application so visitors can quickly understand fit before submitting an RFQ.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <article key={industry.name} className="border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-14 w-14 items-center justify-center bg-primary/10 text-primary">
                  {industry.icon}
                </div>
                <h2 className="mb-2 font-display text-2xl font-bold">{industry.name}</h2>
                <p className="mb-5 text-sm leading-6 text-slate-600">{industry.headline}</p>
                <div className="grid gap-2">
                  {industry.points.map((point) => (
                    <div key={point} className="flex items-center gap-2 text-sm text-slate-700">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      {point}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 py-12 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">
                Next Step
              </p>
              <h2 className="font-display text-3xl font-bold">Match your application to Sunny products.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button variant="outline" className="h-12 bg-white text-slate-950 hover:bg-slate-100">
                  View Products
                </Button>
              </Link>
              <Link href="/request-quote">
                <Button className="h-12 gap-2">
                  Request Quote
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
