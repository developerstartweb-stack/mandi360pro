import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useGlobalState } from "@/lib/globalState";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CalendarIcon, Search, Plus, Edit, Trash2, Save, Printer, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import LotForm from "@/components/LotForm";

interface InventoryModuleProps {
  activeSubModule?: string;
}

// Form schemas for validation - matching backend decimal/timestamp expectations
const lotEntryFormSchema = z.object({
  arrivingDate: z.string().min(1, "Arriving date is required"), // Send as string, server will coerce
  transportName: z.string().min(1, "Transport name is required"),
  placeId: z.string().min(1, "Place is required"),
  productId: z.string().min(1, "Product is required"),
  totalQuantity: z.string().min(1, "Total quantity is required").refine((val) => !isNaN(Number(val)), "Must be a valid number"),
  freight: z.string().min(1, "Freight is required").refine((val) => !isNaN(Number(val)), "Must be a valid amount"),
  advance: z.any().optional(), // JSON field - can be any value
  otherExpenses: z.any().optional(), // JSON field - can be any value
  totalWeight: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Must be a valid number"),
  customFields: z.any().optional(), // JSON field - can be any value
});

const godownAwakFormSchema = z.object({
  linkedLotId: z.string().min(1, "Linked lot is required"),
  inGodown: z.string().min(1, "In godown quantity is required").refine((val) => !isNaN(Number(val)), "Must be a valid number"),
  customFields: z.any().optional(), // JSON field - can be any value
});

const damageFormSchema = z.object({
  linkedLotId: z.string().min(1, "Linked lot is required"),
  qualityDamaged: z.string().min(1, "Quality damaged is required"),
  damagedQuantity: z.string().min(1, "Damaged quantity is required").refine((val) => !isNaN(Number(val)), "Must be a valid number"),
  customFields: z.any().optional(), // JSON field - can be any value
});

const weightSlipFormSchema = z.object({
  linkedLotId: z.string().min(1, "Linked lot is required"),
  grossWeight: z.string().min(1, "Gross weight is required").refine((val) => !isNaN(Number(val)), "Must be a valid number"),
  tareWeight: z.string().min(1, "Tare weight is required").refine((val) => !isNaN(Number(val)), "Must be a valid number"),
  customFields: z.any().optional(), // JSON field - can be any value
});

