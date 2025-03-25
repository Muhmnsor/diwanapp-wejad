
import React from "react";
import { Meeting } from "@/types/meeting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, Link2, Users } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Meeting Details Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>تفاصيل الاجتماع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="h-5 w-5" />
            <span>التاريخ: {formatDateArabic(meeting.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-5 w-5" />
            <span>
              الوقت: {meeting.start_time} (المدة: {meeting.duration} دقيقة)
            </span>
          </div>
          {meeting.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>المكان: {meeting.location}</span>
            </div>
          )}
          {meeting.meeting_link && (
            <div className="flex items-center gap-2 text-gray-600">
              <Link2 className="h-5 w-5" />
              <span>
                رابط الاجتماع:{" "}
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {meeting.meeting_link}
                </a>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-5 w-5" />
            <span>
              نوع الحضور:{" "}
              {meeting.attendance_type === "in_person"
                ? "حضوري"
                : meeting.attendance_type === "virtual"
                ? "عن بعد"
                : "مختلط"}
            </span>
          </div>
          {meeting.folder_name && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <span className="font-medium">المجلد: </span>
              {meeting.folder_name}
            </div>
          )}
        </CardContent>
      </Card>

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
