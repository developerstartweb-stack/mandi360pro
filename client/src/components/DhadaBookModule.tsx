import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, Plus, Trash2, BookOpen, Save, IndianRupee, Scale, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LotEntry, LotEntrySubFields, LotSales } from "@shared/schema";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";

interface DhadaBookModuleProps {
  currentFY: string;
}

interface LotWithSubFields extends LotEntry {
  subFields: LotEntrySubFields[];
  sales: LotSales[];
}

interface SaleEntry {
  id?: string;
  lotId: string;
  subLotId: string | null;
  buyerName: string;
  quantity: string;
  weight: string;
  rate: string;
  total: string;
  saleDate: string;
  financialYear: string;
}

interface RateGroup {
  rate: string;
  quantity: number;
  weight: number;
  total: number;
}

export default function DhadaBookModule({ currentFY }: DhadaBookModuleProps) {
  const [expandedLots, setExpandedLots] = useState<Set<string>>(new Set());
  const [editingSales, setEditingSales] = useState<Map<string, SaleEntry>>(new Map());
  const { toast } = useToast();

  // Fetch accounts for farmer names
  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ["/api/accounts"],
    queryFn: async () => {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      return response.json();
    }
  });

  // Fetch products for product names
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    }
  });

  // Fetch lots with their sub-fields
  const { data: lots = [], isLoading: lotsLoading } = useQuery<LotWithSubFields[]>({
    queryKey: ["/api/inventory/lot-entry/with-subfields", currentFY],
    queryFn: async () => {
      const params = new URLSearchParams({ fy: currentFY });
      const response = await fetch(`/api/inventory/lot-entry/with-subfields?${params}`);
      if (!response.ok) throw new Error("Failed to fetch lots");
      return response.json();
    }
  });

  // Fetch all sales for the current FY
  const { data: allSales = [], isLoading: salesLoading } = useQuery<LotSales[]>({
    queryKey: ["/api/lot-sales", currentFY],
    queryFn: async () => {
      const params = new URLSearchParams({ fy: currentFY });
      const response = await fetch(`/api/lot-sales?${params}`);
      if (!response.ok) throw new Error("Failed to fetch sales");
      return response.json();
    }
  });

  // Helper to get account name from ID
  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId || acc.accountId === accountId);
    return account?.name || accountId;
  };

  // Helper to get product name from ID
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId || p.productId === productId);
    return product?.productName || productId;
  };

  // Create or update sale mutation
  const saveSaleMutation = useMutation({
    mutationFn: async (sale: SaleEntry) => {
      if (sale.id) {
        return apiRequest(`/api/lot-sales/${sale.id}`, 'PUT', sale);
      } else {
        return apiRequest('/api/lot-sales', 'POST', sale);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lot-sales"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save sale",
        variant: "destructive"
      });
    }
  });

  // Delete sale mutation
  const deleteSaleMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/lot-sales/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lot-sales"] });
      toast({ title: "Success", description: "Sale deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete sale", variant: "destructive" });
    }
  });

  // Toggle lot expansion
  const toggleLot = (lotId: string) => {
    setExpandedLots(prev => {
      const next = new Set(prev);
      if (next.has(lotId)) {
        next.delete(lotId);
      } else {
        next.add(lotId);
      }
      return next;
    });
  };

  // Get sales for a specific sub-lot or lot
  const getSalesForSubLot = (lotId: string, subLotId: string | null): LotSales[] => {
    return allSales.filter(sale => 
      sale.lotId === lotId && 
      (subLotId === null ? sale.subLotId === null : sale.subLotId === subLotId)
    );
  };

  // Calculate rate groups for a sub-lot
  const calculateRateGroups = (sales: LotSales[]): RateGroup[] => {
    const groups = new Map<string, RateGroup>();
    
    sales.forEach(sale => {
      const rate = sale.rate || "0";
      const existing = groups.get(rate);
      const quantity = parseFloat(sale.quantity || "0");
      const weight = parseFloat(sale.weight || "0");
      const total = parseFloat(sale.total || "0");
      
      if (existing) {
        existing.quantity += quantity;
        existing.weight += weight;
        existing.total += total;
      } else {
        groups.set(rate, { rate, quantity, weight, total });
      }
    });
    
    return Array.from(groups.values()).sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));
  };

  // Start editing a new sale entry
  const startNewSale = (lotId: string, subLotId: string | null) => {
    const key = `${lotId}-${subLotId || 'main'}-new`;
    const newSale: SaleEntry = {
      lotId,
      subLotId,
      buyerName: "",
      quantity: "",
      weight: "",
      rate: "",
      total: "",
      saleDate: new Date().toISOString().split('T')[0],
      financialYear: currentFY
    };
    setEditingSales(prev => new Map(prev).set(key, newSale));
  };

  // Update sale entry
  const updateSaleEntry = (key: string, field: keyof SaleEntry, value: string) => {
    setEditingSales(prev => {
      const next = new Map(prev);
      const sale = next.get(key);
      if (!sale) return prev;
      
      const updated = { ...sale, [field]: value };
      
      // Auto-calculate total when quantity, weight, or rate changes
      if (field === 'quantity' || field === 'rate') {
        const qty = parseFloat(field === 'quantity' ? value : updated.quantity) || 0;
        const rate = parseFloat(field === 'rate' ? value : updated.rate) || 0;
        updated.total = (qty * rate).toFixed(2);
      }
      
      next.set(key, updated);
      return next;
    });
  };

  // Auto-save with debounce
  const debouncedSave = useDebounce((sale: SaleEntry) => {
    if (sale.buyerName && sale.quantity && sale.rate) {
      saveSaleMutation.mutate(sale);
    }
  }, 1000);

  // Trigger auto-save when editing
  useEffect(() => {
    editingSales.forEach(sale => {
      if (sale.buyerName && sale.quantity && sale.rate) {
        debouncedSave(sale);
      }
    });
  }, [editingSales]);

  // Save a specific sale entry
  const saveSale = (key: string) => {
    const sale = editingSales.get(key);
    if (!sale) return;
    
    if (!sale.buyerName || !sale.quantity || !sale.rate) {
      toast({
        title: "Validation Error",
        description: "Please fill in buyer name, quantity, and rate",
        variant: "destructive"
      });
      return;
    }
    
    saveSaleMutation.mutate(sale, {
      onSuccess: () => {
        setEditingSales(prev => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
        toast({ title: "Success", description: "Sale saved successfully" });
      }
    });
  };

  // Cancel editing
  const cancelEdit = (key: string) => {
    setEditingSales(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return "₹0.00";
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatWeight = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return "0 kg";
    return `${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })} kg`;
  };

  if (lotsLoading || salesLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Lots List */}
      <div className="space-y-4">
        {lots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No lots found for FY {currentFY}
            </CardContent>
          </Card>
        ) : (
          lots.map(lot => {
            const isExpanded = expandedLots.has(lot.lotId);
            const lotSales = getSalesForSubLot(lot.lotId, null);
            const lotRateGroups = calculateRateGroups(lotSales);
            const lotEditKey = `${lot.lotId}-main-new`;
            const isEditingLotSale = editingSales.has(lotEditKey);
            
            return (
              <Card key={lot.id} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleLot(lot.lotId)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="hover-elevate cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {lot.lotId}
                              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                                {getProductName(lot.productId)}
                              </span>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Scale className="w-3 h-3" />
                                {lot.totalQuantity} bags
                              </span>
                              <span className="flex items-center gap-1">
                                {formatWeight(lot.totalWeight || 0)}
                              </span>
                              {lot.transportName && (
                                <span>Transport: {lot.transportName}</span>
                              )}
                              <span>{lot.arrivingDate ? format(new Date(lot.arrivingDate), "MMM dd, yyyy") : "-"}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {lot.subFields?.length || 0} Farmers
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {/* Main Lot Sales Summary */}
                      {lotRateGroups.length > 0 && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" />
                            Main Lot Rate Summary
                          </h4>
                          <div className="space-y-2">
                            {lotRateGroups.map(group => (
                              <div key={group.rate} className="flex items-center justify-between text-sm">
                                <span className="font-medium">Rate: {formatCurrency(group.rate)}/bag</span>
                                <div className="flex items-center gap-4">
                                  <span>{group.quantity} bags</span>
                                  <span>{formatWeight(group.weight)}</span>
                                  <span className="font-semibold">{formatCurrency(group.total)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Main Lot Sales */}
                      {lotSales.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold mb-3">Main Lot Sales</h4>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Buyer Name</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead>Weight</TableHead>
                                  <TableHead>Rate</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead>Sale Date</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {lotSales.map(sale => (
                                  <TableRow key={sale.id}>
                                    <TableCell>{sale.buyerName}</TableCell>
                                    <TableCell>{sale.quantity} bags</TableCell>
                                    <TableCell>{formatWeight(sale.weight || 0)}</TableCell>
                                    <TableCell>{formatCurrency(sale.rate || 0)}/bag</TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(sale.total || 0)}</TableCell>
                                    <TableCell>{sale.saleDate ? format(new Date(sale.saleDate), "MMM dd, yyyy") : "-"}</TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteSaleMutation.mutate(sale.id)}
                                        disabled={deleteSaleMutation.isPending}
                                        data-testid={`button-delete-sale-${sale.id}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                      
                      
                      {/* Farmer Sub-Lots */}
                      {lot.subFields && lot.subFields.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Farmer Lots
                          </h4>
                          {lot.subFields.map(subField => {
                            const subLotSales = getSalesForSubLot(lot.lotId, subField.id);
                            const subLotRateGroups = calculateRateGroups(subLotSales);
                            const subEditKey = `${lot.lotId}-${subField.id}-new`;
                            const isEditingSubSale = editingSales.has(subEditKey);
                            
                            return (
                              <Card key={subField.id} className="ml-8 bg-gray-50 dark:bg-gray-800/30">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base">
                                    Farmer: {getAccountName(subField.farmerAgentId)}
                                  </CardTitle>
                                  <CardDescription className="flex items-center gap-4">
                                    <span>{subField.quantity} bags</span>
                                    <span>{formatWeight(subField.weight || 0)}</span>
                                    {subField.quality && <span>Quality: {subField.quality}</span>}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  {/* Sub-Lot Rate Summary */}
                                  {subLotRateGroups.length > 0 && (
                                    <div className="mb-4 p-3 bg-white dark:bg-gray-900 rounded-md">
                                      <h5 className="text-xs font-semibold mb-2">Rate Summary</h5>
                                      <div className="space-y-1">
                                        {subLotRateGroups.map(group => (
                                          <div key={group.rate} className="flex items-center justify-between text-xs">
                                            <span className="font-medium">{formatCurrency(group.rate)}/bag</span>
                                            <div className="flex items-center gap-3">
                                              <span>{group.quantity} bags</span>
                                              <span>{formatWeight(group.weight)}</span>
                                              <span className="font-semibold">{formatCurrency(group.total)}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Sub-Lot Sales */}
                                  {subLotSales.length > 0 && (
                                    <div className="mb-3">
                                      <div className="rounded-md border text-sm">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="text-xs">Buyer</TableHead>
                                              <TableHead className="text-xs">Qty</TableHead>
                                              <TableHead className="text-xs">Weight</TableHead>
                                              <TableHead className="text-xs">Rate</TableHead>
                                              <TableHead className="text-xs">Total</TableHead>
                                              <TableHead className="text-xs">Date</TableHead>
                                              <TableHead className="text-right text-xs">Actions</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {subLotSales.map(sale => (
                                              <TableRow key={sale.id}>
                                                <TableCell className="text-xs">{sale.buyerName}</TableCell>
                                                <TableCell className="text-xs">{sale.quantity}</TableCell>
                                                <TableCell className="text-xs">{formatWeight(sale.weight || 0)}</TableCell>
                                                <TableCell className="text-xs">{formatCurrency(sale.rate || 0)}</TableCell>
                                                <TableCell className="text-xs font-semibold">{formatCurrency(sale.total || 0)}</TableCell>
                                                <TableCell className="text-xs">{sale.saleDate ? format(new Date(sale.saleDate), "MMM dd") : "-"}</TableCell>
                                                <TableCell className="text-right">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteSaleMutation.mutate(sale.id)}
                                                    disabled={deleteSaleMutation.isPending}
                                                    data-testid={`button-delete-sale-${sale.id}`}
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </Button>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Add Sale to Sub-Lot */}
                                  {!isEditingSubSale && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => startNewSale(lot.lotId, subField.id)}
                                      data-testid={`button-add-sale-${subField.id}`}
                                    >
                                      <Plus className="w-3 h-3 mr-2" />
                                      Add Sale
                                    </Button>
                                  )}
                                  
                                  {/* New Sale Entry Form for Sub-Lot */}
                                  {isEditingSubSale && (() => {
                                    const sale = editingSales.get(subEditKey)!;
                                    return (
                                      <div className="p-3 border rounded-md bg-white dark:bg-gray-900">
                                        <div className="grid grid-cols-6 gap-2">
                                          <Input
                                            placeholder="Buyer"
                                            value={sale.buyerName}
                                            onChange={(e) => updateSaleEntry(subEditKey, 'buyerName', e.target.value)}
                                            className="text-sm"
                                            data-testid="input-buyer-name"
                                          />
                                          <Input
                                            type="number"
                                            placeholder="Qty"
                                            value={sale.quantity}
                                            onChange={(e) => updateSaleEntry(subEditKey, 'quantity', e.target.value)}
                                            className="text-sm"
                                            data-testid="input-quantity"
                                          />
                                          <Input
                                            type="number"
                                            placeholder="Weight"
                                            value={sale.weight}
                                            onChange={(e) => updateSaleEntry(subEditKey, 'weight', e.target.value)}
                                            className="text-sm"
                                            data-testid="input-weight"
                                          />
                                          <Input
                                            type="number"
                                            placeholder="Rate"
                                            value={sale.rate}
                                            onChange={(e) => updateSaleEntry(subEditKey, 'rate', e.target.value)}
                                            className="text-sm"
                                            data-testid="input-rate"
                                          />
                                          <Input
                                            type="number"
                                            placeholder="Total"
                                            value={sale.total}
                                            readOnly
                                            className="bg-gray-50 dark:bg-gray-800 text-sm"
                                            data-testid="input-total"
                                          />
                                          <div className="flex gap-1">
                                            <Button
                                              variant="default"
                                              size="sm"
                                              onClick={() => saveSale(subEditKey)}
                                              disabled={saveSaleMutation.isPending}
                                              data-testid="button-save-sale"
                                            >
                                              <Save className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => cancelEdit(subEditKey)}
                                              data-testid="button-cancel-sale"
                                            >
                                              X
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
