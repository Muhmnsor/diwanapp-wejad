
import React, { useEffect } from 'react';
import { SignatureTable } from '../participants/SignatureTable';
import { MinutesParticipantsTable } from '../participants/MinutesParticipantsTable';
import { MeetingMinutes } from '@/hooks/meetings/useMeetingMinutes';
import { useMeeting } from '@/hooks/meetings/useMeeting';
import { formatDuration } from '@/lib/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const { data: meeting } = useMeeting(meetingId);
  
  useEffect(() => {
    if (minutes) {
      console.log('EnhancedMeetingMinutes received minutes:', minutes);
      console.log('Has conclusion:', !!minutes.conclusion);
    }
    
    if (meeting) {
      console.log('EnhancedMeetingMinutes received meeting:', meeting);
    }
  }, [minutes, meeting]);

  // If still loading or no minutes, just render the original content
  if (isLoading) {
    return <>{children}</>;
  }

  // Get the child elements so we can insert the participants list at the right position
  const childrenArray = React.Children.toArray(children);
  
  // Translate attendance type to Arabic
  const getAttendanceTypeInArabic = (type: string | undefined) => {
    if (!type) return "غير محدد";
    
    switch (type) {
      case 'in_person':
        return 'حضوري';
      case 'virtual':
        return 'افتراضي';
      case 'hybrid':
        return 'مدمج';
      default:
        return type;
    }
  };
  
  // Translate meeting type to Arabic
  const getMeetingTypeInArabic = (type: string | undefined) => {
    if (!type) return "غير محدد";
    
    switch (type) {
      case 'board':
        return 'مجلس إدارة';
      case 'department':
        return 'إدارة';
      case 'team':
        return 'فريق';
      case 'committee':
        return 'لجنة';
      case 'other':
        return 'أخرى';
      default:
        return type;
    }
  };
  
  // Add meeting details card
  const MeetingDetailsCard = () => {
    if (!meeting) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>تفاصيل الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {meeting.location && (
              <div className="flex justify-between">
                <span className="font-semibold">المكان:</span>
                <span>{meeting.location || "غير محدد"}</span>
              </div>
            )}
            
            {meeting.attendance_type && (
              <div className="flex justify-between">
                <span className="font-semibold">نوع الحضور:</span>
                <span>{getAttendanceTypeInArabic(meeting.attendance_type)}</span>
              </div>
            )}
            
            {meeting.meeting_type && (
              <div className="flex justify-between">
                <span className="font-semibold">نوع الاجتماع:</span>
                <span>{getMeetingTypeInArabic(meeting.meeting_type)}</span>
              </div>
            )}
            
            {meeting.duration && (
              <div className="flex justify-between">
                <span className="font-semibold">المدة:</span>
                <span>{formatDuration(meeting.duration)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Always render the content with participants table right after meeting details
  return (
    <div className="space-y-6">
      {/* First part of children (meeting details) */}
      {childrenArray[0]}
      
      {/* Add additional meeting details */}
      <MeetingDetailsCard />
      
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
