import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/refactored-auth";

export interface MeetingMinutes {
  id?: string;
  meeting_id: string;
  introduction?: string;
  conclusion?: string;
  author_id?: string;
  author_name?: string;
  created_at?: string;
  updated_at?: string;
  agenda_notes?: Record<string, string>; // Map of agenda_item_id to notes
  attachments?: string[]; // URLs to attachments
}

export const useMeetingMinutes = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting-minutes', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();
        
      if (error && error.code !== 'PGSQL_ERROR') {
        console.error('Error fetching meeting minutes:', error);
        if (error.code === 'PGSQL_ERROR' || error.message.includes('No rows found')) {
          return { meeting_id: meetingId, agenda_notes: {} } as MeetingMinutes;
        }
        throw error;
      }
      
      if (data && data.agenda_notes && typeof data.agenda_notes === 'string') {
        try {
          data.agenda_notes = JSON.parse(data.agenda_notes);
        } catch (e) {
          console.error('Error parsing agenda notes:', e);
          data.agenda_notes = {};
        }
      }
      
      return data as MeetingMinutes || { meeting_id: meetingId, agenda_notes: {} };
    },
    enabled: !!meetingId,
  });
};

export const useSaveMeetingMinutes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (minutes: MeetingMinutes) => {
      if (user?.id && !minutes.author_id) {
        minutes.author_id = user.id;
        minutes.author_name = user.display_name || user.email;
      }

      const minutesToSave = { 
        ...minutes,
        agenda_notes: typeof minutes.agenda_notes === 'object' 
          ? JSON.stringify(minutes.agenda_notes) 
          : minutes.agenda_notes,
        updated_at: new Date().toISOString()
      };
      
      const { data: existingMinutes } = await supabase
        .from('meeting_minutes')
        .select('id')
        .eq('meeting_id', minutes.meeting_id)
        .single();
      
      if (existingMinutes?.id) {
        const { data, error } = await supabase
          .from('meeting_minutes')
          .update(minutesToSave)
          .eq('id', existingMinutes.id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('meeting_minutes')
          .insert({ ...minutesToSave, created_at: new Date().toISOString() })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      toast.success('تم حفظ محضر الاجتماع بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting-minutes', data.meeting_id] });
    },
    onError: (error) => {
      console.error('Error saving meeting minutes:', error);
      toast.error('حدث خطأ أثناء حفظ محضر الاجتماع');
    }
  });
};
