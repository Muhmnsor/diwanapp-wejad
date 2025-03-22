
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export const useDeleteMeeting = () => {
  return useMutation({
    mutationFn: async (meetingId: string) => {
      console.log(`Deleting meeting: ${meetingId}`);
      
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
        
      if (error) {
        console.error("Error deleting meeting:", error);
        throw error;
      }
      
      toast.success('تم حذف الاجتماع بنجاح');
      return true;
    },
    onError: (error) => {
      console.error("Error in delete mutation:", error);
      toast.error('فشل في حذف الاجتماع');
    }
  });
};
