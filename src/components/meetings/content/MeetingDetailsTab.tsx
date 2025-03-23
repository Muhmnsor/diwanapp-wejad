
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meeting } from "@/types/meeting";
import { CalendarRange, Clock, MapPin, Link2, Users } from "lucide-react";
import { MeetingAgendaItems } from "./MeetingAgendaItems";
import { MeetingObjectives } from "./MeetingObjectives";

interface MeetingDetailsTabProps {
  meeting: Meeting;
}

export const MeetingDetailsTab: React.FC<MeetingDetailsTabProps> = ({ meeting }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    // Time format is assumed to be "HH:MM:SS"
    const timeParts = timeString.split(':');
    return `${timeParts[0]}:${timeParts[1]}`;
  };

  return (
    <div className="space-y-6">
      {/* Meeting Details */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الاجتماع</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">التاريخ</p>
                <p className="text-sm text-muted-foreground">{formatDate(meeting.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">الوقت</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(meeting.start_time)} 
                  <span className="px-1">•</span> 
                  {meeting.duration} دقيقة
                </p>
              </div>
            </div>
            
            {meeting.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">المكان</p>
                  <p className="text-sm text-muted-foreground">{meeting.location}</p>
                </div>
              </div>
            )}
            
            {meeting.meeting_link && (
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">رابط الاجتماع</p>
                  <a 
                    href={meeting.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {meeting.meeting_link}
                  </a>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">نوع الحضور</p>
                <p className="text-sm text-muted-foreground">
                  {meeting.attendance_type === 'in_person' 
                    ? 'حضوري' 
                    : meeting.attendance_type === 'virtual' 
                      ? 'عن بعد' 
                      : 'مختلط'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Meeting Objectives */}
      <MeetingObjectives meetingId={meeting.id} />
      
      {/* Meeting Agenda */}
      <MeetingAgendaItems meetingId={meeting.id} />
    </div>
  );
};
