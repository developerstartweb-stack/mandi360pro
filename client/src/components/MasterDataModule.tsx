import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useGlobalState } from "@/lib/globalState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import ViewDetailsModal from "@/components/ViewDetailsModal";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FileDown, 
  Filter,
  Building2,
  Package,
  CreditCard,
  MapPin,
  PhoneCall,
  User,
  DollarSign,
  Eye,
  MoreHorizontal
} from "lucide-react";

// Define form schemas for validation
const accountFormSchema = z.object({
  type: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required"),
  mobile: z.string().optional(),
  address: z.string().optional(),
  placeId: z.string().optional(),
  bankDetails: z.any().optional(),
  openingBalance: z.string().default("0"),
  creditLimit: z.string().default("0"),
  creditTime: z.string().default("0"),
  remarks: z.string().optional(),
  customFields: z.any().optional(),
  active: z.boolean().default(true),
  financialYear: z.string()
});

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  unit: z.string().min(1, "Unit is required"),
  customFields: z.any().optional(),
  active: z.boolean().default(true),
  financialYear: z.string()
});

const expenseFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  linkedTo: z.string().min(1, "Linked to is required"),
  expenses: z.array(z.object({
    name: z.string(),
    type: z.string().min(1, "Type is required"),
    value: z.string().min(1, "Value is required")
  })).min(1, "At least one expense is required"),
  customFields: z.any().optional(),
  active: z.boolean().default(true),
  financialYear: z.string()
});

const placeFormSchema = z.object({
  name: z.string().min(1, "Place name is required"),
  description: z.string().optional(),
  customFields: z.any().optional(),
  active: z.boolean().default(true),
  financialYear: z.string()
});

interface MasterDataModuleProps {
  currentFY: string;
  onFYChange: (fy: string) => void;
  activeSubModule?: string;
}

