import { createInsertSchema } from "drizzle-zod";
import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { customersTable } from "./customers";

export const emailProviderEnum = pgEnum("email_provider", [
  "gmail",
  "outlook",
  "pst_import",
  "imap",
  "manual",
]);

export const emailDirectionEnum = pgEnum("email_direction", [
  "inbound",
  "outbound",
]);

export const emailClassificationEnum = pgEnum("email_classification", [
  "rfq",
  "quote_reply",
  "po",
  "qa_document_request",
  "stock_inquiry",
  "general",
  "unknown",
]);

export const emailProcessingStatusEnum = pgEnum("email_processing_status", [
  "new",
  "classified",
  "draft_created",
  "needs_review",
  "approved",
  "sent",
  "processed",
  "failed",
]);

export const emailMessagesTable = pgTable(
  "email_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: emailProviderEnum("provider").notNull().default("gmail"),
    providerMessageId: text("provider_message_id").notNull(),
    providerThreadId: text("provider_thread_id"),
    direction: emailDirectionEnum("direction").notNull().default("inbound"),
    customerId: uuid("customer_id").references(() => customersTable.id),
    fromEmail: text("from_email").notNull(),
    toEmails: text("to_emails").array().notNull().default([]),
    ccEmails: text("cc_emails").array().notNull().default([]),
    subject: text("subject"),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    snippet: text("snippet"),
    bodyText: text("body_text"),
    status: emailProcessingStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    providerMessageIdx: uniqueIndex("email_messages_provider_message_idx").on(
      table.provider,
      table.providerMessageId,
    ),
    customerIdx: index("email_messages_customer_idx").on(table.customerId),
    statusIdx: index("email_messages_status_idx").on(table.status),
  }),
);

export const emailAttachmentsTable = pgTable(
  "email_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    emailMessageId: uuid("email_message_id")
      .notNull()
      .references(() => emailMessagesTable.id),
    providerAttachmentId: text("provider_attachment_id"),
    fileName: text("file_name").notNull(),
    contentType: text("content_type"),
    sizeBytes: integer("size_bytes"),
    storageKey: text("storage_key"),
    scanStatus: text("scan_status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index("email_attachments_email_idx").on(table.emailMessageId),
  }),
);

export const emailClassificationsTable = pgTable(
  "email_classifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    emailMessageId: uuid("email_message_id")
      .notNull()
      .references(() => emailMessagesTable.id),
    classification: emailClassificationEnum("classification").notNull(),
    confidence: numeric("confidence", { precision: 5, scale: 4 })
      .notNull()
      .default("0"),
    extractedFields: jsonb("extracted_fields").notNull().default({}),
    modelName: text("model_name"),
    modelVersion: text("model_version"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index("email_classifications_email_idx").on(
      table.emailMessageId,
    ),
  }),
);

export const insertEmailMessageSchema = createInsertSchema(
  emailMessagesTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailAttachmentSchema = createInsertSchema(
  emailAttachmentsTable,
).omit({ id: true, createdAt: true });
export const insertEmailClassificationSchema = createInsertSchema(
  emailClassificationsTable,
).omit({ id: true, createdAt: true });

export type InsertEmailMessage = z.infer<typeof insertEmailMessageSchema>;
export type EmailMessage = typeof emailMessagesTable.$inferSelect;
export type InsertEmailAttachment = z.infer<
  typeof insertEmailAttachmentSchema
>;
export type EmailAttachment = typeof emailAttachmentsTable.$inferSelect;
export type InsertEmailClassification = z.infer<
  typeof insertEmailClassificationSchema
>;
export type EmailClassification =
  typeof emailClassificationsTable.$inferSelect;
