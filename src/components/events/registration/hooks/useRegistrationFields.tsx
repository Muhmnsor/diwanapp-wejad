import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrationFields = (eventId?: string) => {
  return useQuery({
    queryKey: ['registration-fields', eventId],
    queryFn: async () => {
      console.log('🔍 Fetching registration fields for:', eventId);
      
      try {
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

        // If fields exist in database, use them
        if (eventFields) {
          console.log('✅ Found fields in event_registration_fields:', eventFields);
          return {
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
        }

        // If no fields found in event_registration_fields, create them with defaults
        console.log('🔄 No fields found, creating default fields for event');
        const { data: newFields, error: insertError } = await supabase
          .from('event_registration_fields')
          .insert({
            event_id: eventId,
            arabic_name: true,
            email: true,
            phone: true,
            english_name: false,
            education_level: false,
            birth_date: false,
            national_id: false,
            gender: false,
            work_status: false
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating default fields:', insertError);
          throw insertError;
        }

        console.log('✅ Created default fields:', newFields);
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