
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Meeting } from "@/types/meeting";
import { Card } from "@/components/ui/card";
import { MeetingOverviewTab } from "./tabs/MeetingOverviewTab";
import { MeetingParticipantsTab } from "./tabs/MeetingParticipantsTab";
import { MeetingTasksTab } from "./tabs/MeetingTasksTab";
import { MeetingMinutesTab } from "./tabs/MeetingMinutesTab";

interface MeetingDetailsTabsProps {
  meeting: Meeting;
  meetingId: string;
}

export const MeetingDetailsTabs: React.FC<MeetingDetailsTabsProps> = ({
  meeting,
  meetingId
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="w-full mt-4" dir="rtl">
      <TabsList className="flex w-full mb-6">
        <TabsTrigger value="overview" className="text-sm">النظرة العامة</TabsTrigger>
        <TabsTrigger value="participants" className="text-sm">المشاركون</TabsTrigger>
        <TabsTrigger value="tasks" className="text-sm">المهام</TabsTrigger>
        <TabsTrigger value="minutes" className="text-sm">محضر الاجتماع</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-2">
        <MeetingOverviewTab meeting={meeting} meetingId={meetingId} />
      </TabsContent>

      <TabsContent value="participants" className="mt-2">
        <MeetingParticipantsTab meetingId={meetingId} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-2">
        <MeetingTasksTab meetingId={meetingId} />
      </TabsContent>

      <TabsContent value="minutes" className="mt-2">
        <MeetingMinutesTab meetingId={meetingId} />
      </TabsContent>
    </Tabs>;
};
