
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMeetingObjectives, MeetingObjective } from '@/hooks/meetings/useMeetingObjectives';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList } from 'lucide-react';

interface MeetingObjectivesProps {
  meetingId: string;
}

export const MeetingObjectives: React.FC<MeetingObjectivesProps> = ({ meetingId }) => {
  const { data: objectives, isLoading, error } = useMeetingObjectives(meetingId);

  console.log('Meeting objectives:', objectives, 'for meeting ID:', meetingId);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            أهداف الاجتماع
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
    console.error('Error fetching meeting objectives:', error);
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            أهداف الاجتماع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">حدث خطأ أثناء تحميل أهداف الاجتماع</p>
        </CardContent>
      </Card>
    );
  }

  if (!objectives || objectives.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            أهداف الاجتماع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">لا توجد أهداف محددة لهذا الاجتماع</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border border-primary/20 shadow-md overflow-hidden bg-gradient-to-br from-white to-purple-50">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2 text-primary">
          <ClipboardList className="h-5 w-5" />
          أهداف الاجتماع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {objectives.map((objective: MeetingObjective, index: number) => (
            <div 
              key={objective.id} 
              className="flex items-start gap-3 bg-white p-3 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <p className="text-gray-800 text-right">{objective.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
