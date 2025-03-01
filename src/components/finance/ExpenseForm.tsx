
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// بيانات البنود المتاحة للصرف منها
const budgetItems = [
  { id: 1, name: "الرواتب", balance: 110000 },
  { id: 2, name: "التشغيل", balance: 80000 },
  { id: 3, name: "العقود", balance: 190000 },
  { id: 4, name: "التسويق", balance: 50000 },
  { id: 5, name: "تنفيذ البرامج", balance: 440000 },
];

interface ExpenseFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export const ExpenseForm = ({ onCancel, onSubmit }: ExpenseFormProps) => {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  
  // التعامل مع تغيير البند المختار
  const handleItemChange = (value: string) => {
    setSelectedItemId(value);
    const selectedItem = budgetItems.find((item) => item.id.toString() === value);
    setCurrentBalance(selectedItem ? selectedItem.balance : null);
  };
  
  // التعامل مع تغيير المبلغ
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setAmount(value);
  };
  
  // عند تقديم النموذج
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من اختيار بند
    if (!selectedItemId) {
      toast.error("الرجاء اختيار البند المصروف منه");
      return;
    }
    
    // التحقق من إدخال مبلغ صحيح
    if (typeof amount !== "number" || amount <= 0) {
      toast.error("الرجاء إدخال مبلغ صحيح");
      return;
    }
    
    // التحقق من توفر الرصيد الكافي
    if (currentBalance !== null && amount > currentBalance) {
      toast.error("المبلغ المطلوب أكبر من الرصيد المتاح في هذا البند");
      return;
    }
    
    // بناء كائن البيانات للإرسال
    const expenseData = {
      date: new Date().toISOString().split("T")[0],
      budgetItemId: selectedItemId,
      budgetItemName: budgetItems.find((item) => item.id.toString() === selectedItemId)?.name,
      amount,
      description,
      beneficiary,
    };
    
    console.log("بيانات المصروف المضاف:", expenseData);
    toast.success("تم إضافة المصروف بنجاح");
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budgetItem">البند المصروف منه</Label>
          <Select value={selectedItemId} onValueChange={handleItemChange}>
            <SelectTrigger id="budgetItem">
              <SelectValue placeholder="اختر البند" />
            </SelectTrigger>
            <SelectContent>
              {budgetItems.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.name} - متاح: {item.balance.toLocaleString()} ريال
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentBalance !== null && (
            <p className="text-sm text-muted-foreground mt-1">
              الرصيد المتاح: {currentBalance.toLocaleString()} ريال
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">المبلغ (ريال)</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={handleAmountChange}
            required
          />
          {typeof amount === "number" && currentBalance !== null && amount > currentBalance && (
            <p className="text-sm text-red-500 mt-1">
              المبلغ أكبر من الرصيد المتاح!
            </p>
          )}
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">وصف المصروف</Label>
          <Textarea
            id="description"
            placeholder="أدخل تفاصيل المصروف والغرض منه"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="beneficiary">المستفيد (اختياري)</Label>
          <Input
            id="beneficiary"
            placeholder="الجهة أو الشخص المستفيد من المصروف"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">إضافة المصروف</Button>
      </div>
    </form>
  );
};
