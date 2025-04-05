
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MeetingOverviewTab } from './tabs/MeetingOverviewTab';
import { MeetingMinutesTab } from './tabs/MeetingMinutesTab';
import { MeetingParticipantsContent } from '../participants/MeetingParticipantsContent';
import { MeetingTasksTab } from './tabs/MeetingTasksTab';
import { Meeting } from '@/types/meeting';
import { ParticipantDialogBridge } from '../participants/ParticipantDialogBridge';
import { EnhancedMeetingMinutes } from '../minutes/EnhancedMeetingMinutes';
import { useMeetingMinutes } from '@/hooks/meetings/useMeetingMinutes';

interface MeetingDetailsTabsProps {
  meeting: Meeting;
  meetingId: string;
}

export const MeetingDetailsTabs: React.FC<MeetingDetailsTabsProps> = ({ meeting, meetingId }) => {
  const { data: minutes, isLoading: isMinutesLoading } = useMeetingMinutes(meetingId);
  
  console.log('MeetingDetailsTabs - meeting:', meeting);
  console.log('MeetingDetailsTabs - minutes:', minutes);
  console.log('MeetingDetailsTabs - isMinutesLoading:', isMinutesLoading);
  
  return (
    <Tabs defaultValue="overview" className="w-full" dir="rtl">
      <TabsList className="flex flex-row-reverse justify-center border-b rounded-none bg-white mb-6">
        <TabsTrigger 
          value="tasks" 
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
        >
          المهام
        </TabsTrigger>
        <TabsTrigger 
          value="minutes" 
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
        >
          المحضر
        </TabsTrigger>
        <TabsTrigger 
          value="participants" 
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
        >
          المشاركون
        </TabsTrigger>
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
        >
          نظرة عامة
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" dir="rtl">
        <MeetingOverviewTab meeting={meeting} meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="participants" dir="rtl">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">المشاركون في الاجتماع</h3>
          <ParticipantDialogBridge meetingId={meetingId} onSuccess={() => {}} />
        </div>
        <MeetingParticipantsContent meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="minutes" dir="rtl">
        <EnhancedMeetingMinutes 
          meetingId={meetingId} 
          minutes={minutes}
          isLoading={isMinutesLoading}
        >
          <MeetingMinutesTab meetingId={meetingId} />
        </EnhancedMeetingMinutes>
      </TabsContent>
      
      <TabsContent value="tasks" dir="rtl">
        <MeetingTasksTab meetingId={meetingId} />
      </TabsContent>
    </Tabs>
  );
};
