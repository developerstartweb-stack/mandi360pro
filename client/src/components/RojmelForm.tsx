import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarIcon, Plus, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertRojmelSchema, type InsertRojmel, type Rojmel } from "@shared/schema";

interface RojmelFormProps {
  rojmel?: Rojmel | null;
  currentFY: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

interface IncomeRecord {
  description: string;
  amount: number;
  category: string;
}

interface ExpenseRecord {
  description: string;
  amount: number;
  category: string;
}

export default function RojmelForm({ rojmel, currentFY, onSubmit, onCancel }: RojmelFormProps) {
  const { toast } = useToast();
  const isEditing = !!rojmel;

  // Form setup with Zod validation
  const form = useForm<InsertRojmel>({
    resolver: zodResolver(insertRojmelSchema.extend({
      rojmelDate: insertRojmelSchema.shape.rojmelDate,
      incomeRecords: insertRojmelSchema.shape.incomeRecords.optional(),
      expenseRecords: insertRojmelSchema.shape.expenseRecords.optional()
    })),
    defaultValues: {
      rojmelDate: rojmel?.rojmelDate ? new Date(rojmel.rojmelDate) : new Date(),
      incomeRecords: rojmel?.incomeRecords as IncomeRecord[] || [],
      expenseRecords: rojmel?.expenseRecords as ExpenseRecord[] || [],
      customFields: rojmel?.customFields || {},
      financialYear: currentFY
    }
  });

  // Field arrays for dynamic income/expense records
  const { fields: incomeFields, append: appendIncome, remove: removeIncome } = useFieldArray({
    control: form.control,
    name: "incomeRecords" as any
  });

  const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
    control: form.control,
    name: "expenseRecords" as any
  });

  // Auto-calculation state
  const [calculations, setCalculations] = useState({
    totalIncome: 0,
    totalExpense: 0,
    net: 0
  });

  // Watch income and expense records for auto-calculation
  const incomeRecords = form.watch("incomeRecords") as IncomeRecord[] || [];
  const expenseRecords = form.watch("expenseRecords") as ExpenseRecord[] || [];

  // Auto-calculate totals whenever records change
  useEffect(() => {
    const totalIncome = incomeRecords.reduce((sum, record) => {
      return sum + (typeof record.amount === 'number' ? record.amount : parseFloat(record.amount as any) || 0);
    }, 0);

    const totalExpense = expenseRecords.reduce((sum, record) => {
      return sum + (typeof record.amount === 'number' ? record.amount : parseFloat(record.amount as any) || 0);
    }, 0);

    const net = totalIncome - totalExpense;

    setCalculations({ totalIncome, totalExpense, net });
  }, [incomeRecords, expenseRecords]);

  // Create/Update mutation
  const createRojmelMutation = useMutation({
    mutationFn: (data: InsertRojmel) => 
      apiRequest('/api/accounting/rojmels', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/rojmels"] });
      toast({ title: "Success", description: "Rojmel created successfully" });
      onSubmit?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create rojmel", variant: "destructive" });
    }
  });

  const updateRojmelMutation = useMutation({
    mutationFn: (data: InsertRojmel) => 
      apiRequest(`/api/accounting/rojmels/${rojmel?.id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/rojmels"] });
      toast({ title: "Success", description: "Rojmel updated successfully" });
      onSubmit?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update rojmel", variant: "destructive" });
    }
  });

  // Form submission
  const handleSubmit = (data: InsertRojmel) => {
    // Include calculated totals in submission
    const submitData = {
      ...data,
      incomeRecords: incomeRecords,
      expenseRecords: expenseRecords,
      financialYear: currentFY
    };

    if (isEditing) {
      updateRojmelMutation.mutate(submitData);
    } else {
      createRojmelMutation.mutate(submitData);
    }
  };

  // Add new income record
  const addIncomeRecord = () => {
    appendIncome({ description: "", amount: 0, category: "" });
  };

  // Add new expense record
  const addExpenseRecord = () => {
    appendExpense({ description: "", amount: 0, category: "" });
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
                {isEditing ? 'Edit Rojmel' : 'Create New Rojmel'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Daily income and expense tracking
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline" 
                onClick={onCancel}
                data-testid="button-cancel-rojmel"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={createRojmelMutation.isPending || updateRojmelMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-rojmel"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update' : 'Create'} Rojmel
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
                  Set the date and basic details for this rojmel entry
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rojmel Date */}
                <FormField
                  control={form.control}
                  name="rojmelDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Rojmel Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="input-rojmel-date"
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

              </CardContent>
            </Card>

            {/* Auto-Calculation Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary (Auto-calculated)</CardTitle>
                <CardDescription>
                  Live calculations based on income and expense records below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Income</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculations.totalIncome)}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Expense</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(calculations.totalExpense)}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Net</div>
                    <div className={cn(
                      "text-2xl font-bold",
                      calculations.net >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(calculations.net)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income Records */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Income Records</CardTitle>
                  <CardDescription>
                    Add all income entries for this rojmel
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIncomeRecord}
                  className="bg-green-50 hover:bg-green-100 dark:bg-green-900/20"
                  data-testid="button-add-income"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Income
                </Button>
              </CardHeader>
              <CardContent>
                {incomeFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No income records yet. Click "Add Income" to get started.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incomeFields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`incomeRecords.${index}.description` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder="Income description"
                                        {...field}
                                        data-testid={`input-income-description-${index}`}
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
                                name={`incomeRecords.${index}.category` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder="Category"
                                        {...field}
                                        data-testid={`input-income-category-${index}`}
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
                                name={`incomeRecords.${index}.amount` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        data-testid={`input-income-amount-${index}`}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeIncome(index)}
                                data-testid={`button-remove-income-${index}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Records */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Expense Records</CardTitle>
                  <CardDescription>
                    Add all expense entries for this rojmel
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExpenseRecord}
                  className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20"
                  data-testid="button-add-expense"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </CardHeader>
              <CardContent>
                {expenseFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No expense records yet. Click "Add Expense" to get started.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenseFields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`expenseRecords.${index}.description` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder="Expense description"
                                        {...field}
                                        data-testid={`input-expense-description-${index}`}
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
                                name={`expenseRecords.${index}.category` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder="Category"
                                        {...field}
                                        data-testid={`input-expense-category-${index}`}
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
                                name={`expenseRecords.${index}.amount` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        data-testid={`input-expense-amount-${index}`}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeExpense(index)}
                                data-testid={`button-remove-expense-${index}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
                disabled={createRojmelMutation.isPending || updateRojmelMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-submit-form"
              >
                {createRojmelMutation.isPending || updateRojmelMutation.isPending ? (
                  <span>Saving...</span>
                ) : (
                  <span>{isEditing ? 'Update' : 'Create'} Rojmel</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}