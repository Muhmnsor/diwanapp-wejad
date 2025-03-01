
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ResourceFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

interface BudgetItem {
  id: string;
  name: string;
  percentage: number;
  value: number;
}

export const ResourceForm = ({ onCancel, onSubmit }: ResourceFormProps) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [useDefaultPercentages, setUseDefaultPercentages] = useState(true);
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [obligationsAmount, setObligationsAmount] = useState<number | "">(0);
  const [isLoading, setIsLoading] = useState(false);

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
          const items = data.map(item => ({
            id: item.id,
            name: item.name,
            percentage: item.default_percentage,
            value: 0
          }));
          setBudgetItems(items);
        }
      } catch (error) {
        console.error('Error fetching budget items:', error);
        toast.error('حدث خطأ أثناء جلب بنود الميزانية');
      }
    };

    fetchBudgetItems();
  }, []);

  // حساب القيم بناءً على النسب والمبلغ الإجمالي
  const calculateValues = (
    total: number,
    obligations: number,
    useDefaults: boolean
  ) => {
    const netAmount = total - obligations;
    
    // حساب قيمة كل بند بناءً على النسبة
    return budgetItems.map((item) => ({
      ...item,
      percentage: useDefaults ? item.percentage : item.percentage,
      value: useDefaults
        ? parseFloat(((netAmount * item.percentage) / 100).toFixed(2))
        : 0,
    }));
  };

  // التعامل مع تغيير إجمالي المبلغ
  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setTotalAmount(value);
    
    if (typeof value === "number" && !isNaN(value)) {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      setBudgetItems(calculateValues(value, obligations, useDefaultPercentages));
    }
  };

  // التعامل مع تغيير مبلغ الالتزامات
  const handleObligationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
    setObligationsAmount(value);
    
    if (typeof totalAmount === "number") {
      setBudgetItems(calculateValues(totalAmount, value, useDefaultPercentages));
    }
  };

  // التعامل مع تغيير النسب (استخدام الافتراضية أم لا)
  const handleUseDefaultsChange = (value: string) => {
    const useDefaults = value === "default";
    setUseDefaultPercentages(useDefaults);
    
    if (typeof totalAmount === "number") {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      setBudgetItems(calculateValues(totalAmount, obligations, useDefaults));
    }
  };

  // تغيير نسبة بند معين (في حالة الإدخال اليدوي)
  const handleItemPercentageChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPercentage = parseFloat(e.target.value);
    if (isNaN(newPercentage)) return;

    const newItems = budgetItems.map((item) =>
      item.id === id ? { ...item, percentage: newPercentage } : item
    );
    
    setBudgetItems(newItems);
    
    // حساب القيم بالريال بناءً على النسب الجديدة
    if (typeof totalAmount === "number") {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      const netAmount = totalAmount - obligations;
      
      setBudgetItems(
        newItems.map((item) => ({
          ...item,
          value: parseFloat(((netAmount * item.percentage) / 100).toFixed(2)),
        }))
      );
    }
  };

  // حساب إجمالي النسب المئوية المدخلة
  const totalPercentage = budgetItems.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  // التحقق من صحة النسب (المجموع يجب أن يكون 100%)
  const isValidPercentages = Math.round(totalPercentage) === 100;

  // عند تقديم النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من إدخال البيانات الأساسية
    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      toast.error("الرجاء إدخال مبلغ إجمالي صحيح");
      return;
    }
    
    // التحقق من صحة النسب المئوية إذا كان الإدخال يدويًا
    if (!useDefaultPercentages && !isValidPercentages) {
      toast.error("مجموع النسب المئوية يجب أن يكون 100%");
      return;
    }

    setIsLoading(true);
    
    try {
      const source = (document.getElementById("source") as HTMLInputElement).value;
      const type = (document.getElementById("type") as HTMLSelectElement)?.value;
      const entity = (document.getElementById("entity") as HTMLInputElement).value;
      const netAmount = totalAmount - (typeof obligationsAmount === "number" ? obligationsAmount : 0);
      
      // 1. إضافة المورد المالي
      const { data: resourceData, error: resourceError } = await supabase
        .from('financial_resources')
        .insert({
          date: new Date().toISOString().split("T")[0],
          source,
          type,
          entity,
          total_amount: totalAmount,
          obligations_amount: typeof obligationsAmount === "number" ? obligationsAmount : 0,
          net_amount: netAmount
        })
        .select();

      if (resourceError) throw resourceError;
      
      if (!resourceData || resourceData.length === 0) {
        throw new Error('لم يتم إنشاء المورد بنجاح');
      }
      
      const resourceId = resourceData[0].id;
      
      // 2. إضافة توزيعات البنود
      const distributions = budgetItems.map(item => ({
        resource_id: resourceId,
        budget_item_id: item.id,
        percentage: item.percentage,
        amount: item.value
      }));
      
      const { error: distributionError } = await supabase
        .from('resource_distributions')
        .insert(distributions);
      
      if (distributionError) throw distributionError;
      
      toast.success("تم إضافة المورد بنجاح");
      onSubmit();
    } catch (error: any) {
      console.error("خطأ في حفظ المورد:", error);
      toast.error(error.message || "حدث خطأ أثناء حفظ المورد");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">مصدر المورد</Label>
          <Input id="source" placeholder="مثال: منحة، تبرع، إيرادات" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">نوع المورد</Label>
          <Select defaultValue="unbound" id="type">
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع المورد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bound">مقيد</SelectItem>
              <SelectItem value="unbound">غير مقيد</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="entity">الجهة</Label>
          <Input id="entity" placeholder="الجهة التي جاء منها المورد" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="totalAmount">المبلغ الإجمالي (ريال)</Label>
          <Input
            id="totalAmount"
            type="number"
            min="0"
            step="0.01"
            value={totalAmount}
            onChange={handleTotalAmountChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="obligationsAmount">الالتزامات (ريال)</Label>
          <Input
            id="obligationsAmount"
            type="number"
            min="0"
            step="0.01"
            value={obligationsAmount}
            onChange={handleObligationsChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label>صافي المبلغ (ريال)</Label>
          <Input
            value={
              typeof totalAmount === "number" && typeof obligationsAmount === "number"
                ? (totalAmount - obligationsAmount).toLocaleString()
                : ""
            }
            readOnly
            disabled
          />
        </div>
      </div>

      <Separator />

      <div>
        <Label>توزيع المبلغ على البنود</Label>
        <div className="mt-2">
          <RadioGroup defaultValue="default" onValueChange={handleUseDefaultsChange}>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="default" id="default" />
              <Label htmlFor="default">استخدام النسب الافتراضية</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual">إدخال النسب يدويًا</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 mb-4 font-bold">
          <div>البند</div>
          <div>النسبة المئوية</div>
          <div>القيمة (ريال)</div>
        </div>

        {budgetItems.map((item) => (
          <div key={item.id} className="grid grid-cols-3 gap-4 mb-2">
            <div className="flex items-center">{item.name}</div>
            <div>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={item.percentage}
                onChange={(e) => handleItemPercentageChange(item.id, e)}
                disabled={useDefaultPercentages}
              />
            </div>
            <div>
              <Input
                value={item.value.toLocaleString()}
                readOnly
                disabled
              />
            </div>
          </div>
        ))}

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t font-bold">
          <div>الإجمالي</div>
          <div
            className={
              !useDefaultPercentages && !isValidPercentages
                ? "text-red-500"
                : ""
            }
          >
            {totalPercentage.toFixed(1)}%
          </div>
          <div>
            {typeof totalAmount === "number" && typeof obligationsAmount === "number"
              ? (totalAmount - obligationsAmount).toLocaleString()
              : "0"}
            {" ريال"}
          </div>
        </div>

        {!useDefaultPercentages && !isValidPercentages && (
          <p className="text-red-500 mt-2 text-sm">
            مجموع النسب المئوية يجب أن يكون 100% (القيمة الحالية: {totalPercentage.toFixed(1)}%)
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : "إضافة المورد"}
        </Button>
      </div>
    </form>
  );
};
