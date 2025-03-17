
import { Meeting } from "@/types/meeting";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  CalendarClock, 
  Clock, 
  MapPin, 
  Video, 
  Users2, 
  Calendar 
} from "lucide-react";

interface MeetingInfoProps {
  meeting: Meeting;
}

export const MeetingInfo = ({ meeting }: MeetingInfoProps) => {
  const formattedDate = meeting.date ? format(new Date(meeting.date), 'PPP', { locale: ar }) : "غير محدد";
  
  const meetingTypeMap = {
    board: 'مجلس إدارة',
    department: 'قسم',
    team: 'فريق',
    committee: 'لجنة',
    other: 'أخرى'
  };
  
  const attendanceTypeMap = {
    in_person: 'حضوري',
    virtual: 'عن بعد',
    hybrid: 'مدمج'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <span>الموعد والمدة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">التاريخ</p>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">الوقت والمدة</p>
              <p className="text-sm text-muted-foreground">
                {meeting.start_time || "غير محدد"} ({meeting.duration} دقيقة)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {meeting.attendance_type === "virtual" ? (
              <Video className="h-5 w-5 text-primary" />
            ) : (
              <MapPin className="h-5 w-5 text-primary" />
            )}
            <span>المكان</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">نوع الحضور</p>
              <p className="text-sm text-muted-foreground">
                {attendanceTypeMap[meeting.attendance_type] || meeting.attendance_type}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            {meeting.attendance_type === "virtual" ? (
              <Video className="h-4 w-4 mt-0.5 text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {meeting.attendance_type === "virtual" ? "رابط الاجتماع" : "مكان الاجتماع"}
              </p>
              <p className="text-sm text-muted-foreground">
                {meeting.attendance_type === "virtual" 
                  ? (meeting.meeting_link || "لا يوجد رابط") 
                  : (meeting.location || "غير محدد")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            <span>نوع الاجتماع</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <Users2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">تصنيف الاجتماع</p>
              <p className="text-sm text-muted-foreground">
                {meetingTypeMap[meeting.meeting_type as keyof typeof meetingTypeMap] || meeting.meeting_type}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
