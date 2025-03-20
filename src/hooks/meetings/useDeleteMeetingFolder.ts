
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteMeetingFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from('meeting_folders')
        .delete()
        .eq('id', folderId);
        
      if (error) throw error;
      
      return folderId;
    },
    onSuccess: () => {
      toast.success("تم حذف التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meetingFolders'] });
    },
    onError: (error) => {
      console.error("Error deleting folder:", error);
      toast.error("حدث خطأ أثناء حذف التصنيف");
    }
  });
};
