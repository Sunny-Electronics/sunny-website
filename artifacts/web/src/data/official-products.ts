import catalog from "@/data/sunny-official-products.json";

export const OFFICIAL_PRODUCT_SECTIONS = [
  "Crystal Units",
  "Crystal Oscillators",
  "VCXO",
  "TCXO & VCTCXO",
] as const;

export type OfficialProductSection =
  (typeof OFFICIAL_PRODUCT_SECTIONS)[number];

export type OfficialProduct = {
  id: string;
  model: string;
  section: OfficialProductSection;
  deviceType: string;
  packageType: string;
  datasheetName: string;
  datasheetUrl: string;
  imagePath: string;
  features: string[];
  sourceDetailUrl: string;
};

export const officialProducts = catalog.products as OfficialProduct[];

export function productsForSection(section: OfficialProductSection) {
  return officialProducts.filter((product) => product.section === section);
}

export function quoteHrefForProduct(product: OfficialProduct) {
  let quoteType = "other";

  if (product.section === "Crystal Units") {
    if (/^CS-/i.test(product.model)) quoteType = "tuning-fork";
    else if (/^(ATS|HC-|UM-|CH-)/i.test(product.model)) quoteType = "ats";
    else quoteType = "smd-crystal";
  } else if (product.section === "Crystal Oscillators") {
    quoteType = "smd-oscillator";
  } else if (product.section === "VCXO") {
    quoteType = "vcxo";
  } else if (product.section === "TCXO & VCTCXO") {
    quoteType = "tcxo";
  }

  return `/quote/${quoteType}?partNumber=${encodeURIComponent(product.model)}`;
}
