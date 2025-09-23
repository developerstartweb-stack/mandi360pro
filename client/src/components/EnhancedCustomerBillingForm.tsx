import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calculator, Plus, Minus, RefreshCw, ChevronsUpDown, Check, MapPin, DollarSign, Users, User } from "lucide-react";

// Form schema for customer billing
const customerBillingSchema = z.object({
  customerAccountId: z.string().min(1, "Customer is required"),
  billDate: z.string().min(1, "Bill date is required"),
  billItems: z.array(z.object({
    lotId: z.string().min(1, "Lot is required"),
    farmerSubFieldId: z.string().min(1, "Farmer lot is required"),
    productId: z.string().optional(),
    productName: z.string().optional(),
    quality: z.string().optional(),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    weight: z.number().min(0.01, "Weight must be greater than 0"),
    rate: z.number().min(0.01, "Rate must be greater than 0"),
    total: z.number().optional(),
  })).min(1, "At least one product is required"),
  commission: z.number().min(0, "Commission cannot be negative"),
  marketFee: z.number().min(0, "Market fee cannot be negative"),
  hamali: z.number().min(0, "Hamali cannot be negative"),
  discountAmount: z.number().min(0, "Discount amount cannot be negative"),
  discountWeight: z.number().min(0, "Discount weight cannot be negative"),
  previousBalance: z.number(),
  remarks: z.string().optional(),
});

type CustomerBillingFormData = z.infer<typeof customerBillingSchema>;

interface EnhancedCustomerBillingFormProps {
  onSubmit: (data: CustomerBillingFormData) => void;
  initialData?: Partial<CustomerBillingFormData>;
}

