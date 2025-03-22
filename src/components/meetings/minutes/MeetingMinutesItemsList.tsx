
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { MeetingAgendaItem } from "@/hooks/meetings/useMeetingAgendaItems";

interface MeetingMinutesItemsListProps {
  meetingId: string;
  agendaItems: MeetingAgendaItem[];
}

export const MeetingMinutesItemsList: React.FC<MeetingMinutesItemsListProps> = ({
  meetingId,
  agendaItems
}) => {
  const { data, isLoading } = useMeetingMinutes(meetingId);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        جاري تحميل محضر الاجتماع...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {agendaItems.map((item) => {
        // Find the minutes item that corresponds to this agenda item
        const itemMinutes = data?.minutesItems?.find(min => min.agenda_item_id === item.id);
        
        return (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-3">
              <CardTitle className="text-right text-base">
                {item.content?.substring(0, 30)}...
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1 text-right">بند جدول الأعمال:</h4>
                  <p className="text-muted-foreground text-right">{item.content}</p>
                </div>
                
                {itemMinutes ? (
                  <div>
                    <h4 className="font-medium mb-1 text-right">المناقشة:</h4>
                    <p className="text-muted-foreground text-right">{itemMinutes.content}</p>
                  </div>
                ) : (
                  <div className="text-muted text-right">
                    لم تتم إضافة محضر لهذا البند بعد.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
