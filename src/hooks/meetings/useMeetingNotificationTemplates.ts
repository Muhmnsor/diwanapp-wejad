
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMeetingNotificationTemplates = () => {
  return useQuery({
    queryKey: ['meeting-notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('notification_type', 'reminder')
        .eq('target_type', 'event')
        .eq('status', 'active');
        
      if (error) throw error;
      
      return data || [];
    },
  });
};
