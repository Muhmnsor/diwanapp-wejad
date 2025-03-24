
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Clock, MapPin, Link as LinkIcon, Calendar } from "lucide-react";
import { Meeting } from "@/types/meeting";
import { formatDate } from "@/utils/dateUtils";

interface MeetingDetailsProps {
  meeting: Meeting;
}

export const MeetingDetails: React.FC<MeetingDetailsProps> = ({ meeting }) => {
  const getAttendanceTypeLabel = (type: string) => {
    switch (type) {
      case 'in_person': return 'حضوري';
      case 'virtual': return 'افتراضي';
      case 'hybrid': return 'مختلط';
      default: return type;
    }
  };
  
  const getMeetingStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'مجدول';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>تفاصيل الاجتماع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="font-medium">التاريخ:</span>
              <span>{formatDate(meeting.date)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="font-medium">التوقيت:</span>
              <span>{meeting.start_time} ({meeting.duration} دقيقة)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-gray-500" />
              <span className="font-medium">الحالة:</span>
              <span>{getMeetingStatusLabel(meeting.meeting_status)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-gray-500" />
              <span className="font-medium">نوع الحضور:</span>
              <span>{getAttendanceTypeLabel(meeting.attendance_type)}</span>
            </div>
            
            {meeting.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">المكان:</span>
                <span>{meeting.location}</span>
              </div>
            )}
            
            {meeting.meeting_link && (
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">رابط الاجتماع:</span>
                <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{meeting.meeting_link}</a>
              </div>
            )}
            
            {meeting.folder_name && (
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">التصنيف:</span>
                <span>{meeting.folder_name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Add a description section if needed */}
      {meeting.objectives && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>وصف الاجتماع</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{meeting.objectives}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
