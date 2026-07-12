import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Clock, Mail, ShieldCheck } from "lucide-react";
import { quoteTypes } from "@/data/quote-types";
import sunnyLogo from "@assets/image_1775118121182.png";

export default function Quote() {
  const visibleTypes = quoteTypes.filter((type) => !type.hidden);
  const otherType = quoteTypes.find((type) => type.id === "other");

  return (
    <div className="min-h-screen bg-slate-50 text-foreground font-sans">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-3" data-testid="link-quote-home">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-9 w-auto" />
            <span className="font-display text-lg font-bold tracking-tight">
              Sunny Electronics Corp.
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-quote-back-home"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Request a Quote
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
            What do you need a quote for?
          </h1>
          <p className="mt-4 text-lg leading-7 text-muted-foreground">
            Pick a product type below. You will answer a few short questions and
            our sales team replies with pricing and lead time.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Takes about 2 minutes
          </span>
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Reply within 1 business day
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            KOSPI-listed manufacturer since 1968
          </span>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Link
                key={type.id}
                href={`/quote/${type.id}`}
                className="group flex flex-col border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md cursor-pointer"
                data-testid={`card-quote-type-${type.id}`}
              >
                <div className="flex h-11 w-11 items-center justify-center bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold tracking-tight">
                  {type.name}
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {type.tagline}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {type.examples}
                </p>
                <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary">
                  Start quote
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        {otherType && (
          <div className="mt-8 border border-dashed border-slate-300 bg-white/60 p-5 text-center text-sm text-muted-foreground">
            Not sure which type you need?{" "}
            <Link
              href={`/quote/${otherType.id}`}
              className="font-semibold text-primary hover:underline"
              data-testid="link-quote-not-sure"
            >
              Send us what you know
            </Link>{" "}
            and we will identify the right product for you.
          </div>
        )}
      </main>
    </div>
  );
}
