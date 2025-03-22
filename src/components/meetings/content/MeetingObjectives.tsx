
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMeetingObjectives, MeetingObjective } from '@/hooks/meetings/useMeetingObjectives';
import { Skeleton } from '@/components/ui/skeleton';

interface MeetingObjectivesProps {
  meetingId: string;
}

export const MeetingObjectives: React.FC<MeetingObjectivesProps> = ({ meetingId }) => {
  const { data: objectives, isLoading, error } = useMeetingObjectives(meetingId);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>أهداف الاجتماع</CardTitle>
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
          <CardTitle>أهداف الاجتماع</CardTitle>
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
          <CardTitle>أهداف الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">لا توجد أهداف محددة لهذا الاجتماع</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle>أهداف الاجتماع</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2">
          {objectives.map((objective: MeetingObjective) => (
            <li key={objective.id} className="text-gray-800">
              {objective.content}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