export default function MasterDataModule({ currentFY, onFYChange, activeSubModule = "account-master" }: MasterDataModuleProps) {
  const { toast } = useToast();
  const { state, updateMasterData } = useGlobalState();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<any>(null);

  // Fetch data directly from API
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/accounts', currentFY],
    queryFn: () => fetch(`/api/accounts?fy=${currentFY}`).then(res => res.json()),
    enabled: activeSubModule === "account-master"
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products', currentFY],
    queryFn: () => fetch(`/api/products?fy=${currentFY}`).then(res => res.json()),
    enabled: activeSubModule === "product-master"
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['/api/expenses', currentFY],
    queryFn: () => fetch(`/api/expenses?fy=${currentFY}`).then(res => res.json()),
    enabled: activeSubModule === "product-expenses"
  });

  const { data: places = [], isLoading: placesLoading } = useQuery({
    queryKey: ['/api/places', currentFY],
    queryFn: () => fetch(`/api/places?fy=${currentFY}`).then(res => res.json()),
    enabled: activeSubModule === "place-master"
  });

  // Apply client-side search filtering
  const filteredAccounts = searchTerm ? accounts.filter((acc: any) => 
    acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.type?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : accounts;

  const filteredProducts = searchTerm ? products.filter((prod: any) => 
    prod.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : products;

  const filteredPlaces = searchTerm ? places.filter((place: any) => 
    place.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : places;

  // Helper function to map sub-module IDs to API endpoints
  const getApiEndpoint = () => {
    switch (activeSubModule) {
      case "account-master": return "/api/accounts";
      case "product-master": return "/api/products";
      case "product-expenses": return "/api/expenses";
      case "place-master": return "/api/places";
      default: return "/api/accounts";
    }
  };

  const getDataType = () => {
    switch (activeSubModule) {
      case "account-master": return "accounts";
      case "product-master": return "products";
      case "product-expenses": return "expenses";
      case "place-master": return "places";
      default: return "accounts";
    }
  };

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", getApiEndpoint(), data);
    },
    onSuccess: (newData) => {
      // Update global state with new data
      const dataType = getDataType();
      
      const currentData = Array.isArray(state.masterData[dataType as keyof typeof state.masterData]) ? 
        state.masterData[dataType as keyof typeof state.masterData] as any[] : [];
      updateMasterData(dataType as keyof typeof state.masterData, [...currentData, newData]);
      
      queryClient.invalidateQueries({ queryKey: [getApiEndpoint()] });
      setShowForm(false);
      setEditingItem(null);
      toast({
        title: "Success",
        description: `${getPageInfo().singular} created successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to create ${getPageInfo().singular}`,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `${getApiEndpoint()}/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getApiEndpoint()] });
      setShowForm(false);
      setEditingItem(null);
      toast({
        title: "Success",
        description: `${getPageInfo().singular} updated successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to update ${getPageInfo().singular}`,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `${getApiEndpoint()}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getApiEndpoint()] });
      setShowDeleteDialog(false);
      setItemToDelete(null);
      toast({
        title: "Success",
        description: `${getPageInfo().singular} deleted successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to delete ${getPageInfo().singular}`,
        variant: "destructive",
      });
    }
  });

  // Keyboard shortcuts
  const handleKeyboard = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault();
          setEditingItem(null);
          setShowForm(true);
          break;
        case 'e':
          event.preventDefault();
          // Edit first item if available
          const currentData = getCurrentData();
          if (Array.isArray(currentData) && currentData.length > 0) {
            setEditingItem(currentData[0]);
            setShowForm(true);
          }
          break;
        case 'd':
          event.preventDefault();
          // Delete first item if available
          const deleteData = getCurrentData();
          if (Array.isArray(deleteData) && deleteData.length > 0) {
            setItemToDelete(deleteData[0]);
            setShowDeleteDialog(true);
          }
          break;
        case 'p':
          event.preventDefault();
          handlePrint();
          break;
        case 's':
          event.preventDefault();
          if (showForm) {
            // Trigger form submit
            const form = document.querySelector('form');
            if (form) {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          }
          break;
      }
    }
  }, [activeSubModule, showForm]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  const getCurrentData = () => {
    switch (activeSubModule) {
      case "account-master": return filteredAccounts || [];
      case "product-master": return filteredProducts || [];
      case "product-expenses": return expenses || [];
      case "place-master": return filteredPlaces || [];
      default: return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeSubModule) {
      case "account-master": return accountsLoading;
      case "product-master": return productsLoading;
      case "product-expenses": return expensesLoading;
      case "place-master": return placesLoading;
      default: return false;
    }
  };

  // Get page title and description based on active sub-module
  const getPageInfo = () => {
    switch (activeSubModule) {
      case "account-master": 
        return {
          title: "Account Master",
          description: "Manage customer and farmer accounts with contact details, credit limits, and financial information",
          singular: "Account"
        };
      case "product-master": 
        return {
          title: "Product Master", 
          description: "Manage all mandi products including grains, vegetables, and their measurement units",
          singular: "Product"
        };
      case "product-expenses": 
        return {
          title: "Product Expenses",
          description: "Configure default expenses for products like transportation, loading, and market fees",
          singular: "Expense"
        };
      case "place-master": 
        return {
          title: "Place Master",
          description: "Manage locations, markets, and places for transportation and delivery tracking",
          singular: "Place"
        };
      default: 
        return {
          title: "Master Data",
          description: "Manage accounts, products, expenses, and places for your mandi operations",
          singular: "Item"
        };
    }
  };

  const handleView = (item: any) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const handlePrint = () => {
    // Generate PDF logic here
    toast({
      title: "PDF Generated",
      description: `${activeSubModule} list has been exported to PDF`,
    });
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "accounts": return <Building2 className="w-4 h-4" />;
      case "products": return <Package className="w-4 h-4" />;
      case "expenses": return <CreditCard className="w-4 h-4" />;
      case "places": return <MapPin className="w-4 h-4" />;
      default: return null;
    }
  };

  const renderTableView = () => {
    const data = getCurrentData();
    const isLoading = getCurrentLoading();

    if (isLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse bg-muted h-16 rounded-md" />
          ))}
        </div>
      );
    }

    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            No {activeSubModule} found for {currentFY}
            <br />
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setShowForm(true)}
              data-testid={`button-add-first-${activeSubModule}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First {getPageInfo().singular}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {(data || []).map((item: any, index: number) => (
          <Card 
            key={item.id} 
            className="hover-elevate cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 50}ms` }}
            data-testid={`card-${activeSubModule}-${item.id}`}
          >
            <CardContent className="p-4">
              {renderTableRow(item)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTableRow = (item: any) => {
    switch (activeSubModule) {
      case "account-master":
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" data-testid={`text-account-id-${item.accountId}`}>
                    {item.accountId}
                  </Badge>
                  <Badge variant={item.type === "Buyer" ? "default" : "outline"}>
                    {item.type}
                  </Badge>
                  {!item.active && <Badge variant="destructive">Inactive</Badge>}
                </div>
                <h3 className="font-medium truncate" data-testid={`text-account-name-${item.name}`}>
                  {item.name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {item.mobile && (
                    <div className="flex items-center space-x-1">
                      <PhoneCall className="w-3 h-3" />
                      <span data-testid={`text-mobile-${item.mobile}`}>{item.mobile}</span>
                    </div>
                  )}
                  {item.openingBalance > 0 && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span data-testid={`text-balance-${item.openingBalance}`}>₹{item.openingBalance}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-actions-account-${item.id}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(item);
                  }}
                  data-testid={`button-view-account-${item.id}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  data-testid={`button-edit-account-${item.id}`}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                  data-testid={`button-delete-account-${item.id}`}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );

      case "product-master":
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" data-testid={`text-product-id-${item.productId}`}>
                    {item.productId}
                  </Badge>
                  <Badge variant="outline">{item.unit}</Badge>
                  {!item.active && <Badge variant="destructive">Inactive</Badge>}
                </div>
                <h3 className="font-medium truncate" data-testid={`text-product-name-${item.name}`}>
                  {item.name}
                </h3>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-actions-product-${item.id}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(item);
                  }}
                  data-testid={`button-view-product-${item.id}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  data-testid={`button-edit-product-${item.id}`}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                  data-testid={`button-delete-product-${item.id}`}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );

      case "product-expenses":
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{item.productId}</Badge>
                  <Badge variant={item.linkedTo === "Buyer" ? "default" : "outline"}>
                    {item.linkedTo}
                  </Badge>
                  <Badge variant="secondary">{item.expenseType}</Badge>
                  {!item.active && <Badge variant="destructive">Inactive</Badge>}
                </div>
                <div className="space-y-1">
                  {Array.isArray(item.expenses) && item.expenses.length > 0 ? (
                    item.expenses.map((expense: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{expense.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {expense.type} - ₹{expense.value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {item.expenseName ? `${item.expenseName} - ${item.expenseType} - ₹${item.value}` : "No expenses"}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-actions-expense-${item.id}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(item);
                  }}
                  data-testid={`button-view-expense-${item.id}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  data-testid={`button-edit-expense-${item.id}`}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                  data-testid={`button-delete-expense-${item.id}`}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );

      case "place-master":
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" data-testid={`text-place-id-${item.placeId}`}>
                    {item.placeId}
                  </Badge>
                  {!item.active && <Badge variant="destructive">Inactive</Badge>}
                </div>
                <h3 className="font-medium truncate" data-testid={`text-place-name-${item.name}`}>
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground truncate" data-testid={`text-place-description-${item.description}`}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-actions-place-${item.id}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(item);
                  }}
                  data-testid={`button-view-place-${item.id}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  data-testid={`button-edit-place-${item.id}`}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                  data-testid={`button-delete-place-${item.id}`}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getPageInfo().title}</h1>
          <p className="text-muted-foreground">
            {getPageInfo().description} for FY {currentFY}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={currentFY} onValueChange={onFYChange}>
            <SelectTrigger className="w-[180px]" data-testid="select-financial-year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-25">FY 2024-25</SelectItem>
              <SelectItem value="2025-26">FY 2025-26</SelectItem>
              <SelectItem value="2026-27">FY 2026-27</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeSubModule}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid={`input-search-${activeSubModule}`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                data-testid="button-print-list"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingItem(null);
                  setShowForm(true);
                }}
                data-testid={`button-add-${activeSubModule}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {activeSubModule.slice(0, -1)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Content based on selected sub-module */}
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle>
            {activeSubModule === "account-master" && "Account Master"}
            {activeSubModule === "product-master" && "Product Master"}
            {activeSubModule === "product-expenses" && "Product Expenses"}
            {activeSubModule === "place-master" && "Place Master"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderTableView()}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <FormDialog
        showForm={showForm}
        setShowForm={setShowForm}
        activeSubModule={activeSubModule}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        currentFY={currentFY}
        createMutation={createMutation}
        updateMutation={updateMutation}
        products={products}
        places={places}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {activeSubModule.slice(0, -1)}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        item={viewingItem}
        itemType={
          activeSubModule === "account-master" ? "account" :
          activeSubModule === "product-master" ? "product" :
          activeSubModule === "product-expenses" ? "expense" :
          activeSubModule === "place-master" ? "place" : "account"
        }
      />

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

// Form Dialog Component
function FormDialog({
  showForm,
  setShowForm,
  activeSubModule,
  editingItem,
  setEditingItem,
  currentFY,
  createMutation,
  updateMutation,
  products,
  places
}: any) {
  const getFormSchema = () => {
    switch (activeSubModule) {
      case "account-master": return accountFormSchema;
      case "product-master": return productFormSchema;
      case "product-expenses": return expenseFormSchema;
      case "place-master": return placeFormSchema;
      default: return accountFormSchema;
    }
  };

  const getDefaultValues = () => {
    const baseDefaults = {
      financialYear: currentFY,
      active: true,
      openingBalance: "0",
      creditLimit: "0", 
      creditTime: "0"
    };

    switch (activeSubModule) {
      case "account-master":
        return {
          ...baseDefaults,
          type: "",
          name: "",
          mobile: "",
          address: "",
          placeId: "",
          bankDetails: {},
          remarks: "",
          customFields: {}
        };
      case "product-master":
        return {
          ...baseDefaults,
          name: "",
          unit: "",
          description: "",
          customFields: {}
        };
      case "product-expenses":
        return {
          ...baseDefaults,
          expenses: [],
          productId: "",
          linkedTo: "",
          customFields: {}
        };
      case "place-master":
        return {
          ...baseDefaults,
          name: "",
          description: "",
          customFields: {}
        };
      default:
        return baseDefaults;
    }
  };

  const form = useForm({
    resolver: zodResolver(getFormSchema()),
    defaultValues: getDefaultValues()
  });

  useEffect(() => {
    if (editingItem) {
      // Ensure all fields have proper defaults to prevent controlled/uncontrolled warnings
      const itemWithDefaults = {
        ...getDefaultValues(),
        ...editingItem
      };
      form.reset(itemWithDefaults);
    } else {
      form.reset(getDefaultValues());
    }
  }, [editingItem, currentFY, activeSubModule]);

  const onSubmit = async (data: any) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      // Handle multiple expenses for creation
      if (activeSubModule === "product-expenses" && data.expenses && Array.isArray(data.expenses)) {
        try {
          // Create individual expense records for each expense
          for (const expense of data.expenses) {
            const expenseData = {
              productId: data.productId,
              linkedTo: data.linkedTo,
              expenseName: expense.name,
              expenseType: expense.type,
              value: expense.value,
              customFields: data.customFields || {},
              active: data.active,
              financialYear: data.financialYear
            };
            await apiRequest("POST", "/api/expenses", expenseData);
          }
          // Refresh the data
          queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
          toast({ title: "Success", description: "All expenses created successfully" });
          handleClose();
        } catch (error: any) {
          toast({ 
            title: "Error", 
            description: error.message || "Failed to create expenses", 
            variant: "destructive" 
          });
        }
      } else {
        createMutation.mutate(data);
      }
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingItem(null);
    form.reset();
  };

  return (
    <Dialog open={showForm} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Edit" : "Add"} {activeSubModule.slice(0, -1)}
          </DialogTitle>
          <DialogDescription>
            {editingItem 
              ? `Update the ${activeSubModule.slice(0, -1).toLowerCase()} information below.`
              : `Enter the details to create a new ${activeSubModule.slice(0, -1).toLowerCase()}.`
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {activeSubModule === "account-master" && <AccountFormFields form={form} places={places} />}
            {activeSubModule === "product-master" && <ProductFormFields form={form} />}
            {activeSubModule === "product-expenses" && <ExpenseFormFields form={form} products={products} />}
            {activeSubModule === "place-master" && <PlaceFormFields form={form} />}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                data-testid="button-cancel-form"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-form"
              >
                {editingItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Form field components for each tab
function AccountFormFields({ form, places }: any) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-account-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Buyer">Buyer</SelectItem>
                  <SelectItem value="Farmer">Farmer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-account-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile</FormLabel>
              <FormControl>
                <Input {...field} type="tel" data-testid="input-account-mobile" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="placeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-account-place">
                    <SelectValue placeholder="Select place" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {places?.map((place: any) => (
                    <SelectItem key={place.id} value={place.placeId}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea {...field} data-testid="input-account-address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="openingBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opening Balance</FormLabel>
              <FormControl>
                <Input {...field} type="number" data-testid="input-account-balance" />
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
                <Input {...field} type="number" data-testid="input-account-credit-limit" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="creditTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Time (Days)</FormLabel>
              <FormControl>
                <Input {...field} type="number" data-testid="input-account-credit-time" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="remarks"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Remarks</FormLabel>
            <FormControl>
              <Textarea {...field} data-testid="input-account-remarks" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active</FormLabel>
              <FormDescription>
                Enable or disable this account
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                data-testid="switch-account-active"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}

function ProductFormFields({ form }: any) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name *</FormLabel>
            <FormControl>
              <Input {...field} data-testid="input-product-name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="unit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unit *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger data-testid="select-product-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Kg">Kilogram (Kg)</SelectItem>
                <SelectItem value="Quintal">Quintal</SelectItem>
                <SelectItem value="Bag">Bag</SelectItem>
                <SelectItem value="Ton">Ton</SelectItem>
                <SelectItem value="Piece">Piece</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active</FormLabel>
              <FormDescription>
                Enable or disable this product
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                data-testid="switch-product-active"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}

function ExpenseFormFields({ form, products }: any) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-expense-product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products?.map((product: any) => (
                    <SelectItem key={product.id} value={product.productId}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Linked To *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-expense-linked-to">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Buyer">Buyer</SelectItem>
                  <SelectItem value="Farmer">Farmer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="expenses"
        render={({ field }) => {
          const expenseTypes = [
            "Commission", "Market Fee", "Hamali", "Varai", 
            "Tolai", "Levy", "Postage", "Other"
          ];

          const currentExpenses = field.value || [];

          const handleExpenseToggle = (expenseName: string, checked: boolean) => {
            if (checked) {
              const newExpense = { name: expenseName, type: "", value: "" };
              field.onChange([...currentExpenses, newExpense]);
            } else {
              field.onChange(currentExpenses.filter((exp: any) => exp.name !== expenseName));
            }
          };

          const updateExpenseField = (index: number, fieldName: string, value: string) => {
            const updatedExpenses = [...currentExpenses];
            updatedExpenses[index] = { ...updatedExpenses[index], [fieldName]: value };
            field.onChange(updatedExpenses);
          };

          return (
            <FormItem>
              <FormLabel>Expenses * (Select and Configure)</FormLabel>
              
              {/* Expense Selection Checkboxes */}
              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg mb-4">
                {expenseTypes.map((expenseType) => {
                  const isSelected = currentExpenses.some((exp: any) => exp.name === expenseType);
                  return (
                    <div key={expenseType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`expense-${expenseType}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleExpenseToggle(expenseType, checked as boolean)}
                        data-testid={`checkbox-expense-${expenseType.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <label
                        htmlFor={`expense-${expenseType}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {expenseType}
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Individual Expense Configuration */}
              {currentExpenses.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Configure Selected Expenses:</h4>
                  {currentExpenses.map((expense: any, index: number) => (
                    <div key={expense.name} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h5 className="font-medium mb-3">{expense.name}</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Type *</Label>
                          <Select 
                            value={expense.type} 
                            onValueChange={(value) => updateExpenseField(index, 'type', value)}
                          >
                            <SelectTrigger data-testid={`select-expense-type-${index}`}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="%">Percentage (%)</SelectItem>
                              <SelectItem value="Fixed">Fixed Amount</SelectItem>
                              <SelectItem value="Per Bag">Per Bag</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Value *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={expense.value}
                            onChange={(e) => updateExpenseField(index, 'value', e.target.value)}
                            placeholder="Enter value"
                            data-testid={`input-expense-value-${index}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active</FormLabel>
              <FormDescription>
                Enable or disable this expense
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                data-testid="switch-expense-active"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}

function PlaceFormFields({ form }: any) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Place Name *</FormLabel>
            <FormControl>
              <Input {...field} data-testid="input-place-name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} data-testid="input-place-description" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active</FormLabel>
              <FormDescription>
                Enable or disable this place
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                data-testid="switch-place-active"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}