import fs from "node:fs";

const MAX_MESSAGE_LENGTH = 700;
const MAX_HISTORY_ITEMS = 6;
const MAX_MEMORY_ITEMS = 8;
const DEFAULT_TIMEOUT_MS = 18000;
const MAX_TIMEOUT_MS = 22000;
const DEFAULT_BRIDGE_PATH = "/sunny/chat";
const TELEGRAM_URL = "https://t.me/sunny_kr_bot";
const SUNNY_SUPPORT_EMAIL = "web@sunnykr.com";
const MAX_CATALOG_MATCHES = 3;
const MAX_CATALOG_CONTEXT_CHARS = 1100;

let sunnyCatalogCache;

export const config = {
  maxDuration: 30,
};

const siteLinks = {
  home: { label: "Home", href: "/" },
  products: { label: "Products", href: "/products" },
  quote: { label: "Request Quote", href: "/request-quote" },
  documents: { label: "Documents", href: "/documents" },
  quality: { label: "Quality", href: "/quality" },
  industries: { label: "Industries", href: "/industries" },
  access: { label: "SPA Access", href: "/request-access" },
  telegram: { label: "Telegram", href: TELEGRAM_URL },
  email: { label: "Email Sunny", href: `mailto:${SUNNY_SUPPORT_EMAIL}` },
};

const siteMap = [
  "Home /: Sunny Electronics overview for crystals, oscillators, RFQ, documents, and B2B support.",
  "Products /products: product families, crystals, oscillators, packages, documents, and specs.",
  "Request Quote /request-quote: RFQ builder, part number parsing, quantity, target date, and BOM support.",
  "Documents /documents: datasheets, quality files, certificates, and SPA document support.",
  "Quality /quality: quality, compliance, document control, and manufacturing support.",
  "Industries /industries: application and market fit for Sunny products.",
  "SPA Access /request-access: buyer, distributor, and customer access request.",
];

const crystalPackageCodes = {
  C: "ATS-25/U",
  D: "ATS-49/U",
  J: "SX-1",
  K: "SX-3",
  M: "SX-7",
  O: "SX-8",
  P: "SX-32",
  Q: "SX-22",
  R: "SX-21",
  S: "SX-16",
  T: "SX-A21",
  U: "SX-A22",
  V: "SX-A32",
  W: "SX-A8",
};

const crystalTempCodes = {
  D: "-10~70C",
  E: "-20~70C",
  F: "-30~60C",
  G: "-20~85C",
  H: "-30~70C",
  I: "-30~85C",
  J: "-40~85C",
  K: "-40~90C",
  L: "-40~105C",
  M: "-40~125C",
  N: "-40~150C",
};

const crystalStabilityCodes = {
  3: "+/-10ppm",
  4: "+/-15ppm",
  5: "+/-20ppm",
  6: "+/-30ppm",
  7: "+/-50ppm",
  8: "+/-100ppm",
  9: "+/-150ppm",
  10: "+/-200ppm",
};

const crystalStabilityByTempCode = {
  D: "3",
  E: "3",
  F: "3",
  G: "4",
  H: "5",
  I: "5",
  J: "5",
  K: "6",
  L: "6",
  M: "7",
  N: "7",
};

const crystalPackageSizeCodes = [
  { code: "S", packageName: "SX-16", pattern: /\b(?:1\.?6\s*(?:x|×)\s*1\.?2|1612)\b/i },
  { code: "R", packageName: "SX-21", pattern: /\b(?:2\.?0\s*(?:x|×)\s*1\.?6|2016)\b/i },
  { code: "Q", packageName: "SX-22", pattern: /\b(?:2\.?5\s*(?:x|×)\s*2\.?0|2520)\b/i },
  { code: "P", packageName: "SX-32", pattern: /\b(?:3\.?2\s*(?:x|×)\s*2\.?5|3225)\b/i },
  { code: "O", packageName: "SX-8", pattern: /\b(?:5\.?0?\s*(?:x|×)\s*3\.?2|5032)\b/i },
  { code: "M", packageName: "SX-7", pattern: /\b(?:7\.?0?\s*(?:x|×)\s*5\.?0?|7050)\b/i },
];

