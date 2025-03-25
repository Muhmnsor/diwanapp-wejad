
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMeetingAgendaItems, MeetingAgendaItem } from '@/hooks/meetings/useMeetingAgendaItems';
import { Skeleton } from '@/components/ui/skeleton';
import { ListChecks } from 'lucide-react';

interface MeetingAgendaItemsProps {
  meetingId: string;
}

export const MeetingAgendaItems: React.FC<MeetingAgendaItemsProps> = ({ meetingId }) => {
  const { data: agendaItems, isLoading, error } = useMeetingAgendaItems(meetingId);

  console.log('Meeting agenda items:', agendaItems, 'for meeting ID:', meetingId);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-blue-600" />
            جدول الأعمال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error fetching meeting agenda items:', error);
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-blue-600" />
            جدول الأعمال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">حدث خطأ أثناء تحميل جدول الأعمال</p>
        </CardContent>
      </Card>
    );
  }

  if (!agendaItems || agendaItems.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-blue-600" />
            جدول الأعمال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">لا توجد بنود في جدول الأعمال</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border border-blue-200 shadow-md overflow-hidden bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-100/30 to-blue-50/20">
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <ListChecks className="h-5 w-5" />
          جدول الأعمال
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {agendaItems.map((item: MeetingAgendaItem, index: number) => (
            <div 
              key={item.id} 
              className="flex items-start gap-3 bg-white p-3 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <p className="text-gray-800 text-right">{item.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
