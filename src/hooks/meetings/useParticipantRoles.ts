
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ParticipantRole } from "@/types/meeting";

interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  user_email: string;
  user_display_name: string;
  role: ParticipantRole;
  attendance_status: string;
  created_at: string;
  updated_at: string;
}

export const useParticipantRoles = (meetingId: string) => {
  const { data: participants = [], ...rest } = useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      return data as MeetingParticipant[];
    },
    enabled: !!meetingId,
  });

  const hasChairman = participants.some(p => p.role === 'chairman');
  const hasSecretary = participants.some(p => p.role === 'secretary');
  
  const availableRoles: ParticipantRole[] = ['member', 'observer'];
  
  if (!hasChairman) {
    availableRoles.unshift('chairman');
  }
  
  if (!hasSecretary) {
    // If there's no secretary, add it before member (after chairman if exists)
    const chairmanIndex = availableRoles.indexOf('chairman');
    if (chairmanIndex >= 0) {
      availableRoles.splice(chairmanIndex + 1, 0, 'secretary');
    } else {
      availableRoles.unshift('secretary');
    }
  }
  
  return {
    participants,
    hasChairman,
    hasSecretary,
    availableRoles,
    ...rest
  };
};
