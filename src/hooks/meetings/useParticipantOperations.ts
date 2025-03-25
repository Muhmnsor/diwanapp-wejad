
import { v4 as uuidv4 } from 'uuid';
import { ParticipantRole, AttendanceStatus } from '@/types/meeting';
import { useAddMeetingParticipant } from './useAddMeetingParticipant';
import { User } from '@supabase/auth-ui-shared';

type ParticipantInput = {
  user_email: string;
  user_display_name: string;
  role: ParticipantRole;
  attendance_status: AttendanceStatus;
};

interface UserInfo {
  id: string;
  display_name: string;
  email: string;
}

export const useParticipantOperations = () => {
  const addParticipantMutation = useAddMeetingParticipant();

  // This function will be used to add a participant from the MeetingParticipantsTab
  const addParticipant = (meetingId: string, participant: ParticipantInput) => {
    // Generate a UUID for user_id since it's required by the mutation
    const completeParticipant = {
      ...participant,
      user_id: uuidv4(), // Add the required user_id field
    };

    return addParticipantMutation.mutate({
      meetingId,
      participant: completeParticipant
    });
  };

  // This function helps convert a User to UserInfo interface
  const convertUserToUserInfo = (user: User): UserInfo => {
    return {
      id: user.id,
      display_name: user.user_metadata?.display_name || user.email || '',
      email: user.email || '',
    };
  };

  return {
    addParticipant,
    isPending: addParticipantMutation.isPending,
    convertUserToUserInfo,
  };
};
