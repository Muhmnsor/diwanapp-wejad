import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrationFields = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['registration-fields', eventId],
    queryFn: async () => {
      console.log('Fetching registration fields for:', eventId);
      try {
        const { data: eventFields, error: eventFieldsError } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', eventId)
          .maybeSingle();

        if (eventFieldsError) {
          console.error('Error fetching registration fields:', eventFieldsError);
          throw eventFieldsError;
        }

        console.log('Raw registration fields from database:', eventFields);
        
        // If no fields are found, use default fields
        if (!eventFields) {
          const defaultFields = {
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
          console.log('No registration fields found, using defaults:', defaultFields);
          return defaultFields;
        }

        // Convert database boolean values to actual booleans
        const fields = {
          arabic_name: Boolean(eventFields.arabic_name),
          email: Boolean(eventFields.email),
          phone: Boolean(eventFields.phone),
          english_name: Boolean(eventFields.english_name),
          education_level: Boolean(eventFields.education_level),
          birth_date: Boolean(eventFields.birth_date),
          national_id: Boolean(eventFields.national_id),
          gender: Boolean(eventFields.gender),
          work_status: Boolean(eventFields.work_status)
        };

        console.log('Using configured registration fields:', fields);
        return fields;

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