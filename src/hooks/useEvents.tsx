import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        console.log("🔄 محاولة جلب الفعاليات...");
        
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq('is_project_activity', false) // فلترة الأنشطة التابعة للمشاريع
          .order("date", { ascending: true });

        if (eventsError) {
          console.error("❌ خطأ في جلب الفعاليات:", eventsError);
          toast.error("حدث خطأ في تحميل الفعاليات");
          throw eventsError;
        }

        console.log("✅ تم جلب الفعاليات المستقلة فقط، العدد:", eventsData?.length);
        console.log("📊 الفعاليات المستقلة:", eventsData);
        
        return eventsData || [];
      } catch (error) {
        console.error("❌ خطأ غير متوقع في جلب الفعاليات:", error);
        toast.error("حدث خطأ في تحميل الفعاليات");
        throw error;
      }
    },
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};