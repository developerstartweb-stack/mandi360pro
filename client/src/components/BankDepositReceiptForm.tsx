import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarIcon, Plus, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertBankDepositReceiptSchema, type InsertBankDepositReceipt, type BankDepositReceipt } from "@shared/schema";

interface BankDepositReceiptFormProps {
  receipt?: BankDepositReceipt | null;
  currentFY: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

interface CashModeRecord {
  denomination: number;
  quantity: number;
  amount: number;
}

export default function BankDepositReceiptForm({ receipt, currentFY, onSubmit, onCancel }: BankDepositReceiptFormProps) {
  const { toast } = useToast();
  const isEditing = !!receipt;

  // Form setup with Zod validation
  const form = useForm<InsertBankDepositReceipt>({
    resolver: zodResolver(insertBankDepositReceiptSchema.extend({
      receiptDate: insertBankDepositReceiptSchema.shape.receiptDate,
      cashMode: insertBankDepositReceiptSchema.shape.cashMode.optional()
    })),
    defaultValues: {
      receiptDate: receipt?.receiptDate ? new Date(receipt.receiptDate) : new Date(),
      bankName: receipt?.bankName || "",
      cashMode: receipt?.cashMode as CashModeRecord[] || [],
      total: receipt?.total || "0",
      customFields: receipt?.customFields || {},
      financialYear: currentFY
    }
  });

  // Field array for dynamic cash mode records
  const { fields: cashModeFields, append: appendCashMode, remove: removeCashMode } = useFieldArray({
    control: form.control,
    name: "cashMode" as any
  });

  // Auto-calculation state
  const [calculations, setCalculations] = useState({
    total: 0
  });

  // Watch cash mode records for auto-calculation
  const cashModeRecords = form.watch("cashMode") as CashModeRecord[] || [];

  // Auto-calculate total whenever cash mode records change
  useEffect(() => {
    const total = cashModeRecords.reduce((sum, record) => {
      const denomination = typeof record.denomination === 'number' ? record.denomination : parseFloat(record.denomination as any) || 0;
      const quantity = typeof record.quantity === 'number' ? record.quantity : parseFloat(record.quantity as any) || 0;
      return sum + (denomination * quantity);
    }, 0);

    setCalculations({ total });
    
    // Update form total
    form.setValue("total", total.toString());
  }, [cashModeRecords, form]);

  // Create/Update mutation
  const createReceiptMutation = useMutation({
    mutationFn: (data: InsertBankDepositReceipt) => 
      apiRequest('/api/accounting/bank-deposit-receipts', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/bank-deposit-receipts"] });
      toast({ title: "Success", description: "Bank deposit receipt created successfully" });
      onSubmit?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create bank deposit receipt", variant: "destructive" });
    }
  });

  const updateReceiptMutation = useMutation({
    mutationFn: (data: InsertBankDepositReceipt) => 
      apiRequest(`/api/accounting/bank-deposit-receipts/${receipt?.id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/bank-deposit-receipts"] });
      toast({ title: "Success", description: "Bank deposit receipt updated successfully" });
      onSubmit?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update bank deposit receipt", variant: "destructive" });
    }
  });

  // Form submission
  const handleSubmit = (data: InsertBankDepositReceipt) => {
    const submitData = {
      ...data,
      cashMode: cashModeRecords,
      total: calculations.total.toString(),
      financialYear: currentFY
    };

    if (isEditing) {
      updateReceiptMutation.mutate(submitData);
    } else {
      createReceiptMutation.mutate(submitData);
    }
  };

  // Add new cash mode record
  const addCashModeRecord = () => {
    appendCashMode({ denomination: 0, quantity: 0, amount: 0 });
  };

  // Common denominations for quick add
  const commonDenominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

  const addCommonDenomination = (denomination: number) => {
    appendCashMode({ denomination, quantity: 1, amount: denomination });
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
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {isEditing ? 'Edit Bank Deposit Receipt' : 'Create New Bank Deposit Receipt'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Record bank deposits with cash breakdown for FY {currentFY}
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
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details for this bank deposit receipt
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

                {/* Bank Name */}
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter bank name"
                          {...field}
                          data-testid="input-bank-name"
                        />
                      </FormControl>
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

                {/* Auto-calculated Total */}
                <FormItem>
                  <FormLabel>Total Amount (Auto-calculated)</FormLabel>
                  <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(calculations.total)}
                    </span>
                  </div>
                </FormItem>
              </CardContent>
            </Card>

            {/* Quick Add Common Denominations */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Add Common Denominations</CardTitle>
                <CardDescription>
                  Click to quickly add common currency denominations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {commonDenominations.map((denomination) => (
                    <Button
                      key={denomination}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCommonDenomination(denomination)}
                      className="text-sm"
                      data-testid={`button-add-denomination-${denomination}`}
                    >
                      ₹{denomination}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cash Mode Breakdown */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Cash Breakdown</CardTitle>
                  <CardDescription>
                    Add denomination-wise cash breakdown for the deposit
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCashModeRecord}
                  className="bg-green-50 hover:bg-green-100 dark:bg-green-900/20"
                  data-testid="button-add-cash-mode"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Cash Entry
                </Button>
              </CardHeader>
              <CardContent>
                {cashModeFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No cash breakdown entries yet. Click "Add Cash Entry" or use quick add buttons above.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Denomination</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashModeFields.map((field, index) => {
                          const denomination = form.watch(`cashMode.${index}.denomination` as any) || 0;
                          const quantity = form.watch(`cashMode.${index}.quantity` as any) || 0;
                          const amount = denomination * quantity;
                          
                          return (
                            <TableRow key={field.id}>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`cashMode.${index}.denomination` as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Denomination"
                                          min="0"
                                          step="0.01"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                          data-testid={`input-denomination-${index}`}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`cashMode.${index}.quantity` as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Quantity"
                                          min="0"
                                          {...field}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                          data-testid={`input-quantity-${index}`}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium text-green-600">
                                  {formatCurrency(amount)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeCashMode(index)}
                                  data-testid={`button-remove-cash-mode-${index}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Deposit Summary (Auto-calculated)</CardTitle>
                <CardDescription>
                  Summary of the bank deposit receipt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {cashModeFields.length}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculations.total)}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Bank</div>
                    <div className="text-lg font-semibold">
                      {form.watch("bankName") || "Not specified"}
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