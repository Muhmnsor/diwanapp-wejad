
import { Meeting } from "@/types/meeting";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  FileText,
  Flag,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatTime, formatDuration } from "@/lib/dateUtils";

interface MeetingInfoProps {
  meeting: Meeting;
}

export const MeetingInfo = ({ meeting }: MeetingInfoProps) => {
  const getMeetingTypeName = (type: string) => {
    switch (type) {
      case 'board':
        return 'مجلس إدارة';
      case 'department':
        return 'قسم';
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
  
  const getMeetingStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50">مجدول</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50">جاري</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50">مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50">ملغي</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };
  
  const getAttendanceTypeName = (type: string) => {
    switch (type) {
      case 'in_person':
        return 'حضوري';
      case 'virtual':
        return 'افتراضي';
      case 'hybrid':
        return 'مختلط';
      default:
        return type;
    }
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium ml-1">التاريخ:</span>
            <span>{formatDate(meeting.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium ml-1">الوقت:</span>
            <span>{formatTime(meeting.start_time)} (مدة {formatDuration(meeting.duration)})</span>
          </div>
          
          {meeting.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium ml-1">المكان:</span>
              <span>{meeting.location}</span>
            </div>
          )}
          
          {meeting.meeting_link && (
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium ml-1">رابط الاجتماع:</span>
              <a 
                href={meeting.meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {meeting.meeting_link}
              </a>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium ml-1">النوع:</span>
            <span>{getMeetingTypeName(meeting.meeting_type)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium ml-1">نوع الحضور:</span>
            <span>{getAttendanceTypeName(meeting.attendance_type)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium ml-1">الحالة:</span>
            {getMeetingStatusBadge(meeting.meeting_status)}
          </div>
        </div>
        
        {meeting.objectives && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <span className="font-medium block mb-2">الأهداف:</span>
                <p className="text-muted-foreground whitespace-pre-line">{meeting.objectives}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
