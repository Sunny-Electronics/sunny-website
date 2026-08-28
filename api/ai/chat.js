const MAX_MESSAGE_LENGTH = 700;
const TELEGRAM_URL = "https://t.me/sunny_kr_bot";

export const config = { maxDuration: 10 };

const links = {
  products: { label: "Products", href: "/products" },
  partNumber: { label: "Part Number Generator", href: "/part-number-generator" },
  stock: { label: "Stock", href: "/stock" },
  quote: { label: "Request Quote", href: "/request-quote" },
  documents: { label: "Documents", href: "/documents" },
  quality: { label: "Quality", href: "/quality" },
  telegram: { label: "Telegram", href: TELEGRAM_URL },
};

function sanitize(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
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

function publicAnswer(message) {
  const text = message.toLowerCase();

  if (/private|confidential|admin|portal|login|password|customer list|buyer list|order list|purchase order|margin|cost price|buy price|sold price|receivable|a\/r|iou/.test(text)) {
    return {
      reply: "Private company, customer, pricing, order, and account information is not available on the public website. For a product-related request, please submit an RFQ.",
      links: [links.quote],
    };
  }

  if (/stock|inventory|available|availability|quantity|qty/.test(text)) {
    return {
      reply: "The public Stock page shows only Sunny stock number, Sunny part number, and quantity. Price, delivery, and other commercial details require an official RFQ.",
      links: [links.stock, links.quote],
    };
  }

  if (/document|datasheet|certificate|iso|iatf|rohs|reach|quality|drawing|reliability/.test(text)) {
    return {
      reply: "Open the Documents page for Sunny files approved for public release. Use the RFQ form when you need a product-specific or project-specific document review.",
      links: [links.documents, links.quality, links.quote],
    };
  }

  if (/quote|rfq|price|lead time|delivery|bom/.test(text)) {
    return {
      reply: "For an official quotation, send the Sunny or cross-reference part number, quantity, target date, application, and required specifications through the RFQ form.",
      links: [links.quote, links.partNumber],
    };
  }

  if (/part number|p\/n|\bpn\b|crystal|quartz|oscillator|frequency|mhz|khz|ppm|load capacitance|package|sx-|ats-|sco|spxo|tcxo|vcxo|ocxo/.test(text)) {
    return {
      reply: "Sunny supports crystal units and oscillator families. For review, provide frequency, package, tolerance or stability, operating temperature, load capacitance for crystals, voltage/output for oscillators, and quantity. Final part numbers require Sunny confirmation.",
      links: [links.products, links.partNumber, links.quote],
    };
  }

  if (/telegram|contact|email|support|help|hello|\bhi\b|안녕|문의|연락/.test(text)) {
    return {
      reply: "Sunny can help with public product information, part-number guidance, stock numbers and quantities, documents, and RFQs. Do not send passwords or confidential files through public chat.",
      links: [links.products, links.quote, links.telegram],
    };
  }

  return {
    reply: "I can help only with Sunny public product information, part-number guidance, stock numbers and quantities, published documents, and RFQs.",
    links: [links.products, links.stock, links.quote],
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "MethodNotAllowed" });
  }

  const message = sanitize(parseBody(req).message);
  if (!message) {
    return res.status(400).json({ error: "BadRequest", message: "Please enter a message." });
  }

  const answer = publicAnswer(message);
  return res.status(200).json({ ...answer, source: "public-guidance" });
}
