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
  accountId: varchar("account_id", { length: 50 }).notNull().unique(), // Auto-generated like "B-SK-001"
  type: varchar("type", { length: 50 }).notNull(), // Buyer, Transport, Farmer, Agent, Supplier, Coldstorage, Other
  name: text("name").notNull(),
  mobile: varchar("mobile", { length: 15 }).unique(), // Unique mobile number
  address: text("address"),
  placeId: varchar("place_id", { length: 50 }), // Reference to Place Master
  bankDetails: json("bank_details"), // JSON for bank account information
  governmentIdentity: json("government_identity"), // JSON for government ID information
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
  accountId: true, // Auto-generated, don't require in input
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
  productId: true, // Auto-generated, don't require in input
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
  placeId: true, // Auto-generated, don't require in input
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
  lotId: varchar("lot_id", { length: 50 }).notNull().unique(), // Auto: "Onion25-10-001"
  arrivingDate: timestamp("arriving_date").notNull(),
  transportAccountId: varchar("transport_account_id", { length: 50 }).notNull(), // Reference to Account Master (type=Transport)
  transportName: varchar("transport_name", { length: 100 }), // Denormalized for printing
  placeId: varchar("place_id", { length: 50 }).notNull(), // Auto from Place Master
  productId: varchar("product_id", { length: 50 }).notNull(), // Dropdown
  vehicleNumber: varchar("vehicle_number", { length: 50 }), // Vehicle number
  totalQuantity: decimal("total_quantity", { precision: 12, scale: 2 }).notNull(),
  freight: decimal("freight", { precision: 12, scale: 2 }).notNull(),
  advance: json("advance"), // JSON for advance payments
  otherExpenses: json("other_expenses"), // JSON for other expenses
  totalWeight: decimal("total_weight", { precision: 12, scale: 2 }), // Auto or manual
  averageWeight: decimal("average_weight", { precision: 12, scale: 2 }), // Auto: totalWeight/totalQuantity
  lotSequence: integer("lot_sequence").notNull(), // Sequence number per FY for LotID generation
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
  lotId: true, // Auto-generated, don't require in input
  lotSequence: true, // Auto-generated, don't require in input
  transportName: true, // Auto-populated from transportAccountId
  averageWeight: true, // Auto-calculated
  createdAt: true,
  updatedAt: true,
});

export const updateLotEntrySchema = createInsertSchema(lotEntry, {
  arrivingDate: z.coerce.date(), // Handle date coercion from JSON strings
}).partial().omit({
  id: true,
  lotId: true, // Don't allow updating auto-generated ID
  lotSequence: true, // Don't allow updating sequence
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

// Composite schema for creating lot with sub-fields
export const createLotWithSubFieldsSchema = z.object({
  lot: insertLotEntrySchema,
  subFields: z.array(insertLotEntrySubFieldsSchema),
});

export type CreateLotWithSubFields = z.infer<typeof createLotWithSubFieldsSchema>;

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

// Accounting Module Tables

// Rojmel Table (Daily Income/Expense Records)
export const rojmel = pgTable("rojmel", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rojmelId: varchar("rojmel_id", { length: 50 }).notNull(), // Auto: "ROJ-001" (FY-scoped unique)
  rojmelDate: timestamp("rojmel_date").notNull(),
  incomeRecords: json("income_records").notNull().default([]), // [{description, amount, category}]
  expenseRecords: json("expense_records").notNull().default([]), // [{description, amount, category}]
  totalIncome: decimal("total_income", { precision: 12, scale: 2 }).notNull().default('0'), // Auto calculated
  totalExpense: decimal("total_expense", { precision: 12, scale: 2 }).notNull().default('0'), // Auto calculated
  net: decimal("net", { precision: 12, scale: 2 }).notNull().default('0'), // Auto: totalIncome - totalExpense
  customFields: json("custom_fields").default({}),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  // Composite unique index for FY-scoped rojmel IDs
  uxRojmelFyRojmelId: uniqueIndex("ux_rojmel_fy_rojmelid").on(table.financialYear, table.rojmelId),
}));

// Income/Expense Receipt Table
export const incomeExpenseReceipt = pgTable("income_expense_receipt", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  receiptNo: varchar("receipt_no", { length: 50 }).notNull(), // Auto: "IER-001" (FY-scoped unique) 
  receiptDate: timestamp("receipt_date").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // income/expense dropdown
  name: varchar("name", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMode: varchar("payment_mode", { length: 50 }).notNull(), // cash/bank/upi/cheque dropdown
  customFields: json("custom_fields").default({}),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  // Composite unique index for FY-scoped receipt numbers
  uxIncomeExpenseReceiptFyReceiptNo: uniqueIndex("ux_income_expense_receipt_fy_receiptno").on(table.financialYear, table.receiptNo),
}));

