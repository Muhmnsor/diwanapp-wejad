
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BasicInfoFields } from "./BasicInfoFields";
import { BudgetDistribution } from "./BudgetDistribution";
import { FormActions } from "./FormActions";
import { BudgetItem } from "./types";

interface Resource {
  id: string;
  date: string;
  source: string;
  type: string;
  entity: string;
  total_amount: number;
  obligations_amount: number;
  net_amount: number;
}

interface EditResourceFormProps {
  resource: Resource;
  onCancel: () => void;
  onSubmit: () => void;
}

export const EditResourceForm = ({ resource, onCancel, onSubmit }: EditResourceFormProps) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [useDefaultPercentages, setUseDefaultPercentages] = useState(true);
  const [totalAmount, setTotalAmount] = useState<number>(resource.total_amount);
  const [obligationsAmount, setObligationsAmount] = useState<number>(resource.obligations_amount);
  const [source, setSource] = useState(resource.source);
  const [type, setType] = useState(resource.type);
  const [entity, setEntity] = useState(resource.entity);
  const [isLoading, setIsLoading] = useState(false);
  const [distributions, setDistributions] = useState<any[]>([]);

  // جلب البنود والتوزيعات
  useEffect(() => {
    const fetchBudgetItems = async () => {
      try {
        // جلب بنود الموازنة
        const { data: itemsData, error: itemsError } = await supabase
          .from('budget_items')
          .select('id, name, default_percentage');

        if (itemsError) throw itemsError;
        
        // جلب توزيعات المورد
        const { data: distributionsData, error: distributionsError } = await supabase
          .from('resource_distributions')
          .select('*')
          .eq('resource_id', resource.id);

        if (distributionsError) throw distributionsError;
        
        setDistributions(distributionsData || []);

        // تحضير بنود الموازنة مع قيمها الحالية
        if (itemsData) {
          const items = itemsData.map(item => {
            const distribution = distributionsData?.find(d => d.budget_item_id === item.id);
            return {
              id: item.id,
              name: item.name,
              percentage: distribution ? distribution.percentage : item.default_percentage,
              value: distribution ? distribution.amount : 0
            };
          });
          
          setBudgetItems(items);
          
          // تحديد نوع النسب (افتراضي أو مخصص)
          if (distributionsData && distributionsData.length > 0) {
            // تحقق إذا كانت النسب تتطابق مع النسب الافتراضية
            const isDefault = distributionsData.every(dist => {
              const item = itemsData.find(i => i.id === dist.budget_item_id);
              return item && Math.abs(item.default_percentage - dist.percentage) < 0.1; // تقريب للتعامل مع الكسور العشرية
            });
            
            setUseDefaultPercentages(isDefault);
          }
        }
      } catch (error) {
        console.error('Error fetching budget items and distributions:', error);
        toast.error('حدث خطأ أثناء جلب بنود الميزانية');
      }
    };

    fetchBudgetItems();
  }, [resource.id]);

  // حساب القيم بناءً على النسب والمبلغ الإجمالي
  useEffect(() => {
    if (budgetItems.length > 0) {
      const netAmount = totalAmount - obligationsAmount;
      const updatedItems = budgetItems.map(item => ({
        ...item,
        value: parseFloat(((netAmount * item.percentage) / 100).toFixed(2))
      }));
      setBudgetItems(updatedItems);
    }
  }, [totalAmount, obligationsAmount]);

  // تحديث المبلغ الإجمالي
  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setTotalAmount(value);
    }
  };

  // تحديث الالتزامات
  const handleObligationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setObligationsAmount(value);
    }
  };

  // تحديث المصدر
  const handleSourceChange = (value: string) => {
    setSource(value);
  };

  // تحديث نوع النسب (افتراضية أو مخصصة)
  const handleUseDefaultsChange = (value: string) => {
    const useDefaults = value === "default";
    setUseDefaultPercentages(useDefaults);
    
    // إعادة حساب النسب إذا تم التغيير إلى الافتراضية
    if (useDefaults) {
      // استرجاع النسب الافتراضية من قاعدة البيانات
      const fetchDefaultPercentages = async () => {
        try {
          const { data, error } = await supabase
            .from('budget_items')
            .select('id, name, default_percentage');
          
          if (error) throw error;
          
          if (data) {
            const netAmount = totalAmount - obligationsAmount;
            const updatedItems = budgetItems.map(item => {
              const defaultItem = data.find(i => i.id === item.id);
              return {
                ...item,
                percentage: defaultItem?.default_percentage || 0,
                value: defaultItem ? parseFloat(((netAmount * defaultItem.default_percentage) / 100).toFixed(2)) : 0
              };
            });
            setBudgetItems(updatedItems);
          }
        } catch (error) {
          console.error('Error fetching default percentages:', error);
        }
      };
      
      fetchDefaultPercentages();
    }
  };

  // تحديث نسبة البند
  const handleItemPercentageChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPercentage = parseFloat(e.target.value);
    if (isNaN(newPercentage)) return;

    const newItems = budgetItems.map((item) =>
      item.id === id ? { ...item, percentage: newPercentage } : item
    );
    
    // حساب القيم بناءً على النسب الجديدة
    const netAmount = totalAmount - obligationsAmount;
    const updatedItems = newItems.map(item => ({
      ...item,
      value: parseFloat(((netAmount * item.percentage) / 100).toFixed(2))
    }));
    
    setBudgetItems(updatedItems);
  };

  // حساب إجمالي النسبة المئوية
  const totalPercentage = budgetItems.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  // التحقق من صحة النسب
  const isValidPercentages = Math.round(totalPercentage) === 100;

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (totalAmount <= 0) {
      toast.error("الرجاء إدخال مبلغ إجمالي صحيح");
      return;
    }
    
    // التحقق من النسب إذا كانت مخصصة
    if (!useDefaultPercentages && !isValidPercentages) {
      toast.error("مجموع النسب المئوية يجب أن يكون 100%");
      return;
    }

    setIsLoading(true);
    
    try {
      const resourceType = (document.getElementById("type") as HTMLSelectElement)?.value || type;
      const entityValue = (document.getElementById("entity") as HTMLInputElement)?.value || entity;
      const netAmount = totalAmount - obligationsAmount;
      
      // 1. تحديث المورد المالي
      const { error: resourceError } = await supabase
        .from('financial_resources')
        .update({
          source,
          type: resourceType,
          entity: entityValue,
          total_amount: totalAmount,
          obligations_amount: obligationsAmount,
          net_amount: netAmount
        })
        .eq('id', resource.id);

      if (resourceError) throw resourceError;
      
      // 2. حذف التوزيعات القديمة
      const { error: deleteError } = await supabase
        .from('resource_distributions')
        .delete()
        .eq('resource_id', resource.id);
        
      if (deleteError) throw deleteError;
      
      // 3. إضافة التوزيعات الجديدة
      const newDistributions = budgetItems.map(item => ({
        resource_id: resource.id,
        budget_item_id: item.id,
        percentage: item.percentage,
        amount: item.value
      }));
      
      const { error: distributionError } = await supabase
        .from('resource_distributions')
        .insert(newDistributions);
      
      if (distributionError) throw distributionError;
      
      toast.success("تم تعديل المورد بنجاح");
      onSubmit();
    } catch (error: any) {
      console.error("خطأ في تعديل المورد:", error);
      toast.error(error.message || "حدث خطأ أثناء تعديل المورد");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoFields
        totalAmount={totalAmount}
        obligationsAmount={obligationsAmount}
        handleTotalAmountChange={handleTotalAmountChange}
        handleObligationsChange={handleObligationsChange}
        source={source}
        handleSourceChange={handleSourceChange}
        defaultType={type}
        defaultEntity={entity}
      />
      
      <BudgetDistribution
        budgetItems={budgetItems}
        useDefaultPercentages={useDefaultPercentages}
        handleUseDefaultsChange={handleUseDefaultsChange}
        handleItemPercentageChange={handleItemPercentageChange}
        totalPercentage={totalPercentage}
        isValidPercentages={isValidPercentages}
        totalAmount={totalAmount}
        obligationsAmount={obligationsAmount}
      />
      
      <FormActions 
        onCancel={onCancel} 
        isLoading={isLoading} 
        isEdit={true} 
      />
    </form>
  );
};
