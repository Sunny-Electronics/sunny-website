import { readJsonBody, sendJson } from "./_public-http.js";

const maxShortField = 200;
const maxLongField = 3000;
const maxSpecs = 30;

function cleanText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function getAssigneeEmails() {
  const configured = process.env.RFQ_ASSIGNEE_EMAILS || "web@sunnykr.com,john@sunny.co.kr";
  const normalized = configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .map((email) => (email === "sunny1@sunny.co.kr" ? "john@sunny.co.kr" : email))
    .filter(Boolean);

  return [...new Set(normalized)];
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RFQ_FROM_EMAIL;
  const assigneeEmails = getAssigneeEmails();

  if (!apiKey || !fromEmail || assigneeEmails.length === 0) {
    sendJson(res, 503, { error: "Quote service is not configured yet." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Invalid request body" });
    return;
  }

  // Honeypot: real users never fill this hidden field.
  if (typeof body?.website === "string" && body.website !== "") {
    sendJson(res, 200, { ok: true });
    return;
  }

  const typeName = cleanText(body?.typeName, maxShortField);
  const quantity = cleanText(body?.quantity, maxShortField);
  const targetDate = cleanText(body?.targetDate, maxShortField);
  const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, maxLongField) : "";
  const contact = {
    name: cleanText(body?.contact?.name, maxShortField),
    company: cleanText(body?.contact?.company, maxShortField),
    email: cleanText(body?.contact?.email, maxShortField),
    phone: cleanText(body?.contact?.phone, maxShortField),
  };
  const specs = Array.isArray(body?.specs)
    ? body.specs
        .slice(0, maxSpecs)
        .map((spec) => ({
          label: cleanText(spec?.label, maxShortField),
          value: cleanText(spec?.value, maxLongField),
        }))
        .filter((spec) => spec.label && spec.value)
    : [];

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
  if (!typeName || !quantity || !contact.name || !emailValid) {
    sendJson(res, 400, { error: "Missing required fields" });
    return;
  }

  const frequency = specs.find((spec) => /frequency/i.test(spec.label))?.value;
  const subjectParts = ["[RFQ]", typeName];
  if (frequency) {
    subjectParts.push(frequency);
  }
  subjectParts.push(contact.company || contact.name);
  const subject = subjectParts.join(" - ");

  const detailRows = [
    ...specs,
    { label: "EAU (Expected Annual Usage)", value: quantity },
    ...(targetDate ? [{ label: "Target date", value: targetDate }] : []),
    ...(notes ? [{ label: "Notes", value: notes }] : []),
    { label: "Name", value: contact.name },
    ...(contact.company ? [{ label: "Company", value: contact.company }] : []),
    { label: "Email", value: contact.email },
    ...(contact.phone ? [{ label: "Phone", value: contact.phone }] : []),
  ];

  const text = [
    `New quote request from sunnykr.com`,
    `Product type: ${typeName}`,
    "",
    ...detailRows.map((row) => `${row.label}: ${row.value}`),
  ].join("\n");

  const html = `
    <h2 style="font-family:Arial,sans-serif;">New quote request — ${escapeHtml(typeName)}</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;">
      ${detailRows
        .map(
          (row) =>
            `<tr><td style="padding:4px 16px 4px 0;color:#64748b;white-space:nowrap;vertical-align:top;">${escapeHtml(
              row.label,
            )}</td><td style="padding:4px 0;">${escapeHtml(row.value)}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#64748b;">
      Sent from the sunnykr.com quote form. Reply to this email to answer the customer directly.
    </p>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: assigneeEmails,
      reply_to: contact.email,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Resend send failed", response.status, detail.slice(0, 500));
    sendJson(res, 502, { error: "Could not deliver the quote request." });
    return;
  }

  sendJson(res, 200, { ok: true });
}
