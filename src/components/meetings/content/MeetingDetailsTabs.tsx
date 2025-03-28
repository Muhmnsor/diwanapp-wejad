
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MeetingOverviewTab } from './tabs/MeetingOverviewTab';
import { MeetingMinutesTab } from './tabs/MeetingMinutesTab';
import { MeetingParticipantsContent } from '../participants/MeetingParticipantsContent';
import { MeetingTasksTab } from './tabs/MeetingTasksTab';
import { Meeting } from '@/types/meeting';

interface MeetingDetailsTabsProps {
  meeting: Meeting;
  meetingId: string;
}

export const MeetingDetailsTabs: React.FC<MeetingDetailsTabsProps> = ({ meeting, meetingId }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full grid grid-cols-4 bg-secondary/20 p-1 rounded-xl mb-6">
        <TabsTrigger value="overview" className="data-[state=active]:bg-white">نظرة عامة</TabsTrigger>
        <TabsTrigger value="participants" className="data-[state=active]:bg-white">المشاركون</TabsTrigger>
        <TabsTrigger value="minutes" className="data-[state=active]:bg-white">المحضر</TabsTrigger>
        <TabsTrigger value="tasks" className="data-[state=active]:bg-white">المهام</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <MeetingOverviewTab meeting={meeting} meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="participants">
        <MeetingParticipantsContent meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="minutes">
        <MeetingMinutesTab meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="tasks">
        <MeetingTasksTab meetingId={meetingId} />
      </TabsContent>
    </Tabs>
  );
};
