import { 
  type User, 
  type InsertUser,
  type AccountMaster,
  type InsertAccountMaster,
  type UpdateAccountMaster,
  type ProductMaster,
  type InsertProductMaster,
  type UpdateProductMaster,
  type ProductExpenses,
  type InsertProductExpenses,
  type UpdateProductExpenses,
  type PlaceMaster,
  type InsertPlaceMaster,
  type UpdatePlaceMaster
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Account Master operations
  getAccountMasters(financialYear: string, searchTerm?: string): Promise<AccountMaster[]>;
  getAccountMaster(id: string): Promise<AccountMaster | undefined>;
  createAccountMaster(account: InsertAccountMaster): Promise<AccountMaster>;
  updateAccountMaster(id: string, account: UpdateAccountMaster): Promise<AccountMaster>;
  deleteAccountMaster(id: string): Promise<boolean>;
  generateAccountId(): Promise<string>;
  
  // Product Master operations
  getProductMasters(financialYear: string, searchTerm?: string): Promise<ProductMaster[]>;
  getProductMaster(id: string): Promise<ProductMaster | undefined>;
  createProductMaster(product: InsertProductMaster): Promise<ProductMaster>;
  updateProductMaster(id: string, product: UpdateProductMaster): Promise<ProductMaster>;
  deleteProductMaster(id: string): Promise<boolean>;
  generateProductId(name: string): Promise<string>;
  
  // Product Expenses operations
  getProductExpenses(financialYear: string, productId?: string): Promise<ProductExpenses[]>;
  getProductExpense(id: string): Promise<ProductExpenses | undefined>;
  createProductExpense(expense: InsertProductExpenses): Promise<ProductExpenses>;
  updateProductExpense(id: string, expense: UpdateProductExpenses): Promise<ProductExpenses>;
  deleteProductExpense(id: string): Promise<boolean>;
  
  // Place Master operations
  getPlaceMasters(financialYear: string, searchTerm?: string): Promise<PlaceMaster[]>;
  getPlaceMaster(id: string): Promise<PlaceMaster | undefined>;
  createPlaceMaster(place: InsertPlaceMaster): Promise<PlaceMaster>;
  updatePlaceMaster(id: string, place: UpdatePlaceMaster): Promise<PlaceMaster>;
  deletePlaceMaster(id: string): Promise<boolean>;
  generatePlaceId(): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private accounts: Map<string, AccountMaster>;
  private products: Map<string, ProductMaster>;
  private expenses: Map<string, ProductExpenses>;
  private places: Map<string, PlaceMaster>;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.products = new Map();
    this.expenses = new Map();
    this.places = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Account Master operations
  async getAccountMasters(financialYear: string, searchTerm?: string): Promise<AccountMaster[]> {
    const accounts = Array.from(this.accounts.values()).filter(account => 
      account.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return accounts.filter(account =>
        account.name.toLowerCase().includes(searchLower) ||
        account.accountId.toLowerCase().includes(searchLower) ||
        (account.mobile && account.mobile.includes(searchTerm))
      );
    }
    
    return accounts;
  }

  async getAccountMaster(id: string): Promise<AccountMaster | undefined> {
    return this.accounts.get(id);
  }

  async createAccountMaster(account: InsertAccountMaster): Promise<AccountMaster> {
    const accountId = await this.generateAccountId();
    const id = randomUUID();
    const now = new Date();
    const accountData: AccountMaster = {
      ...account,
      id,
      accountId,
      mobile: account.mobile || null,
      address: account.address || null,
      placeId: account.placeId || null,
      bankDetails: account.bankDetails || null,
      openingBalance: account.openingBalance || '0',
      creditLimit: account.creditLimit || '0',
      creditTime: account.creditTime || 0,
      remarks: account.remarks || null,
      customFields: account.customFields || null,
      active: account.active ?? true,
      financialYear: account.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    this.accounts.set(id, accountData);
    return accountData;
  }

  async updateAccountMaster(id: string, account: UpdateAccountMaster): Promise<AccountMaster> {
    const existing = this.accounts.get(id);
    if (!existing) {
      throw new Error('Account not found');
    }
    const updated: AccountMaster = {
      ...existing,
      ...account,
      updatedAt: new Date(),
    };
    this.accounts.set(id, updated);
    return updated;
  }

  async deleteAccountMaster(id: string): Promise<boolean> {
    return this.accounts.delete(id);
  }

  async generateAccountId(): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get count of accounts for current month
    const accounts = Array.from(this.accounts.values());
    const currentMonthAccounts = accounts.filter(account => 
      account.accountId.startsWith(`B-SV${currentYear}${currentMonth}`)
    );
    
    const nextNumber = String(currentMonthAccounts.length + 1).padStart(2, '0');
    return `B-SV${currentYear}${currentMonth}${nextNumber}`;
  }

  // Product Master operations
  async getProductMasters(financialYear: string, searchTerm?: string): Promise<ProductMaster[]> {
    const products = Array.from(this.products.values()).filter(product => 
      product.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return products.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.productId.toLowerCase().includes(searchLower)
      );
    }
    
    return products;
  }

  async getProductMaster(id: string): Promise<ProductMaster | undefined> {
    return this.products.get(id);
  }

  async createProductMaster(product: InsertProductMaster): Promise<ProductMaster> {
    const productId = await this.generateProductId(product.name);
    const id = randomUUID();
    const now = new Date();
    const productData: ProductMaster = {
      ...product,
      id,
      productId,
      customFields: product.customFields || null,
      active: product.active ?? true,
      financialYear: product.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(id, productData);
    return productData;
  }

  async updateProductMaster(id: string, product: UpdateProductMaster): Promise<ProductMaster> {
    const existing = this.products.get(id);
    if (!existing) {
      throw new Error('Product not found');
    }
    const updated: ProductMaster = {
      ...existing,
      ...product,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProductMaster(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async generateProductId(name: string): Promise<string> {
    const baseName = name.split(' ')[0].toLowerCase();
    const capitalizedName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    
    // Get count of products with similar names
    const products = Array.from(this.products.values());
    const similarProducts = products.filter(product => 
      product.productId.startsWith(`${capitalizedName}-`)
    );
    
    const nextNumber = String(similarProducts.length + 1).padStart(2, '0');
    return `${capitalizedName}-${nextNumber}`;
  }

  // Product Expenses operations
  async getProductExpenses(financialYear: string, productId?: string): Promise<ProductExpenses[]> {
    const expenses = Array.from(this.expenses.values()).filter(expense => 
      expense.financialYear === financialYear
    );
    
    if (productId) {
      return expenses.filter(expense => expense.productId === productId);
    }
    
    return expenses;
  }

  async getProductExpense(id: string): Promise<ProductExpenses | undefined> {
    return this.expenses.get(id);
  }

  async createProductExpense(expense: InsertProductExpenses): Promise<ProductExpenses> {
    const id = randomUUID();
    const now = new Date();
    const expenseData: ProductExpenses = {
      ...expense,
      id,
      customFields: expense.customFields || null,
      active: expense.active ?? true,
      financialYear: expense.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    this.expenses.set(id, expenseData);
    return expenseData;
  }

  async updateProductExpense(id: string, expense: UpdateProductExpenses): Promise<ProductExpenses> {
    const existing = this.expenses.get(id);
    if (!existing) {
      throw new Error('Expense not found');
    }
    const updated: ProductExpenses = {
      ...existing,
      ...expense,
      updatedAt: new Date(),
    };
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteProductExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Place Master operations
  async getPlaceMasters(financialYear: string, searchTerm?: string): Promise<PlaceMaster[]> {
    const places = Array.from(this.places.values()).filter(place => 
      place.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return places.filter(place =>
        place.name.toLowerCase().includes(searchLower) ||
        place.placeId.toLowerCase().includes(searchLower)
      );
    }
    
    return places;
  }

  async getPlaceMaster(id: string): Promise<PlaceMaster | undefined> {
    return this.places.get(id);
  }

  async createPlaceMaster(place: InsertPlaceMaster): Promise<PlaceMaster> {
    const placeId = await this.generatePlaceId();
    const id = randomUUID();
    const now = new Date();
    const placeData: PlaceMaster = {
      ...place,
      id,
      placeId,
      description: place.description || null,
      customFields: place.customFields || null,
      active: place.active ?? true,
      financialYear: place.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    this.places.set(id, placeData);
    return placeData;
  }

  async updatePlaceMaster(id: string, place: UpdatePlaceMaster): Promise<PlaceMaster> {
    const existing = this.places.get(id);
    if (!existing) {
      throw new Error('Place not found');
    }
    const updated: PlaceMaster = {
      ...existing,
      ...place,
      updatedAt: new Date(),
    };
    this.places.set(id, updated);
    return updated;
  }

  async deletePlaceMaster(id: string): Promise<boolean> {
    return this.places.delete(id);
  }

  async generatePlaceId(): Promise<string> {
    // Get count of places
    const places = Array.from(this.places.values());
    const nextNumber = String(places.length + 1).padStart(2, '0');
    return `PLC-${nextNumber}`;
  }
}

export const storage = new MemStorage();
