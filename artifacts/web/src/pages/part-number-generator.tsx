import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Check,
  Clipboard,
  Copy,
  Cpu,
  FileText,
  Gauge,
  Hash,
  Package,
  Plus,
  RadioReceiver,
  RotateCcw,
  Search,
  ShieldCheck,
  Timer,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import sunnyLogo from "@assets/image_1775118121182.png";

type ProductGroup = "crystal" | "oscillator" | "khz" | "special";

type TypeOption = {
  group: ProductGroup;
  type: string;
  catalogCode: string;
  label: string;
  helper: string;
};

type GeneratorState = {
  group: ProductGroup;
  type: string;
  frequency: string;
  electrical: string;
  customerPart: string;
  toleranceCode: string;
  stabilityCode: string;
  tempCode: string;
  modeCode: string;
  packing: string;
};

const typeOptions: TypeOption[] = [
  { group: "crystal", type: "SX-32", catalogCode: "P", label: "SX-32 / P", helper: "Compact SMD crystal family for frequency-control applications." },
  { group: "crystal", type: "ATS-49/U", catalogCode: "D", label: "ATS-49/U / D", helper: "Through-hole crystal package family." },
  { group: "crystal", type: "SX-1", catalogCode: "J", label: "SX-1 / J", helper: "Crystal family for established electronic applications." },
  { group: "crystal", type: "SX-8", catalogCode: "O", label: "SX-8 / O", helper: "Small crystal family with frequent 10-20 pF load options." },
  { group: "crystal", type: "SX-7", catalogCode: "M", label: "SX-7 / M", helper: "Crystal package family with 8-30 pF load options." },
  { group: "crystal", type: "SX-22", catalogCode: "Q", label: "SX-22 / Q", helper: "Compact crystal family for 24-32 MHz examples." },
  { group: "crystal", type: "SX-21", catalogCode: "R", label: "SX-21 / R", helper: "Compact crystal family with low CL options." },
  { group: "crystal", type: "HC-49/U", catalogCode: "D", label: "HC-49/U / D", helper: "Legacy through-hole crystal package family; confirm catalog code before final quote." },
  { group: "oscillator", type: "SCO-10", catalogCode: "", label: "SCO-10", helper: "Oscillator family. Final suffix should be reviewed against official Sunny code rules." },
  { group: "oscillator", type: "SCO-32", catalogCode: "", label: "SCO-32", helper: "Oscillator family with voltage/output suffix variations." },
  { group: "oscillator", type: "SCO-06", catalogCode: "", label: "SCO-06", helper: "Oscillator family with Sunny-specific suffix patterns." },
  { group: "oscillator", type: "SCO-22", catalogCode: "", label: "SCO-22", helper: "Oscillator family for compact programs." },
  { group: "oscillator", type: "SCO-53", catalogCode: "", label: "SCO-53", helper: "Oscillator family, often voltage-specific." },
  { group: "khz", type: "CS-306", catalogCode: "", label: "CS-306", helper: "32.768 kHz crystal family." },
  { group: "khz", type: "CS-405", catalogCode: "", label: "CS-405", helper: "32.768 kHz crystal family." },
  { group: "khz", type: "CS-146", catalogCode: "", label: "CS-146", helper: "32.768 kHz crystal family." },
  { group: "special", type: "SVH", catalogCode: "", label: "SVH", helper: "Special oscillator or module family; requires Sunny review." },
  { group: "special", type: "SLO-10", catalogCode: "", label: "SLO-10", helper: "Special oscillator family with multiple variants." },
];

const groupLabels = {
  crystal: "Crystal Units",
  oscillator: "Oscillators",
  khz: "32.768 kHz",
  special: "Special / Modules",
};

const groupIcons = {
  crystal: Cpu,
  oscillator: Timer,
  khz: RadioReceiver,
  special: Waves,
};

const initialType = typeOptions[0];

const initialState: GeneratorState = {
  group: initialType.group,
  type: initialType.type,
  frequency: "25.000",
  electrical: "20",
  customerPart: "",
  toleranceCode: "20",
  stabilityCode: "6",
  tempCode: "E",
  modeCode: "1",
  packing: "TR",
};

const electricalOptions = {
  crystal: ["06", "07", "08", "09", "10", "12", "16", "18", "20", "30", "32", "33"],
  oscillator: ["18V", "25V", "33V", "50V"],
  khz: ["09", "12", "125"],
  special: ["25V", "33V", "50V"],
};

