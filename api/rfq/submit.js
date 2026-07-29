const maxFiles = 3;
const maxFileSizeBytes = 1 * 1024 * 1024;
const maxTotalFileSizeBytes = 3 * 1024 * 1024;

function getAssignedEmails() {
  return (process.env.RFQ_ASSIGNEE_EMAILS || "web@sunnykr.com,john@sunny.co.kr")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function validateRequest(body) {
  if (!body || typeof body !== "object") return "Request body is required.";
  if (!body.contact || typeof body.contact !== "object") return "Contact details are required.";
  if (!body.contact.email || typeof body.contact.email !== "string") return "Visitor email is required.";
  if (!Array.isArray(body.quoteLines) || body.quoteLines.length === 0) return "At least one quote line is required.";
  if (body.quoteLines.length > 30) return "Quote list is too large. Please send 30 lines or fewer.";
  if (body.attachments && !Array.isArray(body.attachments)) return "Attachments must be an array.";

  const attachments = body.attachments || [];
  if (attachments.length > maxFiles) return `Attach up to ${maxFiles} PDF files.`;

  const nonPdfFile = attachments.find((file) => {
    const name = String(file.name || "").toLowerCase();
    const type = String(file.type || "").toLowerCase();
    return type !== "application/pdf" && !name.endsWith(".pdf");
  });
  if (nonPdfFile) return `${nonPdfFile.name || "Attached file"} is not a PDF. Please attach small PDF files only.`;

  const totalSize = attachments.reduce((sum, file) => sum + Number(file.size || 0), 0);
  if (totalSize > maxTotalFileSizeBytes) return "Total attachment size is too large.";

  const oversizedFile = attachments.find((file) => Number(file.size || 0) > maxFileSizeBytes);
  if (oversizedFile) return `${oversizedFile.name || "Attached file"} is too large. Limit is 1 MB per PDF.`;

  return undefined;
}

function buildEmailHtml(body) {
  const contact = body.contact;
  const rows = body.quoteLines
    .map(
      (line, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(line.family || "-")}</td>
          <td><strong>${escapeHtml(line.partNumber || "-")}</strong></td>
          <td>${escapeHtml(line.packageType || "-")}</td>
          <td>${escapeHtml(line.frequency || "-")}</td>
          <td>${escapeHtml(line.spec || "-")}</td>
          <td>${escapeHtml(line.quantity || "-")}</td>
          <td>${escapeHtml(line.note || "-")}</td>
        </tr>`,
    )
    .join("");

  return `
    <h2>SunnyKR RFQ Request</h2>
    <h3>Contact</h3>
    <p>
      <strong>Company / Name:</strong> ${escapeHtml(contact.company || "-")}<br>
      <strong>Email:</strong> ${escapeHtml(contact.email || "-")}<br>
      <strong>Industry / Application:</strong> ${escapeHtml(contact.industry || "-")}<br>
      <strong>Target Annual Quantity:</strong> ${escapeHtml(contact.annualQuantity || "-")}<br>
      <strong>Notes:</strong> ${escapeHtml(contact.notes || "-")}
    </p>
    <h3>Quote Lines</h3>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>#</th>
          <th>Family</th>
          <th>Sunny-Catalog P/N</th>
          <th>Package</th>
          <th>Frequency</th>
          <th>Spec</th>
          <th>Qty</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function createAdminReviewTask(body, assignedEmails) {
  if (!process.env.DATABASE_URL) {
    return { stored: false, reason: "DATABASE_URL is not configured." };
  }

  const { db, adminReviewTasksTable } = await import("@workspace/db");
  const contact = body.contact;
  const firstLine = body.quoteLines[0] || {};
  const lineCount = body.quoteLines.length;
  const requester = contact.company || contact.email;

  const [task] = await db
    .insert(adminReviewTasksTable)
    .values({
      type: "rfq_quote",
      status: "open",
      title: `Website RFQ - ${requester}`,
      summary: `${lineCount} quote line${lineCount === 1 ? "" : "s"} from ${contact.email}. First part: ${
        firstLine.partNumber || "-"
      }.`,
      relatedRecordType: "website_rfq",
      payload: {
        source: "request-quote",
        contact,
        quoteLines: body.quoteLines,
        attachments: (body.attachments || []).map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      },
      assignedTo: assignedEmails.join(", "),
    })
    .returning();

  return { stored: true, id: task.id };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const validationError = validateRequest(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RFQ_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  const assignedEmails = getAssignedEmails();

  if (!apiKey || !from) {
    res.status(503).json({
      error: "RFQ email sending is not configured yet. Set RESEND_API_KEY and RFQ_FROM_EMAIL on the server.",
    });
    return;
  }

  const contact = req.body.contact;
  const subject = `SunnyKR RFQ Request - ${contact.company || contact.email} - ${new Date().toISOString().slice(0, 10)}`;
  const attachments = (req.body.attachments || []).map((file) => ({
    filename: file.name,
    content: file.content,
  }));
  let adminRecord;

  try {
    adminRecord = await createAdminReviewTask(req.body, assignedEmails);
  } catch (error) {
    res.status(502).json({
      error: "RFQ could not be added to the admin review queue.",
      detail: error instanceof Error ? error.message : "Unknown admin queue error.",
    });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: assignedEmails,
      reply_to: contact.email,
      subject,
      html: buildEmailHtml(req.body),
      attachments,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    res.status(502).json({ error: "RFQ email could not be sent.", detail });
    return;
  }

  const result = await response.json().catch(() => ({}));
  res.status(200).json({ ok: true, id: result.id, assignedEmails, adminRecord });
}
