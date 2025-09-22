import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useGlobalState } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Search, Plus, Edit, Trash2, Save, Printer, Filter, Receipt, DollarSign, CreditCard } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface BillDeskModuleProps {
  currentFY: string;
  onFYChange?: (fy: string) => void;
}

// Form schemas for validation - Bill Desk specific fields
const customerBillingFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  accountId: z.string().min(1, "Account is required"),
  billDate: z.string().min(1, "Bill date is required"),
  billItems: z.any().optional(), // JSON field - can be any value
  totalAmount: z.string().min(1, "Total amount is required").refine((val) => !isNaN(Number(val)), "Must be a valid amount"),
  commission: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  marketFee: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  hamali: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  discountWeight: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  discountAmount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  netAmount: z.string().min(1, "Net amount is required").refine((val) => !isNaN(Number(val)), "Must be a valid amount"),
  previousBalance: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  finalAmount: z.string().min(1, "Final amount is required").refine((val) => !isNaN(Number(val)), "Must be a valid amount"),
  paidAmount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  balanceAmount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  paymentMode: z.enum(["cash", "cheque", "bank_transfer", "upi", "card"]).optional(),
  paymentDetails: z.any().optional(), // JSON field - can be any value
  notes: z.string().optional(),
  customFields: z.any().optional(), // JSON field - can be any value
});

const khataBillingFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  accountId: z.string().min(1, "Account is required"),
  billDate: z.string().min(1, "Bill date is required"),
  billItems: z.any().optional(), // JSON field - can be any value
  totalAmount: z.string().min(1, "Total amount is required").refine((val) => !isNaN(Number(val)), "Must be a valid amount"),
  commission: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  marketFee: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  hamali: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  discountWeight: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  discountAmount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  netAmount: z.string().min(1, "Net amount is required").refine((val) => !isNaN(Number(val)), "Must be a valid amount"),
  previousBalance: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  finalAmount: z.string().min(1, "Final amount is required").refine((val) => !isNaN(Number(val)), "Must be a valid amount"),
  paidAmount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  balanceAmount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  creditLimit: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  paymentMode: z.enum(["cash", "cheque", "bank_transfer", "upi", "card"]).optional(),
  paymentDetails: z.any().optional(), // JSON field - can be any value
  notes: z.string().optional(),
  customFields: z.any().optional(), // JSON field - can be any value
});

