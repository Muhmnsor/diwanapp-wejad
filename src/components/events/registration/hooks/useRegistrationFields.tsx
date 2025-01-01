import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrationFields = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['registration-fields', eventId],
    queryFn: async () => {
      console.log('🔍 Fetching registration fields for event:', eventId);
      
      if (!eventId) {
        console.error('❌ No event ID provided');
        return null;
      }

      try {
        const { data: eventFields, error } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', eventId)
          .single();

        if (error) {
          console.error('❌ Error fetching registration fields:', error);
          throw error;
        }

        console.log('📝 Raw registration fields from database:', eventFields);

        // إذا لم نجد حقول مخصصة، نستخدم القيم الافتراضية
        if (!eventFields) {
          console.log('ℹ️ No custom fields found, using defaults');
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

        // تحويل القيم من قاعدة البيانات إلى قيم منطقية
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

        console.log('✅ Processed registration fields:', fields);
        return fields;

      } catch (error) {
        console.error('❌ Failed to fetch registration fields:', error);
        toast.error('حدث خطأ في تحميل نموذج التسجيل');
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    meta: {
      errorMessage: 'حدث خطأ في تحميل نموذج التسجيل'
    }
  });
};