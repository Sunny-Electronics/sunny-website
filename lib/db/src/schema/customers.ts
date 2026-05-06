import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const customerStatusEnum = pgEnum("customer_status", [
  "active",
  "paused",
  "prospect",
  "archived",
]);

export const customerTypeEnum = pgEnum("customer_type", [
  "existing",
  "new",
  "internal",
]);

export const contactRoleEnum = pgEnum("contact_role", [
  "buyer",
  "engineer",
  "qa",
  "finance",
  "admin",
  "other",
]);

export const customersTable = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    type: customerTypeEnum("type").notNull().default("new"),
    status: customerStatusEnum("status").notNull().default("prospect"),
    billingEmail: text("billing_email"),
    domain: text("domain"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex("customers_code_idx").on(table.code),
    domainIdx: index("customers_domain_idx").on(table.domain),
  }),
);

export const customerContactsTable = pgTable(
  "customer_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customersTable.id),
    email: text("email").notNull(),
    name: text("name"),
    role: contactRoleEnum("role").notNull().default("buyer"),
    isPortalUser: boolean("is_portal_user").notNull().default(false),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("customer_contacts_email_idx").on(table.email),
    customerIdx: index("customer_contacts_customer_idx").on(table.customerId),
  }),
);

export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertCustomerContactSchema = createInsertSchema(
  customerContactsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;
export type InsertCustomerContact = z.infer<typeof insertCustomerContactSchema>;
export type CustomerContact = typeof customerContactsTable.$inferSelect;

