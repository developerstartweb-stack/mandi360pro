import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertIncomeExpenseReceiptSchema, type InsertIncomeExpenseReceipt, type IncomeExpenseReceipt } from "@shared/schema";

interface IncomeExpenseReceiptFormProps {
  receipt?: IncomeExpenseReceipt | null;
  currentFY: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function IncomeExpenseReceiptForm({ receipt, currentFY, onSubmit, onCancel }: IncomeExpenseReceiptFormProps) {
  const { toast } = useToast();
  const isEditing = !!receipt;

  // Form setup with Zod validation
  const form = useForm<InsertIncomeExpenseReceipt>({
    resolver: zodResolver(insertIncomeExpenseReceiptSchema),
    defaultValues: {
      receiptDate: receipt?.receiptDate ? new Date(receipt.receiptDate) : new Date(),
      type: (receipt?.type as "income" | "expense") || "income",
      name: receipt?.name || "",
      amount: receipt?.amount || "0",
      paymentMode: (receipt?.paymentMode as "cash" | "bank" | "upi" | "cheque") || "cash",
      customFields: receipt?.customFields || {},
      financialYear: currentFY
    }
  });

  // Watch amount for live calculations
  const amount = form.watch("amount") || "0";
  const type = form.watch("type");

  // Create/Update mutation
  const createReceiptMutation = useMutation({
    mutationFn: (data: InsertIncomeExpenseReceipt) => 
      apiRequest('/api/accounting/income-expense-receipts', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/income-expense-receipts"] });
      toast({ title: "Success", description: "Income/Expense receipt created successfully" });
      onSubmit?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create receipt", variant: "destructive" });
    }
  });

  const updateReceiptMutation = useMutation({
    mutationFn: (data: InsertIncomeExpenseReceipt) => 
      apiRequest(`/api/accounting/income-expense-receipts/${receipt?.id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/income-expense-receipts"] });
      toast({ title: "Success", description: "Income/Expense receipt updated successfully" });
      onSubmit?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update receipt", variant: "destructive" });
    }
  });

  // Form submission
  const handleSubmit = (data: InsertIncomeExpenseReceipt) => {
    const submitData = {
      ...data,
      financialYear: currentFY
    };

    if (isEditing) {
      updateReceiptMutation.mutate(submitData);
    } else {
      createReceiptMutation.mutate(submitData);
    }
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          form.handleSubmit(handleSubmit)();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [form, onCancel]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {isEditing ? 'Edit Income/Expense Receipt' : 'Create New Income/Expense Receipt'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Record income or expense transactions for FY {currentFY}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline" 
                onClick={onCancel}
                data-testid="button-cancel-receipt"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={createReceiptMutation.isPending || updateReceiptMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-receipt"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update' : 'Create'} Receipt
              </Button>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt Information</CardTitle>
                <CardDescription>
                  Enter the details for this income or expense receipt
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Receipt Date */}
                <FormField
                  control={form.control}
                  name="receiptDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Receipt Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="input-receipt-date"
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
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-receipt-type">
                            <SelectValue placeholder="Select receipt type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name/Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter name or description"
                          {...field}
                          data-testid="input-receipt-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          data-testid="input-receipt-amount"
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
                      <FormLabel>Payment Mode</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment-mode">
                            <SelectValue placeholder="Select payment mode" />
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

                {/* Financial Year (Read-only) */}
                <FormItem>
                  <FormLabel>Financial Year</FormLabel>
                  <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                    <span className="text-sm text-muted-foreground">{currentFY}</span>
                  </div>
                </FormItem>
              </CardContent>
            </Card>

            {/* Live Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt Summary</CardTitle>
                <CardDescription>
                  Live preview of the receipt details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Type</div>
                    <div className={cn(
                      "text-lg font-semibold capitalize",
                      type === "income" ? "text-green-600" : "text-red-600"
                    )}>
                      {type}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Amount</div>
                    <div className={cn(
                      "text-xl font-bold",
                      type === "income" ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(parseFloat(amount) || 0)}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Payment Mode</div>
                    <div className="text-lg font-semibold capitalize">
                      {form.watch("paymentMode") || "Not selected"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-testid="button-cancel-form"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createReceiptMutation.isPending || updateReceiptMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-submit-form"
              >
                {createReceiptMutation.isPending || updateReceiptMutation.isPending ? (
                  <span>Saving...</span>
                ) : (
                  <span>{isEditing ? 'Update' : 'Create'} Receipt</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}