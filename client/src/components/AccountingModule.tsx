import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Calendar, Receipt, DollarSign, FileText, TrendingUp, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import RojmelForm from "@/components/RojmelForm";
import type { Rojmel, IncomeExpenseReceipt, BankDepositReceipt, BalanceSheet } from "@shared/schema";

interface AccountingModuleProps {
  currentFY: string;
  onFYChange: (fy: string) => void;
}

export default function AccountingModule({ currentFY, onFYChange }: AccountingModuleProps) {
  const [activeTab, setActiveTab] = useState("rojmel");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRojmelForm, setShowRojmelForm] = useState(false);
  const [editingRojmel, setEditingRojmel] = useState<Rojmel | null>(null);
  const { toast } = useToast();

  // Keyboard shortcuts for Accounting Module
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            if (activeTab === 'rojmel') {
              setEditingRojmel(null);
              setShowRojmelForm(true);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Rojmel Query
  const { 
    data: rojmels = [], 
    isLoading: rojmelLoading 
  } = useQuery<Rojmel[]>({
    queryKey: ["/api/accounting/rojmels", currentFY, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ fy: currentFY });
      if (searchTerm) params.append('search', searchTerm);
      const response = await fetch(`/api/accounting/rojmels?${params}`);
      return response.json();
    },
    enabled: activeTab === "rojmel"
  });

  // Income/Expense Receipt Query
  const { 
    data: incomeExpenseReceipts = [], 
    isLoading: incomeExpenseReceiptsLoading 
  } = useQuery<IncomeExpenseReceipt[]>({
    queryKey: ["/api/accounting/income-expense-receipts", currentFY, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ fy: currentFY });
      if (searchTerm) params.append('search', searchTerm);
      const response = await fetch(`/api/accounting/income-expense-receipts?${params}`);
      return response.json();
    },
    enabled: activeTab === "income-expense-receipts"
  });

  // Bank Deposit Receipt Query
  const { 
    data: bankDepositReceipts = [], 
    isLoading: bankDepositReceiptsLoading 
  } = useQuery<BankDepositReceipt[]>({
    queryKey: ["/api/accounting/bank-deposit-receipts", currentFY, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ fy: currentFY });
      if (searchTerm) params.append('search', searchTerm);
      const response = await fetch(`/api/accounting/bank-deposit-receipts?${params}`);
      return response.json();
    },
    enabled: activeTab === "bank-deposit-receipts"
  });

  // Balance Sheet Query
  const { 
    data: balanceSheets = [], 
    isLoading: balanceSheetsLoading 
  } = useQuery<BalanceSheet[]>({
    queryKey: ["/api/accounting/balance-sheets", currentFY, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ fy: currentFY });
      if (searchTerm) params.append('search', searchTerm);
      const response = await fetch(`/api/accounting/balance-sheets?${params}`);
      return response.json();
    },
    enabled: activeTab === "balance-sheets"
  });

  // Delete mutations
  const deleteRojmel = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/accounting/rojmels/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/rojmels"] });
      toast({ title: "Success", description: "Rojmel deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete rojmel", variant: "destructive" });
    }
  });

  const deleteIncomeExpenseReceipt = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/accounting/income-expense-receipts/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/income-expense-receipts"] });
      toast({ title: "Success", description: "Income/Expense receipt deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete income/expense receipt", variant: "destructive" });
    }
  });

  const deleteBankDepositReceipt = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/accounting/bank-deposit-receipts/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/bank-deposit-receipts"] });
      toast({ title: "Success", description: "Bank deposit receipt deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete bank deposit receipt", variant: "destructive" });
    }
  });

  const deleteBalanceSheet = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/accounting/balance-sheets/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/balance-sheets"] });
      toast({ title: "Success", description: "Balance sheet deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete balance sheet", variant: "destructive" });
    }
  });

  const formatCurrency = (value: string | null) => {
    if (!value) return "₹0.00";
    return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getReceiptTypeBadge = (type: string | null) => {
    if (!type) return <Badge variant="outline">Unknown</Badge>;
    
    switch (type.toLowerCase()) {
      case 'income':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Income</Badge>;
      case 'expense':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Expense</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getNetValueBadge = (netValue: string | null) => {
    if (!netValue) return <Badge variant="outline">₹0.00</Badge>;
    
    const value = parseFloat(netValue);
    if (value > 0) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">+{formatCurrency(netValue)}</Badge>;
    } else if (value < 0) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">{formatCurrency(netValue)}</Badge>;
    } else {
      return <Badge variant="outline">{formatCurrency(netValue)}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Accounting Module
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage rojmels, receipts, deposits, and balance sheets for FY {currentFY}
              </p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search rojmels, receipts, or transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                  data-testid="input-search"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>FY {currentFY}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="rojmel" className="flex items-center gap-2" data-testid="tab-rojmel">
              <FileText className="w-4 h-4" />
              Rojmel
            </TabsTrigger>
            <TabsTrigger value="income-expense-receipts" className="flex items-center gap-2" data-testid="tab-income-expense-receipts">
              <Receipt className="w-4 h-4" />
              Income/Expense
            </TabsTrigger>
            <TabsTrigger value="bank-deposit-receipts" className="flex items-center gap-2" data-testid="tab-bank-deposit-receipts">
              <CreditCard className="w-4 h-4" />
              Bank Deposits
            </TabsTrigger>
            <TabsTrigger value="balance-sheets" className="flex items-center gap-2" data-testid="tab-balance-sheets">
              <TrendingUp className="w-4 h-4" />
              Balance Sheet
            </TabsTrigger>
          </TabsList>

          {/* Rojmel Tab */}
          <TabsContent value="rojmel">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Rojmel Management
                  </CardTitle>
                  <CardDescription>
                    Track daily income and expense records with auto-calculations
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setEditingRojmel(null);
                    setShowRojmelForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-add-rojmel"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rojmel
                </Button>
              </CardHeader>
              <CardContent>
                {rojmelLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rojmel ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total Income</TableHead>
                          <TableHead>Total Expense</TableHead>
                          <TableHead>Net</TableHead>
                          <TableHead>Records</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rojmels.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              No rojmels found
                            </TableCell>
                          </TableRow>
                        ) : (
                          rojmels.map((rojmel) => (
                            <TableRow key={rojmel.id} data-testid={`row-rojmel-${rojmel.id}`}>
                              <TableCell className="font-medium">{rojmel.rojmelId}</TableCell>
                              <TableCell>{rojmel.rojmelDate ? format(new Date(rojmel.rojmelDate), "MMM dd, yyyy") : "-"}</TableCell>
                              <TableCell>{formatCurrency(rojmel.totalIncome)}</TableCell>
                              <TableCell>{formatCurrency(rojmel.totalExpense)}</TableCell>
                              <TableCell>{getNetValueBadge(rojmel.net)}</TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-600">
                                  {((rojmel.incomeRecords as any[]) || []).length} income, {((rojmel.expenseRecords as any[]) || []).length} expense
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="outline">Active</Badge></TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                      setEditingRojmel(rojmel);
                                      setShowRojmelForm(true);
                                    }}
                                    data-testid={`button-edit-rojmel-${rojmel.id}`}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => deleteRojmel.mutate(rojmel.id)}
                                    disabled={deleteRojmel.isPending}
                                    data-testid={`button-delete-rojmel-${rojmel.id}`}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income/Expense Receipt Tab */}
          <TabsContent value="income-expense-receipts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    Income/Expense Receipt Management
                  </CardTitle>
                  <CardDescription>
                    Manage income and expense receipts with categorization
                  </CardDescription>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-add-income-expense-receipt"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Receipt
                </Button>
              </CardHeader>
              <CardContent>
                {incomeExpenseReceiptsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Receipt No</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incomeExpenseReceipts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No income/expense receipts found
                            </TableCell>
                          </TableRow>
                        ) : (
                          incomeExpenseReceipts.map((receipt) => (
                            <TableRow key={receipt.id} data-testid={`row-income-expense-receipt-${receipt.id}`}>
                              <TableCell className="font-medium">{receipt.receiptNo}</TableCell>
                              <TableCell>{receipt.name}</TableCell>
                              <TableCell>{getReceiptTypeBadge(receipt.type)}</TableCell>
                              <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                              <TableCell>{receipt.receiptDate ? format(new Date(receipt.receiptDate), "MMM dd, yyyy") : "-"}</TableCell>
                              <TableCell className="max-w-xs truncate">{(receipt.customFields as any)?.description || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" data-testid={`button-edit-income-expense-receipt-${receipt.id}`}>
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => deleteIncomeExpenseReceipt.mutate(receipt.id)}
                                    disabled={deleteIncomeExpenseReceipt.isPending}
                                    data-testid={`button-delete-income-expense-receipt-${receipt.id}`}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Deposit Receipt Tab */}
          <TabsContent value="bank-deposit-receipts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Bank Deposit Receipt Management
                  </CardTitle>
                  <CardDescription>
                    Track bank deposits with cash breakdown and auto-totaling
                  </CardDescription>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-add-bank-deposit-receipt"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deposit
                </Button>
              </CardHeader>
              <CardContent>
                {bankDepositReceiptsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Receipt No</TableHead>
                          <TableHead>Bank Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Cash Breakdown</TableHead>
                          <TableHead>Bank Name</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bankDepositReceipts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No bank deposit receipts found
                            </TableCell>
                          </TableRow>
                        ) : (
                          bankDepositReceipts.map((receipt) => (
                            <TableRow key={receipt.id} data-testid={`row-bank-deposit-receipt-${receipt.id}`}>
                              <TableCell className="font-medium">{receipt.receiptNo}</TableCell>
                              <TableCell>{receipt.bankName}</TableCell>
                              <TableCell>{receipt.receiptDate ? format(new Date(receipt.receiptDate), "MMM dd, yyyy") : "-"}</TableCell>
                              <TableCell className="font-semibold">{formatCurrency(receipt.total)}</TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-600">
                                  {((receipt.cashMode as any[]) || []).length} items
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{receipt.bankName}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" data-testid={`button-edit-bank-deposit-receipt-${receipt.id}`}>
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => deleteBankDepositReceipt.mutate(receipt.id)}
                                    disabled={deleteBankDepositReceipt.isPending}
                                    data-testid={`button-delete-bank-deposit-receipt-${receipt.id}`}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance-sheets">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Balance Sheet Management
                  </CardTitle>
                  <CardDescription>
                    Create and manage balance sheets with net worth calculations
                  </CardDescription>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-add-balance-sheet"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Balance Sheet
                </Button>
              </CardHeader>
              <CardContent>
                {balanceSheetsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Balance Sheet ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total Assets</TableHead>
                          <TableHead>Total Liabilities</TableHead>
                          <TableHead>Net Worth</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {balanceSheets.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No balance sheets found
                            </TableCell>
                          </TableRow>
                        ) : (
                          balanceSheets.map((sheet) => (
                            <TableRow key={sheet.id} data-testid={`row-balance-sheet-${sheet.id}`}>
                              <TableCell className="font-medium">{sheet.balanceSheetId}</TableCell>
                              <TableCell>{sheet.fromDate ? format(new Date(sheet.fromDate), "MMM dd, yyyy") : "-"}</TableCell>
                              <TableCell>{formatCurrency(sheet.totalAssets)}</TableCell>
                              <TableCell>{formatCurrency(sheet.totalLiabilities)}</TableCell>
                              <TableCell className="font-semibold">{getNetValueBadge(sheet.netWorth)}</TableCell>
                              <TableCell><Badge variant="outline">Active</Badge></TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" data-testid={`button-edit-balance-sheet-${sheet.id}`}>
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => deleteBalanceSheet.mutate(sheet.id)}
                                    disabled={deleteBalanceSheet.isPending}
                                    data-testid={`button-delete-balance-sheet-${sheet.id}`}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rojmel Form Modal */}
        {showRojmelForm && (
          <div className="fixed inset-0 z-50 bg-background">
            <RojmelForm
              rojmel={editingRojmel}
              currentFY={currentFY}
              onSubmit={() => {
                setShowRojmelForm(false);
                setEditingRojmel(null);
              }}
              onCancel={() => {
                setShowRojmelForm(false);
                setEditingRojmel(null);
              }}
            />
          </div>
        )}
    </div>
  );
}