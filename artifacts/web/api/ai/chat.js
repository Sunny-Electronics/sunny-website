import fs from "node:fs";

const MAX_MESSAGE_LENGTH = 700;
const MAX_HISTORY_ITEMS = 6;
const MAX_MEMORY_ITEMS = 8;
const MAX_MODEL_MATCHES = 6;
const MAX_CATALOG_CONTEXT_CHARS = 2400;
const DEFAULT_BRIDGE_PATH = "/sunny/chat";
const DEFAULT_TIMEOUT_MS = 18000;
const TELEGRAM_URL = "https://t.me/sunny_kr_bot";
const SUNNY_SUPPORT_EMAIL = "web@sunnykr.com";
const PRODUCTION_BRIDGE_HOST = "bridge.sunnykr.com";

let publicCatalogCache;

export const config = { maxDuration: 30 };

const links = {
  products: { label: "Products", href: "/products" },
  partNumber: { label: "Part Number Generator", href: "/part-number-generator" },
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
  /unrelated project|different project|ollama|cloudflare|127\.0\.0\.1|localhost|bearer token|api key|customer list|buyer list|cost price|buy price|internal margin/i;

const emailAddressPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const currencyPattern = /[$€£¥₩]|\b(?:usd|eur|krw|jpy|cny)\b/i;

function isSensitiveText(value) {
  const text = String(value || "");
  return (
    sensitiveRequestPattern.test(text) ||
    customerTransactionPattern.test(text) ||
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
  return pagePath.startsWith("/") && !pagePath.startsWith("//") ? pagePath : "/";
}

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({ role: sanitize(item?.role, 20), text: sanitize(item?.text, 400) }))
    .filter(
      (item) =>
        item.text &&
        /^(assistant|user)$/i.test(item.role) &&
        !isSensitiveText(item.text) &&
        isSunnyScope(item.text),
    )
    .slice(-MAX_HISTORY_ITEMS);
}

function cleanMemory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitize(item, 180))
    .filter((item) => item && !isSensitiveText(item) && isSunnyScope(item))
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

function normalize(value) {
  return sanitize(value, 1200).toLowerCase();
}

