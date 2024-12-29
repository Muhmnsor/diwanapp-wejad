import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProjectActivities = (projectId: string) => {
  return useQuery({
    queryKey: ["project-activities", projectId],
    queryFn: async () => {
      try {
        console.log("🔄 جاري جلب أنشطة المشروع...");
        
        const { data: activitiesData, error: activitiesError } = await supabase
          .from("events")
          .select("*")
          .eq('is_project_activity', true)
          .eq('project_id', projectId)
          .order("date", { ascending: true });

        if (activitiesError) {
          console.error("❌ خطأ في جلب أنشطة المشروع:", activitiesError);
          toast.error("حدث خطأ في تحميل أنشطة المشروع");
          throw activitiesError;
        }

        console.log("✅ تم جلب أنشطة المشروع بنجاح، العدد:", activitiesData?.length);
        return activitiesData || [];
      } catch (error) {
        console.error("❌ خطأ غير متوقع في جلب أنشطة المشروع:", error);
        toast.error("حدث خطأ في تحميل أنشطة المشروع");
        throw error;
      }
    },
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};