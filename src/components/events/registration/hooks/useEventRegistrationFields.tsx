import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEventRegistrationFields = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['event-registration-fields', eventId],
    queryFn: async () => {
      console.log('Fetching event registration fields for:', eventId);
      try {
        const { data: fields, error } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', eventId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching registration fields:', error);
          throw error;
        }

        if (!fields) {
          console.log('No registration fields found, using defaults');
          return {
            arabic_name: true,
            email: true,
            phone: true,
            english_name: false,
            education_level: false,
            birth_date: false,
            national_id: false,
            gender: false,
            work_status: false
          };
        }

        const registrationFields = {
          arabic_name: Boolean(fields.arabic_name),
          email: Boolean(fields.email),
          phone: Boolean(fields.phone),
          english_name: Boolean(fields.english_name),
          education_level: Boolean(fields.education_level),
          birth_date: Boolean(fields.birth_date),
          national_id: Boolean(fields.national_id),
          gender: Boolean(fields.gender),
          work_status: Boolean(fields.work_status)
        };

        console.log('Retrieved registration fields:', registrationFields);
        return registrationFields;
      } catch (error) {
        console.error('Failed to fetch registration fields:', error);
        toast.error('حدث خطأ في تحميل نموذج التسجيل');
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });
};