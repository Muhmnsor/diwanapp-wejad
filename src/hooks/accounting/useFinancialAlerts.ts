// src/hooks/accounting/useFinancialAlerts.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, differenceInDays } from "date-fns";

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  type: "warning" | "info" | "success";
  date: Date;
}

export const useFinancialAlerts = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      const newAlerts: AlertItem[] = [];
      
      try {
        // 1. التحقق من اقتراب موعد إغلاق الفترة المحاسبية
        const { data: periods } = await supabase
          .from("accounting_periods")
          .select("*")
          .eq("is_closed", false)
          .order("end_date", { ascending: true })
          .limit(1);
          
        if (periods && periods.length > 0) {
          const currentPeriod = periods[0];
          const daysRemaining = differenceInDays(
            new Date(currentPeriod.end_date),
            new Date()
          );
          
          if (daysRemaining <= 7) {
            newAlerts.push({
              id: `period-${currentPeriod.id}`,
              title: "اقتراب موعد إغلاق الفترة المحاسبية",
              description: `الفترة المحاسبية "${currentPeriod.name}" ستنتهي خلال ${daysRemaining} أيام. تأكد من ترحيل جميع القيود المعلقة.`,
              type: "warning",
              date: new Date()
            });
          }
        }
        
        // 2. التحقق من تغيرات الإيرادات مقارنة بالشهر السابق
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        // حساب إجمالي الإيرادات للشهر الحالي
        const { data: currentMonthResources } = await supabase
          .from("financial_resources")
          .select("total_amount")
          .gte("date", `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)
          .lt("date", `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-01`);
          
        // حساب إجمالي الإيرادات للشهر السابق
        const { data: lastMonthResources } = await supabase
          .from("financial_resources")
          .select("total_amount")
          .gte("date", `${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}-01`)
          .lt("date", `${currentMonth === 0 ? currentYear : currentYear}-${String(currentMonth === 0 ? 1 : currentMonth + 1).padStart(2, '0')}-01`);
          
        const currentMonthTotal = currentMonthResources?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0;
        const lastMonthTotal = lastMonthResources?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0;
        
        if (lastMonthTotal > 0) {
          const percentageChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
          
          if (percentageChange >= 10) {
            newAlerts.push({
              id: `revenue-increase-${Date.now()}`,
              title: "زيادة في الإيرادات",
              description: `ارتفعت الإيرادات بنسبة ${percentageChange.toFixed(1)}% مقارنة بالشهر الماضي.`,
              type: "success",
              date: new Date()
            });
          } else if (percentageChange <= -10) {
            newAlerts.push({
              id: `revenue-decrease-${Date.now()}`,
              title: "انخفاض في الإيرادات",
              description: `انخفضت الإيرادات بنسبة ${Math.abs(percentageChange).toFixed(1)}% مقارنة بالشهر الماضي.`,
              type: "warning",
              date: new Date()
            });
          }
        }
        
        // 3. حساب نسبة السيولة (إجمالي الإيرادات - إجمالي المصروفات) / إجمالي الإيرادات
        const { data: totalResourcesData } = await supabase
          .from("financial_resources")
          .select("sum(total_amount)")
          .single();
          
        const { data: totalExpensesData } = await supabase
          .from("accounting_journal_entries")
          .select("sum(total_amount)")
          .eq("status", "approved")
          .single();
          
        const totalResources = totalResourcesData?.sum || 0;
        const totalExpenses = totalExpensesData?.sum || 0;
        
        if (totalResources > 0) {
          const liquidityRatio = (totalResources - totalExpenses) / totalResources;
          
          if (liquidityRatio < 0.2) {
            newAlerts.push({
              id: `low-liquidity-${Date.now()}`,
              title: "انخفاض نسبة السيولة",
              description: `نسبة السيولة الحالية ${(liquidityRatio * 100).toFixed(1)}% وهي منخفضة بشكل قد يؤثر على العمليات.`,
              type: "warning",
              date: new Date()
            });
          }
        }
        
        // 4. التحقق من تحقيق المستهدفات المالية
        const { data: targets } = await supabase
          .from("financial_targets")
          .select("*")
          .eq("year", currentYear);
          
        if (targets && targets.length > 0) {
          const totalTargetAmount = targets.reduce((sum, target) => sum + (target.target_amount || 0), 0);
          const totalActualAmount = targets.reduce((sum, target) => sum + (target.actual_amount || 0), 0);
          
          if (totalTargetAmount > 0) {
            const achievementPercentage = (totalActualAmount / totalTargetAmount) * 100;
            
            if (achievementPercentage >= 90) {
              newAlerts.push({
                id: `target-achievement-${Date.now()}`,
                title: "تحقيق أهداف مالية",
                description: `تم تحقيق ${achievementPercentage.toFixed(1)}% من المستهدفات المالية للعام الحالي.`,
                type: "success",
                date: new Date()
              });
            } else if (achievementPercentage <= 40 && new Date().getMonth() >= 5) {
              // إذا كنا في منتصف العام وتحقيق المستهدفات أقل من 40%
              newAlerts.push({
                id: `target-underachievement-${Date.now()}`,
                title: "تحذير: تأخر في تحقيق المستهدفات المالية",
                description: `تم تحقيق ${achievementPercentage.toFixed(1)}% فقط من المستهدفات المالية للعام الحالي.`,
                type: "warning",
                date: new Date()
              });
            }
          }
        }
        
        setAlerts(newAlerts);
      } catch (error) {
        console.error("Error fetching financial alerts:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAlerts();
    
    // تحديث البيانات كل 24 ساعة
    const intervalId = setInterval(fetchAlerts, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return { alerts, loading };
};

