import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Download,
  FileCheck2,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import sunnyLogo from "@assets/image_1775118121182.png";

const documents = [
  {
    title: "ISO 14001 Certificate",
    type: "Certificate",
    category: "QA / QC",
    description: "Sunny Electronics ISO 14001 environmental management certificate.",
    href: "/documents/sunny-iso-14001-2025-2028.pdf",
    fileName: "(Sunny Electronics) ISO 14001 Certificate_280908.pdf",
    registeredDate: "2026/04/28",
    keywords: "iso 14001 certificate environment environmental 2025 2028 qa qc 280908 2026/04/28 public download",
  },
  {
    title: "IATF 16949 Certificate",
    type: "Certificate",
    category: "QA / QC",
    description: "Sunny Electronics IATF 16949 certificate.",
    href: "/documents/sunny-iatf-16949-certificate.pdf",
    fileName: "(Sunny Electronics) IATF 16949 Certificate_270716.pdf",
    registeredDate: "2026/04/28",
    keywords: "iatf 16949 certificate automotive quality qa qc 270716 2026/04/28 public download",
  },
  {
    title: "SX-1 Spec Sheet",
    type: "Spec Sheet",
    category: "Crystal Unit",
    description: "SX-1 product specification sheet.",
    href: "/documents/sx-1-spec-sheet.pdf",
    fileName: "sx-1-spec-sheet.pdf",
    registeredDate: "",
    keywords: "sx-1 sx1 spec sheet crystal unit datasheet",
  },
  {
    title: "SX-32 Spec Sheet",
    type: "Spec Sheet",
    category: "Crystal Unit",
    description: "SX-32 product specification sheet.",
    href: "/documents/sx-32-spec-sheet.pdf",
    fileName: "sx-32-spec-sheet.pdf",
    registeredDate: "",
    keywords: "sx-32 sx32 spec sheet crystal unit datasheet",
  },
  {
    title: "ATS Series Spec Sheet",
    type: "Spec Sheet",
    category: "Oscillator",
    description: "ATS Series product specification sheet.",
    href: "/documents/ats-series-spec-sheet.pdf",
    fileName: "ats-series-spec-sheet.pdf",
    registeredDate: "",
    keywords: "ats ats series spec sheet oscillator datasheet",
  },
];

export default function Documents() {
  const [query, setQuery] = useState("");

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return documents;
    }

    return documents.filter((document) => {
      const searchableText = [
        document.title,
        document.type,
        document.category,
        document.description,
        document.fileName,
        document.registeredDate,
        document.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">Document Library</div>
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50">
            <Input
              className="h-12 flex-1 border-0 bg-transparent focus-visible:ring-0"
              placeholder="Search certificate, datasheet, part number, ISO, IATF, SX, ATS"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              data-testid="input-documents-search"
            />
            <div className="flex h-12 w-14 items-center justify-center bg-primary text-white">
              <Search className="h-5 w-5" />
            </div>
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
          <Link href="/request-access" className="text-slate-600 hover:text-primary">Sunny Portal Access (SPA)</Link>
          <Link href="/products" className="text-slate-600 hover:text-primary">Products</Link>
          <Link href="/quality" className="text-slate-600 hover:text-primary">Quality</Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
                Standard Documents
              </p>
              <h1 className="mb-4 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                Search Sunny certificates and spec sheets.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                Approved vendors can quickly find standard yearly certificates, datasheets,
                and product specification sheets. More documents will be added as SunnyKR grows.
              </p>
            </div>
            <div className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" />
                Document Access
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Public standard documents are available here. SPA-only or project-specific QA packages
                will be controlled through Sunny Portal Access later.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Available Documents</h2>
              <p className="text-sm text-slate-600">
                Showing {filteredDocuments.length} of {documents.length} documents
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredDocuments.map((document) => (
              <article key={document.href} className="border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    {document.type === "Certificate" ? (
                      <FileCheck2 className="h-6 w-6" />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                        {document.type}
                      </span>
                      <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                        {document.category}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold">{document.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{document.description}</p>
                    {"registeredDate" in document && document.registeredDate ? (
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Registered {document.registeredDate} · {document.fileName}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href={document.href} target="_blank" rel="noopener noreferrer">
                    <Button className="h-10 gap-2">
                      <FileText className="h-4 w-4" />
                      Open PDF
                    </Button>
                  </a>
                  <a href={document.href} download>
                    <Button variant="outline" className="h-10 gap-2 bg-white">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </a>
                </div>
              </article>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="font-display text-2xl font-bold">No documents found</h2>
              <p className="mt-2 text-sm text-slate-600">
                Try searching for ISO, IATF, SX, ATS, certificate, or spec sheet.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
