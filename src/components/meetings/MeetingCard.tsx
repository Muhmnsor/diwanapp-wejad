
import { Meeting } from "@/types/meeting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

interface MeetingCardProps {
  meeting: Meeting;
  onClick?: () => void;
}

export const MeetingCard = ({ meeting, onClick }: MeetingCardProps) => {
  // Status badge color based on meeting status
  const getStatusColor = () => {
    switch (meeting.meeting_status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Meeting type based on type
  const getMeetingTypeBadge = () => {
    switch (meeting.meeting_type) {
      case "board": return "bg-purple-100 text-purple-800";
      case "department": return "bg-indigo-100 text-indigo-800";
      case "team": return "bg-teal-100 text-teal-800";
      case "committee": return "bg-amber-100 text-amber-800";
      case "other": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMeetingTypeLabel = () => {
    switch (meeting.meeting_type) {
      case "board": return "مجلس إدارة";
      case "department": return "قسم";
      case "team": return "فريق";
      case "committee": return "لجنة";
      case "other": return "أخرى";
      default: return "اجتماع";
    }
  };

  const getStatusLabel = () => {
    switch (meeting.meeting_status) {
      case "scheduled": return "مجدول";
      case "in_progress": return "جاري";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      default: return meeting.meeting_status;
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{meeting.title}</CardTitle>
          <Badge className={getStatusColor()}>{getStatusLabel()}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className={getMeetingTypeBadge()}>
            {getMeetingTypeLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {meeting.date ? 
                format(parseISO(meeting.date), 'EEEE d MMMM yyyy', { locale: ar }) : 
                'تاريخ غير محدد'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{meeting.start_time} ({meeting.duration} دقيقة)</span>
          </div>
          {meeting.attendance_type === 'in_person' && meeting.location ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{meeting.location}</span>
            </div>
          ) : meeting.attendance_type === 'virtual' ? (
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span>اجتماع افتراضي</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>اجتماع مختلط</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
