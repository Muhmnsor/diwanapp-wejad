
import React from 'react';
import { MinutesParticipantsList } from './MinutesParticipantsList';

interface MeetingMinutesParticipantsSectionProps {
  meetingId: string;
}

export const MeetingMinutesParticipantsSection: React.FC<MeetingMinutesParticipantsSectionProps> = ({ 
  meetingId 
}) => {
  return (
    <div className="mb-6">
      <MinutesParticipantsList meetingId={meetingId} />
    </div>
  );
};
