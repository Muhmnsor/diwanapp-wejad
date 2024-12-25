import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrations = () => {
  return useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      try {
        console.log("🔄 محاولة جلب التسجيلات...");
        
        const { data: registrationsData, error: registrationsError } = await supabase
          .from("registrations")
          .select("event_id");

        if (registrationsError) {
          console.error("❌ خطأ في جلب التسجيلات:", registrationsError);
          toast.error("حدث خطأ في تحميل التسجيلات");
          throw registrationsError;
        }

        console.log("✅ تم جلب التسجيلات بنجاح، العدد:", registrationsData?.length);
        
        const registrationCounts = (registrationsData || []).reduce((acc: { [key: string]: number }, registration) => {
          if (registration.event_id) {
            acc[registration.event_id] = (acc[registration.event_id] || 0) + 1;
          }
          return acc;
        }, {});

        console.log("📊 إحصائيات التسجيلات:", registrationCounts);
        return registrationCounts;
      } catch (error) {
        console.error("❌ خطأ غير متوقع في جلب التسجيلات:", error);
        toast.error("حدث خطأ في تحميل التسجيلات");
        throw error;
      }
    },
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });
};