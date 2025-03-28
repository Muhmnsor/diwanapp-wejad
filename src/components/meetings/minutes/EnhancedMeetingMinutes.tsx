import React, { useEffect } from 'react';
import { SignatureTable } from '../participants/SignatureTable';
import { MinutesParticipantsTable } from '../participants/MinutesParticipantsTable';
import { MeetingMinutes } from '@/hooks/meetings/useMeetingMinutes';
import { Meeting, MeetingType, AttendanceType } from '@/types/meeting';
import { Card, CardContent } from '@/components/ui/card';
import { formatDuration } from '@/lib/dateUtils';
import { useMeeting } from '@/hooks/meetings/useMeeting';

interface EnhancedMeetingMinutesProps {
  meetingId: string;
  minutes: MeetingMinutes | undefined;
  isLoading: boolean;
  children: React.ReactNode;
}

// تكوين لعرض مكان الاجتماع ونوعه ومدته
const MeetingDetailsCard = ({ meeting }: { meeting: Meeting }) => {
  const getAttendanceTypeLabel = (type: string): string => {
    switch (type) {
      case 'in_person':
        return 'حضوري';
      case 'virtual':
        return 'عن بُعد';
      case 'hybrid':
        return 'مختلط (حضوري وعن بُعد)';
      default:
        return type;
    }
  };

  const getMeetingTypeLabel = (type: string): string => {
    switch (type) {
      case 'board':
        return 'مجلس إدارة';
      case 'department':
        return 'قسم';
      case 'team':
        return 'فريق عمل';
      case 'committee':
        return 'لجنة';
      case 'other':
        return 'أخرى';
      default:
        return type;
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">مكان الاجتماع</p>
          <p className="font-medium">{meeting.location || 'غير محدد'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">نوع الاجتماع</p>
          <p className="font-medium">{getMeetingTypeLabel(meeting.meeting_type)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">نوع الحضور</p>
          <p className="font-medium">{getAttendanceTypeLabel(meeting.attendance_type)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">مدة الاجتماع</p>
          <p className="font-medium">{formatDuration(meeting.duration)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

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
  }, [minutes]);

  // If still loading or no minutes, just render the original content
  if (isLoading) {
    return <>{children}</>;
  }

  // Get the child elements so we can insert the participants list at the right position
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className="space-y-6">
      {/* First part of children (meeting details) */}
      {childrenArray[0]}
      
      {/* إضافة مكان الاجتماع ونوعه ومدته */}
      {meeting && <MeetingDetailsCard meeting={meeting} />}
      
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
