
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MeetingDetailsTab } from './MeetingDetailsTab';
import { MeetingTasksTab } from './MeetingTasksTab';
import { MeetingMinutesTab } from './MeetingMinutesTab';

interface MeetingNotesTabProps {
  meetingId: string;
}

export const MeetingNotesTab = ({ meetingId }: MeetingNotesTabProps) => {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="details">التفاصيل</TabsTrigger>
        <TabsTrigger value="tasks">المهام</TabsTrigger>
        <TabsTrigger value="minutes">المحضر</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <MeetingDetailsTab meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="tasks">
        <MeetingTasksTab meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="minutes">
        <MeetingMinutesTab meetingId={meetingId} />
      </TabsContent>
    </Tabs>
  );
};
