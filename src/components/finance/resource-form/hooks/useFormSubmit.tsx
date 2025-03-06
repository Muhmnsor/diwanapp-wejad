
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BudgetItem, ResourceObligation } from "../types";
import { useFinanceNotifications } from "@/hooks/useFinanceNotifications";
import { useAuthStore } from "@/store/authStore";

export const useFormSubmit = (
  totalAmount: number | "",
  totalObligationsAmount: number,
  source: string,
  customSource: string,
  budgetItems: BudgetItem[],
  useDefaultPercentages: boolean,
  obligations: ResourceObligation[],
  onSubmit: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { sendNewResourceNotification } = useFinanceNotifications();
  const { user } = useAuthStore();
  
  // Calculate total percentage
  const totalPercentage = budgetItems.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  // Check if percentages are valid
  const isValidPercentages = Math.round(totalPercentage) === 100;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required data
    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      toast.error("الرجاء إدخال مبلغ إجمالي صحيح");
      return;
    }
    
    // Validate percentages if manual entry
    if (!useDefaultPercentages && !isValidPercentages) {
      toast.error("مجموع النسب المئوية يجب أن يكون 100%");
      return;
    }

    // Validate custom source if "أخرى" is selected
    if (source === "أخرى" && !customSource.trim()) {
      toast.error("الرجاء إدخال اسم المصدر المخصص");
      return;
    }

    setIsLoading(true);
    
    try {
      const type = (document.getElementById("type") as HTMLSelectElement)?.value;
      const entity = (document.getElementById("entity") as HTMLInputElement).value;
      const netAmount = totalAmount - totalObligationsAmount;
      
      // Determine which source to use
      const finalSource = source === "أخرى" ? customSource : source;
      
      // 1. Add financial resource
      const { data: resourceData, error: resourceError } = await supabase
        .from('financial_resources')
        .insert({
          date: new Date().toISOString().split("T")[0],
          source: finalSource,
          type,
          entity,
          total_amount: totalAmount,
          obligations_amount: totalObligationsAmount,
          net_amount: netAmount
        })
        .select();

      if (resourceError) throw resourceError;
      
      if (!resourceData || resourceData.length === 0) {
        throw new Error('لم يتم إنشاء المورد بنجاح');
      }
      
      const resourceId = resourceData[0].id;
      
      // 2. Add resource obligations
      if (obligations.length > 0) {
        const obligationsToInsert = obligations.map(obligation => ({
          resource_id: resourceId,
          amount: obligation.amount,
          description: obligation.description
        }));

        const { error: obligationsError } = await supabase
          .from('resource_obligations')
          .insert(obligationsToInsert);

        if (obligationsError) throw obligationsError;
      }
      
      // 3. Add budget item distributions
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
      
      // 4. Send notification to finance team and admin users
      if (user) {
        // Get users with finance or admin roles
        const { data: financeUsers } = await supabase
          .from('user_roles')
          .select('user_id, roles (name)')
          .or('roles.name.eq.finance,roles.name.eq.admin')
        
        if (financeUsers && financeUsers.length > 0) {
          // Send notification to each finance team member
          for (const financeUser of financeUsers) {
            if (financeUser.user_id !== user.id) { // Don't notify the user who created the resource
              const userData = await supabase.auth.getUser(user.id);
              const userName = userData.data?.user?.email || 'مستخدم';
              
              await sendNewResourceNotification({
                resourceId,
                resourceTitle: entity || finalSource,
                amount: totalAmount,
                userId: financeUser.user_id,
                updatedByUserName: userName
              });
            }
          }
        }
      }
      
      toast.success("تم إضافة المورد بنجاح");
      onSubmit();
    } catch (error: any) {
      console.error("خطأ في حفظ المورد:", error);
      toast.error(error.message || "حدث خطأ أثناء حفظ المورد");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    totalPercentage,
    isValidPercentages,
    handleSubmit
  };
};
