import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X, Minus, ChevronDown, Calculator, Truck, User, Package, Check, ChevronsUpDown, AlertCircle, RefreshCw } from "lucide-react";

// Form validation schema
const qualityQuantitySchema = z.object({
  quality: z.string().min(1, "Quality is required"),
  quantity: z.string().min(1, "Quantity is required").refine(val => Number(val) > 0, "Quantity must be greater than 0"),
  averageRate: z.string().optional(),
});

const lotSubFieldSchema = z.object({
  accountId: z.string().min(1, "Farmer account is required"),
  productId: z.string().optional(), // Optional, defaults to main product
  qualityQuantities: z.array(qualityQuantitySchema).min(1, "At least one quality-quantity pair is required"),
});

const lotFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  placeId: z.string().min(1, "Place is required"),
  arrivingDate: z.string().min(1, "Arriving date is required"),
  totalQuantity: z.string().min(1, "Total quantity is required").refine(val => Number(val) > 0, "Total quantity must be greater than 0"),
  totalWeight: z.string().optional(),
  freight: z.string().optional(),
  transportAccountId: z.string().optional(),
  vehicleNumber: z.string().optional(),
  advance: z.string().optional(),
  otherExpenses: z.string().optional(),
  financialYear: z.string(),
  subFields: z.array(lotSubFieldSchema).min(1, "At least one farmer lot is required"),
}).refine((data) => {
  const totalQty = Number(data.totalQuantity);
  const farmerQtySum = data.subFields.reduce((sum, field) => {
    return sum + field.qualityQuantities.reduce((qSum, qq) => qSum + Number(qq.quantity || 0), 0);
  }, 0);
  return Math.abs(totalQty - farmerQtySum) < 0.01;
}, {
  message: "Total quantity must equal the sum of all farmer quantities across all qualities",
  path: ["totalQuantity"]
});

type LotFormData = z.infer<typeof lotFormSchema>;

interface LotFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  initialData?: any;
  currentFY: string;
}

