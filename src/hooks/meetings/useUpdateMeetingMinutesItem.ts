
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingMinutesItem } from "./useMeetingMinutesItems";

interface UpdateMinutesItemParams {
  id: string;
  content: string;
}

export const useUpdateMeetingMinutesItem = (meetingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateMinutesItemParams) => {
      const { id, content } = params;
      
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      const { data, error } = await supabase
        .from('meeting_minutes_items')
        .update({ 
          content,
          updated_at: new Date().toISOString(),
          updated_by: userId
        })
        .eq('id', id)
        .select();
        
      if (error) {
        console.error('Error updating meeting minutes item:', error);
        throw error;
      }
      
      return data[0] as MeetingMinutesItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-minutes-items', meetingId] });
    }
  });
};
