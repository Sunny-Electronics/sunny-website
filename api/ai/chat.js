import fs from "node:fs";

const MAX_MESSAGE_LENGTH = 700;
const MAX_HISTORY_ITEMS = 6;
const MAX_MEMORY_ITEMS = 8;
const MAX_MODEL_MATCHES = 6;
const MAX_KNOWLEDGE_MATCHES = 5;
const MAX_CATALOG_CONTEXT_CHARS = 6200;
const DEFAULT_BRIDGE_PATH = "/sunny/chat";
const DEFAULT_TIMEOUT_MS = 18000;
const TELEGRAM_URL = "https://t.me/sunny_kr_bot";
const SUNNY_SUPPORT_EMAIL = "web@sunnykr.com";
const PRODUCTION_BRIDGE_HOST = "bridge.sunnykr.com";
const SUNNY_PUBLIC_COMPANY = Object.freeze({
  name: "Sunny Electronics Corp.",
  established: "1966",
  address:
    "59, Mokhaengsandan 2-ro, Chungju-si, Chungcheongbuk-do, Republic of Korea",
  phone: "+82-43-853-1760",
  domesticPhone: "043-853-1760",
  market: "KOSPI",
  ticker: "004770",
});

let publicCatalogCache;
let publicPricesCache;
let publicKnowledgeCache;
let publicBrainCache;

export const config = { maxDuration: 30 };

const links = {
  home: { label: "About Sunny", href: "/#about" },
  products: { label: "Products", href: "/products" },
  partNumber: {
    label: "Part Number Generator",
    href: "/part-number-generator",
  },
  stock: { label: "Stock", href: "/stock" },
  quote: { label: "Request Quote", href: "/request-quote" },
  documents: { label: "Documents", href: "/documents" },
  quality: { label: "Quality", href: "/quality" },
  telegram: { label: "Telegram", href: TELEGRAM_URL },
};

const sensitiveRequestPattern =
  /private|confidential|admin|portal|login|password|customer list|buyer list|customer name|buyer name|order list|purchase order|invoice|margin|cost price|buy price|sold price|receivable|a\/r|account detail|email list/i;

const customerTransactionPattern =
  /\b(?:price|pricing|order|orders|purchase order|po|invoice|account|customer|buyer|client|paid|purchased|bought|sold|received|supplied|shipped|delivered|context|profile|project|agent|bot)\b|가격|단가|주문|고객|매입|매출|계정|프로젝트/i;

const otherProjectPattern =
  /\b(?:another project|other project|unrelated project|different project)\b/i;

const unsafeReplyPattern =
  /unrelated project|different project|ollama|cloudflare|localhost|bearer token|api key|customer list|buyer list|cost price|buy price|internal margin|internal service|internal host|sunny-ai-bridge|https?:\/\/|\b(?:\d{1,3}\.){3}\d{1,3}\b/i;