const normalizeElectricalCode = (value: string, group: ProductGroup) => {
  if (group === "oscillator" || group === "special") {
    return value.replace(/[^\d]/g, "").padStart(2, "0").slice(0, 2);
  }

  const numeric = value.replace(/[^\d]/g, "");
  return numeric.padStart(2, "0").slice(0, 2);
};

const formatFrequencyForOrder = (value: string) => {
  const parsed = Number(value.replace(/[^\d.]/g, ""));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "0.0000";
  }

  return parsed.toFixed(4);
};

const buildCatalogPartNumber = (state: GeneratorState, option: TypeOption) => {
  if (!option.catalogCode || state.group !== "crystal") {
    return "Sunny review required";
  }

  const cl = normalizeElectricalCode(state.electrical, state.group);
  const tolerance = state.toleranceCode.replace(/[^\d]/g, "").padStart(2, "0").slice(0, 2);
  const tempStability = `${state.tempCode}${state.stabilityCode}`;
  const frequency = formatFrequencyForOrder(state.frequency);

  return `S${option.catalogCode}${cl}${state.modeCode}${tolerance}${tempStability}-${frequency}`;
};

const tempOptions = [
  { value: "D", label: "D: -10~70C" },
  { value: "E", label: "E: -20~70C" },
  { value: "F", label: "F: -30~60C" },
  { value: "G", label: "G: -20~85C" },
  { value: "H", label: "H: -30~70C" },
  { value: "I", label: "I: -30~85C" },
  { value: "J", label: "J: -40~85C" },
  { value: "K", label: "K: -40~90C" },
  { value: "L", label: "L: -40~105C" },
  { value: "M", label: "M: -40~125C" },
  { value: "N", label: "N: -40~150C" },
];

const stabilityOptions = [
  { value: "3", label: "3: +/-10ppm" },
  { value: "4", label: "4: +/-15ppm" },
  { value: "5", label: "5: +/-20ppm" },
  { value: "6", label: "6: +/-30ppm" },
  { value: "7", label: "7: +/-50ppm" },
  { value: "8", label: "8: +/-100ppm" },
  { value: "9", label: "9: +/-150ppm" },
  { value: "10", label: "10: +/-200ppm" },
];

const catalogFormatReferences = [
  {
    family: "Tuning Fork",
    pattern: "S[Package][CL][Tolerance][Temp]-[Frequency]-[Packing]",
    example: "STM12520B-32.768-TR",
  },
  {
    family: "Crystal Oscillator (XO)",
    pattern: "[Product]-[Voltage][Stability][Temp][Duty][OE][Packing]-[Frequency]",
    example: "SCO-103350BDSR-27.000M",
  },
  {
    family: "VCXO",
    pattern: "[Product][Voltage][Stability][Temp][Duty][Deviation][OE][Packing]-[Frequency]",
    example: "SVH3330GDDER-27.000M",
  },
  {
    family: "TCXO / VCTCXO",
    pattern: "[Product][Voltage][Stability][Temp][Output][Deviation][Packing]-[Frequency]",
    example: "STA3320JS5R-25.000M",
  },
  {
    family: "Thermistor Crystal",
    pattern: "[Package][Frequency]-[CL]-[Temp]-[Tolerance]-[Stability][Packing]",
    example: "SX-T2126000-07-B-10-12TR",
  },
];

