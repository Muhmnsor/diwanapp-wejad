
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
  const { data, isLoading: isLoadingMinutes } = useMeetingMinutes(meetingId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={handlePrint} className="flex items-center">
          <Printer className="h-4 w-4 ml-2" />
          طباعة المحضر
        </Button>
        <h3 className="text-lg font-semibold">محضر الاجتماع</h3>
      </div>

      {agendaItems && agendaItems.length > 0 ? (
        <MeetingMinutesItemsList 
          meetingId={meetingId}
          agendaItems={agendaItems}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-right">محضر الاجتماع</CardTitle>
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
