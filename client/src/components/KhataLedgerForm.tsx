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
import { insertKhataLedgerSchema, updateKhataLedgerSchema, type KhataLedger } from "@shared/schema";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface KhataLedgerFormProps {
  khata: KhataLedger | null;
  isOpen: boolean;
  onClose: () => void;
  currentFY: string;
}

export default function KhataLedgerForm({ khata, isOpen, onClose, currentFY }: KhataLedgerFormProps) {
  const { toast } = useToast();
  const isEditing = !!khata;

  const form = useForm({
    resolver: zodResolver(isEditing ? updateKhataLedgerSchema : insertKhataLedgerSchema),
    defaultValues: {
      date: khata?.date ? new Date(khata.date) : new Date(),
      customerName: khata?.customerName || "",
      customerId: khata?.customerId || "",
      openingBalance: khata?.openingBalance ? parseFloat(khata.openingBalance) : 0,
      paymentReceived: khata?.paymentReceived ? parseFloat(khata.paymentReceived) : 0,
      totalBalance: khata?.totalBalance ? parseFloat(khata.totalBalance) : 0,
      note: khata?.note || "",
      financialYear: currentFY,
    },
  });

  // Fetch account masters for customer selection
  const { data: accounts } = useQuery({
    queryKey: ['/api/accounts', currentFY],
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
    mutationFn: (data: any) => apiRequest('/api/ledger/khata', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/khata'] });
      toast({ title: "Success", description: "Khata ledger created successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create khata ledger", 
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/ledger/khata/${khata?.id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ledger/khata'] });
      toast({ title: "Success", description: "Khata ledger updated successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update khata ledger", 
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

  const handleCustomerSelect = (customerId: string) => {
    const selectedAccount = (accounts || []).find((acc: any) => acc.id === customerId);
    if (selectedAccount) {
      form.setValue("customerId", customerId);
      form.setValue("customerName", selectedAccount.name);
      form.setValue("openingBalance", selectedAccount.openingBalance || 0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-none p-6 overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Khata Ledger' : 'New Khata Ledger'}
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

              {/* Customer Selection */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Select onValueChange={handleCustomerSelect} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-customer">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(accounts || []).map((account: any) => (
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
                    : isEditing ? 'Update' : 'Create'} Khata Ledger
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}