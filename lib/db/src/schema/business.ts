import { createInsertSchema } from "drizzle-zod";
import {
  date,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { partsTable } from "./catalog";
import { customersTable } from "./customers";
import { emailMessagesTable } from "./emails";

export const rfqStatusEnum = pgEnum("rfq_status", [
  "draft",
  "needs_review",
  "quoted",
  "customer_replied",
  "won",
  "lost",
  "closed",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "needs_review",
  "approved",
  "sent",
  "accepted",
  "expired",
  "void",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "needs_review",
  "confirmed",
  "in_production",
  "ready",
  "shipped",
  "closed",
  "cancelled",
]);

export const qaRequestStatusEnum = pgEnum("qa_request_status", [
  "draft",
  "needs_review",
  "waiting_document",
  "ready_to_send",
  "sent",
  "closed",
]);

export const rfqsTable = pgTable(
  "rfqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customersTable.id),
    sourceEmailId: uuid("source_email_id").references(() => emailMessagesTable.id),
    partId: uuid("part_id").references(() => partsTable.id),
    requestedPartNumber: text("requested_part_number").notNull(),
    quantity: integer("quantity").notNull(),
    targetDate: date("target_date"),
    status: rfqStatusEnum("status").notNull().default("draft"),
    notes: text("notes"),
    aiExtractedFields: jsonb("ai_extracted_fields").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    customerIdx: index("rfqs_customer_idx").on(table.customerId),
    statusIdx: index("rfqs_status_idx").on(table.status),
  }),
);

export const quotesTable = pgTable(
  "quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rfqId: uuid("rfq_id")
      .notNull()
      .references(() => rfqsTable.id),
    quoteNumber: text("quote_number"),
    unitPrice: numeric("unit_price", { precision: 12, scale: 4 }),
    currency: text("currency").notNull().default("USD"),
    leadTimeDays: integer("lead_time_days"),
    status: quoteStatusEnum("status").notNull().default("draft"),
    validUntil: date("valid_until"),
    customerMessageDraft: text("customer_message_draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    rfqIdx: index("quotes_rfq_idx").on(table.rfqId),
    statusIdx: index("quotes_status_idx").on(table.status),
  }),
);

export const purchaseOrdersTable = pgTable(
  "purchase_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customersTable.id),
    sourceEmailId: uuid("source_email_id").references(() => emailMessagesTable.id),
    customerPoNumber: text("customer_po_number").notNull(),
    requestedDate: date("requested_date"),
    status: orderStatusEnum("status").notNull().default("draft"),
    aiExtractedFields: jsonb("ai_extracted_fields").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    customerIdx: index("purchase_orders_customer_idx").on(table.customerId),
    poIdx: index("purchase_orders_customer_po_idx").on(table.customerPoNumber),
  }),
);

export const ordersTable = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    purchaseOrderId: uuid("purchase_order_id")
      .notNull()
      .references(() => purchaseOrdersTable.id),
    partId: uuid("part_id").references(() => partsTable.id),
    requestedPartNumber: text("requested_part_number").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 4 }),
    currency: text("currency").notNull().default("USD"),
    customerRequestedDate: date("customer_requested_date"),
    confirmedEtd: date("confirmed_etd"),
    leadTimeDays: integer("lead_time_days"),
    status: orderStatusEnum("status").notNull().default("draft"),
    confirmationDraft: text("confirmation_draft"),
    etdReviewRequired: boolean("etd_review_required").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    poIdx: index("orders_purchase_order_idx").on(table.purchaseOrderId),
    statusIdx: index("orders_status_idx").on(table.status),
  }),
);

export const qaDocumentRequestsTable = pgTable(
  "qa_document_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customersTable.id),
    sourceEmailId: uuid("source_email_id").references(() => emailMessagesTable.id),
    partId: uuid("part_id").references(() => partsTable.id),
    orderId: uuid("order_id").references(() => ordersTable.id),
    requestedPartNumber: text("requested_part_number"),
    documentType: text("document_type").notNull(),
    status: qaRequestStatusEnum("status").notNull().default("draft"),
    responseDraft: text("response_draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    customerIdx: index("qa_document_requests_customer_idx").on(
      table.customerId,
    ),
    statusIdx: index("qa_document_requests_status_idx").on(table.status),
  }),
);

export const insertRfqSchema = createInsertSchema(rfqsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertQuoteSchema = createInsertSchema(quotesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertPurchaseOrderSchema = createInsertSchema(
  purchaseOrdersTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertQaDocumentRequestSchema = createInsertSchema(
  qaDocumentRequestsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertRfq = z.infer<typeof insertRfqSchema>;
export type Rfq = typeof rfqsTable.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotesTable.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrdersTable.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type InsertQaDocumentRequest = z.infer<
  typeof insertQaDocumentRequestSchema
>;
export type QaDocumentRequest = typeof qaDocumentRequestsTable.$inferSelect;
