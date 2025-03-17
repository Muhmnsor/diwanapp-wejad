
import { Meeting } from "@/types/meeting";
import { Calendar, Clock, MapPin, Video, Users, Link } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

interface MeetingInfoProps {
  meeting: Meeting;
}

export const MeetingInfo = ({ meeting }: MeetingInfoProps) => {
  const formatMeetingDate = (date: string) => {
    try {
      return format(parseISO(date), 'EEEE d MMMM yyyy', { locale: ar });
    } catch (error) {
      console.error('Error formatting date:', error);
      return date;
    }
  };
  
  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case "board": return "مجلس إدارة";
      case "department": return "قسم";
      case "team": return "فريق";
      case "committee": return "لجنة";
      case "other": return "أخرى";
      default: return "اجتماع";
    }
  };
  
  return (
    <div className="bg-muted/10 p-6 rounded-lg border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">التاريخ</p>
            <p className="font-medium">
              {meeting.date ? formatMeetingDate(meeting.date) : 'غير محدد'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">الوقت والمدة</p>
            <p className="font-medium">
              {meeting.start_time || 'غير محدد'} 
              {meeting.duration ? ` (${meeting.duration} دقيقة)` : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">نوع الاجتماع</p>
            <p className="font-medium">{getMeetingTypeLabel(meeting.meeting_type)}</p>
          </div>
        </div>
        
        {meeting.attendance_type === 'in_person' && meeting.location ? (
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">المكان</p>
              <p className="font-medium">{meeting.location}</p>
            </div>
          </div>
        ) : meeting.attendance_type === 'virtual' && meeting.meeting_link ? (
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">نوع الحضور</p>
              <p className="font-medium">اجتماع افتراضي</p>
              <a 
                href={meeting.meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center mt-1"
              >
                <Link className="h-3 w-3 mr-1" />
                رابط الاجتماع
              </a>
            </div>
          </div>
        ) : meeting.attendance_type === 'hybrid' ? (
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">نوع الحضور</p>
              <p className="font-medium">اجتماع مختلط</p>
              {meeting.location && (
                <p className="text-sm mt-1">المكان: {meeting.location}</p>
              )}
              {meeting.meeting_link && (
                <a 
                  href={meeting.meeting_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center mt-1"
                >
                  <Link className="h-3 w-3 mr-1" />
                  رابط الاجتماع
                </a>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
