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

        const isProjectActivity = eventData?.is_project_activity || eventData?.project_id;
        console.log('🔄 Is project activity?', isProjectActivity);

        // Fetch fields from appropriate table
        const fieldsQuery = isProjectActivity
          ? supabase
              .from('project_registration_fields')
              .select('*')
              .eq('project_id', eventData?.project_id)
              .maybeSingle()
          : supabase
              .from('event_registration_fields')
              .select('*')
              .eq('event_id', eventId)
              .maybeSingle();

        const { data: fields, error: fieldsError } = await fieldsQuery;

        if (fieldsError) {
          console.error('❌ Error fetching registration fields:', fieldsError);
          throw fieldsError;
        }

        // If no fields found, try to get them from event_registration_fields
        if (!fields || !eventData) {
          console.log('🔍 No fields found, checking event_registration_fields');
          const { data: eventFields, error: eventFieldsError } = await supabase
            .from('event_registration_fields')
            .select('*')
            .eq('event_id', eventId)
            .maybeSingle();

          if (eventFieldsError) {
            console.error('❌ Error fetching event registration fields:', eventFieldsError);
            throw eventFieldsError;
          }

          if (!eventFields) {
            console.log('ℹ️ No fields found, using defaults');
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

          console.log('✅ Found fields in event_registration_fields:', eventFields);
          return eventFields;
        }

        // Process fields based on database settings
        const processedFields = {
          arabic_name: true, // Always required
          email: true, // Always required
          phone: true, // Always required
          english_name: Boolean(fields.english_name),
          education_level: Boolean(fields.education_level),
          birth_date: Boolean(fields.birth_date),
          national_id: Boolean(fields.national_id),
          gender: Boolean(fields.gender),
          work_status: Boolean(fields.work_status)
        };

        console.log('✅ Final registration fields:', processedFields);
        return processedFields;

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