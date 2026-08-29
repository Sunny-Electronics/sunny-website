import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ChevronRight,
  Cpu,
  FileText,
  Gauge,
  Radio,
  Search,
  ShieldCheck,
  ThermometerSun,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OFFICIAL_PRODUCT_SECTIONS,
  officialProducts,
  quoteHrefForProduct,
  type OfficialProduct,
  type OfficialProductSection,
} from "@/data/official-products";
import sunnyLogo from "@assets/image_1775118121182.png";

const INITIAL_VISIBLE_PRODUCTS = 18;

const sectionDetails: Record<
  OfficialProductSection,
  { description: string; icon: typeof Cpu }
> = {
  "Crystal Units": {
    description:
      "MHz crystals, through-hole units, automotive grades, and 32.768 kHz tuning-fork crystals.",
    icon: Cpu,
  },
  "Crystal Oscillators": {
    description:
      "CMOS, LVDS, LVPECL, and HCSL crystal oscillators for clock and timing designs.",
    icon: Timer,
  },
  VCXO: {
    description:
      "Voltage-controlled crystal oscillators with CMOS and differential-output options.",
    icon: Gauge,
  },
  "TCXO & VCTCXO": {
    description:
      "Temperature-compensated crystal oscillators with clipped-sinewave and CMOS options.",
    icon: ThermometerSun,
  },
};

