
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MeetingOverviewTab } from './tabs/MeetingOverviewTab';
import { MeetingMinutesTab } from './tabs/MeetingMinutesTab';
import { MeetingParticipantsContent } from '../participants/MeetingParticipantsContent';
import { MeetingTasksTab } from './tabs/MeetingTasksTab';
import { Meeting } from '@/types/meeting';
import { FileText, Users, CheckSquare, Layout } from 'lucide-react';

interface MeetingDetailsTabsProps {
  meeting: Meeting;
  meetingId: string;
}

export const MeetingDetailsTabs: React.FC<MeetingDetailsTabsProps> = ({ meeting, meetingId }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid grid-cols-4 bg-muted/20 p-1 rounded-xl mb-6">
        <TabsTrigger value="overview" className="data-[state=active]:bg-white flex items-center gap-2">
          <Layout className="h-4 w-4" />
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger value="participants" className="data-[state=active]:bg-white flex items-center gap-2">
          <Users className="h-4 w-4" />
          المشاركون
        </TabsTrigger>
        <TabsTrigger value="minutes" className="data-[state=active]:bg-white flex items-center gap-2">
          <FileText className="h-4 w-4" />
          المحضر
        </TabsTrigger>
        <TabsTrigger value="tasks" className="data-[state=active]:bg-white flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          المهام
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <MeetingOverviewTab meeting={meeting} meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="participants" className="mt-6">
        <MeetingParticipantsContent meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="minutes" className="mt-6">
        <MeetingMinutesTab meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="tasks" className="mt-6">
        <MeetingTasksTab meetingId={meetingId} />
      </TabsContent>
    </Tabs>
  );
};
