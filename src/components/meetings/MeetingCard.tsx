
import { Meeting } from "@/types/meeting";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, Video, Users } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface MeetingCardProps {
  meeting: Meeting;
  onClick: () => void;
}

export const MeetingCard = ({ meeting, onClick }: MeetingCardProps) => {
  const formattedDate = meeting.date ? format(new Date(meeting.date), 'PPP', { locale: ar }) : "غير محدد";
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "scheduled": return "مجدول";
      case "in_progress": return "جاري";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      default: return status || "غير محدد";
    }
  };
  
  const getMeetingTypeLabel = (type?: string) => {
    switch (type) {
      case "board": return "مجلس إدارة";
      case "department": return "قسم";
      case "team": return "فريق";
      case "committee": return "لجنة";
      case "other": return "أخرى";
      default: return type || "غير محدد";
    }
  };
  
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{meeting.title}</CardTitle>
          <Badge className={getStatusColor(meeting.meeting_status)}>
            {getStatusLabel(meeting.meeting_status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDate} - {meeting.start_time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {meeting.attendance_type === "virtual" ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
            <span>
              {meeting.attendance_type === "virtual" ? (
                "عن بعد"
              ) : meeting.attendance_type === "hybrid" ? (
                "حضوري وعن بعد"
              ) : (
                "حضوري"
              )}
              {meeting.location ? ` - ${meeting.location}` : ""}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{getMeetingTypeLabel(meeting.meeting_type)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <p className="text-xs text-muted-foreground mt-2">
          {meeting.objectives ? (
            <span>{meeting.objectives.substring(0, 100)}{meeting.objectives.length > 100 ? "..." : ""}</span>
          ) : (
            <span className="italic">لا يوجد وصف للاجتماع</span>
          )}
        </p>
      </CardFooter>
    </Card>
  );
};
