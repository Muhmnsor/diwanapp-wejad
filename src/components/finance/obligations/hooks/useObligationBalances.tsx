
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ObligationBalance = {
  obligation_id: string;
  resource_id: string;
  original_amount: number;
  spent_amount: number;
  remaining_balance: number;
  spending_percentage: number;
  resource_source: string;
  resource_date: string;
  description: string;
};

export const useObligationBalances = () => {
  const [balances, setBalances] = useState<ObligationBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOriginal, setTotalOriginal] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('obligation_balances_view')
        .select('*')
        .order('resource_date', { ascending: false });
      
      if (error) throw error;
      
      setBalances(data || []);
      
      // Calculate totals
      if (data) {
        const originalTotal = data.reduce((sum, balance) => sum + balance.original_amount, 0);
        const spentTotal = data.reduce((sum, balance) => sum + balance.spent_amount, 0);
        const remainingTotal = data.reduce((sum, balance) => sum + balance.remaining_balance, 0);
        
        setTotalOriginal(originalTotal);
        setTotalSpent(spentTotal);
        setTotalRemaining(remainingTotal);
      }
    } catch (error) {
      console.error("Error fetching obligation balances:", error);
      toast.error("حدث خطأ أثناء جلب بيانات أرصدة الالتزامات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  return {
    balances,
    loading,
    totalOriginal,
    totalSpent,
    totalRemaining,
    refetch: fetchBalances
  };
};
