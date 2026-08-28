import publicPriceTable from "@/data/sunny-public-prices.json";

export type PublicQuotePrice = {
  model: string;
  variant?: string;
  unitPriceUsd: number;
  spq: number;
  moq: number;
};

type PriceEntry = PublicQuotePrice & {
  id: string;
  quoteType: string;
  selection?: string;
  frequencyMaxMHz?: number;
  frequencyMinInclusiveMHz?: number;
  frequencyMinExclusiveMHz?: number;
  frequencyExactMHz?: number;
  frequencyExactKHz?: number;
  standardFrequenciesMHz?: number[];
  defaultVariant?: boolean;
  loadCapacitance?: string;
  tolerance?: string;
};

const entries = publicPriceTable.entries as PriceEntry[];

function selectedModel(typeId: string, values: Record<string, string>) {
  const selected = typeId === "smd-oscillator" ? values.series : values.package;
  if (!selected) return "";
  return (
    entries
      .map((entry) => entry.model)
      .sort((left, right) => right.length - left.length)
      .find((model) =>
        selected.toUpperCase().startsWith(model.toUpperCase()),
      ) ?? ""
  );
}

function frequencyMHz(value: string) {
  const parsed = Number.parseFloat(String(value || "").replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function frequencyKHz(value: string) {
  const parsed = Number.parseFloat(String(value || "").replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function isStandardOscillatorVoltage(typeId: string, value: string) {
  if (!["smd-oscillator", "vcxo", "tcxo"].includes(typeId)) return true;
  const parsed = Number.parseFloat(value);
  return [1.8, 2.5, 3.3, 5].includes(parsed);
}

function matchesApprovedFrequency(
  entry: PriceEntry,
  values: Record<string, string>,
) {
  if (entry.frequencyExactKHz !== undefined) {
    return frequencyKHz(values.frequency) === entry.frequencyExactKHz;
  }

  const frequency = frequencyMHz(values.frequency);
  if (frequency === null) return false;
  if (entry.frequencyExactMHz !== undefined)
    return entry.frequencyExactMHz === frequency;
  if (entry.standardFrequenciesMHz?.length)
    return entry.standardFrequenciesMHz.includes(frequency);
  const hasApprovedBand =
    entry.frequencyMinInclusiveMHz !== undefined ||
    entry.frequencyMinExclusiveMHz !== undefined ||
    entry.frequencyMaxMHz !== undefined;
  if (!hasApprovedBand || entry.defaultVariant) return false;
  return (
    (entry.frequencyMinInclusiveMHz === undefined ||
      frequency >= entry.frequencyMinInclusiveMHz) &&
    (entry.frequencyMinExclusiveMHz === undefined ||
      frequency > entry.frequencyMinExclusiveMHz) &&
    (entry.frequencyMaxMHz === undefined || frequency <= entry.frequencyMaxMHz)
  );
}

export type PublicQuoteDecision =
  | { status: "estimated"; price: PublicQuotePrice }
  | { status: "needs-input"; reason: string }
  | { status: "submit-for-price"; reason: string };

export function resolvePublicQuoteDecision(
  typeId: string,
  values: Record<string, string>,
): PublicQuoteDecision {
  if (typeId === "vcxo" || typeId === "tcxo" || typeId === "other") {
    return {
      status: "submit-for-price",
      reason: "This product family requires Sunny review.",
    };
  }

  const model = selectedModel(typeId, values);
  if (!model) return { status: "needs-input", reason: "Select a Sunny model." };
  if (publicPriceTable.submitForPriceModels.includes(model)) {
    return {
      status: "submit-for-price",
      reason: `${model} is marked Submit for Price.`,
    };
  }
  if (!String(values.frequency || "").trim()) {
    return {
      status: "needs-input",
      reason: "Enter the exact frequency to check public price eligibility.",
    };
  }
  if (!isStandardOscillatorVoltage(typeId, values.supplyVoltage || "")) {
    return {
      status: "submit-for-price",
      reason: "This oscillator voltage is non-standard.",
    };
  }
  if (
    Object.values(values).some((value) =>
      /^not sure$/i.test(String(value).trim()),
    )
  ) {
    return {
      status: "submit-for-price",
      reason: "One or more required specifications need Sunny confirmation.",
    };
  }

  const candidates = entries.filter(
    (entry) =>
      entry.quoteType === typeId &&
      entry.model === model &&
      (!entry.selection || entry.selection === values.package) &&
      (!entry.loadCapacitance ||
        entry.loadCapacitance === values.loadCapacitance) &&
      (!entry.tolerance || entry.tolerance === values.tolerance),
  );
  const approved = candidates.find((entry) =>
    matchesApprovedFrequency(entry, values),
  );
  if (approved) return { status: "estimated", price: approved };
  return {
    status: "submit-for-price",
    reason:
      "The selected frequency or specifications are not an approved public standard-price match.",
  };
}

export function resolvePublicQuotePrice(
  typeId: string,
  values: Record<string, string>,
): PublicQuotePrice | null {
  const decision = resolvePublicQuoteDecision(typeId, values);
  return decision.status === "estimated" ? decision.price : null;
}

export const publicQuotePriceDisclaimer = publicPriceTable.disclaimer;
