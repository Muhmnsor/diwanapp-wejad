
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOpeningBalanceOperations } from "@/hooks/accounting/useOpeningBalanceOperations";
import { toast } from "sonner";

interface OpeningBalanceFormProps {
  accounts: any[];
  selectedPeriodId?: string;
  onSuccess: () => void;
}

export const OpeningBalanceForm = ({ 
  accounts = [], 
  selectedPeriodId,
  onSuccess
}: OpeningBalanceFormProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("");
  const [creditAmount, setCreditAmount] = useState<string>("");
  const { saveOpeningBalance, isLoading } = useOpeningBalanceOperations();

  // Reset form when period changes
  useEffect(() => {
    setSelectedAccountId("");
    setDebitAmount("");
    setCreditAmount("");
  }, [selectedPeriodId]);

  const handleDebitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDebitAmount(value);
    
    // If debit has a value, clear credit (accounting rule: an account can't be both debited and credited in the same entry)
    if (value && parseFloat(value) > 0) {
      setCreditAmount("");
    }
  };

  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCreditAmount(value);
    
    // If credit has a value, clear debit (accounting rule: an account can't be both debited and credited in the same entry)
    if (value && parseFloat(value) > 0) {
      setDebitAmount("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPeriodId) {
      toast.error("الرجاء اختيار الفترة المحاسبية أولاً");
      return;
    }

    if (!selectedAccountId) {
      toast.error("الرجاء اختيار حساب");
      return;
    }

    if ((!debitAmount || parseFloat(debitAmount) === 0) && (!creditAmount || parseFloat(creditAmount) === 0)) {
      toast.error("الرجاء إدخال قيمة للمدين أو الدائن");
      return;
    }

    try {
      const result = await saveOpeningBalance({
        period_id: selectedPeriodId,
        account_id: selectedAccountId,
        debit_amount: debitAmount ? parseFloat(debitAmount) : 0,
        credit_amount: creditAmount ? parseFloat(creditAmount) : 0
      });

      if (result.success) {
        toast.success("تم حفظ الرصيد الافتتاحي بنجاح");
        // Reset form
        setSelectedAccountId("");
        setDebitAmount("");
        setCreditAmount("");
        onSuccess();
      } else {
        toast.error("حدث خطأ أثناء حفظ الرصيد الافتتاحي");
        console.error("Error saving opening balance:", result.error);
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ الرصيد الافتتاحي");
      console.error("Error saving opening balance:", error);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-right">إضافة رصيد افتتاحي</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="account">الحساب</Label>
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
                disabled={!selectedPeriodId || accounts.length === 0}
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="debit">مدين</Label>
              <Input
                id="debit"
                type="number"
                value={debitAmount}
                onChange={handleDebitChange}
                placeholder="0.00"
                disabled={!selectedPeriodId || !selectedAccountId}
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="credit">دائن</Label>
              <Input
                id="credit"
                type="number"
                value={creditAmount}
                onChange={handleCreditChange}
                placeholder="0.00"
                disabled={!selectedPeriodId || !selectedAccountId}
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={!selectedPeriodId || !selectedAccountId || isLoading}
        >
          {isLoading ? "جاري الحفظ..." : "حفظ الرصيد"}
        </Button>
      </CardFooter>
    </Card>
  );
};
