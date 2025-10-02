import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertUplagLedgerSchema, updateUplagLedgerSchema, type UplagLedger } from "@shared/schema";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UplagLedgerFormProps {
  uplag: UplagLedger | null;
  isOpen: boolean;
  onClose: () => void;
  currentFY: string;
}

export default function UplagLedgerForm({ uplag, isOpen, onClose, currentFY }: UplagLedgerFormProps) {
  const { toast } = useToast();
  const isEditing = !!uplag;
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(uplag?.customerId || "");
  const [balanceData, setBalanceData] = useState<any>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  
  const debouncedSearch = useDebounce(customerSearch, 300);

  const form = useForm({
    resolver: zodResolver(isEditing ? updateUplagLedgerSchema : insertUplagLedgerSchema),
    defaultValues: {
      date: uplag?.date ? new Date(uplag.date) : new Date(),
      customerName: uplag?.customerName || "",
      customerId: uplag?.customerId || "",
      openingBalance: uplag?.openingBalance ? parseFloat(uplag.openingBalance) : 0,
      paymentReceived: uplag?.paymentReceived ? parseFloat(uplag.paymentReceived) : 0,
      totalBalance: uplag?.totalBalance ? parseFloat(uplag.totalBalance) : 0,
      note: uplag?.note || "",
      financialYear: currentFY,
    },
  });

  // Search customers
  const { data: customers = [] } = useQuery({
    queryKey: ['/api/ledger/customers/search', debouncedSearch, currentFY],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      const response = await fetch(`/api/ledger/customers/search?q=${debouncedSearch}&fy=${currentFY}`);
      return response.json();
    },
    enabled: debouncedSearch.length > 0,
  });

  // Auto-calculate total balance when values change
  const openingBalance = form.watch("openingBalance");
  const paymentReceived = form.watch("paymentReceived");

  useEffect(() => {
    const total = (openingBalance || 0) + (paymentReceived || 0);
    form.setValue("totalBalance", total);
  }, [openingBalance, paymentReceived, form]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            form.handleSubmit(onSubmit)();
            break;
          case 'escape':
            e.preventDefault();
            onClose();
            break;
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, form, onClose]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/ledger/uplag', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/uplag'] });
      toast({ title: "Success", description: "Uplag ledger created successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create uplag ledger", 
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/ledger/uplag/${uplag?.id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/uplag'] });
      toast({ title: "Success", description: "Uplag ledger updated successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update uplag ledger", 
        variant: "destructive" 
      });
    }
  });

  const onSubmit = (data: any) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCustomerSelect = async (customer: any) => {
    setSelectedCustomerId(customer.accountId);
    form.setValue("customerId", customer.accountId);
    form.setValue("customerName", customer.name);
    setOpenCombobox(false);

    try {
      const response = await fetch(`/api/ledger/balance/${customer.accountId}?fy=${currentFY}`);
      const balance = await response.json();
      setBalanceData(balance);
      form.setValue("openingBalance", balance.currentBalance || 0);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      toast({
        title: "Warning",
        description: "Could not fetch customer balance",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-none p-6 overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Uplag Ledger' : 'New Uplag Ledger'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-select-date"
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Customer Search & Selection */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Customer (Searchable) *</FormLabel>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
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
                            {field.value || "Search and select customer..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Search customer..." 
                            value={customerSearch}
                            onValueChange={setCustomerSearch}
                          />
                          <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                              {customers.map((customer: any) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.accountId}
                                  onSelect={() => handleCustomerSelect(customer)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedCustomerId === customer.accountId
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {customer.accountId} - {customer.name}
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

              {/* Balance Display Card */}
              {balanceData && (
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Customer Balance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Opening Balance</p>
                          <p className="text-lg font-semibold">₹{balanceData.openingBalance?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Billed</p>
                          <p className="text-lg font-semibold text-orange-600">₹{balanceData.totalBilled?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Paid</p>
                          <p className="text-lg font-semibold text-green-600">₹{balanceData.totalPaid?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current Balance</p>
                          <p className="text-lg font-bold text-brand-green">₹{balanceData.currentBalance?.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Customer Name (auto-filled) */}
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted" data-testid="input-customer-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Opening Balance */}
              <FormField
                control={form.control}
                name="openingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Balance (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-opening-balance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Received */}
              <FormField
                control={form.control}
                name="paymentReceived"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Received (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-payment-received"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total Balance (auto-calculated) */}
              <FormField
                control={form.control}
                name="totalBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Balance (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        readOnly
                        className="bg-muted font-semibold"
                        data-testid="input-total-balance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter any additional notes..."
                      className="min-h-[100px]"
                      data-testid="textarea-note"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Press Ctrl+S to save, Ctrl+Esc to cancel
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save"
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : isEditing ? 'Update' : 'Create'} Uplag Ledger
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}