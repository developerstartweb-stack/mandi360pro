import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { CalendarIcon, Search, Plus, Edit, Trash2, Save, Printer, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface InventoryModuleProps {
  currentFY: string;
  onFYChange?: (fy: string) => void;
}

// Form schemas for validation
const lotEntryFormSchema = z.object({
  arrivingDate: z.string().min(1, "Arriving date is required"),
  transportName: z.string().min(1, "Transport name is required"),
  placeId: z.string().min(1, "Place is required"),
  productId: z.string().min(1, "Product is required"),
  totalQuantity: z.string().min(1, "Total quantity is required"),
  freight: z.string().min(1, "Freight is required"),
  advance: z.string().optional(),
  otherExpenses: z.string().optional(),
  totalWeight: z.string().optional(),
  customFields: z.string().optional(),
});

const godownAwakFormSchema = z.object({
  linkedLotId: z.string().min(1, "Linked lot is required"),
  inGodown: z.string().min(1, "In godown quantity is required"),
  customFields: z.string().optional(),
});

const damageFormSchema = z.object({
  linkedLotId: z.string().min(1, "Linked lot is required"),
  qualityDamaged: z.string().min(1, "Quality damaged is required"),
  damagedQuantity: z.string().min(1, "Damaged quantity is required"),
  customFields: z.string().optional(),
});

const weightSlipFormSchema = z.object({
  linkedLotId: z.string().min(1, "Linked lot is required"),
  grossWeight: z.string().min(1, "Gross weight is required"),
  tareWeight: z.string().min(1, "Tare weight is required"),
  customFields: z.string().optional(),
});

export default function InventoryModule({ currentFY, onFYChange }: InventoryModuleProps) {
  const [activeTab, setActiveTab] = useState("lot-entry");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const { toast } = useToast();

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case "lot-entry": return <Plus className="h-4 w-4" />;
      case "godown-awak": return <Filter className="h-4 w-4" />;
      case "damage": return <Trash2 className="h-4 w-4" />;
      case "weight-slip": return <Save className="h-4 w-4" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  // Placeholder queries - will be implemented with actual API calls
  const { data: lots = [], isLoading: lotsLoading } = useQuery({
    queryKey: ['/api/inventory/lot-entry', currentFY],
    enabled: activeTab === 'lot-entry'
  });

  const { data: godownAwaks = [], isLoading: godownAwaksLoading } = useQuery({
    queryKey: ['/api/inventory/godown-awak', currentFY],
    enabled: activeTab === 'godown-awak'
  });

  const { data: damages = [], isLoading: damagesLoading } = useQuery({
    queryKey: ['/api/inventory/damage', currentFY],
    enabled: activeTab === 'damage'
  });

  const { data: weightSlips = [], isLoading: weightSlipsLoading } = useQuery({
    queryKey: ['/api/inventory/weight-slip', currentFY],
    enabled: activeTab === 'weight-slip'
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handleAdd();
            break;
          case 'e':
            e.preventDefault();
            // Handle edit for selected item
            break;
          case 'd':
            e.preventDefault();
            // Handle delete for selected item
            break;
          case 's':
            e.preventDefault();
            // Handle save
            break;
          case 'p':
            e.preventDefault();
            handlePrint();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [activeTab]);

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

  const handlePrint = () => {
    // Print functionality with PDF generation
    toast({
      title: "Print",
      description: "Print functionality will be implemented",
    });
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "lot-entry": return lots;
      case "godown-awak": return godownAwaks;
      case "damage": return damages;
      case "weight-slip": return weightSlips;
      default: return [];
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case "lot-entry": return lotsLoading;
      case "godown-awak": return godownAwaksLoading;
      case "damage": return damagesLoading;
      case "weight-slip": return weightSlipsLoading;
      default: return false;
    }
  };

  const getTableColumns = () => {
    switch (activeTab) {
      case "lot-entry":
        return [
          { key: "lotId", label: "Lot ID", width: "w-32" },
          { key: "arrivingDate", label: "Date", width: "w-24" },
          { key: "transportName", label: "Transport", width: "w-32" },
          { key: "totalQuantity", label: "Quantity", width: "w-24" },
          { key: "totalWeight", label: "Weight", width: "w-24" },
          { key: "actions", label: "Actions", width: "w-32" },
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
          <div className="text-lg mb-2">No {activeTab.replace('-', ' ')} records found</div>
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-display text-primary flex items-center gap-2">
                <Filter className="h-6 w-6" />
                Inventory Module
              </CardTitle>
              <p className="text-muted-foreground">
                Manage lot entries, godown awak, damage records, and weight slips for FY {currentFY}
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
                placeholder="Search inventory records..."
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-inventory">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lot-entry" className="flex items-center space-x-2" data-testid="tab-lot-entry">
            {getTabIcon("lot-entry")}
            <span>Lot Entry</span>
          </TabsTrigger>
          <TabsTrigger value="godown-awak" className="flex items-center space-x-2" data-testid="tab-godown-awak">
            {getTabIcon("godown-awak")}
            <span>Godown Awak</span>
          </TabsTrigger>
          <TabsTrigger value="damage" className="flex items-center space-x-2" data-testid="tab-damage">
            {getTabIcon("damage")}
            <span>Damage</span>
          </TabsTrigger>
          <TabsTrigger value="weight-slip" className="flex items-center space-x-2" data-testid="tab-weight-slip">
            {getTabIcon("weight-slip")}
            <span>Weight Slip</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lot-entry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lot Entry Records</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTableView()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="godown-awak" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Godown Awak Records</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTableView()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="damage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Damage Records</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTableView()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weight-slip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weight Slip Records</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTableView()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog - Full Screen */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"} {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? `Update the ${activeTab.replace('-', ' ')} information below.`
                : `Enter the details to create a new ${activeTab.replace('-', ' ')}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">Form fields will be implemented based on the selected tab</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {activeTab.replace('-', ' ')}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="button-confirm-delete">
              Delete
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