const transactionDetailReplyPattern =
  /\b(?:paid|purchased|bought|sold|received|supplied|shipped|delivered|invoiced|billed|ordered)\b|\b(?:customer|buyer|client)\s+(?!project\b|product\b|application\b|requirements?\b|selection\b|support\b|request\b|needs?\b|design\b|use\b|part\b)[a-z0-9&.'-]+|\b(?:unit\s+)?(?:price|pricing)\s*(?:is|was|=|:)?\s*\d|\b\d+(?:[.,]\d+)?\s*(?:per\s+(?:piece|unit)|\/(?:pc|pcs|unit))\b|\b(?:under|on)\s+(?:order|purchase order|po|invoice)\b|\b(?:order|purchase order|po|invoice)\s*(?:number|no\.?|#|id)\b|\bpo\s+[a-z0-9-]{2,}\b|\border\s+[a-z0-9-]*\d[a-z0-9-]*\b/i;

const emailAddressPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const currencyPattern = /[$€£¥₩]|\b(?:usd|eur|krw|jpy|cny)\b/i;
const privateContactTargetPattern =
  /\b(?:customers?|buyers?|clients?)(?:['’]s|['’])?\s+(?:names?|emails?|phones?|telephone|addresses?|contacts?|accounts?|orders?|list)\b|\b(?:names?|emails?|phones?|telephone|addresses?|contacts?)\s+(?:of|for)\s+(?:a\s+)?(?:customer|buyer|client)\b/i;
const publicPriceIntentPattern =
  /\b(?:price|pricing|quote price|unit price|spq|moq|minimum order|standard packing quantity)\b/i;
const publicWorkflowIntentPattern =
  /\b(?:quote|rfq|request for quotation|part number generator|documents?|datasheets?|stock|inventory|availability|lead time|delivery|bom)\b/i;
const privatePriceQuestionPattern =
  /private|confidential|admin|customer|buyer|client|paid|purchased|bought|sold|invoice|order number|purchase order|\bpo\b|buy price|cost price|our cost|margin|receivable|a\/r|another project|other project|unrelated project/i;

function isSensitiveText(value) {
  const text = String(value || "");
  return (
    sensitiveRequestPattern.test(text) ||
    customerTransactionPattern.test(text) ||
    otherProjectPattern.test(text)
  );
}

function isPrivateContext(value) {
  const text = String(value || "");
  const privacyText = text.replace(
    /\bcustomer\s+(?:service|support)\b/gi,
    "public support",
  );
  return (
    isSensitiveText(privacyText) ||
    emailAddressPattern.test(text) ||
    currencyPattern.test(text)
  );
}

function hasUnapprovedEmailAddress(value) {
  const emails =
    String(value || "").match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || [];
  return emails.some((email) => email.toLowerCase() !== SUNNY_SUPPORT_EMAIL);
}

function isSensitiveReply(value) {
  const text = String(value || "");
  return (
    sensitiveRequestPattern.test(text) ||
    transactionDetailReplyPattern.test(text) ||
    otherProjectPattern.test(text)
  );
}

function sanitize(value, maxLength = MAX_MESSAGE_LENGTH) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxLength);
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

function readPath(value) {
  const pagePath = sanitize(value, 180).split("?")[0];
  return pagePath.startsWith("/") && !pagePath.startsWith("//")
    ? pagePath
    : "/";
}

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      role: sanitize(item?.role, 20),
      text: sanitize(item?.text, 400),
    }))
    .filter(
      (item) =>
        item.text &&
        /^(assistant|user)$/i.test(item.role) &&
        !isPrivateContext(item.text) &&
        isSunnyScope(item.text),
    )
    .slice(-MAX_HISTORY_ITEMS);
}

function cleanMemory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitize(item, 180))
    .filter((item) => item && !isPrivateContext(item) && isSunnyScope(item))
    .slice(-MAX_MEMORY_ITEMS);
}

function loadPublicCatalog() {
  if (publicCatalogCache) return publicCatalogCache;
  try {
    const catalogUrl = new URL("./sunny-obsidian-public.json", import.meta.url);
    publicCatalogCache = JSON.parse(fs.readFileSync(catalogUrl, "utf8"));
  } catch {
    publicCatalogCache = { models: [] };
  }
  return publicCatalogCache;
}

function loadPublicPrices() {
  if (publicPricesCache) return publicPricesCache;
  try {
    const pricesUrl = new URL("./sunny-public-prices.json", import.meta.url);
    publicPricesCache = JSON.parse(fs.readFileSync(pricesUrl, "utf8"));
  } catch {
    publicPricesCache = {
      entries: [],
      submitForPriceModels: [],
      submitForPriceFamilies: [],
    };
  }
  return publicPricesCache;
}

function loadPublicKnowledge() {
  if (publicKnowledgeCache) return publicKnowledgeCache;
  try {
    const knowledgeUrl = new URL(
      "./sunny-public-knowledge.json",
      import.meta.url,
    );
    publicKnowledgeCache = JSON.parse(fs.readFileSync(knowledgeUrl, "utf8"));
  } catch {
    publicKnowledgeCache = { records: [] };
  }
  return publicKnowledgeCache;
}

function loadPublicBrain() {
  if (publicBrainCache) return publicBrainCache;
  try {
    const brainUrl = new URL("./sunny-brain-public.json", import.meta.url);
    publicBrainCache = JSON.parse(fs.readFileSync(brainUrl, "utf8"));
  } catch {
    publicBrainCache = {};
  }
  return publicBrainCache;
}

function normalize(value) {
  return sanitize(value, 1200).toLowerCase();
}

function modelIsMentioned(message, modelName) {
  const escaped = String(modelName || "").replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  return escaped
    ? new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(message)
    : false;
}

