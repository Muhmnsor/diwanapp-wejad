
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useCreateMeetingMinutesItems } from "@/hooks/meetings/useCreateMeetingMinutesItems";
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
  const { data: existingMinutes, isLoading } = useMeetingMinutes(meetingId);
  const { createMinutesItems, isPending } = useCreateMeetingMinutesItems();
  
  // Initialize minutes content state
  const [minutesContent, setMinutesContent] = useState<Record<string, string>>({});
  
  // When existing minutes data is loaded, update the state
  useEffect(() => {
    if (existingMinutes) {
      const initialContent: Record<string, string> = {};
      
      // If existingMinutes is an array, process it
      if (Array.isArray(existingMinutes)) {
        existingMinutes.forEach(minute => {
          if (minute.agenda_item_id) {
            initialContent[minute.agenda_item_id] = minute.content || '';
          }
        });
      } 
      // If it's a single object, handle it differently (if it has content property)
      else if (existingMinutes && typeof existingMinutes === 'object') {
        // Handle if there's only one entry or a different structure
        // This depends on your API structure
      }
      
      setMinutesContent(initialContent);
    }
  }, [existingMinutes]);
  
  const handleContentChange = (agendaItemId: string, content: string) => {
    setMinutesContent(prev => ({
      ...prev,
      [agendaItemId]: content
    }));
  };
  
  const handleSaveMinutes = () => {
    const items = agendaItems.map(item => ({
      meeting_id: meetingId,
      agenda_item_id: item.id,
      content: minutesContent[item.id] || ''
    }));
    
    createMinutesItems(items);
  };
  
  if (isLoading) {
    return <div className="text-center py-4">جاري تحميل المحضر...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <Button 
          onClick={handleSaveMinutes}
          disabled={isPending}
        >
          <Save className="h-4 w-4 ml-2" />
          {isPending ? "جاري الحفظ..." : "حفظ المحضر"}
        </Button>
      </div>
      
      {agendaItems.map(item => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="text-lg">{item.content}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="print:hidden">
              <Textarea
                placeholder="أدخل محضر الاجتماع لهذا البند..."
                value={minutesContent[item.id] || ''}
                onChange={(e) => handleContentChange(item.id, e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>
            <div className="hidden print:block whitespace-pre-wrap">
              {minutesContent[item.id] || 'لا يوجد محتوى'}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
