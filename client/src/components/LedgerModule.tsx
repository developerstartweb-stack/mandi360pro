import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Calendar, Receipt, DollarSign, FileText, TrendingUp, CreditCard, Printer, ArrowUpCircle, Users, Truck, Banknote, ShoppingCart, Building } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UplagLedgerForm from "@/components/UplagLedgerForm";
import KhataLedgerForm from "@/components/KhataLedgerForm";
import FarmerTransportLedgerForm from "@/components/FarmerTransportLedgerForm";
import IncomeLedgerForm from "@/components/IncomeLedgerForm";
import ExpenseLedgerForm from "@/components/ExpenseLedgerForm";
import BankDepositLedgerForm from "@/components/BankDepositLedgerForm";
import type { 
  UplagLedger, 
  KhataLedger, 
  FarmerTransportLedger, 
  IncomeLedger, 
  ExpenseLedger, 
  BankDepositLedger 
} from "@shared/schema";

interface LedgerModuleProps {
  currentFY: string;
  onFYChange: (fy: string) => void;
}

export default function LedgerModule({ currentFY, onFYChange }: LedgerModuleProps) {
  const [activeTab, setActiveTab] = useState("uplag");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  
  // Form visibility states for each ledger type
  const [showUplagForm, setShowUplagForm] = useState(false);
  const [editingUplag, setEditingUplag] = useState<UplagLedger | null>(null);
  const [showKhataForm, setShowKhataForm] = useState(false);
  const [editingKhata, setEditingKhata] = useState<KhataLedger | null>(null);
  const [showFarmerTransportForm, setShowFarmerTransportForm] = useState(false);
  const [editingFarmerTransport, setEditingFarmerTransport] = useState<FarmerTransportLedger | null>(null);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeLedger | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseLedger | null>(null);
  const [showBankDepositForm, setShowBankDepositForm] = useState(false);
  const [editingBankDeposit, setEditingBankDeposit] = useState<BankDepositLedger | null>(null);

  const { toast } = useToast();
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Helper functions - moved here to fix initialization errors
  const getCurrentData = () => {
    switch (activeTab) {
      case 'uplag': return uplagLedgers || [];
      case 'khata': return khataLedgers || [];
      case 'farmer-transport': return farmerTransportLedgers || [];
      case 'income': return incomeLedgers || [];
      case 'expense': return expenseLedgers || [];
      case 'bank-deposit': return bankDepositLedgers || [];
      default: return [];
    }
  };

  const getSelectedRow = () => {
    if (!selectedRowId) return null;
    const currentData = getCurrentData();
    return currentData.find((item: any) => item.id === selectedRowId) || null;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handleNewRecord();
            break;
          case 'e':
            e.preventDefault();
            // Edit selected row
            if (selectedRowId) {
              const selectedRow = getSelectedRow();
              if (selectedRow) {
                switch (activeTab) {
                  case 'uplag':
                    setEditingUplag(selectedRow);
                    setShowUplagForm(true);
                    break;
                  case 'khata':
                    setEditingKhata(selectedRow);
                    setShowKhataForm(true);
                    break;
                  case 'farmer-transport':
                    setEditingFarmerTransport(selectedRow);
                    setShowFarmerTransportForm(true);
                    break;
                  case 'income':
                    setEditingIncome(selectedRow);
                    setShowIncomeForm(true);
                    break;
                  case 'expense':
                    setEditingExpense(selectedRow);
                    setShowExpenseForm(true);
                    break;
                  case 'bank-deposit':
                    setEditingBankDeposit(selectedRow);
                    setShowBankDepositForm(true);
                    break;
                }
              }
            } else {
              toast({ title: "No Selection", description: "Please select a row to edit", variant: "destructive" });
            }
            break;
          case 'd':
            e.preventDefault();
            // Delete selected row
            if (selectedRowId) {
              const selectedRow = getSelectedRow();
              if (selectedRow && confirm(`Are you sure you want to delete this ${activeTab} ledger entry?`)) {
                switch (activeTab) {
                  case 'uplag': deleteUplagMutation.mutate(selectedRowId); break;
                  case 'khata': deleteKhataMutation.mutate(selectedRowId); break;
                  case 'farmer-transport': deleteFarmerTransportMutation.mutate(selectedRowId); break;
                  case 'income': deleteIncomeMutation.mutate(selectedRowId); break;
                  case 'expense': deleteExpenseMutation.mutate(selectedRowId); break;
                  case 'bank-deposit': deleteBankDepositMutation.mutate(selectedRowId); break;
                }
                setSelectedRowId(null);
              }
            } else {
              toast({ title: "No Selection", description: "Please select a row to delete", variant: "destructive" });
            }
            break;
          case 's':
            e.preventDefault();
            // Save functionality is handled in forms
            break;
          case 'p':
            e.preventDefault();
            // Print functionality - trigger react-to-print
            handlePrint();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedRowId, getSelectedRow]);

  // Clear selection when switching tabs
  useEffect(() => {
    setSelectedRowId(null);
  }, [activeTab]);

  const handleNewRecord = () => {
    switch (activeTab) {
      case 'uplag':
        setEditingUplag(null);
        setShowUplagForm(true);
        break;
      case 'khata':
        setEditingKhata(null);
        setShowKhataForm(true);
        break;
      case 'farmer-transport':
        setEditingFarmerTransport(null);
        setShowFarmerTransportForm(true);
        break;
      case 'income':
        setEditingIncome(null);
        setShowIncomeForm(true);
        break;
      case 'expense':
        setEditingExpense(null);
        setShowExpenseForm(true);
        break;
      case 'bank-deposit':
        setEditingBankDeposit(null);
        setShowBankDepositForm(true);
        break;
    }
  };

  // Fetch data for each ledger type with proper query parameters
  const { data: uplagLedgers, isLoading: uplagLoading } = useQuery({
    queryKey: ['/api/ledger/uplag', currentFY, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('fy', currentFY);
      if (searchTerm) params.append('search', searchTerm);
      return fetch(`/api/ledger/uplag?${params.toString()}`).then(res => res.json());
    },
    enabled: activeTab === 'uplag'
  });

  const { data: khataLedgers, isLoading: khataLoading } = useQuery({
    queryKey: ['/api/ledger/khata', currentFY, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('fy', currentFY);
      if (searchTerm) params.append('search', searchTerm);
      return fetch(`/api/ledger/khata?${params.toString()}`).then(res => res.json());
    },
    enabled: activeTab === 'khata'
  });

  const { data: farmerTransportLedgers, isLoading: farmerTransportLoading } = useQuery({
    queryKey: ['/api/ledger/farmer-transport', currentFY, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('fy', currentFY);
      if (searchTerm) params.append('search', searchTerm);
      return fetch(`/api/ledger/farmer-transport?${params.toString()}`).then(res => res.json());
    },
    enabled: activeTab === 'farmer-transport'
  });

  const { data: incomeLedgers, isLoading: incomeLoading } = useQuery({
    queryKey: ['/api/ledger/income', currentFY, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('fy', currentFY);
      if (searchTerm) params.append('search', searchTerm);
      return fetch(`/api/ledger/income?${params.toString()}`).then(res => res.json());
    },
    enabled: activeTab === 'income'
  });

  const { data: expenseLedgers, isLoading: expenseLoading } = useQuery({
    queryKey: ['/api/ledger/expense', currentFY, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('fy', currentFY);
      if (searchTerm) params.append('search', searchTerm);
      return fetch(`/api/ledger/expense?${params.toString()}`).then(res => res.json());
    },
    enabled: activeTab === 'expense'
  });

  const { data: bankDepositLedgers, isLoading: bankDepositLoading } = useQuery({
    queryKey: ['/api/ledger/bank-deposit', currentFY, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('fy', currentFY);
      if (searchTerm) params.append('search', searchTerm);
      return fetch(`/api/ledger/bank-deposit?${params.toString()}`).then(res => res.json());
    },
    enabled: activeTab === 'bank-deposit'
  });

  // Helper functions - moved to top of component to fix initialization errors

  // Delete mutations
  const deleteUplagMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/ledger/uplag/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/uplag'] });
      toast({ title: "Success", description: "Uplag ledger deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete uplag ledger", variant: "destructive" });
    }
  });

  const deleteKhataMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/ledger/khata/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/khata'] });
      toast({ title: "Success", description: "Khata ledger deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete khata ledger", variant: "destructive" });
    }
  });

  const deleteFarmerTransportMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/ledger/farmer-transport/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/farmer-transport'] });
      toast({ title: "Success", description: "Farmer/Transport ledger deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete farmer/transport ledger", variant: "destructive" });
    }
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/ledger/income/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/income'] });
      toast({ title: "Success", description: "Income ledger deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete income ledger", variant: "destructive" });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/ledger/expense/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/expense'] });
      toast({ title: "Success", description: "Expense ledger deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete expense ledger", variant: "destructive" });
    }
  });

  const deleteBankDepositMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/ledger/bank-deposit/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/bank-deposit'] });
      toast({ title: "Success", description: "Bank deposit ledger deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete bank deposit ledger", variant: "destructive" });
    }
  });

  const handleEdit = (ledger: any) => {
    switch (activeTab) {
      case 'uplag':
        setEditingUplag(ledger);
        setShowUplagForm(true);
        break;
      case 'khata':
        setEditingKhata(ledger);
        setShowKhataForm(true);
        break;
      case 'farmer-transport':
        setEditingFarmerTransport(ledger);
        setShowFarmerTransportForm(true);
        break;
      case 'income':
        setEditingIncome(ledger);
        setShowIncomeForm(true);
        break;
      case 'expense':
        setEditingExpense(ledger);
        setShowExpenseForm(true);
        break;
      case 'bank-deposit':
        setEditingBankDeposit(ledger);
        setShowBankDepositForm(true);
        break;
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this ledger entry?')) return;
    
    switch (activeTab) {
      case 'uplag':
        deleteUplagMutation.mutate(id);
        break;
      case 'khata':
        deleteKhataMutation.mutate(id);
        break;
      case 'farmer-transport':
        deleteFarmerTransportMutation.mutate(id);
        break;
      case 'income':
        deleteIncomeMutation.mutate(id);
        break;
      case 'expense':
        deleteExpenseMutation.mutate(id);
        break;
      case 'bank-deposit':
        deleteBankDepositMutation.mutate(id);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-brown">Ledger Module</h1>
          <p className="text-muted-foreground">
            Manage all financial ledgers with running balance calculations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search ledgers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-80"
            />
          </div>
          <Button onClick={handleNewRecord} data-testid="button-new-ledger">
            <Plus className="mr-2 h-4 w-4" />
            New Entry (Ctrl+N)
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" ref={componentRef}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="uplag" data-testid="tab-uplag" className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Uplag (Balance)
          </TabsTrigger>
          <TabsTrigger value="khata" data-testid="tab-khata" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Khata
          </TabsTrigger>
          <TabsTrigger value="farmer-transport" data-testid="tab-farmer-transport" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Farmer/Transport
          </TabsTrigger>
          <TabsTrigger value="income" data-testid="tab-income" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Income
          </TabsTrigger>
          <TabsTrigger value="expense" data-testid="tab-expense" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Expense
          </TabsTrigger>
          <TabsTrigger value="bank-deposit" data-testid="tab-bank-deposit" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Bank Deposit
          </TabsTrigger>
        </TabsList>

        {/* Uplag Ledger Tab */}
        <TabsContent value="uplag" className="space-y-4">
          <UplagLedgerTable
            ledgers={uplagLedgers || []}
            isLoading={uplagLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
          />
        </TabsContent>

        {/* Khata Ledger Tab */}
        <TabsContent value="khata" className="space-y-4">
          <KhataLedgerTable
            ledgers={khataLedgers || []}
            isLoading={khataLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
          />
        </TabsContent>

        {/* Farmer/Transport Ledger Tab */}
        <TabsContent value="farmer-transport" className="space-y-4">
          <FarmerTransportLedgerTable
            ledgers={farmerTransportLedgers || []}
            isLoading={farmerTransportLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
          />
        </TabsContent>

        {/* Income Ledger Tab */}
        <TabsContent value="income" className="space-y-4">
          <IncomeLedgerTable
            ledgers={incomeLedgers || []}
            isLoading={incomeLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
          />
        </TabsContent>

        {/* Expense Ledger Tab */}
        <TabsContent value="expense" className="space-y-4">
          <ExpenseLedgerTable
            ledgers={expenseLedgers || []}
            isLoading={expenseLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
          />
        </TabsContent>

        {/* Bank Deposit Ledger Tab */}
        <TabsContent value="bank-deposit" className="space-y-4">
          <BankDepositLedgerTable
            ledgers={bankDepositLedgers || []}
            isLoading={bankDepositLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
          />
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showUplagForm && (
        <UplagLedgerForm
          uplag={editingUplag}
          isOpen={showUplagForm}
          onClose={() => {
            setShowUplagForm(false);
            setEditingUplag(null);
          }}
          currentFY={currentFY}
        />
      )}

      {showKhataForm && (
        <KhataLedgerForm
          khata={editingKhata}
          isOpen={showKhataForm}
          onClose={() => {
            setShowKhataForm(false);
            setEditingKhata(null);
          }}
          currentFY={currentFY}
        />
      )}

      {showFarmerTransportForm && (
        <FarmerTransportLedgerForm
          farmerTransport={editingFarmerTransport}
          isOpen={showFarmerTransportForm}
          onClose={() => {
            setShowFarmerTransportForm(false);
            setEditingFarmerTransport(null);
          }}
          currentFY={currentFY}
        />
      )}

      {showIncomeForm && (
        <IncomeLedgerForm
          income={editingIncome}
          isOpen={showIncomeForm}
          onClose={() => {
            setShowIncomeForm(false);
            setEditingIncome(null);
          }}
          currentFY={currentFY}
        />
      )}

      {showExpenseForm && (
        <ExpenseLedgerForm
          expense={editingExpense}
          isOpen={showExpenseForm}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          currentFY={currentFY}
        />
      )}

      {showBankDepositForm && (
        <BankDepositLedgerForm
          bankDeposit={editingBankDeposit}
          isOpen={showBankDepositForm}
          onClose={() => {
            setShowBankDepositForm(false);
            setEditingBankDeposit(null);
          }}
          currentFY={currentFY}
        />
      )}
    </div>
  );
}

// Table Components
interface TableProps {
  ledgers: any[];
  isLoading: boolean;
  onEdit: (ledger: any) => void;
  onDelete: (id: string) => void;
  selectedRowId?: string | null;
  onRowSelect?: (id: string) => void;
}

function UplagLedgerTable({ ledgers, isLoading, onEdit, onDelete, selectedRowId, onRowSelect }: TableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uplag (Balance) Ledger</CardTitle>
          <CardDescription>Customer balance and payment tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uplag (Balance) Ledger</CardTitle>
        <CardDescription>Customer balance and payment tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ledger ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Opening Balance</TableHead>
              <TableHead>Payment Received</TableHead>
              <TableHead>Total Balance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgers.map((ledger) => (
              <TableRow 
                key={ledger.id} 
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedRowId === ledger.id ? 'bg-muted ring-2 ring-brand' : ''
                }`}
                onClick={() => onRowSelect?.(ledger.id)}
                data-testid={`row-uplag-${ledger.id}`}
              >
                <TableCell>
                  <Badge variant="outline" data-testid={`text-ledger-id-${ledger.id}`}>
                    {ledger.uplagLedgerId}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-date-${ledger.id}`}>
                  {format(new Date(ledger.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell data-testid={`text-customer-${ledger.id}`}>
                  {ledger.customerName}
                </TableCell>
                <TableCell data-testid={`text-opening-balance-${ledger.id}`}>
                  ₹{ledger.openingBalance?.toLocaleString() || '0'}
                </TableCell>
                <TableCell data-testid={`text-payment-received-${ledger.id}`}>
                  ₹{ledger.paymentReceived?.toLocaleString() || '0'}
                </TableCell>
                <TableCell data-testid={`text-total-balance-${ledger.id}`}>
                  <Badge variant="secondary">
                    ₹{ledger.totalBalance?.toLocaleString() || '0'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(ledger)}
                      data-testid={`button-edit-${ledger.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(ledger.id)}
                      data-testid={`button-delete-${ledger.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {ledgers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No uplag ledger entries found. Create your first entry to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KhataLedgerTable({ ledgers, isLoading, onEdit, onDelete, selectedRowId, onRowSelect }: TableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Khata Ledger</CardTitle>
          <CardDescription>Customer account and transaction tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Khata Ledger</CardTitle>
        <CardDescription>Customer account and transaction tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ledger ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Opening Balance</TableHead>
              <TableHead>Payment Received</TableHead>
              <TableHead>Total Balance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgers.map((ledger) => (
              <TableRow 
                key={ledger.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedRowId === ledger.id ? 'bg-muted ring-2 ring-brand' : ''
                }`}
                onClick={() => onRowSelect?.(ledger.id)}
                data-testid={`row-khata-${ledger.id}`}
              >
                <TableCell>
                  <Badge variant="outline" data-testid={`text-ledger-id-${ledger.id}`}>
                    {ledger.khataLedgerId}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-date-${ledger.id}`}>
                  {format(new Date(ledger.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell data-testid={`text-customer-${ledger.id}`}>
                  {ledger.customerName}
                </TableCell>
                <TableCell data-testid={`text-opening-balance-${ledger.id}`}>
                  ₹{ledger.openingBalance?.toLocaleString() || '0'}
                </TableCell>
                <TableCell data-testid={`text-payment-received-${ledger.id}`}>
                  ₹{ledger.paymentReceived?.toLocaleString() || '0'}
                </TableCell>
                <TableCell data-testid={`text-total-balance-${ledger.id}`}>
                  <Badge variant="secondary">
                    ₹{ledger.totalBalance?.toLocaleString() || '0'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(ledger)}
                      data-testid={`button-edit-${ledger.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(ledger.id)}
                      data-testid={`button-delete-${ledger.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {ledgers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No khata ledger entries found. Create your first entry to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FarmerTransportLedgerTable({ ledgers, isLoading, onEdit, onDelete, selectedRowId, onRowSelect }: TableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Farmer/Transport Ledger</CardTitle>
          <CardDescription>Farmer payment and transport expense tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Farmer/Transport Ledger</CardTitle>
        <CardDescription>Farmer payment and transport expense tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ledger ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Farmer/Transporter</TableHead>
              <TableHead>Gross Amount</TableHead>
              <TableHead>Expenses</TableHead>
              <TableHead>Net Amount</TableHead>
              <TableHead>Advance</TableHead>
              <TableHead>Amount Payable</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgers.map((ledger) => (
              <TableRow 
                key={ledger.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedRowId === ledger.id ? 'bg-muted ring-2 ring-brand' : ''
                }`}
                onClick={() => onRowSelect?.(ledger.id)}
                data-testid={`row-farmer-transport-${ledger.id}`}
              >
                <TableCell>
                  <Badge variant="outline" data-testid={`text-ledger-id-${ledger.id}`}>
                    {ledger.farmerTransportLedgerId}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-date-${ledger.id}`}>
                  {format(new Date(ledger.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell data-testid={`text-farmer-${ledger.id}`}>
                  {ledger.farmerTransporterName}
                </TableCell>
                <TableCell data-testid={`text-gross-amount-${ledger.id}`}>
                  ₹{ledger.grossAmount?.toLocaleString() || '0'}
                </TableCell>
                <TableCell data-testid={`text-expenses-${ledger.id}`}>
                  ₹{ledger.expenses?.toLocaleString() || '0'}
                </TableCell>
                <TableCell data-testid={`text-net-amount-${ledger.id}`}>
                  ₹{ledger.netAmount?.toLocaleString() || '0'}
                </TableCell>
                <TableCell data-testid={`text-advance-${ledger.id}`}>
                  ₹{ledger.advance?.toLocaleString() || '0'}
                </TableCell>
                <TableCell data-testid={`text-amount-payable-${ledger.id}`}>
                  <Badge variant="secondary">
                    ₹{ledger.amountPayable?.toLocaleString() || '0'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(ledger)}
                      data-testid={`button-edit-${ledger.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(ledger.id)}
                      data-testid={`button-delete-${ledger.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {ledgers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No farmer/transport ledger entries found. Create your first entry to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IncomeLedgerTable({ ledgers, isLoading, onEdit, onDelete, selectedRowId, onRowSelect }: TableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Ledger</CardTitle>
          <CardDescription>Income tracking with running balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Ledger</CardTitle>
        <CardDescription>Income tracking with running balances</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ledger ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Running Balance</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgers.map((ledger) => (
              <TableRow 
                key={ledger.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedRowId === ledger.id ? 'bg-muted ring-2 ring-brand' : ''
                }`}
                onClick={() => onRowSelect?.(ledger.id)}
                data-testid={`row-income-${ledger.id}`}
              >
                <TableCell>
                  <Badge variant="outline" data-testid={`text-ledger-id-${ledger.id}`}>
                    {ledger.incomeLedgerId}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-date-${ledger.id}`}>
                  {format(new Date(ledger.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell data-testid={`text-description-${ledger.id}`}>
                  {ledger.description}
                </TableCell>
                <TableCell data-testid={`text-amount-${ledger.id}`}>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    +₹{ledger.amount?.toLocaleString() || '0'}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-running-balance-${ledger.id}`}>
                  <Badge variant="secondary">
                    ₹{ledger.runningBalance?.toLocaleString() || '0'}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-source-${ledger.id}`}>
                  {ledger.source || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(ledger)}
                      data-testid={`button-edit-${ledger.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(ledger.id)}
                      data-testid={`button-delete-${ledger.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {ledgers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No income ledger entries found. Create your first entry to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExpenseLedgerTable({ ledgers, isLoading, onEdit, onDelete, selectedRowId, onRowSelect }: TableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Ledger</CardTitle>
          <CardDescription>Expense tracking with running balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Ledger</CardTitle>
        <CardDescription>Expense tracking with running balances</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ledger ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Running Balance</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgers.map((ledger) => (
              <TableRow 
                key={ledger.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedRowId === ledger.id ? 'bg-muted ring-2 ring-brand' : ''
                }`}
                onClick={() => onRowSelect?.(ledger.id)}
                data-testid={`row-expense-${ledger.id}`}
              >
                <TableCell>
                  <Badge variant="outline" data-testid={`text-ledger-id-${ledger.id}`}>
                    {ledger.expenseLedgerId}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-date-${ledger.id}`}>
                  {format(new Date(ledger.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell data-testid={`text-description-${ledger.id}`}>
                  {ledger.description}
                </TableCell>
                <TableCell data-testid={`text-amount-${ledger.id}`}>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    -₹{ledger.amount?.toLocaleString() || '0'}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-running-balance-${ledger.id}`}>
                  <Badge variant="secondary">
                    ₹{ledger.runningBalance?.toLocaleString() || '0'}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-category-${ledger.id}`}>
                  {ledger.category || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(ledger)}
                      data-testid={`button-edit-${ledger.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(ledger.id)}
                      data-testid={`button-delete-${ledger.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {ledgers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No expense ledger entries found. Create your first entry to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BankDepositLedgerTable({ ledgers, isLoading, onEdit, onDelete, selectedRowId, onRowSelect }: TableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank Deposit Ledger</CardTitle>
          <CardDescription>Bank deposit tracking with running balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Deposit Ledger</CardTitle>
        <CardDescription>Bank deposit tracking with running balances</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ledger ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Deposit Amount</TableHead>
              <TableHead>Running Balance</TableHead>
              <TableHead>Transaction Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgers.map((ledger) => (
              <TableRow 
                key={ledger.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedRowId === ledger.id ? 'bg-muted ring-2 ring-brand' : ''
                }`}
                onClick={() => onRowSelect?.(ledger.id)}
                data-testid={`row-bank-deposit-${ledger.id}`}
              >
                <TableCell>
                  <Badge variant="outline" data-testid={`text-ledger-id-${ledger.id}`}>
                    {ledger.bankDepositLedgerId}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-date-${ledger.id}`}>
                  {format(new Date(ledger.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell data-testid={`text-bank-${ledger.id}`}>
                  {ledger.bankName}
                </TableCell>
                <TableCell data-testid={`text-deposit-amount-${ledger.id}`}>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    ₹{ledger.depositAmount?.toLocaleString() || '0'}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-running-balance-${ledger.id}`}>
                  <Badge variant="secondary">
                    ₹{ledger.runningBalance?.toLocaleString() || '0'}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-transaction-type-${ledger.id}`}>
                  {ledger.transactionType || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(ledger)}
                      data-testid={`button-edit-${ledger.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(ledger.id)}
                      data-testid={`button-delete-${ledger.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {ledgers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No bank deposit ledger entries found. Create your first entry to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}