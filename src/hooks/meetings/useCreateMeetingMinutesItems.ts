
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingAgendaItem } from "./useMeetingAgendaItems";

interface CreateMeetingMinutesItemsParams {
  meetingId: string;
  agendaItems: MeetingAgendaItem[];
}

export const useCreateMeetingMinutesItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateMeetingMinutesItemsParams) => {
      const { meetingId, agendaItems } = params;
      
      // Check if meeting minutes items already exist for this meeting
      const { data: existingItems, error: checkError } = await supabase
        .from('meeting_minutes_items')
        .select('id')
        .eq('meeting_id', meetingId);
      
      if (checkError) {
        console.error('Error checking existing minutes items:', checkError);
        throw checkError;
      }
      
      // If items already exist, don't create new ones
      if (existingItems && existingItems.length > 0) {
        console.log('Meeting minutes items already exist for this meeting');
        return existingItems;
      }
      
      // Prepare items to insert
      const items = agendaItems.map((item, index) => ({
        meeting_id: meetingId,
        agenda_item_id: item.id,
        content: '',
        order_number: index + 1,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }));
      
      const { data, error } = await supabase
        .from('meeting_minutes_items')
        .insert(items)
        .select();
      
      if (error) {
        console.error('Error creating meeting minutes items:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-minutes-items', variables.meetingId] });
    }
  });
};
