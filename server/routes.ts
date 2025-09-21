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
  updateWeightSlipSchema
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

  const httpServer = createServer(app);
  return httpServer;
}
