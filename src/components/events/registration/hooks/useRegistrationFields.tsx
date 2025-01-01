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
        let { data: fields, error: fieldsError } = isProjectActivity
          ? await supabase
              .from('project_registration_fields')
              .select('*')
              .eq('project_id', eventData?.project_id)
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

        // If no fields found, create default fields in database
        if (!fields) {
          console.log('ℹ️ No fields found, creating default fields');
          
          const { data: newFields, error: insertError } = isProjectActivity
            ? await supabase
                .from('project_registration_fields')
                .insert({
                  project_id: eventData?.project_id,
                  arabic_name: true,
                  email: true,
                  phone: true
                })
                .select()
                .single()
            : await supabase
                .from('event_registration_fields')
                .insert({
                  event_id: eventId,
                  arabic_name: true,
                  email: true,
                  phone: true
                })
                .select()
                .single();

          if (insertError) {
            console.error('❌ Error creating default fields:', insertError);
            throw insertError;
          }

          fields = newFields;
        }

        // Process fields based on database settings
        const processedFields = {
          arabic_name: true,  // Always required
          email: true,       // Always required
          phone: true,       // Always required
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
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });
};