// Bank Deposit Receipt Table
export const bankDepositReceipt = pgTable("bank_deposit_receipt", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  receiptNo: varchar("receipt_no", { length: 50 }).notNull(), // Auto: "BDR-001" (FY-scoped unique)
  receiptDate: timestamp("receipt_date").notNull(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  cashMode: json("cash_mode").notNull().default([]), // [{denomination, quantity, amount}] for cash breakup
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default('0'), // Auto calculated from cashMode
  customFields: json("custom_fields").default({}),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  // Composite unique index for FY-scoped receipt numbers
  uxBankDepositReceiptFyReceiptNo: uniqueIndex("ux_bank_deposit_receipt_fy_receiptno").on(table.financialYear, table.receiptNo),
}));

// Balance Sheet Table  
export const balanceSheet = pgTable("balance_sheet", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  balanceSheetId: varchar("balance_sheet_id", { length: 50 }).notNull(), // Auto: "BS-001" (FY-scoped unique)
  fromDate: timestamp("from_date").notNull(),
  toDate: timestamp("to_date").notNull(),
  totalAssets: decimal("total_assets", { precision: 12, scale: 2 }).notNull().default('0'), // Auto calculated
  totalLiabilities: decimal("total_liabilities", { precision: 12, scale: 2 }).notNull().default('0'), // Auto calculated
  netWorth: decimal("net_worth", { precision: 12, scale: 2 }).notNull().default('0'), // Auto: totalAssets - totalLiabilities
  customFields: json("custom_fields").default({}),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  // Composite unique index for FY-scoped balance sheet IDs
  uxBalanceSheetFyBalanceSheetId: uniqueIndex("ux_balance_sheet_fy_balancesheetid").on(table.financialYear, table.balanceSheetId),
}));

// Farmer Invoice Module Tables

// Dhada Book Table
export const dhadaBook = pgTable("dhada_book", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dhadaId: varchar("dhada_id", { length: 50 }).notNull(), // Auto: "DHD-001" (unique per FY)
  linkedLotId: varchar("linked_lot_id", { length: 50 }).notNull(), // Reference to Lot Entry
  lotDetails: json("lot_details").notNull().default({}), // JSON auto from LotEntry
  farmerName: varchar("farmer_name", { length: 100 }).notNull(), // Auto from linked lot
  farmerAgentId: varchar("farmer_agent_id", { length: 50 }).notNull(), // Reference to Account Master
  quality: text("quality"), // Auto from lot entry
  sellingRecord: json("selling_record").notNull().default([]), // [{buyerName, quality, quantity, weight, rate, total}]
  totalQuantity: decimal("total_quantity", { precision: 12, scale: 2 }).default('0'),
  totalWeight: decimal("total_weight", { precision: 12, scale: 2 }).default('0'),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).default('0'),
  customFields: json("custom_fields").default({}),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxDhadaBookFyDhadaId: uniqueIndex("ux_dhada_book_fy_dhadaid").on(table.financialYear, table.dhadaId),
}));

// Farmer Invoice Table
export const farmerInvoice = pgTable("farmer_invoice", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNo: varchar("invoice_no", { length: 50 }).notNull(), // Auto: "FI-001" (unique per FY)
  invoiceDate: timestamp("invoice_date").notNull(),
  farmerName: varchar("farmer_name", { length: 100 }).notNull(), // From dropdown/searchable
  farmerAgentId: varchar("farmer_agent_id", { length: 50 }).notNull(), // Reference to Account Master
  lotId: varchar("lot_id", { length: 50 }).notNull(), // Reference to Lot Entry
  
  // Lot details (auto-populated from inventory)
  arrivingDate: timestamp("arriving_date"),
  productId: varchar("product_id", { length: 50 }),
  productName: varchar("product_name", { length: 100 }),
  transportName: varchar("transport_name", { length: 100 }),
  placeId: varchar("place_id", { length: 50 }),
  placeName: varchar("place_name", { length: 100 }),
  vehicleNumber: varchar("vehicle_number", { length: 50 }),
  
  // Invoice calculations
  quality: text("quality"), // Auto from lot
  quantity: decimal("quantity", { precision: 12, scale: 2 }).default('0'), // Auto from lot
  weight: decimal("weight", { precision: 12, scale: 2 }).default('0'), // Auto from lot
  rate: decimal("rate", { precision: 12, scale: 2 }).default('0'), // Auto/editable
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).default('0'), // Auto: quantity * rate
  
  // Expenses (auto-calculated from lot/expenses)
  expenses: decimal("expenses", { precision: 12, scale: 2 }).default('0'),
  lessExpenses: decimal("less_expenses", { precision: 12, scale: 2 }).default('0'),
  netPayable: decimal("net_payable", { precision: 12, scale: 2 }).default('0'), // Auto: totalAmount - lessExpenses
  
  // Additional fields
  notes: text("notes"),
  customFields: json("custom_fields").default({}),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxFarmerInvoiceFyInvoiceNo: uniqueIndex("ux_farmer_invoice_fy_invoiceno").on(table.financialYear, table.invoiceNo),
}));

