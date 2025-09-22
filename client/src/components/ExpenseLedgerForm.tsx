import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertExpenseLedgerSchema, updateExpenseLedgerSchema, type ExpenseLedger } from "@shared/schema";

interface ExpenseLedgerFormProps {
  expense: ExpenseLedger | null;
  isOpen: boolean;
  onClose: () => void;
  currentFY: string;
}

export default function ExpenseLedgerForm({ expense, isOpen, onClose, currentFY }: ExpenseLedgerFormProps) {
  const { toast } = useToast();
  const isEditing = !!expense;

  const form = useForm({
    resolver: zodResolver(isEditing ? updateExpenseLedgerSchema : insertExpenseLedgerSchema),
    defaultValues: {
      date: expense?.date ? new Date(expense.date) : new Date(),
      description: expense?.description || "",
      amount: expense?.amount || 0,
      category: expense?.category || "",
      runningBalance: expense?.runningBalance || 0,
      notes: expense?.notes || "",
      fy: currentFY,
    },
  });

  const onSubmit = (data: any) => {
    // TODO: Implement form submission
    toast({ title: "Coming Soon", description: "Expense ledger form will be implemented" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Expense Ledger' : 'New Expense Ledger'}
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-muted-foreground">
          Expense Ledger Form - Coming Soon
        </div>
      </DialogContent>
    </Dialog>
  );
}