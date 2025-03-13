
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAllRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchAllRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching all requests for admin view");
      
      const { data, error: fetchError } = await supabase
        .from("requests")
        .select(`
          *,
          request_type: request_types (*),
          workflow: request_workflows (*),
          requester: profiles (*)
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      console.log("Admin view requests data:", data);
      setRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching all requests:", error);
      setError(error.message || "حدث خطأ أثناء جلب بيانات الطلبات");
      toast.error("فشل في تحميل قائمة الطلبات");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function
  const refreshRequests = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    fetchAllRequests();
  }, [refreshTrigger]);

  return {
    requests,
    isLoading,
    error,
    refreshRequests
  };
};
