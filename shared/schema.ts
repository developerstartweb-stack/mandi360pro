import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Account Master Table
export const accountMaster = pgTable("account_master", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id", { length: 50 }).notNull().unique(), // Auto-generated like "B-SV2501"
  type: varchar("type", { length: 50 }).notNull(), // Buyer/Farmer dropdown
  name: text("name").notNull(),
  mobile: varchar("mobile", { length: 15 }).unique(), // Unique mobile number
  address: text("address"),
  placeId: varchar("place_id", { length: 50 }), // Reference to Place Master
  bankDetails: json("bank_details"), // JSON for bank information
  openingBalance: decimal("opening_balance", { precision: 12, scale: 2 }).default('0'),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default('0'),
  creditTime: integer("credit_time").default(0), // Credit time in days
  remarks: text("remarks"),
  customFields: json("custom_fields"), // JSON for custom fields
  active: boolean("active").default(true), // ActiveToggle
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'), // FY-based
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Product Master Table
export const productMaster = pgTable("product_master", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id", { length: 50 }).notNull().unique(), // Auto-generated like "Onion-01"
  name: text("name").notNull(),
  unit: varchar("unit", { length: 20 }).notNull(), // Dropdown (Kg, Quintal, Bag, etc.)
  customFields: json("custom_fields"), // JSON for custom fields
  active: boolean("active").default(true), // ActiveToggle
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'), // FY-based
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Product Expenses Table
export const productExpenses = pgTable("product_expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id", { length: 50 }).notNull(), // Reference to Product Master
  linkedTo: varchar("linked_to", { length: 20 }).notNull(), // Buyer/Farmer dropdown
  expenseName: varchar("expense_name", { length: 50 }).notNull(), // Commission, Market Fee, Hamali, etc.
  expenseType: varchar("expense_type", { length: 20 }).notNull(), // %/Fixed/Per Bag dropdown
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  customFields: json("custom_fields"), // JSON for custom fields
  active: boolean("active").default(true), // ActiveToggle
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'), // FY-based
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Place Master Table
export const placeMaster = pgTable("place_master", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  placeId: varchar("place_id", { length: 50 }).notNull().unique(), // Auto-generated like "PLC-01"
  name: text("name").notNull(),
  description: text("description"),
  customFields: json("custom_fields"), // JSON for custom fields
  active: boolean("active").default(true), // ActiveToggle
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'), // FY-based
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Schema validations for Account Master
export const insertAccountMasterSchema = createInsertSchema(accountMaster).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAccountMasterSchema = insertAccountMasterSchema.partial().omit({
  accountId: true, // Don't allow updating auto-generated ID
});

export type InsertAccountMaster = z.infer<typeof insertAccountMasterSchema>;
export type UpdateAccountMaster = z.infer<typeof updateAccountMasterSchema>;
export type AccountMaster = typeof accountMaster.$inferSelect;

// Schema validations for Product Master
export const insertProductMasterSchema = createInsertSchema(productMaster).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductMasterSchema = insertProductMasterSchema.partial().omit({
  productId: true, // Don't allow updating auto-generated ID
});

export type InsertProductMaster = z.infer<typeof insertProductMasterSchema>;
export type UpdateProductMaster = z.infer<typeof updateProductMasterSchema>;
export type ProductMaster = typeof productMaster.$inferSelect;

// Schema validations for Product Expenses
export const insertProductExpensesSchema = createInsertSchema(productExpenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductExpensesSchema = insertProductExpensesSchema.partial();

export type InsertProductExpenses = z.infer<typeof insertProductExpensesSchema>;
export type UpdateProductExpenses = z.infer<typeof updateProductExpensesSchema>;
export type ProductExpenses = typeof productExpenses.$inferSelect;

// Schema validations for Place Master
export const insertPlaceMasterSchema = createInsertSchema(placeMaster).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePlaceMasterSchema = insertPlaceMasterSchema.partial().omit({
  placeId: true, // Don't allow updating auto-generated ID
});

export type InsertPlaceMaster = z.infer<typeof insertPlaceMasterSchema>;
export type UpdatePlaceMaster = z.infer<typeof updatePlaceMasterSchema>;
export type PlaceMaster = typeof placeMaster.$inferSelect;
