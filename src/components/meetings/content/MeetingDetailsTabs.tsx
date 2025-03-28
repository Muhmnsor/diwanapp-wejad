
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
      <TabsList className="flex flex-row-reverse justify-center border-b rounded-none bg-white mb-6">
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
        >
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger 
          value="participants" 
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
        >
          المشاركون
        </TabsTrigger>
        <TabsTrigger 
          value="minutes" 
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
        >
          المحضر
        </TabsTrigger>
        <TabsTrigger 
          value="tasks" 
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
        >
          المهام
        </TabsTrigger>
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