function modelIsMentioned(message, modelName) {
  const escaped = String(modelName || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped ? new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(message) : false;
}

function findModelMatches(message, pagePath = "/") {
  const query = normalize(`${message} ${pagePath}`);
  const terms = query.match(/[a-z0-9.\/+()-]+|[\u3131-\ud79d]+/g) || [];
  return (loadPublicCatalog().models || [])
    .map((model) => {
      const searchable = normalize(
        [model.model, model.family, model.packageType, model.dimensions].filter(Boolean).join(" "),
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

function humanList(items) {
  const values = [...new Set(items.filter(Boolean))];
  if (values.length <= 1) return values[0] || "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function followUpFor(model) {
  if (/oscillator|tcxo|vctcxo|vcxo|xo\b/i.test(`${model.family} ${model.packageType}`)) {
    return "What frequency and output type do you need?";
  }
  if (/filter/i.test(model.family)) return "What center frequency and bandwidth are you targeting?";
  return "What frequency and package requirement are you working with?";
}

function catalogAnswer(message, modelMatches) {
  const text = normalize(message);
  const allModels = loadPublicCatalog().models || [];
  const exact = modelMatches.find((model) => modelIsMentioned(text, model.model));

  if (exact) {
    const size = exact.dimensions ? ` in a ${exact.dimensions} package` : "";
    return {
      reply: `${exact.model} is listed in Sunny's verified catalog as ${exact.packageType}${size}. ${followUpFor(exact)}`,
      links: [links.products, links.partNumber, links.quote],
    };
  }

  if (/oscillator|\bxo\b|spxo|sco|hcsl|lvds|lvpecl/i.test(text)) {
    const models = allModels.filter((model) => model.family === "Crystal Oscillators");
    const types = models.map((model) => model.packageType.replace(/\s+XO$/i, ""));
    const preferred = ["SCO-10", "SCO-53", "SHO-53", "SLO-53", "SPO-53"];
    const available = new Set(models.map((model) => model.model));
    return {
      reply: `Yes—Sunny's catalog includes ${humanList(types)} oscillator families. Common starting points include ${humanList(preferred.filter((model) => available.has(model)))}. What frequency and output type do you need?`,
      links: [links.products, links.partNumber, links.quote],
    };
  }

  if (/tcxo|vctcxo|vcxo/i.test(text)) {
    const examples = allModels
      .filter((model) => model.family === "TCXO & VCTCXO" || model.family === "VCXO")
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

function isSunnyScope(message) {
  const text = normalize(message);
  if (/^(hi|hello|hey|안녕|안녕하세요|help|start|thanks|thank you)\b/.test(text)) return true;
  return /sunny|catalog|catalogue|datasheet|document|certificate|quality|qa|r&d|engineering|rfq|quote|bom|lead time|stock|inventory|price|crystal|quartz|resonator|oscillator|frequency|mhz|khz|smd|sx-|ats-|sco|spxo|tcxo|vcxo|ocxo|load capacitance|\bcl\b|ppm|package|tolerance|stability|temperature|rohs|reach|iatf|iso|part number|p\/n|\bpn\b/.test(text);
}

function publicAnswer(message, modelMatches) {
  const text = normalize(message);

  if (isSensitiveText(text)) {
    return {
      reply: "Private company, customer, pricing, order, and account information is not available through public Sunnychat. For a product-related request, please submit an RFQ.",
      links: [links.quote],
    };
  }

  if (!isSunnyScope(message)) {
    return {
      reply: "I specialize in Sunny frequency-control products, part numbers, published documents, stock quantities, and RFQs. Please use the SunnyKR website sections below for anything Sunny-related.",
      links: [links.products, links.quote, links.documents],
    };
  }

  const grounded = catalogAnswer(message, modelMatches);
  if (grounded) return grounded;

  if (/stock|inventory|available|availability|quantity|qty/.test(text)) {
    return {
      reply: "I can show only Sunny stock number, Sunny part number, and public quantity. Price, delivery, and customer-specific details require an official RFQ.",
      links: [links.stock, links.quote],
    };
  }

  if (/document|datasheet|certificate|iso|iatf|rohs|reach|quality|drawing|reliability/.test(text)) {
    return {
      reply: "I can help find Sunny documents approved for public release. What part number or document type do you need?",
      links: [links.documents, links.quality, links.quote],
    };
  }

  if (/quote|rfq|price|lead time|delivery|bom/.test(text)) {
    return {
      reply: "Sure—send me the Sunny or customer part number if you have it. If not, start with the frequency and quantity, and I'll guide you through the remaining catalog fields one step at a time.",
      links: [links.quote, links.partNumber],
    };
  }

  return {
    reply: "Hi—I'm Sunnychat. I can help you choose Sunny crystals, oscillators, frequency-control parts, documents, and RFQ details. What part number or requirement are you working with?",
    links: [links.products, links.quote, links.telegram],
  };
}

function catalogContext(modelMatches) {
  if (!modelMatches.length) return "";
  return [
    "Verified Sunny public catalog matches:",
    ...modelMatches.map(
      (model) => `- ${model.model}: ${model.family}; ${model.packageType}${model.dimensions ? `; ${model.dimensions}` : ""}`,
    ),
  ].join("\n").slice(0, MAX_CATALOG_CONTEXT_CHARS);
}

function getBridgeConfig() {
  const rawUrl = String(process.env.SUNNY_AI_BRIDGE_URL || "").trim();
  const token = String(process.env.SUNNY_AI_BRIDGE_TOKEN || "").trim();
  if (!rawUrl || !token) return { enabled: false };

  try {
    const url = new URL(rawUrl);
    const isProduction = process.env.VERCEL_ENV === "production";
    const allowedDevelopmentHost = ["127.0.0.1", "localhost"].includes(url.hostname);
    if (
      isProduction &&
      (url.protocol !== "https:" || url.hostname !== PRODUCTION_BRIDGE_HOST || url.port)
    ) {
      return { enabled: false, invalid: true };
    }
    if (!isProduction && url.hostname !== PRODUCTION_BRIDGE_HOST && !allowedDevelopmentHost) {
      return { enabled: false, invalid: true };
    }
    if (!url.pathname || url.pathname === "/") url.pathname = DEFAULT_BRIDGE_PATH;
    if (url.pathname !== DEFAULT_BRIDGE_PATH) return { enabled: false, invalid: true };
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
    !isSensitiveText(reply) &&
    !emailAddressPattern.test(reply) &&
    !currencyPattern.test(reply)
    ? reply
    : "";
}

async function callSunnyBridge({ message, pagePath, history, memory, modelMatches }) {
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
        catalogContext: catalogContext(modelMatches),
        instructions: [
          "Act as an experienced Sunny frequency-control product specialist.",
          "Use only supplied Sunny public catalog context and public Sunny topics.",
          "Answer directly and naturally, then ask one useful follow-up question.",
          "Never reveal infrastructure, private customer data, prices, costs, orders, accounts, tokens, or internal notes.",
          "Never invent specifications, stock, pricing, lead time, certification, or delivery.",
        ],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    if (data?.project !== "sunnykr" || data?.service !== "sunny-ai-bridge") return null;
    const reply = safeBridgeReply(data?.reply || data?.answer || data?.response || data?.message || data?.content);
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
  if (!message) return res.status(400).json({ error: "BadRequest", message: "Please enter a message." });

  const pagePath = readPath(body.pagePath);
  const history = cleanHistory(body.history);
  const memory = cleanMemory(body.memory);
  const modelMatches = findModelMatches(message, pagePath);
  const fallback = publicAnswer(message, modelMatches);

  if (isSensitiveText(message) || !isSunnyScope(message)) {
    return res.status(200).json({ ...fallback, source: "sunny-public-catalog" });
  }

  const bridgeReply = await callSunnyBridge({ message, pagePath, history, memory, modelMatches });
  if (bridgeReply) {
    return res.status(200).json({ reply: bridgeReply, links: fallback.links, source: "sunny-ai-bridge" });
  }

  return res.status(200).json({ ...fallback, source: "sunny-public-catalog" });
}
