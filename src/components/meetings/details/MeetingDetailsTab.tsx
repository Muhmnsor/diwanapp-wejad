
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingObjectives } from "@/components/meetings/content/MeetingObjectives";
import { MeetingAgendaItems } from "@/components/meetings/content/MeetingAgendaItems";

interface MeetingDetailsTabProps {
  meetingId: string;
}

export const MeetingDetailsTab: React.FC<MeetingDetailsTabProps> = ({ meetingId }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MeetingAgendaItems meetingId={meetingId} />
        <MeetingObjectives meetingId={meetingId} />
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>قرارات الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">سيتم إضافة قرارات الاجتماع قريباً</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>مرفقات الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">سيتم إضافة مرفقات الاجتماع قريباً</p>
        </CardContent>
      </Card>
    </div>
  );
};
