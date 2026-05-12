import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Clock,
  Cpu,
  Download,
  FileText,
  Gauge,
  HelpCircle,
  History,
  Package,
  Plus,
  RadioReceiver,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import sunnyLogo from "@assets/image_1775118121182.png";

type QuoteFamily = "crystal" | "tuningFork" | "xo" | "vcxo" | "tcxo" | "other";

type QuoteLine = {
  id: number;
  family: string;
  partNumber: string;
  packageType: string;
  frequency: string;
  spec: string;
  quantity: string;
  note: string;
};

const crystalPackages = [
  { type: "ATS-25/U", code: "C", description: "Lead crystal, older through-hole designs" },
  { type: "ATS-49/U", code: "D", description: "Lead crystal, common industrial format" },
  { type: "SX-1", code: "J", description: "ATS SMD crystal" },
  { type: "SX-3", code: "K", description: "Low-profile ATS SMD crystal" },
  { type: "SX-7", code: "M", description: "7.0 x 5.0 mm SMD crystal" },
  { type: "SX-8", code: "O", description: "5.0 x 3.2 mm SMD crystal" },
  { type: "SX-32", code: "P", description: "3.2 x 2.5 mm SMD crystal" },
  { type: "SX-22", code: "Q", description: "2.5 x 2.0 mm SMD crystal" },
  { type: "SX-21", code: "R", description: "2.0 x 1.6 mm SMD crystal" },
  { type: "SX-16", code: "S", description: "1.6 x 1.2 mm SMD crystal" },
  { type: "SX-A21", code: "T", description: "Automotive 2.0 x 1.6 mm crystal" },
  { type: "SX-A22", code: "U", description: "Automotive 2.5 x 2.0 mm crystal" },
  { type: "SX-A32", code: "V", description: "Automotive 3.2 x 2.5 mm crystal" },
  { type: "SX-A8", code: "W", description: "Automotive 5.0 x 3.2 mm crystal" },
];

const tuningForkPackages = [
  { type: "CS-306", code: "TC" },
  { type: "CS-519", code: "TJ" },
  { type: "CS-146", code: "TK" },
  { type: "CS-3215", code: "TL" },
  { type: "CS-2012", code: "TM" },
  { type: "CS-1610", code: "TN" },
  { type: "CS-406", code: "TD" },
  { type: "CS-405", code: "TF" },
];

const familyCards = [
  {
    id: "crystal" as QuoteFamily,
    name: "Crystal Resonator",
    summary: "Most common MHz crystal units such as SX-21, SX-32, SX-1.",
    icon: Cpu,
  },
  {
    id: "tuningFork" as QuoteFamily,
    name: "Tuning Fork",
    summary: "32.768 kHz clock crystals such as CS-2012, CS-3215, CS-306.",
    icon: RadioReceiver,
  },
  {
    id: "xo" as QuoteFamily,
    name: "Oscillator (XO)",
    summary: "SCO families with voltage, stability, duty, and OE options.",
    icon: Timer,
  },
  {
    id: "vcxo" as QuoteFamily,
    name: "VCXO",
    summary: "Voltage controlled oscillators with pulling/deviation options.",
    icon: Waves,
  },
  {
    id: "tcxo" as QuoteFamily,
    name: "TCXO / VCTCXO",
    summary: "Temperature compensated oscillators for tighter stability.",
    icon: ShieldCheck,
  },
  {
    id: "other" as QuoteFamily,
    name: "Not Sure",
    summary: "New to components? Send what you know and Sunny will review.",
    icon: HelpCircle,
  },
];

const crystalTempOptions = [
  { code: "D", label: "-10~70C" },
  { code: "E", label: "-20~70C" },
  { code: "F", label: "-30~60C" },
  { code: "G", label: "-20~85C" },
  { code: "H", label: "-30~70C" },
  { code: "I", label: "-30~85C" },
  { code: "J", label: "-40~85C" },
  { code: "K", label: "-40~90C" },
  { code: "L", label: "-40~105C" },
  { code: "M", label: "-40~125C" },
  { code: "N", label: "-40~150C" },
];

const stabilityOptions = [
  { code: "3", label: "+/-10ppm", catalogValue: "10" },
  { code: "4", label: "+/-15ppm", catalogValue: "15" },
  { code: "5", label: "+/-20ppm", catalogValue: "20" },
  { code: "6", label: "+/-30ppm", catalogValue: "30" },
  { code: "7", label: "+/-50ppm", catalogValue: "50" },
  { code: "8", label: "+/-100ppm", catalogValue: "100" },
];

