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
  type CustomerBilling,
  type InsertCustomerBilling,
  type UpdateCustomerBilling,
  type KhataBilling,
  type InsertKhataBilling,
  type UpdateKhataBilling,
  type CustomerPaymentReceipt,
  type InsertCustomerPaymentReceipt,
  type UpdateCustomerPaymentReceipt,
  type OtherPaymentReceipt,
  type InsertOtherPaymentReceipt,
  type UpdateOtherPaymentReceipt,
  type DhadaBook,
  type InsertDhadaBook,
  type UpdateDhadaBook,
  type FarmerInvoice,
  type InsertFarmerInvoice,
  type UpdateFarmerInvoice,
  type ManualInvoice,
  type InsertManualInvoice,
  type UpdateManualInvoice,
  type Rojmel,
  type InsertRojmel,
  type UpdateRojmel,
  type IncomeExpenseReceipt,
  type InsertIncomeExpenseReceipt,
  type UpdateIncomeExpenseReceipt,
  type BankDepositReceipt,
  type InsertBankDepositReceipt,
  type UpdateBankDepositReceipt,
  type BalanceSheet,
  type InsertBalanceSheet,
  type UpdateBalanceSheet,
  type UplagLedger,
  type InsertUplagLedger,
  type UpdateUplagLedger,
  type KhataLedger,
  type InsertKhataLedger,
  type UpdateKhataLedger,
  type FarmerTransportLedger,
  type InsertFarmerTransportLedger,
  type UpdateFarmerTransportLedger,
  type IncomeLedger,
  type InsertIncomeLedger,
  type UpdateIncomeLedger,
  type ExpenseLedger,
  type InsertExpenseLedger,
  type UpdateExpenseLedger,
  type BankDepositLedger,
  type InsertBankDepositLedger,
  type UpdateBankDepositLedger,
  users,
  accountMaster,
  productMaster,
  productExpenses,
  placeMaster,
  lotEntry,
  lotEntrySubFields,
  godownAwak,
  damage,
  weightSlip,
  customerBilling,
  khataBilling,
  customerPaymentReceipt,
  otherPaymentReceipt,
  dhadaBook,
  farmerInvoice,
  manualInvoice,
  rojmel,
  incomeExpenseReceipt,
  bankDepositReceipt,
  balanceSheet,
  uplagLedger,
  khataLedger,
  farmerTransportLedger,
  incomeLedger,
  expenseLedger,
  bankDepositLedger,
  reportConfigs,
  reportSnapshots,
  type ReportConfig,
  type ReportSnapshot,
  type InsertReportConfig,
  type UpdateReportConfig,
  type InsertReportSnapshot,
  companyProfile,
  defaultExpenses,
  printingSettings,
  moduleSettings,
  type CompanyProfile,
  type InsertCompanyProfile,
  type UpdateCompanyProfile,
  type DefaultExpenses,
  type InsertDefaultExpenses,
  type UpdateDefaultExpenses,
  type PrintingSettings,
  type InsertPrintingSettings,
  type UpdatePrintingSettings,
  type ModuleSettings,
  type InsertModuleSettings,
  type UpdateModuleSettings,
  whatsappMessages,
  whatsappTemplates,
  whatsappSettings,
  salesTransactions,
  type WhatsappMessages,
  type InsertWhatsappMessages,
  type UpdateWhatsappMessages,
  type WhatsappTemplates,
  type InsertWhatsappTemplates,
  type UpdateWhatsappTemplates,
  type WhatsappSettings,
  type InsertWhatsappSettings,
  type UpdateWhatsappSettings,
  type SalesTransactions,
  type InsertSalesTransactions,
  type UpdateSalesTransactions,
  accountingIntegrations,
  accountingSyncLogs,
  accountingMappings,
  type AccountingIntegrations,
  type InsertAccountingIntegrations,
  type UpdateAccountingIntegrations,
  type AccountingSyncLogs,
  type InsertAccountingSyncLogs,
  type AccountingMappings,
  type InsertAccountingMappings
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, like, ilike, or } from "drizzle-orm";

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
  generateAccountId(type: string, name: string, financialYear: string): Promise<string>;
  
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
  generateLotId(productName: string, totalQuantity: number, farmerQuantity: number, financialYear: string): Promise<string>;
  getNextLotSequence(financialYear: string): Promise<number>;
  createLotWithSubFields(lot: InsertLotEntry, subFields: InsertLotEntrySubFields[]): Promise<{ lot: LotEntry; subFields: LotEntrySubFields[] }>;
  
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
  
  // Bill Desk operations - Customer Billing
  getCustomerBillings(financialYear: string, searchTerm?: string): Promise<CustomerBilling[]>;
  getCustomerBilling(id: string): Promise<CustomerBilling | undefined>;
  createCustomerBilling(billing: InsertCustomerBilling): Promise<CustomerBilling>;
  updateCustomerBilling(id: string, billing: UpdateCustomerBilling): Promise<CustomerBilling>;
  deleteCustomerBilling(id: string): Promise<boolean>;
  generateCustomerBillNo(financialYear: string): Promise<string>;
  
  // Bill Desk operations - Khata Billing
  getKhataBillings(financialYear: string, searchTerm?: string): Promise<KhataBilling[]>;
  getKhataBilling(id: string): Promise<KhataBilling | undefined>;
  createKhataBilling(billing: InsertKhataBilling): Promise<KhataBilling>;
  updateKhataBilling(id: string, billing: UpdateKhataBilling): Promise<KhataBilling>;
  deleteKhataBilling(id: string): Promise<boolean>;
  generateKhataBillNo(financialYear: string): Promise<string>;
  
  // Bill Desk operations - Customer Payment Receipt
  getCustomerPaymentReceipts(financialYear: string, searchTerm?: string): Promise<CustomerPaymentReceipt[]>;
  getCustomerPaymentReceipt(id: string): Promise<CustomerPaymentReceipt | undefined>;
  createCustomerPaymentReceipt(receipt: InsertCustomerPaymentReceipt): Promise<CustomerPaymentReceipt>;
  updateCustomerPaymentReceipt(id: string, receipt: UpdateCustomerPaymentReceipt): Promise<CustomerPaymentReceipt>;
  deleteCustomerPaymentReceipt(id: string): Promise<boolean>;
  generateCustomerReceiptNo(financialYear: string): Promise<string>;
  
  // Bill Desk operations - Other Payment Receipt
  getOtherPaymentReceipts(financialYear: string, searchTerm?: string): Promise<OtherPaymentReceipt[]>;
  getOtherPaymentReceipt(id: string): Promise<OtherPaymentReceipt | undefined>;
  createOtherPaymentReceipt(receipt: InsertOtherPaymentReceipt): Promise<OtherPaymentReceipt>;
  updateOtherPaymentReceipt(id: string, receipt: UpdateOtherPaymentReceipt): Promise<OtherPaymentReceipt>;
  deleteOtherPaymentReceipt(id: string): Promise<boolean>;
  generateOtherReceiptNo(financialYear: string): Promise<string>;
  
  // Farmer Invoice Module operations - Dhada Book
  getDhadaBooks(financialYear: string, searchTerm?: string): Promise<DhadaBook[]>;
  getDhadaBook(id: string): Promise<DhadaBook | undefined>;
  createDhadaBook(dhada: InsertDhadaBook): Promise<DhadaBook>;
  updateDhadaBook(id: string, dhada: UpdateDhadaBook): Promise<DhadaBook>;
  deleteDhadaBook(id: string): Promise<boolean>;
  generateDhadaId(financialYear: string): Promise<string>;
  
  // Farmer Invoice Module operations - Farmer Invoice
  getFarmerInvoices(financialYear: string, searchTerm?: string): Promise<FarmerInvoice[]>;
  getFarmerInvoice(id: string): Promise<FarmerInvoice | undefined>;
  createFarmerInvoice(invoice: InsertFarmerInvoice): Promise<FarmerInvoice>;
  updateFarmerInvoice(id: string, invoice: UpdateFarmerInvoice): Promise<FarmerInvoice>;
  deleteFarmerInvoice(id: string): Promise<boolean>;
  generateFarmerInvoiceNo(financialYear: string): Promise<string>;
  
  // Farmer Invoice Module operations - Manual Invoice
  getManualInvoices(financialYear: string, searchTerm?: string): Promise<ManualInvoice[]>;
  getManualInvoice(id: string): Promise<ManualInvoice | undefined>;
  createManualInvoice(invoice: InsertManualInvoice): Promise<ManualInvoice>;
  updateManualInvoice(id: string, invoice: UpdateManualInvoice): Promise<ManualInvoice>;
  deleteManualInvoice(id: string): Promise<boolean>;
  generateManualInvoiceNo(financialYear: string): Promise<string>;
  
  // Accounting Module operations - Rojmel
  getRojmels(financialYear: string, searchTerm?: string): Promise<Rojmel[]>;
  getRojmel(id: string): Promise<Rojmel | undefined>;
  createRojmel(rojmel: InsertRojmel): Promise<Rojmel>;
  updateRojmel(id: string, rojmel: UpdateRojmel): Promise<Rojmel>;
  deleteRojmel(id: string): Promise<boolean>;
  generateRojmelId(financialYear: string): Promise<string>;
  
  // Accounting Module operations - Income/Expense Receipt
  getIncomeExpenseReceipts(financialYear: string, searchTerm?: string): Promise<IncomeExpenseReceipt[]>;
  getIncomeExpenseReceipt(id: string): Promise<IncomeExpenseReceipt | undefined>;
  createIncomeExpenseReceipt(receipt: InsertIncomeExpenseReceipt): Promise<IncomeExpenseReceipt>;
  updateIncomeExpenseReceipt(id: string, receipt: UpdateIncomeExpenseReceipt): Promise<IncomeExpenseReceipt>;
  deleteIncomeExpenseReceipt(id: string): Promise<boolean>;
  generateIncomeExpenseReceiptNo(financialYear: string): Promise<string>;
  
  // Accounting Module operations - Bank Deposit Receipt
  getBankDepositReceipts(financialYear: string, searchTerm?: string): Promise<BankDepositReceipt[]>;
  getBankDepositReceipt(id: string): Promise<BankDepositReceipt | undefined>;
  createBankDepositReceipt(receipt: InsertBankDepositReceipt): Promise<BankDepositReceipt>;
  updateBankDepositReceipt(id: string, receipt: UpdateBankDepositReceipt): Promise<BankDepositReceipt>;
  deleteBankDepositReceipt(id: string): Promise<boolean>;
  generateBankDepositReceiptNo(financialYear: string): Promise<string>;
  
  // Accounting Module operations - Balance Sheet
  getBalanceSheets(financialYear: string, searchTerm?: string): Promise<BalanceSheet[]>;
  getBalanceSheet(id: string): Promise<BalanceSheet | undefined>;
  createBalanceSheet(sheet: InsertBalanceSheet): Promise<BalanceSheet>;
  updateBalanceSheet(id: string, sheet: UpdateBalanceSheet): Promise<BalanceSheet>;
  deleteBalanceSheet(id: string): Promise<boolean>;
  generateBalanceSheetId(financialYear: string): Promise<string>;
  
  // Ledger Module operations - Uplag (Balance) Ledger
  getUplagLedgers(financialYear: string, searchTerm?: string): Promise<UplagLedger[]>;
  getUplagLedger(id: string): Promise<UplagLedger | undefined>;
  createUplagLedger(ledger: InsertUplagLedger): Promise<UplagLedger>;
  updateUplagLedger(id: string, ledger: UpdateUplagLedger): Promise<UplagLedger>;
  deleteUplagLedger(id: string): Promise<boolean>;
  generateUplagLedgerId(financialYear: string): Promise<string>;
  
  // Ledger Module operations - Khata Ledger
  getKhataLedgers(financialYear: string, searchTerm?: string): Promise<KhataLedger[]>;
  getKhataLedger(id: string): Promise<KhataLedger | undefined>;
  createKhataLedger(ledger: InsertKhataLedger): Promise<KhataLedger>;
  updateKhataLedger(id: string, ledger: UpdateKhataLedger): Promise<KhataLedger>;
  deleteKhataLedger(id: string): Promise<boolean>;
  generateKhataLedgerId(financialYear: string): Promise<string>;
  
  // Ledger Module operations - Farmer/Transport Ledger
  getFarmerTransportLedgers(financialYear: string, searchTerm?: string): Promise<FarmerTransportLedger[]>;
  getFarmerTransportLedger(id: string): Promise<FarmerTransportLedger | undefined>;
  createFarmerTransportLedger(ledger: InsertFarmerTransportLedger): Promise<FarmerTransportLedger>;
  updateFarmerTransportLedger(id: string, ledger: UpdateFarmerTransportLedger): Promise<FarmerTransportLedger>;
  deleteFarmerTransportLedger(id: string): Promise<boolean>;
  generateFarmerTransportLedgerId(financialYear: string): Promise<string>;
  
  // Ledger Module operations - Income Ledger
  getIncomeLedgers(financialYear: string, searchTerm?: string): Promise<IncomeLedger[]>;
  getIncomeLedger(id: string): Promise<IncomeLedger | undefined>;
  createIncomeLedger(ledger: InsertIncomeLedger): Promise<IncomeLedger>;
  updateIncomeLedger(id: string, ledger: UpdateIncomeLedger): Promise<IncomeLedger>;
  deleteIncomeLedger(id: string): Promise<boolean>;
  generateIncomeLedgerId(financialYear: string): Promise<string>;
  
  // Ledger Module operations - Expense Ledger
  getExpenseLedgers(financialYear: string, searchTerm?: string): Promise<ExpenseLedger[]>;
  getExpenseLedger(id: string): Promise<ExpenseLedger | undefined>;
  createExpenseLedger(ledger: InsertExpenseLedger): Promise<ExpenseLedger>;
  updateExpenseLedger(id: string, ledger: UpdateExpenseLedger): Promise<ExpenseLedger>;
  deleteExpenseLedger(id: string): Promise<boolean>;
  generateExpenseLedgerId(financialYear: string): Promise<string>;
  
  // Ledger Module operations - Bank Deposit Ledger
  getBankDepositLedgers(financialYear: string, searchTerm?: string): Promise<BankDepositLedger[]>;
  getBankDepositLedger(id: string): Promise<BankDepositLedger | undefined>;
  createBankDepositLedger(ledger: InsertBankDepositLedger): Promise<BankDepositLedger>;
  updateBankDepositLedger(id: string, ledger: UpdateBankDepositLedger): Promise<BankDepositLedger>;
  deleteBankDepositLedger(id: string): Promise<boolean>;
  generateBankDepositLedgerId(financialYear: string): Promise<string>;
  
  // Reports Module operations
  getReport(type: string, financialYear: string, filters?: Record<string, any>): Promise<any[]>;
  createReportSnapshot(snapshot: InsertReportSnapshot): Promise<ReportSnapshot>;
  getReportSnapshots(type?: string, financialYear?: string): Promise<ReportSnapshot[]>;
  deleteReportSnapshot(id: string): Promise<boolean>;
  getReportConfigs(type?: string, financialYear?: string): Promise<ReportConfig[]>;
  getReportConfig(id: string): Promise<ReportConfig | undefined>;
  createReportConfig(config: InsertReportConfig): Promise<ReportConfig>;
  updateReportConfig(id: string, config: UpdateReportConfig): Promise<ReportConfig>;
  deleteReportConfig(id: string): Promise<boolean>;

  // Settings Module Operations
  
  // Company Profile operations
  getCompanyProfiles(financialYear: string): Promise<CompanyProfile[]>;
  getCompanyProfile(id: string): Promise<CompanyProfile | undefined>;
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  updateCompanyProfile(id: string, profile: UpdateCompanyProfile): Promise<CompanyProfile>;
  deleteCompanyProfile(id: string): Promise<boolean>;

  // Default Expenses operations
  getDefaultExpenses(financialYear: string, searchTerm?: string): Promise<DefaultExpenses[]>;
  getDefaultExpense(id: string): Promise<DefaultExpenses | undefined>;
  createDefaultExpense(expense: InsertDefaultExpenses): Promise<DefaultExpenses>;
  updateDefaultExpense(id: string, expense: UpdateDefaultExpenses): Promise<DefaultExpenses>;
  deleteDefaultExpense(id: string): Promise<boolean>;

  // Printing Settings operations
  getPrintingSettings(financialYear: string): Promise<PrintingSettings[]>;
  getPrintingSetting(id: string): Promise<PrintingSettings | undefined>;
  createPrintingSetting(setting: InsertPrintingSettings): Promise<PrintingSettings>;
  updatePrintingSetting(id: string, setting: UpdatePrintingSettings): Promise<PrintingSettings>;
  deletePrintingSetting(id: string): Promise<boolean>;
  generateTemplateId(): Promise<string>;

  // Module Settings operations
  getModuleSettings(financialYear: string): Promise<ModuleSettings[]>;
  getModuleSetting(id: string): Promise<ModuleSettings | undefined>;
  createModuleSetting(setting: InsertModuleSettings): Promise<ModuleSettings>;
  updateModuleSetting(id: string, setting: UpdateModuleSettings): Promise<ModuleSettings>;
  deleteModuleSetting(id: string): Promise<boolean>;

  // WhatsApp Messages operations
  getWhatsappMessages(financialYear: string, searchTerm?: string): Promise<WhatsappMessages[]>;
  getWhatsappMessage(id: string): Promise<WhatsappMessages | undefined>;
  createWhatsappMessage(message: InsertWhatsappMessages): Promise<WhatsappMessages>;
  updateWhatsappMessage(id: string, message: UpdateWhatsappMessages): Promise<WhatsappMessages>;
  deleteWhatsappMessage(id: string): Promise<boolean>;
  generateWhatsappMessageId(): Promise<string>;

  // WhatsApp Templates operations
  getWhatsappTemplates(financialYear: string, searchTerm?: string): Promise<WhatsappTemplates[]>;
  getWhatsappTemplate(id: string): Promise<WhatsappTemplates | undefined>;
  createWhatsappTemplate(template: InsertWhatsappTemplates): Promise<WhatsappTemplates>;
  updateWhatsappTemplate(id: string, template: UpdateWhatsappTemplates): Promise<WhatsappTemplates>;
  deleteWhatsappTemplate(id: string): Promise<boolean>;
  generateWhatsappTemplateId(): Promise<string>;

  // WhatsApp Settings operations
  getWhatsappSettings(financialYear: string): Promise<WhatsappSettings[]>;
  getWhatsappSetting(id: string): Promise<WhatsappSettings | undefined>;
  createWhatsappSetting(setting: InsertWhatsappSettings): Promise<WhatsappSettings>;
  updateWhatsappSetting(id: string, setting: UpdateWhatsappSettings): Promise<WhatsappSettings>;
  deleteWhatsappSetting(id: string): Promise<boolean>;
  generateWhatsappSettingId(): Promise<string>;

  // Rate Calculation operations
  getAverageRate(productId: string, quality: string, financialYear: string, days?: number): Promise<{ avgRate: number | null; count: number; qtySum: number }>;
  createSalesTransaction(transaction: InsertSalesTransactions): Promise<SalesTransactions>;
  
  // Accounting Integration operations
  getAccountingIntegrations(financialYear: string): Promise<AccountingIntegrations[]>;
  getAccountingIntegration(id: string): Promise<AccountingIntegrations | undefined>;
  createAccountingIntegration(integration: InsertAccountingIntegrations): Promise<AccountingIntegrations>;
  updateAccountingIntegration(id: string, integration: UpdateAccountingIntegrations): Promise<AccountingIntegrations | undefined>;
  deleteAccountingIntegration(id: string): Promise<boolean>;
  
  // Accounting Sync operations
  syncAccountingData(integrationId: string, syncType: string, entityIds?: string[]): Promise<any>;
  getAccountingSyncStatus(integrationId: string): Promise<any>;
  
  // Accounting Sync Logs operations
  getAccountingSyncLogs(integrationId: string, financialYear: string, limit: number): Promise<AccountingSyncLogs[]>;
  createAccountingSyncLog(log: InsertAccountingSyncLogs): Promise<AccountingSyncLogs>;
  
  // Accounting Mappings operations
  getAccountingMappings(integrationId: string, entityType?: string, financialYear?: string): Promise<AccountingMappings[]>;
  createAccountingMapping(mapping: InsertAccountingMappings): Promise<AccountingMappings>;
  deleteAccountingMapping(id: string): Promise<boolean>;
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
  private customerBillings: Map<string, CustomerBilling>;
  private khataBillings: Map<string, KhataBilling>;
  private customerPaymentReceipts: Map<string, CustomerPaymentReceipt>;
  private otherPaymentReceipts: Map<string, OtherPaymentReceipt>;
  private dhadaBooks: Map<string, DhadaBook>;
  private farmerInvoices: Map<string, FarmerInvoice>;
  private manualInvoices: Map<string, ManualInvoice>;
  private rojmels: Map<string, Rojmel>;
  private incomeExpenseReceipts: Map<string, IncomeExpenseReceipt>;
  private bankDepositReceipts: Map<string, BankDepositReceipt>;
  private balanceSheets: Map<string, BalanceSheet>;
  private uplagLedgers: Map<string, UplagLedger>;
  private khataLedgers: Map<string, KhataLedger>;
  private farmerTransportLedgers: Map<string, FarmerTransportLedger>;
  private incomeLedgers: Map<string, IncomeLedger>;
  private expenseLedgers: Map<string, ExpenseLedger>;
  private bankDepositLedgers: Map<string, BankDepositLedger>;
  private whatsappMessages: Map<string, WhatsappMessages>;
  private whatsappTemplates: Map<string, WhatsappTemplates>;
  private whatsappSettings: Map<string, WhatsappSettings>;
  private salesTransactions: Map<string, SalesTransactions>;

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
    this.customerBillings = new Map();
    this.khataBillings = new Map();
    this.customerPaymentReceipts = new Map();
    this.otherPaymentReceipts = new Map();
    this.dhadaBooks = new Map();
    this.farmerInvoices = new Map();
    this.manualInvoices = new Map();
    this.rojmels = new Map();
    this.incomeExpenseReceipts = new Map();
    this.bankDepositReceipts = new Map();
    this.balanceSheets = new Map();
    this.uplagLedgers = new Map();
    this.khataLedgers = new Map();
    this.farmerTransportLedgers = new Map();
    this.incomeLedgers = new Map();
    this.expenseLedgers = new Map();
    this.bankDepositLedgers = new Map();
    this.whatsappMessages = new Map();
    this.whatsappTemplates = new Map();
    this.whatsappSettings = new Map();
    this.salesTransactions = new Map();
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
    const accountId = await this.generateAccountId(account.type, account.name, account.financialYear || '2025-26');
    const id = randomUUID();
    const now = new Date();
    const accountData: AccountMaster = {
      ...account,
      id,
      accountId,
      mobile: account.mobile ?? null,
      address: account.address ?? null,
      placeId: account.placeId ?? null,
      bankDetails: account.bankDetails ?? null,
      governmentIdentity: account.governmentIdentity ?? null,
      openingBalance: account.openingBalance ?? '0',
      creditLimit: account.creditLimit ?? '0',
      creditTime: account.creditTime ?? 0,
      remarks: account.remarks ?? null,
      customFields: account.customFields ?? null,
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

  async generateAccountId(type: string, name: string, financialYear: string): Promise<string> {
    // Extract type prefix (first letter)
    const typePrefix = type.charAt(0).toUpperCase();
    
    // Extract customer initials (first 2 letters of name)
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const nameWords = cleanName.split(' ');
    let initials = '';
    
    if (nameWords.length >= 2) {
      // First letter of first name + First letter of second name
      initials = nameWords[0].charAt(0).toUpperCase() + nameWords[1].charAt(0).toUpperCase();
    } else {
      // If single name, take first 2 letters
      initials = cleanName.substring(0, 2).toUpperCase();
    }
    
    // Generate unique ID by checking for existence and incrementing
    const prefix = `${typePrefix}-${initials}`;
    let sequenceNumber = 1;
    let candidateId = `${prefix}-${String(sequenceNumber).padStart(3, '0')}`;
    
    // Keep incrementing until we find a unique ID
    while (true) {
      const existing = Array.from(this.accounts.values()).find(account => 
        account.accountId === candidateId && account.financialYear === financialYear
      );
      
      if (!existing) {
        return candidateId;
      }
      
      sequenceNumber++;
      candidateId = `${prefix}-${String(sequenceNumber).padStart(3, '0')}`;
      
      // Safety check to prevent infinite loop
      if (sequenceNumber > 999) {
        throw new Error(`Cannot generate unique account ID for prefix ${prefix} - too many accounts`);
      }
    }
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
    // For single lot creation, assume zero farmer quantity initially
    const lotId = await this.generateLotId("Product", Number(lot.totalQuantity), 0, lot.financialYear || '2025-26');
    const lotSequence = await this.getNextLotSequence(lot.financialYear || '2025-26');
    const id = randomUUID();
    const now = new Date();
    
    // Calculate average weight if total weight is provided
    const averageWeight = lot.totalWeight ? 
      (Number(lot.totalWeight) / Number(lot.totalQuantity)).toString() : null;
    
    const lotData: LotEntry = {
      ...lot,
      id,
      lotId,
      lotSequence,
      transportName: null, // Will be populated from transportAccountId
      vehicleNumber: lot.vehicleNumber ?? null,
      advance: lot.advance ?? null,
      otherExpenses: lot.otherExpenses ?? null,
      totalWeight: lot.totalWeight ?? null,
      averageWeight,
      customFields: lot.customFields ?? null,
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

  async getNextLotSequence(financialYear: string): Promise<number> {
    const lots = Array.from(this.lotEntries.values()).filter(lot => 
      lot.financialYear === financialYear
    );
    return lots.length + 1;
  }

  async generateLotId(productName: string, totalQuantity: number, farmerQuantity: number, financialYear: string): Promise<string> {
    const sequence = await this.getNextLotSequence(financialYear);
    // Format: "ProductName+TotalQuantity-FarmerQuantity-Sequence"
    // Example: "Onion25-10-001"
    const cleanProductName = productName.replace(/\s+/g, ''); // Remove spaces
    return `${cleanProductName}${totalQuantity}-${farmerQuantity}-${String(sequence).padStart(3, '0')}`;
  }

  async createLotWithSubFields(lot: InsertLotEntry, subFields: InsertLotEntrySubFields[]): Promise<{ lot: LotEntry; subFields: LotEntrySubFields[] }> {
    // Calculate farmer quantity from sub-fields
    const farmerQuantity = subFields.reduce((sum, sub) => sum + Number(sub.quantity), 0);
    
    // Get product name for LotID generation
    const productName = "Product"; // TODO: Get actual product name from productId
    
    // Generate LotID
    const lotId = await this.generateLotId(productName, Number(lot.totalQuantity), farmerQuantity, lot.financialYear || '2025-26');
    const lotSequence = await this.getNextLotSequence(lot.financialYear || '2025-26');
    
    // Calculate average weight
    const averageWeight = lot.totalWeight ? 
      (Number(lot.totalWeight) / Number(lot.totalQuantity)).toString() : null;
    
    // Create lot entry
    const lotEntryId = randomUUID();
    const now = new Date();
    const lotData: LotEntry = {
      ...lot,
      id: lotEntryId,
      lotId,
      lotSequence,
      transportName: null, // Will be populated from transportAccountId
      averageWeight,
      advance: lot.advance ?? null,
      otherExpenses: lot.otherExpenses ?? null,
      totalWeight: lot.totalWeight ?? null,
      vehicleNumber: lot.vehicleNumber ?? null,
      customFields: lot.customFields ?? null,
      financialYear: lot.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    this.lotEntries.set(lotEntryId, lotData);
    
    // Create sub-fields with auto-calculations
    const createdSubFields: LotEntrySubFields[] = [];
    for (const subField of subFields) {
      const subFieldId = randomUUID();
      
      // Auto-calculate weight and freight for sub-field
      const subFieldWeight = averageWeight ? 
        (Number(averageWeight) * Number(subField.quantity)).toString() : null;
      const subFieldFreight = lot.freight ? 
        ((Number(lot.freight) / Number(lot.totalQuantity)) * Number(subField.quantity)).toString() : null;
      
      const subFieldData: LotEntrySubFields = {
        ...subField,
        id: subFieldId,
        lotId,
        productId: lot.productId, // Auto from parent lot
        quality: subField.quality ?? null,
        weight: subFieldWeight,
        freight: subFieldFreight,
        averageRate: subField.averageRate ?? null,
        customFields: subField.customFields ?? null,
        createdAt: now,
        updatedAt: now,
      };
      this.lotEntrySubFields.set(subFieldId, subFieldData);
      createdSubFields.push(subFieldData);
    }
    
    return { lot: lotData, subFields: createdSubFields };
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
      quality: subField.quality ?? null,
      weight: subField.weight ?? null,
      freight: subField.freight ?? null,
      averageRate: subField.averageRate ?? null,
      customFields: subField.customFields ?? null,
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

  // Bill Desk operations - Customer Billing
  async getCustomerBillings(financialYear: string, searchTerm?: string): Promise<CustomerBilling[]> {
    const bills = Array.from(this.customerBillings.values()).filter(bill => 
      bill.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return bills.filter(bill =>
        bill.customerName.toLowerCase().includes(searchLower) ||
        bill.billNo.toLowerCase().includes(searchLower) ||
        bill.accountId.toLowerCase().includes(searchLower)
      );
    }
    
    return bills;
  }

  async getCustomerBilling(id: string): Promise<CustomerBilling | undefined> {
    return this.customerBillings.get(id);
  }

  async createCustomerBilling(billing: InsertCustomerBilling): Promise<CustomerBilling> {
    const billNo = await this.generateCustomerBillNo(billing.financialYear || '2025-26');
    const id = randomUUID();
    const now = new Date();
    
    const billData: CustomerBilling = {
      ...billing,
      id,
      billNo,
      billItems: billing.billItems || [],
      paymentDetails: billing.paymentDetails || {},
      customFields: billing.customFields || {},
      commission: billing.commission || '0',
      marketFee: billing.marketFee || '0',
      hamali: billing.hamali || '0',
      discountWeight: billing.discountWeight || '0',
      discountAmount: billing.discountAmount || '0',
      previousBalance: billing.previousBalance || '0',
      paidAmount: billing.paidAmount || '0',
      paymentMode: billing.paymentMode || 'cash',
      financialYear: billing.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    
    this.customerBillings.set(id, billData);
    return billData;
  }

  async updateCustomerBilling(id: string, billing: UpdateCustomerBilling): Promise<CustomerBilling> {
    const existing = this.customerBillings.get(id);
    if (!existing) {
      throw new Error('Customer billing not found');
    }

    const updated: CustomerBilling = {
      ...existing,
      ...billing,
      id: existing.id,
      billNo: existing.billNo,
      updatedAt: new Date(),
    };

    this.customerBillings.set(id, updated);
    return updated;
  }

  async deleteCustomerBilling(id: string): Promise<boolean> {
    return this.customerBillings.delete(id);
  }

  async generateCustomerBillNo(financialYear: string): Promise<string> {
    const bills = Array.from(this.customerBillings.values()).filter(bill => 
      bill.financialYear === financialYear
    );
    const nextNumber = String(bills.length + 1).padStart(4, '0');
    return `cash-sv-${nextNumber}`;
  }

  // Bill Desk operations - Khata Billing
  async getKhataBillings(financialYear: string, searchTerm?: string): Promise<KhataBilling[]> {
    const bills = Array.from(this.khataBillings.values()).filter(bill => 
      bill.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return bills.filter(bill =>
        bill.customerName.toLowerCase().includes(searchLower) ||
        bill.billNo.toLowerCase().includes(searchLower) ||
        bill.accountId.toLowerCase().includes(searchLower)
      );
    }
    
    return bills;
  }

  async getKhataBilling(id: string): Promise<KhataBilling | undefined> {
    return this.khataBillings.get(id);
  }

  async createKhataBilling(billing: InsertKhataBilling): Promise<KhataBilling> {
    const billNo = await this.generateKhataBillNo(billing.financialYear || '2025-26');
    const id = randomUUID();
    const now = new Date();
    
    const billData: KhataBilling = {
      ...billing,
      id,
      billNo,
      billItems: billing.billItems || [],
      paymentDetails: billing.paymentDetails || {},
      customFields: billing.customFields || {},
      commission: billing.commission || '0',
      marketFee: billing.marketFee || '0',
      hamali: billing.hamali || '0',
      discountWeight: billing.discountWeight || '0',
      discountAmount: billing.discountAmount || '0',
      previousBalance: billing.previousBalance || '0',
      paidAmount: billing.paidAmount || '0',
      creditLimit: billing.creditLimit || '0',
      paymentMode: billing.paymentMode || 'cash',
      financialYear: billing.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    
    this.khataBillings.set(id, billData);
    return billData;
  }

  async updateKhataBilling(id: string, billing: UpdateKhataBilling): Promise<KhataBilling> {
    const existing = this.khataBillings.get(id);
    if (!existing) {
      throw new Error('Khata billing not found');
    }

    const updated: KhataBilling = {
      ...existing,
      ...billing,
      id: existing.id,
      billNo: existing.billNo,
      updatedAt: new Date(),
    };

    this.khataBillings.set(id, updated);
    return updated;
  }

  async deleteKhataBilling(id: string): Promise<boolean> {
    return this.khataBillings.delete(id);
  }

  async generateKhataBillNo(financialYear: string): Promise<string> {
    const bills = Array.from(this.khataBillings.values()).filter(bill => 
      bill.financialYear === financialYear
    );
    const nextNumber = String(bills.length + 1).padStart(4, '0');
    return `khata-sv-${nextNumber}`;
  }

  // Bill Desk operations - Customer Payment Receipt
  async getCustomerPaymentReceipts(financialYear: string, searchTerm?: string): Promise<CustomerPaymentReceipt[]> {
    const receipts = Array.from(this.customerPaymentReceipts.values()).filter(receipt => 
      receipt.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return receipts.filter(receipt =>
        receipt.customerName.toLowerCase().includes(searchLower) ||
        receipt.receiptNo.toLowerCase().includes(searchLower) ||
        receipt.accountId.toLowerCase().includes(searchLower)
      );
    }
    
    return receipts;
  }

  async getCustomerPaymentReceipt(id: string): Promise<CustomerPaymentReceipt | undefined> {
    return this.customerPaymentReceipts.get(id);
  }

  async createCustomerPaymentReceipt(receipt: InsertCustomerPaymentReceipt): Promise<CustomerPaymentReceipt> {
    const receiptNo = await this.generateCustomerReceiptNo(receipt.financialYear || '2025-26');
    const id = randomUUID();
    const now = new Date();
    
    const receiptData: CustomerPaymentReceipt = {
      ...receipt,
      id,
      receiptNo,
      paymentDetails: receipt.paymentDetails || {},
      customFields: receipt.customFields || {},
      billAmount: receipt.billAmount || '0',
      discount: receipt.discount || '0',
      financialYear: receipt.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    
    this.customerPaymentReceipts.set(id, receiptData);
    return receiptData;
  }

  async updateCustomerPaymentReceipt(id: string, receipt: UpdateCustomerPaymentReceipt): Promise<CustomerPaymentReceipt> {
    const existing = this.customerPaymentReceipts.get(id);
    if (!existing) {
      throw new Error('Customer payment receipt not found');
    }

    const updated: CustomerPaymentReceipt = {
      ...existing,
      ...receipt,
      id: existing.id,
      receiptNo: existing.receiptNo,
      updatedAt: new Date(),
    };

    this.customerPaymentReceipts.set(id, updated);
    return updated;
  }

  async deleteCustomerPaymentReceipt(id: string): Promise<boolean> {
    return this.customerPaymentReceipts.delete(id);
  }

  async generateCustomerReceiptNo(financialYear: string): Promise<string> {
    const receipts = Array.from(this.customerPaymentReceipts.values()).filter(receipt => 
      receipt.financialYear === financialYear
    );
    const nextNumber = String(receipts.length + 1).padStart(3, '0');
    return `Rec-sv-${nextNumber}`;
  }

  // Bill Desk operations - Other Payment Receipt
  async getOtherPaymentReceipts(financialYear: string, searchTerm?: string): Promise<OtherPaymentReceipt[]> {
    const receipts = Array.from(this.otherPaymentReceipts.values()).filter(receipt => 
      receipt.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return receipts.filter(receipt =>
        receipt.partyName.toLowerCase().includes(searchLower) ||
        receipt.receiptNo.toLowerCase().includes(searchLower) ||
        receipt.accountId.toLowerCase().includes(searchLower) ||
        receipt.partyType.toLowerCase().includes(searchLower)
      );
    }
    
    return receipts;
  }

  async getOtherPaymentReceipt(id: string): Promise<OtherPaymentReceipt | undefined> {
    return this.otherPaymentReceipts.get(id);
  }

  async createOtherPaymentReceipt(receipt: InsertOtherPaymentReceipt): Promise<OtherPaymentReceipt> {
    const receiptNo = await this.generateOtherReceiptNo(receipt.financialYear || '2025-26');
    const id = randomUUID();
    const now = new Date();
    
    const receiptData: OtherPaymentReceipt = {
      ...receipt,
      id,
      receiptNo,
      paymentDetails: receipt.paymentDetails || {},
      customFields: receipt.customFields || {},
      invoiceAmount: receipt.invoiceAmount || '0',
      discount: receipt.discount || '0',
      financialYear: receipt.financialYear || '2025-26',
      createdAt: now,
      updatedAt: now,
    };
    
    this.otherPaymentReceipts.set(id, receiptData);
    return receiptData;
  }

  async updateOtherPaymentReceipt(id: string, receipt: UpdateOtherPaymentReceipt): Promise<OtherPaymentReceipt> {
    const existing = this.otherPaymentReceipts.get(id);
    if (!existing) {
      throw new Error('Other payment receipt not found');
    }

    const updated: OtherPaymentReceipt = {
      ...existing,
      ...receipt,
      id: existing.id,
      receiptNo: existing.receiptNo,
      updatedAt: new Date(),
    };

    this.otherPaymentReceipts.set(id, updated);
    return updated;
  }

  async deleteOtherPaymentReceipt(id: string): Promise<boolean> {
    return this.otherPaymentReceipts.delete(id);
  }

  async generateOtherReceiptNo(financialYear: string): Promise<string> {
    const receipts = Array.from(this.otherPaymentReceipts.values()).filter(receipt => 
      receipt.financialYear === financialYear
    );
    const nextNumber = String(receipts.length + 1).padStart(3, '0');
    return `Rec-sv-${nextNumber}`;
  }

  // Farmer Invoice Module operations - Dhada Book
  async getDhadaBooks(financialYear: string, searchTerm?: string): Promise<DhadaBook[]> {
    const books = Array.from(this.dhadaBooks.values()).filter(book => 
      book.financialYear === financialYear
    );
    
    if (searchTerm) {
      return books.filter(book =>
        book.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.dhadaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.linkedLotId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return books;
  }

  async getDhadaBook(id: string): Promise<DhadaBook | undefined> {
    return this.dhadaBooks.get(id);
  }

  async createDhadaBook(dhada: InsertDhadaBook): Promise<DhadaBook> {
    const dhadaId = await this.generateDhadaId(dhada.financialYear || '2025-26');
    const id = randomUUID();
    const book: DhadaBook = {
      ...dhada,
      id,
      dhadaId,
      customFields: dhada.customFields || {},
      financialYear: dhada.financialYear || '2025-26',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dhadaBooks.set(id, book);
    return book;
  }

  async updateDhadaBook(id: string, dhada: UpdateDhadaBook): Promise<DhadaBook> {
    const existing = this.dhadaBooks.get(id);
    if (!existing) throw new Error('Dhada book not found');
    
    const updated = { ...existing, ...dhada, updatedAt: new Date() };
    this.dhadaBooks.set(id, updated);
    return updated;
  }

  async deleteDhadaBook(id: string): Promise<boolean> {
    return this.dhadaBooks.delete(id);
  }

  async generateDhadaId(financialYear: string): Promise<string> {
    const books = Array.from(this.dhadaBooks.values()).filter(book => 
      book.financialYear === financialYear
    );
    const nextNumber = String(books.length + 1).padStart(3, '0');
    return `DHD-${nextNumber}`;
  }

  // Farmer Invoice Module operations - Farmer Invoice
  async getFarmerInvoices(financialYear: string, searchTerm?: string): Promise<FarmerInvoice[]> {
    const invoices = Array.from(this.farmerInvoices.values()).filter(invoice => 
      invoice.financialYear === financialYear
    );
    
    if (searchTerm) {
      return invoices.filter(invoice =>
        invoice.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.lotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.productName && invoice.productName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return invoices;
  }

  async getFarmerInvoice(id: string): Promise<FarmerInvoice | undefined> {
    return this.farmerInvoices.get(id);
  }

  async createFarmerInvoice(invoice: InsertFarmerInvoice): Promise<FarmerInvoice> {
    const invoiceNo = await this.generateFarmerInvoiceNo(invoice.financialYear || '2025-26');
    const id = randomUUID();
    const farmerInvoice: FarmerInvoice = {
      ...invoice,
      id,
      invoiceNo,
      customFields: invoice.customFields || {},
      financialYear: invoice.financialYear || '2025-26',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.farmerInvoices.set(id, farmerInvoice);
    return farmerInvoice;
  }

  async updateFarmerInvoice(id: string, invoice: UpdateFarmerInvoice): Promise<FarmerInvoice> {
    const existing = this.farmerInvoices.get(id);
    if (!existing) throw new Error('Farmer invoice not found');
    
    const updated = { ...existing, ...invoice, updatedAt: new Date() };
    this.farmerInvoices.set(id, updated);
    return updated;
  }

  async deleteFarmerInvoice(id: string): Promise<boolean> {
    return this.farmerInvoices.delete(id);
  }

  async generateFarmerInvoiceNo(financialYear: string): Promise<string> {
    const invoices = Array.from(this.farmerInvoices.values()).filter(invoice => 
      invoice.financialYear === financialYear
    );
    const nextNumber = String(invoices.length + 1).padStart(3, '0');
    return `FI-${nextNumber}`;
  }

  // Farmer Invoice Module operations - Manual Invoice
  async getManualInvoices(financialYear: string, searchTerm?: string): Promise<ManualInvoice[]> {
    const invoices = Array.from(this.manualInvoices.values()).filter(invoice => 
      invoice.financialYear === financialYear
    );
    
    if (searchTerm) {
      return invoices.filter(invoice =>
        invoice.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.lotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.productName && invoice.productName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return invoices;
  }

  async getManualInvoice(id: string): Promise<ManualInvoice | undefined> {
    return this.manualInvoices.get(id);
  }

  async createManualInvoice(invoice: InsertManualInvoice): Promise<ManualInvoice> {
    const invoiceNo = await this.generateManualInvoiceNo(invoice.financialYear || '2025-26');
    const id = randomUUID();
    const manualInvoice: ManualInvoice = {
      ...invoice,
      id,
      invoiceNo,
      customFields: invoice.customFields || {},
      financialYear: invoice.financialYear || '2025-26',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.manualInvoices.set(id, manualInvoice);
    return manualInvoice;
  }

  async updateManualInvoice(id: string, invoice: UpdateManualInvoice): Promise<ManualInvoice> {
    const existing = this.manualInvoices.get(id);
    if (!existing) throw new Error('Manual invoice not found');
    
    const updated = { ...existing, ...invoice, updatedAt: new Date() };
    this.manualInvoices.set(id, updated);
    return updated;
  }

  async deleteManualInvoice(id: string): Promise<boolean> {
    return this.manualInvoices.delete(id);
  }

  async generateManualInvoiceNo(financialYear: string): Promise<string> {
    const invoices = Array.from(this.manualInvoices.values()).filter(invoice => 
      invoice.financialYear === financialYear
    );
    const nextNumber = String(invoices.length + 1).padStart(3, '0');
    return `MI-${nextNumber}`;
  }
  
  // Accounting Module operations - Rojmel
  async getRojmels(financialYear: string, searchTerm?: string): Promise<Rojmel[]> {
    const rojmels = Array.from(this.rojmels.values()).filter(rojmel => 
      rojmel.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return rojmels.filter(rojmel =>
        rojmel.rojmelId.toLowerCase().includes(searchLower)
      );
    }
    
    return rojmels;
  }

  async getRojmel(id: string): Promise<Rojmel | undefined> {
    return this.rojmels.get(id);
  }

  async createRojmel(rojmel: InsertRojmel): Promise<Rojmel> {
    const rojmelId = await this.generateRojmelId(rojmel.financialYear || '2025-26');
    const id = randomUUID();
    
    // Auto-calculate totals from income and expense records
    const incomeRecords = (rojmel.incomeRecords as any[]) || [];
    const expenseRecords = (rojmel.expenseRecords as any[]) || [];
    
    const totalIncome = incomeRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    const totalExpense = expenseRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    const net = totalIncome - totalExpense;
    
    const rojmelData: Rojmel = {
      ...rojmel,
      id,
      rojmelId,
      totalIncome: totalIncome.toString(),
      totalExpense: totalExpense.toString(),
      net: net.toString(),
      customFields: rojmel.customFields || {},
      financialYear: rojmel.financialYear || '2025-26',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rojmels.set(id, rojmelData);
    return rojmelData;
  }

  async updateRojmel(id: string, rojmel: UpdateRojmel): Promise<Rojmel> {
    const existing = this.rojmels.get(id);
    if (!existing) throw new Error('Rojmel not found');
    
    // Recalculate totals if records changed
    let totalIncome = existing.totalIncome;
    let totalExpense = existing.totalExpense;
    let net = existing.net;
    
    if (rojmel.incomeRecords || rojmel.expenseRecords) {
      const incomeRecords = (rojmel.incomeRecords as any[]) || (existing.incomeRecords as any[]) || [];
      const expenseRecords = (rojmel.expenseRecords as any[]) || (existing.expenseRecords as any[]) || [];
      
      const totalIncomeNum = incomeRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
      const totalExpenseNum = expenseRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
      const netNum = totalIncomeNum - totalExpenseNum;
      
      totalIncome = totalIncomeNum.toString();
      totalExpense = totalExpenseNum.toString();
      net = netNum.toString();
    }
    
    const updated = { 
      ...existing, 
      ...rojmel, 
      totalIncome, 
      totalExpense, 
      net,
      updatedAt: new Date() 
    };
    this.rojmels.set(id, updated);
    return updated;
  }

  async deleteRojmel(id: string): Promise<boolean> {
    return this.rojmels.delete(id);
  }

  async generateRojmelId(financialYear: string): Promise<string> {
    const rojmels = Array.from(this.rojmels.values()).filter(rojmel => 
      rojmel.financialYear === financialYear
    );
    const nextNumber = String(rojmels.length + 1).padStart(3, '0');
    return `ROJ-${nextNumber}`;
  }
  
  // Accounting Module operations - Income/Expense Receipt
  async getIncomeExpenseReceipts(financialYear: string, searchTerm?: string): Promise<IncomeExpenseReceipt[]> {
    const receipts = Array.from(this.incomeExpenseReceipts.values()).filter(receipt => 
      receipt.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return receipts.filter(receipt =>
        receipt.receiptNo.toLowerCase().includes(searchLower) ||
        receipt.name.toLowerCase().includes(searchLower) ||
        receipt.type.toLowerCase().includes(searchLower)
      );
    }
    
    return receipts;
  }

  async getIncomeExpenseReceipt(id: string): Promise<IncomeExpenseReceipt | undefined> {
    return this.incomeExpenseReceipts.get(id);
  }

  async createIncomeExpenseReceipt(receipt: InsertIncomeExpenseReceipt): Promise<IncomeExpenseReceipt> {
    const receiptNo = await this.generateIncomeExpenseReceiptNo(receipt.financialYear || '2025-26');
    const id = randomUUID();
    const receiptData: IncomeExpenseReceipt = {
      ...receipt,
      id,
      receiptNo,
      customFields: receipt.customFields || {},
      financialYear: receipt.financialYear || '2025-26',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.incomeExpenseReceipts.set(id, receiptData);
    return receiptData;
  }

  async updateIncomeExpenseReceipt(id: string, receipt: UpdateIncomeExpenseReceipt): Promise<IncomeExpenseReceipt> {
    const existing = this.incomeExpenseReceipts.get(id);
    if (!existing) throw new Error('Income/Expense receipt not found');
    
    const updated = { ...existing, ...receipt, updatedAt: new Date() };
    this.incomeExpenseReceipts.set(id, updated);
    return updated;
  }

  async deleteIncomeExpenseReceipt(id: string): Promise<boolean> {
    return this.incomeExpenseReceipts.delete(id);
  }

  async generateIncomeExpenseReceiptNo(financialYear: string): Promise<string> {
    const receipts = Array.from(this.incomeExpenseReceipts.values()).filter(receipt => 
      receipt.financialYear === financialYear
    );
    const nextNumber = String(receipts.length + 1).padStart(3, '0');
    return `IER-${nextNumber}`;
  }
  
  // Accounting Module operations - Bank Deposit Receipt
  async getBankDepositReceipts(financialYear: string, searchTerm?: string): Promise<BankDepositReceipt[]> {
    const receipts = Array.from(this.bankDepositReceipts.values()).filter(receipt => 
      receipt.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return receipts.filter(receipt =>
        receipt.receiptNo.toLowerCase().includes(searchLower) ||
        receipt.bankName.toLowerCase().includes(searchLower)
      );
    }
    
    return receipts;
  }

  async getBankDepositReceipt(id: string): Promise<BankDepositReceipt | undefined> {
    return this.bankDepositReceipts.get(id);
  }

  async createBankDepositReceipt(receipt: InsertBankDepositReceipt): Promise<BankDepositReceipt> {
    const receiptNo = await this.generateBankDepositReceiptNo(receipt.financialYear || '2025-26');
    const id = randomUUID();
    
    // Auto-calculate total from cashMode breakdown
    const cashMode = (receipt.cashMode as any[]) || [];
    const total = cashMode.reduce((sum, cash) => sum + (cash.amount || 0), 0);
    
    const receiptData: BankDepositReceipt = {
      ...receipt,
      id,
      receiptNo,
      total: total.toString(),
      customFields: receipt.customFields || {},
      financialYear: receipt.financialYear || '2025-26',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bankDepositReceipts.set(id, receiptData);
    return receiptData;
  }

  async updateBankDepositReceipt(id: string, receipt: UpdateBankDepositReceipt): Promise<BankDepositReceipt> {
    const existing = this.bankDepositReceipts.get(id);
    if (!existing) throw new Error('Bank deposit receipt not found');
    
    // Recalculate total if cashMode changed
    let total = existing.total;
    if (receipt.cashMode) {
      const cashMode = (receipt.cashMode as any[]) || [];
      const totalNum = cashMode.reduce((sum, cash) => sum + (cash.amount || 0), 0);
      total = totalNum.toString();
    }
    
    const updated = { ...existing, ...receipt, total, updatedAt: new Date() };
    this.bankDepositReceipts.set(id, updated);
    return updated;
  }

  async deleteBankDepositReceipt(id: string): Promise<boolean> {
    return this.bankDepositReceipts.delete(id);
  }

  async generateBankDepositReceiptNo(financialYear: string): Promise<string> {
    const receipts = Array.from(this.bankDepositReceipts.values()).filter(receipt => 
      receipt.financialYear === financialYear
    );
    const nextNumber = String(receipts.length + 1).padStart(3, '0');
    return `BDR-${nextNumber}`;
  }
  
  // Accounting Module operations - Balance Sheet
  async getBalanceSheets(financialYear: string, searchTerm?: string): Promise<BalanceSheet[]> {
    const sheets = Array.from(this.balanceSheets.values()).filter(sheet => 
      sheet.financialYear === financialYear
    );
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return sheets.filter(sheet =>
        sheet.balanceSheetId.toLowerCase().includes(searchLower)
      );
    }
    
    return sheets;
  }

  async getBalanceSheet(id: string): Promise<BalanceSheet | undefined> {
    return this.balanceSheets.get(id);
  }

  async createBalanceSheet(sheet: InsertBalanceSheet): Promise<BalanceSheet> {
    const balanceSheetId = await this.generateBalanceSheetId(sheet.financialYear || '2025-26');
    const id = randomUUID();
    
    // Auto-calculate netWorth from assets and liabilities
    const totalAssets = Number(sheet.totalAssets) || 0;
    const totalLiabilities = Number(sheet.totalLiabilities) || 0;
    const netWorth = totalAssets - totalLiabilities;
    
    const sheetData: BalanceSheet = {
      ...sheet,
      id,
      balanceSheetId,
      netWorth: netWorth.toString(),
      customFields: sheet.customFields || {},
      financialYear: sheet.financialYear || '2025-26',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.balanceSheets.set(id, sheetData);
    return sheetData;
  }

  async updateBalanceSheet(id: string, sheet: UpdateBalanceSheet): Promise<BalanceSheet> {
    const existing = this.balanceSheets.get(id);
    if (!existing) throw new Error('Balance sheet not found');
    
    // Recalculate netWorth if assets or liabilities changed
    let netWorth = existing.netWorth;
    if (sheet.totalAssets !== undefined || sheet.totalLiabilities !== undefined) {
      const totalAssets = Number(sheet.totalAssets || existing.totalAssets) || 0;
      const totalLiabilities = Number(sheet.totalLiabilities || existing.totalLiabilities) || 0;
      netWorth = (totalAssets - totalLiabilities).toString();
    }
    
    const updated = { ...existing, ...sheet, netWorth, updatedAt: new Date() };
    this.balanceSheets.set(id, updated);
    return updated;
  }

  async deleteBalanceSheet(id: string): Promise<boolean> {
    return this.balanceSheets.delete(id);
  }

  async generateBalanceSheetId(financialYear: string): Promise<string> {
    const sheets = Array.from(this.balanceSheets.values()).filter(sheet => 
      sheet.financialYear === financialYear
    );
    const nextNumber = String(sheets.length + 1).padStart(3, '0');
    return `BS-${nextNumber}`;
  }

  // Ledger Module operations - Uplag (Balance) Ledger
  async getUplagLedgers(financialYear: string, searchTerm?: string): Promise<UplagLedger[]> {
    let ledgers = Array.from(this.uplagLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      ledgers = ledgers.filter(ledger => 
        ledger.customerName.toLowerCase().includes(term) ||
        ledger.ledgerId.toLowerCase().includes(term)
      );
    }
    
    return ledgers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getUplagLedger(id: string): Promise<UplagLedger | undefined> {
    return this.uplagLedgers.get(id);
  }

  async createUplagLedger(ledger: InsertUplagLedger): Promise<UplagLedger> {
    const id = randomUUID();
    const ledgerId = await this.generateUplagLedgerId(ledger.financialYear);
    
    // Calculate total balance
    const totalBalance = (parseFloat(ledger.openingBalance?.toString() || '0') + 
                         parseFloat(ledger.paymentReceived?.toString() || '0')).toFixed(2);
    
    const newLedger: UplagLedger = {
      id,
      ledgerId,
      date: new Date(ledger.date),
      customerId: ledger.customerId,
      customerName: ledger.customerName,
      openingBalance: ledger.openingBalance || '0',
      paymentReceived: ledger.paymentReceived || '0',
      totalBalance,
      billNumbers: ledger.billNumbers || null,
      note: ledger.note || null,
      financialYear: ledger.financialYear,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.uplagLedgers.set(id, newLedger);
    return newLedger;
  }

  async updateUplagLedger(id: string, ledger: UpdateUplagLedger): Promise<UplagLedger> {
    const existing = this.uplagLedgers.get(id);
    if (!existing) {
      throw new Error(`Uplag ledger with id ${id} not found`);
    }

    // Recalculate total balance if amounts changed
    const openingBalance = ledger.openingBalance ?? existing.openingBalance;
    const paymentReceived = ledger.paymentReceived ?? existing.paymentReceived;
    const totalBalance = (parseFloat(openingBalance.toString()) + 
                         parseFloat(paymentReceived.toString())).toFixed(2);

    const updated: UplagLedger = {
      ...existing,
      ...ledger,
      totalBalance,
      updatedAt: new Date(),
    };
    
    this.uplagLedgers.set(id, updated);
    return updated;
  }

  async deleteUplagLedger(id: string): Promise<boolean> {
    return this.uplagLedgers.delete(id);
  }

  async generateUplagLedgerId(financialYear: string): Promise<string> {
    const ledgers = Array.from(this.uplagLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    const nextNumber = String(ledgers.length + 1).padStart(4, '0');
    return `UPL-${nextNumber}`;
  }

  // Ledger Module operations - Khata Ledger  
  async getKhataLedgers(financialYear: string, searchTerm?: string): Promise<KhataLedger[]> {
    let ledgers = Array.from(this.khataLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      ledgers = ledgers.filter(ledger => 
        ledger.customerName.toLowerCase().includes(term) ||
        ledger.ledgerId.toLowerCase().includes(term)
      );
    }
    
    return ledgers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getKhataLedger(id: string): Promise<KhataLedger | undefined> {
    return this.khataLedgers.get(id);
  }

  async createKhataLedger(ledger: InsertKhataLedger): Promise<KhataLedger> {
    const id = randomUUID();
    const ledgerId = await this.generateKhataLedgerId(ledger.financialYear);
    
    // Calculate total balance
    const totalBalance = (parseFloat(ledger.openingBalance?.toString() || '0') + 
                         parseFloat(ledger.paymentReceived?.toString() || '0')).toFixed(2);
    
    const newLedger: KhataLedger = {
      id,
      ledgerId,
      date: new Date(ledger.date),
      customerId: ledger.customerId,
      customerName: ledger.customerName,
      openingBalance: ledger.openingBalance || '0',
      paymentReceived: ledger.paymentReceived || '0',
      totalBalance,
      billNumbers: ledger.billNumbers || null,
      note: ledger.note || null,
      financialYear: ledger.financialYear,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.khataLedgers.set(id, newLedger);
    return newLedger;
  }

  async updateKhataLedger(id: string, ledger: UpdateKhataLedger): Promise<KhataLedger> {
    const existing = this.khataLedgers.get(id);
    if (!existing) {
      throw new Error(`Khata ledger with id ${id} not found`);
    }

    // Recalculate total balance if amounts changed
    const openingBalance = ledger.openingBalance ?? existing.openingBalance;
    const paymentReceived = ledger.paymentReceived ?? existing.paymentReceived;
    const totalBalance = (parseFloat(openingBalance.toString()) + 
                         parseFloat(paymentReceived.toString())).toFixed(2);

    const updated: KhataLedger = {
      ...existing,
      ...ledger,
      totalBalance,
      updatedAt: new Date(),
    };
    
    this.khataLedgers.set(id, updated);
    return updated;
  }

  async deleteKhataLedger(id: string): Promise<boolean> {
    return this.khataLedgers.delete(id);
  }

  async generateKhataLedgerId(financialYear: string): Promise<string> {
    const ledgers = Array.from(this.khataLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    const nextNumber = String(ledgers.length + 1).padStart(4, '0');
    return `KHA-${nextNumber}`;
  }

  // Ledger Module operations - Farmer/Transport Ledger
  async getFarmerTransportLedgers(financialYear: string, searchTerm?: string): Promise<FarmerTransportLedger[]> {
    let ledgers = Array.from(this.farmerTransportLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      ledgers = ledgers.filter(ledger => 
        ledger.customerName.toLowerCase().includes(term) ||
        ledger.ledgerId.toLowerCase().includes(term) ||
        (ledger.productName && ledger.productName.toLowerCase().includes(term))
      );
    }
    
    return ledgers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getFarmerTransportLedger(id: string): Promise<FarmerTransportLedger | undefined> {
    return this.farmerTransportLedgers.get(id);
  }

  async createFarmerTransportLedger(ledger: InsertFarmerTransportLedger): Promise<FarmerTransportLedger> {
    const id = randomUUID();
    const ledgerId = await this.generateFarmerTransportLedgerId(ledger.financialYear);
    
    // Calculate auto fields
    const grossAmount = parseFloat(ledger.farmerInvoiceGrossAmount?.toString() || '0');
    const expenses = parseFloat(ledger.expenses?.toString() || '0');
    const advance = parseFloat(ledger.advance?.toString() || '0');
    
    const netAmount = (grossAmount - expenses).toFixed(2);
    const amountPayable = (parseFloat(netAmount) - advance).toFixed(2);
    
    // For balance remaining, this would be calculated based on running balance logic
    const balanceRemaining = amountPayable; // Simplified for now
    
    const newLedger: FarmerTransportLedger = {
      id,
      ledgerId,
      date: new Date(ledger.date),
      customerId: ledger.customerId,
      customerName: ledger.customerName,
      invoiceId: ledger.invoiceId || null,
      invoiceGenerateDate: ledger.invoiceGenerateDate ? new Date(ledger.invoiceGenerateDate) : null,
      productName: ledger.productName || null,
      quantity: ledger.quantity || null,
      transportDetails: ledger.transportDetails || null,
      farmerInvoiceGrossAmount: ledger.farmerInvoiceGrossAmount || '0',
      expenses: ledger.expenses || '0',
      netAmount,
      advance: ledger.advance || '0',
      amountPayable,
      balanceRemaining,
      paymentMode: ledger.paymentMode || 'cash',
      note: ledger.note || null,
      financialYear: ledger.financialYear,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.farmerTransportLedgers.set(id, newLedger);
    return newLedger;
  }

  async updateFarmerTransportLedger(id: string, ledger: UpdateFarmerTransportLedger): Promise<FarmerTransportLedger> {
    const existing = this.farmerTransportLedgers.get(id);
    if (!existing) {
      throw new Error(`Farmer/Transport ledger with id ${id} not found`);
    }

    // Recalculate auto fields if amounts changed
    const grossAmount = parseFloat((ledger.farmerInvoiceGrossAmount ?? existing.farmerInvoiceGrossAmount).toString());
    const expenses = parseFloat((ledger.expenses ?? existing.expenses).toString());
    const advance = parseFloat((ledger.advance ?? existing.advance).toString());
    
    const netAmount = (grossAmount - expenses).toFixed(2);
    const amountPayable = (parseFloat(netAmount) - advance).toFixed(2);
    const balanceRemaining = amountPayable; // Simplified

    const updated: FarmerTransportLedger = {
      ...existing,
      ...ledger,
      netAmount,
      amountPayable,
      balanceRemaining,
      updatedAt: new Date(),
    };
    
    this.farmerTransportLedgers.set(id, updated);
    return updated;
  }

  async deleteFarmerTransportLedger(id: string): Promise<boolean> {
    return this.farmerTransportLedgers.delete(id);
  }

  async generateFarmerTransportLedgerId(financialYear: string): Promise<string> {
    const ledgers = Array.from(this.farmerTransportLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    const nextNumber = String(ledgers.length + 1).padStart(4, '0');
    return `FTL-${nextNumber}`;
  }

  // Ledger Module operations - Income Ledger
  async getIncomeLedgers(financialYear: string, searchTerm?: string): Promise<IncomeLedger[]> {
    let ledgers = Array.from(this.incomeLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      ledgers = ledgers.filter(ledger => 
        ledger.incomeSource.toLowerCase().includes(term) ||
        ledger.ledgerId.toLowerCase().includes(term) ||
        (ledger.description && ledger.description.toLowerCase().includes(term))
      );
    }
    
    return ledgers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getIncomeLedger(id: string): Promise<IncomeLedger | undefined> {
    return this.incomeLedgers.get(id);
  }

  async createIncomeLedger(ledger: InsertIncomeLedger): Promise<IncomeLedger> {
    const id = randomUUID();
    const ledgerId = await this.generateIncomeLedgerId(ledger.financialYear);
    
    // For running balance, this would be calculated based on all previous income entries
    // For now, simplified calculation
    const amount = parseFloat(ledger.amount.toString());
    const runningBalance = amount.toFixed(2); // Simplified
    
    const newLedger: IncomeLedger = {
      id,
      ledgerId,
      date: new Date(ledger.date),
      incomeSource: ledger.incomeSource,
      amount: ledger.amount,
      runningBalance,
      receiptId: ledger.receiptId || null,
      paymentMode: ledger.paymentMode,
      description: ledger.description || null,
      note: ledger.note || null,
      financialYear: ledger.financialYear,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.incomeLedgers.set(id, newLedger);
    return newLedger;
  }

  async updateIncomeLedger(id: string, ledger: UpdateIncomeLedger): Promise<IncomeLedger> {
    const existing = this.incomeLedgers.get(id);
    if (!existing) {
      throw new Error(`Income ledger with id ${id} not found`);
    }

    // Recalculate running balance if amount changed
    const amount = parseFloat((ledger.amount ?? existing.amount).toString());
    const runningBalance = amount.toFixed(2); // Simplified

    const updated: IncomeLedger = {
      ...existing,
      ...ledger,
      runningBalance,
      updatedAt: new Date(),
    };
    
    this.incomeLedgers.set(id, updated);
    return updated;
  }

  async deleteIncomeLedger(id: string): Promise<boolean> {
    return this.incomeLedgers.delete(id);
  }

  async generateIncomeLedgerId(financialYear: string): Promise<string> {
    const ledgers = Array.from(this.incomeLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    const nextNumber = String(ledgers.length + 1).padStart(4, '0');
    return `INC-${nextNumber}`;
  }

  // Ledger Module operations - Expense Ledger
  async getExpenseLedgers(financialYear: string, searchTerm?: string): Promise<ExpenseLedger[]> {
    let ledgers = Array.from(this.expenseLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      ledgers = ledgers.filter(ledger => 
        ledger.expenseCategory.toLowerCase().includes(term) ||
        ledger.ledgerId.toLowerCase().includes(term) ||
        (ledger.description && ledger.description.toLowerCase().includes(term))
      );
    }
    
    return ledgers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpenseLedger(id: string): Promise<ExpenseLedger | undefined> {
    return this.expenseLedgers.get(id);
  }

  async createExpenseLedger(ledger: InsertExpenseLedger): Promise<ExpenseLedger> {
    const id = randomUUID();
    const ledgerId = await this.generateExpenseLedgerId(ledger.financialYear);
    
    // For running balance, this would be calculated based on all previous expense entries
    const amount = parseFloat(ledger.amount.toString());
    const runningBalance = amount.toFixed(2); // Simplified
    
    const newLedger: ExpenseLedger = {
      id,
      ledgerId,
      date: new Date(ledger.date),
      expenseCategory: ledger.expenseCategory,
      amount: ledger.amount,
      runningBalance,
      receiptId: ledger.receiptId || null,
      paymentMode: ledger.paymentMode,
      description: ledger.description || null,
      note: ledger.note || null,
      financialYear: ledger.financialYear,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.expenseLedgers.set(id, newLedger);
    return newLedger;
  }

  async updateExpenseLedger(id: string, ledger: UpdateExpenseLedger): Promise<ExpenseLedger> {
    const existing = this.expenseLedgers.get(id);
    if (!existing) {
      throw new Error(`Expense ledger with id ${id} not found`);
    }

    // Recalculate running balance if amount changed
    const amount = parseFloat((ledger.amount ?? existing.amount).toString());
    const runningBalance = amount.toFixed(2); // Simplified

    const updated: ExpenseLedger = {
      ...existing,
      ...ledger,
      runningBalance,
      updatedAt: new Date(),
    };
    
    this.expenseLedgers.set(id, updated);
    return updated;
  }

  async deleteExpenseLedger(id: string): Promise<boolean> {
    return this.expenseLedgers.delete(id);
  }

  async generateExpenseLedgerId(financialYear: string): Promise<string> {
    const ledgers = Array.from(this.expenseLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    const nextNumber = String(ledgers.length + 1).padStart(4, '0');
    return `EXP-${nextNumber}`;
  }

  // Ledger Module operations - Bank Deposit Ledger
  async getBankDepositLedgers(financialYear: string, searchTerm?: string): Promise<BankDepositLedger[]> {
    let ledgers = Array.from(this.bankDepositLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      ledgers = ledgers.filter(ledger => 
        ledger.bankName.toLowerCase().includes(term) ||
        ledger.ledgerId.toLowerCase().includes(term) ||
        (ledger.description && ledger.description.toLowerCase().includes(term))
      );
    }
    
    return ledgers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getBankDepositLedger(id: string): Promise<BankDepositLedger | undefined> {
    return this.bankDepositLedgers.get(id);
  }

  async createBankDepositLedger(ledger: InsertBankDepositLedger): Promise<BankDepositLedger> {
    const id = randomUUID();
    const ledgerId = await this.generateBankDepositLedgerId(ledger.financialYear);
    
    // Calculate running balance (simplified for now)
    const depositAmount = parseFloat(ledger.depositAmount?.toString() || '0');
    const runningBalance = depositAmount.toFixed(2);
    
    const newLedger: BankDepositLedger = {
      id,
      ledgerId,
      date: new Date(ledger.date),
      bankName: ledger.bankName,
      accountNumber: ledger.accountNumber || null,
      depositAmount: ledger.depositAmount,
      runningBalance,
      receiptId: ledger.receiptId || null,
      transactionType: ledger.transactionType || 'deposit',
      cashBreakdown: ledger.cashBreakdown || null,
      description: ledger.description || null,
      note: ledger.note || null,
      financialYear: ledger.financialYear,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.bankDepositLedgers.set(id, newLedger);
    return newLedger;
  }

  async updateBankDepositLedger(id: string, ledger: UpdateBankDepositLedger): Promise<BankDepositLedger> {
    const existing = this.bankDepositLedgers.get(id);
    if (!existing) {
      throw new Error(`Bank deposit ledger with id ${id} not found`);
    }

    const updated: BankDepositLedger = {
      ...existing,
      ...ledger,
      updatedAt: new Date(),
    };
    
    this.bankDepositLedgers.set(id, updated);
    return updated;
  }

  async deleteBankDepositLedger(id: string): Promise<boolean> {
    return this.bankDepositLedgers.delete(id);
  }

  async generateBankDepositLedgerId(financialYear: string): Promise<string> {
    const ledgers = Array.from(this.bankDepositLedgers.values()).filter(ledger => 
      ledger.financialYear === financialYear
    );
    const nextNumber = String(ledgers.length + 1).padStart(4, '0');
    return `BDL-${nextNumber}`;
  }

  // Reports Module operations - MemStorage implementations
  async getReport(type: string, financialYear: string, filters?: Record<string, any>): Promise<any[]> {
    // Return empty array for in-memory storage - reports require database aggregations
    return [];
  }

  async createReportSnapshot(snapshot: InsertReportSnapshot): Promise<ReportSnapshot> {
    const id = randomUUID();
    const newSnapshot: ReportSnapshot = {
      id,
      ...snapshot,
      createdAt: new Date(),
    };
    // In memory implementation would store snapshots here
    return newSnapshot;
  }

  async getReportSnapshots(type?: string, financialYear?: string): Promise<ReportSnapshot[]> {
    return [];
  }

  async deleteReportSnapshot(id: string): Promise<boolean> {
    return true;
  }

  async getReportConfigs(type?: string, financialYear?: string): Promise<ReportConfig[]> {
    return [];
  }

  async getReportConfig(id: string): Promise<ReportConfig | undefined> {
    return undefined;
  }

  async createReportConfig(config: InsertReportConfig): Promise<ReportConfig> {
    const id = randomUUID();
    const newConfig: ReportConfig = {
      id,
      ...config,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newConfig;
  }

  async updateReportConfig(id: string, config: UpdateReportConfig): Promise<ReportConfig> {
    const existing = await this.getReportConfig(id);
    if (!existing) throw new Error("Report config not found");
    
    const updated: ReportConfig = {
      ...existing,
      ...config,
      updatedAt: new Date(),
    };
    return updated;
  }

  async deleteReportConfig(id: string): Promise<boolean> {
    return true;
  }

  // Settings Module Operations - MemStorage (Mock implementations)
  
  // Company Profile operations
  async getCompanyProfiles(financialYear: string): Promise<CompanyProfile[]> {
    return [];
  }

  async getCompanyProfile(id: string): Promise<CompanyProfile | undefined> {
    return undefined;
  }

  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const id = randomUUID();
    const newProfile: CompanyProfile = {
      id,
      ...profile,
      logoUrl: profile.logoUrl || null,
      customFields: profile.customFields || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newProfile;
  }

  async updateCompanyProfile(id: string, profile: UpdateCompanyProfile): Promise<CompanyProfile> {
    const existing = await this.getCompanyProfile(id);
    if (!existing) throw new Error("Company profile not found");
    
    const updated: CompanyProfile = {
      ...existing,
      ...profile,
      updatedAt: new Date(),
    };
    return updated;
  }

  async deleteCompanyProfile(id: string): Promise<boolean> {
    return true;
  }

  // Default Expenses operations
  async getDefaultExpenses(financialYear: string, searchTerm?: string): Promise<DefaultExpenses[]> {
    return [];
  }

  async getDefaultExpense(id: string): Promise<DefaultExpenses | undefined> {
    return undefined;
  }

  async createDefaultExpense(expense: InsertDefaultExpenses): Promise<DefaultExpenses> {
    const id = randomUUID();
    const newExpense: DefaultExpenses = {
      id,
      ...expense,
      customFields: expense.customFields || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newExpense;
  }

  async updateDefaultExpense(id: string, expense: UpdateDefaultExpenses): Promise<DefaultExpenses> {
    const existing = await this.getDefaultExpense(id);
    if (!existing) throw new Error("Default expense not found");
    
    const updated: DefaultExpenses = {
      ...existing,
      ...expense,
      updatedAt: new Date(),
    };
    return updated;
  }

  async deleteDefaultExpense(id: string): Promise<boolean> {
    return true;
  }

  // Printing Settings operations
  async getPrintingSettings(financialYear: string): Promise<PrintingSettings[]> {
    return [];
  }

  async getPrintingSetting(id: string): Promise<PrintingSettings | undefined> {
    return undefined;
  }

  async createPrintingSetting(setting: InsertPrintingSettings): Promise<PrintingSettings> {
    const id = randomUUID();
    const templateId = await this.generateTemplateId();
    const newSetting: PrintingSettings = {
      id,
      templateId,
      ...setting,
      fieldsToShow: setting.fieldsToShow || [],
      customFields: setting.customFields || {},
      isActive: setting.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newSetting;
  }

  async updatePrintingSetting(id: string, setting: UpdatePrintingSettings): Promise<PrintingSettings> {
    const existing = await this.getPrintingSetting(id);
    if (!existing) throw new Error("Printing setting not found");
    
    const updated: PrintingSettings = {
      ...existing,
      ...setting,
      updatedAt: new Date(),
    };
    return updated;
  }

  async deletePrintingSetting(id: string): Promise<boolean> {
    return true;
  }

  async generateTemplateId(): Promise<string> {
    const timestamp = Date.now().toString().slice(-6);
    return `TPL-${timestamp}`;
  }

  // Module Settings operations
  async getModuleSettings(financialYear: string): Promise<ModuleSettings[]> {
    return [];
  }

  async getModuleSetting(id: string): Promise<ModuleSettings | undefined> {
    return undefined;
  }

  async createModuleSetting(setting: InsertModuleSettings): Promise<ModuleSettings> {
    const id = randomUUID();
    const newSetting: ModuleSettings = {
      id,
      ...setting,
      moduleFields: setting.moduleFields || {},
      isActive: setting.isActive ?? true,
      customFields: setting.customFields || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newSetting;
  }

  async updateModuleSetting(id: string, setting: UpdateModuleSettings): Promise<ModuleSettings> {
    const existing = await this.getModuleSetting(id);
    if (!existing) throw new Error("Module setting not found");
    
    const updated: ModuleSettings = {
      ...existing,
      ...setting,
      updatedAt: new Date(),
    };
    return updated;
  }

  async deleteModuleSetting(id: string): Promise<boolean> {
    return true;
  }

  // WhatsApp Messages operations
  async getWhatsappMessages(financialYear: string, searchTerm?: string): Promise<WhatsappMessages[]> {
    let messages = Array.from(this.whatsappMessages.values()).filter(
      (message) => message.financialYear === financialYear
    );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      messages = messages.filter((message) =>
        String(message.recipient || '').toLowerCase().includes(term) ||
        String(message.messageText || '').toLowerCase().includes(term) ||
        String(message.type || '').toLowerCase().includes(term)
      );
    }

    return messages.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getWhatsappMessage(id: string): Promise<WhatsappMessages | undefined> {
    return this.whatsappMessages.get(id);
  }

  async createWhatsappMessage(insertMessage: InsertWhatsappMessages): Promise<WhatsappMessages> {
    const id = randomUUID();
    const messageId = await this.generateWhatsappMessageId();
    const now = new Date();
    const message: WhatsappMessages = {
      ...insertMessage,
      id,
      messageId,
      createdAt: now,
      updatedAt: now,
    };
    this.whatsappMessages.set(id, message);
    return message;
  }

  async updateWhatsappMessage(id: string, updateMessage: UpdateWhatsappMessages): Promise<WhatsappMessages> {
    const existing = this.whatsappMessages.get(id);
    if (!existing) {
      throw new Error(`WhatsApp message with id ${id} not found`);
    }
    const updated: WhatsappMessages = {
      ...existing,
      ...updateMessage,
      updatedAt: new Date(),
    };
    this.whatsappMessages.set(id, updated);
    return updated;
  }

  async deleteWhatsappMessage(id: string): Promise<boolean> {
    return this.whatsappMessages.delete(id);
  }

  async generateWhatsappMessageId(): Promise<string> {
    const messages = Array.from(this.whatsappMessages.values());
    const lastNumber = messages.reduce((max, message) => {
      const match = message.messageId.match(/MSG-(\d+)/);
      if (match) {
        return Math.max(max, parseInt(match[1]));
      }
      return max;
    }, 0);
    return `MSG-${(lastNumber + 1).toString().padStart(3, '0')}`;
  }

  // WhatsApp Templates operations
  async getWhatsappTemplates(financialYear: string, searchTerm?: string): Promise<WhatsappTemplates[]> {
    let templates = Array.from(this.whatsappTemplates.values()).filter(
      (template) => template.financialYear === financialYear
    );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      templates = templates.filter((template) =>
        String(template.templateName || '').toLowerCase().includes(term) ||
        String(template.templateText || '').toLowerCase().includes(term) ||
        String(template.type || '').toLowerCase().includes(term)
      );
    }

    return templates.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getWhatsappTemplate(id: string): Promise<WhatsappTemplates | undefined> {
    return this.whatsappTemplates.get(id);
  }

  async createWhatsappTemplate(insertTemplate: InsertWhatsappTemplates): Promise<WhatsappTemplates> {
    const id = randomUUID();
    const templateId = await this.generateWhatsappTemplateId();
    const now = new Date();
    const template: WhatsappTemplates = {
      ...insertTemplate,
      id,
      templateId,
      createdAt: now,
      updatedAt: now,
    };
    this.whatsappTemplates.set(id, template);
    return template;
  }

  async updateWhatsappTemplate(id: string, updateTemplate: UpdateWhatsappTemplates): Promise<WhatsappTemplates> {
    const existing = this.whatsappTemplates.get(id);
    if (!existing) {
      throw new Error(`WhatsApp template with id ${id} not found`);
    }
    const updated: WhatsappTemplates = {
      ...existing,
      ...updateTemplate,
      updatedAt: new Date(),
    };
    this.whatsappTemplates.set(id, updated);
    return updated;
  }

  async deleteWhatsappTemplate(id: string): Promise<boolean> {
    return this.whatsappTemplates.delete(id);
  }

  async generateWhatsappTemplateId(): Promise<string> {
    const templates = Array.from(this.whatsappTemplates.values());
    const lastNumber = templates.reduce((max, template) => {
      const match = template.templateId.match(/WTPL-(\d+)/);
      if (match) {
        return Math.max(max, parseInt(match[1]));
      }
      return max;
    }, 0);
    return `WTPL-${(lastNumber + 1).toString().padStart(3, '0')}`;
  }

  // WhatsApp Settings operations
  async getWhatsappSettings(financialYear: string): Promise<WhatsappSettings[]> {
    const settings = Array.from(this.whatsappSettings.values()).filter(
      (setting) => setting.financialYear === financialYear
    );
    
    // Remove sensitive fields from response
    return settings.map(setting => ({
      ...setting,
      apiKey: "••••••",
      apiSecret: setting.apiSecret ? "••••••" : null
    })).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getWhatsappSetting(id: string): Promise<WhatsappSettings | undefined> {
    const setting = this.whatsappSettings.get(id);
    if (!setting) return undefined;
    
    // Remove sensitive fields from response
    return {
      ...setting,
      apiKey: "••••••",
      apiSecret: setting.apiSecret ? "••••••" : null
    };
  }

  async createWhatsappSetting(insertSetting: InsertWhatsappSettings): Promise<WhatsappSettings> {
    const id = randomUUID();
    const settingId = await this.generateWhatsappSettingId();
    const now = new Date();
    const setting: WhatsappSettings = {
      ...insertSetting,
      id,
      settingId,
      createdAt: now,
      updatedAt: now,
    };
    this.whatsappSettings.set(id, setting);
    return setting;
  }

  async updateWhatsappSetting(id: string, updateSetting: UpdateWhatsappSettings): Promise<WhatsappSettings> {
    const existing = this.whatsappSettings.get(id);
    if (!existing) {
      throw new Error(`WhatsApp setting with id ${id} not found`);
    }
    const updated: WhatsappSettings = {
      ...existing,
      ...updateSetting,
      updatedAt: new Date(),
    };
    this.whatsappSettings.set(id, updated);
    return updated;
  }

  async deleteWhatsappSetting(id: string): Promise<boolean> {
    return this.whatsappSettings.delete(id);
  }

  async generateWhatsappSettingId(): Promise<string> {
    const settings = Array.from(this.whatsappSettings.values());
    const lastNumber = settings.reduce((max, setting) => {
      const match = setting.settingId.match(/WSET-(\d+)/);
      if (match) {
        return Math.max(max, parseInt(match[1]));
      }
      return max;
    }, 0);
    return `WSET-${(lastNumber + 1).toString().padStart(3, '0')}`;
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
    const accountId = await this.generateAccountId(account.type, account.name, account.financialYear || '2025-26');
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
    return (result.rowCount ?? 0) > 0;
  }

  async generateAccountId(type: string, name: string, financialYear: string): Promise<string> {
    // Extract type prefix (first letter)
    const typePrefix = type.charAt(0).toUpperCase();
    
    // Extract customer initials (first 2 letters of name)
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const nameWords = cleanName.split(' ');
    let initials = '';
    
    if (nameWords.length >= 2) {
      // First letter of first name + First letter of second name
      initials = nameWords[0].charAt(0).toUpperCase() + nameWords[1].charAt(0).toUpperCase();
    } else {
      // If single name, take first 2 letters
      initials = cleanName.substring(0, 2).toUpperCase();
    }
    
    // Generate unique ID by checking for existence and incrementing
    const prefix = `${typePrefix}-${initials}`;
    let sequenceNumber = 1;
    let candidateId = `${prefix}-${String(sequenceNumber).padStart(3, '0')}`;
    
    // Keep incrementing until we find a unique ID
    while (true) {
      const existing = await db.select().from(accountMaster)
        .where(and(
          eq(accountMaster.accountId, candidateId),
          eq(accountMaster.financialYear, financialYear)
        ));
      
      if (existing.length === 0) {
        return candidateId;
      }
      
      sequenceNumber++;
      candidateId = `${prefix}-${String(sequenceNumber).padStart(3, '0')}`;
      
      // Safety check to prevent infinite loop
      if (sequenceNumber > 999) {
        throw new Error(`Cannot generate unique account ID for prefix ${prefix} - too many accounts`);
      }
    }
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
    return (result.rowCount ?? 0) > 0;
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
    return (result.rowCount ?? 0) > 0;
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
    return (result.rowCount ?? 0) > 0;
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
    // For single lot creation, assume zero farmer quantity initially
    const lotId = await this.generateLotId("Product", Number(lot.totalQuantity), 0, lot.financialYear || '2025-26');
    const lotSequence = await this.getNextLotSequence(lot.financialYear || '2025-26');
    
    const lotData = {
      ...lot,
      lotId,
      lotSequence,
      transportName: null, // Will be populated from transportAccountId
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
    return (result.rowCount ?? 0) > 0;
  }

  async getNextLotSequence(financialYear: string): Promise<number> {
    const lots = await db.select().from(lotEntry).where(eq(lotEntry.financialYear, financialYear));
    return lots.length + 1;
  }

  async generateLotId(productName: string, totalQuantity: number, farmerQuantity: number, financialYear: string): Promise<string> {
    const sequence = await this.getNextLotSequence(financialYear);
    // Format: "ProductName+TotalQuantity-FarmerQuantity-Sequence"
    // Example: "Onion25-10-001"
    const cleanProductName = productName.replace(/\s+/g, ''); // Remove spaces
    return `${cleanProductName}${totalQuantity}-${farmerQuantity}-${String(sequence).padStart(3, '0')}`;
  }

  async createLotWithSubFields(lot: InsertLotEntry, subFields: InsertLotEntrySubFields[]): Promise<{ lot: LotEntry; subFields: LotEntrySubFields[] }> {
    // Calculate farmer quantity from sub-fields
    const farmerQuantity = subFields.reduce((sum, sub) => sum + Number(sub.quantity), 0);
    
    // Get product name for LotID generation
    const productName = "Product"; // TODO: Get actual product name from productId
    
    // Generate LotID
    const lotId = await this.generateLotId(productName, Number(lot.totalQuantity), farmerQuantity, lot.financialYear || '2025-26');
    const lotSequence = await this.getNextLotSequence(lot.financialYear || '2025-26');
    
    // Calculate average weight
    const averageWeight = lot.totalWeight ? 
      (Number(lot.totalWeight) / Number(lot.totalQuantity)).toString() : null;
    
    // Create lot entry
    const lotData = {
      ...lot,
      lotId,
      lotSequence,
      transportName: null, // Will be populated from transportAccountId
      averageWeight,
      financialYear: lot.financialYear || '2025-26'
    };
    const lotResult = await db.insert(lotEntry).values(lotData).returning();
    const createdLot = lotResult[0];
    
    // Create sub-fields with auto-calculations
    const createdSubFields: LotEntrySubFields[] = [];
    for (const subField of subFields) {
      // Auto-calculate weight and freight for sub-field
      const subFieldWeight = averageWeight ? 
        (Number(averageWeight) * Number(subField.quantity)).toString() : null;
      const subFieldFreight = lot.freight ? 
        ((Number(lot.freight) / Number(lot.totalQuantity)) * Number(subField.quantity)).toString() : null;
      
      const subFieldData = {
        ...subField,
        lotId,
        productId: lot.productId, // Auto from parent lot
        quality: subField.quality ?? null,
        weight: subFieldWeight,
        freight: subFieldFreight,
        averageRate: subField.averageRate ?? null,
        customFields: subField.customFields ?? null,
      };
      
      const subFieldResult = await db.insert(lotEntrySubFields).values(subFieldData).returning();
      createdSubFields.push(subFieldResult[0]);
    }
    
    return { lot: createdLot, subFields: createdSubFields };
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
    return (result.rowCount ?? 0) > 0;
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
    return (result.rowCount ?? 0) > 0;
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
    return (result.rowCount ?? 0) > 0;
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
    return (result.rowCount ?? 0) > 0;
  }

  async generateWeightSlipId(): Promise<string> {
    const slips = await db.select().from(weightSlip);
    const nextNumber = String(slips.length + 1).padStart(3, '0');
    return `WS-${nextNumber}`;
  }

  // Bill Desk operations - Customer Billing
  async getCustomerBillings(financialYear: string, searchTerm?: string): Promise<CustomerBilling[]> {
    let query = db.select().from(customerBilling).where(eq(customerBilling.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(customerBilling).where(
        and(
          eq(customerBilling.financialYear, financialYear),
          or(
            ilike(customerBilling.customerName, `%${searchTerm}%`),
            ilike(customerBilling.billNo, `%${searchTerm}%`),
            ilike(customerBilling.accountId, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query;
  }

  async getCustomerBilling(id: string): Promise<CustomerBilling | undefined> {
    const result = await db.select().from(customerBilling).where(eq(customerBilling.id, id));
    return result[0];
  }

  async createCustomerBilling(billing: InsertCustomerBilling): Promise<CustomerBilling> {
    const billNo = await this.generateCustomerBillNo(billing.financialYear || '2025-26');
    
    const billData = {
      ...billing,
      billNo,
      financialYear: billing.financialYear || '2025-26'
    };
    const result = await db.insert(customerBilling).values(billData).returning();
    return result[0];
  }

  async updateCustomerBilling(id: string, billing: UpdateCustomerBilling): Promise<CustomerBilling> {
    const result = await db.update(customerBilling)
      .set({ ...billing, updatedAt: new Date() })
      .where(eq(customerBilling.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Customer billing not found');
    }
    return result[0];
  }

  async deleteCustomerBilling(id: string): Promise<boolean> {
    const result = await db.delete(customerBilling).where(eq(customerBilling.id, id));
    return result.rowCount > 0;
  }

  async generateCustomerBillNo(financialYear: string): Promise<string> {
    const bills = await db.select().from(customerBilling).where(eq(customerBilling.financialYear, financialYear));
    const nextNumber = String(bills.length + 1).padStart(4, '0');
    return `cash-sv-${nextNumber}`;
  }

  // Bill Desk operations - Khata Billing
  async getKhataBillings(financialYear: string, searchTerm?: string): Promise<KhataBilling[]> {
    let query = db.select().from(khataBilling).where(eq(khataBilling.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(khataBilling).where(
        and(
          eq(khataBilling.financialYear, financialYear),
          or(
            ilike(khataBilling.customerName, `%${searchTerm}%`),
            ilike(khataBilling.billNo, `%${searchTerm}%`),
            ilike(khataBilling.accountId, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query;
  }

  async getKhataBilling(id: string): Promise<KhataBilling | undefined> {
    const result = await db.select().from(khataBilling).where(eq(khataBilling.id, id));
    return result[0];
  }

  async createKhataBilling(billing: InsertKhataBilling): Promise<KhataBilling> {
    const billNo = await this.generateKhataBillNo(billing.financialYear || '2025-26');
    
    const billData = {
      ...billing,
      billNo,
      financialYear: billing.financialYear || '2025-26'
    };
    const result = await db.insert(khataBilling).values(billData).returning();
    return result[0];
  }

  async updateKhataBilling(id: string, billing: UpdateKhataBilling): Promise<KhataBilling> {
    const result = await db.update(khataBilling)
      .set({ ...billing, updatedAt: new Date() })
      .where(eq(khataBilling.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Khata billing not found');
    }
    return result[0];
  }

  async deleteKhataBilling(id: string): Promise<boolean> {
    const result = await db.delete(khataBilling).where(eq(khataBilling.id, id));
    return result.rowCount > 0;
  }

  async generateKhataBillNo(financialYear: string): Promise<string> {
    const bills = await db.select().from(khataBilling).where(eq(khataBilling.financialYear, financialYear));
    const nextNumber = String(bills.length + 1).padStart(4, '0');
    return `khata-sv-${nextNumber}`;
  }

  // Bill Desk operations - Customer Payment Receipt
  async getCustomerPaymentReceipts(financialYear: string, searchTerm?: string): Promise<CustomerPaymentReceipt[]> {
    let query = db.select().from(customerPaymentReceipt).where(eq(customerPaymentReceipt.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(customerPaymentReceipt).where(
        and(
          eq(customerPaymentReceipt.financialYear, financialYear),
          or(
            ilike(customerPaymentReceipt.customerName, `%${searchTerm}%`),
            ilike(customerPaymentReceipt.receiptNo, `%${searchTerm}%`),
            ilike(customerPaymentReceipt.accountId, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query;
  }

  async getCustomerPaymentReceipt(id: string): Promise<CustomerPaymentReceipt | undefined> {
    const result = await db.select().from(customerPaymentReceipt).where(eq(customerPaymentReceipt.id, id));
    return result[0];
  }

  async createCustomerPaymentReceipt(receipt: InsertCustomerPaymentReceipt): Promise<CustomerPaymentReceipt> {
    const receiptNo = await this.generateCustomerReceiptNo(receipt.financialYear || '2025-26');
    
    const receiptData = {
      ...receipt,
      receiptNo,
      financialYear: receipt.financialYear || '2025-26'
    };
    const result = await db.insert(customerPaymentReceipt).values(receiptData).returning();
    return result[0];
  }

  async updateCustomerPaymentReceipt(id: string, receipt: UpdateCustomerPaymentReceipt): Promise<CustomerPaymentReceipt> {
    const result = await db.update(customerPaymentReceipt)
      .set({ ...receipt, updatedAt: new Date() })
      .where(eq(customerPaymentReceipt.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Customer payment receipt not found');
    }
    return result[0];
  }

  async deleteCustomerPaymentReceipt(id: string): Promise<boolean> {
    const result = await db.delete(customerPaymentReceipt).where(eq(customerPaymentReceipt.id, id));
    return result.rowCount > 0;
  }

  async generateCustomerReceiptNo(financialYear: string): Promise<string> {
    const receipts = await db.select().from(customerPaymentReceipt).where(eq(customerPaymentReceipt.financialYear, financialYear));
    const nextNumber = String(receipts.length + 1).padStart(3, '0');
    return `Rec-sv-${nextNumber}`;
  }

  // Bill Desk operations - Other Payment Receipt
  async getOtherPaymentReceipts(financialYear: string, searchTerm?: string): Promise<OtherPaymentReceipt[]> {
    let query = db.select().from(otherPaymentReceipt).where(eq(otherPaymentReceipt.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(otherPaymentReceipt).where(
        and(
          eq(otherPaymentReceipt.financialYear, financialYear),
          or(
            ilike(otherPaymentReceipt.partyName, `%${searchTerm}%`),
            ilike(otherPaymentReceipt.receiptNo, `%${searchTerm}%`),
            ilike(otherPaymentReceipt.accountId, `%${searchTerm}%`),
            ilike(otherPaymentReceipt.partyType, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query;
  }

  async getOtherPaymentReceipt(id: string): Promise<OtherPaymentReceipt | undefined> {
    const result = await db.select().from(otherPaymentReceipt).where(eq(otherPaymentReceipt.id, id));
    return result[0];
  }

  async createOtherPaymentReceipt(receipt: InsertOtherPaymentReceipt): Promise<OtherPaymentReceipt> {
    const receiptNo = await this.generateOtherReceiptNo(receipt.financialYear || '2025-26');
    
    const receiptData = {
      ...receipt,
      receiptNo,
      financialYear: receipt.financialYear || '2025-26'
    };
    const result = await db.insert(otherPaymentReceipt).values(receiptData).returning();
    return result[0];
  }

  async updateOtherPaymentReceipt(id: string, receipt: UpdateOtherPaymentReceipt): Promise<OtherPaymentReceipt> {
    const result = await db.update(otherPaymentReceipt)
      .set({ ...receipt, updatedAt: new Date() })
      .where(eq(otherPaymentReceipt.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Other payment receipt not found');
    }
    return result[0];
  }

  async deleteOtherPaymentReceipt(id: string): Promise<boolean> {
    const result = await db.delete(otherPaymentReceipt).where(eq(otherPaymentReceipt.id, id));
    return result.rowCount > 0;
  }

  async generateOtherReceiptNo(financialYear: string): Promise<string> {
    const receipts = await db.select().from(otherPaymentReceipt).where(eq(otherPaymentReceipt.financialYear, financialYear));
    const nextNumber = String(receipts.length + 1).padStart(3, '0');
    return `Rec-sv-${nextNumber}`;
  }

  // Farmer Invoice Module operations - Dhada Book
  async getDhadaBooks(financialYear: string, searchTerm?: string): Promise<DhadaBook[]> {
    let query = db.select().from(dhadaBook).where(eq(dhadaBook.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(dhadaBook).where(
        and(
          eq(dhadaBook.financialYear, financialYear),
          or(
            ilike(dhadaBook.farmerName, `%${searchTerm}%`),
            ilike(dhadaBook.dhadaId, `%${searchTerm}%`),
            ilike(dhadaBook.linkedLotId, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query;
  }

  async getDhadaBook(id: string): Promise<DhadaBook | undefined> {
    const result = await db.select().from(dhadaBook).where(eq(dhadaBook.id, id));
    return result[0];
  }

  async createDhadaBook(dhada: InsertDhadaBook): Promise<DhadaBook> {
    const dhadaId = await this.generateDhadaId(dhada.financialYear || '2025-26');
    
    const bookData = {
      ...dhada,
      dhadaId,
      financialYear: dhada.financialYear || '2025-26'
    };
    const result = await db.insert(dhadaBook).values(bookData).returning();
    return result[0];
  }

  async updateDhadaBook(id: string, dhada: UpdateDhadaBook): Promise<DhadaBook> {
    const result = await db.update(dhadaBook)
      .set({ ...dhada, updatedAt: new Date() })
      .where(eq(dhadaBook.id, id))
      .returning();
    return result[0];
  }

  async deleteDhadaBook(id: string): Promise<boolean> {
    const result = await db.delete(dhadaBook).where(eq(dhadaBook.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateDhadaId(financialYear: string): Promise<string> {
    const books = await db.select().from(dhadaBook).where(eq(dhadaBook.financialYear, financialYear));
    const nextNumber = String((books || []).length + 1).padStart(3, '0');
    return `DHD-${nextNumber}`;
  }

  // Farmer Invoice Module operations - Farmer Invoice
  async getFarmerInvoices(financialYear: string, searchTerm?: string): Promise<FarmerInvoice[]> {
    let query = db.select().from(farmerInvoice).where(eq(farmerInvoice.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(farmerInvoice).where(
        and(
          eq(farmerInvoice.financialYear, financialYear),
          or(
            ilike(farmerInvoice.farmerName, `%${searchTerm}%`),
            ilike(farmerInvoice.invoiceNo, `%${searchTerm}%`),
            ilike(farmerInvoice.lotId, `%${searchTerm}%`),
            ilike(farmerInvoice.productName, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query;
  }

  async getFarmerInvoice(id: string): Promise<FarmerInvoice | undefined> {
    const result = await db.select().from(farmerInvoice).where(eq(farmerInvoice.id, id));
    return result[0];
  }

  async createFarmerInvoice(invoice: InsertFarmerInvoice): Promise<FarmerInvoice> {
    const invoiceNo = await this.generateFarmerInvoiceNo(invoice.financialYear || '2025-26');
    
    const invoiceData = {
      ...invoice,
      invoiceNo,
      financialYear: invoice.financialYear || '2025-26'
    };
    const result = await db.insert(farmerInvoice).values(invoiceData).returning();
    return result[0];
  }

  async updateFarmerInvoice(id: string, invoice: UpdateFarmerInvoice): Promise<FarmerInvoice> {
    const result = await db.update(farmerInvoice)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(farmerInvoice.id, id))
      .returning();
    return result[0];
  }

  async deleteFarmerInvoice(id: string): Promise<boolean> {
    const result = await db.delete(farmerInvoice).where(eq(farmerInvoice.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateFarmerInvoiceNo(financialYear: string): Promise<string> {
    const invoices = await db.select().from(farmerInvoice).where(eq(farmerInvoice.financialYear, financialYear));
    const nextNumber = String((invoices || []).length + 1).padStart(3, '0');
    return `FI-${nextNumber}`;
  }

  // Farmer Invoice Module operations - Manual Invoice
  async getManualInvoices(financialYear: string, searchTerm?: string): Promise<ManualInvoice[]> {
    let query = db.select().from(manualInvoice).where(eq(manualInvoice.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(manualInvoice).where(
        and(
          eq(manualInvoice.financialYear, financialYear),
          or(
            ilike(manualInvoice.farmerName, `%${searchTerm}%`),
            ilike(manualInvoice.invoiceNo, `%${searchTerm}%`),
            ilike(manualInvoice.lotId, `%${searchTerm}%`),
            ilike(manualInvoice.productName, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query;
  }

  async getManualInvoice(id: string): Promise<ManualInvoice | undefined> {
    const result = await db.select().from(manualInvoice).where(eq(manualInvoice.id, id));
    return result[0];
  }

  async createManualInvoice(invoice: InsertManualInvoice): Promise<ManualInvoice> {
    const invoiceNo = await this.generateManualInvoiceNo(invoice.financialYear || '2025-26');
    
    const invoiceData = {
      ...invoice,
      invoiceNo,
      financialYear: invoice.financialYear || '2025-26'
    };
    const result = await db.insert(manualInvoice).values(invoiceData).returning();
    return result[0];
  }

  async updateManualInvoice(id: string, invoice: UpdateManualInvoice): Promise<ManualInvoice> {
    const result = await db.update(manualInvoice)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(manualInvoice.id, id))
      .returning();
    return result[0];
  }

  async deleteManualInvoice(id: string): Promise<boolean> {
    const result = await db.delete(manualInvoice).where(eq(manualInvoice.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateManualInvoiceNo(financialYear: string): Promise<string> {
    const invoices = await db.select().from(manualInvoice).where(eq(manualInvoice.financialYear, financialYear));
    const nextNumber = String((invoices || []).length + 1).padStart(3, '0');
    return `MI-${nextNumber}`;
  }
  
  // Accounting Module operations - Rojmel
  async getRojmels(financialYear: string, searchTerm?: string): Promise<Rojmel[]> {
    let query = db.select().from(rojmel).where(eq(rojmel.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(rojmel).where(
        and(
          eq(rojmel.financialYear, financialYear),
          ilike(rojmel.rojmelId, `%${searchTerm}%`)
        )
      );
    }
    
    return await query;
  }

  async getRojmel(id: string): Promise<Rojmel | undefined> {
    const result = await db.select().from(rojmel).where(eq(rojmel.id, id));
    return result[0];
  }

  async createRojmel(rojmelData: InsertRojmel): Promise<Rojmel> {
    const rojmelId = await this.generateRojmelId(rojmelData.financialYear || '2025-26');
    
    // Auto-calculate totals from income and expense records
    const incomeRecords = (rojmelData.incomeRecords as any[]) || [];
    const expenseRecords = (rojmelData.expenseRecords as any[]) || [];
    
    const totalIncome = incomeRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    const totalExpense = expenseRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    const net = totalIncome - totalExpense;
    
    const data = {
      ...rojmelData,
      rojmelId,
      totalIncome: totalIncome.toString(),
      totalExpense: totalExpense.toString(),
      net: net.toString(),
      financialYear: rojmelData.financialYear || '2025-26'
    };
    const result = await db.insert(rojmel).values(data).returning();
    return result[0];
  }

  async updateRojmel(id: string, rojmelData: UpdateRojmel): Promise<Rojmel> {
    // Get existing record for recalculation
    const existing = await this.getRojmel(id);
    if (!existing) throw new Error('Rojmel not found');
    
    // Recalculate totals if records changed
    let totalIncome = existing.totalIncome;
    let totalExpense = existing.totalExpense;
    let net = existing.net;
    
    if (rojmelData.incomeRecords || rojmelData.expenseRecords) {
      const incomeRecords = (rojmelData.incomeRecords as any[]) || (existing.incomeRecords as any[]) || [];
      const expenseRecords = (rojmelData.expenseRecords as any[]) || (existing.expenseRecords as any[]) || [];
      
      const totalIncomeNum = incomeRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
      const totalExpenseNum = expenseRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
      const netNum = totalIncomeNum - totalExpenseNum;
      
      totalIncome = totalIncomeNum.toString();
      totalExpense = totalExpenseNum.toString();
      net = netNum.toString();
    }
    
    const result = await db.update(rojmel)
      .set({ 
        ...rojmelData, 
        totalIncome, 
        totalExpense, 
        net,
        updatedAt: new Date() 
      })
      .where(eq(rojmel.id, id))
      .returning();
    return result[0];
  }

  async deleteRojmel(id: string): Promise<boolean> {
    const result = await db.delete(rojmel).where(eq(rojmel.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateRojmelId(financialYear: string): Promise<string> {
    const rojmels = await db.select().from(rojmel).where(eq(rojmel.financialYear, financialYear));
    const nextNumber = String((rojmels || []).length + 1).padStart(3, '0');
    return `ROJ-${nextNumber}`;
  }
  
  // Accounting Module operations - Income/Expense Receipt
  async getIncomeExpenseReceipts(financialYear: string, searchTerm?: string): Promise<IncomeExpenseReceipt[]> {
    let query = db.select().from(incomeExpenseReceipt).where(eq(incomeExpenseReceipt.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(incomeExpenseReceipt).where(
        and(
          eq(incomeExpenseReceipt.financialYear, financialYear),
          or(
            ilike(incomeExpenseReceipt.receiptNo, `%${searchTerm}%`),
            ilike(incomeExpenseReceipt.name, `%${searchTerm}%`),
            ilike(incomeExpenseReceipt.type, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query;
  }

  async getIncomeExpenseReceipt(id: string): Promise<IncomeExpenseReceipt | undefined> {
    const result = await db.select().from(incomeExpenseReceipt).where(eq(incomeExpenseReceipt.id, id));
    return result[0];
  }

  async createIncomeExpenseReceipt(receipt: InsertIncomeExpenseReceipt): Promise<IncomeExpenseReceipt> {
    const receiptNo = await this.generateIncomeExpenseReceiptNo(receipt.financialYear || '2025-26');
    
    const receiptData = {
      ...receipt,
      receiptNo,
      financialYear: receipt.financialYear || '2025-26'
    };
    const result = await db.insert(incomeExpenseReceipt).values(receiptData).returning();
    return result[0];
  }

  async updateIncomeExpenseReceipt(id: string, receipt: UpdateIncomeExpenseReceipt): Promise<IncomeExpenseReceipt> {
    const result = await db.update(incomeExpenseReceipt)
      .set({ ...receipt, updatedAt: new Date() })
      .where(eq(incomeExpenseReceipt.id, id))
      .returning();
    return result[0];
  }

  async deleteIncomeExpenseReceipt(id: string): Promise<boolean> {
    const result = await db.delete(incomeExpenseReceipt).where(eq(incomeExpenseReceipt.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateIncomeExpenseReceiptNo(financialYear: string): Promise<string> {
    const receipts = await db.select().from(incomeExpenseReceipt).where(eq(incomeExpenseReceipt.financialYear, financialYear));
    const nextNumber = String((receipts || []).length + 1).padStart(3, '0');
    return `IER-${nextNumber}`;
  }
  
  // Accounting Module operations - Bank Deposit Receipt
  async getBankDepositReceipts(financialYear: string, searchTerm?: string): Promise<BankDepositReceipt[]> {
    let query = db.select().from(bankDepositReceipt).where(eq(bankDepositReceipt.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(bankDepositReceipt).where(
        and(
          eq(bankDepositReceipt.financialYear, financialYear),
          or(
            ilike(bankDepositReceipt.receiptNo, `%${searchTerm}%`),
            ilike(bankDepositReceipt.bankName, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query;
  }

  async getBankDepositReceipt(id: string): Promise<BankDepositReceipt | undefined> {
    const result = await db.select().from(bankDepositReceipt).where(eq(bankDepositReceipt.id, id));
    return result[0];
  }

  async createBankDepositReceipt(receipt: InsertBankDepositReceipt): Promise<BankDepositReceipt> {
    const receiptNo = await this.generateBankDepositReceiptNo(receipt.financialYear || '2025-26');
    
    // Auto-calculate total from cashMode breakdown
    const cashMode = (receipt.cashMode as any[]) || [];
    const total = cashMode.reduce((sum, cash) => sum + (cash.amount || 0), 0);
    
    const receiptData = {
      ...receipt,
      receiptNo,
      total: total.toString(),
      financialYear: receipt.financialYear || '2025-26'
    };
    const result = await db.insert(bankDepositReceipt).values(receiptData).returning();
    return result[0];
  }

  async updateBankDepositReceipt(id: string, receipt: UpdateBankDepositReceipt): Promise<BankDepositReceipt> {
    // Get existing record for recalculation if needed
    const existing = await this.getBankDepositReceipt(id);
    if (!existing) throw new Error('Bank deposit receipt not found');
    
    // Recalculate total if cashMode changed
    let total = existing.total;
    if (receipt.cashMode) {
      const cashMode = (receipt.cashMode as any[]) || [];
      const totalNum = cashMode.reduce((sum, cash) => sum + (cash.amount || 0), 0);
      total = totalNum.toString();
    }
    
    const result = await db.update(bankDepositReceipt)
      .set({ ...receipt, total, updatedAt: new Date() })
      .where(eq(bankDepositReceipt.id, id))
      .returning();
    return result[0];
  }

  async deleteBankDepositReceipt(id: string): Promise<boolean> {
    const result = await db.delete(bankDepositReceipt).where(eq(bankDepositReceipt.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateBankDepositReceiptNo(financialYear: string): Promise<string> {
    const receipts = await db.select().from(bankDepositReceipt).where(eq(bankDepositReceipt.financialYear, financialYear));
    const nextNumber = String((receipts || []).length + 1).padStart(3, '0');
    return `BDR-${nextNumber}`;
  }
  
  // Accounting Module operations - Balance Sheet
  async getBalanceSheets(financialYear: string, searchTerm?: string): Promise<BalanceSheet[]> {
    let query = db.select().from(balanceSheet).where(eq(balanceSheet.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(balanceSheet).where(
        and(
          eq(balanceSheet.financialYear, financialYear),
          ilike(balanceSheet.balanceSheetId, `%${searchTerm}%`)
        )
      );
    }
    
    return await query;
  }

  async getBalanceSheet(id: string): Promise<BalanceSheet | undefined> {
    const result = await db.select().from(balanceSheet).where(eq(balanceSheet.id, id));
    return result[0];
  }

  async createBalanceSheet(sheet: InsertBalanceSheet): Promise<BalanceSheet> {
    const balanceSheetId = await this.generateBalanceSheetId(sheet.financialYear || '2025-26');
    
    // Auto-calculate netWorth from assets and liabilities
    const totalAssets = Number(sheet.totalAssets) || 0;
    const totalLiabilities = Number(sheet.totalLiabilities) || 0;
    const netWorth = totalAssets - totalLiabilities;
    
    const sheetData = {
      ...sheet,
      balanceSheetId,
      netWorth: netWorth.toString(),
      financialYear: sheet.financialYear || '2025-26'
    };
    const result = await db.insert(balanceSheet).values(sheetData).returning();
    return result[0];
  }

  async updateBalanceSheet(id: string, sheet: UpdateBalanceSheet): Promise<BalanceSheet> {
    // Get existing record for recalculation
    const existing = await this.getBalanceSheet(id);
    if (!existing) throw new Error('Balance sheet not found');
    
    // Recalculate netWorth if assets or liabilities changed
    let netWorth = existing.netWorth;
    if (sheet.totalAssets !== undefined || sheet.totalLiabilities !== undefined) {
      const totalAssets = Number(sheet.totalAssets || existing.totalAssets) || 0;
      const totalLiabilities = Number(sheet.totalLiabilities || existing.totalLiabilities) || 0;
      netWorth = (totalAssets - totalLiabilities).toString();
    }
    
    const result = await db.update(balanceSheet)
      .set({ ...sheet, netWorth, updatedAt: new Date() })
      .where(eq(balanceSheet.id, id))
      .returning();
    return result[0];
  }

  async deleteBalanceSheet(id: string): Promise<boolean> {
    const result = await db.delete(balanceSheet).where(eq(balanceSheet.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateBalanceSheetId(financialYear: string): Promise<string> {
    const sheets = await db.select().from(balanceSheet).where(eq(balanceSheet.financialYear, financialYear));
    const nextNumber = String((sheets || []).length + 1).padStart(3, '0');
    return `BS-${nextNumber}`;
  }

  // Ledger Module operations - Uplag (Balance) Ledger
  async getUplagLedgers(financialYear: string, searchTerm?: string): Promise<UplagLedger[]> {
    let query = db.select().from(uplagLedger).where(eq(uplagLedger.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(uplagLedger).where(
        and(
          eq(uplagLedger.financialYear, financialYear),
          or(
            ilike(uplagLedger.customerName, `%${searchTerm}%`),
            ilike(uplagLedger.ledgerId, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query.orderBy(uplagLedger.date);
  }

  async getUplagLedger(id: string): Promise<UplagLedger | undefined> {
    const result = await db.select().from(uplagLedger).where(eq(uplagLedger.id, id));
    return result[0];
  }

  async createUplagLedger(ledger: InsertUplagLedger): Promise<UplagLedger> {
    const ledgerId = await this.generateUplagLedgerId(ledger.financialYear);
    
    // Calculate total balance
    const openingBalance = Number(ledger.openingBalance || 0);
    const paymentReceived = Number(ledger.paymentReceived || 0);
    const totalBalance = (openingBalance + paymentReceived).toString();
    
    const ledgerData = {
      ...ledger,
      ledgerId,
      totalBalance,
    };
    
    const result = await db.insert(uplagLedger).values(ledgerData).returning();
    return result[0];
  }

  async updateUplagLedger(id: string, ledger: UpdateUplagLedger): Promise<UplagLedger> {
    // Get existing record for recalculation
    const existing = await this.getUplagLedger(id);
    if (!existing) throw new Error('Uplag ledger not found');
    
    // Recalculate total balance if amounts changed
    let totalBalance = existing.totalBalance;
    if (ledger.openingBalance !== undefined || ledger.paymentReceived !== undefined) {
      const openingBalance = Number(ledger.openingBalance ?? existing.openingBalance);
      const paymentReceived = Number(ledger.paymentReceived ?? existing.paymentReceived);
      totalBalance = (openingBalance + paymentReceived).toString();
    }
    
    const result = await db.update(uplagLedger)
      .set({ ...ledger, totalBalance, updatedAt: new Date() })
      .where(eq(uplagLedger.id, id))
      .returning();
    return result[0];
  }

  async deleteUplagLedger(id: string): Promise<boolean> {
    const result = await db.delete(uplagLedger).where(eq(uplagLedger.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateUplagLedgerId(financialYear: string): Promise<string> {
    const ledgers = await db.select().from(uplagLedger).where(eq(uplagLedger.financialYear, financialYear));
    const nextNumber = String((ledgers || []).length + 1).padStart(4, '0');
    return `UPL-${nextNumber}`;
  }

  // Ledger Module operations - Khata Ledger
  async getKhataLedgers(financialYear: string, searchTerm?: string): Promise<KhataLedger[]> {
    let query = db.select().from(khataLedger).where(eq(khataLedger.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(khataLedger).where(
        and(
          eq(khataLedger.financialYear, financialYear),
          or(
            ilike(khataLedger.customerName, `%${searchTerm}%`),
            ilike(khataLedger.ledgerId, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query.orderBy(khataLedger.date);
  }

  async getKhataLedger(id: string): Promise<KhataLedger | undefined> {
    const result = await db.select().from(khataLedger).where(eq(khataLedger.id, id));
    return result[0];
  }

  async createKhataLedger(ledger: InsertKhataLedger): Promise<KhataLedger> {
    const ledgerId = await this.generateKhataLedgerId(ledger.financialYear);
    
    // Calculate total balance
    const openingBalance = Number(ledger.openingBalance || 0);
    const paymentReceived = Number(ledger.paymentReceived || 0);
    const totalBalance = (openingBalance + paymentReceived).toString();
    
    const ledgerData = {
      ...ledger,
      ledgerId,
      totalBalance,
    };
    
    const result = await db.insert(khataLedger).values(ledgerData).returning();
    return result[0];
  }

  async updateKhataLedger(id: string, ledger: UpdateKhataLedger): Promise<KhataLedger> {
    // Get existing record for recalculation
    const existing = await this.getKhataLedger(id);
    if (!existing) throw new Error('Khata ledger not found');
    
    // Recalculate total balance if amounts changed
    let totalBalance = existing.totalBalance;
    if (ledger.openingBalance !== undefined || ledger.paymentReceived !== undefined) {
      const openingBalance = Number(ledger.openingBalance ?? existing.openingBalance);
      const paymentReceived = Number(ledger.paymentReceived ?? existing.paymentReceived);
      totalBalance = (openingBalance + paymentReceived).toString();
    }
    
    const result = await db.update(khataLedger)
      .set({ ...ledger, totalBalance, updatedAt: new Date() })
      .where(eq(khataLedger.id, id))
      .returning();
    return result[0];
  }

  async deleteKhataLedger(id: string): Promise<boolean> {
    const result = await db.delete(khataLedger).where(eq(khataLedger.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateKhataLedgerId(financialYear: string): Promise<string> {
    const ledgers = await db.select().from(khataLedger).where(eq(khataLedger.financialYear, financialYear));
    const nextNumber = String((ledgers || []).length + 1).padStart(4, '0');
    return `KHA-${nextNumber}`;
  }

  // Ledger Module operations - Farmer/Transport Ledger
  async getFarmerTransportLedgers(financialYear: string, searchTerm?: string): Promise<FarmerTransportLedger[]> {
    let query = db.select().from(farmerTransportLedger).where(eq(farmerTransportLedger.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(farmerTransportLedger).where(
        and(
          eq(farmerTransportLedger.financialYear, financialYear),
          or(
            ilike(farmerTransportLedger.customerName, `%${searchTerm}%`),
            ilike(farmerTransportLedger.ledgerId, `%${searchTerm}%`),
            ilike(farmerTransportLedger.productName, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query.orderBy(farmerTransportLedger.date);
  }

  async getFarmerTransportLedger(id: string): Promise<FarmerTransportLedger | undefined> {
    const result = await db.select().from(farmerTransportLedger).where(eq(farmerTransportLedger.id, id));
    return result[0];
  }

  async createFarmerTransportLedger(ledger: InsertFarmerTransportLedger): Promise<FarmerTransportLedger> {
    const ledgerId = await this.generateFarmerTransportLedgerId(ledger.financialYear);
    
    // Calculate auto fields
    const grossAmount = Number(ledger.farmerInvoiceGrossAmount || 0);
    const expenses = Number(ledger.expenses || 0);
    const advance = Number(ledger.advance || 0);
    
    const netAmount = (grossAmount - expenses).toString();
    const amountPayable = (parseFloat(netAmount) - advance).toString();
    const balanceRemaining = amountPayable; // Simplified
    
    const ledgerData = {
      ...ledger,
      ledgerId,
      netAmount,
      amountPayable,
      balanceRemaining,
    };
    
    const result = await db.insert(farmerTransportLedger).values(ledgerData).returning();
    return result[0];
  }

  async updateFarmerTransportLedger(id: string, ledger: UpdateFarmerTransportLedger): Promise<FarmerTransportLedger> {
    // Get existing record for recalculation
    const existing = await this.getFarmerTransportLedger(id);
    if (!existing) throw new Error('Farmer/Transport ledger not found');
    
    // Recalculate auto fields if amounts changed
    let netAmount = existing.netAmount;
    let amountPayable = existing.amountPayable;
    let balanceRemaining = existing.balanceRemaining;
    
    if (ledger.farmerInvoiceGrossAmount !== undefined || ledger.expenses !== undefined || ledger.advance !== undefined) {
      const grossAmount = Number(ledger.farmerInvoiceGrossAmount ?? existing.farmerInvoiceGrossAmount);
      const expenses = Number(ledger.expenses ?? existing.expenses);
      const advance = Number(ledger.advance ?? existing.advance);
      
      netAmount = (grossAmount - expenses).toString();
      amountPayable = (parseFloat(netAmount) - advance).toString();
      balanceRemaining = amountPayable; // Simplified
    }
    
    const result = await db.update(farmerTransportLedger)
      .set({ ...ledger, netAmount, amountPayable, balanceRemaining, updatedAt: new Date() })
      .where(eq(farmerTransportLedger.id, id))
      .returning();
    return result[0];
  }

  async deleteFarmerTransportLedger(id: string): Promise<boolean> {
    const result = await db.delete(farmerTransportLedger).where(eq(farmerTransportLedger.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateFarmerTransportLedgerId(financialYear: string): Promise<string> {
    const ledgers = await db.select().from(farmerTransportLedger).where(eq(farmerTransportLedger.financialYear, financialYear));
    const nextNumber = String((ledgers || []).length + 1).padStart(4, '0');
    return `FTL-${nextNumber}`;
  }

  // Ledger Module operations - Income Ledger
  async getIncomeLedgers(financialYear: string, searchTerm?: string): Promise<IncomeLedger[]> {
    let query = db.select().from(incomeLedger).where(eq(incomeLedger.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(incomeLedger).where(
        and(
          eq(incomeLedger.financialYear, financialYear),
          or(
            ilike(incomeLedger.incomeSource, `%${searchTerm}%`),
            ilike(incomeLedger.ledgerId, `%${searchTerm}%`),
            ilike(incomeLedger.description, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query.orderBy(incomeLedger.date);
  }

  async getIncomeLedger(id: string): Promise<IncomeLedger | undefined> {
    const result = await db.select().from(incomeLedger).where(eq(incomeLedger.id, id));
    return result[0];
  }

  async createIncomeLedger(ledger: InsertIncomeLedger): Promise<IncomeLedger> {
    const ledgerId = await this.generateIncomeLedgerId(ledger.financialYear);
    
    // For running balance, this would be calculated based on all previous income entries
    const amount = Number(ledger.amount);
    const runningBalance = amount.toString(); // Simplified
    
    const ledgerData = {
      ...ledger,
      ledgerId,
      runningBalance,
    };
    
    const result = await db.insert(incomeLedger).values(ledgerData).returning();
    return result[0];
  }

  async updateIncomeLedger(id: string, ledger: UpdateIncomeLedger): Promise<IncomeLedger> {
    // Get existing record for recalculation
    const existing = await this.getIncomeLedger(id);
    if (!existing) throw new Error('Income ledger not found');
    
    // Recalculate running balance if amount changed
    let runningBalance = existing.runningBalance;
    if (ledger.amount !== undefined) {
      const amount = Number(ledger.amount);
      runningBalance = amount.toString(); // Simplified
    }
    
    const result = await db.update(incomeLedger)
      .set({ ...ledger, runningBalance, updatedAt: new Date() })
      .where(eq(incomeLedger.id, id))
      .returning();
    return result[0];
  }

  async deleteIncomeLedger(id: string): Promise<boolean> {
    const result = await db.delete(incomeLedger).where(eq(incomeLedger.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateIncomeLedgerId(financialYear: string): Promise<string> {
    const ledgers = await db.select().from(incomeLedger).where(eq(incomeLedger.financialYear, financialYear));
    const nextNumber = String((ledgers || []).length + 1).padStart(4, '0');
    return `INC-${nextNumber}`;
  }

  // Ledger Module operations - Expense Ledger
  async getExpenseLedgers(financialYear: string, searchTerm?: string): Promise<ExpenseLedger[]> {
    let query = db.select().from(expenseLedger).where(eq(expenseLedger.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(expenseLedger).where(
        and(
          eq(expenseLedger.financialYear, financialYear),
          or(
            ilike(expenseLedger.expenseCategory, `%${searchTerm}%`),
            ilike(expenseLedger.ledgerId, `%${searchTerm}%`),
            ilike(expenseLedger.description, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query.orderBy(expenseLedger.date);
  }

  async getExpenseLedger(id: string): Promise<ExpenseLedger | undefined> {
    const result = await db.select().from(expenseLedger).where(eq(expenseLedger.id, id));
    return result[0];
  }

  async createExpenseLedger(ledger: InsertExpenseLedger): Promise<ExpenseLedger> {
    const ledgerId = await this.generateExpenseLedgerId(ledger.financialYear);
    
    // For running balance, this would be calculated based on all previous expense entries
    const amount = Number(ledger.amount);
    const runningBalance = amount.toString(); // Simplified
    
    const ledgerData = {
      ...ledger,
      ledgerId,
      runningBalance,
    };
    
    const result = await db.insert(expenseLedger).values(ledgerData).returning();
    return result[0];
  }

  async updateExpenseLedger(id: string, ledger: UpdateExpenseLedger): Promise<ExpenseLedger> {
    // Get existing record for recalculation
    const existing = await this.getExpenseLedger(id);
    if (!existing) throw new Error('Expense ledger not found');
    
    // Recalculate running balance if amount changed
    let runningBalance = existing.runningBalance;
    if (ledger.amount !== undefined) {
      const amount = Number(ledger.amount);
      runningBalance = amount.toString(); // Simplified
    }
    
    const result = await db.update(expenseLedger)
      .set({ ...ledger, runningBalance, updatedAt: new Date() })
      .where(eq(expenseLedger.id, id))
      .returning();
    return result[0];
  }

  async deleteExpenseLedger(id: string): Promise<boolean> {
    const result = await db.delete(expenseLedger).where(eq(expenseLedger.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateExpenseLedgerId(financialYear: string): Promise<string> {
    const ledgers = await db.select().from(expenseLedger).where(eq(expenseLedger.financialYear, financialYear));
    const nextNumber = String((ledgers || []).length + 1).padStart(4, '0');
    return `EXP-${nextNumber}`;
  }

  // Ledger Module operations - Bank Deposit Ledger
  async getBankDepositLedgers(financialYear: string, searchTerm?: string): Promise<BankDepositLedger[]> {
    let query = db.select().from(bankDepositLedger).where(eq(bankDepositLedger.financialYear, financialYear));
    
    if (searchTerm) {
      query = db.select().from(bankDepositLedger).where(
        and(
          eq(bankDepositLedger.financialYear, financialYear),
          or(
            ilike(bankDepositLedger.bankName, `%${searchTerm}%`),
            ilike(bankDepositLedger.ledgerId, `%${searchTerm}%`),
            ilike(bankDepositLedger.description, `%${searchTerm}%`)
          )
        )
      );
    }
    
    return await query.orderBy(bankDepositLedger.date);
  }

  async getBankDepositLedger(id: string): Promise<BankDepositLedger | undefined> {
    const result = await db.select().from(bankDepositLedger).where(eq(bankDepositLedger.id, id));
    return result[0];
  }

  async createBankDepositLedger(ledger: InsertBankDepositLedger): Promise<BankDepositLedger> {
    const ledgerId = await this.generateBankDepositLedgerId(ledger.financialYear);
    
    // Calculate running balance (simplified for now)
    const depositAmount = Number(ledger.depositAmount || 0);
    const runningBalance = depositAmount.toString();
    
    const ledgerData = {
      ...ledger,
      ledgerId,
      runningBalance,
    };
    
    const result = await db.insert(bankDepositLedger).values(ledgerData).returning();
    return result[0];
  }

  async updateBankDepositLedger(id: string, ledger: UpdateBankDepositLedger): Promise<BankDepositLedger> {
    // Get existing record for recalculation
    const existing = await this.getBankDepositLedger(id);
    if (!existing) throw new Error('Bank deposit ledger not found');
    
    // Recalculate running balance if deposit amount changed
    let runningBalance = existing.runningBalance;
    if (ledger.depositAmount !== undefined) {
      const depositAmount = Number(ledger.depositAmount);
      runningBalance = depositAmount.toString();
    }
    
    const result = await db.update(bankDepositLedger)
      .set({ ...ledger, runningBalance, updatedAt: new Date() })
      .where(eq(bankDepositLedger.id, id))
      .returning();
    return result[0];
  }

  async deleteBankDepositLedger(id: string): Promise<boolean> {
    const result = await db.delete(bankDepositLedger).where(eq(bankDepositLedger.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateBankDepositLedgerId(financialYear: string): Promise<string> {
    const ledgers = await db.select().from(bankDepositLedger).where(eq(bankDepositLedger.financialYear, financialYear));
    const nextNumber = String((ledgers || []).length + 1).padStart(4, '0');
    return `BDL-${nextNumber}`;
  }

  // Reports Module operations - DatabaseStorage implementations
  async getReport(type: string, financialYear: string, filters?: Record<string, any>): Promise<any[]> {
    try {
      switch (type) {
        case 'lot':
          // Aggregate lot data with quantity and weight totals
          const lots = await db.select().from(lotEntry).where(eq(lotEntry.financialYear, financialYear));
          return lots.map(lot => ({
            lotId: lot.lotId,
            productName: lot.productName,
            farmerName: lot.farmerName,
            date: lot.date,
            totalQuantity: lot.totalQuantity,
            totalWeight: lot.totalWeight,
            // Add filtering logic here
          }));
          
        case 'bill':
          // Aggregate billing data with payment status
          const bills = await db.select().from(customerBilling).where(eq(customerBilling.financialYear, financialYear));
          return bills.map(bill => ({
            billNo: bill.billNo,
            customerName: bill.customerName,
            date: bill.date,
            totalAmount: bill.totalAmount,
            status: 'active', // Calculate paid/unpaid status
          }));
          
        case 'invoice':
          // Aggregate farmer invoice data
          const invoices = await db.select().from(farmerInvoice).where(eq(farmerInvoice.financialYear, financialYear));
          return invoices.map(invoice => ({
            invoiceNo: invoice.invoiceNo,
            farmerName: invoice.farmerName,
            date: invoice.date,
            netPayable: invoice.netPayable,
          }));
          
        case 'income':
          // Aggregate income data from income ledger
          const incomeData = await db.select().from(incomeLedger).where(eq(incomeLedger.financialYear, financialYear));
          return incomeData.map(income => ({
            date: income.date,
            name: income.customerName,
            amount: income.amount,
            paymentMode: income.paymentMode,
          }));
          
        case 'expense':
          // Aggregate expense data from expense ledger
          const expenseData = await db.select().from(expenseLedger).where(eq(expenseLedger.financialYear, financialYear));
          return expenseData.map(expense => ({
            date: expense.date,
            name: expense.customerName,
            amount: expense.amount,
            paymentMode: expense.paymentMode,
          }));
          
        case 'paid-unpaid':
          // Aggregate khata ledger balances
          const khataData = await db.select().from(khataLedger).where(eq(khataLedger.financialYear, financialYear));
          return khataData.map(khata => ({
            name: khata.customerName,
            payable: khata.totalBalance,
            paid: khata.paymentReceived,
            unpaid: parseFloat(khata.totalBalance) - parseFloat(khata.paymentReceived),
            type: 'customer', // Derive from customer type
          }));
          
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      return [];
    }
  }

  async createReportSnapshot(snapshot: InsertReportSnapshot): Promise<ReportSnapshot> {
    const [result] = await db.insert(reportSnapshots).values(snapshot).returning();
    return result;
  }

  async getReportSnapshots(type?: string, financialYear?: string): Promise<ReportSnapshot[]> {
    let query = db.select().from(reportSnapshots);
    
    if (type && financialYear) {
      query = query.where(and(eq(reportSnapshots.type, type), eq(reportSnapshots.financialYear, financialYear)));
    } else if (type) {
      query = query.where(eq(reportSnapshots.type, type));
    } else if (financialYear) {
      query = query.where(eq(reportSnapshots.financialYear, financialYear));
    }
    
    return await query;
  }

  async deleteReportSnapshot(id: string): Promise<boolean> {
    const result = await db.delete(reportSnapshots).where(eq(reportSnapshots.id, id));
    return result.rowCount > 0;
  }

  async getReportConfigs(type?: string, financialYear?: string): Promise<ReportConfig[]> {
    let query = db.select().from(reportConfigs);
    
    if (type && financialYear) {
      query = query.where(and(eq(reportConfigs.type, type), eq(reportConfigs.financialYear, financialYear)));
    } else if (type) {
      query = query.where(eq(reportConfigs.type, type));
    } else if (financialYear) {
      query = query.where(eq(reportConfigs.financialYear, financialYear));
    }
    
    return await query;
  }

  async getReportConfig(id: string): Promise<ReportConfig | undefined> {
    const [result] = await db.select().from(reportConfigs).where(eq(reportConfigs.id, id));
    return result;
  }

  async createReportConfig(config: InsertReportConfig): Promise<ReportConfig> {
    const [result] = await db.insert(reportConfigs).values(config).returning();
    return result;
  }

  async updateReportConfig(id: string, config: UpdateReportConfig): Promise<ReportConfig> {
    const [result] = await db.update(reportConfigs)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(reportConfigs.id, id))
      .returning();
    
    if (!result) throw new Error("Report config not found");
    return result;
  }

  async deleteReportConfig(id: string): Promise<boolean> {
    const result = await db.delete(reportConfigs).where(eq(reportConfigs.id, id));
    return result.rowCount > 0;
  }

  // Settings Module Operations - DatabaseStorage (Real implementations)
  
  // Company Profile operations
  async getCompanyProfiles(financialYear: string): Promise<CompanyProfile[]> {
    return await db.select().from(companyProfile)
      .where(eq(companyProfile.financialYear, financialYear));
  }

  async getCompanyProfile(id: string): Promise<CompanyProfile | undefined> {
    const [result] = await db.select().from(companyProfile)
      .where(eq(companyProfile.id, id));
    return result;
  }

  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const [result] = await db.insert(companyProfile).values(profile).returning();
    return result;
  }

  async updateCompanyProfile(id: string, profile: UpdateCompanyProfile): Promise<CompanyProfile> {
    const [result] = await db.update(companyProfile)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(companyProfile.id, id))
      .returning();
    
    if (!result) throw new Error("Company profile not found");
    return result;
  }

  async deleteCompanyProfile(id: string): Promise<boolean> {
    const result = await db.delete(companyProfile).where(eq(companyProfile.id, id));
    return result.rowCount > 0;
  }

  // Default Expenses operations
  async getDefaultExpenses(financialYear: string, searchTerm?: string): Promise<DefaultExpenses[]> {
    let query = db.select().from(defaultExpenses)
      .where(eq(defaultExpenses.financialYear, financialYear));
    
    if (searchTerm) {
      query = query.where(and(
        eq(defaultExpenses.financialYear, financialYear),
        or(
          ilike(defaultExpenses.expenseName, `%${searchTerm}%`),
          ilike(defaultExpenses.type, `%${searchTerm}%`)
        )
      ));
    }
    
    return await query;
  }

  async getDefaultExpense(id: string): Promise<DefaultExpenses | undefined> {
    const [result] = await db.select().from(defaultExpenses)
      .where(eq(defaultExpenses.id, id));
    return result;
  }

  async createDefaultExpense(expense: InsertDefaultExpenses): Promise<DefaultExpenses> {
    const [result] = await db.insert(defaultExpenses).values(expense).returning();
    return result;
  }

  async updateDefaultExpense(id: string, expense: UpdateDefaultExpenses): Promise<DefaultExpenses> {
    const [result] = await db.update(defaultExpenses)
      .set({ ...expense, updatedAt: new Date() })
      .where(eq(defaultExpenses.id, id))
      .returning();
    
    if (!result) throw new Error("Default expense not found");
    return result;
  }

  async deleteDefaultExpense(id: string): Promise<boolean> {
    const result = await db.delete(defaultExpenses).where(eq(defaultExpenses.id, id));
    return result.rowCount > 0;
  }

  // Printing Settings operations
  async getPrintingSettings(financialYear: string): Promise<PrintingSettings[]> {
    return await db.select().from(printingSettings)
      .where(eq(printingSettings.financialYear, financialYear));
  }

  async getPrintingSetting(id: string): Promise<PrintingSettings | undefined> {
    const [result] = await db.select().from(printingSettings)
      .where(eq(printingSettings.id, id));
    return result;
  }

  async createPrintingSetting(setting: InsertPrintingSettings): Promise<PrintingSettings> {
    const templateId = await this.generateTemplateId();
    const [result] = await db.insert(printingSettings)
      .values({ ...setting, templateId })
      .returning();
    return result;
  }

  async updatePrintingSetting(id: string, setting: UpdatePrintingSettings): Promise<PrintingSettings> {
    const [result] = await db.update(printingSettings)
      .set({ ...setting, updatedAt: new Date() })
      .where(eq(printingSettings.id, id))
      .returning();
    
    if (!result) throw new Error("Printing setting not found");
    return result;
  }

  async deletePrintingSetting(id: string): Promise<boolean> {
    const result = await db.delete(printingSettings).where(eq(printingSettings.id, id));
    return result.rowCount > 0;
  }

  async generateTemplateId(): Promise<string> {
    const existing = await db.select().from(printingSettings);
    const count = existing.length + 1;
    return `TPL-${count.toString().padStart(4, '0')}`;
  }

  // Module Settings operations
  async getModuleSettings(financialYear: string): Promise<ModuleSettings[]> {
    return await db.select().from(moduleSettings)
      .where(eq(moduleSettings.financialYear, financialYear));
  }

  async getModuleSetting(id: string): Promise<ModuleSettings | undefined> {
    const [result] = await db.select().from(moduleSettings)
      .where(eq(moduleSettings.id, id));
    return result;
  }

  async createModuleSetting(setting: InsertModuleSettings): Promise<ModuleSettings> {
    const [result] = await db.insert(moduleSettings).values(setting).returning();
    return result;
  }

  async updateModuleSetting(id: string, setting: UpdateModuleSettings): Promise<ModuleSettings> {
    const [result] = await db.update(moduleSettings)
      .set({ ...setting, updatedAt: new Date() })
      .where(eq(moduleSettings.id, id))
      .returning();
    
    if (!result) throw new Error("Module setting not found");
    return result;
  }

  async deleteModuleSetting(id: string): Promise<boolean> {
    const result = await db.delete(moduleSettings).where(eq(moduleSettings.id, id));
    return result.rowCount > 0;
  }

  // WhatsApp Messages operations
  async getWhatsappMessages(financialYear: string, searchTerm?: string): Promise<WhatsappMessages[]> {
    let query = db.select().from(whatsappMessages)
      .where(eq(whatsappMessages.financialYear, financialYear));

    if (searchTerm) {
      query = query.where(
        or(
          ilike(whatsappMessages.recipient, `%${searchTerm}%`),
          ilike(whatsappMessages.messageText, `%${searchTerm}%`),
          ilike(whatsappMessages.type, `%${searchTerm}%`)
        )
      );
    }

    return await query.orderBy(whatsappMessages.createdAt);
  }

  async getWhatsappMessage(id: string): Promise<WhatsappMessages | undefined> {
    const [result] = await db.select().from(whatsappMessages)
      .where(eq(whatsappMessages.id, id));
    return result;
  }

  async createWhatsappMessage(message: InsertWhatsappMessages): Promise<WhatsappMessages> {
    const messageId = await this.generateWhatsappMessageId();
    const [result] = await db.insert(whatsappMessages)
      .values({ ...message, messageId })
      .returning();
    return result;
  }

  async updateWhatsappMessage(id: string, message: UpdateWhatsappMessages): Promise<WhatsappMessages> {
    const [result] = await db.update(whatsappMessages)
      .set({ ...message, updatedAt: new Date() })
      .where(eq(whatsappMessages.id, id))
      .returning();
    
    if (!result) throw new Error("WhatsApp message not found");
    return result;
  }

  async deleteWhatsappMessage(id: string): Promise<boolean> {
    const result = await db.delete(whatsappMessages).where(eq(whatsappMessages.id, id));
    return result.rowCount > 0;
  }

  async generateWhatsappMessageId(): Promise<string> {
    const existing = await db.select().from(whatsappMessages);
    const count = existing.length + 1;
    return `MSG-${count.toString().padStart(3, '0')}`;
  }

  // WhatsApp Templates operations
  async getWhatsappTemplates(financialYear: string, searchTerm?: string): Promise<WhatsappTemplates[]> {
    let query = db.select().from(whatsappTemplates)
      .where(eq(whatsappTemplates.financialYear, financialYear));

    if (searchTerm) {
      query = query.where(
        or(
          ilike(whatsappTemplates.templateName, `%${searchTerm}%`),
          ilike(whatsappTemplates.templateText, `%${searchTerm}%`),
          ilike(whatsappTemplates.type, `%${searchTerm}%`)
        )
      );
    }

    return await query.orderBy(whatsappTemplates.createdAt);
  }

  async getWhatsappTemplate(id: string): Promise<WhatsappTemplates | undefined> {
    const [result] = await db.select().from(whatsappTemplates)
      .where(eq(whatsappTemplates.id, id));
    return result;
  }

  async createWhatsappTemplate(template: InsertWhatsappTemplates): Promise<WhatsappTemplates> {
    const templateId = await this.generateWhatsappTemplateId();
    const [result] = await db.insert(whatsappTemplates)
      .values({ ...template, templateId })
      .returning();
    return result;
  }

  async updateWhatsappTemplate(id: string, template: UpdateWhatsappTemplates): Promise<WhatsappTemplates> {
    const [result] = await db.update(whatsappTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(whatsappTemplates.id, id))
      .returning();
    
    if (!result) throw new Error("WhatsApp template not found");
    return result;
  }

  async deleteWhatsappTemplate(id: string): Promise<boolean> {
    const result = await db.delete(whatsappTemplates).where(eq(whatsappTemplates.id, id));
    return result.rowCount > 0;
  }

  async generateWhatsappTemplateId(): Promise<string> {
    const existing = await db.select().from(whatsappTemplates);
    const count = existing.length + 1;
    return `WTPL-${count.toString().padStart(3, '0')}`;
  }

  // WhatsApp Settings operations
  async getWhatsappSettings(financialYear: string): Promise<WhatsappSettings[]> {
    const settings = await db.select().from(whatsappSettings)
      .where(eq(whatsappSettings.financialYear, financialYear))
      .orderBy(whatsappSettings.createdAt);
    
    // Remove sensitive fields from response
    return settings.map(setting => ({
      ...setting,
      apiKey: "••••••",
      apiSecret: setting.apiSecret ? "••••••" : null
    }));
  }

  async getWhatsappSetting(id: string): Promise<WhatsappSettings | undefined> {
    const [result] = await db.select().from(whatsappSettings)
      .where(eq(whatsappSettings.id, id));
    
    if (!result) return undefined;
    
    // Remove sensitive fields from response
    return {
      ...result,
      apiKey: "••••••",
      apiSecret: result.apiSecret ? "••••••" : null
    };
  }

  async createWhatsappSetting(setting: InsertWhatsappSettings): Promise<WhatsappSettings> {
    const settingId = await this.generateWhatsappSettingId();
    const [result] = await db.insert(whatsappSettings)
      .values({ ...setting, settingId })
      .returning();
    return result;
  }

  async updateWhatsappSetting(id: string, setting: UpdateWhatsappSettings): Promise<WhatsappSettings> {
    const [result] = await db.update(whatsappSettings)
      .set({ ...setting, updatedAt: new Date() })
      .where(eq(whatsappSettings.id, id))
      .returning();
    
    if (!result) throw new Error("WhatsApp setting not found");
    return result;
  }

  async deleteWhatsappSetting(id: string): Promise<boolean> {
    const result = await db.delete(whatsappSettings).where(eq(whatsappSettings.id, id));
    return result.rowCount > 0;
  }

  async generateWhatsappSettingId(): Promise<string> {
    const existing = await db.select().from(whatsappSettings);
    const count = existing.length + 1;
    return `WSET-${count.toString().padStart(3, '0')}`;
  }

  // Rate Calculation operations
  async getAverageRate(productId: string, quality: string, financialYear: string, days?: number): Promise<{ avgRate: number | null; count: number; qtySum: number }> {
    try {
      let query = db.select().from(salesTransactions)
        .where(and(
          eq(salesTransactions.productId, productId),
          eq(salesTransactions.quality, quality),
          eq(salesTransactions.financialYear, financialYear)
        ));

      // Add date filter if days specified
      if (days) {
        const dateFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        query = query.where(and(
          eq(salesTransactions.productId, productId),
          eq(salesTransactions.quality, quality),
          eq(salesTransactions.financialYear, financialYear),
          // Note: We'll need to add SQL comparison here
        ));
      }

      const transactions = await query;

      if (transactions.length === 0) {
        return { avgRate: null, count: 0, qtySum: 0 };
      }

      const totalWeightedRate = transactions.reduce((sum, transaction) => 
        sum + (Number(transaction.unitRate) * Number(transaction.quantity)), 0
      );
      const totalQuantity = transactions.reduce((sum, transaction) => 
        sum + Number(transaction.quantity), 0
      );

      const avgRate = totalQuantity > 0 ? totalWeightedRate / totalQuantity : null;

      return {
        avgRate: avgRate ? Math.round(avgRate * 100) / 100 : null, // Round to 2 decimal places
        count: transactions.length,
        qtySum: totalQuantity
      };
    } catch (error) {
      console.error('Error getting average rate:', error);
      return { avgRate: null, count: 0, qtySum: 0 };
    }
  }

  async createSalesTransaction(transaction: InsertSalesTransactions): Promise<SalesTransactions> {
    const [result] = await db.insert(salesTransactions)
      .values(transaction)
      .returning();
    return result;
  }

  // Accounting Integration operations
  async getAccountingIntegrations(financialYear: string): Promise<AccountingIntegrations[]> {
    return await db.select()
      .from(accountingIntegrations)
      .where(eq(accountingIntegrations.financialYear, financialYear));
  }

  async getAccountingIntegration(id: string): Promise<AccountingIntegrations | undefined> {
    const [result] = await db.select()
      .from(accountingIntegrations)
      .where(eq(accountingIntegrations.id, id));
    return result;
  }

  async createAccountingIntegration(integration: InsertAccountingIntegrations): Promise<AccountingIntegrations> {
    const [result] = await db.insert(accountingIntegrations)
      .values(integration)
      .returning();
    return result;
  }

  async updateAccountingIntegration(id: string, integration: UpdateAccountingIntegrations): Promise<AccountingIntegrations | undefined> {
    const [result] = await db.update(accountingIntegrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(eq(accountingIntegrations.id, id))
      .returning();
    return result;
  }

  async deleteAccountingIntegration(id: string): Promise<boolean> {
    const result = await db.delete(accountingIntegrations)
      .where(eq(accountingIntegrations.id, id));
    return result.rowCount > 0;
  }

  // Accounting Sync operations
  async syncAccountingData(integrationId: string, syncType: string, entityIds?: string[]): Promise<any> {
    // This is a placeholder for actual sync logic
    // In a real implementation, this would connect to external accounting software APIs
    return {
      status: 'success',
      message: `Sync ${syncType} initiated for integration ${integrationId}`,
      entityIds: entityIds || [],
      timestamp: new Date().toISOString()
    };
  }

  async getAccountingSyncStatus(integrationId: string): Promise<any> {
    const integration = await this.getAccountingIntegration(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }
    
    return {
      integrationId,
      platform: integration.platform,
      syncStatus: integration.syncStatus,
      lastSyncAt: integration.lastSyncAt,
      syncError: integration.syncError
    };
  }

  // Accounting Sync Logs operations
  async getAccountingSyncLogs(integrationId: string, financialYear: string, limit: number): Promise<AccountingSyncLogs[]> {
    return await db.select()
      .from(accountingSyncLogs)
      .where(and(
        eq(accountingSyncLogs.integrationId, integrationId),
        eq(accountingSyncLogs.financialYear, financialYear)
      ))
      .limit(limit);
  }

  async createAccountingSyncLog(log: InsertAccountingSyncLogs): Promise<AccountingSyncLogs> {
    const [result] = await db.insert(accountingSyncLogs)
      .values(log)
      .returning();
    return result;
  }

  // Accounting Mappings operations
  async getAccountingMappings(integrationId: string, entityType?: string, financialYear?: string): Promise<AccountingMappings[]> {
    let query = db.select()
      .from(accountingMappings)
      .where(eq(accountingMappings.integrationId, integrationId));

    if (entityType) {
      query = query.where(and(
        eq(accountingMappings.integrationId, integrationId),
        eq(accountingMappings.entityType, entityType)
      ));
    }

    if (financialYear) {
      query = query.where(and(
        eq(accountingMappings.integrationId, integrationId),
        eq(accountingMappings.financialYear, financialYear)
      ));
    }

    return await query;
  }

  async createAccountingMapping(mapping: InsertAccountingMappings): Promise<AccountingMappings> {
    const [result] = await db.insert(accountingMappings)
      .values(mapping)
      .returning();
    return result;
  }

  async deleteAccountingMapping(id: string): Promise<boolean> {
    const result = await db.delete(accountingMappings)
      .where(eq(accountingMappings.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
