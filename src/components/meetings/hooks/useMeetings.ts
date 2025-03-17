
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Meeting } from '../types';
import { useAuthStore } from '@/store/refactored-auth';
import { toast } from 'sonner';

export const useMeetings = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const { data: meetings = [], isLoading, error } = useQuery({
    queryKey: ['meetings', filter, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('meetings')
        .select('*');
      
      // Filter based on status
      if (filter === 'upcoming') {
        query = query.in('status', ['upcoming', 'in_progress']);
      } else if (filter === 'completed') {
        query = query.eq('status', 'completed');
      }
      
      // Get meetings created by the user or where the user is a participant
      query = query.or(`created_by.eq.${user.id},meeting_participants.user_id.eq.${user.id}`);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching meetings:', error);
        throw error;
      }
      
      return data as Meeting[];
    },
    enabled: !!user,
  });

  // Add createMeeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('meetings')
        .insert(meetingData)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('تم إنشاء الاجتماع بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error) => {
      console.error('Error creating meeting:', error);
      toast.error('حدث خطأ أثناء إنشاء الاجتماع');
    }
  });

  return {
    meetings,
    isLoading,
    error,
    filter,
    setFilter,
    createMeeting: createMeetingMutation.mutate,
    isCreating: createMeetingMutation.isPending
  };
};