function findModelMatches(message, pagePath = "/") {
  const query = normalize(`${message} ${pagePath}`);
  const terms = query.match(/[a-z0-9.\/+()-]+|[\u3131-\ud79d]+/g) || [];
  return (loadPublicCatalog().models || [])
    .map((model) => {
      const searchable = normalize(
        [model.model, model.family, model.packageType, model.dimensions]
          .filter(Boolean)
          .join(" "),
      );
      let score = modelIsMentioned(query, model.model) ? 30 : 0;
      for (const term of terms) {
        if (term.length > 1 && searchable.includes(term)) score += 2;
      }
      if (model.family && query.includes(normalize(model.family))) score += 8;
      return { ...model, score };
    })
    .filter((model) => model.score > 0)
    .sort((a, b) => b.score - a.score || a.model.localeCompare(b.model))
    .slice(0, MAX_MODEL_MATCHES);
}

function findKnowledgeMatches(message, modelMatches) {
  const query = normalize(message);
  const terms = query.match(/[a-z0-9.\/+()-]+|[\u3131-\ud79d]+/g) || [];
  const exactModels = new Set(modelMatches.map((model) => model.model));
  return (loadPublicKnowledge().records || [])
    .map((record) => {
      const searchable = normalize(
        [
          record.model,
          record.packageType,
          record.dimensions,
          record.section,
          record.text,
        ].join(" "),
      );
      let score = exactModels.has(record.model)
        ? 40
        : modelIsMentioned(query, record.model)
          ? 30
          : 0;
      for (const term of terms) {
        if (term.length > 1 && searchable.includes(term)) score += 1;
      }
      return { ...record, score };
    })
    .filter((record) => record.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.id.localeCompare(right.id),
    )
    .slice(0, MAX_KNOWLEDGE_MATCHES);
}

function humanList(items) {
  const values = [...new Set(items.filter(Boolean))];
  if (values.length <= 1) return values[0] || "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function parseFrequencyMHz(value) {
  const match = String(value || "").match(/(\d+(?:\.\d+)?)\s*mhz/i);
  if (!match) return null;
  const frequency = Number.parseFloat(match[1]);
  return Number.isFinite(frequency) && frequency > 0 ? frequency : null;
}

function parseFrequencyKHz(value) {
  const match = String(value || "").match(/(\d+(?:\.\d+)?)\s*khz/i);
  if (!match) return null;
  const frequency = Number.parseFloat(match[1]);
  return Number.isFinite(frequency) && frequency > 0 ? frequency : null;
}

function priceEntryMatchesFrequency(entry, frequencyMHz, frequencyKHz) {
  if (entry.frequencyExactKHz !== undefined)
    return entry.frequencyExactKHz === frequencyKHz;
  if (frequencyMHz === null) return false;
  if (entry.frequencyExactMHz !== undefined)
    return entry.frequencyExactMHz === frequencyMHz;
  if (Array.isArray(entry.standardFrequenciesMHz)) {
    return entry.standardFrequenciesMHz.includes(frequencyMHz);
  }
  const hasApprovedBand =
    entry.frequencyMinInclusiveMHz !== undefined ||
    entry.frequencyMinExclusiveMHz !== undefined ||
    entry.frequencyMaxMHz !== undefined;
  if (!hasApprovedBand || entry.defaultVariant) return false;
  return (
    (entry.frequencyMinInclusiveMHz === undefined ||
      frequencyMHz >= entry.frequencyMinInclusiveMHz) &&
    (entry.frequencyMinExclusiveMHz === undefined ||
      frequencyMHz > entry.frequencyMinExclusiveMHz) &&
    (entry.frequencyMaxMHz === undefined ||
      frequencyMHz <= entry.frequencyMaxMHz)
  );
}

function priceEntrySpecificationsMatch(entry, text) {
  if (entry.loadCapacitance) {
    const value = entry.loadCapacitance
      .replace(/\s+/g, "\\s*")
      .replace("+/-", "\\+/-");
    if (!new RegExp(value, "i").test(text)) return false;
  }
  if (entry.tolerance) {
    const ppm = entry.tolerance.match(/\d+(?:\.\d+)?/)?.[0];
    if (!ppm || !new RegExp(`(?:\\+/-|±)?\\s*${ppm}\\s*ppm`, "i").test(text))
      return false;
  }
  return true;
}

