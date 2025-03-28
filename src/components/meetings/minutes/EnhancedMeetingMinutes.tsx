
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

  // If no minutes or no conclusion, just render the original content
  if (!minutes || !minutes.conclusion) {
    console.log('No meeting minutes or conclusion found, not showing signature table');
    return <>{children}</>;
  }

  // If we have minutes with a conclusion, render the original content plus the signature table
  console.log('Showing signature table for meeting:', meetingId);
  return (
    <div className="space-y-6">
      {children}
      
      <div className="mt-8">
        <SignatureTable meetingId={meetingId} />
      </div>
    </div>
  );
};
