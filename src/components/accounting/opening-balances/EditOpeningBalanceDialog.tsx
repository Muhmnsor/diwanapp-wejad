
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOpeningBalanceOperations } from "@/hooks/accounting/useOpeningBalanceOperations";
import { toast } from "sonner";

interface EditOpeningBalanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  balance: {
    id: string;
    account_id: string;
    account_code: string;
    account_name: string;
    debit_amount: number;
    credit_amount: number;
    period_id: string;
  } | null;
  onSuccess: () => void;
}

export const EditOpeningBalanceDialog = ({
  isOpen,
  onClose,
  balance,
  onSuccess,
}: EditOpeningBalanceDialogProps) => {
  const [debitAmount, setDebitAmount] = useState<string>("");
  const [creditAmount, setCreditAmount] = useState<string>("");
  const { saveOpeningBalance, isLoading } = useOpeningBalanceOperations();

  // Reset form when dialog opens with new balance
  useEffect(() => {
    if (balance) {
      setDebitAmount(balance.debit_amount ? balance.debit_amount.toString() : "");
      setCreditAmount(balance.credit_amount ? balance.credit_amount.toString() : "");
    } else {
      setDebitAmount("");
      setCreditAmount("");
    }
  }, [balance]);

  const handleDebitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDebitAmount(value);
    
    // If debit has a value, clear credit
    if (value && parseFloat(value) > 0) {
      setCreditAmount("");
    }
  };

  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCreditAmount(value);
    
    // If credit has a value, clear debit
    if (value && parseFloat(value) > 0) {
      setDebitAmount("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!balance) {
      toast.error("بيانات الرصيد غير متوفرة");
      return;
    }

    if ((!debitAmount || parseFloat(debitAmount) === 0) && (!creditAmount || parseFloat(creditAmount) === 0)) {
      toast.error("الرجاء إدخال قيمة للمدين أو الدائن");
      return;
    }

    try {
      const result = await saveOpeningBalance({
        period_id: balance.period_id,
        account_id: balance.account_id,
        debit_amount: debitAmount ? parseFloat(debitAmount) : 0,
        credit_amount: creditAmount ? parseFloat(creditAmount) : 0
      });

      if (result.success) {
        toast.success("تم تحديث الرصيد الافتتاحي بنجاح");
        onSuccess();
        onClose();
      } else {
        toast.error("حدث خطأ أثناء تحديث الرصيد الافتتاحي");
        console.error("Error updating opening balance:", result.error);
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الرصيد الافتتاحي");
      console.error("Error updating opening balance:", error);
    }
  };

  if (!balance) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل الرصيد الافتتاحي</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-right block">الحساب</Label>
            <p className="text-right font-medium">{balance.account_code} - {balance.account_name}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="debit" className="text-right block">مدين</Label>
            <Input
              id="debit"
              type="number"
              value={debitAmount}
              onChange={handleDebitChange}
              placeholder="0.00"
              className="text-right"
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="credit" className="text-right block">دائن</Label>
            <Input
              id="credit"
              type="number"
              value={creditAmount}
              onChange={handleCreditChange}
              placeholder="0.00"
              className="text-right"
              step="0.01"
              min="0"
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start flex-row-reverse">
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