const paymentReceiptFormSchema = z.object({
  receiptType: z.enum(["customer", "other"]),
  // Customer receipt fields
  customerName: z.string().optional(),
  accountId: z.string().optional(),
  billAmount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  // Other receipt fields  
  partyName: z.string().optional(),
  partyType: z.string().optional(),
  invoiceAmount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  // Common fields
  receiptDate: z.string().min(1, "Receipt date is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)), "Must be a valid amount"),
  discount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid amount"),
  netAmount: z.string().min(1, "Net amount is required").refine((val) => !isNaN(Number(val)), "Must be a valid amount"),
  paymentMode: z.enum(["cash", "cheque", "bank_transfer", "upi", "card"]),
  paymentDetails: z.any().optional(), // JSON field - can be any value
  notes: z.string().optional(),
  customFields: z.any().optional(), // JSON field - can be any value
});

export default function BillDeskModule({ currentFY, onFYChange }: BillDeskModuleProps) {
  const [activeTab, setActiveTab] = useState("customer-billing");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { state, updateActiveData } = useGlobalState();

  // Access master data and inventory data from global state
  const accounts = state.masterData.accounts || [];
  const products = state.masterData.products || [];
  const places = state.masterData.places || [];
  const availableLots = state.activeData.lots || [];
  
  // Helper function to get available inventory items for billing
  const getAvailableInventoryItems = () => {
    return availableLots.map(lot => ({
      id: lot.id,
      productName: products.find(p => p.id === lot.productId)?.name || 'Unknown Product',
      quantity: lot.totalQuantity,
      place: places.find(p => p.id === lot.placeId)?.name || 'Unknown Place',
      arrivingDate: lot.arrivingDate,
      lotData: lot
    }));
  };

  // Helper function to get customer accounts for billing
  const getCustomerAccounts = () => {
    return accounts.filter(account => account.type === 'Customer');
  };

  // Helper function to validate data linking
  const validateDataLinking = () => {
    const hasProducts = products.length > 0;
    const hasAccounts = accounts.length > 0;
    const hasPlaces = places.length > 0;
    const hasLots = availableLots.length > 0;
    
    console.log('Data Linking Status:', {
      masterData: { products: hasProducts, accounts: hasAccounts, places: hasPlaces },
      inventoryData: { lots: hasLots },
      totalItems: products.length + accounts.length + places.length + availableLots.length
    });
    
    return { hasProducts, hasAccounts, hasPlaces, hasLots };
  };

  // Mutation for creating bill desk items
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = getApiEndpoint(data.receiptType);
      return apiRequest(`${endpoint}`, 'POST', { ...data, financialYear: currentFY });
    },
    onSuccess: () => {
      setShowForm(false);
      setEditingItem(null);
      // Invalidate queries for all relevant endpoints
      if (activeTab === "payment-receipts") {
        queryClient.invalidateQueries({ queryKey: ["/api/billdesk/customer-receipt", currentFY] });
        queryClient.invalidateQueries({ queryKey: ["/api/billdesk/other-receipt", currentFY] });
      } else {
        queryClient.invalidateQueries({ queryKey: [getApiEndpoint(), currentFY] });
      }
      toast({
        title: "Success",
        description: `${activeTab.replace('-', ' ')} created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create record",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating bill desk items
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const endpoint = getApiEndpoint(data.receiptType || editingItem?.receiptType);
      return apiRequest(`${endpoint}/${id}`, 'PUT', { ...data, financialYear: currentFY });
    },
    onSuccess: () => {
      setShowForm(false);
      setEditingItem(null);
      // Invalidate queries for all relevant endpoints
      if (activeTab === "payment-receipts") {
        queryClient.invalidateQueries({ queryKey: ["/api/billdesk/customer-receipt", currentFY] });
        queryClient.invalidateQueries({ queryKey: ["/api/billdesk/other-receipt", currentFY] });
      } else {
        queryClient.invalidateQueries({ queryKey: [getApiEndpoint(), currentFY] });
      }
      toast({
        title: "Success",
        description: `${activeTab.replace('-', ' ')} updated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update record",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting bill desk items
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Determine endpoint from item being deleted
      const itemType = itemToDelete?.customerName ? "customer" : "other";
      const endpoint = getApiEndpoint(itemType);
      return apiRequest(`${endpoint}/${id}`, 'DELETE');
    },
    onSuccess: () => {
      setShowDeleteDialog(false);
      setItemToDelete(null);
      // Invalidate queries for all relevant endpoints
      if (activeTab === "payment-receipts") {
        queryClient.invalidateQueries({ queryKey: ["/api/billdesk/customer-receipt", currentFY] });
        queryClient.invalidateQueries({ queryKey: ["/api/billdesk/other-receipt", currentFY] });
      } else {
        queryClient.invalidateQueries({ queryKey: [getApiEndpoint(), currentFY] });
      }
      toast({
        title: "Success",
        description: `${activeTab.replace('-', ' ')} deleted successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete record",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const getApiEndpoint = (receiptType?: string) => {
    switch (activeTab) {
      case "customer-billing": return "/api/billdesk/customer-billing";
      case "khata-billing": return "/api/billdesk/khata-billing";
      case "payment-receipts": 
        if (receiptType === "other") return "/api/billdesk/other-receipt";
        return "/api/billdesk/customer-receipt";
      default: return "/api/billdesk/customer-billing";
    }
  };

  const invalidateCurrentData = () => {
    queryClient.invalidateQueries({ queryKey: [getApiEndpoint(), currentFY] });
  };

  const getFormSchema = () => {
    switch (activeTab) {
      case "customer-billing": return customerBillingFormSchema;
      case "khata-billing": return khataBillingFormSchema;
      case "payment-receipts": return paymentReceiptFormSchema;
      default: return customerBillingFormSchema;
    }
  };

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case "customer-billing": return <DollarSign className="h-4 w-4" />;
      case "khata-billing": return <CreditCard className="h-4 w-4" />;
      case "payment-receipts": return <Receipt className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  // Real data queries with FY and search parameters
  const { data: customerBillings = [], isLoading: customerBillingsLoading } = useQuery({
    queryKey: ['/api/billdesk/customer-billing', currentFY, searchTerm],
    queryFn: async () => {
      const url = new URL('/api/billdesk/customer-billing', window.location.origin);
      url.searchParams.set('fy', currentFY);
      if (searchTerm) url.searchParams.set('search', searchTerm);
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch customer billings');
      return response.json();
    },
    enabled: activeTab === 'customer-billing'
  });

  const { data: khataBillings = [], isLoading: khataBillingsLoading } = useQuery({
    queryKey: ['/api/billdesk/khata-billing', currentFY, searchTerm],
    queryFn: async () => {
      const url = new URL('/api/billdesk/khata-billing', window.location.origin);
      url.searchParams.set('fy', currentFY);
      if (searchTerm) url.searchParams.set('search', searchTerm);
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch khata billings');
      return response.json();
    },
    enabled: activeTab === 'khata-billing'
  });

  const { data: customerReceipts = [], isLoading: customerReceiptsLoading } = useQuery({
    queryKey: ['/api/billdesk/customer-receipt', currentFY, searchTerm],
    queryFn: async () => {
      const url = new URL('/api/billdesk/customer-receipt', window.location.origin);
      url.searchParams.set('fy', currentFY);
      if (searchTerm) url.searchParams.set('search', searchTerm);
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch customer receipts');
      return response.json();
    },
    enabled: activeTab === 'payment-receipts'
  });

  const { data: otherReceipts = [], isLoading: otherReceiptsLoading } = useQuery({
    queryKey: ['/api/billdesk/other-receipt', currentFY, searchTerm],
    queryFn: async () => {
      const url = new URL('/api/billdesk/other-receipt', window.location.origin);
      url.searchParams.set('fy', currentFY);
      if (searchTerm) url.searchParams.set('search', searchTerm);
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch other receipts');
      return response.json();
    },
    enabled: activeTab === 'payment-receipts'
  });

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "customer-billing": return customerBillings;
      case "khata-billing": return khataBillings;
      case "payment-receipts": return [
        ...customerReceipts.map((item: any) => ({ ...item, receiptType: 'customer' })),
        ...otherReceipts.map((item: any) => ({ ...item, receiptType: 'other' }))
      ]; // Combine both receipt types with proper type tagging
      default: return customerBillings;
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case "customer-billing": return customerBillingsLoading;
      case "khata-billing": return khataBillingsLoading;
      case "payment-receipts": return customerReceiptsLoading || otherReceiptsLoading;
      default: return customerBillingsLoading;
    }
  };

  // Form initialization
  const form = useForm({
    resolver: zodResolver(getFormSchema()),
    defaultValues: editingItem || getDefaultFormValues(),
  });

  function getDefaultFormValues() {
    switch (activeTab) {
      case "customer-billing":
        return {
          customerName: "",
          accountId: "",
          billDate: new Date().toISOString().split('T')[0],
          totalAmount: "0",
          commission: "0",
          marketFee: "0",
          hamali: "0",
          discountWeight: "0",
          discountAmount: "0",
          netAmount: "0",
          previousBalance: "0",
          finalAmount: "0",
          paidAmount: "0",
          balanceAmount: "0",
          paymentMode: "cash",
          notes: "",
        };
      case "khata-billing":
        return {
          customerName: "",
          accountId: "",
          billDate: new Date().toISOString().split('T')[0],
          totalAmount: "0",
          commission: "0",
          marketFee: "0",
          hamali: "0",
          discountWeight: "0",
          discountAmount: "0",
          netAmount: "0",
          previousBalance: "0",
          finalAmount: "0",
          paidAmount: "0",
          balanceAmount: "0",
          creditLimit: "0",
          paymentMode: "cash",
          notes: "",
        };
      case "payment-receipts":
        return {
          receiptType: "customer",
          customerName: "",
          accountId: "",
          billAmount: "0",
          partyName: "",
          partyType: "",
          invoiceAmount: "0",
          receiptDate: new Date().toISOString().split('T')[0],
          amount: "0",
          discount: "0",
          netAmount: "0",
          paymentMode: "cash",
          notes: "",
        };
      default:
        return {};
    }
  }

  // Handle form submission
  const onSubmit = (data: any) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle edit
  const handleEdit = (item: any) => {
    setEditingItem(item);
    form.reset(item);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  // Handle create new
  const handleCreateNew = () => {
    setEditingItem(null);
    form.reset(getDefaultFormValues());
    setShowForm(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (showForm) {
          setShowForm(false);
          setEditingItem(null);
        }
        return;
      }
      
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            handleCreateNew();
            break;
          case 's':
            event.preventDefault();
            if (showForm) {
              form.handleSubmit(onSubmit)();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm, form]);

  // Reset form when tab changes
  useEffect(() => {
    form.reset(getDefaultFormValues());
    setEditingItem(null);
    setShowForm(false);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-green-800">Bill Desk</h2>
          <p className="text-muted-foreground">
            Manage customer billing, khata billing, and payment receipts for FY {currentFY}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              data-testid="input-search"
            />
          </div>
          <Button onClick={handleCreateNew} data-testid="button-create-new">
            <Plus className="h-4 w-4 mr-2" />
            New {activeTab.replace('-', ' ')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customer-billing" className="flex items-center gap-2" data-testid="tab-customer-billing">
            {getTabIcon("customer-billing")}
            Customer Billing
          </TabsTrigger>
          <TabsTrigger value="khata-billing" className="flex items-center gap-2" data-testid="tab-khata-billing">
            {getTabIcon("khata-billing")}
            Khata Billing
          </TabsTrigger>
          <TabsTrigger value="payment-receipts" className="flex items-center gap-2" data-testid="tab-payment-receipts">
            {getTabIcon("payment-receipts")}
            Payment Receipts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer-billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Customer Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill No.</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Bill Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentLoading() ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          Loading customer billings...
                        </TableCell>
                      </TableRow>
                    ) : getCurrentData().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          No customer billings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      getCurrentData().map((item: any) => (
                        <TableRow key={item.id} data-testid={`row-customer-billing-${item.id}`}>
                          <TableCell className="font-medium">{item.billNo}</TableCell>
                          <TableCell>{item.customerName}</TableCell>
                          <TableCell>{new Date(item.billDate).toLocaleDateString()}</TableCell>
                          <TableCell>₹{item.totalAmount}</TableCell>
                          <TableCell>₹{item.netAmount}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.paymentMode}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.balanceAmount > 0 ? "destructive" : "default"}>
                              {item.balanceAmount > 0 ? "Pending" : "Paid"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} data-testid={`button-edit-${item.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} data-testid={`button-delete-${item.id}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`button-print-${item.id}`}>
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="khata-billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Khata Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill No.</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Bill Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Credit Limit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentLoading() ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          Loading khata billings...
                        </TableCell>
                      </TableRow>
                    ) : getCurrentData().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          No khata billings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      getCurrentData().map((item: any) => (
                        <TableRow key={item.id} data-testid={`row-khata-billing-${item.id}`}>
                          <TableCell className="font-medium">{item.billNo}</TableCell>
                          <TableCell>{item.customerName}</TableCell>
                          <TableCell>{new Date(item.billDate).toLocaleDateString()}</TableCell>
                          <TableCell>₹{item.totalAmount}</TableCell>
                          <TableCell>₹{item.netAmount}</TableCell>
                          <TableCell>₹{item.creditLimit}</TableCell>
                          <TableCell>
                            <Badge variant={item.balanceAmount > 0 ? "destructive" : "default"}>
                              {item.balanceAmount > 0 ? "Outstanding" : "Settled"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} data-testid={`button-edit-${item.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} data-testid={`button-delete-${item.id}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`button-print-${item.id}`}>
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment Receipts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt No.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Party Name</TableHead>
                      <TableHead>Receipt Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentLoading() ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          Loading payment receipts...
                        </TableCell>
                      </TableRow>
                    ) : getCurrentData().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No payment receipts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      getCurrentData().map((item: any) => (
                        <TableRow key={item.id} data-testid={`row-payment-receipt-${item.id}`}>
                          <TableCell className="font-medium">{item.receiptNo}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.customerName ? "Customer" : "Other"}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.customerName || item.partyName}</TableCell>
                          <TableCell>{new Date(item.receiptDate).toLocaleDateString()}</TableCell>
                          <TableCell>₹{item.amount || item.netAmount}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.paymentMode}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} data-testid={`button-edit-${item.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} data-testid={`button-delete-${item.id}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`button-print-${item.id}`}>
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Create"} {activeTab.replace('-', ' ')}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below. Press Ctrl+S to save or Escape to cancel.
            </DialogDescription>
          </DialogHeader>

          <div key={activeTab}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {activeTab === "customer-billing" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} data-testid="input-customer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account</FormLabel>
                        <FormControl>
                          <Input placeholder="Select account" {...field} data-testid="input-account-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bill Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-bill-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter total amount" {...field} data-testid="input-total-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="commission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter commission" {...field} data-testid="input-commission" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marketFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Market Fee</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter market fee" {...field} data-testid="input-market-fee" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hamali"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hamali</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter hamali" {...field} data-testid="input-hamali" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="netAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Net Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter net amount" {...field} data-testid="input-net-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-payment-mode">
                              <SelectValue placeholder="Select payment mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter any notes" {...field} data-testid="input-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {activeTab === "khata-billing" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} data-testid="input-khata-customer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account</FormLabel>
                        <FormControl>
                          <Input placeholder="Select account" {...field} data-testid="input-khata-account-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bill Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-khata-bill-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter total amount" {...field} data-testid="input-khata-total-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Limit</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter credit limit" {...field} data-testid="input-credit-limit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="netAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Net Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter net amount" {...field} data-testid="input-khata-net-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter any notes" {...field} data-testid="input-khata-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {activeTab === "payment-receipts" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="receiptType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receipt Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingItem}>
                          <FormControl>
                            <SelectTrigger data-testid="select-receipt-type">
                              <SelectValue placeholder="Select receipt type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="customer">Customer Receipt</SelectItem>
                            <SelectItem value="other">Other Receipt</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {editingItem && (
                          <FormDescription className="text-sm text-muted-foreground">
                            Receipt type cannot be changed for existing receipts
                          </FormDescription>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="receiptDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receipt Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-receipt-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter amount" {...field} data-testid="input-receipt-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-receipt-payment-mode">
                              <SelectValue placeholder="Select payment mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter any notes" {...field} data-testid="input-receipt-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save">
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {activeTab.replace('-', ' ')}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending} data-testid="button-confirm-delete">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}