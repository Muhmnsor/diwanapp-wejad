
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MeetingMinutesItem {
  meeting_id: string;
  agenda_item_id: string;
  content: string;
}

export const useCreateMeetingMinutesItems = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: async (items: MeetingMinutesItem[]) => {
      if (!items.length) {
        throw new Error("No items to create");
      }

      // First check if minutes already exist for these agenda items
      const existingMinutesPromises = items.map((item) => {
        return supabase
          .from('meeting_minutes')
          .select('id')
          .eq('meeting_id', item.meeting_id)
          .eq('agenda_item_id', item.agenda_item_id)
          .single();
      });

      const existingResults = await Promise.all(existingMinutesPromises);
      
      // Prepare updates and inserts
      const updates: MeetingMinutesItem[] = [];
      const inserts: MeetingMinutesItem[] = [];
      
      existingResults.forEach((result, index) => {
        if (result.data) {
          // Update existing item
          updates.push({
            ...items[index],
            id: result.data.id
          } as any);
        } else {
          // Insert new item
          inserts.push(items[index]);
        }
      });
      
      // Process updates
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('meeting_minutes')
          .upsert(updates);
          
        if (updateError) throw updateError;
      }
      
      // Process inserts
      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('meeting_minutes')
          .insert(inserts);
          
        if (insertError) throw insertError;
      }
      
      return true;
    },
    onSuccess: (_, variables) => {
      toast.success("تم حفظ المحضر بنجاح");
      
      if (variables.length > 0) {
        queryClient.invalidateQueries({ 
          queryKey: ['meeting-minutes', variables[0].meeting_id] 
        });
      }
    },
    onError: (error) => {
      console.error("Error saving meeting minutes:", error);
      toast.error("حدث خطأ أثناء حفظ المحضر");
    }
  });

  return {
    createMinutesItems: mutate,
    isPending,
    isSuccess,
    isError,
    error
  };
};