function loadSunnyCatalog() {
  if (sunnyCatalogCache) return sunnyCatalogCache;

  try {
    const catalogUrl = new URL("./sunny-catalog.json", import.meta.url);
    sunnyCatalogCache = JSON.parse(fs.readFileSync(catalogUrl, "utf8"));
  } catch {
    sunnyCatalogCache = { rules: [], defaultRfqFields: [], entries: [] };
  }

  return sunnyCatalogCache;
}

function normalizeForSearch(value) {
  return sanitize(value).toLowerCase();
}

function scoreCatalogEntry(entry, query) {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return 0;

  const searchable = normalizeForSearch(
    [
      entry.id,
      entry.title,
      entry.type,
      entry.summary,
      ...(entry.keywords || []),
      ...(entry.knownSeries || []),
      entry.partNumberFormat,
      ...(entry.partNumberExamples || []),
      ...(entry.partNumberRules || []),
      ...(entry.defaultRules || []),
      ...(entry.packageSizeMap || []),
      ...(entry.knownDocuments || []),
      ...(entry.specGuidance || []),
      ...(entry.rfqFields || []),
    ].join(" "),
  );

  let score = 0;
  const terms = normalizedQuery.match(/[a-z0-9.\/+-]+|[\u3131-\ud79d]+/g) || [];

  for (const keyword of entry.keywords || []) {
    const normalizedKeyword = normalizeForSearch(keyword);
    if (normalizedKeyword && normalizedQuery.includes(normalizedKeyword)) score += 6;
  }

  for (const series of entry.knownSeries || []) {
    const normalizedSeries = normalizeForSearch(series);
    if (normalizedSeries && normalizedQuery.includes(normalizedSeries)) score += 8;
  }

  for (const term of terms) {
    if (term.length > 1 && searchable.includes(term)) score += 1;
  }

  return score;
}

function findCatalogMatches(message, pagePath) {
  const catalog = loadSunnyCatalog();
  const query = `${message} ${pagePath}`;

  return (catalog.entries || [])
    .map((entry) => ({ ...entry, score: scoreCatalogEntry(entry, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CATALOG_MATCHES);
}

function catalogLinks(matches) {
  return matches
    .flatMap((entry) => entry.routes || [])
    .filter((link, index, all) => all.findIndex((item) => item.href === link.href) === index)
    .slice(0, 4);
}

function buildCatalogGuide(matches) {
  if (!matches.length) return "";

  const catalog = loadSunnyCatalog();
  const guide = [
    "Catalog context for this visitor question:",
    ...matches.map((entry) => {
      const knownSeries = (entry.knownSeries || []).slice(0, 8).join(", ");
      const examples = (entry.partNumberExamples || []).slice(0, 4).join(", ");
      const fields = (entry.rfqFields || catalog.defaultRfqFields || []).slice(0, 8).join(", ");
      const partRules = (entry.partNumberRules || []).slice(0, 4).join(" ");
      const defaultRules = (entry.defaultRules || []).slice(0, 4).join(" ");
      const routes = (entry.routes || []).map((route) => `${route.label} ${route.href}`).join("; ");
      return [
        `- ${entry.title}: ${entry.summary}`,
        knownSeries ? `Known series: ${knownSeries}.` : "",
        entry.partNumberFormat ? `Sunny-Catalog P/N format: ${entry.partNumberFormat}` : "",
        partRules ? `P/N rules: ${partRules}` : "",
        defaultRules ? `Missing-field defaults: ${defaultRules}` : "",
        examples ? `Example Sunny-Catalog P/N: ${examples}.` : "",
        fields ? `Useful RFQ fields: ${fields}.` : "",
        routes ? `Route to: ${routes}.` : "",
      ]
        .filter(Boolean)
        .join(" ");
    }),
    "Answer using only this catalog if it is relevant. If specs are missing, ask for the missing RFQ fields. Do not invent specs, price, stock, or final lead time.",
  ].join("\n");

  return guide.slice(0, MAX_CATALOG_CONTEXT_CHARS);
}

function sanitize(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim();
}

function normalizePpmText(value) {
  return sanitize(value)
    .replace(/\\?\$\s*\\?pm\s*(\d{1,3})\s*\\?\$\s*ppm/gi, "+/-$1ppm")
    .replace(/\\?\$\s*\\?pm\s*(\d{1,3})\s*ppm\s*\\?\$/gi, "+/-$1ppm")
    .replace(/\\?\\pm\s*(\d{1,3})\s*ppm/gi, "+/-$1ppm")
    .replace(/\b(\d{1,3})\$\s*ppm\b/gi, "+/-$1ppm")
    .replace(/\+\s*\/\s*-\s*(\d{1,3})\s*ppm/gi, "+/-$1ppm")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isSunnychatScopeAllowed(message, pagePath = "/") {
  const text = String(message || "").toLowerCase();

  if (/^(hi|hello|hey|안녕|안녕하세요|help|start|thanks|thank you)\b/.test(text.trim())) return true;

  return /sunny|sunnykr|sunny\.co\.kr|catalog|catalogue|datasheet|document|certificate|quality|qa|r&d|engineering|rfq|quote|bom|lead time|stock|inventory|price|pricing|crystal|quartz|resonator|oscillator|frequency control|frequency|mhz|khz|smd|sx-|ats-|sco|spxo|tcxo|vcxo|ocxo|load capacitance|\bcl\b|ppm|package|tolerance|stability|temperature|rohs|reach|iatf|iso|spa|portal|part number|p\/n|pn/.test(
    text,
  );
}

function scopeFallback() {
  return {
    reply:
      `This request is outside Sunny catalog, Sunny website, frequency-control product, RFQ, R&D, and QA support. Please contact Sunny through sunnykr.com or email ${SUNNY_SUPPORT_EMAIL}; someone at Sunny will review and get back within 24 hours.`,
    links: [siteLinks.email, siteLinks.quote, siteLinks.documents],
  };
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
  const path = sanitize(value).slice(0, 180);
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      role: sanitize(item?.role).slice(0, 20),
      text: sanitize(item?.text).slice(0, 400),
    }))
    .filter((item) => item.text && /^(assistant|user)$/i.test(item.role))
    .slice(-MAX_HISTORY_ITEMS);
}

function cleanMemory(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => sanitize(item).slice(0, 180))
    .filter(Boolean)
    .slice(-MAX_MEMORY_ITEMS);
}

