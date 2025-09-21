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
  updatePlaceMasterSchema
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

  const httpServer = createServer(app);
  return httpServer;
}
