
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UpdateMeetingMinutesParams {
  meetingId: string;
  content: string;
}

export const useUpdateMeetingMinutes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateMeetingMinutesParams) => {
      const { meetingId, content } = params;
      
      // First check if minutes exist for this meeting
      const { data: existingMinutes, error: checkError } = await supabase
        .from('meeting_minutes')
        .select('id')
        .eq('meeting_id', meetingId)
        .single();
      
      let result;
      
      if (checkError && checkError.code === 'PGRST116') {
        // No minutes exist yet, create new record
        result = await supabase
          .from('meeting_minutes')
          .insert([
            {
              meeting_id: meetingId,
              content,
              created_by: (await supabase.auth.getUser()).data.user?.id
            }
          ])
          .select()
          .single();
      } else if (checkError) {
        throw checkError;
      } else {
        // Update existing minutes
        result = await supabase
          .from('meeting_minutes')
          .update({
            content,
            updated_by: (await supabase.auth.getUser()).data.user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('meeting_id', meetingId)
          .select()
          .single();
      }
      
      if (result.error) {
        console.error('Error updating meeting minutes:', result.error);
        throw result.error;
      }
      
      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the query to refetch the minutes
      queryClient.invalidateQueries({ queryKey: ['meeting-minutes', variables.meetingId] });
    }
  });
};