function getBridgeUrl() {
  const raw =
    process.env.SUNNY_AI_BRIDGE_URL ||
    process.env.AI_BRIDGE_URL ||
    process.env.OPENCLAW_URL ||
    "";
  if (!raw || typeof raw !== "string") return "";

  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    if (!url.pathname || url.pathname === "/") {
      url.pathname = DEFAULT_BRIDGE_PATH;
    }
    url.hash = "";
    return url.toString();
  } catch {
    return trimmed;
  }
}

function getBridgeToken() {
  const raw =
    process.env.SUNNY_AI_BRIDGE_TOKEN ||
    process.env.AI_BRIDGE_TOKEN ||
    process.env.OPENCLAW_API_KEY ||
    "";
  return typeof raw === "string" ? raw.trim() : "";
}

function getTimeoutMs() {
  const configured = Number(process.env.SUNNY_AI_TIMEOUT_MS);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.min(configured, MAX_TIMEOUT_MS);
  }
  return DEFAULT_TIMEOUT_MS;
}

function readAssistantText(data) {
  if (!data || typeof data !== "object") return "";
  const answer =
    data.reply ||
    data.answer ||
    data.response ||
    data.message ||
    data.content ||
    data.choices?.[0]?.message?.content ||
    data.choices?.[0]?.text ||
    "";
  return normalizePpmText(answer);
}

