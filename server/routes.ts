import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAccountMasterSchema, 
  updateAccountMasterSchema,
  insertProductMasterSchema,
  updateProductMasterSchema,
  insertProductExpensesSchema,
  updateProductExpensesSchema,
  insertPlaceMasterSchema,
  updatePlaceMasterSchema,
  insertLotEntrySchema,
  updateLotEntrySchema,
  insertLotEntrySubFieldsSchema,
  updateLotEntrySubFieldsSchema,
  insertGodownAwakSchema,
  updateGodownAwakSchema,
  insertDamageSchema,
  updateDamageSchema,
  insertWeightSlipSchema,
  updateWeightSlipSchema,
  insertCustomerBillingSchema,
  updateCustomerBillingSchema,
  insertKhataBillingSchema,
  updateKhataBillingSchema,
  insertCustomerPaymentReceiptSchema,
  updateCustomerPaymentReceiptSchema,
  insertOtherPaymentReceiptSchema,
  updateOtherPaymentReceiptSchema,
  insertDhadaBookSchema,
  updateDhadaBookSchema,
  insertFarmerInvoiceSchema,
  updateFarmerInvoiceSchema,
  insertManualInvoiceSchema,
  updateManualInvoiceSchema,
  insertRojmelSchema,
  updateRojmelSchema,
  insertIncomeExpenseReceiptSchema,
  updateIncomeExpenseReceiptSchema,
  insertBankDepositReceiptSchema,
  updateBankDepositReceiptSchema,
  insertBalanceSheetSchema,
  updateBalanceSheetSchema,
  insertUplagLedgerSchema,
  updateUplagLedgerSchema,
  insertKhataLedgerSchema,
  updateKhataLedgerSchema,
  insertFarmerTransportLedgerSchema,
  updateFarmerTransportLedgerSchema,
  insertIncomeLedgerSchema,
  updateIncomeLedgerSchema,
  insertExpenseLedgerSchema,
  updateExpenseLedgerSchema,
  insertBankDepositLedgerSchema,
  updateBankDepositLedgerSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Account Master Routes
  app.get("/api/accounts", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const accounts = await storage.getAccountMasters(fy as string, search as string);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const account = await storage.getAccountMaster(req.params.id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch account" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const validatedData = insertAccountMasterSchema.parse(req.body);
      const account = await storage.createAccountMaster(validatedData);
      res.status(201).json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid account data" });
    }
  });

  app.put("/api/accounts/:id", async (req, res) => {
    try {
      const validatedData = updateAccountMasterSchema.parse(req.body);
      const account = await storage.updateAccountMaster(req.params.id, validatedData);
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const success = await storage.deleteAccountMaster(req.params.id);
      if (success) {
        res.json({ message: "Account deleted successfully" });
      } else {
        res.status(404).json({ error: "Account not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // Product Master Routes
  app.get("/api/products", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const products = await storage.getProductMasters(fy as string, search as string);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductMaster(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductMasterSchema.parse(req.body);
      const product = await storage.createProductMaster(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = updateProductMasterSchema.parse(req.body);
      const product = await storage.updateProductMaster(req.params.id, validatedData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProductMaster(req.params.id);
      if (success) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Product Expenses Routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const { fy = "2025-26", productId } = req.query;
      const expenses = await storage.getProductExpenses(fy as string, productId as string);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getProductExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertProductExpensesSchema.parse(req.body);
      const expense = await storage.createProductExpense(validatedData);
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid expense data" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const validatedData = updateProductExpensesSchema.parse(req.body);
      const expense = await storage.updateProductExpense(req.params.id, validatedData);
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const success = await storage.deleteProductExpense(req.params.id);
      if (success) {
        res.json({ message: "Expense deleted successfully" });
      } else {
        res.status(404).json({ error: "Expense not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Place Master Routes
  app.get("/api/places", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const places = await storage.getPlaceMasters(fy as string, search as string);
      res.json(places);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch places" });
    }
  });

  app.get("/api/places/:id", async (req, res) => {
    try {
      const place = await storage.getPlaceMaster(req.params.id);
      if (!place) {
        return res.status(404).json({ error: "Place not found" });
      }
      res.json(place);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch place" });
    }
  });

  app.post("/api/places", async (req, res) => {
    try {
      const validatedData = insertPlaceMasterSchema.parse(req.body);
      const place = await storage.createPlaceMaster(validatedData);
      res.status(201).json(place);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid place data" });
    }
  });

  app.put("/api/places/:id", async (req, res) => {
    try {
      const validatedData = updatePlaceMasterSchema.parse(req.body);
      const place = await storage.updatePlaceMaster(req.params.id, validatedData);
      res.json(place);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update place" });
    }
  });

  app.delete("/api/places/:id", async (req, res) => {
    try {
      const success = await storage.deletePlaceMaster(req.params.id);
      if (success) {
        res.json({ message: "Place deleted successfully" });
      } else {
        res.status(404).json({ error: "Place not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete place" });
    }
  });

  // Inventory Routes - Lot Entry
  app.get("/api/inventory/lot-entry", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const lots = await storage.getLotEntries(fy as string, search as string);
      res.json(lots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lot entries" });
    }
  });

  app.get("/api/inventory/lot-entry/:id", async (req, res) => {
    try {
      const lot = await storage.getLotEntry(req.params.id);
      if (!lot) {
        return res.status(404).json({ error: "Lot entry not found" });
      }
      res.json(lot);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lot entry" });
    }
  });

  app.post("/api/inventory/lot-entry", async (req, res) => {
    try {
      const validatedData = insertLotEntrySchema.parse(req.body);
      const lot = await storage.createLotEntry(validatedData);
      res.status(201).json(lot);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid lot entry data" });
    }
  });

  app.put("/api/inventory/lot-entry/:id", async (req, res) => {
    try {
      const validatedData = updateLotEntrySchema.parse(req.body);
      const lot = await storage.updateLotEntry(req.params.id, validatedData);
      res.json(lot);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update lot entry" });
    }
  });

  app.delete("/api/inventory/lot-entry/:id", async (req, res) => {
    try {
      const success = await storage.deleteLotEntry(req.params.id);
      if (success) {
        res.json({ message: "Lot entry deleted successfully" });
      } else {
        res.status(404).json({ error: "Lot entry not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lot entry" });
    }
  });

  // Lot Entry Sub-Fields Routes
  app.get("/api/inventory/lot-entry/:lotId/sub-fields", async (req, res) => {
    try {
      const subFields = await storage.getLotEntrySubFields(req.params.lotId);
      res.json(subFields);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lot entry sub-fields" });
    }
  });

  app.post("/api/inventory/lot-entry-sub-fields", async (req, res) => {
    try {
      const validatedData = insertLotEntrySubFieldsSchema.parse(req.body);
      const subField = await storage.createLotEntrySubField(validatedData);
      res.status(201).json(subField);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid sub-field data" });
    }
  });

  // Godown Awak Routes
  app.get("/api/inventory/godown-awak", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const awaks = await storage.getGodownAwaks(fy as string, search as string);
      res.json(awaks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch godown awaks" });
    }
  });

  app.get("/api/inventory/godown-awak/:id", async (req, res) => {
    try {
      const awak = await storage.getGodownAwak(req.params.id);
      if (!awak) {
        return res.status(404).json({ error: "Godown awak not found" });
      }
      res.json(awak);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch godown awak" });
    }
  });

  app.post("/api/inventory/godown-awak", async (req, res) => {
    try {
      const validatedData = insertGodownAwakSchema.parse(req.body);
      const awak = await storage.createGodownAwak(validatedData);
      res.status(201).json(awak);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid godown awak data" });
    }
  });

  app.put("/api/inventory/godown-awak/:id", async (req, res) => {
    try {
      const validatedData = updateGodownAwakSchema.parse(req.body);
      const awak = await storage.updateGodownAwak(req.params.id, validatedData);
      res.json(awak);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update godown awak" });
    }
  });

  app.delete("/api/inventory/godown-awak/:id", async (req, res) => {
    try {
      const success = await storage.deleteGodownAwak(req.params.id);
      if (success) {
        res.json({ message: "Godown awak deleted successfully" });
      } else {
        res.status(404).json({ error: "Godown awak not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete godown awak" });
    }
  });

  // Damage Routes
  app.get("/api/inventory/damage", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const damages = await storage.getDamages(fy as string, search as string);
      res.json(damages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch damage records" });
    }
  });

  app.get("/api/inventory/damage/:id", async (req, res) => {
    try {
      const damage = await storage.getDamage(req.params.id);
      if (!damage) {
        return res.status(404).json({ error: "Damage record not found" });
      }
      res.json(damage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch damage record" });
    }
  });

  app.post("/api/inventory/damage", async (req, res) => {
    try {
      const validatedData = insertDamageSchema.parse(req.body);
      const damage = await storage.createDamage(validatedData);
      res.status(201).json(damage);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid damage data" });
    }
  });

  app.put("/api/inventory/damage/:id", async (req, res) => {
    try {
      const validatedData = updateDamageSchema.parse(req.body);
      const damage = await storage.updateDamage(req.params.id, validatedData);
      res.json(damage);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update damage record" });
    }
  });

  app.delete("/api/inventory/damage/:id", async (req, res) => {
    try {
      const success = await storage.deleteDamage(req.params.id);
      if (success) {
        res.json({ message: "Damage record deleted successfully" });
      } else {
        res.status(404).json({ error: "Damage record not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete damage record" });
    }
  });

  // Weight Slip Routes
  app.get("/api/inventory/weight-slip", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const slips = await storage.getWeightSlips(fy as string, search as string);
      res.json(slips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weight slips" });
    }
  });

  app.get("/api/inventory/weight-slip/:id", async (req, res) => {
    try {
      const slip = await storage.getWeightSlip(req.params.id);
      if (!slip) {
        return res.status(404).json({ error: "Weight slip not found" });
      }
      res.json(slip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weight slip" });
    }
  });

  app.post("/api/inventory/weight-slip", async (req, res) => {
    try {
      const validatedData = insertWeightSlipSchema.parse(req.body);
      const slip = await storage.createWeightSlip(validatedData);
      res.status(201).json(slip);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid weight slip data" });
    }
  });

  app.put("/api/inventory/weight-slip/:id", async (req, res) => {
    try {
      const validatedData = updateWeightSlipSchema.parse(req.body);
      const slip = await storage.updateWeightSlip(req.params.id, validatedData);
      res.json(slip);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update weight slip" });
    }
  });

  app.delete("/api/inventory/weight-slip/:id", async (req, res) => {
    try {
      const success = await storage.deleteWeightSlip(req.params.id);
      if (success) {
        res.json({ message: "Weight slip deleted successfully" });
      } else {
        res.status(404).json({ error: "Weight slip not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete weight slip" });
    }
  });

  // Bill Desk - Customer Billing Routes
  app.get("/api/billdesk/customer-billing", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const billings = await storage.getCustomerBillings(fy as string, search as string);
      res.json(billings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer billings" });
    }
  });

  app.get("/api/billdesk/customer-billing/:id", async (req, res) => {
    try {
      const billing = await storage.getCustomerBilling(req.params.id);
      if (!billing) {
        return res.status(404).json({ error: "Customer billing not found" });
      }
      res.json(billing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer billing" });
    }
  });

  app.post("/api/billdesk/customer-billing", async (req, res) => {
    try {
      const validatedData = insertCustomerBillingSchema.parse(req.body);
      const billing = await storage.createCustomerBilling(validatedData);
      res.status(201).json(billing);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid customer billing data" });
    }
  });

  app.put("/api/billdesk/customer-billing/:id", async (req, res) => {
    try {
      const validatedData = updateCustomerBillingSchema.parse(req.body);
      const billing = await storage.updateCustomerBilling(req.params.id, validatedData);
      res.json(billing);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update customer billing" });
    }
  });

  app.delete("/api/billdesk/customer-billing/:id", async (req, res) => {
    try {
      const success = await storage.deleteCustomerBilling(req.params.id);
      if (success) {
        res.json({ message: "Customer billing deleted successfully" });
      } else {
        res.status(404).json({ error: "Customer billing not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer billing" });
    }
  });

  // Bill Desk - Khata Billing Routes
  app.get("/api/billdesk/khata-billing", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const billings = await storage.getKhataBillings(fy as string, search as string);
      res.json(billings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch khata billings" });
    }
  });

  app.get("/api/billdesk/khata-billing/:id", async (req, res) => {
    try {
      const billing = await storage.getKhataBilling(req.params.id);
      if (!billing) {
        return res.status(404).json({ error: "Khata billing not found" });
      }
      res.json(billing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch khata billing" });
    }
  });

  app.post("/api/billdesk/khata-billing", async (req, res) => {
    try {
      const validatedData = insertKhataBillingSchema.parse(req.body);
      const billing = await storage.createKhataBilling(validatedData);
      res.status(201).json(billing);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid khata billing data" });
    }
  });

  app.put("/api/billdesk/khata-billing/:id", async (req, res) => {
    try {
      const validatedData = updateKhataBillingSchema.parse(req.body);
      const billing = await storage.updateKhataBilling(req.params.id, validatedData);
      res.json(billing);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update khata billing" });
    }
  });

  app.delete("/api/billdesk/khata-billing/:id", async (req, res) => {
    try {
      const success = await storage.deleteKhataBilling(req.params.id);
      if (success) {
        res.json({ message: "Khata billing deleted successfully" });
      } else {
        res.status(404).json({ error: "Khata billing not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete khata billing" });
    }
  });

  // Bill Desk - Customer Payment Receipt Routes
  app.get("/api/billdesk/customer-receipt", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const receipts = await storage.getCustomerPaymentReceipts(fy as string, search as string);
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer payment receipts" });
    }
  });

  app.get("/api/billdesk/customer-receipt/:id", async (req, res) => {
    try {
      const receipt = await storage.getCustomerPaymentReceipt(req.params.id);
      if (!receipt) {
        return res.status(404).json({ error: "Customer payment receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer payment receipt" });
    }
  });

  app.post("/api/billdesk/customer-receipt", async (req, res) => {
    try {
      const validatedData = insertCustomerPaymentReceiptSchema.parse(req.body);
      const receipt = await storage.createCustomerPaymentReceipt(validatedData);
      res.status(201).json(receipt);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid customer payment receipt data" });
    }
  });

  app.put("/api/billdesk/customer-receipt/:id", async (req, res) => {
    try {
      const validatedData = updateCustomerPaymentReceiptSchema.parse(req.body);
      const receipt = await storage.updateCustomerPaymentReceipt(req.params.id, validatedData);
      res.json(receipt);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update customer payment receipt" });
    }
  });

  app.delete("/api/billdesk/customer-receipt/:id", async (req, res) => {
    try {
      const success = await storage.deleteCustomerPaymentReceipt(req.params.id);
      if (success) {
        res.json({ message: "Customer payment receipt deleted successfully" });
      } else {
        res.status(404).json({ error: "Customer payment receipt not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer payment receipt" });
    }
  });

  // Bill Desk - Other Payment Receipt Routes
  app.get("/api/billdesk/other-receipt", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const receipts = await storage.getOtherPaymentReceipts(fy as string, search as string);
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch other payment receipts" });
    }
  });

  app.get("/api/billdesk/other-receipt/:id", async (req, res) => {
    try {
      const receipt = await storage.getOtherPaymentReceipt(req.params.id);
      if (!receipt) {
        return res.status(404).json({ error: "Other payment receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch other payment receipt" });
    }
  });

  app.post("/api/billdesk/other-receipt", async (req, res) => {
    try {
      const validatedData = insertOtherPaymentReceiptSchema.parse(req.body);
      const receipt = await storage.createOtherPaymentReceipt(validatedData);
      res.status(201).json(receipt);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid other payment receipt data" });
    }
  });

  app.put("/api/billdesk/other-receipt/:id", async (req, res) => {
    try {
      const validatedData = updateOtherPaymentReceiptSchema.parse(req.body);
      const receipt = await storage.updateOtherPaymentReceipt(req.params.id, validatedData);
      res.json(receipt);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update other payment receipt" });
    }
  });

  app.delete("/api/billdesk/other-receipt/:id", async (req, res) => {
    try {
      const success = await storage.deleteOtherPaymentReceipt(req.params.id);
      if (success) {
        res.json({ message: "Other payment receipt deleted successfully" });
      } else {
        res.status(404).json({ error: "Other payment receipt not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete other payment receipt" });
    }
  });

  // Farmer Invoice Module - Dhada Book Routes
  app.get("/api/farmerinvoice/dhada-book", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const books = await storage.getDhadaBooks(fy as string, search as string);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dhada books" });
    }
  });

  app.get("/api/farmerinvoice/dhada-book/:id", async (req, res) => {
    try {
      const book = await storage.getDhadaBook(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Dhada book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dhada book" });
    }
  });

  app.post("/api/farmerinvoice/dhada-book", async (req, res) => {
    try {
      const validatedData = insertDhadaBookSchema.parse(req.body);
      const book = await storage.createDhadaBook(validatedData);
      res.status(201).json(book);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid dhada book data" });
    }
  });

  app.put("/api/farmerinvoice/dhada-book/:id", async (req, res) => {
    try {
      const validatedData = updateDhadaBookSchema.parse(req.body);
      const book = await storage.updateDhadaBook(req.params.id, validatedData);
      res.json(book);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update dhada book" });
    }
  });

  app.delete("/api/farmerinvoice/dhada-book/:id", async (req, res) => {
    try {
      const success = await storage.deleteDhadaBook(req.params.id);
      if (success) {
        res.json({ message: "Dhada book deleted successfully" });
      } else {
        res.status(404).json({ error: "Dhada book not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete dhada book" });
    }
  });

  // Farmer Invoice Module - Farmer Invoice Routes
  app.get("/api/farmerinvoice/farmer-invoice", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const invoices = await storage.getFarmerInvoices(fy as string, search as string);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch farmer invoices" });
    }
  });

  app.get("/api/farmerinvoice/farmer-invoice/:id", async (req, res) => {
    try {
      const invoice = await storage.getFarmerInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Farmer invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch farmer invoice" });
    }
  });

  app.post("/api/farmerinvoice/farmer-invoice", async (req, res) => {
    try {
      const validatedData = insertFarmerInvoiceSchema.parse(req.body);
      const invoice = await storage.createFarmerInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid farmer invoice data" });
    }
  });

  app.put("/api/farmerinvoice/farmer-invoice/:id", async (req, res) => {
    try {
      const validatedData = updateFarmerInvoiceSchema.parse(req.body);
      const invoice = await storage.updateFarmerInvoice(req.params.id, validatedData);
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update farmer invoice" });
    }
  });

  app.delete("/api/farmerinvoice/farmer-invoice/:id", async (req, res) => {
    try {
      const success = await storage.deleteFarmerInvoice(req.params.id);
      if (success) {
        res.json({ message: "Farmer invoice deleted successfully" });
      } else {
        res.status(404).json({ error: "Farmer invoice not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete farmer invoice" });
    }
  });

  // Farmer Invoice Module - Manual Invoice Routes
  app.get("/api/farmerinvoice/manual-invoice", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const invoices = await storage.getManualInvoices(fy as string, search as string);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch manual invoices" });
    }
  });

  app.get("/api/farmerinvoice/manual-invoice/:id", async (req, res) => {
    try {
      const invoice = await storage.getManualInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Manual invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch manual invoice" });
    }
  });

  app.post("/api/farmerinvoice/manual-invoice", async (req, res) => {
    try {
      const validatedData = insertManualInvoiceSchema.parse(req.body);
      const invoice = await storage.createManualInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid manual invoice data" });
    }
  });

  app.put("/api/farmerinvoice/manual-invoice/:id", async (req, res) => {
    try {
      const validatedData = updateManualInvoiceSchema.parse(req.body);
      const invoice = await storage.updateManualInvoice(req.params.id, validatedData);
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update manual invoice" });
    }
  });

  app.delete("/api/farmerinvoice/manual-invoice/:id", async (req, res) => {
    try {
      const success = await storage.deleteManualInvoice(req.params.id);
      if (success) {
        res.json({ message: "Manual invoice deleted successfully" });
      } else {
        res.status(404).json({ error: "Manual invoice not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete manual invoice" });
    }
  });

  // Accounting Module - Rojmel Routes
  app.get("/api/accounting/rojmels", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const rojmels = await storage.getRojmels(fy as string, search as string);
      res.json(rojmels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rojmels" });
    }
  });

  app.get("/api/accounting/rojmels/:id", async (req, res) => {
    try {
      const rojmel = await storage.getRojmel(req.params.id);
      if (!rojmel) {
        return res.status(404).json({ error: "Rojmel not found" });
      }
      res.json(rojmel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rojmel" });
    }
  });

  app.post("/api/accounting/rojmels", async (req, res) => {
    try {
      const validatedData = insertRojmelSchema.parse(req.body);
      const rojmel = await storage.createRojmel(validatedData);
      res.status(201).json(rojmel);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid rojmel data" });
    }
  });

  app.put("/api/accounting/rojmels/:id", async (req, res) => {
    try {
      const validatedData = updateRojmelSchema.parse(req.body);
      const rojmel = await storage.updateRojmel(req.params.id, validatedData);
      res.json(rojmel);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update rojmel" });
    }
  });

  app.delete("/api/accounting/rojmels/:id", async (req, res) => {
    try {
      const success = await storage.deleteRojmel(req.params.id);
      if (success) {
        res.json({ message: "Rojmel deleted successfully" });
      } else {
        res.status(404).json({ error: "Rojmel not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rojmel" });
    }
  });

  // Accounting Module - Income/Expense Receipt Routes
  app.get("/api/accounting/income-expense-receipts", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const receipts = await storage.getIncomeExpenseReceipts(fy as string, search as string);
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income/expense receipts" });
    }
  });

  app.get("/api/accounting/income-expense-receipts/:id", async (req, res) => {
    try {
      const receipt = await storage.getIncomeExpenseReceipt(req.params.id);
      if (!receipt) {
        return res.status(404).json({ error: "Income/Expense receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income/expense receipt" });
    }
  });

  app.post("/api/accounting/income-expense-receipts", async (req, res) => {
    try {
      const validatedData = insertIncomeExpenseReceiptSchema.parse(req.body);
      const receipt = await storage.createIncomeExpenseReceipt(validatedData);
      res.status(201).json(receipt);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid income/expense receipt data" });
    }
  });

  app.put("/api/accounting/income-expense-receipts/:id", async (req, res) => {
    try {
      const validatedData = updateIncomeExpenseReceiptSchema.parse(req.body);
      const receipt = await storage.updateIncomeExpenseReceipt(req.params.id, validatedData);
      res.json(receipt);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update income/expense receipt" });
    }
  });

  app.delete("/api/accounting/income-expense-receipts/:id", async (req, res) => {
    try {
      const success = await storage.deleteIncomeExpenseReceipt(req.params.id);
      if (success) {
        res.json({ message: "Income/Expense receipt deleted successfully" });
      } else {
        res.status(404).json({ error: "Income/Expense receipt not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete income/expense receipt" });
    }
  });

  // Accounting Module - Bank Deposit Receipt Routes
  app.get("/api/accounting/bank-deposit-receipts", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const receipts = await storage.getBankDepositReceipts(fy as string, search as string);
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bank deposit receipts" });
    }
  });

  app.get("/api/accounting/bank-deposit-receipts/:id", async (req, res) => {
    try {
      const receipt = await storage.getBankDepositReceipt(req.params.id);
      if (!receipt) {
        return res.status(404).json({ error: "Bank deposit receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bank deposit receipt" });
    }
  });

  app.post("/api/accounting/bank-deposit-receipts", async (req, res) => {
    try {
      const validatedData = insertBankDepositReceiptSchema.parse(req.body);
      const receipt = await storage.createBankDepositReceipt(validatedData);
      res.status(201).json(receipt);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid bank deposit receipt data" });
    }
  });

  app.put("/api/accounting/bank-deposit-receipts/:id", async (req, res) => {
    try {
      const validatedData = updateBankDepositReceiptSchema.parse(req.body);
      const receipt = await storage.updateBankDepositReceipt(req.params.id, validatedData);
      res.json(receipt);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update bank deposit receipt" });
    }
  });

  app.delete("/api/accounting/bank-deposit-receipts/:id", async (req, res) => {
    try {
      const success = await storage.deleteBankDepositReceipt(req.params.id);
      if (success) {
        res.json({ message: "Bank deposit receipt deleted successfully" });
      } else {
        res.status(404).json({ error: "Bank deposit receipt not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bank deposit receipt" });
    }
  });

  // Accounting Module - Balance Sheet Routes
  app.get("/api/accounting/balance-sheets", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const sheets = await storage.getBalanceSheets(fy as string, search as string);
      res.json(sheets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance sheets" });
    }
  });

  app.get("/api/accounting/balance-sheets/:id", async (req, res) => {
    try {
      const sheet = await storage.getBalanceSheet(req.params.id);
      if (!sheet) {
        return res.status(404).json({ error: "Balance sheet not found" });
      }
      res.json(sheet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance sheet" });
    }
  });

  app.post("/api/accounting/balance-sheets", async (req, res) => {
    try {
      const validatedData = insertBalanceSheetSchema.parse(req.body);
      const sheet = await storage.createBalanceSheet(validatedData);
      res.status(201).json(sheet);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid balance sheet data" });
    }
  });

  app.put("/api/accounting/balance-sheets/:id", async (req, res) => {
    try {
      const validatedData = updateBalanceSheetSchema.parse(req.body);
      const sheet = await storage.updateBalanceSheet(req.params.id, validatedData);
      res.json(sheet);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update balance sheet" });
    }
  });

  app.delete("/api/accounting/balance-sheets/:id", async (req, res) => {
    try {
      const success = await storage.deleteBalanceSheet(req.params.id);
      if (success) {
        res.json({ message: "Balance sheet deleted successfully" });
      } else {
        res.status(404).json({ error: "Balance sheet not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete balance sheet" });
    }
  });

  // ===========================================
  // LEDGER MODULE ROUTES
  // ===========================================

  // Ledger Module - Uplag (Balance) Ledger Routes
  app.get("/api/ledger/uplag", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const ledgers = await storage.getUplagLedgers(fy as string, search as string);
      res.json(ledgers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch uplag ledgers" });
    }
  });

  app.get("/api/ledger/uplag/:id", async (req, res) => {
    try {
      const ledger = await storage.getUplagLedger(req.params.id);
      if (!ledger) {
        return res.status(404).json({ error: "Uplag ledger not found" });
      }
      res.json(ledger);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch uplag ledger" });
    }
  });

  app.post("/api/ledger/uplag", async (req, res) => {
    try {
      const validatedData = insertUplagLedgerSchema.parse(req.body);
      const ledger = await storage.createUplagLedger(validatedData);
      res.status(201).json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid uplag ledger data" });
    }
  });

  app.put("/api/ledger/uplag/:id", async (req, res) => {
    try {
      const validatedData = updateUplagLedgerSchema.parse(req.body);
      const ledger = await storage.updateUplagLedger(req.params.id, validatedData);
      res.json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update uplag ledger" });
    }
  });

  app.delete("/api/ledger/uplag/:id", async (req, res) => {
    try {
      const success = await storage.deleteUplagLedger(req.params.id);
      if (success) {
        res.json({ message: "Uplag ledger deleted successfully" });
      } else {
        res.status(404).json({ error: "Uplag ledger not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete uplag ledger" });
    }
  });

  // Ledger Module - Khata Ledger Routes
  app.get("/api/ledger/khata", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const ledgers = await storage.getKhataLedgers(fy as string, search as string);
      res.json(ledgers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch khata ledgers" });
    }
  });

  app.get("/api/ledger/khata/:id", async (req, res) => {
    try {
      const ledger = await storage.getKhataLedger(req.params.id);
      if (!ledger) {
        return res.status(404).json({ error: "Khata ledger not found" });
      }
      res.json(ledger);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch khata ledger" });
    }
  });

  app.post("/api/ledger/khata", async (req, res) => {
    try {
      const validatedData = insertKhataLedgerSchema.parse(req.body);
      const ledger = await storage.createKhataLedger(validatedData);
      res.status(201).json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid khata ledger data" });
    }
  });

  app.put("/api/ledger/khata/:id", async (req, res) => {
    try {
      const validatedData = updateKhataLedgerSchema.parse(req.body);
      const ledger = await storage.updateKhataLedger(req.params.id, validatedData);
      res.json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update khata ledger" });
    }
  });

  app.delete("/api/ledger/khata/:id", async (req, res) => {
    try {
      const success = await storage.deleteKhataLedger(req.params.id);
      if (success) {
        res.json({ message: "Khata ledger deleted successfully" });
      } else {
        res.status(404).json({ error: "Khata ledger not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete khata ledger" });
    }
  });

  // Ledger Module - Farmer/Transport Ledger Routes
  app.get("/api/ledger/farmer-transport", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const ledgers = await storage.getFarmerTransportLedgers(fy as string, search as string);
      res.json(ledgers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch farmer/transport ledgers" });
    }
  });

  app.get("/api/ledger/farmer-transport/:id", async (req, res) => {
    try {
      const ledger = await storage.getFarmerTransportLedger(req.params.id);
      if (!ledger) {
        return res.status(404).json({ error: "Farmer/transport ledger not found" });
      }
      res.json(ledger);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch farmer/transport ledger" });
    }
  });

  app.post("/api/ledger/farmer-transport", async (req, res) => {
    try {
      const validatedData = insertFarmerTransportLedgerSchema.parse(req.body);
      const ledger = await storage.createFarmerTransportLedger(validatedData);
      res.status(201).json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid farmer/transport ledger data" });
    }
  });

  app.put("/api/ledger/farmer-transport/:id", async (req, res) => {
    try {
      const validatedData = updateFarmerTransportLedgerSchema.parse(req.body);
      const ledger = await storage.updateFarmerTransportLedger(req.params.id, validatedData);
      res.json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update farmer/transport ledger" });
    }
  });

  app.delete("/api/ledger/farmer-transport/:id", async (req, res) => {
    try {
      const success = await storage.deleteFarmerTransportLedger(req.params.id);
      if (success) {
        res.json({ message: "Farmer/transport ledger deleted successfully" });
      } else {
        res.status(404).json({ error: "Farmer/transport ledger not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete farmer/transport ledger" });
    }
  });

  // Ledger Module - Income Ledger Routes
  app.get("/api/ledger/income", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const ledgers = await storage.getIncomeLedgers(fy as string, search as string);
      res.json(ledgers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income ledgers" });
    }
  });

  app.get("/api/ledger/income/:id", async (req, res) => {
    try {
      const ledger = await storage.getIncomeLedger(req.params.id);
      if (!ledger) {
        return res.status(404).json({ error: "Income ledger not found" });
      }
      res.json(ledger);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income ledger" });
    }
  });

  app.post("/api/ledger/income", async (req, res) => {
    try {
      const validatedData = insertIncomeLedgerSchema.parse(req.body);
      const ledger = await storage.createIncomeLedger(validatedData);
      res.status(201).json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid income ledger data" });
    }
  });

  app.put("/api/ledger/income/:id", async (req, res) => {
    try {
      const validatedData = updateIncomeLedgerSchema.parse(req.body);
      const ledger = await storage.updateIncomeLedger(req.params.id, validatedData);
      res.json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update income ledger" });
    }
  });

  app.delete("/api/ledger/income/:id", async (req, res) => {
    try {
      const success = await storage.deleteIncomeLedger(req.params.id);
      if (success) {
        res.json({ message: "Income ledger deleted successfully" });
      } else {
        res.status(404).json({ error: "Income ledger not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete income ledger" });
    }
  });

  // Ledger Module - Expense Ledger Routes
  app.get("/api/ledger/expense", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const ledgers = await storage.getExpenseLedgers(fy as string, search as string);
      res.json(ledgers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense ledgers" });
    }
  });

  app.get("/api/ledger/expense/:id", async (req, res) => {
    try {
      const ledger = await storage.getExpenseLedger(req.params.id);
      if (!ledger) {
        return res.status(404).json({ error: "Expense ledger not found" });
      }
      res.json(ledger);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense ledger" });
    }
  });

  app.post("/api/ledger/expense", async (req, res) => {
    try {
      const validatedData = insertExpenseLedgerSchema.parse(req.body);
      const ledger = await storage.createExpenseLedger(validatedData);
      res.status(201).json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid expense ledger data" });
    }
  });

  app.put("/api/ledger/expense/:id", async (req, res) => {
    try {
      const validatedData = updateExpenseLedgerSchema.parse(req.body);
      const ledger = await storage.updateExpenseLedger(req.params.id, validatedData);
      res.json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update expense ledger" });
    }
  });

  app.delete("/api/ledger/expense/:id", async (req, res) => {
    try {
      const success = await storage.deleteExpenseLedger(req.params.id);
      if (success) {
        res.json({ message: "Expense ledger deleted successfully" });
      } else {
        res.status(404).json({ error: "Expense ledger not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense ledger" });
    }
  });

  // Ledger Module - Bank Deposit Ledger Routes
  app.get("/api/ledger/bank-deposit", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const ledgers = await storage.getBankDepositLedgers(fy as string, search as string);
      res.json(ledgers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bank deposit ledgers" });
    }
  });

  app.get("/api/ledger/bank-deposit/:id", async (req, res) => {
    try {
      const ledger = await storage.getBankDepositLedger(req.params.id);
      if (!ledger) {
        return res.status(404).json({ error: "Bank deposit ledger not found" });
      }
      res.json(ledger);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bank deposit ledger" });
    }
  });

  app.post("/api/ledger/bank-deposit", async (req, res) => {
    try {
      const validatedData = insertBankDepositLedgerSchema.parse(req.body);
      const ledger = await storage.createBankDepositLedger(validatedData);
      res.status(201).json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid bank deposit ledger data" });
    }
  });

  app.put("/api/ledger/bank-deposit/:id", async (req, res) => {
    try {
      const validatedData = updateBankDepositLedgerSchema.parse(req.body);
      const ledger = await storage.updateBankDepositLedger(req.params.id, validatedData);
      res.json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update bank deposit ledger" });
    }
  });

  app.delete("/api/ledger/bank-deposit/:id", async (req, res) => {
    try {
      const success = await storage.deleteBankDepositLedger(req.params.id);
      if (success) {
        res.json({ message: "Bank deposit ledger deleted successfully" });
      } else {
        res.status(404).json({ error: "Bank deposit ledger not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bank deposit ledger" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
