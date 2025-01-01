import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrationFields = (eventId?: string) => {
  return useQuery({
    queryKey: ['registration-fields', eventId],
    queryFn: async () => {
      console.log('🔍 Fetching registration fields for:', eventId);
      
      try {
        // Default fields - all set to true
        const defaultFields = {
          arabic_name: true,
          email: true,
          phone: true,
          english_name: true,
          education_level: true,
          birth_date: true,
          national_id: true,
          gender: true,
          work_status: true
        };

        if (!eventId) {
          console.log('ℹ️ No event ID provided, using defaults:', defaultFields);
          return defaultFields;
        }

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

        // If no event data found, return default fields
        if (!eventData) {
          console.log('ℹ️ No event data found, using defaults:', defaultFields);
          return defaultFields;
        }

        // Determine which table to query based on event type
        const isProjectActivity = eventData.is_project_activity || eventData.project_id;
        console.log('🔄 Is project activity?', isProjectActivity);

        let { data: fields, error: fieldsError } = isProjectActivity
          ? await supabase
              .from('project_registration_fields')
              .select('*')
              .eq('project_id', eventData.project_id)
              .maybeSingle()
          : await supabase
              .from('event_registration_fields')
              .select('*')
              .eq('event_id', eventId)
              .maybeSingle();

        if (fieldsError) {
          console.error('❌ Error fetching registration fields:', fieldsError);
          throw fieldsError;
        }

        // If no custom fields found, use defaults
        if (!fields) {
          console.log('ℹ️ No custom fields found, using defaults:', defaultFields);
          return defaultFields;
        }

        // Always ensure all fields are included and set to true
        const processedFields = {
          ...defaultFields,
          arabic_name: true,      // Always required
          email: true,           // Always required
          phone: true,           // Always required
          english_name: true,    // Now always true
          education_level: true, // Now always true
          birth_date: true,     // Now always true
          national_id: true,    // Now always true
          gender: true,         // Now always true
          work_status: true     // Now always true
        };

        console.log('✅ Final registration fields:', processedFields);
        return processedFields;
      } catch (error) {
        console.error('❌ Failed to fetch registration fields:', error);
        toast.error('حدث خطأ في تحميل نموذج التسجيل');
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });
};