function formatPublicPrice(entry) {
  const variant = entry.variant ? ` (${entry.variant})` : "";
  return `${entry.model}${variant}: $${Number(entry.unitPriceUsd).toFixed(3)} USD/unit, SPQ ${Number(entry.spq).toLocaleString("en-US")}, MOQ ${Number(entry.moq).toLocaleString("en-US")}`;
}

function publicPriceAnswer(message) {
  const raw = String(message || "");
  const text = normalize(raw);
  if (
    !publicPriceIntentPattern.test(text) ||
    privatePriceQuestionPattern.test(text)
  )
    return null;
  if (privateContactTargetPattern.test(raw) || hasUnapprovedEmailAddress(raw))
    return null;

  const priceTable = loadPublicPrices();
  const entries = Array.isArray(priceTable.entries) ? priceTable.entries : [];
  const models = [
    ...new Set([
      ...entries.map((entry) => entry.model),
      ...(priceTable.submitForPriceModels || []),
    ]),
  ].sort((left, right) => right.length - left.length);
  const model = models.find((candidate) => modelIsMentioned(text, candidate));

  if (!model) {
    const family = (priceTable.submitForPriceFamilies || []).find((candidate) =>
      modelIsMentioned(text, candidate),
    );
    if (!family) return null;
    return {
      reply: `${family} requires a reviewed Sunny quote, so no public estimated price is shown. Please send the frequency, specifications, and EAU (Expected Annual Usage) through the quote form.`,
      links: [links.quote],
    };
  }

  if ((priceTable.submitForPriceModels || []).includes(model)) {
    return {
      reply: `${model} is marked “Submit for price” in Sunny's approved public table. Please send the specifications and EAU (Expected Annual Usage) through the quote form for review.`,
      links: [links.quote],
    };
  }

  const candidates = entries.filter((entry) => entry.model === model);
  if (!candidates.length) return null;

  const frequency = parseFrequencyMHz(text);
  const frequencyKHz = parseFrequencyKHz(text);
  if (frequency === null && frequencyKHz === null) {
    return {
      reply: `Please provide the exact frequency and standard specifications for ${model}. I will show a public estimate only when they match an approved price rule; otherwise Sunny will review it as Submit for Price.`,
      links: [links.quote],
    };
  }

  let narrowed = candidates;
  if (model === "ATS-49/U") {
    if (/insulator.{0,20}(?:tap|t&r)|(?:tap|t&r).{0,20}insulator/i.test(text)) {
      narrowed = candidates.filter((entry) =>
        /insulator-taping/i.test(entry.variant),
      );
    } else if (/insulator/i.test(text)) {
      narrowed = candidates.filter((entry) =>
        /insulator-bulk/i.test(entry.variant),
      );
    } else if (/tap|t&r/i.test(text)) {
      narrowed = candidates.filter(
        (entry) =>
          /taping t&r/i.test(entry.variant) &&
          !/insulator/i.test(entry.variant),
      );
    } else if (/bulk/i.test(text)) {
      narrowed = candidates.filter((entry) =>
        /bulk packing/i.test(entry.variant),
      );
    }
  }
  const matches = narrowed.filter(
    (entry) =>
      priceEntryMatchesFrequency(entry, frequency, frequencyKHz) &&
      priceEntrySpecificationsMatch(entry, text),
  );

  const lines = matches.map(formatPublicPrice);
  if (!lines.length) {
    return {
      reply: `${model} does not have an approved public standard-price match for the frequency and specifications provided. Please submit the EAU (Expected Annual Usage) and requirements for Sunny review.`,
      links: [links.quote],
    };
  }
  const detail =
    lines.length === 1 ? lines[0] : lines.map((line) => `• ${line}`).join("\n");
  return {
    reply: `${detail}\n\nThese are estimated public prices dated ${priceTable.publishedDate}. ${priceTable.disclaimer}`,
    links: [links.quote, links.products],
  };
}

function followUpFor(model) {
  if (
    /oscillator|tcxo|vctcxo|vcxo|xo\b/i.test(
      `${model.family} ${model.packageType}`,
    )
  ) {
    return "What frequency and output type do you need?";
  }
  if (/filter/i.test(model.family))
    return "What center frequency and bandwidth are you targeting?";
  return "What frequency and package requirement are you working with?";
}

