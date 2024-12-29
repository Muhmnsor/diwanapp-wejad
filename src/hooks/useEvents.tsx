import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export const useEvents = () => {
  const { isAdmin } = useAuthStore();

  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        console.log("🔄 محاولة جلب الفعاليات...");
        
        // Get all project events first
        const { data: projectEvents } = await supabase
          .from("project_events")
          .select("event_id");
        
        const projectEventIds = projectEvents?.map(pe => pe.event_id) || [];

        // For regular users, exclude events that belong to projects
        let query = supabase.from("events").select("*");
        
        if (!isAdmin) {
          query = query.not('id', 'in', projectEventIds);
        }

        const { data: eventsData, error: eventsError } = await query;

        if (eventsError) {
          console.error("❌ خطأ في جلب الفعاليات:", eventsError);
          toast.error("حدث خطأ في تحميل الفعاليات");
          throw eventsError;
        }

        console.log("✅ تم جلب الفعاليات بنجاح، العدد:", eventsData?.length);
        return eventsData || [];
      } catch (error) {
        console.error("❌ خطأ غير متوقع في جلب الفعاليات:", error);
        toast.error("حدث خطأ في تحميل الفعاليات");
        throw error;
      }
    },
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};