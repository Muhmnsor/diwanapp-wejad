
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingTask } from "@/types/meeting";

export const useMeetingTasks = (meetingId: string | undefined) => {
  return useQuery({
    queryKey: ['meeting-tasks', meetingId],
    queryFn: async () => {
      if (!meetingId) throw new Error("Meeting ID is required");
      
      const { data, error } = await supabase
        .from('meeting_tasks')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching meeting tasks:', error);
        throw error;
      }
      
      return data as MeetingTask[];
    },
    enabled: !!meetingId
  });
};
