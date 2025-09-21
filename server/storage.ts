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
  type UpdatePlaceMaster,
  type LotEntry,
  type InsertLotEntry,
  type UpdateLotEntry,
  type LotEntrySubFields,
  type InsertLotEntrySubFields,
  type UpdateLotEntrySubFields,
  type GodownAwak,
  type InsertGodownAwak,
  type UpdateGodownAwak,
  type Damage,
  type InsertDamage,
  type UpdateDamage,
  type WeightSlip,
  type InsertWeightSlip,
  type UpdateWeightSlip,
  users,
  accountMaster,
  productMaster,
  productExpenses,
  placeMaster,
  lotEntry,
  lotEntrySubFields,
  godownAwak,
  damage,
  weightSlip
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, like, ilike } from "drizzle-orm";

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
  
  // Inventory operations - Lot Entry
  getLotEntries(financialYear: string, searchTerm?: string): Promise<LotEntry[]>;
  getLotEntry(id: string): Promise<LotEntry | undefined>;
  createLotEntry(lot: InsertLotEntry): Promise<LotEntry>;
  updateLotEntry(id: string, lot: UpdateLotEntry): Promise<LotEntry>;
  deleteLotEntry(id: string): Promise<boolean>;
  generateLotId(productName: string, quantity: number): Promise<string>;
  
  // Lot Entry Sub-Fields
  getLotEntrySubFields(lotId: string): Promise<LotEntrySubFields[]>;
  createLotEntrySubField(subField: InsertLotEntrySubFields): Promise<LotEntrySubFields>;
  updateLotEntrySubField(id: string, subField: UpdateLotEntrySubFields): Promise<LotEntrySubFields>;
  deleteLotEntrySubField(id: string): Promise<boolean>;
  
  // Godown Awak operations
  getGodownAwaks(financialYear: string, searchTerm?: string): Promise<GodownAwak[]>;
  getGodownAwak(id: string): Promise<GodownAwak | undefined>;
  createGodownAwak(awak: InsertGodownAwak): Promise<GodownAwak>;
  updateGodownAwak(id: string, awak: UpdateGodownAwak): Promise<GodownAwak>;
  deleteGodownAwak(id: string): Promise<boolean>;
  generateGodownAwakId(): Promise<string>;
  
  // Damage operations
  getDamages(financialYear: string, searchTerm?: string): Promise<Damage[]>;
  getDamage(id: string): Promise<Damage | undefined>;
  createDamage(damage: InsertDamage): Promise<Damage>;
  updateDamage(id: string, damage: UpdateDamage): Promise<Damage>;
  deleteDamage(id: string): Promise<boolean>;
  generateDamageId(): Promise<string>;
  
  // Weight Slip operations
  getWeightSlips(financialYear: string, searchTerm?: string): Promise<WeightSlip[]>;
  getWeightSlip(id: string): Promise<WeightSlip | undefined>;
  createWeightSlip(slip: InsertWeightSlip): Promise<WeightSlip>;
  updateWeightSlip(id: string, slip: UpdateWeightSlip): Promise<WeightSlip>;
  deleteWeightSlip(id: string): Promise<boolean>;
  generateWeightSlipId(): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private accounts: Map<string, AccountMaster>;
  private products: Map<string, ProductMaster>;
  private expenses: Map<string, ProductExpenses>;
  private places: Map<string, PlaceMaster>;
  private lotEntries: Map<string, LotEntry>;
  private lotEntrySubFields: Map<string, LotEntrySubFields>;
  private godownAwaks: Map<string, GodownAwak>;
  private damages: Map<string, Damage>;
  private weightSlips: Map<string, WeightSlip>;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.products = new Map();
    this.expenses = new Map();
    this.places = new Map();
    this.lotEntries = new Map();
    this.lotEntrySubFields = new Map();
    this.godownAwaks = new Map();
    this.damages = new Map();
    this.weightSlips = new Map();
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

  // Inventory operations - Lot Entry
  async getLotEntries(financialYear: string, searchTerm?: string): Promise<LotEntry[]> {
    const lots = Array.from(this.lotEntries.values()).filter(lot => 
      lot.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return lots.filter(lot =>
        lot.lotId.toLowerCase().includes(searchLower) ||
        lot.transportName.toLowerCase().includes(searchLower) ||
        lot.productId.toLowerCase().includes(searchLower)
      );
    }
    
    return lots;
  }

  async getLotEntry(id: string): Promise<LotEntry | undefined> {
    return this.lotEntries.get(id);
  }

  async createLotEntry(lot: InsertLotEntry): Promise<LotEntry> {
    const lotId = await this.generateLotId("Product", Number(lot.totalQuantity));
    const id = randomUUID();
    const now = new Date();
    
    // Calculate average weight if total weight is provided
    const averageWeight = lot.totalWeight ? 
      (Number(lot.totalWeight) / Number(lot.totalQuantity)).toString() : null;
    
    const lotData: LotEntry = {
      ...lot,
      id,
      lotId,
      advance: lot.advance || null,
      otherExpenses: lot.otherExpenses || null,
      totalWeight: lot.totalWeight || null,
      averageWeight,
      customFields: lot.customFields || null,
      financialYear: lot.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    this.lotEntries.set(id, lotData);
    return lotData;
  }

  async updateLotEntry(id: string, lot: UpdateLotEntry): Promise<LotEntry> {
    const existing = this.lotEntries.get(id);
    if (!existing) {
      throw new Error('Lot entry not found');
    }
    
    // Recalculate average weight if total weight or quantity changed
    let averageWeight = existing.averageWeight;
    if (lot.totalWeight || lot.totalQuantity) {
      const newWeight = lot.totalWeight || existing.totalWeight;
      const newQuantity = lot.totalQuantity || existing.totalQuantity;
      if (newWeight && newQuantity) {
        averageWeight = (Number(newWeight) / Number(newQuantity)).toString();
      }
    }
    
    const updated: LotEntry = {
      ...existing,
      ...lot,
      averageWeight,
      updatedAt: new Date(),
    };
    this.lotEntries.set(id, updated);
    return updated;
  }

  async deleteLotEntry(id: string): Promise<boolean> {
    return this.lotEntries.delete(id);
  }

  async generateLotId(productName: string, quantity: number): Promise<string> {
    const lots = Array.from(this.lotEntries.values());
    const count = lots.length;
    return `${productName}${String(quantity).padStart(2, '0')}-${count}`;
  }

  // Lot Entry Sub-Fields
  async getLotEntrySubFields(lotId: string): Promise<LotEntrySubFields[]> {
    return Array.from(this.lotEntrySubFields.values()).filter(sub => 
      sub.lotId === lotId
    );
  }

  async createLotEntrySubField(subField: InsertLotEntrySubFields): Promise<LotEntrySubFields> {
    const id = randomUUID();
    const now = new Date();
    const subFieldData: LotEntrySubFields = {
      ...subField,
      id,
      weight: subField.weight || null,
      freight: subField.freight || null,
      averageRate: subField.averageRate || null,
      customFields: subField.customFields || null,
      createdAt: now,
      updatedAt: now,
    };
    this.lotEntrySubFields.set(id, subFieldData);
    return subFieldData;
  }

  async updateLotEntrySubField(id: string, subField: UpdateLotEntrySubFields): Promise<LotEntrySubFields> {
    const existing = this.lotEntrySubFields.get(id);
    if (!existing) {
      throw new Error('Lot entry sub-field not found');
    }
    const updated: LotEntrySubFields = {
      ...existing,
      ...subField,
      updatedAt: new Date(),
    };
    this.lotEntrySubFields.set(id, updated);
    return updated;
  }

  async deleteLotEntrySubField(id: string): Promise<boolean> {
    return this.lotEntrySubFields.delete(id);
  }

  // Godown Awak operations
  async getGodownAwaks(financialYear: string, searchTerm?: string): Promise<GodownAwak[]> {
    const awaks = Array.from(this.godownAwaks.values()).filter(awak => 
      awak.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return awaks.filter(awak =>
        awak.godownAwakId.toLowerCase().includes(searchLower) ||
        awak.linkedLotId.toLowerCase().includes(searchLower)
      );
    }
    
    return awaks;
  }

  async getGodownAwak(id: string): Promise<GodownAwak | undefined> {
    return this.godownAwaks.get(id);
  }

  async createGodownAwak(awak: InsertGodownAwak): Promise<GodownAwak> {
    const godownAwakId = await this.generateGodownAwakId();
    const id = randomUUID();
    const now = new Date();
    
    // Calculate inVehicle automatically
    const totalArrived = Number(awak.totalArrived || 0);
    const sold = Number(awak.sold || 0);
    const inGodown = Number(awak.inGodown);
    const inVehicle = (totalArrived - sold - inGodown).toString();
    
    const awakData: GodownAwak = {
      ...awak,
      id,
      godownAwakId,
      totalArrived: awak.totalArrived || null,
      sold: awak.sold || '0',
      inVehicle,
      customFields: awak.customFields || null,
      financialYear: awak.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    this.godownAwaks.set(id, awakData);
    return awakData;
  }

  async updateGodownAwak(id: string, awak: UpdateGodownAwak): Promise<GodownAwak> {
    const existing = this.godownAwaks.get(id);
    if (!existing) {
      throw new Error('Godown awak not found');
    }
    
    // Recalculate inVehicle if relevant fields changed
    let inVehicle = existing.inVehicle;
    const totalArrived = Number(awak.totalArrived || existing.totalArrived || 0);
    const sold = Number(awak.sold || existing.sold || 0);
    const inGodown = Number(awak.inGodown || existing.inGodown);
    inVehicle = (totalArrived - sold - inGodown).toString();
    
    const updated: GodownAwak = {
      ...existing,
      ...awak,
      inVehicle,
      updatedAt: new Date(),
    };
    this.godownAwaks.set(id, updated);
    return updated;
  }

  async deleteGodownAwak(id: string): Promise<boolean> {
    return this.godownAwaks.delete(id);
  }

  async generateGodownAwakId(): Promise<string> {
    const awaks = Array.from(this.godownAwaks.values());
    const nextNumber = String(awaks.length + 1).padStart(3, '0');
    return `GA-${nextNumber}`;
  }

  // Damage operations
  async getDamages(financialYear: string, searchTerm?: string): Promise<Damage[]> {
    const damages = Array.from(this.damages.values()).filter(damage => 
      damage.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return damages.filter(damage =>
        damage.damageId.toLowerCase().includes(searchLower) ||
        damage.linkedLotId.toLowerCase().includes(searchLower) ||
        damage.qualityDamaged.toLowerCase().includes(searchLower)
      );
    }
    
    return damages;
  }

  async getDamage(id: string): Promise<Damage | undefined> {
    return this.damages.get(id);
  }

  async createDamage(damage: InsertDamage): Promise<Damage> {
    const damageId = await this.generateDamageId();
    const id = randomUUID();
    const now = new Date();
    const damageData: Damage = {
      ...damage,
      id,
      damageId,
      damagedWeight: damage.damagedWeight || null,
      customFields: damage.customFields || null,
      financialYear: damage.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    this.damages.set(id, damageData);
    return damageData;
  }

  async updateDamage(id: string, damage: UpdateDamage): Promise<Damage> {
    const existing = this.damages.get(id);
    if (!existing) {
      throw new Error('Damage not found');
    }
    const updated: Damage = {
      ...existing,
      ...damage,
      updatedAt: new Date(),
    };
    this.damages.set(id, updated);
    return updated;
  }

  async deleteDamage(id: string): Promise<boolean> {
    return this.damages.delete(id);
  }

  async generateDamageId(): Promise<string> {
    const damages = Array.from(this.damages.values());
    const nextNumber = String(damages.length + 1).padStart(3, '0');
    return `DMG-${nextNumber}`;
  }

  // Weight Slip operations
  async getWeightSlips(financialYear: string, searchTerm?: string): Promise<WeightSlip[]> {
    const slips = Array.from(this.weightSlips.values()).filter(slip => 
      slip.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return slips.filter(slip =>
        slip.weightSlipId.toLowerCase().includes(searchLower) ||
        slip.linkedLotId.toLowerCase().includes(searchLower)
      );
    }
    
    return slips;
  }

  async getWeightSlip(id: string): Promise<WeightSlip | undefined> {
    return this.weightSlips.get(id);
  }

  async createWeightSlip(slip: InsertWeightSlip): Promise<WeightSlip> {
    const weightSlipId = await this.generateWeightSlipId();
    const id = randomUUID();
    const now = new Date();
    
    // Calculate net weight automatically
    const netWeight = (Number(slip.grossWeight) - Number(slip.tareWeight)).toString();
    
    const slipData: WeightSlip = {
      ...slip,
      id,
      weightSlipId,
      netWeight,
      customFields: slip.customFields || null,
      financialYear: slip.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    this.weightSlips.set(id, slipData);
    return slipData;
  }

  async updateWeightSlip(id: string, slip: UpdateWeightSlip): Promise<WeightSlip> {
    const existing = this.weightSlips.get(id);
    if (!existing) {
      throw new Error('Weight slip not found');
    }
    
    // Recalculate net weight if gross or tare weight changed
    let netWeight = existing.netWeight;
    const grossWeight = Number(slip.grossWeight || existing.grossWeight);
    const tareWeight = Number(slip.tareWeight || existing.tareWeight);
    netWeight = (grossWeight - tareWeight).toString();
    
    const updated: WeightSlip = {
      ...existing,
      ...slip,
      netWeight,
      updatedAt: new Date(),
    };
    this.weightSlips.set(id, updated);
    return updated;
  }

  async deleteWeightSlip(id: string): Promise<boolean> {
    return this.weightSlips.delete(id);
  }

  async generateWeightSlipId(): Promise<string> {
    const slips = Array.from(this.weightSlips.values());
    const nextNumber = String(slips.length + 1).padStart(3, '0');
    return `WS-${nextNumber}`;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Account Master operations
  async getAccountMasters(financialYear: string, searchTerm?: string): Promise<AccountMaster[]> {
    let query = db.select().from(accountMaster).where(eq(accountMaster.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(accountMaster).where(
        and(
          eq(accountMaster.financialYear, financialYear),
          like(accountMaster.name, `%${searchTerm}%`)
        )
      );
    }
    
    return await query;
  }

  async getAccountMaster(id: string): Promise<AccountMaster | undefined> {
    const result = await db.select().from(accountMaster).where(eq(accountMaster.id, id));
    return result[0];
  }

  async createAccountMaster(account: InsertAccountMaster): Promise<AccountMaster> {
    const accountId = await this.generateAccountId();
    const accountData = {
      ...account,
      accountId,
      financialYear: account.financialYear || '2025-26'
    };
    const result = await db.insert(accountMaster).values(accountData).returning();
    return result[0];
  }

  async updateAccountMaster(id: string, account: UpdateAccountMaster): Promise<AccountMaster> {
    const result = await db.update(accountMaster)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(accountMaster.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Account not found');
    }
    return result[0];
  }

  async deleteAccountMaster(id: string): Promise<boolean> {
    const result = await db.delete(accountMaster).where(eq(accountMaster.id, id));
    return result.length > 0;
  }

  async generateAccountId(): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get count of accounts for current month
    const accounts = await db.select().from(accountMaster)
      .where(like(accountMaster.accountId, `B-SV${currentYear}${currentMonth}%`));
    
    const nextNumber = String(accounts.length + 1).padStart(2, '0');
    return `B-SV${currentYear}${currentMonth}${nextNumber}`;
  }

  // Product Master operations
  async getProductMasters(financialYear: string, searchTerm?: string): Promise<ProductMaster[]> {
    let query = db.select().from(productMaster).where(eq(productMaster.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(productMaster).where(
        and(
          eq(productMaster.financialYear, financialYear),
          like(productMaster.name, `%${searchTerm}%`)
        )
      );
    }
    
    return await query;
  }

  async getProductMaster(id: string): Promise<ProductMaster | undefined> {
    const result = await db.select().from(productMaster).where(eq(productMaster.id, id));
    return result[0];
  }

  async createProductMaster(product: InsertProductMaster): Promise<ProductMaster> {
    const productId = await this.generateProductId(product.name);
    const productData = {
      ...product,
      productId,
      financialYear: product.financialYear || '2025-26'
    };
    const result = await db.insert(productMaster).values(productData).returning();
    return result[0];
  }

  async updateProductMaster(id: string, product: UpdateProductMaster): Promise<ProductMaster> {
    const result = await db.update(productMaster)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(productMaster.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Product not found');
    }
    return result[0];
  }

  async deleteProductMaster(id: string): Promise<boolean> {
    const result = await db.delete(productMaster).where(eq(productMaster.id, id));
    return result.length > 0;
  }

  async generateProductId(name: string): Promise<string> {
    const baseName = name.split(' ')[0].toLowerCase();
    const capitalizedName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    
    // Get count of products with similar names
    const products = await db.select().from(productMaster)
      .where(like(productMaster.productId, `${capitalizedName}-%`));
    
    const nextNumber = String(products.length + 1).padStart(2, '0');
    return `${capitalizedName}-${nextNumber}`;
  }

  // Product Expenses operations
  async getProductExpenses(financialYear: string, productId?: string): Promise<ProductExpenses[]> {
    let query = db.select().from(productExpenses).where(eq(productExpenses.financialYear, financialYear));
    
    if (productId) {
      query = db.select().from(productExpenses).where(
        and(
          eq(productExpenses.financialYear, financialYear),
          eq(productExpenses.productId, productId)
        )
      );
    }
    
    return await query;
  }

  async getProductExpense(id: string): Promise<ProductExpenses | undefined> {
    const result = await db.select().from(productExpenses).where(eq(productExpenses.id, id));
    return result[0];
  }

  async createProductExpense(expense: InsertProductExpenses): Promise<ProductExpenses> {
    const expenseData = {
      ...expense,
      financialYear: expense.financialYear || '2025-26'
    };
    const result = await db.insert(productExpenses).values(expenseData).returning();
    return result[0];
  }

  async updateProductExpense(id: string, expense: UpdateProductExpenses): Promise<ProductExpenses> {
    const result = await db.update(productExpenses)
      .set({ ...expense, updatedAt: new Date() })
      .where(eq(productExpenses.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Expense not found');
    }
    return result[0];
  }

  async deleteProductExpense(id: string): Promise<boolean> {
    const result = await db.delete(productExpenses).where(eq(productExpenses.id, id));
    return result.length > 0;
  }

  // Place Master operations
  async getPlaceMasters(financialYear: string, searchTerm?: string): Promise<PlaceMaster[]> {
    let query = db.select().from(placeMaster).where(eq(placeMaster.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(placeMaster).where(
        and(
          eq(placeMaster.financialYear, financialYear),
          like(placeMaster.name, `%${searchTerm}%`)
        )
      );
    }
    
    return await query;
  }

  async getPlaceMaster(id: string): Promise<PlaceMaster | undefined> {
    const result = await db.select().from(placeMaster).where(eq(placeMaster.id, id));
    return result[0];
  }

  async createPlaceMaster(place: InsertPlaceMaster): Promise<PlaceMaster> {
    const placeId = await this.generatePlaceId();
    const placeData = {
      ...place,
      placeId,
      financialYear: place.financialYear || '2025-26'
    };
    const result = await db.insert(placeMaster).values(placeData).returning();
    return result[0];
  }

  async updatePlaceMaster(id: string, place: UpdatePlaceMaster): Promise<PlaceMaster> {
    const result = await db.update(placeMaster)
      .set({ ...place, updatedAt: new Date() })
      .where(eq(placeMaster.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Place not found');
    }
    return result[0];
  }

  async deletePlaceMaster(id: string): Promise<boolean> {
    const result = await db.delete(placeMaster).where(eq(placeMaster.id, id));
    return result.length > 0;
  }

  async generatePlaceId(): Promise<string> {
    // Get count of places
    const places = await db.select().from(placeMaster);
    const nextNumber = String(places.length + 1).padStart(2, '0');
    return `PLC-${nextNumber}`;
  }

  // Inventory operations - Lot Entry
  async getLotEntries(financialYear: string, searchTerm?: string): Promise<LotEntry[]> {
    let query = db.select().from(lotEntry).where(eq(lotEntry.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(lotEntry).where(
        and(
          eq(lotEntry.financialYear, financialYear),
          like(lotEntry.lotId, `%${searchTerm}%`)
        )
      );
    }
    
    return await query;
  }

  async getLotEntry(id: string): Promise<LotEntry | undefined> {
    const result = await db.select().from(lotEntry).where(eq(lotEntry.id, id));
    return result[0];
  }

  async createLotEntry(lot: InsertLotEntry): Promise<LotEntry> {
    const lotId = await this.generateLotId("Product", Number(lot.totalQuantity));
    const lotData = {
      ...lot,
      lotId,
      averageWeight: lot.totalWeight ? 
        (Number(lot.totalWeight) / Number(lot.totalQuantity)).toString() : null,
      financialYear: lot.financialYear || '2025-26'
    };
    const result = await db.insert(lotEntry).values(lotData).returning();
    return result[0];
  }

  async updateLotEntry(id: string, lot: UpdateLotEntry): Promise<LotEntry> {
    const existing = await this.getLotEntry(id);
    if (!existing) {
      throw new Error('Lot entry not found');
    }

    // Recalculate average weight if needed
    let averageWeight = existing.averageWeight;
    if (lot.totalWeight || lot.totalQuantity) {
      const newWeight = lot.totalWeight || existing.totalWeight;
      const newQuantity = lot.totalQuantity || existing.totalQuantity;
      if (newWeight && newQuantity) {
        averageWeight = (Number(newWeight) / Number(newQuantity)).toString();
      }
    }

    const result = await db.update(lotEntry)
      .set({ ...lot, averageWeight, updatedAt: new Date() })
      .where(eq(lotEntry.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Lot entry not found');
    }
    return result[0];
  }

  async deleteLotEntry(id: string): Promise<boolean> {
    const result = await db.delete(lotEntry).where(eq(lotEntry.id, id));
    return result.length > 0;
  }

  async generateLotId(productName: string, quantity: number): Promise<string> {
    const lots = await db.select().from(lotEntry);
    const count = lots.length;
    return `${productName}${String(quantity).padStart(2, '0')}-${count}`;
  }

  // Lot Entry Sub-Fields
  async getLotEntrySubFields(lotId: string): Promise<LotEntrySubFields[]> {
    return await db.select().from(lotEntrySubFields).where(eq(lotEntrySubFields.lotId, lotId));
  }

  async createLotEntrySubField(subField: InsertLotEntrySubFields): Promise<LotEntrySubFields> {
    const result = await db.insert(lotEntrySubFields).values(subField).returning();
    return result[0];
  }

  async updateLotEntrySubField(id: string, subField: UpdateLotEntrySubFields): Promise<LotEntrySubFields> {
    const result = await db.update(lotEntrySubFields)
      .set({ ...subField, updatedAt: new Date() })
      .where(eq(lotEntrySubFields.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Lot entry sub-field not found');
    }
    return result[0];
  }

  async deleteLotEntrySubField(id: string): Promise<boolean> {
    const result = await db.delete(lotEntrySubFields).where(eq(lotEntrySubFields.id, id));
    return result.length > 0;
  }

  // Godown Awak operations
  async getGodownAwaks(financialYear: string, searchTerm?: string): Promise<GodownAwak[]> {
    let query = db.select().from(godownAwak).where(eq(godownAwak.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(godownAwak).where(
        and(
          eq(godownAwak.financialYear, financialYear),
          like(godownAwak.godownAwakId, `%${searchTerm}%`)
        )
      );
    }
    
    return await query;
  }

  async getGodownAwak(id: string): Promise<GodownAwak | undefined> {
    const result = await db.select().from(godownAwak).where(eq(godownAwak.id, id));
    return result[0];
  }

  async createGodownAwak(awak: InsertGodownAwak): Promise<GodownAwak> {
    const godownAwakId = await this.generateGodownAwakId();
    
    // Calculate inVehicle automatically
    const totalArrived = Number(awak.totalArrived || 0);
    const sold = Number(awak.sold || 0);
    const inGodown = Number(awak.inGodown);
    const inVehicle = (totalArrived - sold - inGodown).toString();
    
    const awakData = {
      ...awak,
      godownAwakId,
      inVehicle,
      financialYear: awak.financialYear || '2025-26'
    };
    const result = await db.insert(godownAwak).values(awakData).returning();
    return result[0];
  }

  async updateGodownAwak(id: string, awak: UpdateGodownAwak): Promise<GodownAwak> {
    const existing = await this.getGodownAwak(id);
    if (!existing) {
      throw new Error('Godown awak not found');
    }

    // Recalculate inVehicle
    const totalArrived = Number(awak.totalArrived || existing.totalArrived || 0);
    const sold = Number(awak.sold || existing.sold || 0);
    const inGodown = Number(awak.inGodown || existing.inGodown);
    const inVehicle = (totalArrived - sold - inGodown).toString();

    const result = await db.update(godownAwak)
      .set({ ...awak, inVehicle, updatedAt: new Date() })
      .where(eq(godownAwak.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Godown awak not found');
    }
    return result[0];
  }

  async deleteGodownAwak(id: string): Promise<boolean> {
    const result = await db.delete(godownAwak).where(eq(godownAwak.id, id));
    return result.length > 0;
  }

  async generateGodownAwakId(): Promise<string> {
    const awaks = await db.select().from(godownAwak);
    const nextNumber = String(awaks.length + 1).padStart(3, '0');
    return `GA-${nextNumber}`;
  }

  // Damage operations
  async getDamages(financialYear: string, searchTerm?: string): Promise<Damage[]> {
    let query = db.select().from(damage).where(eq(damage.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(damage).where(
        and(
          eq(damage.financialYear, financialYear),
          like(damage.damageId, `%${searchTerm}%`)
        )
      );
    }
    
    return await query;
  }

  async getDamage(id: string): Promise<Damage | undefined> {
    const result = await db.select().from(damage).where(eq(damage.id, id));
    return result[0];
  }

  async createDamage(damageData: InsertDamage): Promise<Damage> {
    const damageId = await this.generateDamageId();
    const data = {
      ...damageData,
      damageId,
      financialYear: damageData.financialYear || '2025-26'
    };
    const result = await db.insert(damage).values(data).returning();
    return result[0];
  }

  async updateDamage(id: string, damageData: UpdateDamage): Promise<Damage> {
    const result = await db.update(damage)
      .set({ ...damageData, updatedAt: new Date() })
      .where(eq(damage.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Damage not found');
    }
    return result[0];
  }

  async deleteDamage(id: string): Promise<boolean> {
    const result = await db.delete(damage).where(eq(damage.id, id));
    return result.length > 0;
  }

  async generateDamageId(): Promise<string> {
    const damages = await db.select().from(damage);
    const nextNumber = String(damages.length + 1).padStart(3, '0');
    return `DMG-${nextNumber}`;
  }

  // Weight Slip operations
  async getWeightSlips(financialYear: string, searchTerm?: string): Promise<WeightSlip[]> {
    let query = db.select().from(weightSlip).where(eq(weightSlip.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(weightSlip).where(
        and(
          eq(weightSlip.financialYear, financialYear),
          like(weightSlip.weightSlipId, `%${searchTerm}%`)
        )
      );
    }
    
    return await query;
  }

  async getWeightSlip(id: string): Promise<WeightSlip | undefined> {
    const result = await db.select().from(weightSlip).where(eq(weightSlip.id, id));
    return result[0];
  }

  async createWeightSlip(slip: InsertWeightSlip): Promise<WeightSlip> {
    const weightSlipId = await this.generateWeightSlipId();
    
    // Calculate net weight automatically
    const netWeight = (Number(slip.grossWeight) - Number(slip.tareWeight)).toString();
    
    const slipData = {
      ...slip,
      weightSlipId,
      netWeight,
      financialYear: slip.financialYear || '2025-26'
    };
    const result = await db.insert(weightSlip).values(slipData).returning();
    return result[0];
  }

  async updateWeightSlip(id: string, slip: UpdateWeightSlip): Promise<WeightSlip> {
    const existing = await this.getWeightSlip(id);
    if (!existing) {
      throw new Error('Weight slip not found');
    }

    // Recalculate net weight
    const grossWeight = Number(slip.grossWeight || existing.grossWeight);
    const tareWeight = Number(slip.tareWeight || existing.tareWeight);
    const netWeight = (grossWeight - tareWeight).toString();

    const result = await db.update(weightSlip)
      .set({ ...slip, netWeight, updatedAt: new Date() })
      .where(eq(weightSlip.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Weight slip not found');
    }
    return result[0];
  }

  async deleteWeightSlip(id: string): Promise<boolean> {
    const result = await db.delete(weightSlip).where(eq(weightSlip.id, id));
    return result.length > 0;
  }

  async generateWeightSlipId(): Promise<string> {
    const slips = await db.select().from(weightSlip);
    const nextNumber = String(slips.length + 1).padStart(3, '0');
    return `WS-${nextNumber}`;
  }
}

export const storage = new DatabaseStorage();
