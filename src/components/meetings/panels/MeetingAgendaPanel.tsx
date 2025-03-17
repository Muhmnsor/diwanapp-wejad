
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MeetingAgendaItem } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MeetingAgendaPanelProps {
  meetingId: string;
}

export const MeetingAgendaPanel = ({ meetingId }: MeetingAgendaPanelProps) => {
  const { data: agendaItems = [], isLoading } = useQuery({
    queryKey: ['meeting-agenda', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_agenda_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_number', { ascending: true });

      if (error) throw error;
      return data as MeetingAgendaItem[];
    },
    enabled: !!meetingId,
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">جاري تحميل جدول الأعمال...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>جدول أعمال الاجتماع</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agendaItems.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            لا يوجد بنود في جدول الأعمال
          </div>
        ) : (
          <ul className="space-y-4">
            {agendaItems.map((item) => (
              <li key={item.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    {item.description && (
                      <p className="mt-1 text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="bg-primary/10">
                    {item.order_number}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
