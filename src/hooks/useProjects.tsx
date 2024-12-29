import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        console.log("🔄 محاولة جلب المشاريع...");
        
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*");

        if (projectsError) {
          console.error("❌ خطأ في جلب المشاريع:", projectsError);
          toast.error("حدث خطأ في تحميل المشاريع");
          throw projectsError;
        }

        console.log("✅ تم جلب المشاريع بنجاح، العدد:", projectsData?.length);
        return projectsData || [];
      } catch (error) {
        console.error("❌ خطأ غير متوقع في جلب المشاريع:", error);
        toast.error("حدث خطأ في تحميل المشاريع");
        throw error;
      }
    },
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};