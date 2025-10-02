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
  createLotWithSubFieldsSchema,
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
  insertLotSalesSchema,
  updateLotSalesSchema,
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
  updateBankDepositLedgerSchema,
  insertCompanyProfileSchema,
  updateCompanyProfileSchema,
  insertDefaultExpensesSchema,
  updateDefaultExpensesSchema,
  insertPrintingSettingsSchema,
  updatePrintingSettingsSchema,
  insertModuleSettingsSchema,
  updateModuleSettingsSchema,
  insertWhatsappMessagesSchema,
  updateWhatsappMessagesSchema,
  insertWhatsappTemplatesSchema,
  updateWhatsappTemplatesSchema,
  insertWhatsappSettingsSchema,
  updateWhatsappSettingsSchema,
  insertSalesTransactionsSchema,
  updateSalesTransactionsSchema,
  insertAccountingIntegrationsSchema,
  updateAccountingIntegrationsSchema,
  insertAccountingSyncLogsSchema,
  insertAccountingMappingsSchema
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
      console.error('Account creation error:', error);
      
      // Handle duplicate key constraints with user-friendly messages
      if (error.message?.includes('duplicate key') || error.code === '23505') {
        if (error.message?.includes('mobile')) {
          res.status(400).json({ error: 'Mobile number already exists. Please use a different mobile number.' });
        } else if (error.message?.includes('account_id')) {
          res.status(400).json({ error: 'Account ID already exists. Please try again.' });
        } else {
          res.status(400).json({ error: 'This record already exists. Please check the data and try again.' });
        }
      } else {
        res.status(400).json({ error: error.message || "Invalid account data" });
      }
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

  app.get("/api/inventory/lot-entry/with-subfields", async (req, res) => {
    try {
      const { fy = "2025-26" } = req.query;
      const lots = await storage.getLotsWithSubFields(fy as string);
      res.json(lots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lots with sub-fields" });
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

  // Composite endpoint for creating lot with sub-fields
  app.post("/api/inventory/lot-entry/with-sub-fields", async (req, res) => {
    try {
      const validatedData = createLotWithSubFieldsSchema.parse(req.body);
      const result = await storage.createLotWithSubFields(validatedData.lot, validatedData.subFields);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Lot creation with sub-fields error:', error);
      
      // Handle duplicate key constraints with user-friendly messages
      if (error.message?.includes('duplicate key') || error.code === '23505') {
        res.status(400).json({ error: 'Lot ID already exists. Please try again.' });
      } else {
        res.status(400).json({ error: error.message || "Invalid lot entry data" });
      }
    }
  });

  // Lot Entry Sub-Fields Routes
  app.get("/api/inventory/lot-entry/:lotId/sub-fields", async (req, res) => {
    try {
      // First get the lot to find the actual lot_id string
      const lot = await storage.getLotEntry(req.params.lotId);
      if (!lot) {
        return res.status(404).json({ error: "Lot not found" });
      }
      
      const subFields = await storage.getLotEntrySubFields(lot.lotId);
      
      // Enrich with farmer and product names
      const accounts = await storage.getAccountMasters('2025-26', ''); // Get all accounts
      const products = await storage.getProductMasters('2025-26', ''); // Get all products
      
      const enrichedSubFields = subFields.map(sub => {
        const farmer = accounts.find(acc => acc.id === sub.farmerAgentId);
        const product = products.find(prod => prod.id === sub.productId);
        
        return {
          ...sub,
          farmerName: farmer?.name || 'Unknown Farmer',
          farmerAccountId: farmer?.accountId || '',
          productName: product?.name || 'Unknown Product',
          availableQuantity: sub.quantity, // For now, same as quantity - will be reduced by sales later
          availableWeight: sub.weight, // For now, same as weight - will be reduced by sales later
        };
      });
      
      res.json(enrichedSubFields);
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

  // Farmer Invoice Module - Lot Sales Routes (for Dhada Book)
  app.get("/api/lot-sales", async (req, res) => {
    try {
      const { lotId, subLotId, fy } = req.query;
      const sales = await storage.getLotSales(
        lotId as string | undefined, 
        subLotId as string | undefined, 
        fy as string | undefined
      );
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lot sales" });
    }
  });

  app.get("/api/lot-sales/:id", async (req, res) => {
    try {
      const sale = await storage.getLotSale(req.params.id);
      if (!sale) {
        return res.status(404).json({ error: "Lot sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lot sale" });
    }
  });

  app.post("/api/lot-sales", async (req, res) => {
    try {
      const validatedData = insertLotSalesSchema.parse(req.body);
      const sale = await storage.createLotSale(validatedData);
      res.status(201).json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid lot sale data" });
    }
  });

  app.put("/api/lot-sales/:id", async (req, res) => {
    try {
      const validatedData = updateLotSalesSchema.parse(req.body);
      const sale = await storage.updateLotSale(req.params.id, validatedData);
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update lot sale" });
    }
  });

  app.delete("/api/lot-sales/:id", async (req, res) => {
    try {
      const success = await storage.deleteLotSale(req.params.id);
      if (success) {
        res.json({ message: "Lot sale deleted successfully" });
      } else {
        res.status(404).json({ error: "Lot sale not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lot sale" });
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

  // Account Balance Routes
  app.get("/api/ledger/customers/search", async (req, res) => {
    try {
      const { q = "", fy = "2025-26" } = req.query;
      const customers = await storage.searchCustomers(q as string, fy as string);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to search customers" });
    }
  });

  app.get("/api/ledger/balance/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      const { fy = "2025-26" } = req.query;
      const balance = await storage.getAccountBalance(accountId, fy as string);
      if (!balance) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(balance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch account balance" });
    }
  });

  // Ledger Reminder Routes
  app.get("/api/ledger/reminders", async (req, res) => {
    try {
      const { accountId, fy, status } = req.query;
      const reminders = await storage.getLedgerReminders(
        accountId as string | undefined,
        fy as string | undefined,
        status as string | undefined
      );
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  app.post("/api/ledger/reminders", async (req, res) => {
    try {
      const reminder = await storage.createLedgerReminder(req.body);
      res.status(201).json(reminder);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create reminder" });
    }
  });

  app.put("/api/ledger/reminders/:id", async (req, res) => {
    try {
      const reminder = await storage.updateLedgerReminder(req.params.id, req.body);
      res.json(reminder);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update reminder" });
    }
  });

  app.delete("/api/ledger/reminders/:id", async (req, res) => {
    try {
      const success = await storage.deleteLedgerReminder(req.params.id);
      if (success) {
        res.json({ message: "Reminder deleted successfully" });
      } else {
        res.status(404).json({ error: "Reminder not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete reminder" });
    }
  });

  // Reports Module Routes
  app.get("/api/reports/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const { fy = "2025-26", ...filters } = req.query;
      const reports = await storage.getReport(type, fy as string, filters as Record<string, any>);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports/:type/snapshot", async (req, res) => {
    try {
      const { type } = req.params;
      const validatedData = { ...req.body, type };
      const snapshot = await storage.createReportSnapshot(validatedData);
      res.status(201).json(snapshot);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create snapshot" });
    }
  });

  app.get("/api/report-configs", async (req, res) => {
    try {
      const { type, fy } = req.query;
      const configs = await storage.getReportConfigs(type as string, fy as string);
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch report configs" });
    }
  });

  app.post("/api/report-configs", async (req, res) => {
    try {
      const config = await storage.createReportConfig(req.body);
      res.status(201).json(config);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create report config" });
    }
  });

  // Settings Module API Routes

  // Company Profile Routes
  app.get("/api/company-profiles", async (req, res) => {
    try {
      const { fy = "2025-26" } = req.query;
      const profiles = await storage.getCompanyProfiles(fy as string);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company profiles" });
    }
  });

  app.get("/api/company-profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getCompanyProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Company profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company profile" });
    }
  });

  app.post("/api/company-profiles", async (req, res) => {
    try {
      const validatedData = insertCompanyProfileSchema.parse(req.body);
      const profile = await storage.createCompanyProfile(validatedData);
      res.status(201).json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create company profile" });
    }
  });

  app.put("/api/company-profiles/:id", async (req, res) => {
    try {
      const validatedData = updateCompanyProfileSchema.parse(req.body);
      const profile = await storage.updateCompanyProfile(req.params.id, validatedData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update company profile" });
    }
  });

  app.delete("/api/company-profiles/:id", async (req, res) => {
    try {
      const success = await storage.deleteCompanyProfile(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Company profile not found" });
      }
      res.json({ message: "Company profile deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete company profile" });
    }
  });

  // Default Expenses Routes
  app.get("/api/default-expenses", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const expenses = await storage.getDefaultExpenses(fy as string, search as string);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch default expenses" });
    }
  });

  app.get("/api/default-expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getDefaultExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: "Default expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch default expense" });
    }
  });

  app.post("/api/default-expenses", async (req, res) => {
    try {
      const validatedData = insertDefaultExpensesSchema.parse(req.body);
      const expense = await storage.createDefaultExpense(validatedData);
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create default expense" });
    }
  });

  app.put("/api/default-expenses/:id", async (req, res) => {
    try {
      const validatedData = updateDefaultExpensesSchema.parse(req.body);
      const expense = await storage.updateDefaultExpense(req.params.id, validatedData);
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update default expense" });
    }
  });

  app.delete("/api/default-expenses/:id", async (req, res) => {
    try {
      const success = await storage.deleteDefaultExpense(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Default expense not found" });
      }
      res.json({ message: "Default expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete default expense" });
    }
  });

  // Printing Settings Routes
  app.get("/api/printing-settings", async (req, res) => {
    try {
      const { fy = "2025-26" } = req.query;
      const settings = await storage.getPrintingSettings(fy as string);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch printing settings" });
    }
  });

  app.get("/api/printing-settings/:id", async (req, res) => {
    try {
      const setting = await storage.getPrintingSetting(req.params.id);
      if (!setting) {
        return res.status(404).json({ error: "Printing setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch printing setting" });
    }
  });

  app.post("/api/printing-settings", async (req, res) => {
    try {
      const validatedData = insertPrintingSettingsSchema.parse(req.body);
      const setting = await storage.createPrintingSetting(validatedData);
      res.status(201).json(setting);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create printing setting" });
    }
  });

  app.put("/api/printing-settings/:id", async (req, res) => {
    try {
      const validatedData = updatePrintingSettingsSchema.parse(req.body);
      const setting = await storage.updatePrintingSetting(req.params.id, validatedData);
      res.json(setting);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update printing setting" });
    }
  });

  app.delete("/api/printing-settings/:id", async (req, res) => {
    try {
      const success = await storage.deletePrintingSetting(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Printing setting not found" });
      }
      res.json({ message: "Printing setting deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete printing setting" });
    }
  });

  // Module Settings Routes
  app.get("/api/module-settings", async (req, res) => {
    try {
      const { fy = "2025-26" } = req.query;
      const settings = await storage.getModuleSettings(fy as string);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch module settings" });
    }
  });

  app.get("/api/module-settings/:id", async (req, res) => {
    try {
      const setting = await storage.getModuleSetting(req.params.id);
      if (!setting) {
        return res.status(404).json({ error: "Module setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch module setting" });
    }
  });

  app.post("/api/module-settings", async (req, res) => {
    try {
      const validatedData = insertModuleSettingsSchema.parse(req.body);
      const setting = await storage.createModuleSetting(validatedData);
      res.status(201).json(setting);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create module setting" });
    }
  });

  app.put("/api/module-settings/:id", async (req, res) => {
    try {
      const validatedData = updateModuleSettingsSchema.parse(req.body);
      const setting = await storage.updateModuleSetting(req.params.id, validatedData);
      res.json(setting);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update module setting" });
    }
  });

  app.delete("/api/module-settings/:id", async (req, res) => {
    try {
      const success = await storage.deleteModuleSetting(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Module setting not found" });
      }
      res.json({ message: "Module setting deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete module setting" });
    }
  });

  // WhatsApp Messages Routes
  app.get("/api/whatsapp-messages", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const messages = await storage.getWhatsappMessages(fy as string, search as string);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch WhatsApp messages" });
    }
  });

  app.get("/api/whatsapp-messages/:id", async (req, res) => {
    try {
      const message = await storage.getWhatsappMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "WhatsApp message not found" });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch WhatsApp message" });
    }
  });

  app.post("/api/whatsapp-messages", async (req, res) => {
    try {
      const validatedData = insertWhatsappMessagesSchema.parse(req.body);
      const message = await storage.createWhatsappMessage(validatedData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create WhatsApp message" });
    }
  });

  app.put("/api/whatsapp-messages/:id", async (req, res) => {
    try {
      const validatedData = updateWhatsappMessagesSchema.parse(req.body);
      const message = await storage.updateWhatsappMessage(req.params.id, validatedData);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update WhatsApp message" });
    }
  });

  app.delete("/api/whatsapp-messages/:id", async (req, res) => {
    try {
      const success = await storage.deleteWhatsappMessage(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "WhatsApp message not found" });
      }
      res.json({ message: "WhatsApp message deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete WhatsApp message" });
    }
  });

  // WhatsApp Templates Routes
  app.get("/api/whatsapp-templates", async (req, res) => {
    try {
      const { fy = "2025-26", search } = req.query;
      const templates = await storage.getWhatsappTemplates(fy as string, search as string);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch WhatsApp templates" });
    }
  });

  app.get("/api/whatsapp-templates/:id", async (req, res) => {
    try {
      const template = await storage.getWhatsappTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "WhatsApp template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch WhatsApp template" });
    }
  });

  app.post("/api/whatsapp-templates", async (req, res) => {
    try {
      const validatedData = insertWhatsappTemplatesSchema.parse(req.body);
      const template = await storage.createWhatsappTemplate(validatedData);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create WhatsApp template" });
    }
  });

  app.put("/api/whatsapp-templates/:id", async (req, res) => {
    try {
      const validatedData = updateWhatsappTemplatesSchema.parse(req.body);
      const template = await storage.updateWhatsappTemplate(req.params.id, validatedData);
      res.json(template);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update WhatsApp template" });
    }
  });

  app.delete("/api/whatsapp-templates/:id", async (req, res) => {
    try {
      const success = await storage.deleteWhatsappTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "WhatsApp template not found" });
      }
      res.json({ message: "WhatsApp template deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete WhatsApp template" });
    }
  });

  // WhatsApp Settings Routes
  app.get("/api/whatsapp-settings", async (req, res) => {
    try {
      const { fy = "2025-26" } = req.query;
      const settings = await storage.getWhatsappSettings(fy as string);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch WhatsApp settings" });
    }
  });

  app.get("/api/whatsapp-settings/:id", async (req, res) => {
    try {
      const setting = await storage.getWhatsappSetting(req.params.id);
      if (!setting) {
        return res.status(404).json({ error: "WhatsApp setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch WhatsApp setting" });
    }
  });

  app.post("/api/whatsapp-settings", async (req, res) => {
    try {
      const validatedData = insertWhatsappSettingsSchema.parse(req.body);
      const setting = await storage.createWhatsappSetting(validatedData);
      res.status(201).json(setting);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create WhatsApp setting" });
    }
  });

  app.put("/api/whatsapp-settings/:id", async (req, res) => {
    try {
      const validatedData = updateWhatsappSettingsSchema.parse(req.body);
      const setting = await storage.updateWhatsappSetting(req.params.id, validatedData);
      res.json(setting);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update WhatsApp setting" });
    }
  });

  app.delete("/api/whatsapp-settings/:id", async (req, res) => {
    try {
      const success = await storage.deleteWhatsappSetting(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "WhatsApp setting not found" });
      }
      res.json({ message: "WhatsApp setting deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete WhatsApp setting" });
    }
  });

  // Rate Calculation Routes
  app.get("/api/rates/average", async (req, res) => {
    try {
      const { productId, quality, financialYear = "FY2025-26", days } = req.query;
      
      if (!productId || !quality) {
        return res.status(400).json({ error: "productId and quality are required" });
      }

      const daysNum = days ? parseInt(days as string) : undefined;
      const result = await storage.getAverageRate(
        productId as string, 
        quality as string, 
        financialYear as string, 
        daysNum
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching average rate:", error);
      res.status(500).json({ error: "Failed to fetch average rate" });
    }
  });

  // Create a new sales transaction
  app.post("/api/sales-transactions", async (req, res) => {
    try {
      const validatedData = insertSalesTransactionsSchema.parse(req.body);
      const transaction = await storage.createSalesTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error: any) {
      console.error("Error creating sales transaction:", error);
      res.status(400).json({ error: error.message || "Failed to create sales transaction" });
    }
  });

  // Accounting Integrations Routes
  app.get("/api/accounting/integrations", async (req, res) => {
    try {
      const { financialYear = "2025-26" } = req.query;
      const integrations = await storage.getAccountingIntegrations(financialYear as string);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching accounting integrations:", error);
      res.status(500).json({ error: "Failed to fetch accounting integrations" });
    }
  });

  app.get("/api/accounting/integrations/:id", async (req, res) => {
    try {
      const integration = await storage.getAccountingIntegration(req.params.id);
      if (!integration) {
        return res.status(404).json({ error: "Accounting integration not found" });
      }
      res.json(integration);
    } catch (error) {
      console.error("Error fetching accounting integration:", error);
      res.status(500).json({ error: "Failed to fetch accounting integration" });
    }
  });

  app.post("/api/accounting/integrations", async (req, res) => {
    try {
      const validatedData = insertAccountingIntegrationsSchema.parse(req.body);
      const integration = await storage.createAccountingIntegration(validatedData);
      res.status(201).json(integration);
    } catch (error: any) {
      console.error("Error creating accounting integration:", error);
      res.status(400).json({ error: error.message || "Failed to create accounting integration" });
    }
  });

  app.put("/api/accounting/integrations/:id", async (req, res) => {
    try {
      const validatedData = updateAccountingIntegrationsSchema.parse(req.body);
      const updated = await storage.updateAccountingIntegration(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Accounting integration not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating accounting integration:", error);
      res.status(400).json({ error: error.message || "Failed to update accounting integration" });
    }
  });

  app.delete("/api/accounting/integrations/:id", async (req, res) => {
    try {
      const success = await storage.deleteAccountingIntegration(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Accounting integration not found" });
      }
      res.json({ message: "Accounting integration deleted successfully" });
    } catch (error) {
      console.error("Error deleting accounting integration:", error);
      res.status(500).json({ error: "Failed to delete accounting integration" });
    }
  });

  // Accounting Sync Operations
  app.post("/api/accounting/integrations/:id/sync", async (req, res) => {
    try {
      const { syncType, entityIds } = req.body;
      if (!syncType) {
        return res.status(400).json({ error: "syncType is required" });
      }
      const result = await storage.syncAccountingData(req.params.id, syncType, entityIds);
      res.json(result);
    } catch (error: any) {
      console.error("Error syncing accounting data:", error);
      res.status(500).json({ error: error.message || "Failed to sync accounting data" });
    }
  });

  app.get("/api/accounting/integrations/:id/sync-status", async (req, res) => {
    try {
      const status = await storage.getAccountingSyncStatus(req.params.id);
      res.json(status);
    } catch (error) {
      console.error("Error fetching sync status:", error);
      res.status(500).json({ error: "Failed to fetch sync status" });
    }
  });

  // Accounting Sync Logs
  app.get("/api/accounting/sync-logs", async (req, res) => {
    try {
      const { integrationId, financialYear = "2025-26", limit = 50 } = req.query;
      const logs = await storage.getAccountingSyncLogs(
        integrationId as string,
        financialYear as string,
        parseInt(limit as string)
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching sync logs:", error);
      res.status(500).json({ error: "Failed to fetch sync logs" });
    }
  });

  app.post("/api/accounting/sync-logs", async (req, res) => {
    try {
      const validatedData = insertAccountingSyncLogsSchema.parse(req.body);
      const log = await storage.createAccountingSyncLog(validatedData);
      res.status(201).json(log);
    } catch (error: any) {
      console.error("Error creating sync log:", error);
      res.status(400).json({ error: error.message || "Failed to create sync log" });
    }
  });

  // Accounting Mappings
  app.get("/api/accounting/mappings", async (req, res) => {
    try {
      const { integrationId, entityType, financialYear = "2025-26" } = req.query;
      if (!integrationId) {
        return res.status(400).json({ error: "integrationId is required" });
      }
      const mappings = await storage.getAccountingMappings(
        integrationId as string,
        entityType as string,
        financialYear as string
      );
      res.json(mappings);
    } catch (error) {
      console.error("Error fetching accounting mappings:", error);
      res.status(500).json({ error: "Failed to fetch accounting mappings" });
    }
  });

  app.post("/api/accounting/mappings", async (req, res) => {
    try {
      const validatedData = insertAccountingMappingsSchema.parse(req.body);
      const mapping = await storage.createAccountingMapping(validatedData);
      res.status(201).json(mapping);
    } catch (error: any) {
      console.error("Error creating accounting mapping:", error);
      res.status(400).json({ error: error.message || "Failed to create accounting mapping" });
    }
  });

  app.delete("/api/accounting/mappings/:id", async (req, res) => {
    try {
      const success = await storage.deleteAccountingMapping(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Accounting mapping not found" });
      }
      res.json({ message: "Accounting mapping deleted successfully" });
    } catch (error) {
      console.error("Error deleting accounting mapping:", error);
      res.status(500).json({ error: "Failed to delete accounting mapping" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
