
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingAgendaItem } from "@/hooks/meetings/useMeetingAgendaItems";
import { useMeetingMinutesItems } from "@/hooks/meetings/useMeetingMinutesItems";
import { useCreateMeetingMinutesItems } from "@/hooks/meetings/useCreateMeetingMinutesItems";
import { MeetingMinutesItemEditor } from "./MeetingMinutesItemEditor";

interface MeetingMinutesItemsListProps {
  meetingId: string;
  agendaItems: MeetingAgendaItem[];
}

export const MeetingMinutesItemsList: React.FC<MeetingMinutesItemsListProps> = ({ 
  meetingId, 
  agendaItems 
}) => {
  const { data: minutesItems, isLoading, error } = useMeetingMinutesItems(meetingId);
  const createMinutesItemsMutation = useCreateMeetingMinutesItems();

  // Create minutes items for each agenda item if they don't exist
  useEffect(() => {
    if (agendaItems && agendaItems.length > 0 && !isLoading && !minutesItems?.length) {
      createMinutesItemsMutation.mutate({
        meetingId,
        agendaItems
      });
    }
  }, [agendaItems, isLoading, minutesItems, meetingId, createMinutesItemsMutation]);

  if (isLoading || createMinutesItemsMutation.isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>محاضر البنود</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">جاري تحميل محاضر البنود...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>محاضر البنود</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">حدث خطأ أثناء تحميل محاضر البنود</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>محاضر بنود الاجتماع</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {minutesItems && minutesItems.length > 0 ? (
            minutesItems.map((minutesItem, index) => {
              // Find the corresponding agenda item
              const agendaItem = agendaItems.find(item => item.id === minutesItem.agenda_item_id);
              
              return (
                <div key={minutesItem.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start mb-2">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white ml-2">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold">
                      {agendaItem?.content || `البند #${index + 1}`}
                    </h3>
                  </div>
                  <MeetingMinutesItemEditor minutesItem={minutesItem} />
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">
              لا توجد محاضر لبنود الاجتماع بعد.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
