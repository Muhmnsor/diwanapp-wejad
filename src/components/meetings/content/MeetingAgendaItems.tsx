
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMeetingAgendaItems, MeetingAgendaItem } from '@/hooks/meetings/useMeetingAgendaItems';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList } from 'lucide-react';

interface MeetingAgendaItemsProps {
  meetingId: string;
}

export const MeetingAgendaItems: React.FC<MeetingAgendaItemsProps> = ({ meetingId }) => {
  const { data: agendaItems, isLoading, error } = useMeetingAgendaItems(meetingId);

  console.log('Meeting agenda items:', agendaItems, 'for meeting ID:', meetingId);

  if (isLoading) {
    return (
      <Card className="mb-6 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
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
      <Card className="mb-6 shadow-md border-red-100">
        <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-rose-50">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-red-500" />
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
      <Card className="mb-6 shadow-md">
        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
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
    <Card className="mb-6 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          جدول الأعمال
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-3">
          {agendaItems.map((item: MeetingAgendaItem) => (
            <li key={item.id} className="py-2 px-4 bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-gray-800">
              {item.content}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
