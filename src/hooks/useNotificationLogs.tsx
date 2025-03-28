import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNotificationLogs = (eventId?: string, projectId?: string) => {
  return useQuery({
    queryKey: ['notification-logs', eventId, projectId],
    queryFn: async () => {
      console.log('Fetching notification logs for:', { eventId, projectId });
      
      const query = supabase
        .from('notification_logs')
        .select(`
          *,
          registrations (
            arabic_name,
            phone
          ),
          whatsapp_templates (
            name
          )
        `)
        .order('sent_at', { ascending: false });

      if (eventId) {
        query.eq('event_id', eventId);
      }
      if (projectId) {
        query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // تحديث كل 30 ثانية
  });
};