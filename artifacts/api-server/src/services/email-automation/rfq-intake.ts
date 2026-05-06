import { and, eq } from "drizzle-orm";
import type {
  EmailClassificationResult,
  MailboxAttachment,
  MailboxMessage,
  RfqExtraction,
} from "./types";
import { getSunnyKrProjectFilesConfig } from "./project-files";

type DbModule = typeof import("@workspace/db");

export interface RfqIntakeResult {
  emailMessageId: string;
  classification: EmailClassificationResult;
  customerId?: string;
  rfqId?: string;
  quoteId?: string;
  reviewTaskId: string;
}

export interface IncomingRfqMessage {
  providerMessageId: string;
  providerThreadId?: string;
  fromEmail: string;
  toEmails?: string[];
  ccEmails?: string[];
  subject?: string;
  receivedAt?: string;
  snippet?: string;
  bodyText?: string;
  attachments?: MailboxAttachment[];
}

const RFQ_TERMS = [
  "rfq",
  "request for quote",
  "quote",
  "quotation",
  "price",
  "pricing",
];

const PART_PATTERNS = [
  /\b[A-Z]{1,5}[- ]?\d{1,4}[A-Z0-9-]{0,12}\b/i,
  /\b(?:part|p\/n|pn|model|item)\s*(?:no\.?|number|#|:)?\s*([A-Z0-9][A-Z0-9._/-]{2,})\b/i,
];

interface ReviewTaskValues {
  type: "rfq_quote" | "general_email";
  title: string;
  summary?: string;
  customerId?: string;
  sourceEmailId?: string;
  relatedRecordType?: string;
  relatedRecordId?: string;
  payload: Record<string, unknown>;
}

export function toMailboxMessage(input: IncomingRfqMessage): MailboxMessage {
  return {
    provider: "gmail",
    providerMessageId: input.providerMessageId,
    providerThreadId: input.providerThreadId,
    fromEmail: input.fromEmail,
    toEmails: input.toEmails ?? [],
    ccEmails: input.ccEmails ?? [],
    subject: input.subject,
    receivedAt: input.receivedAt ? new Date(input.receivedAt) : undefined,
    snippet: input.snippet,
    bodyText: input.bodyText,
    attachments: input.attachments ?? [],
  };
}

export function classifyRfqMessage(
  message: MailboxMessage,
): EmailClassificationResult {
  const content = `${message.subject ?? ""}\n${message.snippet ?? ""}\n${
    message.bodyText ?? ""
  }`;
  const normalized = content.toLowerCase();
  const quantity = extractQuantity(content);
  const partNumber = extractPartNumber(content);
  const looksLikeRfq = RFQ_TERMS.some((term) => normalized.includes(term));
  const hasCoreFields = Boolean(partNumber && quantity);
  const classification = looksLikeRfq || hasCoreFields ? "rfq" : "unknown";
  const confidence =
    classification === "rfq"
      ? Math.min(
          0.95,
          0.45 +
            (looksLikeRfq ? 0.25 : 0) +
            (partNumber ? 0.15 : 0) +
            (quantity ? 0.1 : 0),
        )
      : 0.2;

  const extractedFields: Partial<RfqExtraction> = {
    customerEmail: message.fromEmail,
    requestedPartNumber: partNumber,
    quantity,
    targetDate: extractTargetDate(content),
    notes: message.bodyText?.slice(0, 2000),
  };

  return {
    classification,
    confidence,
    extractedFields,
    needsHumanReview: true,
    reviewReason:
      classification === "rfq"
        ? "RFQ intake requires admin approval before quote/send."
        : "Message could not be confidently classified as an RFQ.",
  };
}

export async function processGmailRfqIntake(
  input: IncomingRfqMessage,
): Promise<RfqIntakeResult> {
  const message = toMailboxMessage(input);
  const classification = classifyRfqMessage(message);
  const projectFiles = getSunnyKrProjectFilesConfig();
  const dbModule = await import("@workspace/db");
  const existingEmail = await findExistingEmail(
    dbModule,
    message.providerMessageId,
  );

  if (existingEmail) {
    const reviewTask = await createReviewTask(dbModule, {
      type: "general_email",
      title: `Duplicate Gmail RFQ intake: ${message.subject ?? message.fromEmail}`,
      summary:
        "This Gmail message was already ingested. No duplicate RFQ was created.",
      sourceEmailId: existingEmail.id,
      payload: {
        providerMessageId: message.providerMessageId,
        classification,
        projectFiles,
      },
    });

    return {
      emailMessageId: existingEmail.id,
      classification,
      reviewTaskId: reviewTask.id,
    };
  }

  const [emailMessage] = await dbModule.db
    .insert(dbModule.emailMessagesTable)
    .values({
      provider: "gmail",
      providerMessageId: message.providerMessageId,
      providerThreadId: message.providerThreadId,
      fromEmail: message.fromEmail,
      toEmails: message.toEmails,
      ccEmails: message.ccEmails,
      subject: message.subject,
      receivedAt: message.receivedAt,
      snippet: message.snippet,
      bodyText: message.bodyText,
      status: "classified",
    })
    .returning();

  for (const attachment of message.attachments) {
    await dbModule.db.insert(dbModule.emailAttachmentsTable).values({
      emailMessageId: emailMessage.id,
      providerAttachmentId: attachment.providerAttachmentId,
      fileName: attachment.fileName,
      contentType: attachment.contentType,
      sizeBytes: attachment.sizeBytes,
    });
  }

  await dbModule.db.insert(dbModule.emailClassificationsTable).values({
    emailMessageId: emailMessage.id,
    classification: classification.classification,
    confidence: classification.confidence.toFixed(4),
    extractedFields: classification.extractedFields,
    modelName: "sunny-rfq-heuristic",
  });

  await dbModule.db.insert(dbModule.auditEventsTable).values({
    action: "email_ingested",
    sourceEmailId: emailMessage.id,
    targetType: "email_message",
    targetId: emailMessage.id,
    metadata: {
      provider: "gmail",
      providerMessageId: message.providerMessageId,
    },
  });

  if (classification.classification !== "rfq") {
    const reviewTask = await createReviewTask(dbModule, {
      type: "general_email",
      title: `Review Gmail message: ${message.subject ?? message.fromEmail}`,
      summary: classification.reviewReason,
      sourceEmailId: emailMessage.id,
      payload: { classification, projectFiles },
    });

    return {
      emailMessageId: emailMessage.id,
      classification,
      reviewTaskId: reviewTask.id,
    };
  }

  const extraction = classification.extractedFields as Partial<RfqExtraction>;
  const customer = await findOrCreateProspectCustomer(
    dbModule,
    message.fromEmail,
  );
  const [rfq] = await dbModule.db
    .insert(dbModule.rfqsTable)
    .values({
      customerId: customer.id,
      sourceEmailId: emailMessage.id,
      requestedPartNumber: extraction.requestedPartNumber ?? "UNKNOWN",
      quantity: extraction.quantity ?? 0,
      targetDate: extraction.targetDate,
      status: "needs_review",
      notes: extraction.notes,
      aiExtractedFields: classification.extractedFields,
    })
    .returning();

  const [quote] = await dbModule.db
    .insert(dbModule.quotesTable)
    .values({
      rfqId: rfq.id,
      status: "needs_review",
      customerMessageDraft: buildQuoteDraft(message, extraction),
    })
    .returning();

  const [updatedEmail] = await dbModule.db
    .update(dbModule.emailMessagesTable)
    .set({
      customerId: customer.id,
      status: "needs_review",
      updatedAt: new Date(),
    })
    .where(eq(dbModule.emailMessagesTable.id, emailMessage.id))
    .returning();

  await dbModule.db.insert(dbModule.auditEventsTable).values({
    action: "email_classified",
    customerId: customer.id,
    sourceEmailId: updatedEmail.id,
    targetType: "rfq",
    targetId: rfq.id,
    metadata: { classification },
  });

  const reviewTask = await createReviewTask(dbModule, {
    type: "rfq_quote",
    customerId: customer.id,
    sourceEmailId: updatedEmail.id,
    title: `RFQ review: ${extraction.requestedPartNumber ?? message.subject ?? message.fromEmail}`,
    summary: `Part: ${extraction.requestedPartNumber ?? "Unknown"}; Qty: ${
      extraction.quantity ?? "Unknown"
    }; Customer: ${message.fromEmail}`,
    relatedRecordType: "quote",
    relatedRecordId: quote.id,
    payload: {
      rfqId: rfq.id,
      quoteId: quote.id,
      extractedFields: classification.extractedFields,
      draft: quote.customerMessageDraft,
      projectFiles,
    },
  });

  return {
    emailMessageId: updatedEmail.id,
    classification,
    customerId: customer.id,
    rfqId: rfq.id,
    quoteId: quote.id,
    reviewTaskId: reviewTask.id,
  };
}

async function findExistingEmail(
  dbModule: DbModule,
  providerMessageId: string,
) {
  const [existingEmail] = await dbModule.db
    .select()
    .from(dbModule.emailMessagesTable)
    .where(
      and(
        eq(dbModule.emailMessagesTable.provider, "gmail"),
        eq(dbModule.emailMessagesTable.providerMessageId, providerMessageId),
      ),
    )
    .limit(1);

  return existingEmail;
}

async function findOrCreateProspectCustomer(
  dbModule: DbModule,
  fromEmail: string,
) {
  const domain = extractDomain(fromEmail);
  const [byContact] = await dbModule.db
    .select({ customer: dbModule.customersTable })
    .from(dbModule.customerContactsTable)
    .innerJoin(
      dbModule.customersTable,
      eq(dbModule.customerContactsTable.customerId, dbModule.customersTable.id),
    )
    .where(eq(dbModule.customerContactsTable.email, fromEmail.toLowerCase()))
    .limit(1);

  if (byContact?.customer) {
    return byContact.customer;
  }

  const [byDomain] = await dbModule.db
    .select()
    .from(dbModule.customersTable)
    .where(eq(dbModule.customersTable.domain, domain))
    .limit(1);

  if (byDomain) {
    return byDomain;
  }

  const [customer] = await dbModule.db
    .insert(dbModule.customersTable)
    .values({
      code: `AUTO-${domain.replace(/[^a-z0-9]/gi, "-").toUpperCase()}`,
      name: domain,
      type: "new",
      status: "prospect",
      domain,
      billingEmail: fromEmail.toLowerCase(),
      notes:
        "Created automatically from Gmail RFQ intake. Admin should verify.",
    })
    .returning();

  await dbModule.db.insert(dbModule.customerContactsTable).values({
    customerId: customer.id,
    email: fromEmail.toLowerCase(),
    role: "buyer",
    isPrimary: true,
  });

  return customer;
}

async function createReviewTask(dbModule: DbModule, values: ReviewTaskValues) {
  const [reviewTask] = await dbModule.db
    .insert(dbModule.adminReviewTasksTable)
    .values(values)
    .returning();
  return reviewTask;
}

function extractPartNumber(content: string) {
  for (const pattern of PART_PATTERNS) {
    const match = pattern.exec(content);
    const value = match?.[1] ?? match?.[0];
    if (value) {
      return value.trim().replace(/\s+/g, "-").toUpperCase();
    }
  }

  return undefined;
}

function extractQuantity(content: string) {
  const quantityMatch =
    /\b(?:qty|quantity)\s*(?:[:#-]|\bis\b)?\s*([0-9][0-9,]*)\b/i.exec(
      content,
    ) ?? /\b([0-9][0-9,]*)\s*(?:pcs|pieces|ea|units)\b/i.exec(content);

  if (!quantityMatch?.[1]) {
    return undefined;
  }

  const quantity = Number(quantityMatch[1].replace(/,/g, ""));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : undefined;
}

function extractTargetDate(content: string) {
  const dateMatch =
    /\b(?:target|needed|required|delivery|due|by)\s*(?:date|on|by|:)?\s*(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b/i.exec(
      content,
    ) ?? /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b/.exec(content);

  return dateMatch?.[1]?.replace(/[/.]/g, "-");
}

function extractDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() ?? "unknown.local";
}

function buildQuoteDraft(
  message: MailboxMessage,
  extraction: Partial<RfqExtraction>,
) {
  return [
    `Dear ${message.fromEmail},`,
    "",
    "Thank you for your RFQ.",
    `Part number: ${extraction.requestedPartNumber ?? "[admin review needed]"}`,
    `Quantity: ${extraction.quantity ?? "[admin review needed]"}`,
    "",
    "Sunny Electronics will review pricing, lead time, and availability before confirming this quotation.",
    "",
    "Best regards,",
    "Sunny Electronics",
  ].join("\n");
}