// Manual Invoice Table
export const manualInvoice = pgTable("manual_invoice", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNo: varchar("invoice_no", { length: 50 }).notNull(), // Auto: "MI-001" (unique per FY)
  invoiceDate: timestamp("invoice_date").notNull(),
  farmerName: varchar("farmer_name", { length: 100 }).notNull(), // From dropdown/searchable
  farmerAgentId: varchar("farmer_agent_id", { length: 50 }).notNull(), // Reference to Account Master
  lotId: varchar("lot_id", { length: 50 }).notNull(), // Reference to Lot Entry
  
  // Lot details (auto-populated from inventory)
  arrivingDate: timestamp("arriving_date"),
  productId: varchar("product_id", { length: 50 }),
  productName: varchar("product_name", { length: 100 }),
  transportName: varchar("transport_name", { length: 100 }),
  placeId: varchar("place_id", { length: 50 }),
  placeName: varchar("place_name", { length: 100 }),
  vehicleNumber: varchar("vehicle_number", { length: 50 }),
  
  // Manual invoice calculations (editable)
  quality: text("quality"), // Auto from lot
  quantity: decimal("quantity", { precision: 12, scale: 2 }).default('0'), // Auto/editable
  weight: decimal("weight", { precision: 12, scale: 2 }).default('0'), // Auto/editable
  rate: decimal("rate", { precision: 12, scale: 2 }).default('0'), // Auto/editable
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).default('0'), // Auto: quantity * rate
  
  // Detailed expenses (all auto and editable)
  freight: decimal("freight", { precision: 12, scale: 2 }).default('0'),
  advance: decimal("advance", { precision: 12, scale: 2 }).default('0'),
  hamali: decimal("hamali", { precision: 12, scale: 2 }).default('0'),
  varai: decimal("varai", { precision: 12, scale: 2 }).default('0'),
  tolai: decimal("tolai", { precision: 12, scale: 2 }).default('0'),
  postage: decimal("postage", { precision: 12, scale: 2 }).default('0'),
  levy: decimal("levy", { precision: 12, scale: 2 }).default('0'),
  otherExpenses: decimal("other_expenses", { precision: 12, scale: 2 }).default('0'),
  
  // Calculations
  totalExpenses: decimal("total_expenses", { precision: 12, scale: 2 }).default('0'), // Sum of all expenses
  lessExpenses: decimal("less_expenses", { precision: 12, scale: 2 }).default('0'),
  netPayable: decimal("net_payable", { precision: 12, scale: 2 }).default('0'), // Auto: totalAmount - totalExpenses - lessExpenses
  
  // Additional fields
  notes: text("notes"),
  customFields: json("custom_fields").default({}),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxManualInvoiceFyInvoiceNo: uniqueIndex("ux_manual_invoice_fy_invoiceno").on(table.financialYear, table.invoiceNo),
}));

// Schema validations for Dhada Book
export const insertDhadaBookSchema = createInsertSchema(dhadaBook).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDhadaBookSchema = insertDhadaBookSchema.partial().omit({
  dhadaId: true, // Don't allow updating auto-generated ID
});

export type InsertDhadaBook = z.infer<typeof insertDhadaBookSchema>;
export type UpdateDhadaBook = z.infer<typeof updateDhadaBookSchema>;
export type DhadaBook = typeof dhadaBook.$inferSelect;

