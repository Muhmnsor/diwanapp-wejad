
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useMeetingAgendaItems } from "@/hooks/meetings/useMeetingAgendaItems";
import { MeetingMinutesItemsList } from "./MeetingMinutesItemsList";
import { useMeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";

interface MeetingMinutesContentProps {
  meetingId: string;
}

export const MeetingMinutesContent: React.FC<MeetingMinutesContentProps> = ({ 
  meetingId 
}) => {
  const { data: agendaItems, isLoading: isLoadingAgenda } = useMeetingAgendaItems(meetingId);
  const { data: minutes, isLoading: isLoadingMinutes } = useMeetingMinutes(meetingId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h3 className="text-lg font-semibold">محضر الاجتماع</h3>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 ml-2" />
          طباعة المحضر
        </Button>
      </div>

      {agendaItems && agendaItems.length > 0 ? (
        <MeetingMinutesItemsList 
          meetingId={meetingId}
          agendaItems={agendaItems}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>محضر الاجتماع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-gray-500">
              لا توجد بنود في جدول الأعمال لإنشاء محضر. الرجاء إضافة بنود للاجتماع أولاً.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
