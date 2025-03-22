
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingMinutesItem } from "./useMeetingMinutesItems";

interface UpdateMeetingMinutesItemParams {
  id: string;
  content: string;
}

export const useUpdateMeetingMinutesItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateMeetingMinutesItemParams) => {
      const { id, content } = params;
      
      const { data, error } = await supabase
        .from('meeting_minutes_items')
        .update({
          content,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating meeting minutes item:', error);
        throw error;
      }
      
      return data as MeetingMinutesItem;
    },
    onSuccess: (_, variables) => {
      // Get meeting_id from cache to invalidate the correct query
      const queryClient = useQueryClient();
      const meetingMinutesItems = queryClient.getQueryData<MeetingMinutesItem[]>([
        'meeting-minutes-items',
      ]);
      
      const meetingId = meetingMinutesItems?.find(item => item.id === variables.id)?.meeting_id;
      
      if (meetingId) {
        queryClient.invalidateQueries({ queryKey: ['meeting-minutes-items', meetingId] });
      }
    }
  });
};
