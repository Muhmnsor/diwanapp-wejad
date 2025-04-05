
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
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MeetingDetailsTabsProps {
  meeting: Meeting;
  meetingId: string;
  onBack?: () => void; // Added onBack prop
}

export const MeetingDetailsTabs: React.FC<MeetingDetailsTabsProps> = ({ meeting, meetingId, onBack }) => {
  const { data: minutes, isLoading: isMinutesLoading } = useMeetingMinutes(meetingId);
  
  console.log('MeetingDetailsTabs - meeting:', meeting);
  console.log('MeetingDetailsTabs - minutes:', minutes);
  console.log('MeetingDetailsTabs - isMinutesLoading:', isMinutesLoading);
  
  return (
    <div>
      {/* Header with meeting title and back button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{meeting?.title}</h1>
        
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            عودة
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="overview" className="w-full" dir="rtl">
        <TabsList className="flex justify-center border-b rounded-none bg-white mb-6">
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
    </div>
  );
};