// Schema validations for Farmer Invoice
export const insertFarmerInvoiceSchema = createInsertSchema(farmerInvoice, {
  invoiceDate: z.coerce.date(),
  arrivingDate: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFarmerInvoiceSchema = createInsertSchema(farmerInvoice, {
  invoiceDate: z.coerce.date(),
  arrivingDate: z.coerce.date().optional(),
}).partial().omit({
  id: true,
  invoiceNo: true, // Don't allow updating auto-generated invoice number
  createdAt: true,
  updatedAt: true,
});

export type InsertFarmerInvoice = z.infer<typeof insertFarmerInvoiceSchema>;
export type UpdateFarmerInvoice = z.infer<typeof updateFarmerInvoiceSchema>;
export type FarmerInvoice = typeof farmerInvoice.$inferSelect;

// Schema validations for Manual Invoice
export const insertManualInvoiceSchema = createInsertSchema(manualInvoice, {
  invoiceDate: z.coerce.date(),
  arrivingDate: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateManualInvoiceSchema = createInsertSchema(manualInvoice, {
  invoiceDate: z.coerce.date(),
  arrivingDate: z.coerce.date().optional(),
}).partial().omit({
  id: true,
  invoiceNo: true, // Don't allow updating auto-generated invoice number
  createdAt: true,
  updatedAt: true,
});

export type InsertManualInvoice = z.infer<typeof insertManualInvoiceSchema>;
export type UpdateManualInvoice = z.infer<typeof updateManualInvoiceSchema>;
export type ManualInvoice = typeof manualInvoice.$inferSelect;

// Schema validations for Rojmel
export const insertRojmelSchema = createInsertSchema(rojmel, {
  rojmelDate: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRojmelSchema = createInsertSchema(rojmel, {
  rojmelDate: z.coerce.date(),
}).partial().omit({
  id: true,
  rojmelId: true, // Don't allow updating auto-generated ID
  createdAt: true,
  updatedAt: true,
});

export type InsertRojmel = z.infer<typeof insertRojmelSchema>;
export type UpdateRojmel = z.infer<typeof updateRojmelSchema>;
export type Rojmel = typeof rojmel.$inferSelect;

// Schema validations for Income/Expense Receipt
export const insertIncomeExpenseReceiptSchema = createInsertSchema(incomeExpenseReceipt, {
  receiptDate: z.coerce.date(),
  type: z.enum(["income", "expense"]),
  paymentMode: z.enum(["cash", "bank", "upi", "cheque"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateIncomeExpenseReceiptSchema = createInsertSchema(incomeExpenseReceipt, {
  receiptDate: z.coerce.date(),
  type: z.enum(["income", "expense"]),
  paymentMode: z.enum(["cash", "bank", "upi", "cheque"]),
}).partial().omit({
  id: true,
  receiptNo: true, // Don't allow updating auto-generated receipt number
  createdAt: true,
  updatedAt: true,
});

export type InsertIncomeExpenseReceipt = z.infer<typeof insertIncomeExpenseReceiptSchema>;
export type UpdateIncomeExpenseReceipt = z.infer<typeof updateIncomeExpenseReceiptSchema>;
export type IncomeExpenseReceipt = typeof incomeExpenseReceipt.$inferSelect;

// Schema validations for Bank Deposit Receipt
export const insertBankDepositReceiptSchema = createInsertSchema(bankDepositReceipt, {
  receiptDate: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBankDepositReceiptSchema = createInsertSchema(bankDepositReceipt, {
  receiptDate: z.coerce.date(),
}).partial().omit({
  id: true,
  receiptNo: true, // Don't allow updating auto-generated receipt number
  createdAt: true,
  updatedAt: true,
});

export type InsertBankDepositReceipt = z.infer<typeof insertBankDepositReceiptSchema>;
export type UpdateBankDepositReceipt = z.infer<typeof updateBankDepositReceiptSchema>;
export type BankDepositReceipt = typeof bankDepositReceipt.$inferSelect;

// Schema validations for Balance Sheet
export const insertBalanceSheetSchema = createInsertSchema(balanceSheet, {
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBalanceSheetSchema = createInsertSchema(balanceSheet, {
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
}).partial().omit({
  id: true,
  balanceSheetId: true, // Don't allow updating auto-generated ID
  createdAt: true,
  updatedAt: true,
});

export type InsertBalanceSheet = z.infer<typeof insertBalanceSheetSchema>;
export type UpdateBalanceSheet = z.infer<typeof updateBalanceSheetSchema>;
export type BalanceSheet = typeof balanceSheet.$inferSelect;

// Ledger Module Tables

// Uplag (Balance) Ledger Table
export const uplagLedger = pgTable("uplag_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ledgerId: varchar("ledger_id", { length: 50 }).notNull(), // Auto-generated like "UPL-0001"
  date: timestamp("date").notNull(),
  customerId: varchar("customer_id", { length: 50 }).notNull(), // Reference to Account Master
  customerName: text("customer_name").notNull(), // Searchable customer name
  openingBalance: decimal("opening_balance", { precision: 12, scale: 2 }).default('0'),
  paymentReceived: decimal("payment_received", { precision: 12, scale: 2 }).default('0'),
  totalBalance: decimal("total_balance", { precision: 12, scale: 2 }).notNull(), // Auto: openingBalance + paymentReceived
  billNumbers: json("bill_numbers"), // JSON array of past 3 bill numbers with links
  note: text("note"),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxUplagLedgerFyLedgerId: uniqueIndex("ux_uplag_ledger_fy_ledgerid").on(table.financialYear, table.ledgerId),
}));

// Khata Ledger Table (Same structure as Uplag)
export const khataLedger = pgTable("khata_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ledgerId: varchar("ledger_id", { length: 50 }).notNull(), // Auto-generated like "KHA-0001"
  date: timestamp("date").notNull(),
  customerId: varchar("customer_id", { length: 50 }).notNull(), // Reference to Account Master
  customerName: text("customer_name").notNull(), // Searchable customer name
  openingBalance: decimal("opening_balance", { precision: 12, scale: 2 }).default('0'),
  paymentReceived: decimal("payment_received", { precision: 12, scale: 2 }).default('0'),
  totalBalance: decimal("total_balance", { precision: 12, scale: 2 }).notNull(), // Auto: openingBalance + paymentReceived
  billNumbers: json("bill_numbers"), // JSON array of past 3 bill numbers with links
  note: text("note"),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxKhataLedgerFyLedgerId: uniqueIndex("ux_khata_ledger_fy_ledgerid").on(table.financialYear, table.ledgerId),
}));

// Farmer/Transport Ledger Table
export const farmerTransportLedger = pgTable("farmer_transport_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ledgerId: varchar("ledger_id", { length: 50 }).notNull(), // Auto-generated like "FTL-0001"
  date: timestamp("date").notNull(),
  customerId: varchar("customer_id", { length: 50 }).notNull(), // Reference to Account Master
  customerName: text("customer_name").notNull(), // Searchable customer name
  invoiceId: varchar("invoice_id", { length: 50 }), // Link to Farmer Invoice
  invoiceGenerateDate: timestamp("invoice_generate_date"),
  productName: text("product_name"),
  quantity: decimal("quantity", { precision: 12, scale: 2 }),
  transportDetails: text("transport_details"),
  farmerInvoiceGrossAmount: decimal("farmer_invoice_gross_amount", { precision: 12, scale: 2 }).default('0'),
  expenses: decimal("expenses", { precision: 12, scale: 2 }).default('0'),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(), // Auto: grossAmount - expenses
  advance: decimal("advance", { precision: 12, scale: 2 }).default('0'),
  amountPayable: decimal("amount_payable", { precision: 12, scale: 2 }).notNull(), // Auto: netAmount - advance
  balanceRemaining: decimal("balance_remaining", { precision: 12, scale: 2 }).notNull(), // Auto: running balance
  paymentMode: varchar("payment_mode", { length: 20 }).default('cash'), // cash, bank, upi, cheque
  note: text("note"),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxFarmerTransportLedgerFyLedgerId: uniqueIndex("ux_farmer_transport_ledger_fy_ledgerid").on(table.financialYear, table.ledgerId),
}));

// Income Ledger Table
export const incomeLedger = pgTable("income_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ledgerId: varchar("ledger_id", { length: 50 }).notNull(), // Auto-generated like "INC-0001"
  date: timestamp("date").notNull(),
  incomeSource: text("income_source").notNull(), // Source of income
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  runningBalance: decimal("running_balance", { precision: 12, scale: 2 }).notNull(), // Auto calculated
  receiptId: varchar("receipt_id", { length: 50 }), // Link to Income/Expense Receipt
  paymentMode: varchar("payment_mode", { length: 20 }).notNull(), // cash, bank, upi, cheque
  description: text("description"),
  note: text("note"),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxIncomeLedgerFyLedgerId: uniqueIndex("ux_income_ledger_fy_ledgerid").on(table.financialYear, table.ledgerId),
}));

// Expense Ledger Table
export const expenseLedger = pgTable("expense_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ledgerId: varchar("ledger_id", { length: 50 }).notNull(), // Auto-generated like "EXP-0001"
  date: timestamp("date").notNull(),
  expenseCategory: text("expense_category").notNull(), // Category of expense
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  runningBalance: decimal("running_balance", { precision: 12, scale: 2 }).notNull(), // Auto calculated
  receiptId: varchar("receipt_id", { length: 50 }), // Link to Income/Expense Receipt
  paymentMode: varchar("payment_mode", { length: 20 }).notNull(), // cash, bank, upi, cheque
  description: text("description"),
  note: text("note"),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxExpenseLedgerFyLedgerId: uniqueIndex("ux_expense_ledger_fy_ledgerid").on(table.financialYear, table.ledgerId),
}));

// Bank Deposit Ledger Table
export const bankDepositLedger = pgTable("bank_deposit_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ledgerId: varchar("ledger_id", { length: 50 }).notNull(), // Auto-generated like "BDL-0001"
  date: timestamp("date").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: varchar("account_number", { length: 50 }),
  depositAmount: decimal("deposit_amount", { precision: 12, scale: 2 }).notNull(),
  runningBalance: decimal("running_balance", { precision: 12, scale: 2 }).notNull(), // Auto calculated
  receiptId: varchar("receipt_id", { length: 50 }), // Link to Bank Deposit Receipt
  transactionType: varchar("transaction_type", { length: 20 }).default('deposit'), // deposit, withdrawal
  cashBreakdown: json("cash_breakdown"), // JSON for denomination details
  description: text("description"),
  note: text("note"),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxBankDepositLedgerFyLedgerId: uniqueIndex("ux_bank_deposit_ledger_fy_ledgerid").on(table.financialYear, table.ledgerId),
}));


// Schema validations for Uplag Ledger
export const insertUplagLedgerSchema = createInsertSchema(uplagLedger, {
  date: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUplagLedgerSchema = createInsertSchema(uplagLedger, {
  date: z.coerce.date(),
}).partial().omit({
  id: true,
  ledgerId: true, // Don't allow updating auto-generated ID
  createdAt: true,
  updatedAt: true,
});

export type InsertUplagLedger = z.infer<typeof insertUplagLedgerSchema>;
export type UpdateUplagLedger = z.infer<typeof updateUplagLedgerSchema>;
export type UplagLedger = typeof uplagLedger.$inferSelect;

// Schema validations for Khata Ledger
export const insertKhataLedgerSchema = createInsertSchema(khataLedger, {
  date: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateKhataLedgerSchema = createInsertSchema(khataLedger, {
  date: z.coerce.date(),
}).partial().omit({
  id: true,
  ledgerId: true, // Don't allow updating auto-generated ID
  createdAt: true,
  updatedAt: true,
});

export type InsertKhataLedger = z.infer<typeof insertKhataLedgerSchema>;
export type UpdateKhataLedger = z.infer<typeof updateKhataLedgerSchema>;
export type KhataLedger = typeof khataLedger.$inferSelect;

// Schema validations for Farmer/Transport Ledger
export const insertFarmerTransportLedgerSchema = createInsertSchema(farmerTransportLedger, {
  date: z.coerce.date(),
  invoiceGenerateDate: z.coerce.date().optional(),
  paymentMode: z.enum(["cash", "bank", "upi", "cheque"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFarmerTransportLedgerSchema = createInsertSchema(farmerTransportLedger, {
  date: z.coerce.date(),
  invoiceGenerateDate: z.coerce.date().optional(),
  paymentMode: z.enum(["cash", "bank", "upi", "cheque"]),
}).partial().omit({
  id: true,
  ledgerId: true, // Don't allow updating auto-generated ID
  createdAt: true,
  updatedAt: true,
});

export type InsertFarmerTransportLedger = z.infer<typeof insertFarmerTransportLedgerSchema>;
export type UpdateFarmerTransportLedger = z.infer<typeof updateFarmerTransportLedgerSchema>;
export type FarmerTransportLedger = typeof farmerTransportLedger.$inferSelect;

// Schema validations for Income Ledger
export const insertIncomeLedgerSchema = createInsertSchema(incomeLedger, {
  date: z.coerce.date(),
  paymentMode: z.enum(["cash", "bank", "upi", "cheque"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateIncomeLedgerSchema = createInsertSchema(incomeLedger, {
  date: z.coerce.date(),
  paymentMode: z.enum(["cash", "bank", "upi", "cheque"]),
}).partial().omit({
  id: true,
  ledgerId: true, // Don't allow updating auto-generated ID
  createdAt: true,
  updatedAt: true,
});

export type InsertIncomeLedger = z.infer<typeof insertIncomeLedgerSchema>;
export type UpdateIncomeLedger = z.infer<typeof updateIncomeLedgerSchema>;
export type IncomeLedger = typeof incomeLedger.$inferSelect;

// Schema validations for Expense Ledger
export const insertExpenseLedgerSchema = createInsertSchema(expenseLedger, {
  date: z.coerce.date(),
  paymentMode: z.enum(["cash", "bank", "upi", "cheque"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateExpenseLedgerSchema = createInsertSchema(expenseLedger, {
  date: z.coerce.date(),
  paymentMode: z.enum(["cash", "bank", "upi", "cheque"]),
}).partial().omit({
  id: true,
  ledgerId: true, // Don't allow updating auto-generated ID
  createdAt: true,
  updatedAt: true,
});

export type InsertExpenseLedger = z.infer<typeof insertExpenseLedgerSchema>;
export type UpdateExpenseLedger = z.infer<typeof updateExpenseLedgerSchema>;
export type ExpenseLedger = typeof expenseLedger.$inferSelect;

// Schema validations for Bank Deposit Ledger
export const insertBankDepositLedgerSchema = createInsertSchema(bankDepositLedger, {
  date: z.coerce.date(),
  transactionType: z.enum(["deposit", "withdrawal"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBankDepositLedgerSchema = createInsertSchema(bankDepositLedger, {
  date: z.coerce.date(),
  transactionType: z.enum(["deposit", "withdrawal"]),
}).partial().omit({
  id: true,
  ledgerId: true, // Don't allow updating auto-generated ID
  createdAt: true,
  updatedAt: true,
});

export type InsertBankDepositLedger = z.infer<typeof insertBankDepositLedgerSchema>;
export type UpdateBankDepositLedger = z.infer<typeof updateBankDepositLedgerSchema>;
export type BankDepositLedger = typeof bankDepositLedger.$inferSelect;

// Reports Module - Report Configurations Table
export const reportConfigs = pgTable("report_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // User-defined report name
  type: varchar("type", { length: 20 }).notNull(), // 'lot' | 'bill' | 'invoice' | 'income' | 'expense' | 'paid-unpaid'
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  filters: json("filters").notNull(), // JSON object with report-specific filters
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Reports Module - Report Snapshots Table
export const reportSnapshots = pgTable("report_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id"), // Optional reference to report config
  name: text("name"), // Optional snapshot name
  type: varchar("type", { length: 20 }).notNull(), // Same as report config types
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  filters: json("filters").notNull(), // Filters used for this snapshot
  results: json("results").notNull(), // Aggregated results data
  sourceMeta: json("source_meta"), // Source data metadata (record counts, hash, etc.)
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Report Config Schemas
export const insertReportConfigSchema = createInsertSchema(reportConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(["lot", "bill", "invoice", "income", "expense", "paid-unpaid"]),
  filters: z.record(z.any()), // Flexible JSON object for filters
});

export const updateReportConfigSchema = insertReportConfigSchema.partial();

// Report Snapshot Schemas
export const insertReportSnapshotSchema = createInsertSchema(reportSnapshots).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.enum(["lot", "bill", "invoice", "income", "expense", "paid-unpaid"]),
  filters: z.record(z.any()),
  results: z.record(z.any()),
  sourceMeta: z.record(z.any()).optional(),
});

// Type exports for Reports
export type InsertReportConfig = z.infer<typeof insertReportConfigSchema>;
export type UpdateReportConfig = z.infer<typeof updateReportConfigSchema>;
export type ReportConfig = typeof reportConfigs.$inferSelect;
export type InsertReportSnapshot = z.infer<typeof insertReportSnapshotSchema>;
export type ReportSnapshot = typeof reportSnapshots.$inferSelect;

// Settings Module Tables

// Company Profile Table
export const companyProfile = pgTable('company_profile', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  financialYear: varchar('financial_year', { length: 20 }).notNull().default('2025-26'),
  companyName: varchar('company_name', { length: 200 }).notNull(),
  address: text('address'),
  phone1: varchar('phone1', { length: 20 }),
  phone2: varchar('phone2', { length: 20 }),
  email: varchar('email', { length: 100 }),
  website: varchar('website', { length: 200 }),
  remark: text('remark'),
  logoUrl: varchar('logo_url', { length: 500 }), // File upload path
  customFields: json('custom_fields').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Default Expenses Table  
export const defaultExpenses = pgTable('default_expenses', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  financialYear: varchar('financial_year', { length: 20 }).notNull().default('2025-26'),
  expenseName: varchar('expense_name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // fixed, variable, percentage
  value: decimal('value', { precision: 12, scale: 2 }).notNull(),
  customFields: json('custom_fields').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Printing Settings Table
export const printingSettings = pgTable('printing_settings', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  financialYear: varchar('financial_year', { length: 20 }).notNull().default('2025-26'),
  templateId: varchar('template_id', { length: 50 }).notNull(), // auto-generated
  templateName: varchar('template_name', { length: 100 }).notNull(),
  fieldsToShow: json('fields_to_show').default([]), // multi-select array
  customFields: json('custom_fields').default({}),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Module Settings Table
export const moduleSettings = pgTable('module_settings', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  financialYear: varchar('financial_year', { length: 20 }).notNull().default('2025-26'),
  moduleName: varchar('module_name', { length: 100 }).notNull(),
  moduleFields: json('module_fields').default({}), // configurable fields
  isActive: boolean('is_active').default(true),
  customFields: json('custom_fields').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Settings Zod Schemas
export const insertCompanyProfileSchema = createInsertSchema(companyProfile).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone1: z.string().optional(),
  phone2: z.string().optional(),
});

export const updateCompanyProfileSchema = insertCompanyProfileSchema.partial();

export const insertDefaultExpensesSchema = createInsertSchema(defaultExpenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expenseName: z.string().min(1, "Expense name is required"),
  type: z.enum(["fixed", "variable", "percentage"]),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid number format"),
});

export const updateDefaultExpensesSchema = insertDefaultExpensesSchema.partial();

export const insertPrintingSettingsSchema = createInsertSchema(printingSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  templateName: z.string().min(1, "Template name is required"),
  fieldsToShow: z.array(z.string()).optional(),
});

export const updatePrintingSettingsSchema = insertPrintingSettingsSchema.partial();

export const insertModuleSettingsSchema = createInsertSchema(moduleSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  moduleName: z.string().min(1, "Module name is required"),
});

export const updateModuleSettingsSchema = insertModuleSettingsSchema.partial();

// Settings Types
export type CompanyProfile = typeof companyProfile.$inferSelect;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type UpdateCompanyProfile = z.infer<typeof updateCompanyProfileSchema>;

export type DefaultExpenses = typeof defaultExpenses.$inferSelect;
export type InsertDefaultExpenses = z.infer<typeof insertDefaultExpensesSchema>;
export type UpdateDefaultExpenses = z.infer<typeof updateDefaultExpensesSchema>;

export type PrintingSettings = typeof printingSettings.$inferSelect;
export type InsertPrintingSettings = z.infer<typeof insertPrintingSettingsSchema>;
export type UpdatePrintingSettings = z.infer<typeof updatePrintingSettingsSchema>;

export type ModuleSettings = typeof moduleSettings.$inferSelect;
export type InsertModuleSettings = z.infer<typeof insertModuleSettingsSchema>;
export type UpdateModuleSettings = z.infer<typeof updateModuleSettingsSchema>;

// WhatsApp Module Tables

// WhatsApp Messages Table
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id", { length: 50 }).notNull().unique(), // Auto-generated like "MSG-001"
  type: varchar("type", { length: 50 }).notNull(), // Dropdown: promotional/transactional/notification
  recipient: text("recipient").notNull(), // Phone number or contact
  messageText: text("message_text").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // Dropdown: sent/failed/pending
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  errorMessage: text("error_message"),
  linkedBillId: varchar("linked_bill_id", { length: 50 }), // Link to Bill Desk
  linkedInvoiceId: varchar("linked_invoice_id", { length: 50 }), // Link to Farmer Invoice
  customFields: json("custom_fields").default({}),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxWhatsappMessagesFyMessageId: uniqueIndex("ux_whatsapp_messages_fy_messageid").on(table.financialYear, table.messageId),
}));

// WhatsApp Templates Table
export const whatsappTemplates = pgTable("whatsapp_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id", { length: 50 }).notNull().unique(), // Auto-generated like "TPL-001"
  type: varchar("type", { length: 50 }).notNull(), // Dropdown: bill_notification/payment_reminder/invoice_summary
  templateName: varchar("template_name", { length: 100 }).notNull(),
  templateText: text("template_text").notNull(), // Text with placeholders like {{customer_name}}, {{amount}}
  placeholders: json("placeholders").default([]), // Array of available placeholder fields
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  customFields: json("custom_fields").default({}),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxWhatsappTemplatesFyTemplateId: uniqueIndex("ux_whatsapp_templates_fy_templateid").on(table.financialYear, table.templateId),
}));

// WhatsApp Settings Table
export const whatsappSettings = pgTable("whatsapp_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingId: varchar("setting_id", { length: 50 }).notNull().unique(), // Auto-generated like "SET-001"
  apiProvider: varchar("api_provider", { length: 50 }).notNull().default('twilio'), // Dropdown: twilio/whatsapp_business/other
  apiKey: text("api_key").notNull(), // Encrypted API key
  apiSecret: text("api_secret"), // Optional secret for some providers
  phoneNumberId: varchar("phone_number_id", { length: 50 }), // WhatsApp Business phone number ID
  businessName: varchar("business_name", { length: 100 }),
  autoSend: boolean("auto_send").default(false), // Auto-send messages on bill/invoice creation
  autoSendTriggers: json("auto_send_triggers").default([]), // Array of trigger events
  messageLimit: integer("message_limit").default(1000), // Monthly message limit
  messagesUsed: integer("messages_used").default(0), // Current month usage
  isActive: boolean("is_active").default(true),
  customFields: json("custom_fields").default({}),
  financialYear: varchar("financial_year", { length: 10 }).notNull().default('2025-26'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uxWhatsappSettingsFySettingId: uniqueIndex("ux_whatsapp_settings_fy_settingid").on(table.financialYear, table.settingId),
}));

// WhatsApp Messages Schema Validations
export const insertWhatsappMessagesSchema = createInsertSchema(whatsappMessages, {
  sentAt: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
  readAt: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  recipient: z.string().min(1, "Recipient is required"),
  messageText: z.string().min(1, "Message text is required"),
  type: z.enum(["promotional", "transactional", "notification"]),
  status: z.enum(["sent", "failed", "pending"]).default("pending"),
});

export const updateWhatsappMessagesSchema = insertWhatsappMessagesSchema.partial().omit({
  messageId: true,
});

// WhatsApp Templates Schema Validations
export const insertWhatsappTemplatesSchema = createInsertSchema(whatsappTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  templateName: z.string().min(1, "Template name is required"),
  templateText: z.string().min(1, "Template text is required"),
  type: z.enum(["bill_notification", "payment_reminder", "invoice_summary", "custom"]),
});

export const updateWhatsappTemplatesSchema = insertWhatsappTemplatesSchema.partial().omit({
  templateId: true,
});

// WhatsApp Settings Schema Validations
export const insertWhatsappSettingsSchema = createInsertSchema(whatsappSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  apiProvider: z.enum(["twilio", "whatsapp_business", "other"]),
  apiKey: z.string().min(1, "API key is required"),
  businessName: z.string().optional(),
});

export const updateWhatsappSettingsSchema = insertWhatsappSettingsSchema.partial().omit({
  settingId: true,
});

// WhatsApp Types
export type WhatsappMessages = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessages = z.infer<typeof insertWhatsappMessagesSchema>;
export type UpdateWhatsappMessages = z.infer<typeof updateWhatsappMessagesSchema>;

export type WhatsappTemplates = typeof whatsappTemplates.$inferSelect;
export type InsertWhatsappTemplates = z.infer<typeof insertWhatsappTemplatesSchema>;
export type UpdateWhatsappTemplates = z.infer<typeof updateWhatsappTemplatesSchema>;

export type WhatsappSettings = typeof whatsappSettings.$inferSelect;
export type InsertWhatsappSettings = z.infer<typeof insertWhatsappSettingsSchema>;
export type UpdateWhatsappSettings = z.infer<typeof updateWhatsappSettingsSchema>;
