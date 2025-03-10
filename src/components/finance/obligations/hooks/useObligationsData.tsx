
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Obligation = {
  id: string;
  resource_id: string;
  amount: number;
  description: string;
  resource_date: string;
  resource_source: string;
  resource_total_amount: number;
  resource_net_amount: number;
  created_at: string;
};

export const useObligationsData = () => {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchObligations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('resource_obligations_view')
        .select('*')
        .order('resource_date', { ascending: false });
      
      if (error) throw error;
      
      setObligations(data || []);
      
      // Calculate total obligations amount
      const total = (data || []).reduce((sum, obligation) => sum + obligation.amount, 0);
      setTotalAmount(total);
    } catch (error) {
      console.error("Error fetching obligations:", error);
      toast.error("حدث خطأ أثناء جلب بيانات الالتزامات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObligations();
  }, []);

  return {
    obligations,
    loading,
    totalAmount,
    refetch: fetchObligations
  };
};
