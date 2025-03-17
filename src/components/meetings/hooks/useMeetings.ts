
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Meeting, MeetingFormData } from '../types';
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
      // Using proper OR syntax for PostgREST
      query = query.or(`created_by.eq.${user.id},participants.cs.{${user.id}}`);
      
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
    mutationFn: async (formData: MeetingFormData) => {
      if (!user) throw new Error('User not authenticated');
      
      // Prepare meeting data
      const meetingData = {
        title: formData.title,
        description: formData.objectives || '',
        meeting_type: formData.meeting_type,
        date: formData.date,
        start_time: formData.start_time,
        end_time: calculateEndTime(formData.start_time, formData.duration),
        duration: formData.duration,
        location: formData.location || null,
        meeting_link: formData.meeting_link || null,
        attendance_type: formData.attendance_type,
        objectives: formData.objectives || null,
        status: 'upcoming',
        created_by: user.id
      };
      
      // Insert the meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert(meetingData)
        .select('*')
        .single();

      if (meetingError) throw meetingError;
      
      // Insert agenda items if provided
      if (formData.agenda_items && formData.agenda_items.length > 0) {
        const agendaItems = formData.agenda_items.map((item, index) => ({
          meeting_id: meeting.id,
          title: item.title,
          description: item.description || null,
          order_number: item.order_number || index + 1,
          status: 'pending'
        }));
        
        const { error: agendaError } = await supabase
          .from('meeting_agenda_items')
          .insert(agendaItems);
        
        if (agendaError) {
          console.error('Error adding agenda items:', agendaError);
          // Continue even if agenda items fail, we already have the meeting
        }
      }
      
      // Insert participants if provided
      if (formData.participants && formData.participants.length > 0) {
        const participants = formData.participants.map(p => ({
          meeting_id: meeting.id,
          user_id: p.user_id,
          role: p.role,
          status: 'invited',
          attendance_status: 'pending'
        }));
        
        const { error: participantsError } = await supabase
          .from('meeting_participants')
          .insert(participants);
        
        if (participantsError) {
          console.error('Error adding participants:', participantsError);
          // Continue even if participants fail, we already have the meeting
        }
      }
      
      return meeting;
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

  // Helper function to calculate end time from start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours + Math.floor((minutes + durationMinutes) / 60);
    const endMinutes = (minutes + durationMinutes) % 60;
    
    // Handle day overflow
    endHours = endHours % 24;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

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
