import fs from "node:fs";

const MAX_MESSAGE_LENGTH = 700;
const MAX_HISTORY_ITEMS = 6;
const MAX_MEMORY_ITEMS = 8;
const DEFAULT_TIMEOUT_MS = 18000;
const MAX_TIMEOUT_MS = 22000;
const DEFAULT_BRIDGE_PATH = "/sunny/chat";
const TELEGRAM_URL = "https://t.me/sunny_kr_bot";
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
      const fields = (entry.rfqFields || catalog.defaultRfqFields || []).slice(0, 8).join(", ");
      const routes = (entry.routes || []).map((route) => `${route.label} ${route.href}`).join("; ");
      return [
        `- ${entry.title}: ${entry.summary}`,
        knownSeries ? `Known series: ${knownSeries}.` : "",
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
  return sanitize(answer);
}

function keywordFallback(message, pagePath = "/") {
  const text = `${message} ${pagePath}`.toLowerCase();

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
    "You are Sunny, the SunnyKR.com assistant for Sunny Electronics.",
    "Role: knowledgeable electronics component assistant for SMD crystals, quartz crystal units, tuning-fork crystals, resonators, XO/SPXO, TCXO, VCXO, OCXO, RFQ support, document support, sourcing/manufacturing support, and Sunny Electronics information.",
    "Tone: professional, concise, helpful, human sounding, and business focused.",
    "Sunny way: warm but practical, ask for the missing engineering/RFQ fields, guide the visitor to the right SunnyKR flow, and protect customer-specific information.",
    "Use Sunny brain memory from recent conversation and visitor-provided preferences to keep continuity, but do not claim permanent server memory or reveal private notes.",
    "Keep answers short. Use simple English unless Korean is clearly better for the visitor.",
    "Do not overpromise price, stock, certifications, qualification, lead time, delivery, or order status. Say these require official Sunny confirmation.",
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

  const reply = bridgeReply || fallback.reply;

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