const quickPresets = [
  {
    label: "Common 32 MHz SMD",
    packageCode: "R",
    frequency: "32",
    capacitance: "12",
    tolerance: "30",
    tempCode: "J",
    stabilityCode: "6",
  },
  {
    label: "4.9152 MHz SX-1",
    packageCode: "J",
    frequency: "4.9152",
    capacitance: "18",
    tolerance: "20",
    tempCode: "E",
    stabilityCode: "6",
  },
  {
    label: "25 MHz SX-32",
    packageCode: "P",
    frequency: "25",
    capacitance: "20",
    tolerance: "30",
    tempCode: "J",
    stabilityCode: "6",
  },
];

const formatMHz = (value: string) => {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "0.0000";
  }
  return parsed.toFixed(4);
};

const formatOscillatorMHz = (value: string) => {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "0.000";
  }
  return parsed.toFixed(3);
};

const formatKHz = (value: string) => {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "32.768";
  }
  return parsed.toFixed(3);
};

const findLabel = <T extends { code: string; label: string }>(items: T[], code: string) =>
  items.find((item) => item.code === code)?.label ?? code;

const exampleVendorEmail = `Hi John,
Pls kindly advice best quote for the following:

SCO-223350ADSR12.000M
Qty = 2Kpc

Proj = H8 Controller

Pls also advice SPQ & LT as well.`;

