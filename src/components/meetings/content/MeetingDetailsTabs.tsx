
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Meeting } from "@/types/meeting";
import { MeetingObjectives } from "./MeetingObjectives";
import { MeetingAgendaItems } from "./MeetingAgendaItems";
import { MeetingParticipants } from "./MeetingParticipants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, Link2, Users } from "lucide-react";
import { formatDateArabic } from "@/utils/formatters";

interface MeetingDetailsTabsProps {
  meeting: Meeting;
  meetingId: string;
}

export const MeetingDetailsTabs: React.FC<MeetingDetailsTabsProps> = ({
  meeting,
  meetingId,
}) => {
  const [activeTab, setActiveTab] = useState("details");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue="details"
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full mt-4"
    >
      <TabsList className="grid grid-cols-4 w-full mb-6">
        <TabsTrigger value="details" className="text-sm">التفاصيل</TabsTrigger>
        <TabsTrigger value="agenda" className="text-sm">جدول الأعمال</TabsTrigger>
        <TabsTrigger value="objectives" className="text-sm">الأهداف</TabsTrigger>
        <TabsTrigger value="participants" className="text-sm">المشاركون</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="mt-2">
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
      </TabsContent>

      <TabsContent value="agenda" className="mt-2">
        <MeetingAgendaItems meetingId={meetingId} />
      </TabsContent>

      <TabsContent value="objectives" className="mt-2">
        <MeetingObjectives meetingId={meetingId} />
      </TabsContent>

      <TabsContent value="participants" className="mt-2">
        <MeetingParticipants meetingId={meetingId} />
      </TabsContent>
    </Tabs>
  );
};