export default function EnhancedCustomerBillingForm({ onSubmit, initialData }: EnhancedCustomerBillingFormProps) {
  const { toast } = useToast();
  const [availableLots, setAvailableLots] = useState<any[]>([]);
  const [lotSubFields, setLotSubFields] = useState<Record<string, any[]>>({});
  const [loadingRates, setLoadingRates] = useState<Set<number>>(new Set());

  // Form initialization
  const form = useForm<CustomerBillingFormData>({
    resolver: zodResolver(customerBillingSchema),
    defaultValues: {
      customerAccountId: "",
      billDate: new Date().toISOString().split('T')[0],
      billItems: [{
        lotId: "",
        farmerSubFieldId: "",
        productId: "",
        productName: "",
        quality: "",
        quantity: 0,
        weight: 0,
        rate: 0,
        total: 0,
      }],
      commission: 0,
      marketFee: 0,
      hamali: 0,
      discountAmount: 0,
      discountWeight: 0,
      previousBalance: 0,
      remarks: "",
      ...initialData,
    },
  });

  // Fetch data queries
  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const { data: lots = [] } = useQuery({
    queryKey: ["/api/inventory/lot-entry"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: places = [] } = useQuery({
    queryKey: ["/api/places"],
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses"],
  });

  // Watch form changes
  const billItems = form.watch('billItems');
  useEffect(() => {
    const lotsWithSubFields = billItems.map(item => {
      if (item.lotId) {
        const lot = lots.find((l: any) => l.id === item.lotId);
        return { ...item, lot, subFields: lot?.subFields || [] };
      }
      return item;
    });
    setAvailableLots(lotsWithSubFields);
  }, [billItems, lots]);

  // Fetch real farmer quality wise sub-fields from inventory
  const fetchLotSubFields = async (lotId: string) => {
    if (lotSubFields[lotId]) {
      return lotSubFields[lotId]; // Return cached data
    }

    try {
      const response = await fetch(`/api/inventory/lot-entry/${lotId}/sub-fields`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const subFields = await response.json();
      
      // Use real farmer quality data from backend - no synthetic fallback
      setLotSubFields(prev => ({ ...prev, [lotId]: subFields }));
      return subFields;
    } catch (error) {
      console.error('Error fetching lot sub-fields:', error);
      toast({
        title: "No Farmer Data",
        description: "No farmer quality breakdown found for this lot. Please ensure the lot has farmer sub-fields.",
        variant: "destructive",
      });
      return [];
    }
  };

  // Fetch average rate for product and quality
  const fetchAverageRate = async (productId: string, quality: string, itemIndex: number) => {
    setLoadingRates(prev => new Set(prev).add(itemIndex));
    
    try {
      const response = await fetch(`/api/analytics/average-rate?productId=${productId}&quality=${quality}`);
      if (response.ok) {
        const data = await response.json();
        if (data.averageRate) {
          form.setValue(`billItems.${itemIndex}.rate`, Number(data.averageRate));
          updateItemTotal(itemIndex);
        }
      }
    } catch (error) {
      console.error('Error fetching average rate:', error);
    } finally {
      setLoadingRates(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemIndex);
        return newSet;
      });
    }
  };

  // Auto-calculate commission, market fee, hamali based on product expenses with linkedTo "Buyer"
  const autoCalculateExpenses = async (productName: string) => {
    try {
      console.log('Auto-calculating expenses for product:', productName);
      console.log('Available expenses:', expenses);
      
      // Get the product code/ID from the product name (e.g., "Onion" -> "Onion-01")
      const product = (products as any[]).find((p: any) => p.name === productName);
      const productCode = product?.productId || `${productName}-01`;
      
      // Filter expenses for the specific product with linkedTo "Buyer"
      const productExpenses = (expenses as any[]).filter((exp: any) => 
        exp.productId === productCode && exp.linkedTo === 'Buyer' && exp.active === true
      );

      console.log('Filtered product expenses:', productExpenses);

      let commission = 0;
      let marketFee = 0;
      let hamali = 0;

      // Calculate expenses based on current bill items subtotal and quantities
      const currentSubtotal = billItems.reduce((sum, item) => sum + (item.weight * item.rate), 0);
      const totalQuantity = billItems.reduce((sum, item) => sum + item.quantity, 0);

      productExpenses.forEach((expense: any) => {
        let amount = 0;
        const expenseType = expense.expenseType;
        const expenseValue = Number(expense.value);
        
        if (expenseType === '%') {
          // Percentage of subtotal
          amount = (currentSubtotal * expenseValue) / 100;
        } else if (expenseType === 'Per Bag' || expenseType.toLowerCase().includes('bag') || expenseType.toLowerCase().includes('quantity')) {
          // Per quantity/bag
          amount = totalQuantity * expenseValue;
        } else {
          // Fixed amount
          amount = expenseValue;
        }

        // Map expense names to form fields
        const expenseName = expense.expenseName.toLowerCase();
        console.log(`Processing expense: ${expenseName}, type: ${expenseType}, value: ${expenseValue}, calculated amount: ${amount}`);
        
        if (expenseName.includes('commission')) {
          commission += amount;
        } else if (expenseName.includes('market') || expenseName.includes('fee')) {
          marketFee += amount;
        } else if (expenseName.includes('hamali') || expenseName.includes('loading') || expenseName.includes('labor')) {
          hamali += amount;
        }
      });

      console.log(`Calculated expenses - Commission: ${commission}, Market Fee: ${marketFee}, Hamali: ${hamali}`);

      // Update form values
      form.setValue('commission', commission);
      form.setValue('marketFee', marketFee);
      form.setValue('hamali', hamali);

      if (productExpenses.length > 0) {
        toast({
          title: "Expenses Auto-Calculated",
          description: `Updated commission (₹${commission.toFixed(2)}), market fee (₹${marketFee.toFixed(2)}), and hamali (₹${hamali.toFixed(2)}) based on product expenses.`,
        });
      }
    } catch (error) {
      console.error('Error auto-calculating expenses:', error);
      toast({
        title: "Auto-Calculation Failed",
        description: "Could not auto-calculate expenses. Please enter manually.",
        variant: "destructive",
      });
    }
  };

  // Add/Remove bill items
  const addBillItem = () => {
    const currentItems = form.getValues('billItems');
    form.setValue('billItems', [...currentItems, {
      lotId: "",
      farmerSubFieldId: "",
      productId: "",
      productName: "",
      quality: "",
      quantity: 0,
      weight: 0,
      rate: 0,
      total: 0,
    }]);
  };

  const removeBillItem = (index: number) => {
    const currentItems = form.getValues('billItems');
    if (currentItems.length > 1) {
      form.setValue('billItems', currentItems.filter((_, i) => i !== index));
    }
  };

  // Update calculations
  const updateItemTotal = (itemIndex: number) => {
    const items = form.getValues('billItems');
    const item = items[itemIndex];
    const total = item.weight * item.rate;
    form.setValue(`billItems.${itemIndex}.total`, total);
  };

  // Calculate totals (read-only version for display)
  const calculateTotals = () => {
    const items = form.getValues('billItems');
    const subtotal = items.reduce((sum, item) => sum + (item.weight * item.rate), 0);
    const expenses = form.getValues('commission') + form.getValues('marketFee') + form.getValues('hamali');
    const discounts = form.getValues('discountAmount') + (form.getValues('discountWeight') * items.reduce((sum, item) => sum + item.rate, 0) / items.length);
    const previousBalance = form.getValues('previousBalance');
    
    return {
      subtotal,
      expenses,
      discounts,
      grandTotal: subtotal + expenses - discounts + previousBalance,
    };
  };

  // Update all calculations when form changes
  const updateAllCalculations = () => {
    const items = form.getValues('billItems');
    
    // Update individual item totals using weight * rate
    items.forEach((item, index) => {
      const total = item.weight * item.rate;
      form.setValue(`billItems.${index}.total`, total);
    });
  };

  // Run calculations when relevant fields change
  useEffect(() => {
    updateAllCalculations();
  }, [billItems]);

  const totals = calculateTotals();
  const { subtotal, expenses: totalExpenses, discounts, grandTotal } = totals;

  const handleSubmit = (data: CustomerBillingFormData) => {
    updateAllCalculations();
    onSubmit(data);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          
          {/* Customer and Date Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                            data-testid="select-customer"
                          >
                            {field.value
                              ? accounts.find((acc: any) => acc.id === field.value)?.name || "Select customer"
                              : "Select customer"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search customers..." />
                          <CommandList>
                            <CommandEmpty>No customers found.</CommandEmpty>
                            <CommandGroup>
                              {accounts.filter((acc: any) => acc.type === 'Buyer').map((account: any) => (
                                <CommandItem
                                  key={account.id}
                                  value={`${account.name} ${account.accountId}`}
                                  onSelect={() => field.onChange(account.id)}
                                  data-testid={`option-customer-${account.id}`}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      account.id === field.value ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{account.name}</span>
                                    <span className="text-xs text-muted-foreground">{account.accountId}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="billDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        data-testid="input-bill-date"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Lot Selection Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Lot Selection
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addBillItem}
                  data-testid="button-add-product"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {billItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lot Selection */}
                    <FormField
                      control={form.control}
                      name={`billItems.${index}.lotId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Lot *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                                  data-testid={`select-lot-${index}`}
                                >
                                  {field.value ? (() => {
                                    const lot = lots.find((l: any) => l.id === field.value);
                                    const product = products.find((p: any) => p.id === lot?.productId);
                                    return `${lot?.lotId || `Lot-${lot?.id.slice(-6)}`} - ${product?.name}`;
                                  })() : "Select lot"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search lots..." />
                                <CommandList>
                                  <CommandEmpty>No lots found.</CommandEmpty>
                                  <CommandGroup>
                                    {lots.map((lot: any) => {
                                      const product = products.find((p: any) => p.id === lot.productId);
                                      return (
                                        <CommandItem
                                          key={lot.id}
                                          value={`${lot.lotId} ${product?.name} ${lot.totalQuantity}`}
                                          onSelect={async () => {
                                            field.onChange(lot.id);
                                            await fetchLotSubFields(lot.id);
                                            // Auto-populate product info from lot
                                            if (lot) {
                                              form.setValue(`billItems.${index}.productId`, lot.productId);
                                              form.setValue(`billItems.${index}.productName`, product?.name || '');
                                            }
                                            // Auto-calculate expenses based on product
                                            if (product?.name) {
                                              await autoCalculateExpenses(product.name);
                                            }
                                          }}
                                          data-testid={`option-lot-${lot.id}`}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${
                                              lot.id === field.value ? "opacity-100" : "opacity-0"
                                            }`}
                                          />
                                          <div className="flex flex-col">
                                            <span className="font-medium">{lot.lotId || `Lot-${lot.id.slice(-6)}`}</span>
                                            <span className="text-xs text-muted-foreground">
                                              {product?.name || 'Unknown Product'} • Total Qty: {Number(lot.totalQuantity).toLocaleString()}
                                            </span>
                                          </div>
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Farmer Sub-Field Selection */}
                    <FormField
                      control={form.control}
                      name={`billItems.${index}.farmerSubFieldId`}
                      render={({ field }) => {
                        const subFields = item.lotId ? lotSubFields[item.lotId] || [] : [];
                        return (
                          <FormItem>
                            <FormLabel>Select Farmer Lot *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                                    data-testid={`select-farmer-lot-${index}`}
                                  >
                                    {field.value ? (() => {
                                      const selectedSubField = subFields.find((sf: any) => sf.id === field.value);
                                      if (selectedSubField) {
                                        return `${selectedSubField.farmerName} - ${selectedSubField.quality}`;
                                      }
                                      return "Select farmer lot";
                                    })() : "Select farmer lot"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search farmer lots..." />
                                  <CommandList>
                                    <CommandEmpty>No farmer lots found.</CommandEmpty>
                                    <CommandGroup>
                                      {subFields.map((subField: any) => (
                                        <CommandItem
                                          key={subField.id}
                                          value={`${subField.farmerName} ${subField.quality} ${subField.availableQuantity}`}
                                          onSelect={() => {
                                            field.onChange(subField.id);
                                            // Auto-fill form fields from selected farmer lot
                                            form.setValue(`billItems.${index}.quality`, subField.quality);
                                            form.setValue(`billItems.${index}.productId`, subField.productId);
                                            form.setValue(`billItems.${index}.productName`, subField.productName);
                                            
                                            // Set quantity and weight from available stock
                                            form.setValue(`billItems.${index}.quantity`, Number(subField.availableQuantity || subField.quantity));
                                            form.setValue(`billItems.${index}.weight`, Number(subField.availableWeight || subField.weight || subField.availableQuantity));
                                            
                                            // Set rate from sub-field or fetch if needed
                                            if (subField.averageRate) {
                                              form.setValue(`billItems.${index}.rate`, Number(subField.averageRate));
                                            } else if (subField.productId && subField.quality) {
                                              fetchAverageRate(subField.productId, subField.quality, index);
                                            }
                                          }}
                                          data-testid={`option-farmer-lot-${subField.id}`}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${
                                              subField.id === field.value ? "opacity-100" : "opacity-0"
                                            }`}
                                          />
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {subField.farmerName} - {subField.quality}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              Avl Qty: {Number(subField.availableQuantity || subField.quantity).toLocaleString()} • 
                                              Avl Weight: {Number(subField.availableWeight || subField.weight || subField.quantity).toLocaleString()} kg
                                            </span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* Product Name Display */}
                  {item.productName && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Product:</span>
                        <Badge variant="secondary">{item.productName}</Badge>
                        {item.quality && (
                          <>
                            <span className="text-sm">•</span>
                            <Badge variant="outline">{item.quality}</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  {billItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeBillItem(index)}
                      data-testid={`button-remove-product-${index}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Product Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Product Details & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {billItems.map((item, index) => {
                const subFields = item.lotId ? lotSubFields[item.lotId] || [] : [];
                const selectedSubField = subFields.find((sf: any) => sf.id === item.farmerSubFieldId);
                
                if (!item.lotId || !item.farmerSubFieldId) {
                  return (
                    <div key={index} className="border rounded-lg p-4 bg-muted/10">
                      <p className="text-muted-foreground text-center">
                        Select lot and farmer lot to see product details
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">Item #{index + 1}</Badge>
                      <span className="text-sm font-medium">{item.productName}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{selectedSubField?.farmerName} - {item.quality}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Quantity */}
                      <FormField
                        control={form.control}
                        name={`billItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                data-testid={`input-quantity-${index}`}
                                {...field}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  const value = Number(e.target.value);
                                  // Auto-calculate weight if average weight is available
                                  const selectedLot = lots.find((l: any) => l.id === item.lotId);
                                  if (selectedLot?.averageWeight) {
                                    form.setValue(`billItems.${index}.weight`, value * Number(selectedLot.averageWeight));
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              Max: {Number(selectedSubField?.availableQuantity || 0).toLocaleString()}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Weight */}
                      <FormField
                        control={form.control}
                        name={`billItems.${index}.weight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                data-testid={`input-weight-${index}`}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              Max: {Number(selectedSubField?.availableWeight || 0).toLocaleString()} kg
                              {item.quantity > 0 && item.weight > 0 && (
                                <span> • Avg: {(item.weight / item.quantity).toFixed(2)} kg</span>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Rate */}
                      <FormField
                        control={form.control}
                        name={`billItems.${index}.rate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Rate (₹/kg) *
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={() => {
                                  if (item.productId && item.quality) {
                                    fetchAverageRate(item.productId, item.quality, index);
                                  } else {
                                    toast({
                                      title: "Missing Data",
                                      description: "Please select farmer lot first.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                disabled={loadingRates.has(index)}
                                data-testid={`button-refresh-rate-${index}`}
                              >
                                <RefreshCw className={`h-3 w-3 ${loadingRates.has(index) ? 'animate-spin' : ''}`} />
                              </Button>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                data-testid={`input-rate-${index}`}
                                disabled={loadingRates.has(index)}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Total */}
                      <div>
                        <Label>Total Amount</Label>
                        <div className="p-2 bg-primary/5 border rounded text-right font-medium">
                          ₹{(item.weight * item.rate).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.weight} kg × ₹{item.rate}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Expenses Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Expenses & Calculations
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        data-testid="input-commission"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
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
                    <FormLabel>Market Fee (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        data-testid="input-market-fee"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
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
                    <FormLabel>Hamali (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        data-testid="input-hamali"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="discountAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        data-testid="input-discount-amount"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Previous Balance & Remarks */}
          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <FormField
                control={form.control}
                name="previousBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Balance (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        data-testid="input-previous-balance"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter any remarks"
                        data-testid="input-remarks"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Expenses:</span>
                <span className="font-medium">₹{totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discounts:</span>
                <span className="font-medium">₹{discounts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Previous Balance:</span>
                <span className="font-medium">₹{form.watch('previousBalance').toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1"
              data-testid="button-submit-bill"
            >
              Generate Bill
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}