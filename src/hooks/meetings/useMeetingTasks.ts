
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingTask, TaskType } from "@/types/meeting";

export const useMeetingTasks = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting-tasks', meetingId],
    queryFn: async () => {
      console.log('Fetching tasks for meeting:', meetingId);
      
      if (!meetingId) {
        console.error('No meeting ID provided to useMeetingTasks');
        throw new Error('Meeting ID is required');
      }
      
      const { data, error } = await supabase
        .from('meeting_tasks')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching meeting tasks:', error);
        throw error;
      }
      
      console.log('Fetched meeting tasks:', data);
      return data as MeetingTask[];
    },
    enabled: !!meetingId,
  });
};
