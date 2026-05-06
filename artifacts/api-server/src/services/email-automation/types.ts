export type EmailAutomationType =
  | "rfq"
  | "quote_reply"
  | "po"
  | "qa_document_request"
  | "stock_inquiry"
  | "general"
  | "unknown";

export type MailboxProviderName =
  | "gmail"
  | "outlook"
  | "pst_import"
  | "imap"
  | "manual";

export interface MailboxMessage {
  provider: MailboxProviderName;
  providerMessageId: string;
  providerThreadId?: string;
  fromEmail: string;
  toEmails: string[];
  ccEmails: string[];
  subject?: string;
  receivedAt?: Date;
  snippet?: string;
  bodyText?: string;
  attachments: MailboxAttachment[];
}

export interface MailboxAttachment {
  providerAttachmentId?: string;
  fileName: string;
  contentType?: string;
  sizeBytes?: number;
}

export interface EmailClassificationResult {
  classification: EmailAutomationType;
  confidence: number;
  extractedFields: Record<string, unknown>;
  needsHumanReview: boolean;
  reviewReason?: string;
}

export interface RfqExtraction {
  customerCode?: string;
  customerEmail: string;
  requestedPartNumber: string;
  quantity: number;
  targetDate?: string;
  notes?: string;
}

export interface PoExtraction {
  customerCode?: string;
  customerEmail: string;
  customerPoNumber: string;
  requestedPartNumber: string;
  quantity: number;
  customerRequestedDate?: string;
}

export interface QaDocumentExtraction {
  customerCode?: string;
  customerEmail: string;
  requestedPartNumber?: string;
  customerPoNumber?: string;
  documentType: string;
  dueDate?: string;
}

export interface MailboxProvider {
  listNewMessages(): Promise<MailboxMessage[]>;
  markProcessed(providerMessageId: string): Promise<void>;
  createDraftReply(
    providerMessageId: string,
    subject: string,
    bodyText: string,
  ): Promise<{ draftId: string }>;
}

export interface EmailClassifier {
  classify(message: MailboxMessage): Promise<EmailClassificationResult>;
}

export interface ReviewTaskDraft {
  type:
    | "rfq_quote"
    | "po_confirmation"
    | "qa_document"
    | "quote_reply"
    | "stock_inquiry"
    | "general_email";
  title: string;
  summary?: string;
  payload: Record<string, unknown>;
}
