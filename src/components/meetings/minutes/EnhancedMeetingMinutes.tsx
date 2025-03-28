
import React from 'react';
import { SignatureTable } from '../participants/SignatureTable';
import { MeetingMinutes } from '@/hooks/meetings/useMeetingMinutes';

interface EnhancedMeetingMinutesProps {
  meetingId: string;
  minutes: MeetingMinutes | undefined;
  isLoading: boolean;
  children: React.ReactNode;
}

export const EnhancedMeetingMinutes: React.FC<EnhancedMeetingMinutesProps> = ({
  meetingId,
  minutes,
  isLoading,
  children
}) => {
  // If still loading or no minutes, just render the original content
  if (isLoading || !minutes) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6">
      {children}
      
      {/* Add signature table if the minutes have a conclusion (indicating they're complete) */}
      {minutes.conclusion && (
        <SignatureTable meetingId={meetingId} />
      )}
    </div>
  );
};
