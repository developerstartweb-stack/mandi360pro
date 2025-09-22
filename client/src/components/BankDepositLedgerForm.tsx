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
import { insertBankDepositLedgerSchema, updateBankDepositLedgerSchema, type BankDepositLedger } from "@shared/schema";

interface BankDepositLedgerFormProps {
  bankDeposit: BankDepositLedger | null;
  isOpen: boolean;
  onClose: () => void;
  currentFY: string;
}

export default function BankDepositLedgerForm({ bankDeposit, isOpen, onClose, currentFY }: BankDepositLedgerFormProps) {
  const { toast } = useToast();
  const isEditing = !!bankDeposit;

  const form = useForm({
    resolver: zodResolver(isEditing ? updateBankDepositLedgerSchema : insertBankDepositLedgerSchema),
    defaultValues: {
      date: bankDeposit?.date ? new Date(bankDeposit.date) : new Date(),
      bankName: bankDeposit?.bankName || "",
      depositAmount: bankDeposit?.depositAmount || 0,
      transactionType: bankDeposit?.transactionType || "",
      runningBalance: bankDeposit?.runningBalance || 0,
      description: bankDeposit?.description || "",
      notes: bankDeposit?.notes || "",
      fy: currentFY,
    },
  });

  const onSubmit = (data: any) => {
    // TODO: Implement form submission
    toast({ title: "Coming Soon", description: "Bank deposit ledger form will be implemented" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Bank Deposit Ledger' : 'New Bank Deposit Ledger'}
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-muted-foreground">
          Bank Deposit Ledger Form - Coming Soon
        </div>
      </DialogContent>
    </Dialog>
  );
}