function ProductCard({ product }: { product: OfficialProduct }) {
  return (
    <article
      className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative flex h-48 items-center justify-center border-b border-slate-100 bg-slate-50 p-5">
        <img
          src={product.imagePath}
          alt={`${product.model} ${product.deviceType}`}
          className="h-full w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 bg-slate-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-white">
          Official catalog
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {product.section}
        </p>
        <h3 className="mt-1 font-mono text-xl font-bold text-slate-950">
          {product.model}
        </h3>

        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
            <dt className="text-slate-500">Device</dt>
            <dd className="text-right font-semibold text-slate-800">
              {product.deviceType}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-slate-500">Package / output</dt>
            <dd className="text-right font-semibold text-slate-800">
              {product.packageType || "See datasheet"}
            </dd>
          </div>
        </dl>

        {product.features.length > 0 ? (
          <ul className="mt-4 space-y-1.5 text-xs leading-5 text-slate-600">
            {product.features.slice(0, 2).map((feature) => (
              <li key={feature} className="flex gap-2">
                <ChevronRight
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Button variant="outline" className="h-10 gap-1.5 bg-white px-2" asChild>
            <a
              href={product.datasheetUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${product.model} datasheet PDF`}
              data-testid={`datasheet-${product.id}`}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Datasheet PDF
            </a>
          </Button>
          <Button className="h-10 px-2" asChild>
            <Link href={quoteHrefForProduct(product)}>Request Quote</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function Products() {
  const [activeSection, setActiveSection] =
    useState<OfficialProductSection>("Crystal Units");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PRODUCTS);

  const normalizedQuery = catalogQuery.trim().toLowerCase();
  const matchingProducts = useMemo(() => {
    const base = normalizedQuery
      ? officialProducts
      : officialProducts.filter((product) => product.section === activeSection);

    if (!normalizedQuery) return base;

    return base.filter((product) =>
      [
        product.model,
        product.section,
        product.deviceType,
        product.packageType,
        ...product.features,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [activeSection, normalizedQuery]);

  const visibleProducts = matchingProducts.slice(0, visibleCount);

  const selectSection = (section: OfficialProductSection) => {
    setActiveSection(section);
    setCatalogQuery("");
    setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <img
              src={sunnyLogo}
              alt="Sunny Electronics Corp."
              className="h-12 w-auto"
            />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">
                Sunny Electronics Corp.
              </div>
              <div className="text-xs font-medium text-slate-500">
                Official Product Catalog
              </div>
            </div>
          </Link>

          <label className="flex min-w-0 flex-1 items-center gap-3 border border-slate-300 bg-slate-50 px-4 focus-within:border-primary lg:ml-8">
            <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="sr-only">Search Sunny products</span>
            <input
              type="search"
              value={catalogQuery}
              onChange={(event) => {
                setCatalogQuery(event.target.value);
                setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
              }}
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Search model, package, output, or feature"
              data-testid="input-sunny-model-search"
            />
          </label>

          <Link href="/request-quote">
            <Button className="h-12">Request Quote</Button>
          </Link>
        </div>

        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-5 pb-4 text-sm font-semibold">
          <Link href="/" className="text-slate-600 hover:text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Home
          </Link>
          <a href="#catalog" className="text-slate-600 hover:text-primary">
            Product Catalog
          </a>
          <Link
            href="/part-number-generator"
            className="text-slate-600 hover:text-primary"
          >
            Part Number Generator
          </Link>
          <Link href="/documents" className="text-slate-600 hover:text-primary">
            Documents
          </Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <div className="max-w-4xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
                Verified Sunny Products
              </p>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                96 public models across four frequency-control families.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Browse every public model listed by Sunny Electronics. Tuning-fork
                crystals are included under Crystal Units. MEMS oscillators and filters
                are not included in this SunnyKR catalog.
              </p>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {OFFICIAL_PRODUCT_SECTIONS.map((section) => {
                const detail = sectionDetails[section];
                const Icon = detail.icon;
                const count = officialProducts.filter(
                  (product) => product.section === section,
                ).length;
                const selected = !normalizedQuery && activeSection === section;

                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => selectSection(section)}
                    className={`min-h-40 border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      selected
                        ? "border-primary bg-primary text-white shadow-lg"
                        : "border-slate-200 bg-white hover:border-primary/40 hover:shadow-md"
                    }`}
                    aria-pressed={selected}
                    data-testid={`section-${section.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Icon
                        className={`h-6 w-6 ${selected ? "text-white" : "text-primary"}`}
                        aria-hidden="true"
                      />
                      <span
                        className={`font-mono text-2xl font-bold ${
                          selected ? "text-white" : "text-primary"
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                    <h2 className="mt-4 font-display text-xl font-bold">{section}</h2>
                    <p
                      className={`mt-2 text-xs leading-5 ${
                        selected ? "text-blue-50" : "text-slate-600"
                      }`}
                    >
                      {detail.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section id="catalog" className="mx-auto max-w-7xl px-5 py-12">
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary">
                {normalizedQuery ? "Catalog search" : "Selected family"}
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold">
                {normalizedQuery ? `Results for “${catalogQuery.trim()}”` : activeSection}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {matchingProducts.length} verified {matchingProducts.length === 1 ? "model" : "models"}
                {normalizedQuery ? " across all four families" : " in this family"}.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Public catalog data only
            </div>
          </div>

          {visibleProducts.length ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {visibleProducts.length < matchingProducts.length ? (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    className="h-12 bg-white px-8"
                    onClick={() => setVisibleCount((current) => current + 18)}
                    data-testid="button-show-more-products"
                  >
                    Show more products
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="border border-slate-200 bg-white p-8 text-center">
              <Radio className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-display text-xl font-bold">No matching model</h3>
              <p className="mt-2 text-sm text-slate-600">
                Try a shorter model number, package size, or output type. You can also
                send the requirement through the RFQ form.
              </p>
            </div>
          )}
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 md:grid-cols-2">
            <div className="border border-slate-200 bg-slate-50 p-6">
              <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-bold">
                Technical and quality documents
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Every model above links to its official public datasheet. Use the
                document center for published certificates and quality files.
              </p>
              <Button variant="outline" className="mt-5 bg-white" asChild>
                <Link href="/documents">Open Documents</Link>
              </Button>
            </div>

            <div className="border border-slate-200 bg-slate-50 p-6">
              <Cpu className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-bold">
                Verified part-number support
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Build a Sunny-style part number when the official coding rule is
                available, or send the model and requirements for engineering review.
              </p>
              <Button variant="outline" className="mt-5 bg-white" asChild>
                <Link href="/part-number-generator">Open Part Number Generator</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-12 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-200">
                Commercial terms are confirmed by quotation
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">
                Send the model, specifications, and EAU for review.
              </h2>
            </div>
            <Button variant="outline" className="h-12 bg-white text-slate-950" asChild>
              <Link href="/request-quote">Request a Quote</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
