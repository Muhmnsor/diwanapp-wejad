
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
        .eq('meeting_id', meetingId);
        
      if (error) {
        console.error('Error fetching meeting minutes:', error);
        throw error;
      }
      
      // If no data found, return a default object
      if (!data || data.length === 0) {
        console.log('No meeting minutes found, returning default object');
        return { meeting_id: meetingId, agenda_notes: {} } as MeetingMinutes;
      }
      
      const minutes = data[0] as MeetingMinutes;
      
      // Parse the agenda_notes if it's a string
      if (minutes.agenda_notes && typeof minutes.agenda_notes === 'string') {
        try {
          minutes.agenda_notes = JSON.parse(minutes.agenda_notes);
        } catch (e) {
          console.error('Error parsing agenda notes:', e);
          minutes.agenda_notes = {};
        }
      }
      
      console.log('Fetched meeting minutes:', minutes);
      return minutes;
    },
    enabled: !!meetingId,
  });
};

export const useSaveMeetingMinutes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (minutes: MeetingMinutes) => {
      console.log('Saving minutes:', minutes);
      
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
      
      console.log('Minutes to save:', minutesToSave);
      
      // Check if minutes already exist for this meeting
      const { data: existingMinutes, error: fetchError } = await supabase
        .from('meeting_minutes')
        .select('id')
        .eq('meeting_id', minutes.meeting_id);
      
      if (fetchError) {
        console.error('Error checking existing minutes:', fetchError);
        throw fetchError;
      }
      
      if (existingMinutes && existingMinutes.length > 0) {
        console.log('Updating existing minutes:', existingMinutes[0].id);
        const { data, error } = await supabase
          .from('meeting_minutes')
          .update(minutesToSave)
          .eq('id', existingMinutes[0].id)
          .select()
          .single();
          
        if (error) {
          console.error('Error updating meeting minutes:', error);
          throw error;
        }
        
        console.log('Updated minutes:', data);
        return data;
      } else {
        console.log('Creating new minutes');
        const { data, error } = await supabase
          .from('meeting_minutes')
          .insert({ ...minutesToSave, created_at: new Date().toISOString() })
          .select()
          .single();
          
        if (error) {
          console.error('Error creating meeting minutes:', error);
          throw error;
        }
        
        console.log('Created minutes:', data);
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
