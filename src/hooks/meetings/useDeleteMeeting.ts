
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (meetingId: string) => {
      console.log(`Deleting meeting: ${meetingId}`);
      
      if (!meetingId) {
        throw new Error('معرف الاجتماع مطلوب');
      }
      
      // First delete related agenda items
      const { error: agendaError } = await supabase
        .from('meeting_agenda_items')
        .delete()
        .eq('meeting_id', meetingId);
        
      if (agendaError) {
        console.error("Error deleting meeting agenda items:", agendaError);
        throw new Error(`فشل في حذف بنود جدول الأعمال: ${agendaError.message}`);
      }
      
      // Then delete related objectives
      const { error: objectivesError } = await supabase
        .from('meeting_objectives')
        .delete()
        .eq('meeting_id', meetingId);
        
      if (objectivesError) {
        console.error("Error deleting meeting objectives:", objectivesError);
        throw new Error(`فشل في حذف أهداف الاجتماع: ${objectivesError.message}`);
      }
      
      // Finally delete the meeting itself
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
        
      if (error) {
        console.error("Error deleting meeting:", error);
        throw new Error(`فشل في حذف الاجتماع: ${error.message}`);
      }
      
      toast.success('تم حذف الاجتماع بنجاح');
      return true;
    },
    onSuccess: () => {
      // Invalidate meetings queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error: any) => {
      console.error("Error in delete mutation:", error);
      toast.error(error.message || 'فشل في حذف الاجتماع');
    }
  });
};
