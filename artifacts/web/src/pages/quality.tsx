import { Link } from "wouter";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Lock,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import sunnyLogo from "@assets/image_1775118121182.png";

const qualityBlocks = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Quality System",
    text: "SunnyKR will present quality controls, certifications, and SPA document support in one clear place.",
  },
  {
    icon: <FileCheck2 className="h-6 w-6" />,
    title: "Document Requests",
    text: "SPA vendors will later request datasheets, RoHS/REACH, reliability, and project-specific QA files.",
  },
  {
    icon: <ClipboardCheck className="h-6 w-6" />,
    title: "Review Workflow",
    text: "Document release can be controlled by Sunny admin so confidential SPA files stay protected.",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Supply Reliability",
    text: "Long-term supply, order status, and ETD communication will connect into Sunny Portal Access (SPA) later.",
  },
];

const documentRoadmap = [
  "Datasheets",
  "RoHS / REACH",
  "IATF / ISO quality documents",
  "Reliability reports",
  "Material declarations",
  "SPA-specific QA packages",
];

export default function Quality() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">Quality and Documents</div>
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50">
            <Input
              className="h-12 flex-1 border-0 bg-transparent focus-visible:ring-0"
              placeholder="Search datasheet, compliance, QA document, or part number"
              data-testid="input-quality-search"
            />
            <Link
              href="/products"
              className="flex h-12 w-14 items-center justify-center bg-primary text-white"
              aria-label="Search documents"
            >
              <Search className="h-5 w-5" />
            </Link>
          </div>

          <Link href="/request-access">
            <Button className="h-12 gap-2">
              <Lock className="h-4 w-4" />
              Partner Access
            </Button>
          </Link>
        </div>

        <nav className="mx-auto flex max-w-7xl items-center gap-8 px-5 pb-4 text-sm font-semibold">
          <Link href="/" className="text-slate-600 hover:text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Home
          </Link>
          <Link href="/products" className="text-slate-600 hover:text-primary">Products</Link>
          <Link href="/industries" className="text-slate-600 hover:text-primary">Industries</Link>
          <Link href="/request-quote" className="text-slate-600 hover:text-primary">Request Quote</Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">Quality Foundation</p>
            <h1 className="mb-4 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
              Make quality documents easy to find, request, and protect.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              This page prepares SunnyKR for standard documents and SPA-only QA packages.
              Public information can help marketing, while private documents stay inside secure access rules.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {qualityBlocks.map((block) => (
              <article key={block.title} className="border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                  {block.icon}
                </div>
                <h2 className="mb-3 font-display text-xl font-bold">{block.title}</h2>
                <p className="text-sm leading-6 text-slate-600">{block.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[360px_1fr]">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
                <Award className="h-4 w-4" />
                Document Roadmap
              </div>
              <h2 className="font-display text-3xl font-bold">Documents SPA vendors expect.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                We can attach real files later. For now this creates the right structure and SPA vendor expectation.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {documentRoadmap.map((item) => (
                <div key={item} className="flex items-center gap-3 border border-slate-200 bg-slate-50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-12 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">
                Security Rule
              </p>
              <h2 className="font-display text-3xl font-bold">Public documents public. SPA files private.</h2>
            </div>
            <Link href="/request-access">
              <Button variant="outline" className="h-12 bg-white text-slate-950 hover:bg-slate-100">
                Request Partner Access
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