export default function InventoryModule({ activeSubModule = "lot-entry" }: InventoryModuleProps) {
  const { state, updateActiveData } = useGlobalState();
  const currentFY = state.currentFY;
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Mutation for creating inventory items
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = getApiEndpoint();
      return apiRequest(endpoint, "POST", { ...data, financialYear: currentFY });
    },
    onSuccess: (newData) => {
      // Update global state with new inventory data
      if (activeSubModule === "lot-entry") {
        const currentLots = state.activeData.lots || [];
        updateActiveData("lots", [...currentLots, newData]);
      }
      
      setShowForm(false);
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: [getApiEndpoint(), currentFY] });
      toast({
        title: "Success",
        description: `${activeSubModule.replace('-', ' ')} created successfully`,
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

  // Mutation for updating inventory items
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const endpoint = getApiEndpoint();
      return apiRequest(`${endpoint}/${id}`, "PUT", { ...data, financialYear: currentFY });
    },
    onSuccess: () => {
      setShowForm(false);
      setEditingItem(null);
      // Invalidate queries instead of manual refetch
      queryClient.invalidateQueries({ queryKey: [getApiEndpoint(), currentFY] });
      toast({
        title: "Success",
        description: `${activeSubModule.replace('-', ' ')} updated successfully`,
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

  // Mutation for deleting inventory items
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const endpoint = getApiEndpoint();
      return apiRequest(`${endpoint}/${id}`, "DELETE");
    },
    onSuccess: () => {
      setShowDeleteDialog(false);
      setItemToDelete(null);
      // Invalidate queries instead of manual refetch
      queryClient.invalidateQueries({ queryKey: [getApiEndpoint(), currentFY] });
      toast({
        title: "Success",
        description: `${activeSubModule.replace('-', ' ')} deleted successfully`,
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
  const getApiEndpoint = () => {
    switch (activeSubModule) {
      case "lot-entry": return "/api/inventory/lot-entry";
      case "godown-awak": return "/api/inventory/godown-awak";
      case "damage": return "/api/inventory/damage";
      case "weight-slip": return "/api/inventory/weight-slip";
      default: return "/api/inventory/lot-entry";
    }
  };

  const invalidateCurrentData = () => {
    queryClient.invalidateQueries({ queryKey: [getApiEndpoint(), currentFY] });
  };

  const getFormSchema = () => {
    switch (activeSubModule) {
      case "lot-entry": return lotEntryFormSchema;
      case "godown-awak": return godownAwakFormSchema;
      case "damage": return damageFormSchema;
      case "weight-slip": return weightSlipFormSchema;
      default: return lotEntryFormSchema;
    }
  };

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case "lot-entry": return <Plus className="h-4 w-4" />;
      case "godown-awak": return <Filter className="h-4 w-4" />;
      case "damage": return <Trash2 className="h-4 w-4" />;
      case "weight-slip": return <Save className="h-4 w-4" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  // Simple data loading from global state with debugging
  const lots = state.activeData.lots || [];
  const lotsLoading = false;
  const products = state.masterData.products || [];
  const places = state.masterData.places || [];

  // Enrich lots with product and place names for better display
  const enrichedLots = lots.map((lot: any) => {
    const product = products.find((p: any) => p.id === lot.productId);
    const place = places.find((p: any) => p.id === lot.placeId);
    return {
      ...lot,
      productName: product?.name || lot.productId || 'Unknown Product',
      placeName: place?.name || lot.placeId || 'Unknown Place',
      productUnit: product?.unit || '',
    };
  });


  // Mock data for other tabs (will be replaced with centralized loading later)
  const godownAwaks: any[] = [];
  const damages: any[] = [];
  const weightSlips: any[] = [];
  const godownAwaksLoading = false;
  const damagesLoading = false;
  const weightSlipsLoading = false;

  // Apply client-side search filtering for lots with enhanced search
  const filteredLots = searchTerm ? enrichedLots.filter((lot: any) => 
    lot.lotId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.placeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.transportName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.totalQuantity?.toString().includes(searchTerm.toLowerCase())
  ) : enrichedLots;

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeSubModule) {
      case "lot-entry": return filteredLots;
      case "godown-awak": return godownAwaks;
      case "damage": return damages;
      case "weight-slip": return weightSlips;
      default: return [];
    }
  };

  // Get page title and description based on active sub-module
  const getPageInfo = () => {
    switch (activeSubModule) {
      case "lot-entry": 
        return {
          title: "Lot Entry",
          description: "Record incoming lots from farmers with product details, quantities, and transportation information"
        };
      case "godown-awak": 
        return {
          title: "Godown Awak", 
          description: "Track inventory movement from lots to godown storage with quantity verification"
        };
      case "damage": 
        return {
          title: "Damage Entry",
          description: "Record and manage damaged products with quality assessment and quantity tracking"
        };
      case "weight-slip": 
        return {
          title: "Weight Slip",
          description: "Generate and manage weight verification slips for accurate product measurement"
        };
      default: 
        return {
          title: "Inventory",
          description: "Manage all inventory operations including lot entry, godown tracking, and quality control"
        };
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && !showForm) { // Only when form is not open
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handleAdd();
            break;
          case 'e':
            e.preventDefault();
            const currentData = getCurrentData();
            if (currentData && currentData.length > 0) {
              handleEdit(currentData[0]); // Edit first item as example
            }
            break;
          case 'd':
            e.preventDefault();
            const dataToDelete = getCurrentData();
            if (dataToDelete && dataToDelete.length > 0) {
              handleDelete(dataToDelete[0]); // Delete first item as example
            }
            break;
          case 's':
            e.preventDefault();
            if (showForm) {
              document.getElementById('submit-form')?.click();
            }
            break;
          case 'p':
            e.preventDefault();
            handlePrint();
            break;
          case 'escape':
            e.preventDefault();
            if (showForm) {
              setShowForm(false);
              setEditingItem(null);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [activeSubModule, showForm, getCurrentData]);

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const handlePrint = () => {
    // Print functionality with PDF generation
    window.print(); // Simple print for now
    toast({
      title: "Print",
      description: "Print dialog opened",
    });
  };

  // Form handling
  const form = useForm({
    resolver: zodResolver(getFormSchema()),
    defaultValues: editingItem || {},
  });

  useEffect(() => {
    if (editingItem) {
      form.reset(editingItem);
    } else {
      form.reset({});
    }
  }, [editingItem, form, activeSubModule]);

  const onSubmit = (data: any) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };


  const isLoading = () => {
    switch (activeSubModule) {
      case "lot-entry": return lotsLoading;
      case "godown-awak": return godownAwaksLoading;
      case "damage": return damagesLoading;
      case "weight-slip": return weightSlipsLoading;
      default: return false;
    }
  };

  const getTableColumns = () => {
    switch (activeSubModule) {
      case "lot-entry":
        return [
          { key: "lotId", label: "Lot ID", width: "w-28" },
          { key: "productName", label: "Product", width: "w-32" },
          { key: "placeName", label: "Place", width: "w-28" },
          { key: "arrivingDate", label: "Date", width: "w-24" },
          { key: "transportName", label: "Transport", width: "w-28" },
          { key: "totalQuantity", label: "Quantity", width: "w-20" },
          { key: "totalWeight", label: "Weight", width: "w-20" },
          { key: "actions", label: "Actions", width: "w-24" },
        ];
      case "godown-awak":
        return [
          { key: "godownAwakId", label: "Awak ID", width: "w-32" },
          { key: "linkedLotId", label: "Lot ID", width: "w-32" },
          { key: "totalArrived", label: "Arrived", width: "w-24" },
          { key: "inGodown", label: "In Godown", width: "w-24" },
          { key: "actions", label: "Actions", width: "w-32" },
        ];
      case "damage":
        return [
          { key: "damageId", label: "Damage ID", width: "w-32" },
          { key: "linkedLotId", label: "Lot ID", width: "w-32" },
          { key: "qualityDamaged", label: "Quality", width: "w-32" },
          { key: "damagedQuantity", label: "Quantity", width: "w-24" },
          { key: "actions", label: "Actions", width: "w-32" },
        ];
      case "weight-slip":
        return [
          { key: "weightSlipId", label: "Slip ID", width: "w-32" },
          { key: "linkedLotId", label: "Lot ID", width: "w-32" },
          { key: "grossWeight", label: "Gross", width: "w-24" },
          { key: "netWeight", label: "Net", width: "w-24" },
          { key: "actions", label: "Actions", width: "w-32" },
        ];
      default: return [];
    }
  };

  const renderTableView = () => {
    const data = getCurrentData();
    const columns = getTableColumns();
    
    if (isLoading()) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-lg mb-2">No {activeSubModule.replace('-', ' ')} records found</div>
          <p className="text-sm">Click the Add button to create your first record</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.width}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: any, index: number) => (
            <TableRow key={item.id || index} className="hover:bg-muted/50">
              {columns.map((column) => (
                <TableCell key={column.key} className={column.width}>
                  {column.key === "actions" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        data-testid={`button-edit-${item.id || index}`}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item)}
                        data-testid={`button-delete-${item.id || index}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : column.key === "productName" ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{item.productName || "-"}</span>
                      {item.productUnit && (
                        <span className="text-xs text-muted-foreground">{item.productUnit}</span>
                      )}
                    </div>
                  ) : column.key === "arrivingDate" ? (
                    <span>{item[column.key] ? new Date(item[column.key]).toLocaleDateString() : "-"}</span>
                  ) : column.key === "totalQuantity" || column.key === "totalWeight" ? (
                    <span>{item[column.key] ? `${Number(item[column.key]).toLocaleString()}` : "-"}</span>
                  ) : (
                    <span>{item[column.key] || "-"}</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Show full-screen LotForm for lot-entry
  if (activeSubModule === "lot-entry" && showForm) {
    return (
      <div className="p-6">
        <LotForm 
          onSubmit={() => {
            setShowForm(false);
            setEditingItem(null);
            // Refresh the lot entry data
            queryClient.invalidateQueries({ queryKey: ['/api/inventory/lot-entry', currentFY] });
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          initialData={editingItem}
          currentFY={currentFY}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-display text-primary flex items-center gap-2">
                <Filter className="h-6 w-6" />
                {getPageInfo().title}
              </CardTitle>
              <p className="text-muted-foreground">
                {getPageInfo().description} for FY {currentFY}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                FY {currentFY}
              </Badge>
              <Button onClick={handleAdd} className="gap-2" data-testid="button-add-inventory">
                <Plus className="h-4 w-4" />
                Add New
              </Button>
              <Button variant="outline" onClick={handlePrint} className="gap-2" data-testid="button-print-inventory">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by Lot ID, Product, Place, Transport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-inventory"
              />
            </div>
            <Select value={filterActive?.toString() || "all"} onValueChange={(value) => setFilterActive(value === "all" ? null : value === "true")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>


      {/* Content based on selected sub-module */}
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle>
            {activeSubModule === "lot-entry" && "Lot Entry Records"}
            {activeSubModule === "godown-awak" && "Godown Awak Records"}
            {activeSubModule === "damage" && "Damage Records"}
            {activeSubModule === "weight-slip" && "Weight Slip Records"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderTableView()}
        </CardContent>
      </Card>

      {/* Form Dialog - Full Screen */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-inventory-form">
          <DialogHeader>
            <DialogTitle data-testid="text-form-title">
              {editingItem ? "Edit" : "Add"} {activeSubModule.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </DialogTitle>
            <DialogDescription data-testid="text-form-description">
              {editingItem 
                ? `Update the ${activeSubModule.replace('-', ' ')} information below.`
                : `Enter the details to create a new ${activeSubModule.replace('-', ' ')}.`
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-4 space-y-4">
              {/* Dynamic form fields based on active tab */}
              {activeSubModule === "lot-entry" && (
                <>
                  <FormField
                    control={form.control}
                    name="arrivingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arriving Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-arriving-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transportName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transport Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter transport name" {...field} data-testid="input-transport-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter quantity" {...field} data-testid="input-total-quantity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="freight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Freight</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter freight amount" {...field} data-testid="input-freight" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {activeSubModule === "godown-awak" && (
                <>
                  <FormField
                    control={form.control}
                    name="linkedLotId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked Lot ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Select lot ID" {...field} data-testid="input-linked-lot-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inGodown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>In Godown Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter quantity in godown" {...field} data-testid="input-in-godown" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {activeSubModule === "damage" && (
                <>
                  <FormField
                    control={form.control}
                    name="linkedLotId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked Lot ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Select lot ID" {...field} data-testid="input-damage-lot-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qualityDamaged"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality Damaged</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter quality type" {...field} data-testid="input-quality-damaged" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="damagedQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Damaged Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter damaged quantity" {...field} data-testid="input-damaged-quantity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {activeSubModule === "weight-slip" && (
                <>
                  <FormField
                    control={form.control}
                    name="linkedLotId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked Lot ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Select lot ID" {...field} data-testid="input-weight-lot-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="grossWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Weight</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter gross weight" {...field} data-testid="input-gross-weight" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tareWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tare Weight</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Enter tare weight" {...field} data-testid="input-tare-weight" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  data-testid="button-cancel-form"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  id="submit-form"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-form"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editingItem ? "Update" : "Create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-title">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-delete-description">
              Are you sure you want to delete this {activeSubModule.replace('-', ' ')}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-muted-foreground text-center space-x-4 py-4 border-t">
        <span>Ctrl+N: Add</span>
        <span>Ctrl+E: Edit</span>
        <span>Ctrl+D: Delete</span>
        <span>Ctrl+S: Save</span>
        <span>Ctrl+P: Print</span>
      </div>
    </div>
  );
}