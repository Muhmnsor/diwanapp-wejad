import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrations = () => {
  return useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      try {
        console.log("🔄 جاري جلب التسجيلات...");
        
        const { data, error } = await supabase
          .from("registrations")
          .select("event_id");

        if (error) {
          console.error("❌ خطأ في جلب التسجيلات:", error);
          toast.error("حدث خطأ في تحميل التسجيلات");
          throw error;
        }

        console.log("✅ تم جلب التسجيلات بنجاح، العدد:", data?.length);
        
        // تحويل البيانات إلى تنسيق العد
        const registrationCounts = (data || []).reduce((acc: { [key: string]: number }, registration) => {
          if (registration.event_id) {
            acc[registration.event_id] = (acc[registration.event_id] || 0) + 1;
          }
          return acc;
        }, {});

        console.log("📊 إحصائيات التسجيلات:", registrationCounts);
        return registrationCounts;
      } catch (error) {
        console.error("❌ خطأ غير متوقع:", error);
        toast.error("حدث خطأ في تحميل التسجيلات");
        throw error;
      }
    },
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
};