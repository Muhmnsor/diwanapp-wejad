import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrationFields = (eventId?: string) => {
  return useQuery({
    queryKey: ['registration-fields', eventId],
    queryFn: async () => {
      console.log('🔍 Fetching registration fields for:', eventId);
      
      try {
        // أولاً، نتحقق من نوع النموذج (فعالية أم مشروع)
        const { data: eventData } = await supabase
          .from('events')
          .select('is_project_activity, project_id')
          .eq('id', eventId)
          .single();

        console.log('📊 Event data:', eventData);

        let fieldsQuery;
        
        if (eventData?.is_project_activity || eventData?.project_id) {
          // إذا كان نشاط مشروع أو جزء من مشروع
          fieldsQuery = supabase
            .from('project_registration_fields')
            .select('*')
            .eq('project_id', eventData.project_id)
            .single();
        } else {
          // إذا كان فعالية عادية
          fieldsQuery = supabase
            .from('event_registration_fields')
            .select('*')
            .eq('event_id', eventId)
            .single();
        }

        const { data: fields, error } = await fieldsQuery;

        if (error) {
          console.error('❌ Error fetching registration fields:', error);
          throw error;
        }

        // الحقول الافتراضية - دائماً مطلوبة
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

        // إذا لم نجد حقولاً مخصصة، نستخدم الحقول الافتراضية
        if (!fields) {
          console.log('ℹ️ No custom fields found, using defaults:', defaultFields);
          return defaultFields;
        }

        // دمج الحقول المخصصة مع الحقول الإلزامية
        const processedFields = {
          ...defaultFields,
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
    staleTime: 1000 * 60 * 5 // تخزين مؤقت لمدة 5 دقائق
  });
};