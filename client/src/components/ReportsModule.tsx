import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";
import { 
  BarChart3, 
  FileText, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Plus, 
  Printer, 
  Search,
  Filter,
  Calendar,
  ExternalLink,
  Download
} from "lucide-react";
import { format } from "date-fns";

const reportTypes = [
  { id: "lot", label: "Lot Report", icon: BarChart3, description: "Track lot quantities and weights" },
  { id: "bill", label: "Bill Report", icon: FileText, description: "Monitor billing and payment status" },
  { id: "invoice", label: "Invoice Report", icon: Receipt, description: "Analyze farmer invoice data" },
  { id: "income", label: "Income Report", icon: TrendingUp, description: "Review income transactions" },
  { id: "expense", label: "Expense Report", icon: TrendingDown, description: "Track business expenses" },
  { id: "paid-unpaid", label: "Paid/Unpaid Report", icon: Users, description: "Customer balance analysis" },
];

interface FilterBarProps {
  activeTab: string;
  currentFY: string;
  onFYChange: (fy: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
}

function FilterBar({ activeTab, currentFY, onFYChange, searchTerm, onSearchChange, filters, onFilterChange }: FilterBarProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-brand" />
          Report Filters
        </CardTitle>
        <CardDescription>
          Configure filters and parameters for {reportTypes.find(r => r.id === activeTab)?.label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Financial Year Filter */}
          <div className="space-y-2">
            <Label htmlFor="fy-select">Financial Year</Label>
            <Select value={currentFY} onValueChange={onFYChange}>
              <SelectTrigger data-testid="select-fy">
                <SelectValue placeholder="Select FY" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-26">2025-26</SelectItem>
                <SelectItem value="2024-25">2024-25</SelectItem>
                <SelectItem value="2023-24">2023-24</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Filter */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Report-specific filters */}
          {activeTab === "lot" && (
            <>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={filters.dateRange || ""} onValueChange={(value) => onFilterChange("dateRange", value)}>
                  <SelectTrigger data-testid="select-date-range">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Product Filter</Label>
                <Input
                  placeholder="Product name..."
                  value={filters.product || ""}
                  onChange={(e) => onFilterChange("product", e.target.value)}
                  data-testid="input-product-filter"
                />
              </div>
            </>
          )}

          {activeTab === "bill" && (
            <>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={filters.status || ""} onValueChange={(value) => onFilterChange("status", value)}>
                  <SelectTrigger data-testid="select-payment-status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Customer</Label>
                <Input
                  placeholder="Customer name..."
                  value={filters.customer || ""}
                  onChange={(e) => onFilterChange("customer", e.target.value)}
                  data-testid="input-customer-filter"
                />
              </div>
            </>
          )}

          {(activeTab === "income" || activeTab === "expense") && (
            <>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={filters.paymentMode || ""} onValueChange={(value) => onFilterChange("paymentMode", value)}>
                  <SelectTrigger data-testid="select-payment-mode">
                    <SelectValue placeholder="All modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount Range</Label>
                <Input
                  placeholder="Min - Max amount"
                  value={filters.amountRange || ""}
                  onChange={(e) => onFilterChange("amountRange", e.target.value)}
                  data-testid="input-amount-range"
                />
              </div>
            </>
          )}

