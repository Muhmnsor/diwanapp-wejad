
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MeetingObjective {
  id: string;
  meeting_id: string;
  content: string;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export const useMeetingObjectives = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting-objectives', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_objectives')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_number', { ascending: true });
        
      if (error) throw error;
      
      return data as MeetingObjective[];
    },
    enabled: !!meetingId,
  });
};
