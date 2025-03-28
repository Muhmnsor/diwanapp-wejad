
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
    <Tabs defaultValue="overview" className="w-full" dir="rtl">
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <TabsList className="flex justify-center rounded-lg bg-gray-50 p-1 flex-row-reverse overflow-x-auto">
          <TabsTrigger 
            value="overview" 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold rounded-md transition-all"
          >
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger 
            value="participants" 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold rounded-md transition-all"
          >
            المشاركون
          </TabsTrigger>
          <TabsTrigger 
            value="minutes" 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold rounded-md transition-all"
          >
            المحضر
          </TabsTrigger>
          <TabsTrigger 
            value="tasks" 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold rounded-md transition-all"
          >
            المهام
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="overview" dir="rtl">
        <MeetingOverviewTab meeting={meeting} meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="participants" dir="rtl">
        <MeetingParticipantsContent meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="minutes" dir="rtl">
        <MeetingMinutesTab meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="tasks" dir="rtl">
        <MeetingTasksTab meetingId={meetingId} />
      </TabsContent>
    </Tabs>
  );
};