function catalogAnswer(message, modelMatches) {
  const text = normalize(message);
  const allModels = loadPublicCatalog().models || [];
  const exact = modelMatches.find((model) =>
    modelIsMentioned(text, model.model),
  );

  if (exact) {
    const size = exact.dimensions ? ` in a ${exact.dimensions} package` : "";
    const frequency = exact.frequencySummary
      ? ` Its published frequency information is ${exact.frequencySummary}.`
      : "";
    return {
      reply: `${exact.model} is listed in Sunny's verified catalog as ${exact.packageType}${size}.${frequency} ${followUpFor(exact)}`,
      links: [links.products, links.partNumber, links.quote],
    };
  }

  if (/oscillator|\bxo\b|spxo|sco|hcsl|lvds|lvpecl/i.test(text)) {
    const models = allModels.filter(
      (model) => model.family === "Crystal Oscillators",
    );
    const types = models.map((model) =>
      model.packageType.replace(/\s+XO$/i, ""),
    );
    const preferred = ["SCO-10", "SCO-53", "SHO-53", "SLO-53", "SPO-53"];
    const available = new Set(models.map((model) => model.model));
    return {
      reply: `Yes—Sunny's catalog includes ${humanList(types)} oscillator families. Common starting points include ${humanList(preferred.filter((model) => available.has(model)))}. What frequency and output type do you need?`,
      links: [links.products, links.partNumber, links.quote],
    };
  }

  if (/tcxo|vctcxo|vcxo/i.test(text)) {
    const examples = allModels
      .filter(
        (model) => model.family === "TCXO & VCTCXO" || model.family === "VCXO",
      )
      .slice(0, 6)
      .map((model) => model.model);
    return {
      reply: `Sunny's verified catalog includes TCXO, VCTCXO, and VCXO families such as ${humanList(examples)}. What frequency and stability are you targeting?`,
      links: [links.products, links.quote],
    };
  }

  if (/tuning fork|32\.768|clock crystal/i.test(text)) {
    const examples = allModels
      .filter((model) => /tuning fork/i.test(model.packageType))
      .slice(0, 6)
      .map((model) => model.model);
    return {
      reply: `Sunny has 32.768 kHz tuning-fork families including ${humanList(examples)}. Which package size and load capacitance do you need?`,
      links: [links.products, links.quote],
    };
  }

  if (/crystal|quartz|resonator|\bsx[-\s]?|\bats[-\s]?/i.test(text)) {
    const preferred = ["SX-16", "SX-21", "SX-22", "SX-32", "SX-8", "SX-7"];
    const available = new Set(allModels.map((model) => model.model));
    return {
      reply: `Sunny's crystal catalog includes compact SMD families such as ${humanList(preferred.filter((model) => available.has(model)))}, plus ATS and tuning-fork options. What frequency and package size are you considering?`,
      links: [links.products, links.partNumber, links.quote],
    };
  }

  return null;
}

function publicBrainRuleAnswer(message) {
  const text = normalize(message);
  const brain = loadPublicBrain();
  const voltage = Number.parseFloat(
    text.match(/(\d+(?:\.\d+)?)\s*v(?:dc)?\b/i)?.[1] || "",
  );
  const oscillatorQuestion =
    /oscillator|\bxo\b|sco-|spxo|tcxo|vctcxo|vcxo|ocxo/.test(text);
  const standardVoltageListQuestion =
    /(?:which|what|list|show|tell me).*(?:standard).*(?:voltage|supply)|(?:standard).*(?:voltage|supply).*(?:which|what|list|show)|(?:voltage|supply).*(?:are|is).*(?:standard)/.test(
      text,
    );
  if (
    oscillatorQuestion &&
    standardVoltageListQuestion &&
    !Number.isFinite(voltage)
  ) {
    return {
      reply:
        "Sunny's standard oscillator supply-voltage classes are 1.8 V, 2.5 V, 3.3 V, and 5.0 V. 0.9 V, 1.2 V, 1.5 V, and other voltages are non-standard and should be submitted for price.",
      links: [links.partNumber, links.quote],
    };
  }
  if (oscillatorQuestion && Number.isFinite(voltage)) {
    const rule = brain.oscillatorVoltageRule || {};
    if ((rule.standardVoltages || []).includes(voltage)) {
      return {
        reply: `${voltage} V is a standard Sunny oscillator supply-voltage class. The exact model, frequency, output, stability, temperature range, and EAU still determine the final configuration and price.`,
        links: [links.partNumber, links.quote],
      };
    }
    return {
      reply: `${voltage} V is non-standard under Sunny's public oscillator quote rule. Sunny can review the requirement, but it must be submitted for price with the model, frequency, output, stability, temperature range, and EAU.`,
      links: [links.quote],
    };
  }
  return null;
}

