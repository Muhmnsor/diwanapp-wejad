import React from "react";
import { Meeting } from "@/types/meeting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, Link2, Users, FolderOpen } from "lucide-react";
import { formatDateArabic } from "@/utils/formatters";
import { useMeetingObjectives } from "@/hooks/meetings/useMeetingObjectives";
import { useMeetingAgendaItems } from "@/hooks/meetings/useMeetingAgendaItems";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDateWithDay, formatTime12Hour } from "@/utils/dateTimeUtils";
interface MeetingOverviewTabProps {
  meeting: Meeting;
  meetingId: string;
}
export const MeetingOverviewTab: React.FC<MeetingOverviewTabProps> = ({
  meeting,
  meetingId
}) => {
  const {
    data: objectives,
    isLoading: isLoadingObjectives
  } = useMeetingObjectives(meetingId);
  const {
    data: agendaItems,
    isLoading: isLoadingAgenda
  } = useMeetingAgendaItems(meetingId);
  return <div className="space-y-8 animate-fade-in">
      {/* Meeting Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-0">
            <div className="flex items-center p-4 gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">تاريخ الاجتماع</p>
                <p className="font-medium">{formatDateWithDay(meeting?.date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-0">
            <div className="flex items-center p-4 gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">الوقت والمدة</p>
                <p className="font-semibold">{formatTime12Hour(meeting.start_time)} (المدة: {meeting.duration} دقيقة)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {meeting.location && <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="p-0">
              <div className="flex items-center p-4 gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">مكان الاجتماع</p>
                  <p className="font-semibold">{meeting.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>}

        {meeting.meeting_link && <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-0">
              <div className="flex items-center p-4 gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">رابط الاجتماع</p>
                  <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                    فتح الرابط
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>}

        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-r from-pink-50 to-red-50">
          <CardContent className="p-0">
            <div className="flex items-center p-4 gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">نوع الحضور</p>
                <Badge variant="outline" className="font-semibold bg-white">
                  {meeting.attendance_type === "in_person" ? "حضوري" : meeting.attendance_type === "virtual" ? "عن بعد" : "مختلط"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {meeting.folder_name && <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-0">
              <div className="flex items-center p-4 gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">التصنيف</p>
                  <p className="font-semibold">{meeting.folder_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>}
      </div>

      {/* Objectives Section */}
      <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-2 border-b border-gray-100">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
            </div>
            أهداف الاجتماع
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoadingObjectives ? <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-5/6" />
            </div> : !objectives || objectives.length === 0 ? <p className="text-gray-500 py-4 text-center bg-white/50 rounded-md">لا توجد أهداف محددة لهذا الاجتماع</p> : <ol className="list-decimal marker:text-primary list-inside space-y-3 pr-2">
              {objectives.map(objective => <li key={objective.id} className="text-gray-800 bg-white/50 p-3 rounded-md shadow-sm border-r-4 border-primary/40 hover:border-primary transition-colors">
                  {objective.content}
                </li>)}
            </ol>}
        </CardContent>
      </Card>

      {/* Agenda Items Section */}
      <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader className="pb-2 border-b border-gray-100">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M12 11h4" />
                <path d="M12 16h4" />
                <path d="M8 11h.01" />
                <path d="M8 16h.01" />
              </svg>
            </div>
            جدول الأعمال
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoadingAgenda ? <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-5/6" />
            </div> : !agendaItems || agendaItems.length === 0 ? <p className="text-gray-500 py-4 text-center bg-white/50 rounded-md">لا توجد بنود في جدول الأعمال</p> : <ol className="list-decimal marker:text-primary list-inside space-y-3 pr-2">
              {agendaItems.map(item => <li key={item.id} className="text-gray-800 bg-white/50 p-3 rounded-md shadow-sm border-r-4 border-purple-300 hover:border-purple-500 transition-colors">
                  {item.content}
                </li>)}
            </ol>}
        </CardContent>
      </Card>
    </div>;
};
