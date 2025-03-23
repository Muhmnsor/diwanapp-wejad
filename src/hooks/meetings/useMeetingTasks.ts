
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/meeting";

export const useMeetingTasks = (meetingId: string) => {
  return useQuery({
    queryKey: ['tasks', 'meeting', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      return data as Task[];
    },
    enabled: !!meetingId,
  });
};
