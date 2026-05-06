import { Link } from "wouter";
import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  LockKeyhole,
  Mail,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import sunnyLogo from "@assets/image_1775118121182.png";

const lastUpdated = "May 6, 2026";

const sections = [
  {
    id: "privacy",
    title: "Privacy Notice",
    icon: <LockKeyhole className="h-5 w-5" />,
    body: [
      "SunnyKR.com collects business contact and RFQ information only when visitors submit it through forms, upload lists, request Sunny Portal Access, or contact Sunny Electronics Corp. directly.",
      "Typical information may include name, company, role, business email, phone number, shipping or billing details, RFQ files, part numbers, target quantities, application notes, and document requests.",
      "This information is used to respond to inquiries, prepare quotations, evaluate account or SPA access requests, support order and quality-document workflows, improve SunnyKR.com, and meet legal, accounting, export, security, and compliance obligations.",
    ],
  },
  {
    id: "data-handling",
    title: "Data Handling",
    icon: <ShieldCheck className="h-5 w-5" />,
    body: [
      "Sunny Electronics Corp. keeps business information for as long as needed for RFQ, quote, order, support, audit, and legal purposes. When information is no longer needed, Sunny may delete, archive, anonymize, or retain it where required by law or legitimate business recordkeeping.",
      "SunnyKR.com may use hosting, email, analytics, file-storage, security, and business-system providers to operate the website and process requests. These providers should handle information only for the services they provide to Sunny.",
      "SunnyKR.com is intended for business-to-business use and is not directed to children. Visitors should not submit confidential customer data, controlled technical data, or sensitive personal information unless Sunny has specifically requested it through an approved channel.",
    ],
  },
  {
    id: "terms",
    title: "Website Terms",
    icon: <Scale className="h-5 w-5" />,
    body: [
      "Content on SunnyKR.com is provided for general product, document, RFQ, and vendor-support purposes. Product descriptions, images, specifications, availability, lead times, certifications, and pricing are informational until confirmed in an official Sunny quotation, purchase order acknowledgement, signed agreement, or other written confirmation.",
      "Visitors may use SunnyKR.com only for lawful business purposes. They may not interfere with site operation, attempt unauthorized access, upload malicious files, scrape non-public data, misrepresent company identity, or use Sunny documents outside the scope provided by Sunny.",
      "Sunny may update, suspend, restrict, or remove website features, documents, catalog information, portal access, or submitted requests at any time to protect security, confidentiality, quality, legal compliance, or business operations.",
    ],
  },
  {
    id: "documents",
    title: "Documents and Specifications",
    icon: <FileText className="h-5 w-5" />,
    body: [
      "Datasheets, certificates, drawings, reliability reports, RoHS/REACH materials, and other documents may be revised over time. Visitors are responsible for confirming that the document version used for design, procurement, qualification, or production is the latest version supplied or approved by Sunny.",
      "SPA-only materials, vendor-specific quality documents, customer documents, price lists, stock files, order lists, and private reports are confidential unless Sunny expressly marks them as public.",
      "No website content grants a license to Sunny trademarks, part-number systems, technical drawings, confidential information, or intellectual property except as needed to evaluate Sunny products for legitimate business procurement or engineering purposes.",
    ],
  },
  {
    id: "liability",
    title: "Commercial Disclaimers",
    icon: <ClipboardCheck className="h-5 w-5" />,
    body: [
      "To the extent permitted by applicable law, SunnyKR.com and its content are provided as available and without website-level warranties. Sunny does not guarantee that every catalog entry, upload workflow, document link, search result, or portal feature will be error-free or continuously available.",
      "Final product suitability, qualification, testing, and compliance decisions remain the responsibility of the buyer, distributor, integrator, or end customer unless a separate written agreement states otherwise.",
      "Nothing on this page changes signed contracts, official quotations, purchase terms, quality agreements, NDAs, export-control obligations, or written warranty commitments issued by Sunny Electronics Corp.",
    ],
  },
  {
    id: "contact",
    title: "Contact and Rights Requests",
    icon: <Mail className="h-5 w-5" />,
    body: [
      "Business contacts may request access, correction, deletion, restriction, or review of personal information submitted through SunnyKR.com, subject to identity verification, legal obligations, and business-record retention requirements.",
      "For privacy, document-access, RFQ, or SPA questions, use the SunnyKR request forms or your established Sunny Electronics Corp. contact. Sunny may ask for additional information to verify the requester and locate the relevant record.",
      "This page is a working website policy draft for SunnyKR.com and should be reviewed by qualified counsel before public launch, especially for Korea PIPA, cross-border transfers, CCPA/CPRA, GDPR, export-control, warranty, and distributor-contract alignment.",
    ],
  },
];

export default function Legal() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">Legal Center</div>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/">
              <Button variant="outline" className="h-11 gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/request-quote">
              <Button className="h-11">Request Quote</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
                SunnyKR.com
              </p>
              <h1 className="mb-4 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                Legal, privacy, and website terms.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                These terms summarize how SunnyKR.com handles business inquiries, RFQ uploads,
                product documents, portal access requests, and website information.
              </p>
            </div>
            <aside className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                <Scale className="h-4 w-4" />
                Working Draft
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Last updated {lastUpdated}. This operational copy should be reviewed by Sunny counsel
                before launch or contract use.
              </p>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[260px_1fr]">
          <nav className="h-fit border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Sections
            </div>
            <div className="grid gap-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
                >
                  {section.icon}
                  {section.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="grid gap-5">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-6 border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    {section.icon}
                  </div>
                  <h2 className="font-display text-2xl font-bold">{section.title}</h2>
                </div>
                <div className="grid gap-4 text-sm leading-7 text-slate-600 md:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
