import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Calendar, Receipt, FileText, BookOpen } from "lucide-react";
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
import type { DhadaBook, FarmerInvoice, ManualInvoice } from "@shared/schema";
import DhadaBookModule from "./DhadaBookModule";

interface FarmerInvoiceModuleProps {
  activeSubModule: string;
  currentFY: string;
  onFYChange: (fy: string) => void;
}

export default function FarmerInvoiceModule({ activeSubModule, currentFY, onFYChange }: FarmerInvoiceModuleProps) {
  // Get page title and description based on active sub-module
  const getPageInfo = () => {
    switch (activeSubModule) {
      case "dhada-book": 
        return {
          title: "Dhada Book",
          description: "Manage dhada book entries for farmer transactions and lot tracking"
        };
      case "farmer-invoice": 
        return {
          title: "Farmer Invoice", 
          description: "Generate and manage invoices for farmers with detailed payment information"
        };
      case "manual-invoice": 
        return {
          title: "Manual Invoice",
          description: "Create and track manual invoices for custom billing scenarios"
        };
      default: 
        return {
          title: "Farmer Invoice",
          description: "Manage all farmer invoice operations including dhada books and manual invoices"
        };
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Dhada Book Query
  const { 
    data: dhadaBooks = [], 
    isLoading: dhadaBooksLoading 
  } = useQuery<DhadaBook[]>({
    queryKey: ["/api/farmerinvoice/dhada-book", currentFY, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ fy: currentFY });
      if (searchTerm) params.append('search', searchTerm);
      const response = await fetch(`/api/farmerinvoice/dhada-book?${params}`);
      return response.json();
    },
    enabled: activeSubModule === "dhada-book"
  });

  // Farmer Invoice Query
  const { 
    data: farmerInvoices = [], 
    isLoading: farmerInvoicesLoading 
  } = useQuery<FarmerInvoice[]>({
    queryKey: ["/api/farmerinvoice/farmer-invoice", currentFY, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ fy: currentFY });
      if (searchTerm) params.append('search', searchTerm);
      const response = await fetch(`/api/farmerinvoice/farmer-invoice?${params}`);
      return response.json();
    },
    enabled: activeSubModule === "farmer-invoice"
  });

  // Manual Invoice Query
  const { 
    data: manualInvoices = [], 
    isLoading: manualInvoicesLoading 
  } = useQuery<ManualInvoice[]>({
    queryKey: ["/api/farmerinvoice/manual-invoice", currentFY, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ fy: currentFY });
      if (searchTerm) params.append('search', searchTerm);
      const response = await fetch(`/api/farmerinvoice/manual-invoice?${params}`);
      return response.json();
    },
    enabled: activeSubModule === "manual-invoice"
  });

  // Delete mutations
  const deleteDhadaBook = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/farmerinvoice/dhada-book/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/farmerinvoice/dhada-book"] });
      toast({ title: "Success", description: "Dhada book deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete dhada book", variant: "destructive" });
    }
  });

  const deleteFarmerInvoice = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/farmerinvoice/farmer-invoice/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/farmerinvoice/farmer-invoice"] });
      toast({ title: "Success", description: "Farmer invoice deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete farmer invoice", variant: "destructive" });
    }
  });

  const deleteManualInvoice = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/farmerinvoice/manual-invoice/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/farmerinvoice/manual-invoice"] });
      toast({ title: "Success", description: "Manual invoice deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete manual invoice", variant: "destructive" });
    }
  });

  const formatCurrency = (value: string | null) => {
    if (!value) return "₹0.00";
    return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Pending</Badge>;
    
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {getPageInfo().title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {getPageInfo().description} for FY {currentFY}
              </p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search farmers, lots, or products..."
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


        {/* Content based on selected sub-module */}
        {activeSubModule === "dhada-book" && (
          <DhadaBookModule currentFY={currentFY} />
        )}

        {activeSubModule === "farmer-invoice" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-green-600" />
                    Farmer Invoice Management
                  </CardTitle>
                  <CardDescription>
                    Create and manage farmer invoices with auto-calculations
                  </CardDescription>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-add-farmer-invoice"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Invoice
                </Button>
              </CardHeader>
              <CardContent>
                {farmerInvoicesLoading ? (
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
                          <TableHead>Invoice No</TableHead>
                          <TableHead>Farmer Name</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Net Payable</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {farmerInvoices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                              No farmer invoices found
                            </TableCell>
                          </TableRow>
                        ) : (
                          farmerInvoices.map((invoice) => (
                            <TableRow key={invoice.id} data-testid={`row-farmer-invoice-${invoice.id}`}>
                              <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                              <TableCell>{invoice.farmerName}</TableCell>
                              <TableCell>{invoice.productName || "-"}</TableCell>
                              <TableCell>{invoice.quantity}</TableCell>
                              <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                              <TableCell>{formatCurrency(invoice.netPayable)}</TableCell>
                              <TableCell><Badge variant="outline">Active</Badge></TableCell>
                              <TableCell>{format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" data-testid={`button-edit-farmer-invoice-${invoice.id}`}>
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => deleteFarmerInvoice.mutate(invoice.id)}
                                    disabled={deleteFarmerInvoice.isPending}
                                    data-testid={`button-delete-farmer-invoice-${invoice.id}`}
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
        )}

        {activeSubModule === "manual-invoice" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Manual Invoice Management
                  </CardTitle>
                  <CardDescription>
                    Create detailed manual invoices with comprehensive expense tracking
                  </CardDescription>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-add-manual-invoice"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manual Invoice
                </Button>
              </CardHeader>
              <CardContent>
                {manualInvoicesLoading ? (
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
                          <TableHead>Invoice No</TableHead>
                          <TableHead>Farmer Name</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Total Expenses</TableHead>
                          <TableHead>Net Payable</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {manualInvoices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                              No manual invoices found
                            </TableCell>
                          </TableRow>
                        ) : (
                          manualInvoices.map((invoice) => (
                            <TableRow key={invoice.id} data-testid={`row-manual-invoice-${invoice.id}`}>
                              <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                              <TableCell>{invoice.farmerName}</TableCell>
                              <TableCell>{invoice.productName || "-"}</TableCell>
                              <TableCell>{invoice.quantity}</TableCell>
                              <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                              <TableCell>{formatCurrency(invoice.totalExpenses)}</TableCell>
                              <TableCell>{formatCurrency(invoice.netPayable)}</TableCell>
                              <TableCell><Badge variant="outline">Active</Badge></TableCell>
                              <TableCell>{format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" data-testid={`button-edit-manual-invoice-${invoice.id}`}>
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => deleteManualInvoice.mutate(invoice.id)}
                                    disabled={deleteManualInvoice.isPending}
                                    data-testid={`button-delete-manual-invoice-${invoice.id}`}
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
        )}
      </div>
  );
}