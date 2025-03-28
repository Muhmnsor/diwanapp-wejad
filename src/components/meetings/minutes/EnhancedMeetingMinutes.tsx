import React, { useEffect } from 'react';
import { SignatureTable } from '../participants/SignatureTable';
import { MinutesParticipantsTable } from '../participants/MinutesParticipantsTable';
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
  useEffect(() => {
    if (minutes) {
      console.log('EnhancedMeetingMinutes received minutes:', minutes);
      console.log('Has conclusion:', !!minutes.conclusion);
    }
  }, [minutes]);

  // If still loading or no minutes, just render the original content
  if (isLoading) {
    return <>{children}</>;
  }

  // Get the child elements so we can insert the participants list at the right position
  const childrenArray = React.Children.toArray(children);
  
  // Always render the content with participants table right after meeting details
  return (
    <div className="space-y-6">
      {/* First part of children (meeting details) */}
      {childrenArray[0]}
      
      {/* Participants table right after meeting details */}
      <MinutesParticipantsTable meetingId={meetingId} />
      
      {/* Rest of the children (introduction, etc) */}
      {childrenArray.slice(1)}
      
      {minutes && minutes.conclusion && (
        <div className="mt-8">
          <SignatureTable meetingId={meetingId} />
        </div>
      )}
    </div>
  );
};
