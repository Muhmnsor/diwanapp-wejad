
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { MeetingObjectives } from "./MeetingObjectives";
import { MeetingAgendaItems } from "./MeetingAgendaItems";
import { MeetingDetails } from "./MeetingDetails";
import { MeetingParticipants } from "./MeetingParticipants";
import { MeetingTasks } from "./MeetingTasks";
import { MeetingMinutes } from "./MeetingMinutes";
import { Meeting } from "@/types/meeting";
import { useMeeting } from "@/hooks/meetings/useMeeting";

interface MeetingDetailsTabsProps {
  meetingId: string;
  meeting?: Meeting;
}

export const MeetingDetailsTabs: React.FC<MeetingDetailsTabsProps> = ({ 
  meetingId,
  meeting: propsMeeting
}) => {
  // If the meeting is not passed as a prop, fetch it
  const { data: fetchedMeeting, isLoading } = useMeeting(propsMeeting ? '' : meetingId);
  
  // Use the meeting from props if available, otherwise use the fetched meeting
  const meeting = propsMeeting || fetchedMeeting;
  
  if (isLoading && !propsMeeting) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <span>جاري تحميل بيانات الاجتماع...</span>
        </div>
      </Card>
    );
  }
  
  if (!meeting) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <span>لم يتم العثور على بيانات الاجتماع</span>
        </div>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid grid-cols-5 mb-6">
        <TabsTrigger value="details">التفاصيل</TabsTrigger>
        <TabsTrigger value="agenda">جدول الأعمال</TabsTrigger>
        <TabsTrigger value="participants">المشاركون</TabsTrigger>
        <TabsTrigger value="tasks">المهام</TabsTrigger>
        <TabsTrigger value="minutes">محضر الاجتماع</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <MeetingDetails meeting={meeting} />
      </TabsContent>
      
      <TabsContent value="agenda" className="space-y-6">
        <MeetingObjectives meetingId={meetingId} />
        <MeetingAgendaItems meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="participants">
        <MeetingParticipants meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="tasks">
        <MeetingTasks meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="minutes">
        <MeetingMinutes meetingId={meetingId} />
      </TabsContent>
    </Tabs>
  );
};