function isSunnyScope(message) {
  const text = normalize(message);
  if (
    /^(hi|hello|hey|안녕|안녕하세요|help|start|thanks|thank you)\b/.test(text)
  )
    return true;
  return /sunny|catalog|catalogue|datasheet|document|certificate|quality|qa|r&d|engineering|rfq|quote|bom|lead time|stock|inventory|price|crystal|quartz|resonator|oscillator|frequency|mhz|khz|smd|sx-|ats-|sco|spxo|tcxo|vcxo|ocxo|load capacitance|\bcl\b|ppm|package|tolerance|stability|temperature|voltage|\bsupply voltage\b|\boutput (?:type|logic|level|signal|voltage|enable)\b|\bdimensions?\b|\besr\b|aging|jitter|phase noise|rohs|reach|iatf|iso|part number|p\/n|\bpn\b|contact|e-?mail|phone|telephone|address|headquarters|korea office|ticker|kospi|krx|listed company|public company|company information|founded|established/.test(
    text,
  );
}

function publicCompanyAnswer(message) {
  const raw = String(message || "");
  const text = normalize(raw);
  if (privateContactTargetPattern.test(raw) || hasUnapprovedEmailAddress(raw))
    return null;

  if (
    /e-?mail|email address|where.{0,30}(?:send|submit).{0,30}(?:request|rfq|inquiry)|send.{0,30}(?:request|rfq|inquiry)/.test(
      text,
    )
  ) {
    return {
      reply: `For Sunny product, document, or RFQ inquiries, email ${SUNNY_SUPPORT_EMAIL}. You can also use the Request Quote form so the product requirements are included clearly.`,
      links: [links.quote, links.documents],
    };
  }

  if (
    /phone|telephone|contact number|\btel\b|how.{0,20}(?:call|contact)/.test(
      text,
    )
  ) {
    return {
      reply: `Sunny Electronics' public main telephone number is ${SUNNY_PUBLIC_COMPANY.phone}. Within Korea, dial ${SUNNY_PUBLIC_COMPANY.domesticPhone}.`,
      links: [links.home, links.quote],
    };
  }

  if (
    /address|location|located|head\s*office|headquarters|korea office|factory address/.test(
      text,
    )
  ) {
    return {
      reply: `Sunny Electronics' public corporate address is ${SUNNY_PUBLIC_COMPANY.address}.`,
      links: [links.home],
    };
  }

  if (
    /stock ticker|stock code|share code|\bticker\b|kospi|\bkrx\b|publicly listed|listed company/.test(
      text,
    )
  ) {
    return {
      reply: `Sunny Electronics is listed on the Korea Exchange ${SUNNY_PUBLIC_COMPANY.market} market under stock code ${SUNNY_PUBLIC_COMPANY.ticker}. Market prices change, so confirm the current price with the Korea Exchange or your market-data provider.`,
      links: [links.home],
    };
  }

  if (
    /about sunny|what is sunny(?: electronics)?|company information|who is sunny|company history|when.{0,20}(?:founded|established)|founded|established/.test(
      text,
    )
  ) {
    return {
      reply: `${SUNNY_PUBLIC_COMPANY.name} is a Korea-based frequency-control component manufacturer established in ${SUNNY_PUBLIC_COMPANY.established}. Sunny produces crystal units, oscillators, resonators, filters, and related timing components, and is listed on KOSPI under stock code ${SUNNY_PUBLIC_COMPANY.ticker}.`,
      links: [links.home, links.products],
    };
  }

  return null;
}

