import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        console.log("🔄 محاولة جلب الفعاليات...");
        
        // جلب الفعاليات التي ليست مرتبطة بمشاريع
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select(`
            *,
            project_events!left (
              project_id
            )
          `)
          .is('is_project_activity', false)
          .is('project_events.project_id', null)
          .order("date", { ascending: true });

        if (eventsError) {
          console.error("❌ خطأ في جلب الفعاليات:", eventsError);
          toast.error("حدث خطأ في تحميل الفعاليات");
          throw eventsError;
        }

        // تسجيل معلومات الفعاليات المسترجعة
        console.log("✅ تم جلب الفعاليات المستقلة بنجاح:", {
          totalCount: eventsData?.length,
          events: eventsData?.map(event => ({
            id: event.id,
            title: event.title,
            is_project_activity: event.is_project_activity,
            has_project: event.project_events?.length > 0
          }))
        });

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