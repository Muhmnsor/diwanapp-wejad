import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        console.log("🔄 بدء جلب الفعاليات من Supabase...");
        
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });

        if (error) {
          console.error("❌ خطأ في جلب الفعاليات:", error);
          toast.error("حدث خطأ في تحميل الفعاليات");
          throw error;
        }

        console.log("✅ تم جلب الفعاليات بنجاح، العدد:", data?.length);
        return data || [];
      } catch (error) {
        console.error("❌ خطأ غير متوقع:", error);
        toast.error("حدث خطأ في تحميل الفعاليات");
        throw error;
      }
    },
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });
};