
import React from 'react';
import { useMeeting } from '@/hooks/meetings/useMeeting';
import { useMeetingMinutes } from '@/hooks/meetings/useMeetingMinutes';
import { EnhancedMeetingMinutes } from '../../minutes/EnhancedMeetingMinutes';

interface MeetingMinutesTabProps {
  meetingId: string;
}

export const MeetingMinutesTab: React.FC<MeetingMinutesTabProps> = ({ meetingId }) => {
  const { data: meeting, isLoading: isMeetingLoading } = useMeeting(meetingId);
  const { data: minutes, isLoading: isMinutesLoading } = useMeetingMinutes(meetingId);

  if (isMeetingLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="mr-2">جاري تحميل بيانات الاجتماع...</span>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">لم يتم العثور على بيانات الاجتماع</p>
      </div>
    );
  }

  return (
    <EnhancedMeetingMinutes 
      meetingId={meetingId}
      meeting={meeting}
      minutes={minutes}
      isLoading={isMinutesLoading}
    />
  );
};
