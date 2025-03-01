
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

interface ExpenseFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

interface BudgetItem {
  id: string;
  name: string;
  default_percentage: number;
}

export const ExpenseForm = ({ onCancel, onSubmit }: ExpenseFormProps) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [totalResources, setTotalResources] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);

  // جلب بنود الميزانية من قاعدة البيانات
  useEffect(() => {
    const fetchBudgetItems = async () => {
      try {
        const { data, error } = await supabase
          .from('budget_items')
          .select('id, name, default_percentage');

        if (error) {
          throw error;
        }

        if (data) {
          setBudgetItems(data);
          // تحديد البند الأول كاختيار افتراضي إذا كان متوفراً
          if (data.length > 0) {
            setSelectedItemId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching budget items:', error);
        toast.error('حدث خطأ أثناء جلب بنود الميزانية');
      }
    };

    fetchBudgetItems();
  }, []);

  // حساب رصيد البند عند اختيار بند جديد
  useEffect(() => {
    if (selectedItemId) {
      calculateBudgetItemBalance(selectedItemId);
    }
  }, [selectedItemId]);

  // التحقق من كفاية الرصيد عند تغير مبلغ المصروف
  useEffect(() => {
    if (availableBalance !== null && typeof amount === 'number') {
      setIsInsufficientBalance(amount > availableBalance);
    } else {
      setIsInsufficientBalance(false);
    }
  }, [amount, availableBalance]);

  // حساب رصيد البند المتاح
  const calculateBudgetItemBalance = async (budgetItemId: string) => {
    setIsLoadingBalance(true);
    setAvailableBalance(null);
    
    try {
      // جلب إجمالي الموارد
      const { data: resourcesData, error: resourcesError } = await supabase
        .from("financial_resources")
        .select("net_amount");

      if (resourcesError) throw resourcesError;

      // حساب إجمالي الموارد
      const totalResourcesAmount = resourcesData.reduce(
        (sum, resource) => sum + resource.net_amount,
        0
      );
      
      setTotalResources(totalResourcesAmount);
      
      // جلب النسبة المئوية للبند
      const selectedItem = budgetItems.find(item => item.id === budgetItemId);
      
      if (!selectedItem) {
        setAvailableBalance(0);
        setIsLoadingBalance(false);
        return;
      }
      
      // المبلغ المخصص للبند بناءً على نسبته المئوية من إجمالي الموارد
      const allocatedAmount = (totalResourcesAmount * selectedItem.default_percentage) / 100;
      
      // جلب المصروفات على هذا البند
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("amount")
        .eq("budget_item_id", budgetItemId);

      if (expensesError) throw expensesError;
      
      // إجمالي المصروفات على البند
      const totalExpenses = expensesData.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      
      // الرصيد المتبقي
      const balance = allocatedAmount - totalExpenses;
      setAvailableBalance(balance);
      
    } catch (error) {
      console.error("Error calculating budget item balance:", error);
      toast.error("حدث خطأ أثناء حساب رصيد البند");
      setAvailableBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من إدخال المعلومات الضرورية
    if (!selectedItemId || typeof amount !== "number" || amount <= 0 || !description) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    // التحقق من كفاية الرصيد
    if (isInsufficientBalance) {
      toast.error("رصيد البند غير كافٍ لإتمام هذا المصروف");
      return;
    }

    setIsLoading(true);

    try {
      // إضافة المصروف إلى قاعدة البيانات
      const { error } = await supabase
        .from('expenses')
        .insert({
          date,
          budget_item_id: selectedItemId,
          amount,
          description,
          beneficiary: beneficiary || null
        });

      if (error) throw error;

      toast.success("تم إضافة المصروف بنجاح");
      onSubmit();
    } catch (error: any) {
      console.error("خطأ في حفظ المصروف:", error);
      toast.error(error.message || "حدث خطأ أثناء حفظ المصروف");
    } finally {
      setIsLoading(false);
    }
  };

  // تحديد حالة العرض للرصيد
  const renderBalance = () => {
    if (!selectedItemId) return null;
    if (isLoadingBalance) return <span className="text-gray-500">جاري حساب الرصيد...</span>;
    if (availableBalance === null) return null;
    
    return (
      <div className={`text-sm font-semibold ${availableBalance < 0 ? 'text-red-500' : 'text-green-500'}`}>
        الرصيد المتاح: {availableBalance.toLocaleString()} ريال
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">التاريخ</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetItem">البند</Label>
          <Select value={selectedItemId || ""} onValueChange={setSelectedItemId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر البند" />
            </SelectTrigger>
            <SelectContent>
              {budgetItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderBalance()}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">المبلغ (ريال)</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
            required
            className={isInsufficientBalance ? "border-red-500" : ""}
          />
          {isInsufficientBalance && (
            <p className="text-red-500 text-sm">المبلغ أكبر من الرصيد المتاح</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="beneficiary">المستفيد</Label>
          <Input
            id="beneficiary"
            placeholder="اسم الجهة أو الشخص المستفيد"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف المصروف</Label>
        <Textarea
          id="description"
          placeholder="وصف تفصيلي للمصروف"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || isInsufficientBalance}
        >
          {isLoading ? "جاري الحفظ..." : "إضافة المصروف"}
        </Button>
      </div>
    </form>
  );
};