          {activeTab === "paid-unpaid" && (
            <>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={filters.type || ""} onValueChange={(value) => onFilterChange("type", value)}>
                  <SelectTrigger data-testid="select-account-type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Balance Status</Label>
                <Select value={filters.balanceStatus || ""} onValueChange={(value) => onFilterChange("balanceStatus", value)}>
                  <SelectTrigger data-testid="select-balance-status">
                    <SelectValue placeholder="All balances" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="positive">Outstanding</SelectItem>
                    <SelectItem value="zero">Cleared</SelectItem>
                    <SelectItem value="negative">Advance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ResultsTableProps {
  type: string;
  data: any[];
  isLoading: boolean;
  selectedRowId: string | null;
  onRowSelect: (id: string) => void;
  onNavigate?: (path: string) => void;
}

function ResultsTable({ type, data, isLoading, selectedRowId, onRowSelect, onNavigate }: ResultsTableProps) {
  const formatCurrency = (amount: any) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      unpaid: "destructive", 
      partial: "secondary",
      active: "default"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Data Found</h3>
            <p>No {type} reports available for the selected criteria.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {type === "lot" && (
                  <>
                    <TableHead>Lot ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Weight</TableHead>
                  </>
                )}
                {type === "bill" && (
                  <>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </>
                )}
                {type === "invoice" && (
                  <>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Net Payable</TableHead>
                  </>
                )}
                {(type === "income" || type === "expense") && (
                  <>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                  </>
                )}
                {type === "paid-unpaid" && (
                  <>
                    <TableHead>Name</TableHead>
                    <TableHead>Payable</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Unpaid</TableHead>
                    <TableHead>Type</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    selectedRowId === (row.id || index.toString()) ? 'bg-muted ring-2 ring-brand' : ''
                  }`}
                  onClick={() => onRowSelect(row.id || index.toString())}
                  data-testid={`row-${type}-${row.id || index}`}
                >
                  {type === "lot" && (
                    <>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {row.lotId}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate?.('/lots');
                            }}
                            title="View in Inventory"
                            data-testid={`button-nav-lot-${row.lotId}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{row.productName}</TableCell>
                      <TableCell>{row.farmerName}</TableCell>
                      <TableCell>{row.date ? format(new Date(row.date), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{row.totalQuantity}</TableCell>
                      <TableCell>{row.totalWeight}</TableCell>
                    </>
                  )}
                  {type === "bill" && (
                    <>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {row.billNo}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate?.('/bill-desk');
                            }}
                            title="View in Bill Desk"
                            data-testid={`button-nav-bill-${row.billNo}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>{row.date ? format(new Date(row.date), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{formatCurrency(row.totalAmount)}</TableCell>
                      <TableCell>{getStatusBadge(row.status || "active")}</TableCell>
                    </>
                  )}
                  {type === "invoice" && (
                    <>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {row.invoiceNo}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate?.('/farmer-invoice');
                            }}
                            title="View in Farmer Invoice"
                            data-testid={`button-nav-invoice-${row.invoiceNo}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{row.farmerName}</TableCell>
                      <TableCell>{row.date ? format(new Date(row.date), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{formatCurrency(row.netPayable)}</TableCell>
                    </>
                  )}
                  {(type === "income" || type === "expense") && (
                    <>
                      <TableCell>{row.date ? format(new Date(row.date), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {row.name}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate?.('/ledger');
                            }}
                            title="View in Ledger"
                            data-testid={`button-nav-${type}-${row.name || index}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(row.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.paymentMode || "N/A"}</Badge>
                      </TableCell>
                    </>
                  )}
                  {type === "paid-unpaid" && (
                    <>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {row.name}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate?.('/ledger');
                            }}
                            title="View in Ledger"
                            data-testid={`button-nav-${type}-${row.name || index}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(row.payable)}</TableCell>
                      <TableCell>{formatCurrency(row.paid)}</TableCell>
                      <TableCell className={row.unpaid > 0 ? "text-red-600 font-medium" : ""}>
                        {formatCurrency(row.unpaid)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.type}</Badge>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsModule() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("lot");
  const [currentFY, setCurrentFY] = useState("2025-26");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            // New report config (could open a form)
            toast({ title: "New Report", description: "Report configuration functionality coming soon" });
            break;
          case 'p':
            e.preventDefault();
            handlePrint();
            break;
          case 'f':
            e.preventDefault();
            // Focus search
            document.getElementById('search')?.focus();
            break;
          case 's':
            e.preventDefault();
            // Save current report configuration
            toast({ title: "Save Config", description: "Report configuration saved successfully" });
            break;
          case 'e':
            e.preventDefault();
            // Export current report
            if (reportData.length > 0) {
              handleExportCSV();
            } else {
              toast({ title: "No Data", description: "No data to export", variant: "destructive" });
            }
            break;
          case 'd':
            e.preventDefault();
            // Delete/Clear current filters
            setFilters({});
            setSearchTerm("");
            setSelectedRowId(null);
            toast({ title: "Filters Cleared", description: "All filters and selections cleared" });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrint, toast]);

  // Clear selection when switching tabs
  useEffect(() => {
    setSelectedRowId(null);
    setFilters({});
  }, [activeTab]);

  // Fetch report data
  const { data: reportData = [], isLoading } = useQuery({
    queryKey: ['/api/reports', activeTab, currentFY, searchTerm, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ fy: currentFY });
      if (searchTerm) params.append('search', searchTerm);
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/reports/${activeTab}?${params}`);
      return response.json();
    },
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Export functionality
  const handleExportCSV = () => {
    const csvData = reportData.map(row => {
      const values = Object.values(row).map(val => 
        typeof val === 'object' ? JSON.stringify(val) : String(val || '')
      );
      return values.join(',');
    }).join('\n');
    
    const headers = Object.keys(reportData[0] || {}).join(',') + '\n';
    const blob = new Blob([headers + csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report-${currentFY}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: "CSV file downloaded successfully" });
  };

  const handleExportJSON = () => {
    const jsonData = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report-${currentFY}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: "JSON file downloaded successfully" });
  };

  // Navigation handler
  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="space-y-6" ref={componentRef}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reports Module</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analytics and reporting across all business operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            disabled={reportData.length === 0}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportJSON}
            disabled={reportData.length === 0}
            data-testid="button-export-json"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint}
            disabled={reportData.length === 0}
            data-testid="button-print-report"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        activeTab={activeTab}
        currentFY={currentFY}
        onFYChange={setCurrentFY}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Sub-Module Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <CardTitle className="text-lg">Sub-Module</CardTitle>
                <p className="text-sm text-muted-foreground">Select a report type</p>
              </div>
              <Select value={activeTab} onValueChange={setActiveTab} data-testid="select-reports-submodule">
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content based on selected report type */}
      {reportTypes.map((type) => activeTab === type.id && (
        <div key={type.id} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <type.icon className="w-5 h-5 text-brand" />
                {type.label}
              </CardTitle>
              <CardDescription>
                {type.description} - FY {currentFY}
              </CardDescription>
            </CardHeader>
          </Card>

          <ResultsTable
            type={type.id}
            data={reportData}
            isLoading={isLoading}
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
            onNavigate={handleNavigate}
          />
        </div>
      ))}

      {/* Summary Cards */}
      {reportData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{reportData.length}</div>
              <p className="text-xs text-muted-foreground">Total Records</p>
            </CardContent>
          </Card>
          {activeTab === "lot" && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {reportData.reduce((sum, item) => sum + (parseFloat(item.totalQuantity) || 0), 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Quantity</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {reportData.reduce((sum, item) => sum + (parseFloat(item.totalWeight) || 0), 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Weight</p>
                </CardContent>
              </Card>
            </>
          )}
          {(activeTab === "income" || activeTab === "expense" || activeTab === "bill") && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      minimumFractionDigits: 0,
                    }).format(
                      reportData.reduce((sum, item) => sum + (parseFloat(item.amount || item.totalAmount || item.netPayable) || 0), 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      minimumFractionDigits: 0,
                    }).format(
                      reportData.reduce((sum, item) => sum + (parseFloat(item.amount || item.totalAmount || item.netPayable) || 0), 0) / reportData.length
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Average Amount</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}