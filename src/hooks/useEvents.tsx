import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      console.log("Fetching events from Supabase...");
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (eventsError) {
        console.error("Supabase error fetching events:", eventsError);
        toast.error("حدث خطأ في تحميل الفعاليات");
        throw eventsError;
      }

      console.log("Events fetched successfully, count:", eventsData?.length);
      return eventsData || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};