export default function LotForm({ onSubmit, onCancel, initialData, currentFY }: LotFormProps) {
  const { toast } = useToast();
  const [showCalculations, setShowCalculations] = useState(false);
  const [showTransportDetails, setShowTransportDetails] = useState(false);
  const [loadingRates, setLoadingRates] = useState<Set<string>>(new Set());

  // Fetch master data
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', currentFY],
    queryFn: () => fetch(`/api/products?fy=${currentFY}`).then(res => res.json()),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['/api/accounts', currentFY],
    queryFn: () => fetch(`/api/accounts?fy=${currentFY}`).then(res => res.json()),
  });

  const { data: places = [] } = useQuery({
    queryKey: ['/api/places', currentFY],
    queryFn: () => fetch(`/api/places?fy=${currentFY}`).then(res => res.json()),
  });

  // Filter accounts by type
  const farmers = accounts.filter((acc: any) => acc.type === 'F' || acc.type === 'Farmer');
  const transporters = accounts.filter((acc: any) => acc.type === 'T' || acc.type === 'Transport'); // Support both 'T' and 'Transport'

  // Function to fetch average rate
  const fetchAverageRate = async (productId: string, quality: string, rateKey: string, farmerIndex: number, qqIndex: number) => {
    if (!productId || !quality) return;
    
    setLoadingRates(prev => new Set(prev).add(rateKey));
    
    try {
      const response = await fetch(`/api/rates/average?productId=${productId}&quality=${quality}&financialYear=${currentFY}&days=30`);
      const data = await response.json();
      
      if (data.avgRate !== null) {
        form.setValue(`subFields.${farmerIndex}.qualityQuantities.${qqIndex}.averageRate`, data.avgRate.toString());
        toast({
          title: "Rate Updated",
          description: `Auto-populated rate: ₹${data.avgRate} (based on ${data.count} recent transactions)`,
        });
      } else {
        toast({
          title: "No Historical Data",
          description: "No recent sales data found for this product and quality combination.",
        });
      }
    } catch (error) {
      console.error('Error fetching rate:', error);
      toast({
        title: "Rate Fetch Failed",
        description: "Could not fetch historical rate. Please enter manually.",
        variant: "destructive",
      });
    } finally {
      setLoadingRates(prev => {
        const newSet = new Set(prev);
        newSet.delete(rateKey);
        return newSet;
      });
    }
  };

  const form = useForm<LotFormData>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: {
      productId: initialData?.productId || "",
      placeId: initialData?.placeId || "",
      arrivingDate: initialData?.arrivingDate || new Date().toISOString().split('T')[0],
      totalQuantity: initialData?.totalQuantity || "",
      totalWeight: initialData?.totalWeight || "",
      freight: initialData?.freight || "",
      transportAccountId: initialData?.transportAccountId || "",
      vehicleNumber: initialData?.vehicleNumber || "",
      advance: initialData?.advance || "",
      otherExpenses: initialData?.otherExpenses || "",
      financialYear: currentFY,
      subFields: initialData?.subFields || [{ 
        accountId: "", 
        productId: "",
        qualityQuantities: [{ quality: "", quantity: "", averageRate: "" }] 
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subFields"
  });

  // Watch form values for calculations
  const watchedValues = form.watch();
  const { totalQuantity, totalWeight, freight, subFields } = watchedValues;

  // Auto-calculations
  const calculations = {
    farmerQuantity: subFields.reduce((sum, field) => 
      sum + field.qualityQuantities.reduce((qSum, qq) => qSum + (Number(qq.quantity) || 0), 0), 0),
    averageWeight: totalWeight && totalQuantity ? (Number(totalWeight) / Number(totalQuantity)).toFixed(2) : "0.00",
    totalFreight: freight ? Number(freight) : 0,
  };

  // Calculate sub-field values
  const enhancedSubFields = subFields.map((field, index) => {
    const farmerTotalQuantity = field.qualityQuantities.reduce((sum, qq) => sum + (Number(qq.quantity) || 0), 0);
    const weight = calculations.averageWeight ? (Number(calculations.averageWeight) * farmerTotalQuantity).toFixed(2) : "0.00";
    const fieldFreight = calculations.totalFreight && totalQuantity ? 
      ((calculations.totalFreight / Number(totalQuantity)) * farmerTotalQuantity).toFixed(2) : "0.00";
    
    const enhancedQualityQuantities = field.qualityQuantities.map((qq, qqIndex) => {
      const quantity = Number(qq.quantity) || 0;
      const qqWeight = calculations.averageWeight ? (Number(calculations.averageWeight) * quantity).toFixed(2) : "0.00";
      const qqFreight = calculations.totalFreight && totalQuantity ? 
        ((calculations.totalFreight / Number(totalQuantity)) * quantity).toFixed(2) : "0.00";
      
      return {
        ...qq,
        calculatedWeight: qqWeight,
        calculatedFreight: qqFreight,
      };
    });
    
    return {
      ...field,
      farmerTotalQuantity,
      calculatedWeight: weight,
      calculatedFreight: fieldFreight,
    };
  });

  // Generate preview LotID
  const selectedProduct = products.find((p: any) => p.id === watchedValues.productId);
  const previewLotId = selectedProduct && totalQuantity && calculations.farmerQuantity > 0
    ? `${selectedProduct.name}${totalQuantity}-${calculations.farmerQuantity}-001`
    : "---";

  // Create lot mutation
  const createLotMutation = useMutation({
    mutationFn: async (data: LotFormData) => {
      const payload = {
        lot: {
          productId: data.productId,
          placeId: data.placeId,
          arrivingDate: data.arrivingDate,
          totalQuantity: data.totalQuantity,
          totalWeight: data.totalWeight || null,
          freight: data.freight || null,
          transportAccountId: data.transportAccountId || null,
          vehicleNumber: data.vehicleNumber || null,
          advance: data.advance || null,
          otherExpenses: data.otherExpenses || null,
          financialYear: data.financialYear,
        },
        subFields: data.subFields.flatMap(field => 
          field.qualityQuantities.map(qq => ({
            farmerAgentId: field.accountId,
            productId: field.productId || data.productId, // Use farmer's product or main product as fallback
            quantity: qq.quantity,
            quality: qq.quality || null,
            averageRate: qq.averageRate || null,
          }))
        ),
      };
      
      return apiRequest("POST", "/api/inventory/lot-entry/with-sub-fields", payload);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/lot-entry', currentFY] });
      toast({
        title: "Success",
        description: `Lot created successfully with ID: ${data?.lot?.lotId || 'New Lot'}`,
      });
      onSubmit?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create lot",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: LotFormData) => {
    createLotMutation.mutate(data);
  };

  const addSubField = () => {
    append({ 
      accountId: "", 
      productId: "", // Will default to main product
      qualityQuantities: [{ quality: "", quantity: "", averageRate: "" }] 
    });
  };

  const removeSubField = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const addQualityQuantity = (farmerIndex: number) => {
    const currentSubFields = form.getValues('subFields');
    const updatedSubFields = [...currentSubFields];
    updatedSubFields[farmerIndex].qualityQuantities.push({ quality: "", quantity: "", averageRate: "" });
    form.setValue('subFields', updatedSubFields);
  };

  const removeQualityQuantity = (farmerIndex: number, qqIndex: number) => {
    const currentSubFields = form.getValues('subFields');
    const updatedSubFields = [...currentSubFields];
    if (updatedSubFields[farmerIndex].qualityQuantities.length > 1) {
      updatedSubFields[farmerIndex].qualityQuantities.splice(qqIndex, 1);
      form.setValue('subFields', updatedSubFields);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Create New Lot Entry
            </CardTitle>
            <Badge variant="outline" className="font-mono">
              ID: {previewLotId}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              {/* Arriving Date - Top Priority */}
              <FormField
                control={form.control}
                name="arrivingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arriving Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        data-testid="input-arriving-date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Basic Lot Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                              data-testid="select-product"
                            >
                              {field.value
                                ? products.find((product: any) => product.id === field.value)?.name || "Select product"
                                : "Select product"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search products..." />
                            <CommandList>
                              <CommandEmpty>
                                {products.length === 0 
                                  ? "No products found. Please create products in Product Master first."
                                  : "No products match your search."
                                }
                              </CommandEmpty>
                              <CommandGroup>
                                {products.map((product: any) => (
                                  <CommandItem
                                    key={product.id}
                                    value={`${product.name} ${product.unit}`}
                                    onSelect={() => {
                                      field.onChange(product.id);
                                    }}
                                    data-testid={`option-product-${product.id}`}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        product.id === field.value ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{product.name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        Unit: {product.unit}
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
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter total quantity"
                          data-testid="input-total-quantity"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Weight (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter total weight"
                          data-testid="input-total-weight"
                          {...field}
                        />
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
                      <FormLabel>Place *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-place">
                            <SelectValue placeholder="Select place" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {places.map((place: any) => (
                            <SelectItem key={place.id} value={place.id}>
                              {place.placeName}
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
                  name="freight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Freight (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter freight amount"
                          data-testid="input-freight"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Transport Details (Collapsible) */}
              <Collapsible open={showTransportDetails} onOpenChange={setShowTransportDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Transport Details
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showTransportDetails ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="transportAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transport Account</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                                  data-testid="select-transport"
                                >
                                  {field.value
                                    ? transporters.find((account: any) => account.id === field.value)?.name || "Select transport account"
                                    : "Select transport account"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search transport accounts..." />
                                <CommandList>
                                  <CommandEmpty>
                                    {transporters.length === 0 
                                      ? "No transport accounts found. Please create Transport type accounts in Account Master first."
                                      : "No accounts match your search."
                                    }
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {transporters.map((account: any) => (
                                      <CommandItem
                                        key={account.id}
                                        value={`${account.name} ${account.accountId}`}
                                        onSelect={() => {
                                          field.onChange(account.id);
                                        }}
                                        data-testid={`option-transport-${account.id}`}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            account.id === field.value ? "opacity-100" : "opacity-0"
                                          }`}
                                        />
                                        <div className="flex flex-col">
                                          <span className="font-medium">{account.name}</span>
                                          <span className="text-sm text-muted-foreground">
                                            {account.accountId} • Transport
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
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter vehicle number"
                              data-testid="input-vehicle-number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="advance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advance (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter advance amount"
                              data-testid="input-advance"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="otherExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Expenses (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter other expenses"
                              data-testid="input-other-expenses"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Farmer Lot Sub-Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Farmer Lots
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubField}
                    data-testid="button-add-subfield"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Farmer
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, farmerIndex) => (
                    <Card key={field.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Farmer {farmerIndex + 1}</span>
                          </div>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSubField(farmerIndex)}
                              data-testid={`button-remove-farmer-${farmerIndex}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Farmer Account and Product Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`subFields.${farmerIndex}.accountId`}
                            render={({ field: accountField }) => (
                              <FormItem>
                                <FormLabel>Farmer Account *</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={`w-full justify-between ${!accountField.value && "text-muted-foreground"}`}
                                        data-testid={`select-farmer-${farmerIndex}`}
                                      >
                                        {accountField.value
                                          ? farmers.find((farmer: any) => farmer.id === accountField.value)?.name || "Select farmer"
                                          : "Select farmer"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Search farmers..." />
                                      <CommandList>
                                        <CommandEmpty>
                                          {farmers.length === 0 
                                            ? "No farmer accounts found. Please create Farmer type accounts in Account Master first."
                                            : "No farmers match your search."
                                          }
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {farmers.map((farmer: any) => (
                                            <CommandItem
                                              key={farmer.id}
                                              value={`${farmer.name} ${farmer.accountId}`}
                                              onSelect={() => {
                                                accountField.onChange(farmer.id);
                                              }}
                                              data-testid={`option-farmer-${farmer.id}`}
                                            >
                                              <Check
                                                className={`mr-2 h-4 w-4 ${
                                                  farmer.id === accountField.value ? "opacity-100" : "opacity-0"
                                                }`}
                                              />
                                              <div className="flex flex-col">
                                                <span className="font-medium">{farmer.name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                  {farmer.accountId} • Farmer
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
                            )}
                          />

                          {/* Product Selection for Farmer Lot */}
                          <FormField
                            control={form.control}
                            name={`subFields.${farmerIndex}.productId`}
                            render={({ field: productField }) => {
                              // Auto-default to main product if not set
                              const effectiveProductId = productField.value || watchedValues.productId;
                              const effectiveProduct = products.find((p: any) => p.id === effectiveProductId);
                              
                              return (
                                <FormItem>
                                  <FormLabel>Product</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={`w-full justify-between ${!effectiveProductId && "text-muted-foreground"}`}
                                          data-testid={`select-farmer-product-${farmerIndex}`}
                                        >
                                          {effectiveProduct?.name || "Select product"}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Search products..." />
                                        <CommandList>
                                          <CommandEmpty>
                                            {products.length === 0 
                                              ? "No products found."
                                              : "No products match your search."
                                            }
                                          </CommandEmpty>
                                          <CommandGroup>
                                            {products.map((product: any) => (
                                              <CommandItem
                                                key={product.id}
                                                value={`${product.name} ${product.unit}`}
                                                onSelect={() => {
                                                  productField.onChange(product.id);
                                                }}
                                                data-testid={`option-farmer-product-${product.id}`}
                                              >
                                                <Check
                                                  className={`mr-2 h-4 w-4 ${
                                                    product.id === effectiveProductId ? "opacity-100" : "opacity-0"
                                                  }`}
                                                />
                                                <div className="flex flex-col">
                                                  <span className="font-medium">{product.name}</span>
                                                  <span className="text-sm text-muted-foreground">
                                                    Unit: {product.unit}
                                                  </span>
                                                </div>
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <p className="text-xs text-muted-foreground">
                                    {!productField.value ? "Inherited from main lot" : "Custom selection"}
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Quality-Quantity Pairs */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Quality & Quantity Details</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addQualityQuantity(farmerIndex)}
                              data-testid={`button-add-quality-quantity-${farmerIndex}`}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Quality
                            </Button>
                          </div>

                          {field.qualityQuantities?.map((qq: any, qqIndex: number) => (
                            <div key={qqIndex} className="border rounded-lg p-3 relative">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`subFields.${farmerIndex}.qualityQuantities.${qqIndex}.quality`}
                                  render={({ field: qualityField }) => (
                                    <FormItem>
                                      <FormLabel>Quality *</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter quality (e.g., A, B, C, Grade-1)"
                                          data-testid={`input-quality-${farmerIndex}-${qqIndex}`}
                                          {...qualityField}
                                          onChange={(e) => {
                                            qualityField.onChange(e.target.value);
                                            // Auto-fetch rate when quality is entered
                                            const productId = form.getValues('productId');
                                            if (productId && e.target.value.length > 0) {
                                              const rateKey = `${farmerIndex}-${qqIndex}`;
                                              fetchAverageRate(productId, e.target.value, rateKey, farmerIndex, qqIndex);
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`subFields.${farmerIndex}.qualityQuantities.${qqIndex}.quantity`}
                                  render={({ field: quantityField }) => (
                                    <FormItem>
                                      <FormLabel>Quantity *</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Enter quantity"
                                          data-testid={`input-quantity-${farmerIndex}-${qqIndex}`}
                                          {...quantityField}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`subFields.${farmerIndex}.qualityQuantities.${qqIndex}.averageRate`}
                                  render={({ field: rateField }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        Rate (₹)
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 w-5 p-0"
                                          onClick={() => {
                                            const productId = form.getValues('productId');
                                            const quality = form.getValues(`subFields.${farmerIndex}.qualityQuantities.${qqIndex}.quality`);
                                            if (productId && quality) {
                                              const rateKey = `${farmerIndex}-${qqIndex}`;
                                              fetchAverageRate(productId, quality, rateKey, farmerIndex, qqIndex);
                                            } else {
                                              toast({
                                                title: "Missing Data",
                                                description: "Please select product and quality first.",
                                                variant: "destructive",
                                              });
                                            }
                                          }}
                                          data-testid={`button-refresh-rate-${farmerIndex}-${qqIndex}`}
                                        >
                                          <RefreshCw className="h-3 w-3" />
                                        </Button>
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Enter rate"
                                          data-testid={`input-rate-${farmerIndex}-${qqIndex}`}
                                          {...rateField}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {field.qualityQuantities?.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0"
                                  onClick={() => removeQualityQuantity(farmerIndex, qqIndex)}
                                  data-testid={`button-remove-quality-quantity-${farmerIndex}-${qqIndex}`}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Farmer Total Summary */}
                        {enhancedSubFields[farmerIndex] && (
                          <div className="mt-3 p-2 bg-muted/50 rounded text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Farmer Total Quantity:</span>
                              <span className="font-medium">{enhancedSubFields[farmerIndex].farmerTotalQuantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Calculated Weight:</span>
                              <span className="font-medium">{enhancedSubFields[farmerIndex].calculatedWeight} kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Calculated Freight:</span>
                              <span className="font-medium">₹{enhancedSubFields[farmerIndex].calculatedFreight}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Auto-calculations Display */}
              <Collapsible open={showCalculations} onOpenChange={setShowCalculations}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Auto-Calculations Summary
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showCalculations ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">Total Quantity</p>
                      <p className="text-2xl font-bold">{totalQuantity || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Farmer Quantity</p>
                      <p className="text-2xl font-bold">{calculations.farmerQuantity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Average Weight</p>
                      <p className="text-2xl font-bold">{calculations.averageWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Freight</p>
                      <p className="text-2xl font-bold">₹{calculations.totalFreight}</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createLotMutation.isPending}
                  data-testid="button-submit"
                >
                  {createLotMutation.isPending ? "Creating..." : "Create Lot"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}