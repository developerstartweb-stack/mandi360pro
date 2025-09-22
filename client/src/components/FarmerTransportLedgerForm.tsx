import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertFarmerTransportLedgerSchema, updateFarmerTransportLedgerSchema, type FarmerTransportLedger } from "@shared/schema";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FarmerTransportLedgerFormProps {
  farmerTransport: FarmerTransportLedger | null;
  isOpen: boolean;
  onClose: () => void;
  currentFY: string;
}

export default function FarmerTransportLedgerForm({ farmerTransport, isOpen, onClose, currentFY }: FarmerTransportLedgerFormProps) {
  const { toast } = useToast();
  const isEditing = !!farmerTransport;

  const form = useForm({
    resolver: zodResolver(isEditing ? updateFarmerTransportLedgerSchema : insertFarmerTransportLedgerSchema),
    defaultValues: {
      date: farmerTransport?.date ? new Date(farmerTransport.date) : new Date(),
      farmerTransporterName: farmerTransport?.farmerTransporterName || "",
      farmerTransporterId: farmerTransport?.farmerTransporterId || "",
      type: farmerTransport?.type || "farmer",
      grossAmount: farmerTransport?.grossAmount || 0,
      expenses: farmerTransport?.expenses || 0,
      netAmount: farmerTransport?.netAmount || 0,
      advance: farmerTransport?.advance || 0,
      amountPayable: farmerTransport?.amountPayable || 0,
      balanceRemaining: farmerTransport?.balanceRemaining || 0,
      billType: farmerTransport?.billType || "",
      billNo: farmerTransport?.billNo || "",
      invoiceId: farmerTransport?.invoiceId || null,
      receiptId: farmerTransport?.receiptId || null,
      notes: farmerTransport?.notes || "",
      fy: currentFY,
    },
  });

  // Fetch account masters for farmer/transporter selection
  const { data: accounts } = useQuery({
    queryKey: ['/api/accounts', currentFY],
  });

  // Auto-calculate derived amounts when values change
  const grossAmount = form.watch("grossAmount");
  const expenses = form.watch("expenses");
  const advance = form.watch("advance");

  useEffect(() => {
    const netAmt = (grossAmount || 0) - (expenses || 0);
    const amountPayable = netAmt - (advance || 0);
    const balanceRemaining = amountPayable; // For now, same as amount payable
    
    form.setValue("netAmount", netAmt);
    form.setValue("amountPayable", amountPayable);
    form.setValue("balanceRemaining", balanceRemaining);
  }, [grossAmount, expenses, advance, form]);

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
    mutationFn: (data: any) => apiRequest('/api/ledger/farmer-transport', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/farmer-transport'] });
      toast({ title: "Success", description: "Farmer/Transport ledger created successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create farmer/transport ledger", 
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/ledger/farmer-transport/${farmerTransport?.id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/farmer-transport'] });
      toast({ title: "Success", description: "Farmer/Transport ledger updated successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update farmer/transport ledger", 
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

  const handleFarmerTransporterSelect = (accountId: string) => {
    const selectedAccount = accounts?.find((acc: any) => acc.id === accountId);
    if (selectedAccount) {
      form.setValue("farmerTransporterId", accountId);
      form.setValue("farmerTransporterName", selectedAccount.name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Farmer/Transport Ledger' : 'New Farmer/Transport Ledger'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Farmer/Transporter Selection */}
              <FormField
                control={form.control}
                name="farmerTransporterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farmer/Transporter *</FormLabel>
                    <Select onValueChange={handleFarmerTransporterSelect} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-farmer-transporter">
                          <SelectValue placeholder="Select farmer/transporter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts?.filter((acc: any) => 
                          acc.type === 'farmer' || acc.type === 'transport' || acc.type === 'both'
                        ).map((account: any) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountId} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Farmer/Transporter Name (auto-filled) */}
              <FormField
                control={form.control}
                name="farmerTransporterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted" data-testid="input-farmer-transporter-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gross Amount */}
              <FormField
                control={form.control}
                name="grossAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Amount (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-gross-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expenses */}
              <FormField
                control={form.control}
                name="expenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expenses (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-expenses"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Net Amount (auto-calculated) */}
              <FormField
                control={form.control}
                name="netAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        readOnly
                        className="bg-muted font-semibold text-green-700"
                        data-testid="input-net-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Advance */}
              <FormField
                control={form.control}
                name="advance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advance (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-advance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount Payable (auto-calculated) */}
              <FormField
                control={form.control}
                name="amountPayable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Payable (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        readOnly
                        className="bg-muted font-semibold text-blue-700"
                        data-testid="input-amount-payable"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Balance Remaining (auto-calculated) */}
              <FormField
                control={form.control}
                name="balanceRemaining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Balance Remaining (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        readOnly
                        className="bg-muted font-semibold text-orange-700"
                        data-testid="input-balance-remaining"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bill Type */}
              <FormField
                control={form.control}
                name="billType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-bill-type">
                          <SelectValue placeholder="Select bill type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="receipt">Receipt</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="transport">Transport Bill</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bill Number */}
              <FormField
                control={form.control}
                name="billNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter bill number" data-testid="input-bill-no" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice ID */}
              <FormField
                control={form.control}
                name="invoiceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter invoice ID" data-testid="input-invoice-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Receipt ID */}
              <FormField
                control={form.control}
                name="receiptId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter receipt ID" data-testid="input-receipt-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      {...field}
                      placeholder="Enter any additional notes..."
                      className="min-h-[100px]"
                      data-testid="textarea-notes"
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
                  loading={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save"
                >
                  {isEditing ? 'Update' : 'Create'} Farmer/Transport Ledger
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}