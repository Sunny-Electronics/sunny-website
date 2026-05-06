import { createInsertSchema } from "drizzle-zod";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { customersTable } from "./customers";
import { emailMessagesTable } from "./emails";

export const reviewTaskTypeEnum = pgEnum("review_task_type", [
  "rfq_quote",
  "po_confirmation",
  "qa_document",
  "quote_reply",
  "stock_inquiry",
  "general_email",
]);

export const reviewTaskStatusEnum = pgEnum("review_task_status", [
  "open",
  "approved",
  "rejected",
  "sent",
  "closed",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "email_ingested",
  "email_classified",
  "draft_created",
  "admin_approved",
  "email_sent",
  "record_updated",
  "security_event",
]);

export const adminReviewTasksTable = pgTable(
  "admin_review_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: reviewTaskTypeEnum("type").notNull(),
    status: reviewTaskStatusEnum("status").notNull().default("open"),
    customerId: uuid("customer_id").references(() => customersTable.id),
    sourceEmailId: uuid("source_email_id").references(() => emailMessagesTable.id),
    title: text("title").notNull(),
    summary: text("summary"),
    relatedRecordType: text("related_record_type"),
    relatedRecordId: uuid("related_record_id"),
    payload: jsonb("payload").notNull().default({}),
    assignedTo: text("assigned_to"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusIdx: index("admin_review_tasks_status_idx").on(table.status),
    customerIdx: index("admin_review_tasks_customer_idx").on(table.customerId),
  }),
);

export const auditEventsTable = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    action: auditActionEnum("action").notNull(),
    actorType: text("actor_type").notNull().default("system"),
    actorId: text("actor_id"),
    customerId: uuid("customer_id").references(() => customersTable.id),
    sourceEmailId: uuid("source_email_id").references(() => emailMessagesTable.id),
    targetType: text("target_type"),
    targetId: uuid("target_id"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    actionIdx: index("audit_events_action_idx").on(table.action),
    customerIdx: index("audit_events_customer_idx").on(table.customerId),
    targetIdx: index("audit_events_target_idx").on(
      table.targetType,
      table.targetId,
    ),
  }),
);

export const insertAdminReviewTaskSchema = createInsertSchema(
  adminReviewTasksTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAuditEventSchema = createInsertSchema(auditEventsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAdminReviewTask = z.infer<
  typeof insertAdminReviewTaskSchema
>;
export type AdminReviewTask = typeof adminReviewTasksTable.$inferSelect;
export type InsertAuditEvent = z.infer<typeof insertAuditEventSchema>;
export type AuditEvent = typeof auditEventsTable.$inferSelect;

