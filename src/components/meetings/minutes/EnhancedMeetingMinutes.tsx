
import React, { useEffect } from 'react';
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

  // Always render the content without adding participants table
  return (
    <div className="space-y-6">
      {/* Render all child components without modification */}
      {children}
      
      {/* Only add signature table if there's a conclusion */}
      {minutes && minutes.conclusion && (
        <div className="mt-8">
          <SignatureTable meetingId={meetingId} />
        </div>
      )}
    </div>
  );
};
