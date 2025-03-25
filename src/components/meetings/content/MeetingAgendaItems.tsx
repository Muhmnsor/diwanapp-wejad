
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
      <Card className="mb-6 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-100 to-teal-100">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary animate-pulse" />
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
        <CardHeader className="pb-3 bg-gradient-to-r from-red-100 to-rose-100">
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
      <Card className="mb-6 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-100 to-teal-100">
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
    <Card className="mb-6 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3 bg-gradient-to-r from-emerald-100 to-teal-100">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          جدول الأعمال
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-3 rtl">
          {agendaItems.map((item: MeetingAgendaItem) => (
            <li key={item.id} className="group py-2 px-4 bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all duration-200 text-gray-800">
              <div className="flex items-start">
                <span className="ml-2 rtl:mr-2 font-medium text-teal-700">{item.content}</span>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