function explainSunnyCrystalPart(message) {
  const match = normalizeForSearch(message).match(/\b(s)([a-z])(\d{2})([135])(\d{2})([a-z])(\d{1,2})-(\d+(?:\.\d+)?)\b/);
  if (!match) return null;

  const [, prefix, packageCodeRaw, loadCap, mode, tolerance, tempCodeRaw, stabilityCode, frequency] = match;
  const packageCode = packageCodeRaw.toUpperCase();
  const tempCode = tempCodeRaw.toUpperCase();
  const packageName = crystalPackageCodes[packageCode] || `package code ${packageCode}`;
  const modeLabel = mode === "1" ? "fundamental" : `${mode}rd/5th overtone mode`;
  const tempRange = crystalTempCodes[tempCode] || `operating temp code ${tempCode}`;
  const stability = crystalStabilityCodes[stabilityCode] || `temp stability code ${stabilityCode}`;
  const partNumber = `${prefix.toUpperCase()}${packageCode}${loadCap}${mode}${tolerance}${tempCode}${stabilityCode}-${frequency}`;

  return {
    reply:
      `${partNumber} looks like a Sunny-Catalog crystal P/N for RFQ review: ${packageName}, ${frequency} MHz, ${loadCap} pF load capacitance, ${modeLabel}, +/-${tolerance}ppm frequency tolerance at 25 C, ${tempRange} operating temp range, and ${stability} temp stability. Sunny should still confirm final part number, price, stock, lead time, and qualification.`,
    links: [siteLinks.quote, siteLinks.products],
  };
}

