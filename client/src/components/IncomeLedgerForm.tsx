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
import { insertIncomeLedgerSchema, updateIncomeLedgerSchema, type IncomeLedger } from "@shared/schema";

interface IncomeLedgerFormProps {
  income: IncomeLedger | null;
  isOpen: boolean;
  onClose: () => void;
  currentFY: string;
}

export default function IncomeLedgerForm({ income, isOpen, onClose, currentFY }: IncomeLedgerFormProps) {
  const { toast } = useToast();
  const isEditing = !!income;

  const form = useForm({
    resolver: zodResolver(isEditing ? updateIncomeLedgerSchema : insertIncomeLedgerSchema),
    defaultValues: {
      date: income?.date ? new Date(income.date) : new Date(),
      description: income?.description || "",
      amount: income?.amount || 0,
      source: income?.source || "",
      category: income?.category || "",
      runningBalance: income?.runningBalance || 0,
      notes: income?.notes || "",
      fy: currentFY,
    },
  });

  const onSubmit = (data: any) => {
    // TODO: Implement form submission
    toast({ title: "Coming Soon", description: "Income ledger form will be implemented" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Income Ledger' : 'New Income Ledger'}
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-muted-foreground">
          Income Ledger Form - Coming Soon
        </div>
      </DialogContent>
    </Dialog>
  );
}