export default function RequestQuote() {
  const [searchQuery, setSearchQuery] = useState("");
  const [family, setFamily] = useState<QuoteFamily>("crystal");
  const [crystalPackage, setCrystalPackage] = useState("R");
  const [frequency, setFrequency] = useState("32");
  const [capacitance, setCapacitance] = useState("12");
  const [tolerance, setTolerance] = useState("30");
  const [temperature, setTemperature] = useState("J");
  const [stability, setStability] = useState("6");
  const [mode, setMode] = useState("1");
  const [quantity, setQuantity] = useState("10000");
  const [targetDate, setTargetDate] = useState("");
  const [customerReference, setCustomerReference] = useState("");
  const [note, setNote] = useState("");
  const [tuningForkPackage, setTuningForkPackage] = useState("TM");
  const [tuningForkCl, setTuningForkCl] = useState("125");
  const [tuningForkTemp, setTuningForkTemp] = useState("B");
  const [tuningForkFrequency, setTuningForkFrequency] = useState("32.768");
  const [xoProduct, setXoProduct] = useState("SCO-10");
  const [voltage, setVoltage] = useState("33");
  const [oscStability, setOscStability] = useState("50");
  const [oscTemp, setOscTemp] = useState("B");
  const [duty, setDuty] = useState("D");
  const [oe, setOe] = useState("S");
  const [output, setOutput] = useState("M");
  const [pulling, setPulling] = useState("5");
  const [emailText, setEmailText] = useState(exampleVendorEmail);
  const [quoteLines, setQuoteLines] = useState<QuoteLine[]>([]);

  const selectedCrystalPackage = crystalPackages.find((item) => item.code === crystalPackage) ?? crystalPackages[0];
  const selectedStability = stabilityOptions.find((item) => item.code === stability) ?? stabilityOptions[0];

  const generatedPart = useMemo(() => {
    if (family === "crystal") {
      return `S${crystalPackage}${capacitance}${mode}${tolerance}${temperature}${stability}-${formatMHz(frequency)}`;
    }

    if (family === "tuningFork") {
      return `S${tuningForkPackage}${tuningForkCl}20${tuningForkTemp}-${formatKHz(tuningForkFrequency)}-TR`;
    }

    if (family === "xo") {
      return `${xoProduct}${voltage}${oscStability}${oscTemp}${duty}${oe}R${formatOscillatorMHz(frequency)}M`;
    }

    if (family === "vcxo") {
      return `SVH${voltage}30GDDER${formatOscillatorMHz(frequency)}M`;
    }

    if (family === "tcxo") {
      return `STA${voltage}20J${output}${pulling}R${formatOscillatorMHz(frequency)}M`;
    }

    return "Sunny review request";
  }, [
    capacitance,
    crystalPackage,
    duty,
    family,
    frequency,
    mode,
    oe,
    oscStability,
    oscTemp,
    output,
    pulling,
    stability,
    temperature,
    tolerance,
    tuningForkCl,
    tuningForkFrequency,
    tuningForkPackage,
    tuningForkTemp,
    voltage,
    xoProduct,
  ]);

  const specSummary = useMemo(() => {
    if (family === "crystal") {
      return `${tolerance}/${selectedStability.catalogValue} ${findLabel(crystalTempOptions, temperature)}/${capacitance}pF`;
    }

    if (family === "tuningFork") {
      const clLabel = tuningForkCl === "125" ? "12.5pF" : `${Number(tuningForkCl) / 10}pF`;
      const tempLabel = tuningForkTemp === "A" ? "-40~85C" : tuningForkTemp === "B" ? "-20~70C" : "-10~60C";
      return `20ppm ${tempLabel}/${clLabel}`;
    }

    if (family === "xo") {
      return `${voltage.replace(/^(\d)(\d)$/, "$1.$2")}V, +/-${oscStability}ppm, ${oscTemp}, duty ${duty}, OE ${oe}`;
    }

    if (family === "vcxo") {
      return `${voltage.replace(/^(\d)(\d)$/, "$1.$2")}V, VCXO pulling, review details`;
    }

    if (family === "tcxo") {
      return `${voltage.replace(/^(\d)(\d)$/, "$1.$2")}V, TCXO/VCTCXO, output ${output}`;
    }

    return "Sunny review needed";
  }, [
    capacitance,
    family,
    oe,
    oscStability,
    oscTemp,
    output,
    selectedStability.catalogValue,
    temperature,
    tolerance,
    tuningForkCl,
    tuningForkTemp,
    voltage,
  ]);

  const selectedPackageLabel =
    family === "crystal"
      ? selectedCrystalPackage.type
      : family === "tuningFork"
        ? tuningForkPackages.find((item) => item.code === tuningForkPackage)?.type ?? tuningForkPackage
        : family === "xo"
          ? xoProduct
          : family === "vcxo"
            ? "SVH"
            : family === "tcxo"
              ? "STA"
              : "Review";

  const addGeneratedPart = () => {
    setQuoteLines((current) => [
      ...current,
      {
        id: Date.now(),
        family: familyCards.find((card) => card.id === family)?.name ?? "Review",
        partNumber: generatedPart,
        packageType: selectedPackageLabel,
        frequency: family === "tuningFork" ? `${formatKHz(tuningForkFrequency)} kHz` : `${formatMHz(frequency)} MHz`,
        spec: specSummary,
        quantity,
        note: [customerReference, note, targetDate ? `Target ${targetDate}` : ""].filter(Boolean).join(" | "),
      },
    ]);
  };

  const parseVendorEmail = () => {
    const normalized = emailText.replace(/\r/g, "");
    const partMatch = normalized.match(/\b(?:SCO|SVH|STA|STJ|STI|STH|STG|STF|STE|STB|SX|CS|CR|S[A-Z]{1,2})[-A-Z0-9.]+M?\b/i);
    const qtyMatch = normalized.match(/\bQty\s*=\s*([^\n\r]+)/i) ?? normalized.match(/\bQTY\s*[:\-]?\s*([^\n\r]+)/i);
    const projectMatch = normalized.match(/\bProj(?:ect)?\s*=\s*([^\n\r]+)/i);
    const requestNotes: string[] = [];

    if (/SPQ/i.test(normalized)) {
      requestNotes.push("Advise SPQ");
    }
    if (/\bLT\b|lead\s*time/i.test(normalized)) {
      requestNotes.push("Advise LT");
    }

    const partNumber = partMatch?.[0]?.replace(/[,\s]+$/g, "") ?? "Review needed";
    const qty = qtyMatch?.[1]?.trim() ?? quantity;
    const project = projectMatch?.[1]?.trim() ?? customerReference;
    const isXo = partNumber.toUpperCase().startsWith("SCO-");
    const frequencyMatch = partNumber.match(/(\d+(?:\.\d+)?)M$/i);
    const productMatch = partNumber.match(/^(SCO-\d+)/i);

    if (isXo) {
      setFamily("xo");
      if (productMatch) {
        setXoProduct(productMatch[1].toUpperCase());
      }
      if (frequencyMatch) {
        setFrequency(frequencyMatch[1]);
      }
      const codeStart = productMatch?.[1].length ?? 0;
      const codeBeforeFrequency = partNumber.slice(codeStart).replace(/(\d+(?:\.\d+)?)M$/i, "");
      if (codeBeforeFrequency.length >= 8) {
        setVoltage(codeBeforeFrequency.slice(0, 2));
        setOscStability(codeBeforeFrequency.slice(2, 4));
        setOscTemp(codeBeforeFrequency.slice(4, 5));
        setDuty(codeBeforeFrequency.slice(5, 6));
        setOe(codeBeforeFrequency.slice(6, 7));
      }
    } else {
      setFamily("other");
    }

    setQuantity(qty);
    setCustomerReference(project);
    setNote(requestNotes.join(" | "));
    setQuoteLines((current) => [
      ...current,
      {
        id: Date.now(),
        family: isXo ? "Oscillator (XO)" : "Sunny review",
        partNumber,
        packageType: productMatch?.[1].toUpperCase() ?? "Review",
        frequency: frequencyMatch ? `${formatOscillatorMHz(frequencyMatch[1])} MHz` : "-",
        spec: isXo ? "Parsed from customer RFQ email" : "Review needed",
        quantity: qty,
        note: [project ? `Project: ${project}` : "", requestNotes.join(" | ")].filter(Boolean).join(" | "),
      },
    ]);
  };

  const applyPreset = (preset: (typeof quickPresets)[number]) => {
    setFamily("crystal");
    setCrystalPackage(preset.packageCode);
    setFrequency(preset.frequency);
    setCapacitance(preset.capacitance);
    setTolerance(preset.tolerance);
    setTemperature(preset.tempCode);
    setStability(preset.stabilityCode);
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    window.location.href = query
      ? `/documents?search=${encodeURIComponent(query)}`
      : "/documents";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">Instant RFQ Builder</div>
            </div>
          </Link>

          <form
            onSubmit={submitSearch}
            className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50"
            role="search"
          >
            <Input
              className="h-12 flex-1 border-0 bg-transparent focus-visible:ring-0"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search part number, spec sheet, datasheet, RoHS, or QA document"
              data-testid="input-rfq-search"
            />
            <button
              type="submit"
              className="flex h-12 w-14 items-center justify-center bg-primary text-white"
              aria-label="Search"
              data-testid="button-rfq-search"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          <Link href="/request-access">
            <Button variant="outline" className="h-12 gap-2">
              <History className="h-4 w-4" />
              Quote History
            </Button>
          </Link>
        </div>

        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-5 pb-4 text-sm font-semibold">
          <Link href="/" className="text-slate-600 hover:text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Home
          </Link>
          <a href="#instant" className="text-slate-600 hover:text-primary">Instant Builder</a>
          <a href="#quote-list" className="text-slate-600 hover:text-primary">Quote List</a>
          <Link href="/documents" className="text-slate-600 hover:text-primary">Search Documents</Link>
          <a href="#details" className="text-slate-600 hover:text-primary">Contact Details</a>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_430px] lg:items-center">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-4 w-4" />
                Request a Quote
              </p>
              <h1 className="mb-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Pick specs visually. Get a Sunny quote-ready part number.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                Choose a product family, click the package and electrical options, then add the generated
                E-CATALOG format to your RFQ list. Experts can move fast; new users can follow the labels.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#instant">
                  <Button className="h-11 gap-2" data-testid="button-start-builder">
                    <Plus className="h-4 w-4" />
                    Build a Part
                  </Button>
                </a>
                <Link href="/documents">
                  <Button
                    variant="outline"
                    className="h-11 gap-2 bg-white"
                    data-testid="button-search-documents"
                  >
                    <Search className="h-4 w-4" />
                    Search Documents
                  </Button>
                </Link>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Sunny will confirm
              </div>
              <div className="grid gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Price, lead time, and MOQ
                </div>
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 text-slate-400" />
                  Datasheet, QA documents, and spec availability
                </div>
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-4 w-4 text-slate-400" />
                  Customer part number and exact PO reference
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="instant" className="mx-auto max-w-7xl px-5 py-10">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Instant Part Builder</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Start with a family. The form changes to show only the options that matter for that part type.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  className="h-10 bg-white"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="grid gap-3">
              {familyCards.map((card) => {
                const Icon = card.icon;
                const selected = family === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setFamily(card.id)}
                    className={`border p-4 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary text-white"
                        : "border-slate-200 bg-white text-slate-900 hover:border-primary/40"
                    }`}
                    data-testid={`button-family-${card.id}`}
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div className="font-display text-lg font-bold">{card.name}</div>
                    </div>
                    <p className={selected ? "text-sm leading-5 text-white/80" : "text-sm leading-5 text-slate-600"}>
                      {card.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-1 text-sm font-semibold text-primary">Customer-facing part number</div>
                    <div className="break-all font-mono text-2xl font-bold text-slate-950">{generatedPart}</div>
                    <div className="mt-2 text-sm text-slate-600">{specSummary}</div>
                  </div>
                  <Button className="h-11 gap-2" onClick={addGeneratedPart} data-testid="button-add-generated-part">
                    <Plus className="h-4 w-4" />
                    Add to Quote List
                  </Button>
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
                {family === "crystal" && (
                  <>
                    <Field label="Package" icon={<Package className="h-4 w-4" />}>
                      <select
                        value={crystalPackage}
                        onChange={(event) => setCrystalPackage(event.target.value)}
                        className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        {crystalPackages.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.type} ({option.code})
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Frequency (MHz)" icon={<Gauge className="h-4 w-4" />}>
                      <Input value={frequency} onChange={(event) => setFrequency(event.target.value)} inputMode="decimal" />
                    </Field>
                    <Field label="Load capacitance" icon={<Cpu className="h-4 w-4" />}>
                      <select
                        value={capacitance}
                        onChange={(event) => setCapacitance(event.target.value)}
                        className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        {["06", "07", "08", "09", "10", "12", "16", "18", "20", "30"].map((option) => (
                          <option key={option} value={option}>{Number(option)} pF</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Tolerance" icon={<ShieldCheck className="h-4 w-4" />}>
                      <select
                        value={tolerance}
                        onChange={(event) => setTolerance(event.target.value)}
                        className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        {["10", "15", "20", "30", "50"].map((option) => (
                          <option key={option} value={option}>+/-{option}ppm</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Temperature" icon={<Timer className="h-4 w-4" />}>
                      <select
                        value={temperature}
                        onChange={(event) => setTemperature(event.target.value)}
                        className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        {crystalTempOptions.map((option) => (
                          <option key={option.code} value={option.code}>{option.code}: {option.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Stability" icon={<Gauge className="h-4 w-4" />}>
                      <select
                        value={stability}
                        onChange={(event) => setStability(event.target.value)}
                        className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        {stabilityOptions.map((option) => (
                          <option key={option.code} value={option.code}>{option.code}: {option.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Mode" icon={<Waves className="h-4 w-4" />}>
                      <select
                        value={mode}
                        onChange={(event) => setMode(event.target.value)}
                        className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="1">1: Fundamental</option>
                        <option value="3">3: 3rd overtone</option>
                        <option value="5">5: 5th overtone</option>
                      </select>
                    </Field>
                    <div className="md:col-span-2 xl:col-span-3 border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      {selectedCrystalPackage.description}
                    </div>
                  </>
                )}

                {family === "tuningFork" && (
                  <>
                    <Field label="Package" icon={<Package className="h-4 w-4" />}>
                      <select
                        value={tuningForkPackage}
                        onChange={(event) => setTuningForkPackage(event.target.value)}
                        className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        {tuningForkPackages.map((option) => (
                          <option key={option.code} value={option.code}>{option.type} ({option.code})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Frequency (kHz)" icon={<Gauge className="h-4 w-4" />}>
                      <Input value={tuningForkFrequency} onChange={(event) => setTuningForkFrequency(event.target.value)} />
                    </Field>
                    <Field label="Load capacitance" icon={<Cpu className="h-4 w-4" />}>
                      <select
                        value={tuningForkCl}
                        onChange={(event) => setTuningForkCl(event.target.value)}
                        className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="125">12.5 pF</option>
                        <option value="90">9.0 pF</option>
                        <option value="70">7.0 pF</option>
                      </select>
                    </Field>
                    <Field label="Temperature" icon={<Timer className="h-4 w-4" />}>
                      <select
                        value={tuningForkTemp}
                        onChange={(event) => setTuningForkTemp(event.target.value)}
                        className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="A">A: -40~85C</option>
                        <option value="B">B: -20~70C</option>
                        <option value="C">C: -10~60C</option>
                      </select>
                    </Field>
                  </>
                )}

                {(family === "xo" || family === "vcxo" || family === "tcxo") && (
                  <>
                    {family === "xo" && (
                      <Field label="XO product" icon={<Package className="h-4 w-4" />}>
                        <select
                          value={xoProduct}
                          onChange={(event) => setXoProduct(event.target.value)}
                          className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                          {["SCO-10", "SCO-32", "SCO-53", "SCO-22", "SCO-06"].map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </Field>
                    )}
                    <Field label="Frequency (MHz)" icon={<Gauge className="h-4 w-4" />}>
                      <Input value={frequency} onChange={(event) => setFrequency(event.target.value)} />
                    </Field>
                    <Field label="Supply voltage" icon={<Cpu className="h-4 w-4" />}>
                      <select
                        value={voltage}
                        onChange={(event) => setVoltage(event.target.value)}
                        className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="50">5.0 V</option>
                        <option value="33">3.3 V</option>
                        <option value="25">2.5 V</option>
                        <option value="18">1.8 V</option>
                      </select>
                    </Field>
                    {family === "xo" && (
                      <>
                        <Field label="Stability" icon={<ShieldCheck className="h-4 w-4" />}>
                          <select
                            value={oscStability}
                            onChange={(event) => setOscStability(event.target.value)}
                            className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="25">+/-25ppm</option>
                            <option value="50">+/-50ppm</option>
                            <option value="100">+/-100ppm</option>
                          </select>
                        </Field>
                        <Field label="Operating temp" icon={<Timer className="h-4 w-4" />}>
                          <select
                            value={oscTemp}
                            onChange={(event) => setOscTemp(event.target.value)}
                            className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">0~70C</option>
                            <option value="A">-40~85C</option>
                            <option value="B">-20~70C</option>
                            <option value="C">-40~105C</option>
                            <option value="D">-40~125C</option>
                          </select>
                        </Field>
                        <Field label="Duty cycle" icon={<Waves className="h-4 w-4" />}>
                          <select
                            value={duty}
                            onChange={(event) => setDuty(event.target.value)}
                            className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="D">45/55</option>
                            <option value="E">40/60</option>
                          </select>
                        </Field>
                        <Field label="OE connection" icon={<ShieldCheck className="h-4 w-4" />}>
                          <select
                            value={oe}
                            onChange={(event) => setOe(event.target.value)}
                            className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="S">Tri-state</option>
                            <option value="E">Enable/disable</option>
                            <option value="">No connection</option>
                          </select>
                        </Field>
                      </>
                    )}
                    {family !== "xo" && (
                      <>
                        <Field label="Output" icon={<Waves className="h-4 w-4" />}>
                          <select
                            value={output}
                            onChange={(event) => setOutput(event.target.value)}
                            className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="M">HCMOS</option>
                            <option value="S">Clipped sinewave</option>
                          </select>
                        </Field>
                        <Field label="Pulling / deviation" icon={<Gauge className="h-4 w-4" />}>
                          <select
                            value={pulling}
                            onChange={(event) => setPulling(event.target.value)}
                            className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">TCXO, no pulling</option>
                            <option value="5">+/-5ppm min</option>
                            <option value="10">+/-50ppm min</option>
                          </select>
                        </Field>
                      </>
                    )}
                  </>
                )}

                {family === "other" && (
                  <div className="md:col-span-2 xl:col-span-3 grid gap-4">
                    <div className="border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                      Not sure what to choose? Add your current part number, frequency, size, or application below.
                      Sunny can identify the correct family and recommend the closest catalog format.
                    </div>
                    <Field label="What do you know?" icon={<HelpCircle className="h-4 w-4" />}>
                      <Textarea
                        rows={5}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Example: Need 32MHz small crystal for industrial temperature, not sure package."
                      />
                    </Field>
                  </div>
                )}

                <Field label="Quantity" icon={<ClipboardList className="h-4 w-4" />}>
                  <Input value={quantity} onChange={(event) => setQuantity(event.target.value)} />
                </Field>
                <Field label="Target date" icon={<Clock className="h-4 w-4" />}>
                  <Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
                </Field>
                <Field label="Customer reference" icon={<FileText className="h-4 w-4" />}>
                  <Input value={customerReference} onChange={(event) => setCustomerReference(event.target.value)} placeholder="Your part # or project" />
                </Field>
                {family !== "other" && (
                  <div className="md:col-span-2 xl:col-span-3">
                    <Field label="Notes" icon={<FileText className="h-4 w-4" />}>
                      <Textarea
                        rows={3}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Application, alternate specs, datasheet request, quality document request"
                      />
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold">Paste RFQ Email</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    For current vendors, paste the email text and SunnyKR will pull the part, quantity, project, SPQ, and lead-time request into the quote list.
                  </p>
                </div>
                <Button type="button" className="h-11 gap-2" onClick={parseVendorEmail}>
                  <Plus className="h-4 w-4" />
                  Parse and Add
                </Button>
              </div>
              <Textarea
                value={emailText}
                onChange={(event) => setEmailText(event.target.value)}
                rows={8}
                className="font-mono text-sm"
                placeholder="Paste customer RFQ email here"
                data-testid="textarea-paste-rfq-email"
              />
            </div>

            <div className="border border-slate-200 bg-slate-50 p-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                <FileText className="h-4 w-4" />
                Example parsed result
              </div>
              <div className="grid gap-3 text-sm text-slate-700">
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Part</span>
                  <span className="font-mono font-semibold">SCO-223350ADSR12.000M</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Qty</span>
                  <span className="font-semibold">2Kpc</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Project</span>
                  <span className="font-semibold">H8 Controller</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Request</span>
                  <span className="font-semibold">SPQ and LT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="details" className="mx-auto max-w-7xl px-5 pb-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="border border-slate-200 bg-white p-6">
              <h2 className="font-display text-2xl font-bold">Search before quoting</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use the search bar above to find Sunny part numbers, spec sheets, datasheets,
                RoHS documents, reliability files, and QA documents that visitors can view as PDFs.
              </p>
              <Link href="/documents">
                <Button variant="outline" className="mt-4 h-11 gap-2 bg-white">
                  <Search className="h-4 w-4" />
                  Open Document Search
                </Button>
              </Link>
            </div>

            <div className="border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-display text-xl font-bold">Contact details</h2>
              <div className="grid gap-3">
                <Input placeholder="Company name" data-testid="input-company" />
                <Input placeholder="Your email" data-testid="input-email" />
                <Input placeholder="Industry / application" data-testid="input-industry" />
                <Input placeholder="Target annual quantity" data-testid="input-annual-quantity" />
                <Textarea placeholder="Special requirements, QA documents, or notes" rows={4} />
              </div>
            </div>
          </div>
        </section>

        <section id="quote-list" className="mx-auto max-w-7xl px-5 pb-16">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Quote List</h2>
              <p className="text-sm text-slate-600">
                Add one or many parts. Sunny will review pricing, lead time, stock, datasheets, and QA documents.
              </p>
            </div>
            <Button className="gap-2">
              <Check className="h-4 w-4" />
              Create Quote Request
            </Button>
          </div>

          <div className="overflow-x-auto border border-slate-300 bg-white">
            <table className="min-w-[1120px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-300 text-xs uppercase text-slate-800">
                <tr>
                  {["#", "Family", "Customer Part Number", "Package", "Frequency", "Spec", "Qty", "Notes", "Status"].map((column) => (
                    <th key={column} className="border-r border-slate-400 px-3 py-3">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(quoteLines.length ? quoteLines : [
                  {
                    id: 1,
                    family: "Crystal Resonator",
                    partNumber: "SR12130J6-32.0000",
                    packageType: "SX-21",
                    frequency: "32.0000 MHz",
                    spec: "30/30 -40~85C/12pF",
                    quantity: "10000",
                    note: "Example line",
                  },
                ]).map((row, index) => (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="border-r border-slate-200 px-3 py-4 font-semibold">{index + 1}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.family}</td>
                    <td className="border-r border-slate-200 px-3 py-4 font-mono font-semibold text-primary">{row.partNumber}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.packageType}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.frequency}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.spec}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.quantity}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.note || "-"}</td>
                    <td className="px-3 py-4 font-semibold text-amber-700">Ready for Sunny review</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-3 border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Check stock availability next</h3>
              <p className="mt-1 text-sm text-slate-600">
                Use Sunny Stock Check to compare available inventory before final Sunny review.
              </p>
            </div>
            <Link href="/stock">
              <Button variant="outline" className="h-11 gap-2 bg-white" data-testid="button-quote-to-stock">
                <Search className="h-4 w-4" />
                Sunny Stock Check
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({
  children,
  icon,
  label,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div>
      <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-primary">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  );
}
