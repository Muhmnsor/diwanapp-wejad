
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Request } from "../types/request.types";

export const useIncomingRequests = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["incoming-requests"],
    queryFn: async (): Promise<Request[]> => {
      console.log("فحص الطلبات الواردة...");
      
      try {
        const { data, error } = await supabase
          .from("incoming_requests_view")
          .select("*");
          
        if (error) {
          console.error("خطأ في جلب الطلبات الواردة:", error);
          toast.error("حدث خطأ أثناء تحميل الطلبات الواردة");
          throw error;
        }
        
        console.log(`تم جلب ${data?.length || 0} طلبات واردة`);
        return data || [];
      } catch (err) {
        console.error("استثناء غير متوقع في جلب الطلبات الواردة:", err);
        toast.error("حدث خطأ أثناء تحميل الطلبات الواردة");
        return [];
      }
    },
    refetchOnWindowFocus: false
  });

  return {
    incomingRequests: data || [],
    isLoading,
    error,
    refetch
  };
};
