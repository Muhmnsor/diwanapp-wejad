
import React from "react";
import { Meeting } from "@/types/meeting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, Link2, Users, Folder, Type } from "lucide-react";
import { formatDateArabic } from "@/utils/formatters";
import { useMeetingObjectives } from "@/hooks/meetings/useMeetingObjectives";
import { useMeetingAgendaItems } from "@/hooks/meetings/useMeetingAgendaItems";
import { Skeleton } from "@/components/ui/skeleton";

interface MeetingOverviewTabProps {
  meeting: Meeting;
  meetingId: string;
}

export const MeetingOverviewTab: React.FC<MeetingOverviewTabProps> = ({
  meeting,
  meetingId,
}) => {
  const { data: objectives, isLoading: isLoadingObjectives } = useMeetingObjectives(meetingId);
  const { data: agendaItems, isLoading: isLoadingAgenda } = useMeetingAgendaItems(meetingId);

  // Map meeting types to Arabic names
  const getMeetingTypeArabic = (type: string): string => {
    switch (type) {
      case "board": return "مجلس إدارة";
      case "department": return "قسم";
      case "team": return "فريق عمل";
      case "committee": return "لجنة";
      default: return "أخرى";
    }
  };

  // Map attendance types to Arabic names
  const getAttendanceTypeArabic = (type: string): string => {
    switch (type) {
      case "in_person": return "حضوري";
      case "virtual": return "عن بعد";
      case "hybrid": return "مختلط";
      default: return type;
    }
  };

  // Format time to 12-hour format
  const formatTime12Hour = (timeString: string): string => {
    if (!timeString) return "";
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      
      return date.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Meeting Details Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date & Time Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-blue-700">
              <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
              التاريخ والوقت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <CalendarDays className="h-4 w-4 ml-2 text-blue-500" />
                <span>التاريخ: {formatDateArabic(meeting.date)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 ml-2 text-blue-500" />
                <span>
                  الوقت: {formatTime12Hour(meeting.start_time)} (المدة: {meeting.duration} دقيقة)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-amber-700">
              <MapPin className="h-5 w-5 mr-2 text-amber-500" />
              المكان
            </CardTitle>
          </CardHeader>
          <CardContent>
            {meeting.location ? (
              <div className="flex items-center text-gray-700">
                <MapPin className="h-4 w-4 ml-2 text-amber-500" />
                <span>{meeting.location}</span>
              </div>
            ) : (
              <span className="text-gray-500">لم يتم تحديد المكان</span>
            )}
            
            {meeting.meeting_link && (
              <div className="flex items-center text-gray-700 mt-2">
                <Link2 className="h-4 w-4 ml-2 text-amber-500" />
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  رابط الاجتماع
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meeting Type Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-purple-700">
              <Type className="h-5 w-5 mr-2 text-purple-500" />
              نوع الاجتماع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-gray-700">
              <Type className="h-4 w-4 ml-2 text-purple-500" />
              <span>{getMeetingTypeArabic(meeting.meeting_type)}</span>
            </div>
            <div className="flex items-center text-gray-700 mt-2">
              <Users className="h-4 w-4 ml-2 text-purple-500" />
              <span>نوع الحضور: {getAttendanceTypeArabic(meeting.attendance_type)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Folder Card */}
        {(meeting.folder_name || meeting.folder) && (
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-green-700">
                <Folder className="h-5 w-5 mr-2 text-green-500" />
                المجلد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-gray-700">
                <Folder className="h-4 w-4 ml-2 text-green-500" />
                <span>
                  {meeting.folder_name || (meeting.folder && meeting.folder.name) || "غير محدد"}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Objectives Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>أهداف الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingObjectives ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          ) : !objectives || objectives.length === 0 ? (
            <p className="text-gray-500">لا توجد أهداف محددة لهذا الاجتماع</p>
          ) : (
            <ol className="list-decimal list-inside space-y-2">
              {objectives.map((objective) => (
                <li key={objective.id} className="text-gray-800">
                  {objective.content}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Agenda Items Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>جدول الأعمال</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAgenda ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          ) : !agendaItems || agendaItems.length === 0 ? (
            <p className="text-gray-500">لا توجد بنود في جدول الأعمال</p>
          ) : (
            <ol className="list-decimal list-inside space-y-2">
              {agendaItems.map((item) => (
                <li key={item.id} className="text-gray-800">
                  {item.content}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
