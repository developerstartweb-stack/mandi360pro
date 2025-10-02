import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertBalanceSheetSchema, type InsertBalanceSheet, type BalanceSheet } from "@shared/schema";

interface BalanceSheetFormProps {
  balanceSheet?: BalanceSheet | null;
  currentFY: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function BalanceSheetForm({ balanceSheet, currentFY, onSubmit, onCancel }: BalanceSheetFormProps) {
  const { toast } = useToast();
  const isEditing = !!balanceSheet;

  // Form setup with Zod validation
  const form = useForm<InsertBalanceSheet>({
    resolver: zodResolver(insertBalanceSheetSchema),
    defaultValues: {
      fromDate: balanceSheet?.fromDate ? new Date(balanceSheet.fromDate) : new Date(),
      toDate: balanceSheet?.toDate ? new Date(balanceSheet.toDate) : new Date(),
      totalAssets: balanceSheet?.totalAssets || "0",
      totalLiabilities: balanceSheet?.totalLiabilities || "0",
      netWorth: balanceSheet?.netWorth || "0",
      customFields: balanceSheet?.customFields || {},
      financialYear: currentFY
    }
  });

  // Auto-calculation state
  const [calculations, setCalculations] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0
  });

  // Watch assets and liabilities for auto-calculation
  const totalAssets = form.watch("totalAssets") || "0";
  const totalLiabilities = form.watch("totalLiabilities") || "0";

  // Auto-calculate net worth whenever assets or liabilities change
  useEffect(() => {
    const assets = parseFloat(totalAssets) || 0;
    const liabilities = parseFloat(totalLiabilities) || 0;
    const netWorth = assets - liabilities;

    setCalculations({ 
      totalAssets: assets, 
      totalLiabilities: liabilities, 
      netWorth 
    });
    
    // Update form net worth
    form.setValue("netWorth", netWorth.toString());
  }, [totalAssets, totalLiabilities, form]);

  // Create/Update mutation
  const createBalanceSheetMutation = useMutation({
    mutationFn: (data: InsertBalanceSheet) => 
      apiRequest('/api/accounting/balance-sheets', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/balance-sheets"] });
      toast({ title: "Success", description: "Balance sheet created successfully" });
      onSubmit?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create balance sheet", variant: "destructive" });
    }
  });

  const updateBalanceSheetMutation = useMutation({
    mutationFn: (data: InsertBalanceSheet) => 
      apiRequest(`/api/accounting/balance-sheets/${balanceSheet?.id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/balance-sheets"] });
      toast({ title: "Success", description: "Balance sheet updated successfully" });
      onSubmit?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update balance sheet", variant: "destructive" });
    }
  });

  // Form submission
  const handleSubmit = (data: InsertBalanceSheet) => {
    const submitData = {
      ...data,
      totalAssets: calculations.totalAssets.toString(),
      totalLiabilities: calculations.totalLiabilities.toString(),
      netWorth: calculations.netWorth.toString(),
      financialYear: currentFY
    };

    if (isEditing) {
      updateBalanceSheetMutation.mutate(submitData);
    } else {
      createBalanceSheetMutation.mutate(submitData);
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
                {isEditing ? 'Edit Balance Sheet' : 'Create New Balance Sheet'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Generate balance sheet for financial reporting
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline" 
                onClick={onCancel}
                data-testid="button-cancel-balance-sheet"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={createBalanceSheetMutation.isPending || updateBalanceSheetMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-balance-sheet"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update' : 'Create'} Balance Sheet
              </Button>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle>Reporting Period</CardTitle>
                <CardDescription>
                  Select the date range for this balance sheet
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* From Date */}
                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>From Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="input-from-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick start date</span>
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

                {/* To Date */}
                <FormField
                  control={form.control}
                  name="toDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>To Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="input-to-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick end date</span>
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

              </CardContent>
            </Card>

            {/* Financial Data */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Data</CardTitle>
                <CardDescription>
                  Enter total assets and liabilities for balance sheet calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Assets */}
                <FormField
                  control={form.control}
                  name="totalAssets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Assets</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          data-testid="input-total-assets"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Liabilities */}
                <FormField
                  control={form.control}
                  name="totalLiabilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Liabilities</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          data-testid="input-total-liabilities"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Net Worth (Auto-calculated) */}
                <FormItem className="md:col-span-2">
                  <FormLabel>Net Worth (Auto-calculated)</FormLabel>
                  <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                    <span className={cn(
                      "text-lg font-semibold",
                      calculations.netWorth >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(calculations.netWorth)}
                    </span>
                  </div>
                </FormItem>
              </CardContent>
            </Card>

            {/* Balance Sheet Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet Summary (Auto-calculated)</CardTitle>
                <CardDescription>
                  Live summary of the balance sheet financial position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Assets</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(calculations.totalAssets)}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Liabilities</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(calculations.totalLiabilities)}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Net Worth</div>
                    <div className={cn(
                      "text-2xl font-bold",
                      calculations.netWorth >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(calculations.netWorth)}
                    </div>
                  </div>
                </div>
                
                {/* Financial Health Indicator */}
                <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Financial Health Indicator
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      calculations.netWorth > 0 
                        ? "bg-green-500" 
                        : calculations.netWorth === 0 
                        ? "bg-yellow-500" 
                        : "bg-red-500"
                    )}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {calculations.netWorth > 0 
                        ? "Positive net worth - healthy financial position" 
                        : calculations.netWorth === 0 
                        ? "Break-even - assets equal liabilities" 
                        : "Negative net worth - liabilities exceed assets"}
                    </span>
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
                disabled={createBalanceSheetMutation.isPending || updateBalanceSheetMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-submit-form"
              >
                {createBalanceSheetMutation.isPending || updateBalanceSheetMutation.isPending ? (
                  <span>Saving...</span>
                ) : (
                  <span>{isEditing ? 'Update' : 'Create'} Balance Sheet</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}