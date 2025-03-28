
import React from 'react';
import { MeetingParticipant } from '@/types/meeting';
import { MeetingParticipantRoleBadge } from './MeetingParticipantRoleBadge';
import { ParticipantRole } from '@/types/meeting';

interface MeetingParticipantDisplayProps {
  participant: MeetingParticipant;
}

export const MeetingParticipantDisplay: React.FC<MeetingParticipantDisplayProps> = ({ 
  participant 
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-medium">{participant.user_display_name}</span>
        <MeetingParticipantRoleBadge role={participant.role as ParticipantRole} />
      </div>
      {participant.title && (
        <div className="text-sm text-gray-600">
          {participant.title}
        </div>
      )}
      <div className="text-sm text-gray-500">
        {participant.user_email}
      </div>
    </div>
  );
};