function publicAnswer(message, modelMatches) {
  const text = normalize(message);

  if (isSensitiveText(text)) {
    return {
      reply:
        "Private company, customer, pricing, order, and account information is not available through public Sunnychat. For a product-related request, please submit an RFQ.",
      links: [links.quote],
    };
  }

  if (!isSunnyScope(message)) {
    return {
      reply:
        "I specialize in Sunny frequency-control products, part numbers, published documents, stock quantities, and RFQs. Please use the SunnyKR website sections below for anything Sunny-related.",
      links: [links.products, links.quote, links.documents],
    };
  }

  const ruleAnswer = publicBrainRuleAnswer(message);
  if (ruleAnswer) return ruleAnswer;

  const grounded = catalogAnswer(message, modelMatches);
  if (grounded) return grounded;

  if (/stock|inventory|available|availability|quantity|qty/.test(text)) {
    return {
      reply:
        "I can show only Sunny stock number, Sunny part number, and public quantity. Price, delivery, and customer-specific details require an official RFQ.",
      links: [links.stock, links.quote],
    };
  }

  if (
    /document|datasheet|certificate|iso|iatf|rohs|reach|quality|drawing|reliability/.test(
      text,
    )
  ) {
    return {
      reply:
        "I can help find Sunny documents approved for public release. What part number or document type do you need?",
      links: [links.documents, links.quality, links.quote],
    };
  }

  if (/quote|rfq|price|lead time|delivery|bom/.test(text)) {
    return {
      reply:
        "Sure—send me the Sunny or customer part number if you have it. If not, start with the frequency and EAU (Expected Annual Usage), and I'll guide you through the remaining catalog fields one step at a time.",
      links: [links.quote, links.partNumber],
    };
  }

  return {
    reply:
      "Hi—I'm Sunnychat. I can help you choose Sunny crystals, oscillators, frequency-control parts, documents, and RFQ details. What part number or requirement are you working with?",
    links: [links.products, links.quote, links.telegram],
  };
}

function catalogContext(modelMatches, knowledgeMatches) {
  const lines = [
    "Verified Sunny public company information:",
    `- Company: ${SUNNY_PUBLIC_COMPANY.name}; established ${SUNNY_PUBLIC_COMPANY.established}`,
    `- Public support email: ${SUNNY_SUPPORT_EMAIL}`,
    `- Public main telephone: ${SUNNY_PUBLIC_COMPANY.phone} (${SUNNY_PUBLIC_COMPANY.domesticPhone} within Korea)`,
    `- Public corporate address: ${SUNNY_PUBLIC_COMPANY.address}`,
    `- Listing: ${SUNNY_PUBLIC_COMPANY.market}, Korea Exchange code ${SUNNY_PUBLIC_COMPANY.ticker}`,
  ];
  if (modelMatches.length) {
    lines.push(
      "Verified Sunny public catalog matches:",
      ...modelMatches.map(
        (model) =>
          `- ${model.model}: ${model.family}; ${model.packageType}${model.dimensions ? `; ${model.dimensions}` : ""}${model.frequencySummary ? `; ${model.frequencySummary}` : ""}`,
      ),
    );
  }
  if (knowledgeMatches.length) {
    lines.push(
      "Catalog-verified Sunny technical excerpts:",
      ...knowledgeMatches.map(
        (record) =>
          `- ${record.model} — ${record.section} (${record.citation}):\n${record.text}`,
      ),
    );
  }
  const brain = loadPublicBrain();
  lines.push(
    "Approved Sunny public operating rules:",
    `- Oscillator standard supply voltages: ${(brain.oscillatorVoltageRule?.standardVoltages || []).join(", ")} V. Other voltages are Submit for Price.`,
    "- A published frequency range is capability information; it does not by itself prove standard-frequency public-price eligibility.",
    "- Use in stock only for exact or approved-compatible finished stock; otherwise say Sunny can support the requirement.",
  );
  return lines.join("\n").slice(0, MAX_CATALOG_CONTEXT_CHARS);
}

function getBridgeConfig() {
  const rawUrl = String(process.env.SUNNY_AI_BRIDGE_URL || "").trim();
  const token = String(process.env.SUNNY_AI_BRIDGE_TOKEN || "").trim();
  if (!rawUrl || !token) return { enabled: false };

  try {
    const url = new URL(rawUrl);
    const isProduction = process.env.VERCEL_ENV === "production";
    const allowedDevelopmentHost = ["127.0.0.1", "localhost"].includes(
      url.hostname,
    );
    if (
      isProduction &&
      (url.protocol !== "https:" ||
        url.hostname !== PRODUCTION_BRIDGE_HOST ||
        url.port)
    ) {
      return { enabled: false, invalid: true };
    }
    if (
      !isProduction &&
      url.hostname !== PRODUCTION_BRIDGE_HOST &&
      !allowedDevelopmentHost
    ) {
      return { enabled: false, invalid: true };
    }
    if (!url.pathname || url.pathname === "/")
      url.pathname = DEFAULT_BRIDGE_PATH;
    if (url.pathname !== DEFAULT_BRIDGE_PATH)
      return { enabled: false, invalid: true };
    url.search = "";
    url.hash = "";
    return { enabled: true, url: url.toString(), token };
  } catch {
    return { enabled: false, invalid: true };
  }
}

