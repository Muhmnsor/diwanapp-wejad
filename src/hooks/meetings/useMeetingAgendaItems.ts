
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AgendaItem } from '@/types/meeting';

export const useMeetingAgendaItems = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting-agenda-items', meetingId],
    queryFn: async () => {
      console.log(`Fetching agenda items for meeting ID: ${meetingId}`);
      
      const { data, error } = await supabase
        .from('meeting_agenda_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order', { ascending: true });
        
      if (error) {
        console.error('Error fetching meeting agenda items:', error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} agenda items`);
      return data as AgendaItem[];
    },
    enabled: !!meetingId,
  });
};

export const useAddAgendaItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<AgendaItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('meeting_agenda_items')
        .insert(item)
        .select()
        .single();
        
      if (error) {
        console.error('Error adding meeting agenda item:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success('تم إضافة بند جديد بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting-agenda-items', data.meeting_id] });
    },
    onError: (error) => {
      console.error('Error in useAddAgendaItem:', error);
      toast.error('حدث خطأ أثناء إضافة البند');
    }
  });
};

export const useUpdateAgendaItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Partial<AgendaItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('meeting_agenda_items')
        .update(item)
        .eq('id', item.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating meeting agenda item:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success('تم تحديث البند بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting-agenda-items', data.meeting_id] });
    },
    onError: (error) => {
      console.error('Error in useUpdateAgendaItem:', error);
      toast.error('حدث خطأ أثناء تحديث البند');
    }
  });
};

export const useDeleteAgendaItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, meetingId }: { id: string, meetingId: string }) => {
      const { error } = await supabase
        .from('meeting_agenda_items')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting meeting agenda item:', error);
        throw error;
      }
      
      return { id, meetingId };
    },
    onSuccess: (data) => {
      toast.success('تم حذف البند بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting-agenda-items', data.meetingId] });
    },
    onError: (error) => {
      console.error('Error in useDeleteAgendaItem:', error);
      toast.error('حدث خطأ أثناء حذف البند');
    }
  });
};
