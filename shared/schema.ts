import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, json, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
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

// Inventory Tables

// Lot Entry Table
export const lotEntry = pgTable("lot_entry", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lotId: varchar("lot_id", { length: 50 }).notNull().unique(), // Auto: "Onion25-10-0"
  arrivingDate: timestamp("arriving_date").notNull(),
  transportName: varchar("transport_name", { length: 100 }).notNull(), // Dropdown/searchable
  placeId: varchar("place_id", { length: 50 }).notNull(), // Auto from Place Master
  productId: varchar("product_id", { length: 50 }).notNull(), // Dropdown
  totalQuantity: decimal("total_quantity", { precision: 12, scale: 2 }).notNull(),
  freight: decimal("freight", { precision: 12, scale: 2 }).notNull(),
  advance: json("advance"), // JSON for advance payments
  otherExpenses: json("other_expenses"), // JSON for other expenses
  totalWeight: decimal("total_weight", { precision: 12, scale: 2 }), // Auto or manual
  averageWeight: decimal("average_weight", { precision: 12, scale: 2 }), // Auto: totalWeight/totalQuantity
  customFields: json("custom_fields"), // JSON for custom fields
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Lot Entry Sub-Fields Table (Farmer/Agent entries)
export const lotEntrySubFields = pgTable("lot_entry_sub_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lotId: varchar("lot_id", { length: 50 }).notNull(), // Reference to Lot Entry
  farmerAgentId: varchar("farmer_agent_id", { length: 50 }).notNull(), // Reference to Account Master
  productId: varchar("product_id", { length: 50 }).notNull(), // Auto from parent lot
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull(),
  quality: text("quality"), // Text description
  weight: decimal("weight", { precision: 12, scale: 2 }), // Auto: average * farmer quantity
  freight: decimal("freight", { precision: 12, scale: 2 }), // Auto: proportional
  averageRate: decimal("average_rate", { precision: 12, scale: 2 }), // Auto/changeable
  customFields: json("custom_fields"), // JSON for custom fields
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Godown Awak Table
export const godownAwak = pgTable("godown_awak", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  godownAwakId: varchar("godown_awak_id", { length: 50 }).notNull().unique(), // Auto-generated
  linkedLotId: varchar("linked_lot_id", { length: 50 }).notNull(), // Dropdown to Lot Entry
  totalArrived: decimal("total_arrived", { precision: 12, scale: 2 }), // Auto from lot
  sold: decimal("sold", { precision: 12, scale: 2 }).default('0'), // Auto from sales
  inGodown: decimal("in_godown", { precision: 12, scale: 2 }).notNull(), // Manual entry
  inVehicle: decimal("in_vehicle", { precision: 12, scale: 2 }), // Auto: totalArrived - sold - inGodown
  customFields: json("custom_fields"), // JSON for custom fields
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Damage Table
export const damage = pgTable("damage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  damageId: varchar("damage_id", { length: 50 }).notNull().unique(), // Auto-generated
  linkedLotId: varchar("linked_lot_id", { length: 50 }).notNull(), // Dropdown to Lot Entry
  qualityDamaged: varchar("quality_damaged", { length: 100 }).notNull(), // Dropdown
  damagedQuantity: decimal("damaged_quantity", { precision: 12, scale: 2 }).notNull(),
  damagedWeight: decimal("damaged_weight", { precision: 12, scale: 2 }), // Auto calculated
  customFields: json("custom_fields"), // JSON for custom fields
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Weight Slip Table
export const weightSlip = pgTable("weight_slip", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weightSlipId: varchar("weight_slip_id", { length: 50 }).notNull().unique(), // Auto-generated
  linkedLotId: varchar("linked_lot_id", { length: 50 }).notNull(), // Dropdown to Lot Entry
  grossWeight: decimal("gross_weight", { precision: 12, scale: 2 }).notNull(),
  tareWeight: decimal("tare_weight", { precision: 12, scale: 2 }).notNull(),
  netWeight: decimal("net_weight", { precision: 12, scale: 2 }), // Auto: grossWeight - tareWeight
  customFields: json("custom_fields"), // JSON for custom fields
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Schema validations for Lot Entry
export const insertLotEntrySchema = createInsertSchema(lotEntry, {
  arrivingDate: z.coerce.date(), // Handle date coercion from JSON strings
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLotEntrySchema = createInsertSchema(lotEntry, {
  arrivingDate: z.coerce.date(), // Handle date coercion from JSON strings
}).partial().omit({
  id: true,
  lotId: true, // Don't allow updating auto-generated ID
  createdAt: true,
  updatedAt: true,
});

export type InsertLotEntry = z.infer<typeof insertLotEntrySchema>;
export type UpdateLotEntry = z.infer<typeof updateLotEntrySchema>;
export type LotEntry = typeof lotEntry.$inferSelect;

// Schema validations for Lot Entry Sub-Fields
export const insertLotEntrySubFieldsSchema = createInsertSchema(lotEntrySubFields).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLotEntrySubFieldsSchema = insertLotEntrySubFieldsSchema.partial();

export type InsertLotEntrySubFields = z.infer<typeof insertLotEntrySubFieldsSchema>;
export type UpdateLotEntrySubFields = z.infer<typeof updateLotEntrySubFieldsSchema>;
export type LotEntrySubFields = typeof lotEntrySubFields.$inferSelect;

// Schema validations for Godown Awak
export const insertGodownAwakSchema = createInsertSchema(godownAwak).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateGodownAwakSchema = insertGodownAwakSchema.partial().omit({
  godownAwakId: true, // Don't allow updating auto-generated ID
});

export type InsertGodownAwak = z.infer<typeof insertGodownAwakSchema>;
export type UpdateGodownAwak = z.infer<typeof updateGodownAwakSchema>;
export type GodownAwak = typeof godownAwak.$inferSelect;

// Schema validations for Damage
export const insertDamageSchema = createInsertSchema(damage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDamageSchema = insertDamageSchema.partial().omit({
  damageId: true, // Don't allow updating auto-generated ID
});

export type InsertDamage = z.infer<typeof insertDamageSchema>;
export type UpdateDamage = z.infer<typeof updateDamageSchema>;
export type Damage = typeof damage.$inferSelect;

// Schema validations for Weight Slip
export const insertWeightSlipSchema = createInsertSchema(weightSlip).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWeightSlipSchema = insertWeightSlipSchema.partial().omit({
  weightSlipId: true, // Don't allow updating auto-generated ID
});

export type InsertWeightSlip = z.infer<typeof insertWeightSlipSchema>;
export type UpdateWeightSlip = z.infer<typeof updateWeightSlipSchema>;
export type WeightSlip = typeof weightSlip.$inferSelect;

// Bill Desk Tables

// Customer Billing Table (Cash Bills)
export const customerBilling = pgTable("customer_billing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billNo: varchar("bill_no", { length: 50 }).notNull(), // Auto: "cash-sv-0001" (unique per FY)
  billDate: timestamp("bill_date").notNull(),
  accountId: varchar("account_id", { length: 50 }).notNull(), // Link to account master
  customerName: varchar("customer_name", { length: 100 }).notNull(), // Display name (denormalized)
  billType: varchar("bill_type", { length: 20 }).notNull().default('cash'), // cash/khata
  
  // Bill Items (JSON array for multiple lots/products)
  billItems: json("bill_items").notNull().default([]), // [{lotId, productId, quality, quantity, weight, rate, total}]
  
  // Calculations
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 12, scale: 2 }).default('0'),
  marketFee: decimal("market_fee", { precision: 12, scale: 2 }).default('0'),
  hamali: decimal("hamali", { precision: 12, scale: 2 }).default('0'),
  discountWeight: decimal("discount_weight", { precision: 12, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default('0'),
  
  // Balance tracking
  previousBalance: decimal("previous_balance", { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default('0'),
  balanceAmount: decimal("balance_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Payment details
  paymentMode: varchar("payment_mode", { length: 50 }).notNull().default('cash'), // cash/bank/upi/cheque
  paymentDetails: json("payment_details").notNull().default({}), // {bank, cheque_no, upi_id, etc}
  
  // Additional fields
  customFields: json("custom_fields").default({}),
  notes: text("notes"),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  // Composite unique index for FY-scoped bill numbers
  uxCustomerBillingFyBillNo: uniqueIndex("ux_customer_billing_fy_billno").on(table.financialYear, table.billNo),
}));

// Khata Customer Billing Table (Credit Bills)
export const khataBilling = pgTable("khata_billing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billNo: varchar("bill_no", { length: 50 }).notNull(), // Auto: "khata-sv-0001" (unique per FY)
  billDate: timestamp("bill_date").notNull(),
  accountId: varchar("account_id", { length: 50 }).notNull(), // Link to account master
  customerName: varchar("customer_name", { length: 100 }).notNull(), // Display name (denormalized)
  billType: varchar("bill_type", { length: 20 }).notNull().default('khata'),
  
  // Bill Items (JSON array for multiple lots/products)
  billItems: json("bill_items").notNull().default([]), // [{lotId, productId, quality, quantity, weight, rate, total}]
  
  // Calculations
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 12, scale: 2 }).default('0'),
  marketFee: decimal("market_fee", { precision: 12, scale: 2 }).default('0'),
  hamali: decimal("hamali", { precision: 12, scale: 2 }).default('0'),
  discountWeight: decimal("discount_weight", { precision: 12, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default('0'),
  
  // Balance tracking
  previousBalance: decimal("previous_balance", { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default('0'),
  balanceAmount: decimal("balance_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Khata specific fields
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default('0'),
  dueDate: timestamp("due_date"),
  
  // Payment details (same as Customer Billing for consistency)
  paymentMode: varchar("payment_mode", { length: 50 }).notNull().default('cash'), // cash/bank/upi/cheque
  paymentDetails: json("payment_details").notNull().default({}), // {bank, cheque_no, upi_id, etc}
  
  // Additional fields
  customFields: json("custom_fields").default({}),
  notes: text("notes"),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  // Composite unique index for FY-scoped bill numbers
  uxKhataBillingFyBillNo: uniqueIndex("ux_khata_billing_fy_billno").on(table.financialYear, table.billNo),
}));

// Customer Payment Receipt Table
export const customerPaymentReceipt = pgTable("customer_payment_receipt", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  receiptNo: varchar("receipt_no", { length: 50 }).notNull(), // Auto: "Rec-sv-001" (unique per FY)
  receiptDate: timestamp("receipt_date").notNull(),
  accountId: varchar("account_id", { length: 50 }).notNull(), // Link to account master
  customerName: varchar("customer_name", { length: 100 }).notNull(), // Display name (denormalized)
  receiptType: varchar("receipt_type", { length: 20 }).notNull().default('customer'), // customer/khata
  
  // Bill reference (explicit linkage)
  billId: varchar("bill_id", { length: 50 }), // Direct link to bill ID
  billNo: varchar("bill_no", { length: 50 }), // Bill number for display
  billType: varchar("bill_type", { length: 20 }), // cash/khata
  billAmount: decimal("bill_amount", { precision: 12, scale: 2 }).default('0'),
  
  // Payment details
  pendingBalance: decimal("pending_balance", { precision: 12, scale: 2 }).notNull(),
  amountReceived: decimal("amount_received", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default('0'),
  balanceAmount: decimal("balance_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Payment mode
  paymentMode: varchar("payment_mode", { length: 50 }).notNull(), // cash/bank/upi/cheque
  paymentDetails: json("payment_details").notNull().default({}), // {bank, cheque_no, upi_id, etc}
  
  // Additional fields
  customFields: json("custom_fields").default({}),
  notes: text("notes"),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  // Composite unique index for FY-scoped receipt numbers
  uxCustomerReceiptFyReceiptNo: uniqueIndex("ux_customer_receipt_fy_receiptno").on(table.financialYear, table.receiptNo),
}));

// Other Payment Receipt Table (Farmer/Agent/Supplier)
export const otherPaymentReceipt = pgTable("other_payment_receipt", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  receiptNo: varchar("receipt_no", { length: 50 }).notNull(), // Auto: "Rec-sv-001" (unique per FY)
  receiptDate: timestamp("receipt_date").notNull(),
  accountId: varchar("account_id", { length: 50 }).notNull(), // Link to account master
  partyName: varchar("party_name", { length: 100 }).notNull(), // Display name (denormalized)
  partyType: varchar("party_type", { length: 50 }).notNull(), // farmer/agent/supplier/cold_storage/other
  
  // Invoice reference (explicit linkage)
  invoiceId: varchar("invoice_id", { length: 50 }), // Direct link to invoice/lot ID
  invoiceNo: varchar("invoice_no", { length: 50 }), // Invoice/lot number for display
  invoiceAmount: decimal("invoice_amount", { precision: 12, scale: 2 }).default('0'),
  
  // Payment details
  pendingBalance: decimal("pending_balance", { precision: 12, scale: 2 }).notNull(),
  payableAmount: decimal("payable_amount", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default('0'),
  balanceAmount: decimal("balance_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Payment mode
  paymentMode: varchar("payment_mode", { length: 50 }).notNull(), // cash/bank/upi/cheque
  paymentDetails: json("payment_details").notNull().default({}), // {bank, cheque_no, upi_id, etc}
  
  // Additional fields
  customFields: json("custom_fields").default({}),
  notes: text("notes"),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  // Composite unique index for FY-scoped receipt numbers
  uxOtherReceiptFyReceiptNo: uniqueIndex("ux_other_receipt_fy_receiptno").on(table.financialYear, table.receiptNo),
}));

// Schema validations for Customer Billing
export const insertCustomerBillingSchema = createInsertSchema(customerBilling, {
  billDate: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCustomerBillingSchema = createInsertSchema(customerBilling, {
  billDate: z.coerce.date(),
}).partial().omit({
  id: true,
  billNo: true, // Don't allow updating auto-generated bill number
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomerBilling = z.infer<typeof insertCustomerBillingSchema>;
export type UpdateCustomerBilling = z.infer<typeof updateCustomerBillingSchema>;
export type CustomerBilling = typeof customerBilling.$inferSelect;

// Schema validations for Khata Billing
export const insertKhataBillingSchema = createInsertSchema(khataBilling, {
  billDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateKhataBillingSchema = createInsertSchema(khataBilling, {
  billDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
}).partial().omit({
  id: true,
  billNo: true, // Don't allow updating auto-generated bill number
  createdAt: true,
  updatedAt: true,
});

export type InsertKhataBilling = z.infer<typeof insertKhataBillingSchema>;
export type UpdateKhataBilling = z.infer<typeof updateKhataBillingSchema>;
export type KhataBilling = typeof khataBilling.$inferSelect;

// Schema validations for Customer Payment Receipt
export const insertCustomerPaymentReceiptSchema = createInsertSchema(customerPaymentReceipt, {
  receiptDate: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCustomerPaymentReceiptSchema = createInsertSchema(customerPaymentReceipt, {
  receiptDate: z.coerce.date(),
}).partial().omit({
  id: true,
  receiptNo: true, // Don't allow updating auto-generated receipt number
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomerPaymentReceipt = z.infer<typeof insertCustomerPaymentReceiptSchema>;
export type UpdateCustomerPaymentReceipt = z.infer<typeof updateCustomerPaymentReceiptSchema>;
export type CustomerPaymentReceipt = typeof customerPaymentReceipt.$inferSelect;

// Schema validations for Other Payment Receipt
export const insertOtherPaymentReceiptSchema = createInsertSchema(otherPaymentReceipt, {
  receiptDate: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOtherPaymentReceiptSchema = createInsertSchema(otherPaymentReceipt, {
  receiptDate: z.coerce.date(),
}).partial().omit({
  id: true,
  receiptNo: true, // Don't allow updating auto-generated receipt number
  createdAt: true,
  updatedAt: true,
});

export type InsertOtherPaymentReceipt = z.infer<typeof insertOtherPaymentReceiptSchema>;
export type UpdateOtherPaymentReceipt = z.infer<typeof updateOtherPaymentReceiptSchema>;
export type OtherPaymentReceipt = typeof otherPaymentReceipt.$inferSelect;