function safeBridgeReply(value) {
  const reply = sanitize(value, 1800);
  return reply &&
    isSunnyScope(reply) &&
    !unsafeReplyPattern.test(reply) &&
    !isSensitiveReply(reply) &&
    !hasUnapprovedEmailAddress(reply) &&
    !currencyPattern.test(reply)
    ? reply
    : "";
}

async function callSunnyBridge({
  message,
  pagePath,
  history,
  memory,
  modelMatches,
  knowledgeMatches,
}) {
  const bridge = getBridgeConfig();
  if (!bridge.enabled) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(bridge.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bridge.token}`,
        "X-Sunny-Project": "sunnykr",
      },
      signal: controller.signal,
      body: JSON.stringify({
        project: "sunnykr",
        message,
        pagePath,
        history,
        memory,
        catalogContext: catalogContext(modelMatches, knowledgeMatches),
        modelPolicy: {
          primary: "gemma",
          fallback: "disabled",
        },
        instructions: [
          "Act as an experienced Sunny frequency-control product specialist.",
          "Use only supplied Sunny public catalog context and public Sunny topics.",
          "Use the supplied verified public company information for Sunny contact, address, telephone, listing, and general company questions.",
          "Answer directly and naturally, then ask one useful follow-up question.",
          "For RFQ requirements, say EAU (Expected Annual Usage), not quantity.",
          "Never reveal infrastructure, private customer data, prices, costs, orders, accounts, tokens, or internal notes.",
          "Never invent specifications, stock, pricing, lead time, certification, or delivery.",
          "Treat a catalog frequency range as capability information, not proof of standard-frequency price eligibility.",
          "Keep the customer answer concise. Do not volunteer internal design explanations unless asked or necessary.",
        ],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    if (data?.project !== "sunnykr" || data?.service !== "sunny-ai-bridge")
      return null;
    const reply = safeBridgeReply(
      data?.reply ||
        data?.answer ||
        data?.response ||
        data?.message ||
        data?.content,
    );
    return reply || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "MethodNotAllowed" });
  }

  const body = parseBody(req);
  const message = sanitize(body.message);
  if (!message)
    return res
      .status(400)
      .json({ error: "BadRequest", message: "Please enter a message." });

  const pagePath = readPath(body.pagePath);
  const history = cleanHistory(body.history);
  const memory = cleanMemory(body.memory);
  const modelMatches = findModelMatches(message, pagePath);
  const knowledgeMatches = findKnowledgeMatches(message, modelMatches);
  const priceAnswer = publicPriceAnswer(message);
  if (priceAnswer) {
    return res
      .status(200)
      .json({ ...priceAnswer, source: "sunny-public-price-table" });
  }
  const brainRuleAnswer = publicBrainRuleAnswer(message);
  if (brainRuleAnswer) {
    return res
      .status(200)
      .json({ ...brainRuleAnswer, source: "sunny-public-brain" });
  }
  const fallback = publicAnswer(message, modelMatches);

  if (isPrivateContext(message) || !isSunnyScope(message)) {
    return res
      .status(200)
      .json({ ...fallback, source: "sunny-public-catalog" });
  }

  const companyAnswer = publicCompanyAnswer(message);
  if (companyAnswer) {
    return res
      .status(200)
      .json({ ...companyAnswer, source: "sunny-public-catalog" });
  }

  if (publicWorkflowIntentPattern.test(message)) {
    return res
      .status(200)
      .json({ ...fallback, source: "sunny-public-catalog" });
  }

  const bridgeReply = await callSunnyBridge({
    message,
    pagePath,
    history,
    memory,
    modelMatches,
    knowledgeMatches,
  });
  if (bridgeReply) {
    return res
      .status(200)
      .json({
        reply: bridgeReply,
        links: fallback.links,
        source: "sunny-ai-bridge",
      });
  }

  return res.status(200).json({ ...fallback, source: "sunny-public-catalog" });
}
