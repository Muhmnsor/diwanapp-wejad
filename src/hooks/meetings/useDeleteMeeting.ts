
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (meetingId: string) => {
      // Delete participants first
      const { error: participantsError } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('meeting_id', meetingId);
      
      if (participantsError) {
        console.error('Error deleting meeting participants:', participantsError);
        throw participantsError;
      }
      
      // Delete agenda items
      const { error: agendaError } = await supabase
        .from('meeting_agenda_items')
        .delete()
        .eq('meeting_id', meetingId);
      
      if (agendaError) {
        console.error('Error deleting meeting agenda items:', agendaError);
        throw agendaError;
      }
      
      // Delete meeting
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
      
      if (error) {
        console.error('Error deleting meeting:', error);
        throw error;
      }
      
      return { meetingId };
    },
    onSuccess: (_, meetingId) => {
      toast.success('تم حذف الاجتماع بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['folder-meetings'] });
      
      // Find the folder ID for this meeting from the cache
      const meetings = queryClient.getQueryData<any[]>(['meetings']);
      const meeting = meetings?.find(m => m.id === meetingId);
      
      if (meeting?.folder_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['folder-meetings', meeting.folder_id] 
        });
      }
      
      // Invalidate meetings count
      queryClient.invalidateQueries({ queryKey: ['meetings-count'] });
    },
    onError: (error) => {
      console.error('Error in meeting deletion:', error);
      toast.error('حدث خطأ أثناء حذف الاجتماع');
    }
  });
};
