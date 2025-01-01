import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrationFields = (eventId?: string) => {
  return useQuery({
    queryKey: ['registration-fields', eventId],
    queryFn: async () => {
      console.log('🔍 Fetching registration fields for:', eventId);
      
      try {
        // First check if this is a project activity
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('is_project_activity, project_id')
          .eq('id', eventId)
          .maybeSingle();

        if (eventError) {
          console.error('❌ Error fetching event data:', eventError);
          throw eventError;
        }

        console.log('📊 Event data:', eventData);

        // Always try to get fields from event_registration_fields first
        console.log('🔍 Checking event_registration_fields');
        const { data: eventFields, error: eventFieldsError } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', eventId)
          .maybeSingle();

        if (eventFieldsError) {
          console.error('❌ Error fetching event registration fields:', eventFieldsError);
          throw eventFieldsError;
        }

        if (eventFields) {
          console.log('✅ Found fields in event_registration_fields:', eventFields);
          return eventFields;
        }

        // If no fields found in event_registration_fields, use default fields
        console.log('ℹ️ No fields found, using defaults');
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

        console.log('📝 Using default fields:', defaultFields);
        return defaultFields;

      } catch (error) {
        console.error('❌ Failed to fetch registration fields:', error);
        toast.error('حدث خطأ في تحميل نموذج التسجيل');
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });
};