function formatCrystalFrequency(value) {
  const parsed = Number(String(value || "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return parsed.toFixed(4);
}

function extractCrystalFrequency(text) {
  const match = text.match(/\b(\d+(?:\.\d+)?)\s*(?:mhz|m\b)/i);
  return match ? formatCrystalFrequency(match[1]) : "";
}

function extractCrystalPackage(text) {
  const sxMatch = text.match(/\bsx[-\s]?(16|21|22|32|8|7)\b/i);
  if (sxMatch) {
    const packageName = `SX-${sxMatch[1]}`;
    const code = Object.entries(crystalPackageCodes).find(([, value]) => value.toLowerCase() === packageName.toLowerCase())?.[0];
    if (code) return { code, packageName };
  }

  const sizeMatch = crystalPackageSizeCodes.find((item) => item.pattern.test(text));
  if (sizeMatch) return { code: sizeMatch.code, packageName: sizeMatch.packageName };
  return null;
}

function extractCrystalLoadCap(text) {
  const explicitPf = text.match(/\b(\d{1,2}(?:\.\d+)?)\s*pf\b/i);
  if (explicitPf) return explicitPf[1].replace(/\.0$/, "");

  const loadMatch = text.match(/\b(?:load|capacitance|\bcl\b)\D{0,18}(\d{1,2}(?:\.\d+)?)/i);
  if (loadMatch) return loadMatch[1].replace(/\.0$/, "");
  return "";
}

function extractPpmNear(text, words) {
  const wordGroup = words.join("|");
  const after = text.match(new RegExp(`\\b(?:${wordGroup})\\b\\D{0,24}(\\d{1,3})\\s*ppm`, "i"));
  if (after) return after[1];
  const before = text.match(new RegExp(`\\b(\\d{1,3})\\s*ppm\\D{0,24}\\b(?:${wordGroup})\\b`, "i"));
  return before ? before[1] : "";
}

function wantsLowestAvailablePpm(text) {
  return /\b(?:lowest|best|tightest|min(?:imum)?|as\s+low\s+as\s+possible|low\s+tolerance|low\s+ppm|smallest)\b/i.test(text);
}

function minimumCrystalStabilityCodeForTemp(tempCode) {
  return crystalStabilityByTempCode[String(tempCode || "").toUpperCase()] || "7";
}

function extractCrystalTempCode(text) {
  const match = text.match(/(-\s*\d{1,3})\s*(?:~|-|to)\s*(\+?\s*\d{1,3})\s*(?:c|℃)?/i);
  if (!match) return "";

  const low = match[1].replace(/\s+/g, "");
  const high = match[2].replace(/\s+/g, "").replace(/^\+/, "");
  const normalized = `${low}~${high}C`;
  return Object.entries(crystalTempCodes).find(([, value]) => value === normalized)?.[0] || "";
}

function extractCrystalStabilityCode(text) {
  const ppm = extractPpmNear(text, ["stability", "stable"]);
  if (!ppm) return "";
  return Object.entries(crystalStabilityCodes).find(([, value]) => value === `+/-${ppm}ppm`)?.[0] || "";
}

function buildCrystalQuoteHref(spec) {
  const params = new URLSearchParams({
    source: "sunny-chat",
    family: "crystal",
    pkg: spec.packageCode,
    frequency: spec.frequency.replace(/\.?0+$/, ""),
    cl: spec.loadCap,
    tolerance: spec.tolerance,
    temp: spec.tempCode,
    stability: spec.stabilityCode,
    mode: "1",
    packing: "TR",
    autoAdd: "1",
  });

  if (spec.assumptions.length) params.set("note", spec.assumptions.join("; "));
  return `/request-quote?${params.toString()}#quote-list`;
}

function suggestSunnyCrystalPart(message) {
  const text = sanitize(message);
  const lower = text.toLowerCase();
  if (!/\b(?:crystal|resonator|quartz|smd|sx[-\s]?\d+)\b/.test(lower)) return null;

  const packageInfo = extractCrystalPackage(text);
  const frequency = extractCrystalFrequency(text);
  if (!packageInfo || !frequency) {
    const tempCode = extractCrystalTempCode(text);
    const loadCap = extractCrystalLoadCap(text);
    if (packageInfo && !frequency && wantsLowestAvailablePpm(text) && tempCode) {
      const stabilityCode = minimumCrystalStabilityCodeForTemp(tempCode);
      const ppm = crystalStabilityCodes[stabilityCode]?.match(/\d+/)?.[0] || "50";
      return {
        reply: normalizePpmText(
          `I can prepare most of this Sunny-Catalog crystal RFQ, but I still need the exact frequency in MHz before generating the P/N. From the catalog table, ${crystalTempCodes[tempCode]} supports lowest available ${crystalStabilityCodes[stabilityCode]} for RFQ review, so I would use code ${stabilityCode} and +/-${ppm}ppm. I also read ${packageInfo.packageName} (${crystalPackageCodes[packageInfo.code]})${loadCap ? ` and ${loadCap} pF CL` : ""}. Please provide the exact frequency, then Sunnychat can create the suggested Sunny-Catalog P/N and open the prefilled quote builder.`,
        ),
        links: [siteLinks.quote, siteLinks.products],
      };
    }
    return null;
  }

  const assumptions = [];
  const loadCap = extractCrystalLoadCap(text) || "12";
  if (!extractCrystalLoadCap(text)) assumptions.push("load capacitance was not provided, so 12 pF was used for quote-builder review");
  const catalogLoadCap = loadCap.padStart(2, "0");

  const tempCode = extractCrystalTempCode(text) || "E";
  if (!extractCrystalTempCode(text)) assumptions.push("operating temp range was not provided, so -20~70C was used as a standard RFQ placeholder");

  const explicitTolerance = extractPpmNear(text, ["tolerance", "tol"]);
  const explicitStabilityCode = extractCrystalStabilityCode(text);
  const inferredLowestStabilityCode = minimumCrystalStabilityCodeForTemp(tempCode);
  const inferredLowestPpm = crystalStabilityCodes[inferredLowestStabilityCode]?.match(/\d+/)?.[0] || "50";
  const useLowestFromCatalog = wantsLowestAvailablePpm(text) && Boolean(tempCode);

  const tolerance = explicitTolerance || (useLowestFromCatalog ? inferredLowestPpm : "50");
  if (!explicitTolerance) {
    assumptions.push(
      useLowestFromCatalog
        ? `frequency tolerance was not provided as a number; because the customer asked for lowest/best and ${crystalTempCodes[tempCode]} was provided, +/-${inferredLowestPpm}ppm was used from the Sunny crystal stability table for RFQ review`
        : "frequency tolerance was not provided, so +/-50ppm was used as a standard RFQ placeholder",
    );
  }

  const stabilityCode = explicitStabilityCode || (useLowestFromCatalog ? inferredLowestStabilityCode : "7");
  if (!explicitStabilityCode) {
    assumptions.push(
      useLowestFromCatalog
        ? `temperature stability was not provided as a number; Sunny catalog table allows ${crystalStabilityCodes[inferredLowestStabilityCode]} for ${crystalTempCodes[tempCode]}, so that lowest available value was used for RFQ review`
        : "temperature stability was not provided, so +/-50ppm was used as a standard RFQ placeholder",
    );
  }

  const partNumber = `S${packageInfo.code}${catalogLoadCap}1${tolerance}${tempCode}${stabilityCode}-${frequency}-T&R`;
  const tempRange = crystalTempCodes[tempCode] || `temp code ${tempCode}`;
  const stability = crystalStabilityCodes[stabilityCode] || `stability code ${stabilityCode}`;
  const href = buildCrystalQuoteHref({
    packageCode: packageInfo.code,
    frequency,
    loadCap,
    tolerance,
    tempCode,
    stabilityCode,
    assumptions,
  });

  const assumptionText = assumptions.length
    ? ` I used these quote placeholders because the customer did not provide every field: ${assumptions.join("; ")}.`
    : "";

  return {
    reply:
      normalizePpmText(`Based on Sunny catalog coding, a suggested RFQ-review P/N is ${partNumber}. This means ${packageInfo.packageName} (${crystalPackageCodes[packageInfo.code]}), ${frequency} MHz, ${loadCap} pF CL, fundamental mode, +/-${tolerance}ppm frequency tolerance at 25 C, ${tempRange} operating temp, and ${stability} temp stability.${assumptionText} Sunny should confirm the final approved P/N, price, stock, lead time, and qualification. I also prepared the instant quote builder so the customer can review the line and click step 5 to send it to Sunny.`),
    links: [{ label: "Open prefilled quote builder", href }, siteLinks.quote],
  };
}

function keywordFallback(message, pagePath = "/") {
  const text = `${message} ${pagePath}`.toLowerCase();
  if (!isSunnychatScopeAllowed(message, pagePath)) return scopeFallback();

  const partExplanation = explainSunnyCrystalPart(message);
  if (partExplanation) return partExplanation;
  const partSuggestion = suggestSunnyCrystalPart(message);
  if (partSuggestion) return partSuggestion;

  if (/rfq|quote|bom|price|pricing|cost|qty|quantity|lead time|lt|견적|가격|납기/.test(text)) {
    return {
      reply:
        "For RFQ support, please prepare the part number, frequency, package, quantity, target date, and any drawing or BOM. For SMD crystals include load capacitance, tolerance/stability, and temperature range; for oscillators include voltage, output type, stability, and enable/disable needs.",
      links: [siteLinks.quote, siteLinks.telegram],
    };
  }

  if (/smd|crystal|quartz|resonator|oscillator|xo|spxo|tcxo|vcxo|ocxo|sx|ats|sco|cs|frequency|mhz|khz|load capacitance|cl|ppm|jitter|stability|electronics component|component|제품|크리스탈|오실레이터/.test(text)) {
    return {
      reply:
        "Sunny can help narrow SMD crystal, tuning-fork crystal, XO/SPXO, TCXO, VCXO, and OCXO RFQ details. Share the part number or target frequency, package size, load capacitance for crystals, voltage/output for oscillators, tolerance or stability, temperature range, and quantity.",
      links: [siteLinks.products, siteLinks.quote],
    };
  }

  if (/document|datasheet|certificate|rohs|reach|quality|spec|drawing|문서|자료|인증|품질/.test(text)) {
    return {
      reply:
        "For datasheets, certificates, drawings, or quality files, use the Documents or Quality page. Private SPA files should only be shared through approved access.",
      links: [siteLinks.documents, siteLinks.quality, siteLinks.access],
    };
  }

  if (/access|spa|portal|login|account|계정|접속|포털/.test(text)) {
    return {
      reply:
        "For SPA access, submit a request with your company name, email, role, and business need. Customer-specific price, stock, order, and lead-time data must stay behind approved access.",
      links: [siteLinks.access],
    };
  }

  if (/telegram|contact|email|urgent|문의|상담|연락/.test(text)) {
    return {
      reply:
        "For direct support, use Telegram or submit the correct RFQ/access form. Do not send passwords, tokens, or sensitive customer files in public chat.",
      links: [siteLinks.telegram, siteLinks.quote, siteLinks.access],
    };
  }

  return {
    reply:
      "I can help with Sunny Electronics RFQs, crystal and oscillator product guidance, document support, lead time questions, and customer access routing. For a quote, start with Request Quote; for direct help, use Telegram.",
    links: [siteLinks.quote, siteLinks.products, siteLinks.telegram],
  };
}

function buildSystemGuide(pagePath) {
  return [
    "You are Sunnychat, the SunnyKR.com assistant for Sunny Electronics.",
    "Strict scope: answer only about Sunny catalogs, Sunny.co.kr, SunnyKR.com, Sunny documents, Sunny frequency-control device products, RFQ, R&D support, and QA support.",
    "Role: knowledgeable Sunny R&D and QA oriented assistant for SMD crystals, quartz crystal units, tuning-fork crystals, resonators, XO/SPXO, TCXO, VCXO, OCXO, RFQ support, document support, sourcing/manufacturing support, and Sunny Electronics information.",
    `If the visitor asks for anything outside this scope, do not answer the unrelated topic. Kindly refer them to sunnykr.com or ${SUNNY_SUPPORT_EMAIL}, and say someone at Sunny will review and get back within 24 hours.`,
    "Do not mention or explain whether Sunnychat is AI, a bot, a model, or a chatbot. Present it simply as Sunny support on the website.",
    "Tone: professional, concise, helpful, human sounding, and business focused.",
    "Sunny way: warm but practical, ask for the missing engineering/RFQ fields, guide the visitor to the right SunnyKR flow, and protect customer-specific information.",
    "Use Sunny brain memory from recent conversation and visitor-provided preferences to keep continuity, but do not claim permanent server memory or reveal private notes.",
    "Keep answers short. Use simple English unless Korean is clearly better for the visitor.",
    "When not proven by Sunny catalog, Sunny website, or provided Sunny documents, phrase engineering output as a suggestion for RFQ review, not a confirmed final answer.",
    "Do not overpromise price, stock, overstock availability, certifications, qualification, lead time, delivery, or order status. Say these require official Sunny confirmation unless a provided Sunny source explicitly proves the public information.",
    "For standard frequencies, standard lead time, public price, or excess inventory, only relay it when Sunny catalog, Sunny website, or provided Sunny data explicitly supports it; otherwise route to RFQ or official Sunny confirmation.",
    "Do not give general advice outside Sunny frequency-control products, and do not make unrelated product, business, legal, financial, medical, coding, or lifestyle suggestions.",
    "Never ask for passwords, tokens, private keys, card numbers, or sensitive personal data.",
    "Do not expose or mention internal infrastructure details such as Ollama, OpenClaw, local ports, Cloudflare tunnel tokens, or API secrets.",
    "Public access must stay frontend to bridge/API to secure tunnel to OpenClaw/Gemma4.",
    "If the user asks for legal, compliance, safety, or financial certainty, advise confirmation with the proper professional or official Sunny document.",
    `Telegram support: ${TELEGRAM_URL}`,
    `Current page: ${pagePath}`,
    "SunnyKR site map:",
    ...siteMap.map((item) => `- ${item}`),
  ].join("\n");
}

function buildPrompt({ message, pagePath, history, memory, catalogGuide }) {
  return [
    buildSystemGuide(pagePath),
    catalogGuide ? `\n${catalogGuide}` : "",
    memory.length
      ? [
          "",
          "Sunny brain memory from this visitor browser:",
          ...memory.map((item) => `- ${item}`),
          "Use this only for continuity. Ignore it if the visitor corrects it.",
        ].join("\n")
      : "",
    "",
    "Recent conversation:",
    ...history.map((item) => `${item.role}: ${item.text}`),
    "",
    "Visitor question:",
    message,
    "",
    "Return only the assistant answer text.",
  ].join("\n");
}

function linksForAnswer(answer, fallbackLinks) {
  const lower = answer.toLowerCase();
  const links = [];
  if (/quote|rfq|bom|price|lead time|quantity/.test(lower)) links.push(siteLinks.quote);
  if (/product|crystal|oscillator|part number|frequency|package/.test(lower)) links.push(siteLinks.products);
  if (/document|datasheet|certificate|quality|rohs|reach/.test(lower)) links.push(siteLinks.documents);
  if (/access|spa|portal|login/.test(lower)) links.push(siteLinks.access);
  if (/telegram|direct support|contact/.test(lower)) links.push(siteLinks.telegram);

  return [...links, ...(fallbackLinks || [])]
    .filter((link, index, all) => all.findIndex((item) => item.href === link.href) === index)
    .slice(0, 3);
}

async function callBridge(payload) {
  const bridgeUrl = getBridgeUrl();
  if (!bridgeUrl) return { reply: "", debug: { reason: "missing_bridge_url" } };

  const controller = new AbortController();
  const startedAt = Date.now();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const token = getBridgeToken();
    const url = new URL(bridgeUrl);
    const response = await fetch(bridgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        reply: "",
        debug: {
          reason: "bridge_http_error",
          status: response.status,
          host: url.host,
          durationMs: Date.now() - startedAt,
        },
      };
    }
    const data = await response.json().catch(() => null);
    const reply = readAssistantText(data);
    return {
      reply,
      debug: {
        reason: reply ? "bridge_ok" : "empty_bridge_reply",
        status: response.status,
        host: url.host,
        durationMs: Date.now() - startedAt,
      },
    };
  } catch (error) {
    let host = "";
    try {
      host = new URL(bridgeUrl).host;
    } catch {
      host = "invalid_url";
    }
    return {
      reply: "",
      debug: {
        reason: error?.name === "AbortError" ? "bridge_timeout" : "bridge_fetch_error",
        errorName: error?.name || "Error",
        host,
        durationMs: Date.now() - startedAt,
      },
    };
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
  const message = sanitize(body.message).slice(0, MAX_MESSAGE_LENGTH);
  const pagePath = readPath(body.pagePath || body.path);
  const history = cleanHistory(body.history);
  const memory = cleanMemory(body.memory);

  if (!message) {
    return res.status(400).json({
      error: "BadRequest",
      message: "Please enter a message.",
    });
  }

  if (!isSunnychatScopeAllowed(message, pagePath)) {
    const fallback = scopeFallback();
    return res.status(200).json({
      reply: fallback.reply,
      links: fallback.links,
      source: "scope",
    });
  }

  const partExplanation = explainSunnyCrystalPart(message);
  if (partExplanation) {
    const payload = {
      reply: partExplanation.reply,
      links: linksForAnswer(partExplanation.reply, partExplanation.links),
      source: "catalog",
    };

    if (req.headers["x-sunny-debug"] === "1") {
      payload.debug = {
        reason: "sunny_catalog_part_number",
        bridgeSkipped: true,
      };
    }

    return res.status(200).json(payload);
  }

  const partSuggestion = suggestSunnyCrystalPart(message);
  if (partSuggestion) {
    const payload = {
      reply: partSuggestion.reply,
      links: partSuggestion.links,
      source: "catalog",
    };

    if (req.headers["x-sunny-debug"] === "1") {
      payload.debug = {
        reason: "sunny_catalog_part_builder",
        bridgeSkipped: true,
      };
    }

    return res.status(200).json(payload);
  }

  const fallback = keywordFallback(message, pagePath);
  const catalogMatches = findCatalogMatches(message, pagePath);
  const catalogGuide = buildCatalogGuide(catalogMatches);
  const matchedLinks = catalogLinks(catalogMatches);
  const bridgeResult = await callBridge({
    project: "sunnykr",
    assistant: "Sunny",
    message,
    systemGuide: buildPrompt({ message, pagePath, history, memory, catalogGuide }),
    history,
    memory,
    pagePath,
  });
  const bridgeReply = bridgeResult.reply;

  const reply = normalizePpmText(bridgeReply || fallback.reply);

  const payload = {
    reply,
    links: linksForAnswer(reply, [...matchedLinks, ...fallback.links]),
    source: bridgeReply ? "bridge" : "fallback",
  };

  if (req.headers["x-sunny-debug"] === "1") {
    payload.debug = {
      bridgeConfigured: Boolean(getBridgeUrl()),
      tokenConfigured: Boolean(getBridgeToken()),
      timeoutMs: getTimeoutMs(),
      catalogMatches: catalogMatches.map((entry) => entry.id),
      bridge: bridgeResult.debug,
    };
  }

  return res.status(200).json(payload);
}
