
import React from 'react';
import { MeetingParticipants } from '@/components/meetings/content/MeetingParticipants';

interface MeetingParticipantsContentProps {
  meetingId: string;
}

export const MeetingParticipantsContent: React.FC<MeetingParticipantsContentProps> = ({ meetingId }) => {
  return <MeetingParticipants meetingId={meetingId} />;
};
