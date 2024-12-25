import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrations = () => {
  return useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      console.log("Fetching registrations from Supabase...");
      const { data: registrationsData, error: registrationsError } = await supabase
        .from("registrations")
        .select("event_id");

      if (registrationsError) {
        console.error("Supabase error fetching registrations:", registrationsError);
        toast.error("حدث خطأ في تحميل التسجيلات");
        throw registrationsError;
      }

      console.log("Registrations fetched successfully, count:", registrationsData?.length);
      
      const registrationCounts = (registrationsData || []).reduce((acc: { [key: string]: number }, registration) => {
        if (registration.event_id) {
          acc[registration.event_id] = (acc[registration.event_id] || 0) + 1;
        }
        return acc;
      }, {});

      console.log("Processed registration counts:", registrationCounts);
      return registrationCounts;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};