export default function PartNumberGenerator() {
  const [state, setState] = useState<GeneratorState>(initialState);
  const [copied, setCopied] = useState(false);

  const activeType = useMemo(
    () => typeOptions.find((option) => option.type === state.type) ?? initialType,
    [state.type],
  );
  const ActiveIcon = groupIcons[state.group];
  const catalogPartNumber = useMemo(() => buildCatalogPartNumber(state, activeType), [activeType, state]);
  const needsReview = state.group === "oscillator" || state.group === "special";
  const showsTolerance = state.group === "crystal" || state.group === "khz";
  const stabilityLabel =
    stabilityOptions.find((option) => option.value === state.stabilityCode)?.label.split("+/-")[1] ??
    "stability";
  const electricalLabel =
    state.group === "oscillator" || state.group === "special"
      ? state.electrical.replace(/^(\d)(\d)V$/, "$1.$2 V")
      : `${state.electrical} pF`;

  const updateField = <K extends keyof GeneratorState>(field: K, value: GeneratorState[K]) => {
    setState((current) => ({ ...current, [field]: value }));
    setCopied(false);
  };

  const selectType = (option: TypeOption) => {
    setState((current) => ({
      ...current,
      group: option.group,
      type: option.type,
      electrical: electricalOptions[option.group][0],
      frequency: option.group === "khz" ? "0.032768" : current.frequency,
    }));
    setCopied(false);
  };

  const copyPartNumber = async () => {
    await navigator.clipboard.writeText(catalogPartNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const addToRfq = () => {
    const params = new URLSearchParams({
      partNumber: catalogPartNumber,
      type: state.type,
      frequency: state.frequency,
      clv: state.electrical,
    });
    window.location.href = `/request-quote?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">SunnyKR Part Number Builder</div>
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50">
            <Input
              className="h-12 flex-1 border-0 bg-transparent font-mono text-sm focus-visible:ring-0"
              value={catalogPartNumber}
              readOnly
              aria-label="Generated Sunny part number"
              data-testid="input-generated-part-number-header"
            />
            <button
              type="button"
              onClick={copyPartNumber}
              className="flex h-12 w-14 items-center justify-center bg-primary text-white"
              aria-label="Copy generated Sunny part number"
              data-testid="button-copy-header"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>

          <Button className="h-12 gap-2" onClick={addToRfq} data-testid="button-add-rfq-header">
            <Plus className="h-4 w-4" />
            Add to RFQ
          </Button>
        </div>

        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-5 pb-4 text-sm font-semibold">
          <Link href="/" className="text-slate-600 hover:text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Home
          </Link>
          <Link href="/products" className="text-slate-600 hover:text-primary">Products</Link>
          <a href="#generator" className="text-slate-600 hover:text-primary">Generator</a>
          <a href="#catalog-formats" className="text-slate-600 hover:text-primary">Formats</a>
          <Link href="/request-quote" className="text-slate-600 hover:text-primary">Request Quote</Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_430px] lg:items-end">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
                <Hash className="h-4 w-4" />
                SunnyKR Part Number Builder
              </p>
              <h1 className="mb-4 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                Build Sunny part-number drafts from verified SunnyKR package families.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                Crystal-family numbers follow the published Sunny format. Oscillator and
                special-module configurations require Sunny review before ordering.
              </p>
            </div>

            <div className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ActiveIcon className="h-4 w-4 text-primary" />
                Current part-number draft
              </div>
              <div className="break-all border border-slate-200 bg-white p-4 font-mono text-2xl font-bold text-primary">
                {catalogPartNumber}
              </div>
              <div className="mt-3 text-sm text-slate-600">
                {state.type} / {state.frequency} MHz / {showsTolerance ? `${state.toleranceCode}/` : ""}{stabilityLabel} / {tempOptions.find((option) => option.value === state.tempCode)?.label.replace(`${state.tempCode}: `, "")} / {electricalLabel}
                {needsReview ? " / Sunny review required" : ""}
              </div>
              <div className="mt-4 flex gap-3">
                <Button className="h-10 gap-2" onClick={copyPartNumber}>
                  {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" className="h-10 gap-2 bg-white" onClick={() => setState(initialState)}>
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="generator" className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-5">
            {(["crystal", "oscillator", "khz", "special"] as ProductGroup[]).map((group) => {
              const GroupIcon = groupIcons[group];
              return (
                <div key={group}>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                    <GroupIcon className="h-4 w-4" />
                    {groupLabels[group]}
                  </div>
                  <div className="space-y-2">
                    {typeOptions.filter((option) => option.group === group).map((option) => {
                      const selected = state.type === option.type;
                      return (
                        <button
                          key={option.type}
                          type="button"
                          onClick={() => selectType(option)}
                          className={`w-full border p-4 text-left transition-colors ${
                            selected
                              ? "border-primary bg-primary text-white"
                              : "border-slate-200 bg-white text-slate-800 hover:border-primary/40"
                          }`}
                          data-testid={`button-type-${option.type.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                        >
                          <div className="mb-1 font-display text-lg font-bold">{option.label}</div>
                          <p className={selected ? "text-sm leading-5 text-white/80" : "text-sm leading-5 text-slate-600"}>
                            {option.helper}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </aside>

          <div className="border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
                    <ActiveIcon className="h-4 w-4" />
                    {activeType.label}
                  </div>
                  <h2 className="font-display text-2xl font-bold">Configuration</h2>
                </div>
                <div>
                  <div className="break-all bg-white px-4 py-3 font-mono text-sm font-semibold text-slate-950 ring-1 ring-slate-200">
                    {catalogPartNumber}
                  </div>
                </div>
              </div>
            </div>

            {needsReview && (
              <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-900">
                Oscillator and special-module configurations vary by program and require Sunny review before ordering.
              </div>
            )}

            <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Package type" icon={<Package className="h-4 w-4" />}>
                <Input value={state.type} readOnly className="bg-slate-50 font-semibold" />
              </Field>

              <Field label={state.group === "khz" ? "Frequency (MHz)" : "Frequency (MHz)"} icon={<Gauge className="h-4 w-4" />}>
                <Input
                  value={state.frequency}
                  onChange={(event) => updateField("frequency", event.target.value)}
                  inputMode="decimal"
                  placeholder="25.000"
                />
              </Field>

              <Field label={state.group === "crystal" || state.group === "khz" ? "CL code (pF)" : "Voltage code"} icon={<Cpu className="h-4 w-4" />}>
                <select
                  value={state.electrical}
                  onChange={(event) => updateField("electrical", event.target.value)}
                  className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {electricalOptions[state.group].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </Field>

              {showsTolerance && (
                <Field label="Tolerance at 25C" icon={<ShieldCheck className="h-4 w-4" />}>
                  <select
                    value={state.toleranceCode}
                    onChange={(event) => updateField("toleranceCode", event.target.value)}
                    className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    {["10", "15", "20", "30", "50"].map((option) => (
                      <option key={option} value={option}>+/-{option}ppm</option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="Stability over temp" icon={<Gauge className="h-4 w-4" />}>
                <select
                  value={state.stabilityCode}
                  onChange={(event) => updateField("stabilityCode", event.target.value)}
                  className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {stabilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Temperature range" icon={<Timer className="h-4 w-4" />}>
                <select
                  value={state.tempCode}
                  onChange={(event) => updateField("tempCode", event.target.value)}
                  className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {tempOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Mode of resonance" icon={<Waves className="h-4 w-4" />}>
                <select
                  value={state.modeCode}
                  onChange={(event) => updateField("modeCode", event.target.value)}
                  className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="1">1: Fundamental</option>
                  <option value="3">3: 3rd overtone</option>
                  <option value="5">5: 5th overtone</option>
                </select>
              </Field>

              <Field label="Packing" icon={<Package className="h-4 w-4" />}>
                <select
                  value={state.packing}
                  onChange={(event) => updateField("packing", event.target.value)}
                  className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="TR">Tape and reel</option>
                  <option value="Bulk">Bulk</option>
                  <option value="Sample">Sample</option>
                  <option value="CatalogPN">Sunny catalog P/N</option>
                </select>
              </Field>

              <div className="md:col-span-2 xl:col-span-3">
                <Field label="Your part number / RFQ reference" icon={<Search className="h-4 w-4" />}>
                  <Input
                    value={state.customerPart}
                    onChange={(event) => updateField("customerPart", event.target.value)}
                    placeholder="Optional reference number"
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                  Part number: {catalogPartNumber}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="h-10 gap-2 bg-white" asChild>
                    <Link href="/products">
                      <Search className="h-4 w-4" />
                      Search Products
                    </Link>
                  </Button>
                  <Button className="h-10 gap-2" onClick={addToRfq}>
                    <Plus className="h-4 w-4" />
                    Add to RFQ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="catalog-formats" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-10">
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
                <FileText className="h-4 w-4" />
                E-Catalog Formats
              </div>
              <h2 className="font-display text-3xl font-bold">Other Sunny part-number builders to add next</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                The E-CATALOG defines separate formats for tuning fork, XO, VCXO, TCXO,
                and thermistor-crystal families. These are listed here as public-safe
                build patterns for the next generator modes.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {catalogFormatReferences.map((format) => (
                <div key={format.family} className="border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-2 font-display text-xl font-bold">{format.family}</div>
                  <div className="mb-3 break-all font-mono text-sm text-slate-600">{format.pattern}</div>
                  <div className="break-all border border-slate-200 bg-white p-3 font-mono text-base font-semibold text-primary">
                    {format.example}
                  </div>
                </div>
              ))}
            </div>
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
