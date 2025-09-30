import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Search, Printer, ExternalLink } from "lucide-react";
import { format, parseISO, isValid as isValidDate, parse } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AccountMaster } from "@shared/schema";

const paymentReceiptSchema = z.object({
  receiptDate: z.date(),
  receiptType: z.enum(["balance", "khata", "farmer", "transport", "other"]),
  accountId: z.string().min(1, "Customer is required"),
  amountReceived: z.number().min(0, "Amount must be positive"),
  discount: z.number().min(0, "Discount cannot be negative").default(0),
  paymentMode: z.string().min(1, "Payment mode is required"),
  paymentDetails: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentReceiptFormData = z.infer<typeof paymentReceiptSchema>;

interface PaymentReceiptFormProps {
  onSubmit: (data: PaymentReceiptFormData) => void;
  initialData?: Partial<PaymentReceiptFormData>;
}

export function PaymentReceiptForm({ onSubmit, initialData }: PaymentReceiptFormProps) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<AccountMaster | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // Fetch accounts
  const { data: accounts = [] } = useQuery<AccountMaster[]>({
    queryKey: ["/api/accounts"],
  });

  // Helper to safely parse dates
  const safeDateParse = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date && isValidDate(dateValue)) return dateValue;
    
    if (typeof dateValue === 'string') {
      // Try parseISO first for ISO date strings
      try {
        const parsed = parseISO(dateValue);
        if (isValidDate(parsed)) {
          return parsed;
        }
      } catch (e) {
        // If parseISO fails, continue to next method
      }
      
      // Try parsing legacy format "yyyy-MM-dd HH:mm:ss"
      try {
        const parsed = parse(dateValue, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (isValidDate(parsed)) {
          return parsed;
        }
      } catch (e) {
        // If legacy format fails, continue to next method
      }
      
      // Fallback to Date constructor
      try {
        const parsed = new Date(dateValue);
        if (isValidDate(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse date with all methods:', dateValue, e);
      }
    }
    
    // If all parsing fails, return current date as fallback
    console.warn('Using fallback date for invalid value:', dateValue);
    return new Date();
  };

  // Normalize initial data
  const normalizedInitialData = initialData ? {
    ...initialData,
    receiptDate: safeDateParse(initialData.receiptDate),
    amountReceived: Number(initialData.amountReceived) || 0,
    discount: Number(initialData.discount) || 0,
  } : {
    receiptDate: new Date(),
    receiptType: "balance" as const,
    accountId: "",
    amountReceived: 0,
    discount: 0,
    paymentMode: "cash",
    paymentDetails: "",
    notes: "",
  };

  const form = useForm<PaymentReceiptFormData>({
    resolver: zodResolver(paymentReceiptSchema),
    defaultValues: normalizedInitialData,
  });

  const receiptType = form.watch("receiptType");
  const amountReceived = form.watch("amountReceived");
  const discount = form.watch("discount");

  // Reset form when initialData changes (including when it becomes undefined)
  useEffect(() => {
    form.reset(normalizedInitialData);
  }, [JSON.stringify(initialData)]);

  // Hydrate or clear selectedCustomer based on initialData
  useEffect(() => {
    if (initialData?.accountId && accounts.length > 0) {
      const customer = accounts.find(acc => 
        acc.accountId === initialData.accountId || acc.id === initialData.accountId
      );
      if (customer && customer.id !== selectedCustomer?.id) {
        setSelectedCustomer(customer);
      }
    } else if (!initialData) {
      // Clear selectedCustomer when starting a fresh create session
      setSelectedCustomer(null);
    }
  }, [initialData?.accountId, accounts, initialData]);

  // Filter accounts based on receipt type
  const filteredAccounts = accounts.filter((account) => {
    if (!account.active) return false;
    
    switch (receiptType) {
      case "balance":
      case "khata":
        return account.type === "Buyer";
      case "farmer":
        return account.type === "Farmer";
      case "transport":
        return account.type === "Transport";
      case "other":
        return ["Agent", "Supplier", "Coldstorage", "Other"].includes(account.type);
      default:
        return true;
    }
  }).filter((account) => 
    account.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    account.accountId.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (account.mobile && account.mobile.includes(customerSearch))
  );

  // Calculate pending balances (placeholder - would be calculated from ledger)
  const calculateBalances = () => {
    if (!selectedCustomer) return { pending: 0, khata: 0, payable: 0 };
    
    // TODO: Fetch actual balances from ledger/bills
    const opening = Number(selectedCustomer.openingBalance) || 0;
    
    return {
      pending: opening, // This would be calculated from unpaid bills
      khata: 0, // This would be calculated from khata bills
      payable: opening, // This would be calculated from payable amounts
    };
  };

  const balances = calculateBalances();
  const netBalance = amountReceived - discount;

  // Update accountId when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue("accountId", selectedCustomer.accountId);
    }
  }, [selectedCustomer, form]);

  const handlePrint = () => {
    window.print();
  };

  const handleViewLedger = () => {
    // Navigate to ledger view for selected customer
    if (selectedCustomer) {
      window.location.href = `/ledger/${selectedCustomer.accountId}`;
    }
  };

  const handleSubmit = (data: PaymentReceiptFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Payment Receipt</CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    data-testid="button-print"
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                  {selectedCustomer && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleViewLedger}
                      data-testid="button-view-ledger"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Ledger
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bill Date */}
              <FormField
                control={form.control}
                name="receiptDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Receipt Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-receipt-date"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Receipt Type */}
              <FormField
                control={form.control}
                name="receiptType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      data-testid="select-receipt-type"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="balance">Balance</SelectItem>
                        <SelectItem value="khata">Khata</SelectItem>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Customer Selection */}
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Customer Name *</FormLabel>
                    <Popover open={showCustomerSearch} onOpenChange={setShowCustomerSearch}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-select-customer"
                          >
                            {selectedCustomer
                              ? `${selectedCustomer.name} (${selectedCustomer.accountId})`
                              : "Select customer"}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search by name, ID, or mobile..."
                            value={customerSearch}
                            onValueChange={setCustomerSearch}
                            data-testid="input-search-customer"
                          />
                          <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                              {filteredAccounts.map((account) => (
                                <CommandItem
                                  key={account.id}
                                  value={account.accountId}
                                  onSelect={() => {
                                    setSelectedCustomer(account);
                                    field.onChange(account.accountId);
                                    setShowCustomerSearch(false);
                                  }}
                                  data-testid={`option-customer-${account.accountId}`}
                                >
                                  <div className="flex flex-col">
                                    <div className="font-medium">{account.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {account.accountId} • {account.mobile || "No mobile"} • {account.type}
                                    </div>
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
            </CardContent>
          </Card>

          {/* Balance Information */}
          {selectedCustomer && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Balance Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(receiptType === "balance" || receiptType === "khata") && (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Pending Balance</p>
                        <p className="text-2xl font-bold" data-testid="text-pending-balance">
                          ₹{balances.pending.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Khata Balance</p>
                        <p className="text-2xl font-bold" data-testid="text-khata-balance">
                          ₹{balances.khata.toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                  {(receiptType === "farmer" || receiptType === "transport") && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Payable Balance</p>
                      <p className="text-2xl font-bold" data-testid="text-payable-balance">
                        ₹{balances.payable.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Amount Received */}
                <FormField
                  control={form.control}
                  name="amountReceived"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Received *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-amount-received"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Discount */}
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-discount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Mode */}
                <FormField
                  control={form.control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Mode *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        data-testid="select-payment-mode"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Details */}
                <FormField
                  control={form.control}
                  name="paymentDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Details</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Reference no, cheque no, etc."
                          {...field}
                          data-testid="input-payment-details"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Net Balance (Calculated) */}
              <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground">Net Balance</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Amount Received - Discount)
                  </p>
                </div>
                <p className="text-3xl font-bold" data-testid="text-net-balance">
                  ₹{netBalance.toFixed(2)}
                </p>
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        className="min-h-[100px]"
                        {...field}
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              data-testid="button-print-receipt"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button type="submit" data-testid="button-save">
              Save Receipt
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
