import { createInsertSchema } from "drizzle-zod";
import {
  index,
  integer,
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

export const stockVisibilityEnum = pgEnum("stock_visibility", [
  "admin_only",
  "all_customers",
  "assigned_customers",
]);

export const partsTable = pgTable(
  "parts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    partNumber: text("part_number").notNull(),
    description: text("description"),
    family: text("family"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    partNumberIdx: uniqueIndex("parts_part_number_idx").on(table.partNumber),
  }),
);

export const stockItemsTable = pgTable(
  "stock_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    partId: uuid("part_id")
      .notNull()
      .references(() => partsTable.id),
    availableQuantity: integer("available_quantity").notNull().default(0),
    reservedQuantity: integer("reserved_quantity").notNull().default(0),
    visibility: stockVisibilityEnum("visibility")
      .notNull()
      .default("admin_only"),
    location: text("location"),
    notes: text("notes"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    partIdx: index("stock_items_part_idx").on(table.partId),
  }),
);

export const leadTimesTable = pgTable(
  "lead_times",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    partId: uuid("part_id").references(() => partsTable.id),
    partFamily: text("part_family"),
    leadTimeDays: integer("lead_time_days").notNull(),
    note: text("note"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    partIdx: index("lead_times_part_idx").on(table.partId),
    familyIdx: index("lead_times_family_idx").on(table.partFamily),
  }),
);

export const customerPriceRulesTable = pgTable(
  "customer_price_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customersTable.id),
    partId: uuid("part_id").references(() => partsTable.id),
    partFamily: text("part_family"),
    unitPrice: numeric("unit_price", { precision: 12, scale: 4 }),
    currency: text("currency").notNull().default("USD"),
    formulaCode: text("formula_code"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    customerIdx: index("customer_price_rules_customer_idx").on(
      table.customerId,
    ),
    partIdx: index("customer_price_rules_part_idx").on(table.partId),
  }),
);

export const insertPartSchema = createInsertSchema(partsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertStockItemSchema = createInsertSchema(stockItemsTable).omit({
  id: true,
  updatedAt: true,
});
export const insertLeadTimeSchema = createInsertSchema(leadTimesTable).omit({
  id: true,
  effectiveFrom: true,
  updatedAt: true,
});
export const insertCustomerPriceRuleSchema = createInsertSchema(
  customerPriceRulesTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertPart = z.infer<typeof insertPartSchema>;
export type Part = typeof partsTable.$inferSelect;
export type InsertStockItem = z.infer<typeof insertStockItemSchema>;
export type StockItem = typeof stockItemsTable.$inferSelect;
export type InsertLeadTime = z.infer<typeof insertLeadTimeSchema>;
export type LeadTime = typeof leadTimesTable.$inferSelect;
export type InsertCustomerPriceRule = z.infer<
  typeof insertCustomerPriceRuleSchema
>;
export type CustomerPriceRule = typeof customerPriceRulesTable.$inferSelect;

