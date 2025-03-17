
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingAgendaItem, MeetingParticipant, MeetingTask, MeetingDecision, MeetingAttachment } from "../types";
import { toast } from "sonner";

export const useMeetingDetails = (meetingId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch meeting details
  const { data: meeting, isLoading: isLoadingMeeting } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async () => {
      if (!meetingId) return null;

      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (error) {
        console.error('Error fetching meeting:', error);
        throw error;
      }

      return data;
    },
    enabled: !!meetingId,
  });

  // Fetch meeting participants
  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['meeting_participants', meetingId],
    queryFn: async () => {
      if (!meetingId) return [];

      const { data, error } = await supabase
        .from('meeting_participants')
        .select(`
          *,
          profiles:user_id (
            id,
            display_name,
            email
          )
        `)
        .eq('meeting_id', meetingId);

      if (error) {
        console.error('Error fetching participants:', error);
        throw error;
      }

      // Format the data to match our type expectations
      return data.map(p => ({
        ...p,
        user: p.profiles
      })) as MeetingParticipant[];
    },
    enabled: !!meetingId,
  });

  // Fetch meeting agenda items
  const { data: agendaItems = [], isLoading: isLoadingAgenda } = useQuery({
    queryKey: ['meeting_agenda_items', meetingId],
    queryFn: async () => {
      if (!meetingId) return [];

      const { data, error } = await supabase
        .from('meeting_agenda_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_number', { ascending: true });

      if (error) {
        console.error('Error fetching agenda items:', error);
        throw error;
      }

      return data as MeetingAgendaItem[];
    },
    enabled: !!meetingId,
  });

  // Fetch meeting tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['meeting_tasks', meetingId],
    queryFn: async () => {
      if (!meetingId) return [];

      const { data, error } = await supabase
        .from('meeting_tasks')
        .select(`
          *,
          assignee:profiles!meeting_tasks_assigned_to_fkey (
            display_name,
            email
          )
        `)
        .eq('meeting_id', meetingId);

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      return data as MeetingTask[];
    },
    enabled: !!meetingId,
  });

  // Fetch meeting decisions
  const { data: decisions = [], isLoading: isLoadingDecisions } = useQuery({
    queryKey: ['meeting_decisions', meetingId],
    queryFn: async () => {
      if (!meetingId) return [];

      const { data, error } = await supabase
        .from('meeting_decisions')
        .select(`
          *,
          responsible_user:profiles!meeting_decisions_responsible_user_id_fkey (
            display_name,
            email
          )
        `)
        .eq('meeting_id', meetingId);

      if (error) {
        console.error('Error fetching decisions:', error);
        throw error;
      }

      return data as MeetingDecision[];
    },
    enabled: !!meetingId,
  });

  // Fetch meeting attachments
  const { data: attachments = [], isLoading: isLoadingAttachments } = useQuery({
    queryKey: ['meeting_attachments', meetingId],
    queryFn: async () => {
      if (!meetingId) return [];

      const { data, error } = await supabase
        .from('meeting_attachments')
        .select('*')
        .eq('meeting_id', meetingId);

      if (error) {
        console.error('Error fetching attachments:', error);
        throw error;
      }

      return data as MeetingAttachment[];
    },
    enabled: !!meetingId,
  });

  // Add a participant to the meeting
  const addParticipantMutation = useMutation({
    mutationFn: async (participantData: Omit<MeetingParticipant, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .insert(participantData)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      toast.success('تمت إضافة المشارك بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting_participants', meetingId] });
    },
    onError: (error) => {
      console.error('Error adding participant:', error);
      toast.error('حدث خطأ أثناء إضافة المشارك');
    }
  });

  // Add a task to the meeting
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<MeetingTask, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('meeting_tasks')
        .insert(taskData)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      toast.success('تمت إضافة المهمة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting_tasks', meetingId] });
    },
    onError: (error) => {
      console.error('Error adding task:', error);
      toast.error('حدث خطأ أثناء إضافة المهمة');
    }
  });

  // Update task status
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: MeetingTask['status'] }) => {
      const { data, error } = await supabase
        .from('meeting_tasks')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      toast.success('تم تحديث حالة المهمة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting_tasks', meetingId] });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    }
  });

  // Add a decision to the meeting
  const addDecisionMutation = useMutation({
    mutationFn: async (decisionData: Omit<MeetingDecision, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('meeting_decisions')
        .insert(decisionData)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      toast.success('تمت إضافة القرار بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting_decisions', meetingId] });
    },
    onError: (error) => {
      console.error('Error adding decision:', error);
      toast.error('حدث خطأ أثناء إضافة القرار');
    }
  });

  return {
    meeting,
    participants,
    agendaItems,
    tasks,
    decisions,
    attachments,
    isLoading: isLoadingMeeting || isLoadingParticipants || isLoadingAgenda || isLoadingTasks || isLoadingDecisions || isLoadingAttachments,
    addParticipant: addParticipantMutation.mutate,
    addTask: addTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    addDecision: addDecisionMutation.mutate,
  };
};
