import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getQuoteType, type QuoteFieldDef } from "@/data/quote-types";
import {
  publicQuotePriceDisclaimer,
  resolvePublicQuoteDecision,
  resolvePublicQuotePrice,
} from "@/data/public-quote-price";
import sunnyPublicCatalog from "@/data/sunny-obsidian-public.json";
import sunnyLogo from "@assets/image_1775118121182.png";

const FALLBACK_SALES_EMAIL = "web@sunnykr.com";

type SubmitState = "idle" | "sending" | "sent" | "error";

function buildInitialValues(fields: QuoteFieldDef[]) {
  const values: Record<string, string> = {};
  for (const field of fields) {
    values[field.name] =
      field.defaultValue ??
      (field.type === "select" ? (field.options?.[0] ?? "") : "");
  }
  return values;
}

function FieldLabel({ field }: { field: QuoteFieldDef }) {
  return (
    <label
      htmlFor={`field-${field.name}`}
      className="text-sm font-medium text-foreground"
    >
      {field.label}
      {field.required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  );
}

export default function QuoteType({ typeId }: { typeId: string }) {
  const quoteType = getQuoteType(typeId);
  const publicCatalogPart = useMemo(() => {
    if (typeof window === "undefined") return "";
    const candidate = (
      new URLSearchParams(window.location.search).get("partNumber") || ""
    )
      .replace(/[^a-z0-9._/+\-]/gi, "")
      .slice(0, 80);
    return sunnyPublicCatalog.models.some((model) => model.model === candidate)
      ? candidate
      : "";
  }, []);

  const [specValues, setSpecValues] = useState<Record<string, string>>(() => {
    if (!quoteType) return {};
    const values = buildInitialValues(quoteType.fields);
    if (publicCatalogPart && quoteType.id === "other") {
      values.description = `Sunny public catalog model ${publicCatalogPart}. Please confirm the required frequency, package, specifications, and EAU (Expected Annual Usage).`;
    }
    return values;
  });
  const [quantity, setQuantity] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState(
    publicCatalogPart
      ? `Selected from Sunny's verified public catalog: ${publicCatalogPart}`
      : "",
  );
  const [contactName, setContactName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const specs = useMemo(() => {
    if (!quoteType) {
      return [];
    }
    return quoteType.fields
      .map((field) => ({
        label: field.label,
        value: specValues[field.name]?.trim() ?? "",
      }))
      .filter((spec) => spec.value !== "");
  }, [quoteType, specValues]);

  const publicQuotePrice = useMemo(
    () =>
      quoteType ? resolvePublicQuotePrice(quoteType.id, specValues) : null,
    [quoteType, specValues],
  );
  const publicQuoteDecision = useMemo(
    () =>
      quoteType ? resolvePublicQuoteDecision(quoteType.id, specValues) : null,
    [quoteType, specValues],
  );

  if (!quoteType) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-5 text-center">
        <h1 className="font-display text-2xl font-bold">
          Product type not found
        </h1>
        <p className="text-muted-foreground">
          The quote type "{typeId}" does not exist.
        </p>
        <Link
          href="/quote"
          className="font-semibold text-primary hover:underline"
        >
          See all product types
        </Link>
      </div>
    );
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const requiredSpecsFilled = quoteType.fields
    .filter((field) => field.required)
    .every((field) => (specValues[field.name] ?? "").trim() !== "");
  const formValid =
    requiredSpecsFilled &&
    quantity.trim() !== "" &&
    contactName.trim() !== "" &&
    emailValid;

  const showError = (name: string) => touched[name] === true;

  const mailtoFallback = () => {
    const lines = [
      `Quote request: ${quoteType.name}`,
      "",
      ...specs.map((spec) => `${spec.label}: ${spec.value}`),
      `EAU (Expected Annual Usage): ${quantity}`,
      targetDate ? `Target date: ${targetDate}` : "",
      notes ? `Notes: ${notes}` : "",
      "",
      `Name: ${contactName}`,
      company ? `Company: ${company}` : "",
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
    ].filter(Boolean);
    return `mailto:${FALLBACK_SALES_EMAIL}?subject=${encodeURIComponent(
      `[RFQ] ${quoteType.name}`,
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formValid) {
      const allTouched: Record<string, boolean> = {
        quantity: true,
        contactName: true,
        email: true,
      };
      for (const field of quoteType.fields) {
        allTouched[field.name] = true;
      }
      setTouched(allTouched);
      return;
    }

    setSubmitState("sending");
    setErrorMessage("");
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeId: quoteType.id,
          typeName: quoteType.name,
          specs,
          quantity: quantity.trim(),
          targetDate,
          notes: notes.trim(),
          contact: {
            name: contactName.trim(),
            company: company.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
          website: honeypot,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          body?.error || "The quote service is unavailable right now.",
        );
      }
      setSubmitState("sent");
      window.scrollTo({ top: 0 });
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  };

  const selectClassName =
    "h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

  const renderSpecField = (field: QuoteFieldDef) => {
    const value = specValues[field.name] ?? "";
    const invalid =
      field.required && showError(field.name) && value.trim() === "";
    const setValue = (next: string) =>
      setSpecValues((previous) => ({ ...previous, [field.name]: next }));
    const markTouched = () =>
      setTouched((previous) => ({ ...previous, [field.name]: true }));

    return (
      <div
        key={field.name}
        className={`grid gap-1.5 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}
      >
        <FieldLabel field={field} />
        {field.type === "select" ? (
          <select
            id={`field-${field.name}`}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className={selectClassName}
            data-testid={`select-quote-${field.name}`}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : field.type === "textarea" ? (
          <Textarea
            id={`field-${field.name}`}
            rows={5}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={markTouched}
            placeholder={field.placeholder}
            data-testid={`input-quote-${field.name}`}
          />
        ) : (
          <Input
            id={`field-${field.name}`}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={markTouched}
            placeholder={field.placeholder}
            data-testid={`input-quote-${field.name}`}
          />
        )}
        {invalid && (
          <p className="text-xs text-destructive">{field.label} is required.</p>
        )}
        {field.hint && (
          <p className="text-xs text-muted-foreground">{field.hint}</p>
        )}
      </div>
    );
  };

  const Icon = quoteType.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-foreground font-sans">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link
            href="/"
            className="flex items-center gap-3"
            data-testid="link-quote-type-home"
          >
            <img
              src={sunnyLogo}
              alt="Sunny Electronics Corp."
              className="h-9 w-auto"
            />
            <span className="font-display text-lg font-bold tracking-tight">
              Sunny Electronics Corp.
            </span>
          </Link>
          <Link
            href="/quote"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-quote-type-back"
          >
            <ArrowLeft className="h-4 w-4" />
            All product types
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/quote" className="hover:text-foreground">
            Request a Quote
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{quoteType.name}</span>
        </div>

        {submitState === "sent" ? (
          <div
            className="mt-8 border border-slate-200 bg-white p-8 text-center shadow-sm"
            data-testid="panel-quote-success"
          >
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
              Quote request sent
            </h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
              Thank you, {contactName.split(" ")[0] || "there"}. Our sales team
              received your {quoteType.name} request and will reply to{" "}
              <span className="font-medium text-foreground">{email}</span>{" "}
              within 1 business day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/quote">
                <Button variant="outline" data-testid="button-quote-another">
                  Request another quote
                </Button>
              </Link>
              <Link href="/">
                <Button data-testid="button-quote-success-home">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  {quoteType.name} Quote
                </h1>
                <p className="mt-1 text-muted-foreground">
                  {quoteType.tagline}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 grid gap-6"
            >
              <section className="border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                    1
                  </span>
                  <h2 className="font-display text-lg font-bold">
                    Requirements
                  </h2>
                </div>
                <p className="mt-1.5 pl-10 text-sm text-muted-foreground">
                  Fill in what you know. Anything you are unsure about, leave
                  as-is or pick "Not sure" — our engineers will confirm with
                  you.
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {quoteType.fields.map(renderSpecField)}
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="field-quantity"
                      className="text-sm font-medium"
                    >
                      EAU (Expected Annual Usage)
                      <span className="ml-0.5 text-destructive">*</span>
                    </label>
                    <Input
                      id="field-quantity"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, quantity: true }))
                      }
                      placeholder="e.g. 50,000 pcs per year"
                      data-testid="input-quote-quantity"
                    />
                    {showError("quantity") && quantity.trim() === "" && (
                      <p className="text-xs text-destructive">
                        Expected annual usage is required.
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="field-target-date"
                      className="text-sm font-medium"
                    >
                      Target date
                    </label>
                    <Input
                      id="field-target-date"
                      type="date"
                      value={targetDate}
                      onChange={(event) => setTargetDate(event.target.value)}
                      data-testid="input-quote-target-date"
                    />
                  </div>
                  {publicQuotePrice && (
                    <div
                      className="sm:col-span-2 border border-primary/25 bg-primary/5 p-5"
                      data-testid="panel-public-quote-estimate"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display text-base font-bold text-foreground">
                          Estimated Quote
                        </h3>
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                          USD per unit
                        </span>
                      </div>
                      <dl className="mt-4 grid gap-4 sm:grid-cols-4">
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Part number
                          </dt>
                          <dd
                            className="mt-1 font-semibold"
                            data-testid="quote-estimate-model"
                          >
                            {publicQuotePrice.model}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">SPQ</dt>
                          <dd
                            className="mt-1 font-semibold"
                            data-testid="quote-estimate-spq"
                          >
                            {publicQuotePrice.spq.toLocaleString()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">MOQ</dt>
                          <dd
                            className="mt-1 font-semibold"
                            data-testid="quote-estimate-moq"
                          >
                            {publicQuotePrice.moq.toLocaleString()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Estimated price
                          </dt>
                          <dd
                            className="mt-1 font-bold text-primary"
                            data-testid="quote-estimate-price"
                          >
                            ${publicQuotePrice.unitPriceUsd.toFixed(3)}
                          </dd>
                        </div>
                      </dl>
                      {publicQuotePrice.variant && (
                        <p className="mt-3 text-xs font-medium text-foreground">
                          Applies to: {publicQuotePrice.variant}
                        </p>
                      )}
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        {publicQuotePriceDisclaimer}
                      </p>
                    </div>
                  )}
                  {!publicQuotePrice &&
                    publicQuoteDecision?.status === "submit-for-price" && (
                      <div
                        className="sm:col-span-2 border border-amber-300 bg-amber-50 p-5"
                        data-testid="panel-submit-for-price"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-display text-base font-bold text-amber-950">
                            Submit for Price
                          </h3>
                          <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                            Sunny review required
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-amber-950">
                          {publicQuoteDecision.reason} Complete the EAU and
                          contact details below so Sunny can confirm the
                          configuration and price.
                        </p>
                      </div>
                    )}
                  <div className="grid gap-1.5 sm:col-span-2">
                    <label
                      htmlFor="field-notes"
                      className="text-sm font-medium"
                    >
                      Notes
                    </label>
                    <Textarea
                      id="field-notes"
                      rows={3}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Application, current part number, datasheet request — anything helpful."
                      data-testid="input-quote-notes"
                    />
                  </div>
                </div>
              </section>

              <section className="border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                    2
                  </span>
                  <h2 className="font-display text-lg font-bold">
                    Your contact details
                  </h2>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="field-contact-name"
                      className="text-sm font-medium"
                    >
                      Name<span className="ml-0.5 text-destructive">*</span>
                    </label>
                    <Input
                      id="field-contact-name"
                      value={contactName}
                      onChange={(event) => setContactName(event.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, contactName: true }))
                      }
                      autoComplete="name"
                      data-testid="input-quote-name"
                    />
                    {showError("contactName") && contactName.trim() === "" && (
                      <p className="text-xs text-destructive">
                        Name is required.
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="field-company"
                      className="text-sm font-medium"
                    >
                      Company
                    </label>
                    <Input
                      id="field-company"
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      autoComplete="organization"
                      data-testid="input-quote-company"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="field-email"
                      className="text-sm font-medium"
                    >
                      Work email
                      <span className="ml-0.5 text-destructive">*</span>
                    </label>
                    <Input
                      id="field-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, email: true }))
                      }
                      autoComplete="email"
                      data-testid="input-quote-email"
                    />
                    {showError("email") && !emailValid && (
                      <p className="text-xs text-destructive">
                        A valid email is required so we can send your quote.
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="field-phone"
                      className="text-sm font-medium"
                    >
                      Phone
                    </label>
                    <Input
                      id="field-phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      autoComplete="tel"
                      data-testid="input-quote-phone"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
              </section>

              {submitState === "error" && (
                <div
                  className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                  data-testid="panel-quote-error"
                >
                  <p className="font-semibold">Could not send your request.</p>
                  <p className="mt-1">
                    {errorMessage} You can also email us directly:{" "}
                    <a
                      href={mailtoFallback()}
                      className="font-semibold underline"
                    >
                      {FALLBACK_SALES_EMAIL}
                    </a>
                  </p>
                </div>
              )}

              <div
                className="border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
                data-testid="notice-eau-price-confirmation"
              >
                <p className="font-semibold">
                  EAU is required for final price confirmation.
                </p>
                <p className="mt-1">
                  Expected annual usage may change the unit price. Any displayed
                  price is an estimate; Sunny will confirm the actual price
                  after reviewing your EAU, specifications, and complete
                  requirements.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full gap-2 text-base"
                disabled={submitState === "sending"}
                data-testid="button-quote-submit"
              >
                {submitState === "sending" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {publicQuotePrice
                      ? "Confirm My Quote"
                      : "Send Quote Request"}
                  </>
                )}
              </Button>
              <p className="-mt-3 text-center text-xs text-muted-foreground">
                Sent directly to Sunny Electronics sales. We reply within 1
                business day.
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
