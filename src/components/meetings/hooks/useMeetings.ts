import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting, MeetingFormData } from "../types";
import { useAuthStore } from "@/store/refactored-auth"; 
import { toast } from "sonner";

export const useMeetings = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  // Fetch all meetings the user can access
  const { data: meetings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['meetings', filter, user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("No user found, returning empty meetings array");
        return [];
      }
      
      console.log("Fetching meetings for user:", user.id, "with filter:", filter);

      try {
        // Build the query with proper Supabase filter syntax
        let query = supabase
          .from('meetings')
          .select(`
            *,
            meeting_participants!inner(user_id)
          `);
        
        // Apply user filter - fix the previous incorrect syntax
        if (user.id) {
          query = query.or(`created_by.eq.${user.id},meeting_participants.user_id.eq.${user.id}`);
        }
          
        // Apply additional filters based on the selected filter
        if (filter === 'upcoming') {
          query = query.in('status', ['upcoming', 'in_progress']);
        } else if (filter === 'completed') {
          query = query.eq('status', 'completed');
        }

        const { data, error } = await query.order('date', { ascending: true });

        if (error) {
          console.error('Error fetching meetings:', error);
          throw error;
        }

        console.log("Meetings fetched successfully:", data?.length || 0, "meetings found");
        return data as Meeting[];
      } catch (error) {
        console.error('Error in meetings query execution:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Create a new meeting
  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: MeetingFormData) => {
      if (!user) throw new Error('User must be logged in');

      // First, create the meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title: meetingData.title,
          meeting_type: meetingData.meeting_type,
          date: meetingData.date,
          start_time: meetingData.start_time,
          duration: meetingData.duration,
          attendance_type: meetingData.attendance_type,
          location: meetingData.location,
          meeting_link: meetingData.meeting_link,
          objectives: meetingData.objectives,
          created_by: user.id,
          status: 'upcoming'
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Then add participants
      if (meetingData.participants.length > 0) {
        const participantsData = meetingData.participants.map(p => ({
          meeting_id: meeting.id,
          user_id: p.user_id,
          role: p.role
        }));

        const { error: participantsError } = await supabase
          .from('meeting_participants')
          .insert(participantsData);

        if (participantsError) throw participantsError;
      }

      // Add agenda items if provided
      if (meetingData.agenda_items && meetingData.agenda_items.length > 0) {
        const agendaItemsData = meetingData.agenda_items.map(item => ({
          meeting_id: meeting.id,
          title: item.title,
          description: item.description,
          order_number: item.order_number
        }));

        const { error: agendaError } = await supabase
          .from('meeting_agenda_items')
          .insert(agendaItemsData);

        if (agendaError) throw agendaError;
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

  // Update a meeting
  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Meeting> }) => {
      const { data: meeting, error } = await supabase
        .from('meetings')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return meeting;
    },
    onSuccess: () => {
      toast.success('تم تحديث الاجتماع بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error) => {
      console.error('Error updating meeting:', error);
      toast.error('حدث خطأ أثناء تحديث الاجتماع');
    }
  });

  // Delete a meeting
  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success('تم حذف الاجتماع بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error) => {
      console.error('Error deleting meeting:', error);
      toast.error('حدث خطأ أثناء حذف الاجتماع');
    }
  });

  return {
    meetings,
    isLoading,
    error,
    refetch,
    filter,
    setFilter,
    createMeeting: createMeetingMutation.mutate,
    updateMeeting: updateMeetingMutation.mutate,
    deleteMeeting: deleteMeetingMutation.mutate,
    isCreating: createMeetingMutation.isPending,
    isUpdating: updateMeetingMutation.isPending,
    isDeleting: deleteMeetingMutation.isPending,
  };
};
