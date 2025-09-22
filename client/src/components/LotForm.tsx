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
import { Plus, X, Minus, ChevronDown, Calculator, Truck, User, Package, Check, ChevronsUpDown } from "lucide-react";

// Form validation schema
const lotSubFieldSchema = z.object({
  accountId: z.string().min(1, "Farmer account is required"),
  quantity: z.string().min(1, "Quantity is required").refine(val => Number(val) > 0, "Quantity must be greater than 0"),
  quality: z.string().optional(),
  averageRate: z.string().optional(),
});

const lotFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  totalQuantity: z.string().min(1, "Total quantity is required").refine(val => Number(val) > 0, "Total quantity must be greater than 0"),
  totalWeight: z.string().optional(),
  freight: z.string().optional(),
  transportAccountId: z.string().optional(),
  vehicleNumber: z.string().optional(),
  advance: z.string().optional(),
  otherExpenses: z.string().optional(),
  financialYear: z.string(),
  subFields: z.array(lotSubFieldSchema).min(1, "At least one farmer lot is required"),
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

  // Fetch master data
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', currentFY],
    queryFn: () => fetch(`/api/products?fy=${currentFY}`).then(res => res.json()),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['/api/accounts', currentFY],
    queryFn: () => fetch(`/api/accounts?fy=${currentFY}`).then(res => res.json()),
  });

  // Filter accounts by type
  const farmers = accounts.filter((acc: any) => acc.type === 'F');
  const transporters = accounts.filter((acc: any) => acc.type === 'A' || acc.type === 'B'); // Include Agents and Buyers as transporters

  const form = useForm<LotFormData>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: {
      productId: initialData?.productId || "",
      totalQuantity: initialData?.totalQuantity || "",
      totalWeight: initialData?.totalWeight || "",
      freight: initialData?.freight || "",
      transportAccountId: initialData?.transportAccountId || "",
      vehicleNumber: initialData?.vehicleNumber || "",
      advance: initialData?.advance || "",
      otherExpenses: initialData?.otherExpenses || "",
      financialYear: currentFY,
      subFields: initialData?.subFields || [{ accountId: "", quantity: "", quality: "", averageRate: "" }],
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
    farmerQuantity: subFields.reduce((sum, field) => sum + (Number(field.quantity) || 0), 0),
    averageWeight: totalWeight && totalQuantity ? (Number(totalWeight) / Number(totalQuantity)).toFixed(2) : "0.00",
    totalFreight: freight ? Number(freight) : 0,
  };

  // Calculate sub-field values
  const enhancedSubFields = subFields.map((field, index) => {
    const quantity = Number(field.quantity) || 0;
    const weight = calculations.averageWeight ? (Number(calculations.averageWeight) * quantity).toFixed(2) : "0.00";
    const fieldFreight = calculations.totalFreight && totalQuantity ? 
      ((calculations.totalFreight / Number(totalQuantity)) * quantity).toFixed(2) : "0.00";
    
    return {
      ...field,
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
          totalQuantity: data.totalQuantity,
          totalWeight: data.totalWeight || null,
          freight: data.freight || null,
          transportAccountId: data.transportAccountId || null,
          vehicleNumber: data.vehicleNumber || null,
          advance: data.advance || null,
          otherExpenses: data.otherExpenses || null,
          financialYear: data.financialYear,
        },
        subFields: data.subFields.map(field => ({
          accountId: field.accountId,
          quantity: field.quantity,
          quality: field.quality || null,
          averageRate: field.averageRate || null,
        })),
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
    append({ accountId: "", quantity: "", quality: "", averageRate: "" });
  };

  const removeSubField = (index: number) => {
    if (fields.length > 1) {
      remove(index);
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
              
              {/* Basic Lot Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product: any) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.unit})
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
                                      ? "No transport accounts found. Please create Agent or Buyer accounts first."
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
                                            {account.accountId} • {account.type === 'A' ? 'Agent' : 'Buyer'}
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

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="relative">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`subFields.${index}.accountId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Farmer Account *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid={`select-farmer-${index}`}>
                                      <SelectValue placeholder="Select farmer" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {farmers.map((farmer: any) => (
                                      <SelectItem key={farmer.id} value={farmer.id}>
                                        {farmer.name} ({farmer.accountId})
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
                            name={`subFields.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Enter quantity"
                                    data-testid={`input-quantity-${index}`}
                                    {...field}
                                  />
                                </FormControl>
                                {enhancedSubFields[index]?.calculatedWeight && (
                                  <p className="text-xs text-muted-foreground">
                                    Weight: {enhancedSubFields[index].calculatedWeight} kg
                                  </p>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`subFields.${index}.quality`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quality</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid={`select-quality-${index}`}>
                                      <SelectValue placeholder="Select quality" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="A">Grade A</SelectItem>
                                    <SelectItem value="B">Grade B</SelectItem>
                                    <SelectItem value="C">Grade C</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`subFields.${index}.averageRate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Average Rate (₹)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Enter rate"
                                    data-testid={`input-rate-${index}`}
                                    {...field}
                                  />
                                </FormControl>
                                {enhancedSubFields[index]?.calculatedFreight && (
                                  <p className="text-xs text-muted-foreground">
                                    Freight: ₹{enhancedSubFields[index].calculatedFreight}
                                  </p>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => removeSubField(index)}
                            data-testid={`button-remove-subfield-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
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