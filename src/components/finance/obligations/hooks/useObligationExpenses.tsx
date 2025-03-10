
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ObligationExpense = {
  id: string;
  obligation_id: string;
  amount: number;
  date: string;
  description: string;
  beneficiary?: string;
  reference_document?: string;
  created_at: string;
};

export const useObligationExpenses = (obligationId?: string) => {
  const [expenses, setExpenses] = useState<ObligationExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('obligation_expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (obligationId) {
        query = query.eq('obligation_id', obligationId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setExpenses(data || []);
      
      // Calculate total
      const total = (data || []).reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpenses(total);
    } catch (error) {
      console.error("Error fetching obligation expenses:", error);
      toast.error("حدث خطأ أثناء جلب بيانات مصروفات الالتزامات");
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Omit<ObligationExpense, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('obligation_expenses')
        .insert([expense])
        .select();
      
      if (error) throw error;
      
      toast.success("تم إضافة المصروف بنجاح");
      await fetchExpenses();
      return data[0];
    } catch (error) {
      console.error("Error adding obligation expense:", error);
      toast.error("حدث خطأ أثناء إضافة مصروف للالتزام");
      return null;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [obligationId]);

  return {
    expenses,
    loading,
    totalExpenses,
    addExpense,
    refetch: fetchExpenses
  };
};
