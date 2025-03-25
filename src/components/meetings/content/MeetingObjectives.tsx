
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMeetingObjectives, MeetingObjective } from '@/hooks/meetings/useMeetingObjectives';
import { Skeleton } from '@/components/ui/skeleton';
import { Target } from 'lucide-react';

interface MeetingObjectivesProps {
  meetingId: string;
}

export const MeetingObjectives: React.FC<MeetingObjectivesProps> = ({ meetingId }) => {
  const { data: objectives, isLoading, error } = useMeetingObjectives(meetingId);

  console.log('Meeting objectives:', objectives, 'for meeting ID:', meetingId);

  if (isLoading) {
    return (
      <Card className="mb-6 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-100 to-indigo-100">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary animate-pulse" />
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
      <Card className="mb-6 shadow-md border-red-100">
        <CardHeader className="pb-3 bg-gradient-to-r from-red-100 to-rose-100">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
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
      <Card className="mb-6 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-100 to-indigo-100">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
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
    <Card className="mb-6 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-100 to-indigo-100">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          أهداف الاجتماع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-3 rtl">
          {objectives.map((objective: MeetingObjective) => (
            <li key={objective.id} className="group py-2 px-4 bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 text-gray-800">
              <div className="flex items-start">
                <span className="ml-2 rtl:mr-2 font-medium text-indigo-700">{objective.content}</span>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
