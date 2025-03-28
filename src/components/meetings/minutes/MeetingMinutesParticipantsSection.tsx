
import React from 'react';
import { MinutesParticipantsList } from './index';

interface MeetingMinutesParticipantsSectionProps {
  meetingId: string;
}

export const MeetingMinutesParticipantsSection: React.FC<MeetingMinutesParticipantsSectionProps> = ({ 
  meetingId 
}) => {
  return <MinutesParticipantsList meetingId={meetingId} />;
};
