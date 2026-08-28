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
  frequencyMinExclusiveMHz?: number;
  frequencyExactMHz?: number;
  defaultVariant?: boolean;
  loadCapacitance?: string;
  tolerance?: string;
};

const entries = publicPriceTable.entries as PriceEntry[];

function selectedModel(typeId: string, values: Record<string, string>) {
  const selected = typeId === "smd-oscillator" ? values.series : values.package;
  if (!selected) return "";
  return entries
    .map((entry) => entry.model)
    .sort((left, right) => right.length - left.length)
    .find((model) => selected.toUpperCase().startsWith(model.toUpperCase())) ?? "";
}

function frequencyMHz(value: string) {
  const parsed = Number.parseFloat(String(value || "").replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function resolvePublicQuotePrice(
  typeId: string,
  values: Record<string, string>,
): PublicQuotePrice | null {
  if (typeId === "vcxo" || typeId === "tcxo" || typeId === "other") return null;

  const model = selectedModel(typeId, values);
  if (!model || publicPriceTable.submitForPriceModels.includes(model)) return null;

  const candidates = entries.filter(
    (entry) =>
      entry.quoteType === typeId &&
      entry.model === model &&
      (!entry.loadCapacitance || entry.loadCapacitance === values.loadCapacitance) &&
      (!entry.tolerance || entry.tolerance === values.tolerance),
  );
  if (!candidates.length) return null;

  const exactSelection = candidates.find(
    (entry) => entry.selection && entry.selection === values.package,
  );
  if (exactSelection) return exactSelection;
  if (candidates.length === 1) return candidates[0];

  const frequency = frequencyMHz(values.frequency);
  if (frequency === null) return null;

  const exactFrequency = candidates.find(
    (entry) => entry.frequencyExactMHz === frequency,
  );
  if (exactFrequency) return exactFrequency;

  const frequencyBand = candidates.find(
    (entry) =>
      (entry.frequencyMaxMHz === undefined || frequency <= entry.frequencyMaxMHz) &&
      (entry.frequencyMinExclusiveMHz === undefined || frequency > entry.frequencyMinExclusiveMHz) &&
      entry.frequencyExactMHz === undefined &&
      !entry.defaultVariant,
  );
  if (frequencyBand) return frequencyBand;

  return candidates.find((entry) => entry.defaultVariant) ?? null;
}

export const publicQuotePriceDisclaimer = publicPriceTable.disclaimer;
