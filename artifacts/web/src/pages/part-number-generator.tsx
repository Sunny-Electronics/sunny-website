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
  prefix: string;
  catalogCode: string;
  label: string;
  helper: string;
};

type GeneratorState = {
  group: ProductGroup;
  type: string;
  prefix: string;
  frequency: string;
  electrical: string;
  optionClass: string;
  serial: string;
  customerPart: string;
  toleranceCode: string;
  stabilityCode: string;
  tempCode: string;
  modeCode: string;
  packing: string;
};

const typeOptions: TypeOption[] = [
  { group: "crystal", type: "SX-32", prefix: "AR", catalogCode: "P", label: "SX-32 / AR / P", helper: "Compact SMD crystal family for frequency-control applications." },
  { group: "crystal", type: "ATS-49/U", prefix: "AD", catalogCode: "D", label: "ATS-49/U / AD / D", helper: "Through-hole crystal package family." },
  { group: "crystal", type: "SX-1", prefix: "AK", catalogCode: "J", label: "SX-1 / AK / J", helper: "Crystal family for established electronic applications." },
  { group: "crystal", type: "SX-8", prefix: "AP", catalogCode: "O", label: "SX-8 / AP / O", helper: "Small crystal family with frequent 10-20 pF load options." },
  { group: "crystal", type: "SX-7", prefix: "AO", catalogCode: "M", label: "SX-7 / AO / M", helper: "Crystal package family with 8-30 pF load options." },
  { group: "crystal", type: "SX-22", prefix: "AS", catalogCode: "Q", label: "SX-22 / AS / Q", helper: "Compact crystal family for 24-32 MHz examples." },
  { group: "crystal", type: "SX-21", prefix: "AT", catalogCode: "R", label: "SX-21 / AT / R", helper: "Compact crystal family with low CL options." },
  { group: "crystal", type: "HC-49/U", prefix: "AA", catalogCode: "D", label: "HC-49/U / AA / D", helper: "Legacy through-hole crystal package family; confirm catalog code before final quote." },
  { group: "oscillator", type: "SCO-10", prefix: "BF", catalogCode: "", label: "SCO-10 / BF", helper: "Oscillator family. Final suffix should be reviewed against official Sunny code rules." },
  { group: "oscillator", type: "SCO-32", prefix: "BN", catalogCode: "", label: "SCO-32 / BN", helper: "Oscillator family with voltage/output suffix variations." },
  { group: "oscillator", type: "SCO-06", prefix: "BD", catalogCode: "", label: "SCO-06 / BD", helper: "Oscillator family with Sunny-specific suffix patterns." },
  { group: "oscillator", type: "SCO-22", prefix: "BO", catalogCode: "", label: "SCO-22 / BO", helper: "Oscillator family for compact programs." },
  { group: "oscillator", type: "SCO-53", prefix: "BM", catalogCode: "", label: "SCO-53 / BM", helper: "Oscillator family, often voltage-specific." },
  { group: "khz", type: "CS-306", prefix: "TC", catalogCode: "", label: "CS-306 / TC", helper: "32.768 kHz crystal family." },
  { group: "khz", type: "CS-405", prefix: "TF", catalogCode: "", label: "CS-405 / TF", helper: "32.768 kHz crystal family." },
  { group: "khz", type: "CS-146", prefix: "TK", catalogCode: "", label: "CS-146 / TK", helper: "32.768 kHz crystal family." },
  { group: "special", type: "SVH", prefix: "FH", catalogCode: "", label: "SVH / FH", helper: "Special oscillator or module family; requires Sunny review." },
  { group: "special", type: "SLO-10", prefix: "BL", catalogCode: "", label: "SLO-10 / BL", helper: "Special oscillator family with multiple prefix variants." },
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
  prefix: initialType.prefix,
  frequency: "25.000",
  electrical: "20",
  optionClass: "1",
  serial: "07",
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

const formatFrequencyCode = (value: string, group: ProductGroup) => {
  const parsed = Number(value.replace(/[^\d.]/g, ""));

  if (group === "khz" || (Number.isFinite(parsed) && parsed > 0 && parsed < 1)) {
    return "327";
  }

  const [whole = "", decimal = ""] = value.replace(/[^\d.]/g, "").split(".");
  const digits = `${whole}${decimal}`.replace(/[^\d]/g, "");

  if (!digits) {
    return "000";
  }

  return digits.padEnd(3, "0").slice(0, 3);
};

const normalizeElectricalCode = (value: string, group: ProductGroup) => {
  if (group === "oscillator" || group === "special") {
    return value.replace(/[^\d]/g, "").padStart(2, "0").slice(0, 2);
  }

  const numeric = value.replace(/[^\d]/g, "");
  return numeric.padStart(2, "0").slice(0, 2);
};

const buildMpn = (state: GeneratorState) => {
  const frequency = formatFrequencyCode(state.frequency, state.group);
  const electrical = normalizeElectricalCode(state.electrical, state.group);
  const optionClass = state.optionClass.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 2) || "1";
  const serial = state.serial.replace(/[^A-Z0-9]/gi, "").toUpperCase().padStart(2, "0").slice(0, 2);

  return `${state.prefix}${frequency}${optionClass}${electrical}${serial}`;
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

const examples = [
  { type: "SX-32", sunnyMpn: "AR16011208", meaning: "AR = SX-32, 160 = 16 MHz start, 12 = 12 pF, 08 = serial" },
  { type: "SX-1", sunnyMpn: "AK04911812", meaning: "SX-1, 4.9152 MHz, 18 pF, spec 20/30 -20~70/18" },
  { type: "SX-32", sunnyMpn: "AR25012007", meaning: "AR + 25.0 MHz + class 1 + 20 pF + serial 07" },
  { type: "ATS-49/U", sunnyMpn: "AD08011829", meaning: "AD + 8.0 MHz + class 1 + 18 pF + serial 29" },
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
  {
    family: "Ceramic Resonator",
    pattern: "CR3213-[Frequency]-[Cap]-[Temp]-[Accuracy]-[Shift][Packing]",
    example: "CR3213-10000-33-A-05-03TR",
  },
  {
    family: "Crystal Filter",
    pattern: "M-[PassBandwidth][Pole][Package]-[Frequency][Packing]",
    example: "M-15.0AS-21.4TR",
  },
];

export default function PartNumberGenerator() {
  const [state, setState] = useState<GeneratorState>(initialState);
  const [copied, setCopied] = useState(false);

  const activeType = useMemo(
    () => typeOptions.find((option) => option.type === state.type && option.prefix === state.prefix) ?? initialType,
    [state.prefix, state.type],
  );
  const ActiveIcon = groupIcons[state.group];
  const sunnyMpn = useMemo(() => buildMpn(state), [state]);
  const catalogPartNumber = useMemo(() => buildCatalogPartNumber(state, activeType), [activeType, state]);
  const needsReview = state.group === "oscillator" || state.group === "special";

  const updateField = <K extends keyof GeneratorState>(field: K, value: GeneratorState[K]) => {
    setState((current) => ({ ...current, [field]: value }));
    setCopied(false);
  };

  const selectType = (option: TypeOption) => {
    setState((current) => ({
      ...current,
      group: option.group,
      type: option.type,
      prefix: option.prefix,
      electrical: electricalOptions[option.group][0],
      frequency: option.group === "khz" ? "0.032768" : current.frequency,
    }));
    setCopied(false);
  };

  const copyMpn = async () => {
    await navigator.clipboard.writeText(sunnyMpn);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const addToRfq = () => {
    const params = new URLSearchParams({
      sunnyMpn,
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
              <div className="text-xs font-medium text-slate-500">SunnyKR MPN Generator</div>
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 items-center border border-slate-300 bg-slate-50">
            <Input
              className="h-12 flex-1 border-0 bg-transparent font-mono text-sm focus-visible:ring-0"
              value={sunnyMpn}
              readOnly
              aria-label="Generated Sunny MPN"
              data-testid="input-generated-sunny-mpn-header"
            />
            <button
              type="button"
              onClick={copyMpn}
              className="flex h-12 w-14 items-center justify-center bg-primary text-white"
              aria-label="Copy generated Sunny MPN"
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
          <a href="#structure" className="text-slate-600 hover:text-primary">Structure</a>
          <Link href="/request-quote" className="text-slate-600 hover:text-primary">Request Quote</Link>
        </nav>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-100">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_430px] lg:items-end">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
                <Hash className="h-4 w-4" />
                SunnyKR MPN Builder
              </p>
              <h1 className="mb-4 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                Generate Sunny MPN drafts from real SunnyKR package families.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                This tool uses Sunny package and prefix patterns to create an RFQ reference.
                Crystal-family numbers follow the published Sunny format; oscillator and
                special-module outputs require Sunny review before ordering.
              </p>
            </div>

            <div className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ActiveIcon className="h-4 w-4 text-primary" />
                Current Sunny MPN draft
              </div>
              <div className="break-all border border-slate-200 bg-slate-50 p-4 font-mono text-2xl font-bold text-primary">
                {sunnyMpn}
              </div>
              <div className="mt-3 break-all border border-slate-200 bg-white p-3 font-mono text-lg font-semibold text-slate-950">
                {catalogPartNumber}
              </div>
              <div className="mt-3 text-sm text-slate-600">
                {state.type} / {state.frequency} MHz / {state.toleranceCode}/{stabilityOptions.find((option) => option.value === state.stabilityCode)?.label.split("+/-")[1] ?? "stability"} / {tempOptions.find((option) => option.value === state.tempCode)?.label.replace(`${state.tempCode}: `, "")} / {state.electrical}pF
                {needsReview ? " / Sunny review required" : ""}
              </div>
              <div className="mt-4 flex gap-3">
                <Button className="h-10 gap-2" onClick={copyMpn}>
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
                      const selected = state.type === option.type && state.prefix === option.prefix;
                      return (
                        <button
                          key={`${option.type}-${option.prefix}`}
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
                <div className="grid gap-2">
                  <div className="break-all bg-slate-950 px-4 py-3 font-mono text-sm font-semibold text-white">
                    {sunnyMpn}
                  </div>
                  <div className="break-all bg-white px-4 py-3 font-mono text-sm font-semibold text-slate-950 ring-1 ring-slate-200">
                    {catalogPartNumber}
                  </div>
                </div>
              </div>
            </div>

            {needsReview && (
              <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-900">
                Oscillator and special-module suffixes vary by program. Use this as an RFQ draft, then confirm the final Sunny MPN internally.
              </div>
            )}

            <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Package type" icon={<Package className="h-4 w-4" />}>
                <Input value={state.type} readOnly className="bg-slate-50 font-semibold" />
              </Field>

              <Field label="Sunny prefix" icon={<Hash className="h-4 w-4" />}>
                <Input value={state.prefix} onChange={(event) => updateField("prefix", event.target.value.toUpperCase())} />
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

              <Field label="Option class" icon={<FileText className="h-4 w-4" />}>
                <Input maxLength={2} value={state.optionClass} onChange={(event) => updateField("optionClass", event.target.value.toUpperCase())} />
              </Field>

              <Field label="Serial / variant" icon={<Hash className="h-4 w-4" />}>
                <Input maxLength={2} value={state.serial} onChange={(event) => updateField("serial", event.target.value.toUpperCase())} />
              </Field>

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
                  Customer format: {catalogPartNumber} / Internal reference: {sunnyMpn}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="h-10 gap-2 bg-white" asChild>
                    <Link href={`/products?sunnyMpn=${encodeURIComponent(sunnyMpn)}`}>
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

        <section id="structure" className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[360px_1fr]">
            <div>
              <h2 className="font-display text-3xl font-bold">Observed Sunny MPN Structure</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The structure below is derived from the SunnyKR project files. It is suitable
                for RFQ drafts and internal lookup, but final part-number authority should
                remain with Sunny's official part-number guide.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-200 text-xs uppercase text-slate-700">
                  <tr>
                    <th className="border-r border-slate-300 px-4 py-3">Segment</th>
                    <th className="border-r border-slate-300 px-4 py-3">Meaning</th>
                    <th className="px-4 py-3">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Prefix", "Sunny package family code from package type", "AR = SX-32, AD = ATS-49/U"],
                    ["Frequency", "First three digits from the frequency value", "16 MHz or 16.035 MHz -> 160"],
                    ["Option class", "Observed class/series digit in many crystal MPNs", "1"],
                    ["CL / voltage", "Load capacitance for crystals or voltage code for oscillators", "20 pF -> 20"],
                    ["Serial", "Two-character variant or project suffix", "07"],
                    ["Customer order code", "S + package + CL + mode + tolerance + temp/stability + frequency", "SR12130J6-32.0000"],
                  ].map(([segment, meaning, example]) => (
                    <tr key={segment} className="border-t border-slate-200">
                      <td className="border-r border-slate-200 px-4 py-3 font-mono font-semibold">{segment}</td>
                      <td className="border-r border-slate-200 px-4 py-3 text-slate-600">{meaning}</td>
                      <td className="px-4 py-3 font-mono text-primary">{example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
            <Clipboard className="h-4 w-4" />
            Pattern Examples
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {examples.map((example) => (
              <div key={example.sunnyMpn} className="border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 text-sm font-semibold text-slate-500">{example.type}</div>
                <div className="break-all font-mono text-lg font-bold text-slate-950">{example.sunnyMpn}</div>
                <p className="mt-3 text-xs leading-5 text-slate-600">{example.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-10">
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
                <FileText className="h-4 w-4" />
                E-Catalog Formats
              </div>
              <h2 className="font-display text-3xl font-bold">Other Sunny part-number builders to add next</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                The E-CATALOG defines separate formats for tuning fork, XO, VCXO, TCXO,
                thermistor crystal, ceramic resonator, and filter families. These are
                listed here as public-safe build patterns for the next generator modes.
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
