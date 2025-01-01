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
        
        // Always return default fields if no specific fields are found
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

        // If no fields are found, use default fields
        if (!eventFields) {
          console.log('No registration fields found, using defaults:', defaultFields);
          return defaultFields;
        }

        // Process the fields to ensure boolean values
        const processedFields = {
          arabic_name: eventFields.arabic_name === true || eventFields.arabic_name === 't',
          email: eventFields.email === true || eventFields.email === 't',
          phone: eventFields.phone === true || eventFields.phone === 't',
          english_name: eventFields.english_name === true || eventFields.english_name === 't',
          education_level: eventFields.education_level === true || eventFields.education_level === 't',
          birth_date: eventFields.birth_date === true || eventFields.birth_date === 't',
          national_id: eventFields.national_id === true || eventFields.national_id === 't',
          gender: eventFields.gender === true || eventFields.gender === 't',
          work_status: eventFields.work_status === true || eventFields.work_status === 't'
        };

        console.log('Processed registration fields:', processedFields);
        return processedFields;
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