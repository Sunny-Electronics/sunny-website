import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ChevronDown,
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
  Trash2,
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

type QuoteAttachment = {
  name: string;
  size: number;
  type: string;
  content: string;
};

const maxQuoteFiles = 3;
const maxQuoteFileSizeBytes = 2 * 1024 * 1024;
const maxQuoteTotalFileSizeBytes = 5 * 1024 * 1024;

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

const quoteProcessSteps = [
  { title: "Choose Type", detail: "Start with the part family so the right specs appear." },
  { title: "Required Specs", detail: "Enter the required package, frequency, electrical, and temperature specs." },
  { title: "RFQ Details", detail: "Add quantity, target date, customer reference, and notes. Input as much as possible so Sunny can process the request correctly." },
  { title: "Add to Quote List", detail: "Review the Sunny-Catalog P/N, then add the line to your quote list." },
  { title: "Send your Quote to Sunny", detail: "Open the pop-up, fill in your contact info, attach files if needed, and send it to Sunny." },
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

const formatQuantity = (value: string) => {
  const digits = value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${Math.ceil(bytes / 1024)} KB`;
};

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const findLabel = <T extends { code: string; label: string }>(items: T[], code: string) =>
  items.find((item) => item.code === code)?.label ?? code;

const pickerClass =
  "h-11 w-full rounded-md border border-input bg-white/80 px-3 text-sm outline-none shadow-sm transition-[border-color,box-shadow,transform,background-color] duration-150 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-white hover:shadow-[0_0_0_3px_rgba(15,92,192,0.10),0_12px_28px_rgba(15,23,42,0.08)] focus:border-primary focus:ring-2 focus:ring-primary/20";

const inputGlowClass =
  "h-11 bg-white/80 transition-[border-color,box-shadow,transform,background-color] duration-150 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-white hover:shadow-[0_0_0_3px_rgba(15,92,192,0.10),0_12px_28px_rgba(15,23,42,0.08)] focus-visible:ring-primary/20";

const textareaGlowClass =
  "bg-white/80 transition-[border-color,box-shadow,background-color] duration-150 hover:border-primary/60 hover:bg-white hover:shadow-[0_0_0_3px_rgba(15,92,192,0.10),0_12px_28px_rgba(15,23,42,0.08)] focus-visible:ring-primary/20";

export default function RequestQuote() {
  const [searchQuery, setSearchQuery] = useState("");
  const [family, setFamily] = useState<QuoteFamily>("crystal");
  const [familyMenuOpen, setFamilyMenuOpen] = useState(false);
  const [crystalPackage, setCrystalPackage] = useState("R");
  const [frequency, setFrequency] = useState("32");
  const [capacitance, setCapacitance] = useState("12");
  const [tolerance, setTolerance] = useState("30");
  const [temperature, setTemperature] = useState("J");
  const [stability, setStability] = useState("6");
  const [mode, setMode] = useState("1");
  const [quantity, setQuantity] = useState("10,000");
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
  const [quoteLines, setQuoteLines] = useState<QuoteLine[]>([]);
  const [contactCompany, setContactCompany] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactIndustry, setContactIndustry] = useState("");
  const [contactAnnualQuantity, setContactAnnualQuantity] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [quoteSubmitMessage, setQuoteSubmitMessage] = useState("");
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteAttachments, setQuoteAttachments] = useState<QuoteAttachment[]>([]);
  const [quoteFileMessage, setQuoteFileMessage] = useState("");

  const selectedFamilyCard = familyCards.find((card) => card.id === family) ?? familyCards[0];
  const SelectedFamilyIcon = selectedFamilyCard.icon;
  const selectedCrystalPackage = crystalPackages.find((item) => item.code === crystalPackage) ?? crystalPackages[0];
  const selectedStability = stabilityOptions.find((item) => item.code === stability) ?? stabilityOptions[0];
  const isSmallOrderMultiple =
    (family === "crystal" && ["J", "K"].includes(crystalPackage)) ||
    (family === "xo" && ["SCO-10", "SCO-53"].includes(xoProduct));
  const orderMultiple = isSmallOrderMultiple ? "1,000 pcs" : "3,000 pcs";

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
    setQuoteSubmitMessage("");
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

  const deleteQuoteLine = (id: number) => {
    setQuoteSubmitMessage("");
    setQuoteLines((current) => current.filter((line) => line.id !== id));
  };

  const applyPreset = (preset: (typeof quickPresets)[number]) => {
    setFamily("crystal");
    setFamilyMenuOpen(false);
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

  const openQuoteRequestModal = () => {
    if (!quoteLines.length) {
      setQuoteSubmitMessage("Please add at least one quote line before creating the request.");
      return;
    }

    setQuoteSubmitMessage("");
    setQuoteModalOpen(true);
  };

  const handleQuoteAttachmentChange = async (files: FileList | null) => {
    setQuoteFileMessage("");
    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length > maxQuoteFiles) {
      setQuoteFileMessage(`Please attach up to ${maxQuoteFiles} files.`);
      setQuoteAttachments([]);
      return;
    }

    const oversizedFile = selectedFiles.find((file) => file.size > maxQuoteFileSizeBytes);
    if (oversizedFile) {
      setQuoteFileMessage(`${oversizedFile.name} is too large. Limit is ${formatFileSize(maxQuoteFileSizeBytes)} per file.`);
      setQuoteAttachments([]);
      return;
    }

    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxQuoteTotalFileSizeBytes) {
      setQuoteFileMessage(`Total upload limit is ${formatFileSize(maxQuoteTotalFileSizeBytes)}.`);
      setQuoteAttachments([]);
      return;
    }

    try {
      const attachments = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          content: await readFileAsBase64(file),
        })),
      );
      setQuoteAttachments(attachments);
      setQuoteFileMessage(attachments.length ? `${attachments.length} file(s) attached.` : "");
    } catch {
      setQuoteFileMessage("Could not read the selected file. Please try another file.");
      setQuoteAttachments([]);
    }
  };

  const submitQuoteRequest = async () => {
    if (!contactEmail.trim()) {
      setQuoteSubmitMessage("Please add your email before sending the quote list.");
      return;
    }

    setQuoteSubmitting(true);
    setQuoteSubmitMessage("");

    try {
      const response = await fetch("/api/rfq/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: {
            company: contactCompany,
            email: contactEmail,
            industry: contactIndustry,
            annualQuantity: contactAnnualQuantity,
            notes: contactNotes,
          },
          quoteLines,
          attachments: quoteAttachments,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Quote request could not be sent yet.");
      }

      setQuoteModalOpen(false);
      setQuoteSubmitMessage("Quote list sent to Sunny for review. Sunny will get back to you ASAP.");
    } catch (error) {
      setQuoteSubmitMessage(error instanceof Error ? error.message : "Quote request could not be sent yet.");
    } finally {
      setQuoteSubmitting(false);
    }
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

          <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
            <div className="rounded-xl border border-white/70 bg-white/65 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              <div className="step-callout mb-3 px-3 py-2 text-xs font-bold uppercase tracking-wide">1. Choose type</div>
              <button
                type="button"
                onClick={() => setFamilyMenuOpen((open) => !open)}
                className="group flex w-full items-center justify-between rounded-lg border border-primary/20 bg-white/80 p-4 text-left shadow-sm transition-[border-color,box-shadow,transform,background-color] duration-150 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-white hover:shadow-[0_0_0_3px_rgba(15,92,192,0.10),0_18px_36px_rgba(15,23,42,0.10)]"
                aria-expanded={familyMenuOpen}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <SelectedFamilyIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-bold text-slate-950">{selectedFamilyCard.name}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">{selectedFamilyCard.summary}</span>
                  </span>
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform ${familyMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {familyMenuOpen && (
                <div className="mt-3 grid gap-2">
                  {familyCards.map((card) => {
                    const Icon = card.icon;
                    const selected = family === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => {
                          setFamily(card.id);
                          setFamilyMenuOpen(false);
                        }}
                        className={`group rounded-lg border p-3 text-left transition-[border-color,box-shadow,transform,background-color] duration-150 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-white hover:shadow-[0_0_0_3px_rgba(15,92,192,0.10),0_14px_28px_rgba(15,23,42,0.08)] ${
                          selected
                            ? "border-primary/60 bg-primary/10"
                            : "border-white/70 bg-white/60"
                        }`}
                        data-testid={`button-family-${card.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={selected ? "text-primary" : "text-slate-500 group-hover:text-primary"}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-display text-sm font-bold text-slate-950">{card.name}</div>
                            <div className="mt-1 text-xs leading-5 text-slate-600">{card.summary}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 rounded-lg border border-primary/15 bg-white/70 p-4 shadow-inner">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">Sunny-Catalog P/N</div>
                <div className="break-all font-mono text-xl font-bold leading-tight text-slate-950">{generatedPart}</div>
                <div className="mt-2 text-xs leading-5 text-slate-600">{specSummary}</div>
                <Button className="step-callout mt-4 h-11 w-full gap-2 font-bold" onClick={addGeneratedPart} data-testid="button-add-generated-part">
                  <Plus className="h-4 w-4" />
                  4. Add to Quote List
                </Button>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                  <div className="rounded-md border border-primary/10 bg-white/70 px-3 py-2">
                    SPQ: {orderMultiple}
                  </div>
                  <div className="rounded-md border border-primary/10 bg-white/70 px-3 py-2">
                    MOQ: {orderMultiple}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-primary/15 bg-white/75 p-4 shadow-inner">
                <div className="step-callout mb-3 flex items-center gap-2 px-3 py-2 text-base font-bold">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Quote process help
                </div>
                <ol className="space-y-3">
                  {quoteProcessSteps.map((step, index) => (
                    <li key={step.title} className="flex gap-3 text-xs leading-5 text-slate-600">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900">{step.title}</div>
                        <p className="mt-0.5">{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/70 bg-white/65 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                <StepHeader title="2. Required Specs" />
                {family === "crystal" && (
                  <>
                    <Field label="Package" icon={<Package className="h-4 w-4" />}>
                      <select
                        value={crystalPackage}
                        onChange={(event) => setCrystalPackage(event.target.value)}
                        className={pickerClass}
                      >
                        {crystalPackages.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.type} ({option.code})
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Frequency (MHz)" icon={<Gauge className="h-4 w-4" />}>
                      <Input className={inputGlowClass} value={frequency} onChange={(event) => setFrequency(event.target.value)} inputMode="decimal" />
                    </Field>
                    <Field label="Load capacitance" icon={<Cpu className="h-4 w-4" />}>
                      <select
                        value={capacitance}
                        onChange={(event) => setCapacitance(event.target.value)}
                        className={pickerClass}
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
                        className={pickerClass}
                      >
                        {["10", "15", "20", "30", "50"].map((option) => (
                          <option key={option} value={option}>+/-{option}ppm</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Operating Temp Range" icon={<Timer className="h-4 w-4" />}>
                      <select
                        value={temperature}
                        onChange={(event) => setTemperature(event.target.value)}
                        className={pickerClass}
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
                        className={pickerClass}
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
                        className={pickerClass}
                      >
                        <option value="1">1: Fundamental</option>
                        <option value="3">3: 3rd overtone</option>
                        <option value="5">5: 5th overtone</option>
                      </select>
                    </Field>
                    <div className="md:col-span-2 xl:col-span-3 rounded-lg border border-white/70 bg-white/55 p-4 text-sm text-slate-600 shadow-inner">
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
                        className={pickerClass}
                      >
                        {tuningForkPackages.map((option) => (
                          <option key={option.code} value={option.code}>{option.type} ({option.code})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Frequency (kHz)" icon={<Gauge className="h-4 w-4" />}>
                      <Input className={inputGlowClass} value={tuningForkFrequency} onChange={(event) => setTuningForkFrequency(event.target.value)} />
                    </Field>
                    <Field label="Load capacitance" icon={<Cpu className="h-4 w-4" />}>
                      <select
                        value={tuningForkCl}
                        onChange={(event) => setTuningForkCl(event.target.value)}
                        className={pickerClass}
                      >
                        <option value="125">12.5 pF</option>
                        <option value="90">9.0 pF</option>
                        <option value="70">7.0 pF</option>
                      </select>
                    </Field>
                    <Field label="Operating Temp Range" icon={<Timer className="h-4 w-4" />}>
                      <select
                        value={tuningForkTemp}
                        onChange={(event) => setTuningForkTemp(event.target.value)}
                        className={pickerClass}
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
                          className={pickerClass}
                        >
                          {["SCO-10", "SCO-32", "SCO-53", "SCO-22", "SCO-06"].map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </Field>
                    )}
                    <Field label="Frequency (MHz)" icon={<Gauge className="h-4 w-4" />}>
                      <Input className={inputGlowClass} value={frequency} onChange={(event) => setFrequency(event.target.value)} />
                    </Field>
                    <Field label="Supply voltage" icon={<Cpu className="h-4 w-4" />}>
                      <select
                        value={voltage}
                        onChange={(event) => setVoltage(event.target.value)}
                        className={pickerClass}
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
                            className={pickerClass}
                          >
                            <option value="25">+/-25ppm</option>
                            <option value="50">+/-50ppm</option>
                            <option value="100">+/-100ppm</option>
                          </select>
                        </Field>
                        <Field label="Operating Temp Range" icon={<Timer className="h-4 w-4" />}>
                          <select
                            value={oscTemp}
                            onChange={(event) => setOscTemp(event.target.value)}
                            className={pickerClass}
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
                            className={pickerClass}
                          >
                            <option value="D">45/55</option>
                            <option value="E">40/60</option>
                          </select>
                        </Field>
                        <Field label="OE connection" icon={<ShieldCheck className="h-4 w-4" />}>
                          <select
                            value={oe}
                            onChange={(event) => setOe(event.target.value)}
                            className={pickerClass}
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
                            className={pickerClass}
                          >
                            <option value="M">HCMOS</option>
                            <option value="S">Clipped sinewave</option>
                          </select>
                        </Field>
                        <Field label="Pulling / deviation" icon={<Gauge className="h-4 w-4" />}>
                          <select
                            value={pulling}
                            onChange={(event) => setPulling(event.target.value)}
                            className={pickerClass}
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
                        className={textareaGlowClass}
                        rows={5}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Example: Need 32MHz small crystal for industrial temperature, not sure package."
                      />
                    </Field>
                  </div>
                )}

                <StepHeader title="3. RFQ details" />
                <Field label="Quantity" icon={<ClipboardList className="h-4 w-4" />}>
                  <Input
                    className={inputGlowClass}
                    value={quantity}
                    onChange={(event) => setQuantity(formatQuantity(event.target.value))}
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Target date" icon={<Clock className="h-4 w-4" />}>
                  <Input className={inputGlowClass} type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
                </Field>
                <Field label="Customer reference" icon={<FileText className="h-4 w-4" />}>
                  <Input className={inputGlowClass} value={customerReference} onChange={(event) => setCustomerReference(event.target.value)} placeholder="Your part # or project" />
                </Field>
                {family !== "other" && (
                  <div className="md:col-span-2 xl:col-span-3">
                    <Field
                      label="Notes (Brief description of your requirements and demands. This helps Sunny process the correct requirements.)"
                      icon={<FileText className="h-4 w-4" />}
                      labelClassName="step-callout px-3 py-2"
                    >
                      <Textarea
                        className={textareaGlowClass}
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

        <section id="quote-list" className="mx-auto max-w-7xl px-5 pb-16">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Quote List</h2>
              <p className="text-sm text-slate-600">
                Add one or many parts. Sunny will review pricing, lead time, stock, datasheets, and QA documents.
              </p>
            </div>
            <div className="flex flex-col gap-1 md:items-end">
              <Button className="step-callout h-11 gap-2 px-4 font-bold" onClick={openQuoteRequestModal} data-testid="button-create-quote-request">
                <Check className="h-4 w-4" />
                5. Send your quote list to Sunny for review
              </Button>
              <p className="text-xs font-medium text-slate-500">Sunny will get back to you ASAP.</p>
            </div>
          </div>
          {quoteSubmitMessage && (
            <div className="mb-4 border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
              {quoteSubmitMessage}
            </div>
          )}

          <div className="overflow-x-auto border border-slate-300 bg-white">
            <table className="min-w-[1120px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-300 text-xs uppercase text-slate-800">
                <tr>
                  {["#", "Family", "Customer Part Number", "Package", "Frequency", "Spec", "Qty", "Notes", "Status", "Action"].map((column) => (
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
                    quantity: "10,000",
                    note: "Example line",
                  },
                ]).map((row, index) => {
                  const isExampleLine = quoteLines.length === 0;
                  return (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="border-r border-slate-200 px-3 py-4 font-semibold">{index + 1}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.family}</td>
                    <td className="border-r border-slate-200 px-3 py-4 font-mono font-semibold text-primary">{row.partNumber}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.packageType}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.frequency}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.spec}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.quantity}</td>
                    <td className="border-r border-slate-200 px-3 py-4">{row.note || "-"}</td>
                    <td className="border-r border-slate-200 px-3 py-4 font-semibold text-amber-700">
                      {isExampleLine ? "Example only" : "Ready for Sunny review"}
                    </td>
                    <td className="px-3 py-4">
                      {isExampleLine ? (
                        <span className="text-xs font-semibold text-slate-400">Add a real line</span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 gap-2 border-red-200 bg-white text-red-700 hover:bg-red-50"
                          onClick={() => deleteQuoteLine(row.id)}
                          data-testid={`button-delete-quote-line-${row.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete line
                        </Button>
                      )}
                    </td>
                  </tr>
                  );
                })}
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
                <Input
                  value={contactCompany}
                  onChange={(event) => setContactCompany(event.target.value)}
                  placeholder="Company name"
                  data-testid="input-company"
                />
                <Input
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="Your email"
                  data-testid="input-email"
                />
                <Input
                  value={contactIndustry}
                  onChange={(event) => setContactIndustry(event.target.value)}
                  placeholder="Industry / application"
                  data-testid="input-industry"
                />
                <Input
                  value={contactAnnualQuantity}
                  onChange={(event) => setContactAnnualQuantity(event.target.value)}
                  placeholder="Target annual quantity"
                  data-testid="input-annual-quantity"
                />
                <Textarea
                  value={contactNotes}
                  onChange={(event) => setContactNotes(event.target.value)}
                  placeholder="Special requirements, QA documents, or notes"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {quoteModalOpen && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-[100] flex items-center justify-center bg-slate-950/50 px-5 py-5">
          <div className="max-h-screen w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Send quote list to Sunny</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Review your RFQ, add your email, and attach optional files. Sunny will get back to you ASAP.
                </p>
              </div>
              <Button type="button" variant="outline" className="bg-white" onClick={() => setQuoteModalOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-2">
              <Input value={contactCompany} onChange={(event) => setContactCompany(event.target.value)} placeholder="Company name" />
              <Input value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="Your email" type="email" />
              <Input value={contactIndustry} onChange={(event) => setContactIndustry(event.target.value)} placeholder="Industry / application" />
              <Input value={contactAnnualQuantity} onChange={(event) => setContactAnnualQuantity(event.target.value)} placeholder="Target annual quantity" />
              <Textarea
                className="md:col-span-2"
                value={contactNotes}
                onChange={(event) => setContactNotes(event.target.value)}
                placeholder="Extra message for Sunny"
                rows={3}
              />
            </div>

            <div className="mb-5 overflow-x-auto border border-slate-200">
              <table className="min-w-[720px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    {["#", "Sunny-Catalog P/N", "Package", "Frequency", "Qty", "Notes"].map((column) => (
                      <th key={column} className="border-r border-slate-200 px-3 py-3">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quoteLines.map((line, index) => (
                    <tr key={line.id} className="border-t border-slate-200">
                      <td className="border-r border-slate-200 px-3 py-3">{index + 1}</td>
                      <td className="border-r border-slate-200 px-3 py-3 font-mono font-semibold text-primary">{line.partNumber}</td>
                      <td className="border-r border-slate-200 px-3 py-3">{line.packageType}</td>
                      <td className="border-r border-slate-200 px-3 py-3">{line.frequency}</td>
                      <td className="border-r border-slate-200 px-3 py-3">{line.quantity}</td>
                      <td className="px-3 py-3">{line.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mb-5 border border-slate-200 bg-slate-50 p-4">
              <Label className="mb-2 block text-sm font-semibold text-slate-700">Optional PDF or file attachment</Label>
              <Input
                type="file"
                multiple
                accept=".pdf,.csv,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                onChange={(event) => handleQuoteAttachmentChange(event.target.files)}
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Limit: {maxQuoteFiles} files, {formatFileSize(maxQuoteFileSizeBytes)} each, {formatFileSize(maxQuoteTotalFileSizeBytes)} total.
              </p>
              {quoteFileMessage && <p className="mt-2 text-sm font-semibold text-primary">{quoteFileMessage}</p>}
            </div>

            {quoteSubmitMessage && (
              <div className="mb-4 border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
                {quoteSubmitMessage}
              </div>
            )}

            <div className="flex flex-col gap-2 md:flex-row md:justify-end">
              <Button type="button" variant="outline" className="bg-white" onClick={() => setQuoteModalOpen(false)}>
                Keep editing
              </Button>
              <Button type="button" className="gap-2" onClick={submitQuoteRequest} disabled={quoteSubmitting}>
                <Check className="h-4 w-4" />
                {quoteSubmitting ? "Sending..." : "Send RFQ to Sunny"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  children,
  icon,
  label,
  labelClassName = "",
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
  labelClassName?: string;
}) {
  return (
    <div>
      <Label className={`mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 ${labelClassName}`}>
        <span className="text-primary">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  );
}

function StepHeader({ title }: { title: string }) {
  const featured = title === "2. Required Specs" || title === "3. RFQ details";

  return (
    <div className="md:col-span-2 xl:col-span-3">
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${featured ? "step-callout px-3 py-2" : "text-primary"}`}>
        <span className="shrink-0">{title}</span>
        <span className="h-px flex-1 bg-primary/20" />
      </div>
    </div>
  );
}
